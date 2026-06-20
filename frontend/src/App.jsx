import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatMessaging from './components/ChatMessaging';
import LiveCall from './components/LiveCall';
import RecordingSession from './components/RecordingSession';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

function ProtectedRoute({ children, skipOnboardingCheck = false }) {
  const { isAuthenticated, loading, appUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!skipOnboardingCheck && appUser && !appUser.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, appUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    if (appUser && !appUser.is_onboarded) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function MessagesPage() {
  const { appUser } = useAuth();
  const identity = appUser?.identity || 'Senior';
  const currentUser = {
    id: appUser?.id || 'current-user',
    name: appUser?.display_name || appUser?.email?.split('@')[0] || 'You',
    email: appUser?.email || 'you@digitalroots.org',
    role: identity === 'Senior' ? 'senior' : 'youth',
    language: appUser?.language || 'en',
    avatar: appUser?.avatar_url || null,
    points: appUser?.root_points || 0,
    interests: [],
  };

  return (
    <ChatMessaging
      currentUser={currentUser}
      threads={[]}
      messagesByThread={{}}
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute skipOnboardingCheck>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/call"
        element={
          <ProtectedRoute>
            <LiveCall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recording"
        element={
          <ProtectedRoute>
            <RecordingSession />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
