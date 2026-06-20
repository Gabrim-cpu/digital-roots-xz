import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, ArrowLeft, Camera, X } from 'lucide-react';

const HourglassLogo = ({ className = 'w-10 h-10 text-white' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="25" y1="25" x2="75" y2="25" />
    <line x1="25" y1="75" x2="75" y2="75" />
    <line x1="25" y1="25" x2="75" y2="75" />
    <line x1="25" y1="75" x2="82" y2="18" strokeWidth="6" />
    <path d="M70 18 H82 V30" strokeWidth="6" />
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Senior',
    language: 'en',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for your profile picture.');
      return;
    }
    if (file.size > 700 * 1024) {
      setError('Please choose a profile picture smaller than 700 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError('');
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const session = await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
        language: form.language,
        profilePicture: profilePreview,
      });
      navigate(session.isNewUser || !session.user?.is_onboarded ? '/onboarding' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans">

      {/* ── LEFT: Branding Panel (desktop only) ── */}
      <div className="hidden lg:flex bg-gradient-to-br from-[#740A03] via-[#5a0803] to-[#250100] flex-col justify-between p-16 text-white relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 opacity-[0.04] flex items-center justify-center pointer-events-none">
          <HourglassLogo className="w-[36rem] h-[36rem] text-white" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <HourglassLogo className="w-9 h-9 text-white" />
          <span className="text-sm font-bold tracking-widest uppercase">Digital Roots</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl xl:text-6xl font-bold leading-tight max-w-md">
            Join the{' '}
            <span className="italic font-serif text-[#d4a853]">Community</span>
            ,<br />start your journey.
          </h2>
          <div className="mt-8 space-y-1 italic text-sm text-white/60 border-l-2 border-white/20 pl-4">
            <p>Every generation has something to teach.</p>
            <p>Every generation has something to learn.</p>
          </div>
          <p className="mt-4 text-sm font-semibold text-[#A77272]">XZ is where those lessons meet.</p>
        </div>

        <div className="flex gap-2 relative z-10">
          <div className="w-6 h-1.5 bg-white rounded-full" />
          <div className="w-2 h-1.5 bg-white/30 rounded-full" />
          <div className="w-2 h-1.5 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* ── RIGHT: Register Form ── */}
      <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16 xl:px-24 min-h-screen lg:min-h-0">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <HourglassLogo className="w-7 h-7 text-brand-burgundy" />
          <span className="text-sm font-bold tracking-widest text-brand-burgundy uppercase">Digital Roots</span>
        </div>

        <div className="w-full max-w-md mx-auto space-y-6">

          {/* Back link + Header */}
          <div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-burgundy transition-colors mb-6 -ml-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
            <h1 className="text-3xl font-serif font-bold text-brand-darkText">Create an account</h1>
            <p className="text-gray-400 text-sm mt-1">Join the XZ intergenerational community.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm" role="alert">
              {error}
            </div>
          )}

          {/* Identity toggle */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your identity</label>
            <div className="grid grid-cols-2 gap-3">
              {['Senior', 'Youth'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role }))}
                  className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 transition-all font-semibold text-sm ${
                    form.role === role
                      ? 'border-brand-burgundy bg-brand-burgundy text-white shadow-md'
                      : 'border-gray-200 text-gray-500 hover:border-brand-burgundy/40 hover:bg-gray-50'
                  }`}
                >
                  {role === 'Senior' ? <BookOpen className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Profile picture
            </label>
            <div className="flex items-center gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-burgundy text-lg font-bold text-white">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  form.name.slice(0, 1).toUpperCase() || <Camera className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-bold text-brand-burgundy shadow-sm ring-1 ring-gray-200 hover:bg-red-50"
                  >
                    Upload photo
                  </label>
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={() => setProfilePreview('')}
                      className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-500 shadow-sm ring-1 ring-gray-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                  Optional. This replaces the default/Google photo for your Digital Roots profile.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="name@archive.com"
                className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min. 8 characters"
                className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy transition-all"
              />
            </div>

            <div>
              <label htmlFor="language" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Preferred Language
              </label>
              <select
                id="language"
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy transition-all"
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
              className="w-full bg-brand-burgundy text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-opacity-90 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-burgundy font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
