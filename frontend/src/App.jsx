import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LiveCall from './components/LiveCall';
import RecordingSession from './components/RecordingSession';

// Importe ton logo ici (ajuste le chemin selon ton projet)
// import Logo from './assets/logo.png'; 

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  // 1. Nouvel état pour gérer l'affichage du Splash Screen
  const [isLoading, setIsLoading] = useState(true);

  // 2. Effet pour faire disparaître le Splash Screen après un délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3000 ms = 3 secondes (tu peux changer cette valeur)

    return () => clearTimeout(timer); // Nettoyage du timer
  }, []);

  // 3. Si on est en train de charger, on affiche UNIQUEMENT le Splash Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center z-50">
        {/* Conteneur Logo + Animation */}
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          
          {/* Emplacement de ton Logo */}
          <div className="w-24 h-24 bg-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-amber-600/20">
            {/* Remplace ce texte par <img src={Logo} alt="Logo" /> une fois importé */}
            App
          </div>

          {/* Le Loader (Tu vois ce que je veux dire 😉 - Un beau spinner moderne) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-neutral-400 text-xs tracking-widest uppercase animate-pulse">
              Chargement...
            </p>
          </div>

        </div>
      </div>
    );
  }

  // 4. Une fois le chargement fini (isLoading === false), le reste de l'application s'affiche normalement
  return (
    <div className="relative">
      {/* Dev Switcher Bar */}
      <div className="fixed bottom-4 left-4 z-50 bg-neutral-900/90 text-white p-2 rounded-xl text-xs flex gap-2 shadow-xl border border-white/10 backdrop-blur-sm">
        <button onClick={() => setCurrentView('login')} className={`px-2.5 py-1 rounded-md ${currentView === 'login' ? 'bg-amber-600' : 'hover:bg-white/10'}`}>1. Login</button>
        <button onClick={() => setCurrentView('dashboard')} className={`px-2.5 py-1 rounded-md ${currentView === 'dashboard' ? 'bg-amber-600' : 'hover:bg-white/10'}`}>2. Dashboard</button>
        <button onClick={() => setCurrentView('call')} className={`px-2.5 py-1 rounded-md ${currentView === 'call' ? 'bg-amber-600' : 'hover:bg-white/10'}`}>3. Call UI</button>
        <button onClick={() => setCurrentView('recording')} className={`px-2.5 py-1 rounded-md ${currentView === 'recording' ? 'bg-amber-600' : 'hover:bg-white/10'}`}>4. Recording</button>
      </div>

      {/* Dynamic Screen Render */}
      {currentView === 'login' && <Login />}
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'call' && <LiveCall />}
      {currentView === 'recording' && <RecordingSession />}
    </div>
  );
}