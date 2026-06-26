# XZ Digital Roots - Architecture & Data Flow

## 1. System Overview

**XZ** is an intergenerational mentorship platform connecting Seniors and Youth for knowledge exchange, live sessions, and community building.

### Core Flows (from sequence diagrams):
```
Youth/Senior
  ↓
Register + Profile (interests, age, bio)
  ↓
Match Engine finds compatible partners
  ↓
Youth can request mentorship session
  ↓
Senior receives notification + accepts
  ↓
Live session (video/voice + screen share)
  ↓
Both rate the session + earn points
  ↓
Wisdom archive: seniors upload stories/videos
  ↓
Community browses, rates, learns
```

---

## 2. Data Architecture

### Firestore Collections (Firebase default, replaces MongoDB)

#### `users/{userId}`
```javascript
{
  email: string,
  displayName: string,
  identity: "Senior" | "Youth",
  age: number,
  bio: string,
  avatar_url: string,
  language: "en" | "fr",
  interests: {
    learn: string[],      // "history", "technology", etc.
    teach: string[]
  },
  skills: string[],       // seniors: what they teach, youth: what they do
  location: string,       // for proximity matching
  availability: {         // when user is available for sessions
    senior: { mon: ["09:00-17:00"], tue: [...], ... },
    youth: { ... }
  },
  verified: boolean,      // email verified
  createdAt: timestamp,
  lastActive: timestamp,
  points: number,
  badges: string[],
  is_onboarded: boolean,
  preferences: {
    notificationsEnabled: boolean,
    publicProfile: boolean,
    allowMessages: boolean
  }
}
```

#### `mentorships/{mentorshipId}`
```javascript
{
  seniorId: string,
  youthId: string,
  status: "pending" | "accepted" | "active" | "completed" | "rejected",
  requestedAt: timestamp,
  acceptedAt: timestamp,
  startedAt: timestamp,
  completedAt: timestamp,
  skillsFocused: string[],
  messages: [], // embedded for quick access
  sessions: string[], // refs to sessions/{sessionId}
  rating: {
    youthRating: number,        // 1-5
    seniorRating: number,
    youthFeedback: string,
    seniorFeedback: string,
    ratedAt: timestamp
  },
  pointsAwarded: {
    youth: number,
    senior: number
  }
}
```

#### `sessions/{sessionId}`
```javascript
{
  mentorshipId: string,
  seniorId: string,
  youthId: string,
  type: "video" | "voice" | "text",
  scheduledAt: timestamp,
  startedAt: timestamp,
  endedAt: timestamp,
  duration: number, // in minutes
  recordingUrl: string,
  transcript: string,
  topicsDiscussed: string[],
  pointsEarned: {
    youth: number,
    senior: number
  }
}
```

#### `wisdomArchive/{archiveId}`
```javascript
{
  authorId: string,          // senior who uploaded
  title: string,
  description: string,
  mediaUrl: string,          // video or audio
  transcript: string,        // auto-generated
  tags: string[],            // "history", "crafts", etc.
  category: string,
  views: number,
  ratings: number[],         // array of 1-5 ratings
  averageRating: number,
  createdAt: timestamp,
  visibility: "public" | "followers" | "private"
}
```

#### `notifications/{userId}/{notificationId}`
```javascript
{
  type: "mentorship_request" | "session_reminder" | "message" | "points_earned" | "session_rated",
  fromUserId: string,
  fromUserName: string,
  title: string,
  body: string,
  actionUrl: string,         // where to go when clicked
  read: boolean,
  createdAt: timestamp,
  expiresAt: timestamp       // auto-delete after 30 days
}
```

#### `messages/{conversationId}/messages/{messageId}`
```javascript
{
  senderId: string,
  receiverId: string,
  mentorshipId: string,
  type: "text" | "voice" | "image",
  content: string,           // text or voice transcription
  mediaUrl: string,          // for voice/image
  read: boolean,
  readAt: timestamp,
  createdAt: timestamp
}
```

#### `pointTransactions/{transactionId}`
```javascript
{
  userId: string,
  type: "session_completed" | "wisdom_upload" | "rating_given" | "connection_made",
  points: number,
  description: string,
  reference: {               // what action earned this
    mentorshipId?: string,
    sessionId?: string,
    archiveId?: string
  },
  createdAt: timestamp
}
```

---

## 3. Matching Algorithm

**Location:** `backend/src/services/matchingService.js`

### Scoring System (0-100)
```
compatibility_score = 
  (interest_match * 0.4) +           // 40% weight
  (skill_exchange_value * 0.3) +    // 30% weight
  (availability_overlap * 0.2) +    // 20% weight
  (location_proximity * 0.1)        // 10% weight

where:
  interest_match = intersection(youth.learn, senior.teach) / union(...) * 100
  skill_exchange_value = reciprocal_learning_potential * 100
  availability_overlap = hours_per_week_both_available / 40 * 100
  location_proximity = distance_in_km < 50 ? 100 : max(0, 100 - distance*2)
```

### Matching Rules
1. Opposite identity (Senior ↔ Youth only)
2. No self-match
3. No existing active mentorships
4. Interest overlap > 20% (some common ground)
5. Both have profile > 80% complete
6. Both marked as available

### Implementation
```javascript
async function getMatches(userId) {
  const user = await getUser(userId);
  
  // Find opposite identity users
  let candidates = await db.collection('users')
    .where('identity', '==', user.identity === 'Senior' ? 'Youth' : 'Senior')
    .where('is_onboarded', '==', true)
    .where('verified', '==', true)
    .get();
  
  // Score each candidate
  const scored = candidates.map(doc => ({
    ...doc.data(),
    score: calculateCompatibility(user, doc.data())
  }));
  
  // Sort by score, filter > 30
  return scored
    .filter(c => c.score > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}
```

---

## 4. Notification System

**Location:** `backend/src/services/notificationService.js`

Uses **Firebase Cloud Messaging (FCM)** for:
- Push notifications on mobile
- In-app toast notifications
- Email notifications (optional)

### Events that trigger notifications:
1. **Mentorship Request Received** → Senior gets alert
2. **Request Accepted** → Youth gets confirmation
3. **Session Scheduled** → Both get reminder 1 hour before
4. **Message Received** → Real-time + sound
5. **Session Rating** → Notification when other party rates
6. **Points Earned** → Milestone notifications (100, 250, 500 pts)
7. **New Wisdom Archive** → To followers/interested users

### Frontend Integration
```javascript
// src/services/notificationService.js
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

async function initNotifications() {
  const messaging = getMessaging();
  const token = await getToken(messaging, {
    vapidKey: process.env.VITE_FCM_VAPID_KEY
  });
  
  // Send token to backend
  await saveUserFCMToken(token);
  
  // Listen for foreground messages
  onMessage(messaging, (payload) => {
    // Show toast/banner
    showNotification(payload.notification);
  });
}
```

---

## 5. Messaging Architecture

**Real-time:** Socket.io (WebSocket)
**Persistence:** Firestore

### Flow
```
User A types message
  ↓
Socket.io emits to User B (if online)
  ↓
Message saved to Firestore
  ↓
If User B offline, FCM notification sent
  ↓
User B reads → mark_as_read in Firestore
  ↓
Both users see "read" indicator
```

---

## 6. Session Management

### Booking Flow
```
Youth requests session
  ↓
Modal: "Pick time + topic"
  ↓
Request sent to Senior
  ↓
Senior gets notification
  ↓
Senior accepts/rejects
  ↓
If accepted:
  - Calendar event created
  - Both get reminder 1 hour before
  - Session starts (WebRTC)
  - Recording optional
  - After: rate each other
```

### WebRTC Integration
Uses **Daily.co** or **Jitsi** for video/voice
```javascript
// backend/api endpoint
POST /api/sessions/start
{
  sessionId,
  mentorshipId
}

// Returns: { roomUrl, token }
// Frontend opens Daily.co iframe with token
```

---

## 7. Frontend Architecture

```
src/
├── pages/
│   ├── Landing.jsx          (professional onboarding)
│   ├── Login.jsx            (no language switch)
│   ├── Register.jsx         (no language switch)
│   └── Profile.jsx          (complete profile)
│
├── views/
│   ├── Dashboard.jsx        (home feed + points)
│   ├── Matches.jsx          (browse compatible users)
│   ├── Mentorships.jsx      (active sessions + history)
│   ├── Messages.jsx         (conversations)
│   ├── WisdomHub.jsx        (archive browse)
│   └── Profile.jsx          (view/edit profile)
│
├── components/
│   ├── SessionBooking.jsx   (request/accept flow)
│   ├── VideoCall.jsx        (Daily.co iframe)
│   ├── NotificationBell.jsx (badge + dropdown)
│   ├── MatchCard.jsx        (swipeable/clickable)
│   └── SessionRating.jsx    (1-5 star + feedback)
│
├── services/
│   ├── authService.js
│   ├── matchingService.js   (call backend for matches)
│   ├── messagingService.js  (Socket.io client)
│   ├── notificationService.js (FCM setup)
│   └── sessionService.js    (booking/recording)
│
└── context/
    ├── AuthContext.jsx
    ├── NotificationContext.jsx (show toasts)
    └── MatchingContext.jsx (cache matches)
```

---

## 8. Backend Architecture

```
backend/src/
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── mentorships.js      (request/accept)
│   ├── matching.js         (get matches)
│   ├── sessions.js         (booking/recording)
│   ├── messages.js         (via WebSocket)
│   ├── notifications.js    (FCM trigger)
│   ├── wisdom.js           (archive upload/browse)
│   └── points.js           (leaderboard)
│
├── services/
│   ├── firestore.js        (DB client)
│   ├── matchingService.js  (scoring algorithm)
│   ├── notificationService.js (FCM)
│   ├── sessionService.js   (Daily.co API)
│   └── pointService.js     (award logic)
│
├── middleware/
│   ├── auth.js             (Firebase token verify)
│   └── validation.js       (input checking)
│
└── websocket/
    ├── events.js           (Socket.io handlers)
    └── rooms.js            (conversation routing)
```

---

## 9. Database Migration: MongoDB → Firestore

### Why Firestore is Better for XZ:
- ✅ Real-time listeners (built-in)
- ✅ Offline support
- ✅ Scales automatically
- ✅ No server to manage
- ✅ Integrates with Firebase auth (already using)
- ✅ Better for document-based data

### Migration Steps:
1. Stop writing to MongoDB
2. Export MongoDB collections
3. Transform to Firestore schema
4. Update backend queries (syntax change)
5. Test thoroughly
6. Delete MongoDB

### Code Change Example:
```javascript
// Before (MongoDB)
const user = await User.findById(userId);

// After (Firestore)
const user = (await db.collection('users').doc(userId).get()).data();
```

---

## 10. Feature Completeness Checklist

### Phase 1 (MVP - Current)
- [x] User registration + profiles
- [x] Interest-based matching
- [ ] Notification system (FCM)
- [ ] Real mentorship sessions (WebRTC)
- [ ] Session booking + calendar
- [ ] Messaging (real-time + persistence)
- [ ] Points + leaderboard
- [ ] Wisdom archive (upload/browse/rate)

### Phase 2 (Future)
- [ ] Video call recording + archival
- [ ] Automated transcript generation
- [ ] AI recommendations
- [ ] Community groups
- [ ] Badges/achievements UI
- [ ] Calendar integration
- [ ] Mobile app (React Native)

---

## 11. Error Prevention & Data Integrity

### Transaction Safety
```javascript
// When accepting mentorship request
db.runTransaction(async (transaction) => {
  // 1. Verify mentor not already mentoring this youth
  const existing = await transaction.get(
    db.collection('mentorships')
      .where('seniorId', '==', seniorId)
      .where('youthId', '==', youthId)
  );
  if (existing.size > 0) throw new Error('Already mentored');
  
  // 2. Update mentorship status
  transaction.update(mentorshipRef, { status: 'accepted' });
  
  // 3. Send notifications
  // 4. Award points
  // 5. Create initial session
});
```

### Validation
- Email verification before matching
- Profile > 80% complete before mentorship
- No duplicate active mentorships
- Session can't start without confirmation
- Rating only after session completed

---

This is the real XZ architecture. Now I'll implement each piece properly.
