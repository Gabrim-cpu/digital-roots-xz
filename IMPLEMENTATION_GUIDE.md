# XZ Implementation Guide

This guide shows what's been done, what's in progress, and what's needed to complete XZ.

## ✅ Phase 1: Foundation (Complete)

- [x] Landing page with professional design
- [x] User authentication (Firebase Auth)
- [x] User registration with profile setup
- [x] Dashboard with home feed
- [x] Points & badges system (backend logic)
- [x] Responsive mobile design (iPhone XR optimized)
- [x] Multi-language support (EN/FR)
- [x] Dark mode for Youth
- [x] Icons using lucide-react

## 🔧 Phase 2: Core Features (In Progress)

### 1. **Matching Algorithm** ✅ DONE
**File:** `backend/src/services/matchingService.js`

**What it does:**
- Scores users 0-100 based on:
  - Interest overlap (40%)
  - Reciprocal skill teaching (30%)
  - Availability overlap (20%)
  - Location proximity (10%)
- Filters out invalid matches (same identity, no profile, already mentoring)
- Returns top 20 matches sorted by score

**API Endpoint to create:**
```javascript
// backend/src/routes/matching.js
GET /api/matching/recommendations
  Headers: Authorization: Bearer {idToken}
  Response: [{ id, display_name, identity, compatibility_score, youCanTeach, theyCanTeach, reciprocal }]
```

**Frontend Integration:**
```javascript
// frontend/src/services/matchingService.js
export async function getMatchingRecommendations() {
  const response = await fetch(`${API_URL}/matching/recommendations`, {
    headers: await getHeaders()
  });
  return response.json();
}
```

---

### 2. **Mentorship Requests & Booking** ⚠️ TODO

**Flow:**
```
Youth sees Senior in matches
  ↓
Click "Request Mentorship" 
  ↓
Modal: select topics + propose time
  ↓
POST /api/mentorships/request
{
  seniorId,
  topics: ["history", "crafts"],
  proposedTime: "2026-06-30T14:00:00Z"
}
  ↓
Backend creates doc in mentorships collection with status: "pending"
  ↓
Senior gets notification (Firebase Cloud Messaging)
  ↓
Senior clicks notification → views request → accepts/rejects
  ↓
If accepted: status → "accepted", both get confirmation
```

**Collections needed:**
```javascript
// firestore: mentorships/{mentorshipId}
{
  seniorId: string,
  youthId: string,
  status: "pending" | "accepted" | "active" | "completed" | "rejected",
  requestedAt: timestamp,
  acceptedAt: timestamp,
  topics: string[],
  messages: [], // embedded for quick access
  sessions: string[], // refs to sessions/{id}
}
```

**Backend Endpoints to create:**
```javascript
POST /api/mentorships/request
POST /api/mentorships/accept/{mentorshipId}
POST /api/mentorships/reject/{mentorshipId}
GET /api/mentorships/pending  // for senior
GET /api/mentorships/active   // for both
```

**Frontend Components to create:**
```
- RequestModal.jsx        (choose topics + time)
- PendingRequests.jsx     (senior: accept/reject)
- ActiveMentorships.jsx   (view active sessions)
- MentorshipCard.jsx      (display current mentorship)
```

---

### 3. **Session Scheduling & Video Calls** ⚠️ TODO

**Tech Stack:**
- **Video**: Daily.co (recommended) or Jitsi Meet (open source)
- **Calendar**: Frontend: React-big-calendar, Backend: Auto-create on acceptance

**Flow:**
```
Senior accepts mentorship
  ↓
Create initial session doc with scheduledAt
  ↓
Both get calendar invites
  ↓
1 hour before: reminder notification
  ↓
Senior clicks "Start Session"
  ↓
Backend calls Daily.co API → get room token
  ↓
Frontend opens Daily.co iframe
  ↓
Video call runs (recording optional)
  ↓
Session ends
  ↓
Both rate session (1-5 stars + feedback)
  ↓
Points awarded based on duration
```

**Collections needed:**
```javascript
// firestore: sessions/{sessionId}
{
  mentorshipId: string,
  seniorId: string,
  youthId: string,
  scheduledAt: timestamp,
  startedAt: timestamp,
  endedAt: timestamp,
  duration: number, // minutes
  recordingUrl: string,
  status: "scheduled" | "active" | "completed",
  rating: {
    seniorRating: 1-5,
    youthRating: 1-5,
    seniorFeedback: string,
    youthFeedback: string,
    ratedAt: timestamp
  }
}
```

**Setup Daily.co:**
1. Create account at daily.co
2. Get API key
3. Set `DAILY_API_KEY` in .env
4. Create backend endpoint: `POST /api/sessions/start`

**Backend Endpoint:**
```javascript
POST /api/sessions/start
Body: { mentorshipId, sessionId }
Response: { roomUrl, token }

// Uses Daily API:
const resp = await fetch('https://api.daily.co/v1/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DAILY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: `mentorship-${mentorshipId}`,
    privacy: 'private'
  })
});
const room = await resp.json();
// Return room.url + generate token
```

---

### 4. **Notifications System** ⚠️ TODO

**Tech:** Firebase Cloud Messaging (FCM)

**Setup:**
1. Create Firebase Project (already done for auth)
2. Go to Project Settings → Cloud Messaging
3. Copy Server API Key → set as `FCM_SERVER_KEY` in .env
4. Generate web credentials for frontend

**Events that trigger notifications:**
```
1. Mentorship request received
   → Senior gets alert

2. Request accepted
   → Youth gets confirmation

3. Session scheduled
   → Both get reminder 1 hour before

4. Message received
   → Real-time + offline fallback

5. Session rated
   → Notification when other party rates

6. Points earned
   → Milestone notifications (100, 250, 500 pts)
```

**Frontend Setup:**
```javascript
// frontend/src/services/notificationService.js
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

async function initNotifications() {
  const messaging = getMessaging();
  
  // Get FCM token
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FCM_VAPID_KEY
  });
  
  // Send to backend for storage
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify({ fcmToken: token })
  });
  
  // Listen for foreground messages
  onMessage(messaging, (payload) => {
    showNotificationBanner(payload.notification);
  });
}
```

**Backend to send:**
```javascript
// backend/src/services/notificationService.js
async function sendNotification(userId, { title, body, data }) {
  const userDoc = await db.collection('users').doc(userId).get();
  const fcmToken = userDoc.data().fcmToken;
  
  if (!fcmToken) return;
  
  const message = {
    notification: { title, body },
    data,
    token: fcmToken
  };
  
  await admin.messaging().send(message);
  
  // Also save to in-app notifications
  await db.collection('notifications').doc(userId).collection('messages')
    .add({
      title, body, data,
      read: false,
      createdAt: new Date()
    });
}
```

---

### 5. **Messaging System** ⚠️ TODO (Real-time)

**Currently:** Basic text messages only
**Needed:** Real-time sync + voice notes

**Setup Socket.io listeners:**
```javascript
// backend/websocket/events.js
socket.on('message:send', async ({ conversationId, content, type }) => {
  // 1. Save to Firestore
  const messageRef = await db.collection('messages')
    .doc(conversationId).collection('messages').add({
      senderId: socket.userId,
      content,
      type, // text | voice | image
      read: false,
      createdAt: new Date()
    });
  
  // 2. Emit to recipient if online
  io.to(recipientId).emit('message:new', {
    id: messageRef.id,
    ...message
  });
  
  // 3. Send FCM if offline
  if (!isOnline(recipientId)) {
    await sendNotification(recipientId, {
      title: `Message from ${senderName}`,
      body: content,
      data: { conversationId }
    });
  }
  
  // 4. Mark as read when recipient views
  socket.on('message:read', ({ conversationId, messageId }) => {
    db.collection('messages').doc(conversationId)
      .collection('messages').doc(messageId).update({ read: true });
  });
});
```

---

## 🚀 Phase 3: Advanced Features (Future)

- [ ] Wisdom Archive uploads (video/audio transcription)
- [ ] Community challenges & competitions
- [ ] Advanced leaderboards (weekly, monthly)
- [ ] User followers/following system
- [ ] Session recording & archival
- [ ] Automated badges for milestones
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Admin dashboard

---

## 🔄 Database Migration: MongoDB → Firestore

### Why Firestore?
✅ Real-time listeners built-in  
✅ Offline support (client-side)  
✅ No server management  
✅ Integrates with Firebase Auth  
✅ Better for document-based data  
✅ Cheaper at scale  

### Migration Steps:

**1. Stop writing to MongoDB**
- Update backend to use Firestore only
- Old code: `const user = await User.findById(userId);`
- New code: `const user = (await db.collection('users').doc(userId).get()).data();`

**2. Migrate existing data**
```bash
# Export from MongoDB
mongodump --db xz --archive=xz.archive

# Convert to Firestore format (write a script)
# Example schema change:
# MongoDB: { _id: ..., email: ... }
# Firestore: documents are already keyed by ID in collection

# Import to Firestore via admin SDK:
const collections = ['users', 'posts', 'mentorships'];
for (const col of collections) {
  const docs = await loadFromMongoDB(col);
  await db.collection(col).insertMany(docs);
}
```

**3. Update all backend queries**
```javascript
// MongoDB → Firestore examples

// Find by ID
// OLD: await User.findById(id)
// NEW: (await db.collection('users').doc(id).get()).data()

// Find one
// OLD: await User.findOne({ email })
// NEW: (await db.collection('users').where('email', '==', email).limit(1).get()).docs[0]?.data()

// Find many
// OLD: await User.find({ identity: 'Senior' })
// NEW: (await db.collection('users').where('identity', '==', 'Senior').get()).docs.map(d => d.data())

// Update
// OLD: await User.updateOne({ id }, { name: 'John' })
// NEW: await db.collection('users').doc(id).update({ name: 'John' })

// Delete
// OLD: await User.deleteOne({ id })
// NEW: await db.collection('users').doc(id).delete()
```

**4. Delete MongoDB**
```bash
# After full migration and 2 weeks of monitoring:
mongo xz --eval "db.dropDatabase()"
```

---

## 📋 Implementation Checklist

### Backend Endpoints
- [ ] POST `/api/matching/recommendations` - get matches
- [ ] POST `/api/mentorships/request` - request mentorship
- [ ] POST `/api/mentorships/{id}/accept` - accept request
- [ ] POST `/api/mentorships/{id}/reject` - reject request
- [ ] POST `/api/sessions/start` - get Daily.co room
- [ ] POST `/api/sessions/{id}/end` - mark session complete
- [ ] POST `/api/sessions/{id}/rate` - rate session
- [ ] POST `/api/notifications/subscribe` - save FCM token
- [ ] POST `/api/messages/send` - send message (via Socket.io)

### Frontend Components
- [ ] RequestMentorshipModal.jsx
- [ ] PendingRequests.jsx (for seniors)
- [ ] ActiveMentorships.jsx
- [ ] SessionRating.jsx (1-5 stars + feedback)
- [ ] VideoCall.jsx (Daily.co iframe)
- [ ] NotificationBell.jsx (dropdown)
- [ ] MessageThread.jsx (real-time)

### Database Collections
- [ ] `users` - complete schema
- [ ] `mentorships` - request/acceptance/rating flow
- [ ] `sessions` - scheduling/recording
- [ ] `messages/{conversationId}/messages` - real-time
- [ ] `notifications/{userId}/messages` - in-app
- [ ] `pointTransactions` - audit trail

---

## 🎯 Next Immediate Steps

1. **Implement Matching Endpoints** (2 hours)
   - Create `/api/matching/recommendations`
   - Connect to frontend

2. **Implement Mentorship Requests** (4 hours)
   - Create collection + endpoints
   - Add UI for seniors to view + accept/reject

3. **Add FCM Notifications** (3 hours)
   - Frontend: init FCM
   - Backend: send on key events

4. **Migrate to Firestore** (6 hours)
   - Export MongoDB data
   - Update all query syntax
   - Test thoroughly

5. **Implement Video Calls** (6 hours)
   - Daily.co integration
   - Frontend: add VideoCall component

**Total: ~20 hours to MVP with all features working**

---

## 🔍 Testing Checklist

After implementing each feature:
- [ ] User can request mentorship
- [ ] Senior receives notification
- [ ] Senior can accept/reject
- [ ] Session can be scheduled
- [ ] Both users get reminder
- [ ] Video call works
- [ ] Rating system saves feedback
- [ ] Points are awarded
- [ ] Leaderboard updates
- [ ] Real-time messages work
- [ ] All works on iPhone XR
- [ ] All works offline (Firestore) then syncs

---

This is the real XZ. The architecture is now clear, matching works, notifications are ready to wire up, and Firestore replaces MongoDB.

**You've got this.** 🚀
