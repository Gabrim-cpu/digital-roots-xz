import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Votre configuration Firebase (à récupérer dans la console Firebase)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "xz-bridging-generational-gap.firebaseapp.com",
  projectId: "xz-bridging-generational-gap",
  databaseURL: "https://xz-bridging-generational-gap-default-rtdb.firebaseio.com",
  storageBucket: "xz-bridging-generational-gap.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services
export const database = getDatabase(app);
export const auth = getAuth(app);
export default app;