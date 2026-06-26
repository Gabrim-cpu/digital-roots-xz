import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Bell, UserPlus, Check, MessageCircle, Award, X } from 'lucide-react';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const ICONS = {
  connection_request: UserPlus,
  connection_accepted: Check,
  message: MessageCircle,
  badge: Award,
};

export function iconForType(type) {
  return ICONS[type] || Bell;
}

const toMillis = (createdAt) => {
  // Firestore serverTimestamp may briefly be null on the local write before the
  // server value lands; treat that as "now" so ordering stays sensible.
  if (!createdAt) return Date.now();
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  return new Date(createdAt).getTime();
};

export function NotificationProvider({ children }) {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      setToasts([]);
      initializedRef.current = false;
      return;
    }

    // Equality-only query (no orderBy) so Firestore doesn't require a composite
    // index; we sort client-side. Notification volume per user is small.
    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setNotifications(rows);

        // Toast only for items that arrive AFTER the initial load, and only the
        // important ones. The first snapshot is existing history → no toasts.
        if (initializedRef.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type !== 'added') return;
            const data = change.doc.data();
            if (!data.important) return;
            const id = change.doc.id;
            setToasts((prev) =>
              prev.some((t) => t.id === id) ? prev : [...prev, { id, ...data }]
            );
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 6000);
          });
        }
        initializedRef.current = true;
      },
      (error) => {
        console.error('Notifications listener error:', error.message);
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      const batch = writeBatch(db);
      unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    }
  }, [notifications]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = { notifications, unreadCount, markRead, markAllRead };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,22rem)]">
      {toasts.map((t) => {
        const Icon = iconForType(t.type);
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 bg-white border border-gray-100 shadow-lg rounded-2xl p-4 animate-fade-in-up"
            role="status"
          >
            <div className="w-9 h-9 rounded-full bg-[#FBF1F0] text-brand-burgundy flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
              <p className="text-sm text-gray-500 line-clamp-2">{t.body}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-gray-300 hover:text-gray-600 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
