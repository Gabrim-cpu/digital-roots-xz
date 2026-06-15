import admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

let firebaseAuth = null;
let isInitialized = false;

function initializeFirebase() {
  try {
    const keyPath = join(process.cwd(), 'firebase-key.json');
    const serviceAccountJSON = readFileSync(keyPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountJSON);
    
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    firebaseAuth = admin.auth();
    isInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('⚠️ Firebase not configured:', error.message);
    isInitialized = false;
  }
}

try {
  initializeFirebase();
} catch (e) {
  console.error('Firebase error:', e.message);
}

export { firebaseAuth, isInitialized };