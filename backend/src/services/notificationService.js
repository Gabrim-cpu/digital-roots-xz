import admin from 'firebase-admin';
import { pool } from '../config/database.js';

/**
 * Real-time notifications via Firestore.
 *
 * The backend writes a lightweight document to the `notifications` collection;
 * the frontend subscribes with onSnapshot and receives it instantly (no polling
 * or reload). Postgres/Mongo remain the source of truth — Firestore is used
 * purely as the push channel.
 *
 * Design notes:
 * - Fire-and-forget: every failure is caught and logged, never thrown, so a
 *   notification problem can NEVER break the originating request (sending a
 *   connection request, a message, etc.). Call it without awaiting.
 * - The client queries by its Firebase uid, so we resolve the recipient's
 *   firebase_uid from their Postgres id here.
 */

const getFirestore = () => {
  try {
    if (!admin.apps.length) return null;
    return admin.firestore();
  } catch {
    return null;
  }
};

export const createNotification = async ({
  recipientUserId,
  type,
  title,
  body,
  data = {},
  important = false,
}) => {
  try {
    const db = getFirestore();
    if (!db || !recipientUserId) return;

    const result = await pool.query(
      'SELECT firebase_uid FROM users WHERE id = $1',
      [recipientUserId]
    );
    const recipientUid = result.rows[0]?.firebase_uid;
    if (!recipientUid) return;

    await db.collection('notifications').add({
      recipientUid,
      type,
      title,
      body,
      data,
      important: !!important,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};
