import React, { useState, FormEvent, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, syncSession, resetPassword } from '../services/authService';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';

interface LoginFormData {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { signIn, appUser } = useAuth() as any;

  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) return;
    setForgotStatus('sending');
    try {
      await resetPassword(forgotEmail.trim());
      setForgotStatus('sent');
    } catch {
      setForgotStatus('error');
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'At least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      if (errors.email) emailInputRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const session = await signIn(formData.email, formData.password);
      navigate(session.isNewUser || !session.user?.is_onboarded ? '/profile' : '/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, signIn, navigate, errors.email]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const user = await signInWithGoogle();
      if (!user) return;
      const idToken = await user.getIdToken();
      const session = await syncSession(idToken);
      navigate(session.isNewUser || !session.user?.is_onboarded ? '/profile' : '/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  if (appUser && appUser.display_name) {
    return (
      <div className="min-h-screen w-full bg-brand-burgundy flex flex-col items-center justify-center px-4 text-white">
        <img src={logoXZ} alt="XZ" className="h-16 w-16 mb-6 brightness-0 invert" />
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">Welcome, {appUser.display_name}</h1>
        <p className="text-white/70 text-base sm:text-lg mb-8">Entering the archive...</p>
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex bg-white">
      {/* LEFT PANEL — burgundy story panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-burgundy text-white overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="relative z-10 flex items-center gap-3 hover:opacity-80 transition w-fit">
          <img src={logoXZ} alt="XZ" className="w-9 h-9 brightness-0 invert" />
        </button>

        {/* Headline */}
        <div className="relative z-10 max-w-md animate-fade-in-up">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Passing on{' '}
            <span className="text-white/60">Knowledge</span>, nurturing the bond.
          </h1>
        </div>

        {/* Watermark hourglass */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src={logoXZ} alt="" className="w-[55%] h-[55%] brightness-0 invert opacity-[0.06]" />
        </div>

        {/* Footer tagline */}
        <div className="relative z-10 space-y-4">
          <p className="text-white/50 text-sm italic leading-relaxed font-serif">
            Every generation has something to teach.<br />
            Every generation has something to learn.<br />
            XZ is where those lessons meet.
          </p>
          <div className="flex gap-2">
            <div className="h-1 w-10 bg-white/70 rounded-full" />
            <div className="h-1 w-4 bg-white/20 rounded-full" />
            <div className="h-1 w-4 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="flex-1 lg:w-1/2 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Mobile logo header */}
        <div className="lg:hidden flex items-center justify-center pt-8 pb-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src={logoXZ} alt="XZ" className="w-8 h-8" />
            <span className="text-lg font-bold text-brand-burgundy">XZ</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-md space-y-6 animate-fade-in-up">
            {/* Heading */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 text-base mt-1">Continue your intergenerational journey.</p>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={emailInputRef}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="name@archive.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-100 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy focus:bg-white min-h-[52px] transition-colors ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-transparent'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1" role="alert">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(formData.email); setForgotStatus('idle'); }} className="text-xs font-semibold text-brand-burgundy hover:underline">Forgot?</button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-100 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy focus:bg-white min-h-[52px] transition-colors ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  >
                    {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1" role="alert">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-burgundy text-white py-3.5 px-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[54px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entering...
                  </>
                ) : (
                  <>Enter The Archive <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3.5 px-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all min-h-[54px] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isSubmitting ? 'Connecting...' : 'Sign in with Google'}
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500">
              New to our community?{' '}
              <button type="button" onClick={() => navigate('/register')} className="text-brand-burgundy font-bold hover:underline">
                Create an account
              </button>
            </p>

            {/* Footer note */}
            <p className="text-center text-[10px] text-gray-300 uppercase tracking-[0.2em] pt-2">
              Secure Encryption · Editorial Access V2.4
            </p>
          </div>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6" onClick={() => setShowForgot(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a link to reset your password.</p>
            {forgotStatus === 'sent' ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">Email sent!</p>
                <p className="text-sm text-gray-500 mt-1">Check your inbox for a reset link.</p>
                <button onClick={() => setShowForgot(false)} className="mt-4 px-6 py-2.5 bg-brand-burgundy text-white rounded-xl font-semibold text-sm">Back to Login</button>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 mb-4"
                />
                {forgotStatus === 'error' && <p className="text-red-500 text-sm mb-3">Could not send reset email. Check the address.</p>}
                <button
                  onClick={handleForgotPassword}
                  disabled={forgotStatus === 'sending' || !forgotEmail.trim()}
                  className="w-full bg-brand-burgundy text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-opacity-90 transition-all"
                >
                  {forgotStatus === 'sending' ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button onClick={() => setShowForgot(false)} className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
