import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';

export default function Onboarding() {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [identity, setIdentity] = useState(appUser?.identity || 'Senior');
  const [language, setLanguage] = useState(appUser?.language || 'en');
  const [displayName, setDisplayName] = useState(appUser?.display_name || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await updateProfile({
        identity,
        language,
        display_name: displayName || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bgLight flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-4">
        <h1 className="text-2xl font-serif text-brand-darkText">Complete your profile</h1>
        <p className="text-sm text-gray-500">Tell us a bit about yourself to personalize your experience.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="text-xs font-medium text-gray-500">Display name</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <div>
          <label htmlFor="identity" className="text-xs font-medium text-gray-500">Identity</label>
          <select
            id="identity"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          >
            <option value="Senior">Senior</option>
            <option value="Youth">Youth</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="text-xs font-medium text-gray-500">Preferred language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ff">Fulfulde</option>
            <option value="duala">Duala</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-burgundy text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Continue to dashboard'}
        </button>
      </form>
    </div>
  );
}
