# Digital Roots XZ

Digital Roots is a mobile-first social PWA for intergenerational learning: posts, stories, real-time messaging, live sessions, archives, and Root Points.

## Current Frontend Direction

- Mobile-first community feed with bottom navigation.
- Empty, data-driven states by default. No seeded people or placeholder public profiles.
- Profile photo upload during registration, with a profile sheet when tapping the avatar.
- Chat UI for real-time text and voice messaging. No AI companion is included in chat.
- Story upload flow for TikTok-style vertical media, captions, and archive publishing.

## Service Map

## Data Flow And API Lifecycle

The application data flow has five principal paths between users, React clients, backend services, external providers, and data stores.

### 1. User Authentication

Actors:
- Youth (Gen Z)
- Elder (Gen X)
- React client
- User Service
- Firebase Auth
- PostgreSQL profile store

Lifecycle:
1. The user submits credentials through the React login or register form.
2. Firebase Auth validates credentials over HTTPS/OAuth2.
3. Firebase returns a signed JWT with a one-hour expiry.
4. The React client stores the authenticated Firebase session in memory, not `localStorage`.
5. Every protected API call sends `Authorization: Bearer <token>`.
6. Invalid tokens return `HTTP 401`.
7. Expired tokens should trigger silent refresh with Firebase `getIdToken(true)`.
8. The backend verifies the token and writes/reads the app profile in PostgreSQL.

Implementation note:
- Frontend Firebase Auth is configured with `inMemoryPersistence`.
- Backend auth endpoints live under `/api/auth`.
- PostgreSQL remains the source of truth for app profile metadata such as identity, language, avatar URL, onboarding status, and Root Points summary.

### 2. Create And Share Content

Actors:
- Authenticated user
- React client
- Content Service
- Cloudinary
- MongoDB
- Redis feed cache

Lifecycle:
1. User creates a post/story from the feed or story upload screen.
2. Browser uploads media directly to Cloudinary to avoid pushing large files through Node.js.
3. Cloudinary returns a secure media URL.
4. React submits post metadata to `POST /api/posts` or story metadata to `POST /api/stories`.
5. Content Service validates:
   - content length: maximum 2,000 characters
   - media type: audio, video, or image only
   - category tag: must belong to the allowed enumeration
6. Valid content is stored in MongoDB.
7. Feed cache and ranking cache are updated in Redis.
8. Success returns `HTTP 201` with the created post/story object.
9. Validation errors return `HTTP 422` with field-level errors.

Primary endpoints:
- `POST /api/posts`
- `POST /api/stories`
- `GET /api/feed`
- `GET /api/recommendations`

### 3. Exchange Messages

Actors:
- Sender
- Recipient
- React client
- Chat Service
- Socket.io
- MongoDB
- Cloudinary
- OpenAI Whisper
- Notification Service

Lifecycle:
1. Text messages are sent through Socket.io for real-time delivery.
2. Chat Service persists each message in MongoDB with:
   - sender ID
   - receiver ID
   - thread ID
   - content
   - timestamp
   - read status
3. Voice notes are uploaded to Cloudinary.
4. Voice note audio is forwarded to OpenAI Whisper for transcription.
5. Transcript is stored alongside the Cloudinary audio URL.
6. Undelivered messages are queued and retried.
7. If the recipient is offline, Notification Service dispatches a push alert.

Primary endpoints/events:
- `GET /messages/threads`
- `GET /messages/threads/:threadId`
- `POST /messages`
- `POST /voice-notes`
- Socket.io event: `message:send`
- Socket.io event: `message:delivered`
- Socket.io event: `message:read`

### 4. Session Creation And Live Rooms

Actors:
- Host user
- Invitees
- Session Service
- PostgreSQL
- Redis/Bull queue
- Notification Service
- Jitsi Meet API

Lifecycle:
1. User creates a mentorship/live session through `POST /api/sessions`.
2. Session Service validates:
   - proposed date is in the future
   - all invitees are connected users
   - host has no conflicting session
3. Valid sessions are stored in PostgreSQL.
4. Notification Service schedules three Redis/Bull reminder jobs:
   - one week before
   - three days before
   - day of session
5. On session day, Jitsi Meet room URL is generated.
6. Session tokens are cached in Redis for rapid room access.

Primary endpoints:
- `POST /api/sessions`
- `GET /api/sessions`
- `GET /api/sessions/:sessionId`
- `POST /api/sessions/:sessionId/join`

### 5. AI Transcribe And Archive

Actors:
- Elder user
- React client
- Content Service
- Cloudinary
- OpenAI Whisper
- Knowledge Archive
- Admin moderators

Lifecycle:
1. Elder uploads a voice story from the story/archive screen.
2. Browser uploads audio bytes to Cloudinary.
3. Audio is sent to OpenAI Whisper for multilingual transcription.
4. Returned transcript is stored in the Knowledge Archive.
5. Archive document is tagged with:
   - language
   - cultural category
   - searchable keywords
   - media URL
   - transcript
6. AI-flagged content goes to admin moderation before publication.
7. Approved stories can appear in `/library`, `/feed`, and user profiles.

Primary endpoints:
- `POST /api/stories`
- `POST /api/library`
- `GET /api/library`
- `GET /api/library/search`

### Messaging Service

Purpose: real-time text and voice messaging.

Core responsibilities:
- WebSocket connection management.
- Thread creation and membership.
- Message delivery, read status, and typing/online presence.
- Voice note upload and transcription status.

Storage:
- MongoDB: `threads`, `messages`, `voice_notes`.

Endpoints:
- `GET /messages/threads`
- `GET /messages/threads/:threadId`
- `POST /messages`
- `POST /voice-notes`

### Content Service

Purpose: posts, stories, feed, and recommendations.

Core responsibilities:
- Post creation.
- Story upload and publishing.
- Timeline generation.
- Connection recommendation engine.
- Post ranking.

Storage:
- MongoDB: `posts`, `stories`, `media`, `recommendations`.
- Redis: feed cache, ranking cache, hot story cache.

Endpoints:
- `GET /feed`
- `POST /posts`
- `POST /stories`
- `GET /recommendations`

### Archive And Library Service

Purpose: archives, knowledge library, and media coordination.

Core responsibilities:
- Knowledge article creation.
- Media upload coordination.
- Story-to-library publishing.
- Search and tag management.

Storage:
- MongoDB: `posts`, `stories`, `knowledge_articles`, `media_assets`.

Endpoints:
- `GET /library`
- `POST /library`
- `POST /posts`
- `POST /stories`

### Point Service

Purpose: Root Points rules, badges, and leaderboard.

Core responsibilities:
- Award points for actions such as posting, commenting, uploading stories, joining sessions, helping another user, or preserving knowledge.
- Enforce daily earning limits.
- Store immutable point transactions.
- Compute badges.
- Generate leaderboard.

Storage:
- PostgreSQL: `accounts`, `point_transactions`, `badges`, `user_badges`, `leaderboard_snapshots`.

Endpoints:
- `GET /points`
- `POST /points/award`
- `GET /badges`
- `GET /leaderboard`

Suggested rule model:

```js
{
  action: "story_uploaded",
  points: 25,
  dailyLimit: 100,
  requiresUniqueTarget: false,
  badgeProgress: ["story_keeper"]
}
```

Suggested transaction flow:

1. Content or Messaging service emits an event, for example `story.uploaded`.
2. Point Service validates the rule and daily limit.
3. Point Service writes a PostgreSQL transaction.
4. Point Service recomputes badge progress.
5. Feed/Profile reads the updated summary from `/points`.
