import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, authPersistenceReady, db } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function syncSession(idToken, payload = {}) {
  const response = await fetch(`${API_URL}/api/auth/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });


  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to sync session with server');
  }

  return data;
}

export async function registerUser({ email, password, name, role, language, profilePicture, interests = [] }) {
  await authPersistenceReady;
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  const photoURL = profilePicture || null;

  await updateFirebaseProfile(credential.user, {
    displayName: name,
    ...(photoURL ? { photoURL } : {}),
  });

  await setDoc(doc(db, 'users', uid), {
    uid,
    name,
    email,
    role,
    language: language || 'en',
    avatar_url: photoURL,
    interests,
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

export async function loginUser(email, password) {
  await authPersistenceReady;
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const snapshot = await getDoc(doc(db, 'users', credential.user.uid));
  return { user: credential.user, profile: snapshot.data() };
}

export async function signInWithGoogle() {
  await authPersistenceReady;
  const provider = new GoogleAuthProvider();
  // Encourage account selection when multiple accounts are present
  provider.setCustomParameters({ prompt: 'select_account' });

  let credential;
  try {
    credential = await signInWithPopup(auth, provider);
  } catch (err) {
    // Fallback to redirect flow for environments where popups are blocked (mobile browsers, strict blockers)
    // Re-throw non-auth errors so caller can handle/display them
    const code = err && err.code ? err.code : null;
    if (code && (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user')) {
      // Try redirect fallback
      try {
        await import('firebase/auth').then(({ signInWithRedirect }) => signInWithRedirect(auth, provider));
        // When using redirect, the app will continue in onAuthStateChanged after redirect completes
        return null;
      } catch (redirectErr) {
        throw redirectErr;
      }
    }

    throw err;
  }

  const user = credential.user;

  // Check if user exists in Firestore, if not create profile
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
      email: user.email || null,
      role: 'Senior', // Default role for Google sign-in
      language: 'en',
      avatar: user.photoURL || null,
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function signOutUser() {
  await firebaseSignOut(auth);
}

export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function updateProfile(payload) {
  const idToken = await getIdToken();
  if (!idToken) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }

  return data;
}
