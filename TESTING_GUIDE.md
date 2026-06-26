# Digital Roots (XZ) - Quick Testing Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL running with digital_roots database
- Firebase project configured
- MongoDB running (for messages)

## Quick Start

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Environment Files

**backend/.env**
```
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/digital_roots
DB_NAME=digital_roots
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

**frontend/.env** (Vite format)
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Initialize Database
```bash
cd backend
npm run db:setup
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should see: "🚀 XZ Node.js Core Server executing on port 5000"
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Should see: "VITE v5... ready in X ms"
```

### 5. Test User Discovery Flow

#### Test Account 1 (Senior User):
1. Navigate to http://localhost:5173
2. Click "Create an account"
3. Fill in signup form
4. On onboarding page:
   - Upload profile photo (optional)
   - Select "Senior"
   - Enter display name
   - Set language
   - Select what you can "teach" (e.g., "history", "cooking")
   - Click Continue

#### Test Account 2 (Youth User):
1. Open in incognito window or different browser
2. Repeat signup
3. On onboarding:
   - Upload different photo
   - Select "Youth"
   - Enter different display name
   - Select what you want to "learn"
   - Click Continue

#### Test Connection:
1. Account 1 navigates to "Connect" (bottom nav or sidebar)
2. Should see Account 2 in "Suggested Connections"
3. Click "Connect"
4. Switch to Account 2
5. Should see "Connection Requests" section
6. Click "Accept"
7. Both users should now see each other as connected

### 6. Test Profile Features

#### Profile Photo:
- Check that uploaded photo appears in:
  - Sidebar profile card
  - Profile modal
  - Connection card in Connect tab

#### Bio:
- Check that bio appears in profile modal

#### Language Toggle:
**On Login Page:**
1. Before creating account, click language select
2. Change to French
3. Create account and login
4. After login, all text should be in French

**After Login:**
1. Open settings/profile modal
2. Check language preference shows correct selection
3. Toggle language select in header
4. All text should change immediately

### 7. Feed & Posts

#### Create Post:
1. After login, on Home tab
2. Click post composer
3. Type a message
4. Click "Publish"
5. Post should appear in feed

#### Feed Appears Empty:
- **Expected behavior:** Feed is empty until users start posting
- Create posts from both test accounts
- Posts from opposite identity get priority in recommendations

### 8. Test Language Context

#### Expected Behavior:
- Language selected on login persists
- All components use global LanguageContext
- Language changes update entire UI instantly
- Preference saves to database

#### Check These Scenarios:
- [ ] Select language on login page
- [ ] Log in - app displays in selected language
- [ ] Change language in dashboard - everything updates
- [ ] Refresh page - language preference persists
- [ ] Log out and back in - same language preference appears

## Troubleshooting

### "Port 5000 already in use"
```bash
# Find process using port
lsof -i :5000
# Kill it
kill -9 <PID>
```

### "Connection refused to database"
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations: `npm run db:setup`

### "Firebase auth failed"
- Verify env vars are correct
- Check Firebase project is active
- Ensure Firebase Auth is enabled

### "Recommendations showing empty"
- Verify users have identity set (Senior/Youth)
- Check is_active = TRUE in users table
- Both users need opposite identities to see recommendations
- If no matching interests, all opposite-identity users appear as fallback

### "Photos not uploading"
- Photos are currently stored as data URLs in database
- For production, integrate Cloudinary (already in package.json)
- Current implementation stores base64 directly

## Key Endpoints to Test

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get All Users
```bash
curl -H "Authorization: Bearer {idToken}" \
  http://localhost:5000/api/connections/all-users?identity=Youth
```

### Get Recommendations
```bash
curl -H "Authorization: Bearer {idToken}" \
  http://localhost:5000/api/connections/recommendations
```

### Create Post
```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Authorization: Bearer {idToken}" \
  -H "Content-Type: application/json" \
  -d '{"body":"Hello world","type":"post"}'
```

## Success Criteria

All of these should work:
- ✅ User can sign up with profile photo and bio
- ✅ User can select language on login and it persists
- ✅ Users with opposite identities see each other in recommendations
- ✅ Users can send connection requests
- ✅ Users can accept connection requests
- ✅ Users can create posts
- ✅ Feed doesn't crash when empty
- ✅ Language context works globally

## Performance Notes

- Recommendations limited to 10 results
- Feed limited to 50 posts
- Connection queries use indexes on (user_a_id, user_b_id)
- Firebase Firestore will replace WebSocket for better real-time sync

## Next Steps After Testing

1. Implement Firestore migration for chat
2. Add image storage with Cloudinary
3. Set up push notifications
4. Add more gamification (badges, leaderboard)
5. Deploy to production
