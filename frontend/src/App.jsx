import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatMessaging from './components/ChatMessaging';
import RecordingSession from './components/RecordingSession';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import WisdomHub from './pages/WisdomHub';

function ProtectedRoute({ children, skipOnboardingCheck = false }) {
  const { isAuthenticated, loading, appUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-burgundy/20 border-t-brand-burgundy rounded-full animate-spin" />
          <span className="text-sm text-stone-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!skipOnboardingCheck && appUser && !appUser.is_onboarded) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, appUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-burgundy/20 border-t-brand-burgundy rounded-full animate-spin" />
          <span className="text-sm text-stone-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (appUser && !appUser.is_onboarded) {
      return <Navigate to="/profile" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function MessagesPage() {
  const { appUser } = useAuth();
  return <ChatMessaging currentUser={appUser} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/profile" element={<ProtectedRoute skipOnboardingCheck><Profile /></ProtectedRoute>} />

        <Route path="/onboarding" element={<ProtectedRoute skipOnboardingCheck><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><WisdomHub /></ProtectedRoute>} />
        <Route path="/wisdom-hub" element={<ProtectedRoute><WisdomHub /></ProtectedRoute>} />
        <Route path="/dashboard-legacy" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/recording" element={<ProtectedRoute><RecordingSession /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
