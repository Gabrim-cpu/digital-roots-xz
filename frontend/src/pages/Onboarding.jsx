import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { ArrowRight, Check, Upload, X, BookOpen, Users } from 'lucide-react';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';

const nicheFields = ['history', 'sociology', 'anthropology', 'literature', 'philosophy', 'technology', 'arts', 'music', 'cooking', 'crafts'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const fileInputRef = useRef(null);
  const [identity, setIdentity] = useState(appUser?.identity || 'Senior');
  const [language, setLanguage] = useState(appUser?.language || 'en');
  const [displayName, setDisplayName] = useState(appUser?.display_name || '');
  const [age, setAge] = useState(appUser?.age || '');
  const [bio, setBio] = useState(appUser?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(appUser?.avatar_url || null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [learnInterests, setLearnInterests] = useState(appUser?.learn_interests || []);
  const [shareInterests, setShareInterests] = useState(appUser?.share_interests || []);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSenior = identity === 'Senior';

  const toggleInterest = (interest, type) => {
    const setter = type === 'learn' ? setLearnInterests : setShareInterests;
    setter(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setProfilePhoto(evt.target?.result);
        setProfilePhotoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await updateProfile({
        identity,
        language,
        display_name: displayName || undefined,
        age: age ? parseInt(age, 10) : undefined,
        bio: bio || undefined,
        avatar_url: profilePhoto || undefined,
        learn_interests: learnInterests,
        share_interests: shareInterests,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bgLight flex flex-col" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 max-w-lg mx-auto w-full">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <img src={logoXZ} alt="XZ" className="w-8 h-8" />
          <span className="text-base font-bold tracking-widest text-brand-burgundy uppercase">XZ</span>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-lg p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-serif font-bold text-brand-darkText">Complete your profile</h1>
            <p className="text-base text-gray-500 mt-1">Tell us about yourself to personalize your experience.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-base" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Photo */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Photo</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-brand-burgundy text-white rounded-xl font-semibold text-sm min-h-[44px] hover:opacity-90"
                  >
                    Upload Photo
                  </button>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm min-h-[44px] hover:bg-gray-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Identity toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {['Senior', 'Youth'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setIdentity(role)}
                    className={`py-4 px-4 rounded-2xl border flex items-center justify-center gap-2 font-semibold text-base min-h-[56px] transition-all ${
                      identity === role
                        ? 'border-brand-burgundy bg-brand-burgundy text-white shadow-md'
                        : 'border-gray-200 text-gray-500 hover:border-brand-burgundy/40'
                    }`}
                  >
                    {role === 'Senior' ? <BookOpen className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
              <input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full mt-1.5 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base min-h-[52px] focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy"
              />
            </div>

            {/* Language */}
            <div>
              <label htmlFor="language" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferred Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mt-1.5 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base min-h-[52px] focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age</label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 24 or 65"
                className="w-full mt-1.5 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base min-h-[52px] focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="text-xs font-bold text-gray-400 uppercase tracking-wider">About You</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself (optional)"
                rows={4}
                className="w-full mt-1.5 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy resize-none"
              />
            </div>

            {/* Interests - Teach */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">I can teach or share</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {nicheFields.map((field) => {
                  const active = shareInterests.includes(field);
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleInterest(field, 'share')}
                      className={`px-4 py-2.5 rounded-full font-semibold flex items-center gap-1.5 transition min-h-[44px] text-sm ${
                        active ? 'bg-brand-burgundy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {active && <Check className="h-4 w-4" />}
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests - Learn */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">I want to learn</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {nicheFields.map((field) => {
                  const active = learnInterests.includes(field);
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleInterest(field, 'learn')}
                      className={`px-4 py-2.5 rounded-full font-semibold flex items-center gap-1.5 transition min-h-[44px] text-sm ${
                        active ? 'bg-brand-burgundy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {active && <Check className="h-4 w-4" />}
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-burgundy text-white py-4 rounded-2xl font-semibold text-base min-h-[56px] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>Continue to Dashboard <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
