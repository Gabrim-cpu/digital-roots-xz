import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Senior',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!form.email.match(/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/)) {
      setError('Please enter a valid email');
      return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
        language,
      });

      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#FBF9F6] via-white to-[#f3e8e6] flex flex-col">
      <header className="flex items-center justify-start px-4 sm:px-6 py-4 lg:px-16">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={logoXZ} alt="XZ" className="h-8 w-8" />
          <span className="text-lg font-bold text-brand-burgundy">XZ</span>
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-sm space-y-5 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="p-2 hover:bg-white/60 rounded-full transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-burgundy mb-1">Join XZ</h1>
            <p className="text-gray-500 text-sm sm:text-base">Create your account and start building roots.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="name" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Your name"
                className="w-full mt-1 px-4 py-3.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[48px]"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                placeholder="you@example.com"
                className="w-full mt-1 px-4 py-3.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[48px]"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
                placeholder="At least 8 characters"
                className="w-full mt-1 px-4 py-3.5 bg-white/80 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy min-h-[48px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">I am a</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {['Senior', 'Youth'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role }))}
                    className={`py-3.5 px-4 rounded-2xl border font-semibold text-base min-h-[48px] transition-all ${
                      form.role === role
                        ? 'border-brand-burgundy bg-brand-burgundy text-white shadow-md'
                        : 'border-gray-200 bg-white/80 text-gray-500 hover:border-brand-burgundy/40'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-burgundy text-white py-3.5 px-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm sm:text-base text-gray-500">
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
