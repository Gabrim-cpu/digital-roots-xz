import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Download, MessageCircle, BookMarked, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, syncSession } from '../services/authService';
import intergenerationalLaptop from '../Assets/intergenerational_laptop.png';

// ============================================
// TYPES & INTERFACES
// ============================================

type Identity = 'Senior' | 'Youth';
type Language = 'en' | 'fr' | 'ff' | 'duala';
type Step = 'splash' | 'onboarding1' | 'onboarding2' | 'login';

interface LoginFormData {
  email: string;
  password: string;
  identity: Identity;
  language: Language;
  rememberMe: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ============================================
// CUSTOM HOOKS
// ============================================

const usePasswordVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);
  return { isVisible, toggle };
};

const useFormValidation = () => {
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };
  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return undefined;
  };
  return { validateEmail, validatePassword };
};

// ============================================
// SHARED SVG LOGO
// ============================================

const HourglassLogo = ({ className = 'w-10 h-10 text-white' }: { className?: string }) => (
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

// ============================================
// COMPONENT PROPS
// ============================================

interface LoginProps {
  onLoginSuccess?: (user: { id: string; identity: Identity; email: string }) => void;
  onForgotPassword?: (email: string) => void;
  onRegister?: () => void;
  onDataExport?: () => void;
  isLoading?: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function Login({
  onForgotPassword,
  isLoading: externalLoading = false,
}: LoginProps) {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [step, setStep] = useState<Step>('splash');
  const [identity, setIdentity] = useState<Identity>('Senior');
  const [language, setLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    identity: 'Senior',
    language: 'en',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);

  const { isVisible: isPasswordVisible, toggle: togglePasswordVisibility } = usePasswordVisibility();
  const { validateEmail, validatePassword } = useFormValidation();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-advance from splash
  useEffect(() => {
    if (step === 'splash') {
      const t = setTimeout(() => setStep('onboarding1'), 2600);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Touch swipe navigation
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      if (step === 'onboarding1') setStep('onboarding2');
      else if (step === 'onboarding2') setStep('login');
    } else if (diff < -50) {
      if (step === 'onboarding2') setStep('onboarding1');
    }
    touchStartX.current = null;
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleIdentityChange = useCallback((id: Identity) => {
    setIdentity(id);
    setFormData(prev => ({ ...prev, identity: id }));
  }, []);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as Language;
    setLanguage(lang);
    setFormData(prev => ({ ...prev, language: lang }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password, validateEmail, validatePassword]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      if (errors.email) emailInputRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const session = await signIn(formData.email, formData.password, {
        identity: formData.identity,
        language: formData.language,
      });
      navigate(session.isNewUser || !session.user?.is_onboarded ? '/onboarding' : '/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, signIn, navigate, errors.email]);

  const handleForgotPassword = useCallback(() => {
    if (formData.email && !validateEmail(formData.email)) {
      onForgotPassword?.(formData.email);
    } else {
      setErrors({ email: 'Please enter your email address first' });
      emailInputRef.current?.focus();
    }
  }, [formData.email, validateEmail, onForgotPassword]);

  const handleDataExportRequest = useCallback(async () => {
    alert(`Data export requested. A download link will be sent to ${formData.email} within 30 days as required by GDPR.`);
    setShowDataExportModal(false);
  }, [formData.email]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const user = await signInWithGoogle();
      if (!user) return;
      const idToken = await user.getIdToken();
      const session = await syncSession(idToken, { identity, language });
      navigate(session.isNewUser || !session.user?.is_onboarded ? '/onboarding' : '/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed. Please try again.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  }, [identity, language, navigate]);

  const isLoading = externalLoading || isSubmitting;

  // ============================================
  // RENDER — SPLASH
  // ============================================

  if (step === 'splash') {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-between bg-gradient-to-b from-[#740A03] via-[#5a0803] to-[#250100] text-white cursor-pointer select-none py-16 px-6"
        onClick={() => setStep('onboarding1')}
      >
        <div />

        <div className="flex flex-col items-center gap-6">
          <div className="animate-pulse">
            <HourglassLogo className="w-28 h-28 md:w-36 md:h-36 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.25em] uppercase mt-2">
            DIGITAL ROOTS
          </h1>
          <p className="text-sm text-white/50 tracking-widest">Tap to continue</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-[10px] tracking-[0.25em] font-semibold text-white/50 uppercase">
            Initializing Experience
          </span>
          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="w-10 h-px bg-white/20" />
            <span className="text-[9px] tracking-widest text-white/30 uppercase">Established in 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER — ONBOARDING 1
  // ============================================

  if (step === 'onboarding1') {
    return (
      <div
        className="min-h-screen w-full bg-brand-bgLight flex flex-col lg:flex-row"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── LEFT / TOP: Branding & Copy ── */}
        <div className="flex-1 flex flex-col justify-between bg-brand-bgLight px-6 pt-8 pb-0 lg:px-16 lg:pt-16 lg:pb-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <HourglassLogo className="w-7 h-7 text-brand-burgundy" />
            <span className="text-sm font-bold tracking-widest text-brand-burgundy uppercase">Digital Roots</span>
          </div>

          {/* Headline */}
          <div className="my-8 lg:my-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-burgundy leading-tight max-w-lg">
              Bridging{' '}
              <span className="italic font-serif text-[#736A20]">Generational gap</span>
              ,<br />nurture the bond.
            </h1>

            <div className="flex items-start gap-4 mt-8">
              <div className="flex -space-x-3 mt-1">
                {['bg-brand-roseMuted', 'bg-[#D6A28E]', 'bg-[#C4936E]'].map((bg, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-white ${bg} flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Join a community where each generation learns from the other.
              </p>
            </div>

            <div className="flex items-start gap-4 mt-6">
              <div className="p-3 bg-brand-burgundy/10 rounded-2xl text-brand-burgundy flex-shrink-0">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-burgundy">Share Experiences</h4>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Share your stories and pass on your unique skills to the next generation.</p>
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="flex justify-between items-center pb-6 lg:pb-0 mt-6 lg:mt-8">
            <button
              onClick={() => setStep('login')}
              className="text-sm font-semibold text-gray-400 hover:text-brand-burgundy transition-colors"
            >
              Skip
            </button>
            <div className="flex gap-2">
              <div className="w-6 h-2 bg-brand-burgundy rounded-full" />
              <button onClick={() => setStep('onboarding2')} className="w-2 h-2 bg-brand-burgundy/25 rounded-full hover:bg-brand-burgundy/50 transition-colors" />
              <button onClick={() => setStep('login')} className="w-2 h-2 bg-brand-burgundy/25 rounded-full hover:bg-brand-burgundy/50 transition-colors" />
            </div>
            <button
              onClick={() => setStep('onboarding2')}
              className="w-10 h-10 rounded-full bg-brand-burgundy flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              aria-label="Next"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── RIGHT / BOTTOM: Image ── */}
        <div className="w-full h-64 lg:h-auto lg:w-[45%] xl:w-[50%] relative overflow-hidden">
          <img
            src={intergenerationalLaptop}
            alt="Intergenerational knowledge sharing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bgLight via-transparent to-transparent lg:bg-gradient-to-r lg:from-brand-bgLight lg:via-transparent lg:to-transparent" />
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER — ONBOARDING 2
  // ============================================

  if (step === 'onboarding2') {
    return (
      <div
        className="min-h-screen w-full bg-brand-bgLight flex flex-col lg:flex-row"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── LEFT / TOP: Content ── */}
        <div className="flex-1 flex flex-col px-6 pt-8 pb-6 lg:px-16 lg:pt-16 lg:pb-16">
          {/* Top nav */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStep('onboarding1')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-brand-burgundy transition-colors" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <HourglassLogo className="w-7 h-7 text-brand-burgundy" />
            <button onClick={() => setStep('login')} className="text-sm font-semibold text-gray-400 hover:text-brand-burgundy transition-colors">
              Skip
            </button>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-brand-burgundy leading-tight mb-2">
            Earn Root Points<br />for every action
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-6">
            Your contributions build a legacy. Every story shared, every advice given, and every connection made earns you points toward exclusive community rewards.
          </p>

          {/* CTA */}
          <button
            onClick={() => setStep('login')}
            className="inline-flex items-center gap-2 bg-brand-burgundy text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-opacity-90 shadow-md hover:shadow-lg transition-all w-fit mb-2"
          >
            Start your journey <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert('Rewards details coming soon!')}
            className="text-sm font-bold text-brand-burgundy hover:underline w-fit mb-8"
          >
            Learn about Rewards
          </button>

          {/* Balance card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden mb-8 max-w-xs">
            <div className="absolute -right-4 -bottom-4 opacity-[0.04] text-brand-burgundy pointer-events-none">
              <HourglassLogo className="w-32 h-32" />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-[#D67C65] uppercase mb-1">Current Balance</p>
            <p className="text-6xl font-serif font-semibold text-brand-burgundy leading-none">250</p>
            <div className="w-14 h-0.5 bg-[#D67C65] mt-2 rounded-full" />
            <p className="text-sm font-semibold text-brand-burgundy mt-2">Root Points</p>
          </div>

          {/* Action list */}
          <div className="space-y-4">
            {[
              { icon: MessageCircle, title: 'Chat Daily', desc: '+50 Points per conversation' },
              { icon: BookMarked, title: 'Share Stories', desc: 'Earn points for every historical memory archived.' },
              { icon: GraduationCap, title: 'Mentor Youth', desc: 'Connect across generations and earn wisdom tokens.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-brand-burgundy flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-brand-burgundy leading-none">{title}</h5>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex gap-2 mt-auto pt-8">
            <button onClick={() => setStep('onboarding1')} className="w-2 h-2 bg-brand-burgundy/25 rounded-full hover:bg-brand-burgundy/50 transition-colors" />
            <div className="w-6 h-2 bg-brand-burgundy rounded-full" />
            <button onClick={() => setStep('login')} className="w-2 h-2 bg-brand-burgundy/25 rounded-full hover:bg-brand-burgundy/50 transition-colors" />
          </div>
        </div>

        {/* ── RIGHT (desktop only): Decorative branding panel ── */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-gradient-to-br from-[#740A03] via-[#5a0803] to-[#250100] flex-col items-center justify-center p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <HourglassLogo className="w-[32rem] h-[32rem] text-white" />
          </div>
          <div className="relative z-10 text-center">
            <HourglassLogo className="w-24 h-24 text-white mx-auto mb-6" />
            <h3 className="text-3xl font-bold tracking-widest uppercase mb-2">Digital Roots</h3>
            <p className="italic text-white/60 text-sm max-w-xs leading-relaxed">
              Every generation has something to teach.<br />Every generation has something to learn.
            </p>
            <p className="font-semibold text-brand-roseMuted mt-4 text-sm">XZ is where those lessons meet.</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER — LOGIN
  // ============================================

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans">
      <div id="a11y-live-region" className="sr-only" aria-live="polite" />

      {/* ── LEFT: Branding Panel ── */}
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
          <h1 className="text-5xl xl:text-6xl font-bold leading-tight max-w-md">
            Passing on{' '}
            <span className="italic font-serif text-[#d4a853]">Knowledge</span>
            ,<br />nurturing the bond.
          </h1>
          <div className="mt-8 space-y-1 italic text-sm text-white/60 border-l-2 border-white/20 pl-4">
            <p>Every generation has something to teach.</p>
            <p>Every generation has something to learn.</p>
          </div>
          <p className="mt-4 text-sm font-semibold text-brand-roseMuted">XZ is where those lessons meet.</p>
        </div>

        <div className="flex gap-2 relative z-10">
          <div className="w-6 h-1.5 bg-white rounded-full" />
          <div className="w-2 h-1.5 bg-white/30 rounded-full" />
          <div className="w-2 h-1.5 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16 xl:px-24 min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <HourglassLogo className="w-7 h-7 text-brand-burgundy" />
          <span className="text-sm font-bold tracking-widest text-brand-burgundy uppercase">Digital Roots</span>
        </div>

        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif font-bold text-brand-darkText">Welcome Back</h2>
                <p className="text-gray-400 text-sm mt-1">Continue your intergenerational journey.</p>
              </div>
              {/* Language selector */}
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-gray-50 text-gray-600 text-xs rounded-xl px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 cursor-pointer"
                aria-label="Select language"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ff">Fulfulde</option>
                <option value="duala">Duala</option>
              </select>
            </div>
          </div>

          {/* Identity Toggle */}
          <div className="space-y-2">
            <label id="identity-label" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Choose your identity
            </label>
            <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="identity-label">
              {(['Senior', 'Youth'] as Identity[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleIdentityChange(id)}
                  className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 transition-all font-semibold text-sm ${
                    identity === id
                      ? 'border-brand-burgundy bg-brand-burgundy text-white shadow-md'
                      : 'border-gray-200 text-gray-500 hover:border-brand-burgundy/40 hover:bg-gray-50'
                  }`}
                  aria-pressed={identity === id}
                >
                  {id === 'Senior' ? <BookOpen className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="name@archive.com"
                aria-invalid={!!errors.email}
                className={`w-full mt-1.5 px-4 py-3 bg-gray-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy transition-all ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1" role="alert">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-brand-burgundy font-semibold hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 focus:border-brand-burgundy transition-all ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                >
                  {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1" role="alert">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-300 text-brand-burgundy focus:ring-brand-burgundy"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-500">Remember me on this device</label>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm" role="alert">
                {errors.general}
              </div>
            )}

            {/* Submit */}
            <button
              ref={submitButtonRef}
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-burgundy text-white py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>Enter The Archive <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.216 1.744 15.44 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.897 0 11.82-4.154 11.82-12.03 0-.816-.088-1.427-.197-2.165H12.24z"/>
            </svg>
            {isLoading ? 'Connecting...' : 'Sign in with Google'}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            New to our community?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-brand-burgundy font-bold hover:underline"
            >
              Create an account
            </button>
          </p>

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-100">
            <div className="flex gap-4 text-[10px] text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Secure Encryption</span>
              <span>•</span>
              <span>v2.4</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDataExportModal(true)}
              className="text-[10px] text-gray-400 hover:text-brand-burgundy flex items-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" /> Export my data (GDPR)
            </button>
          </div>
        </div>
      </div>

      {/* GDPR Modal */}
      {showDataExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Your Data Export</h3>
            <p className="text-sm text-gray-500 mb-3 leading-relaxed">
              Under GDPR (Article 20 – Right to data portability), you can request a complete export of all your personal data.
            </p>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your data will be packaged and available within <strong>30 days</strong>, sent to your registered email address.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDataExportModal(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDataExportRequest} className="px-4 py-2 text-sm bg-brand-burgundy text-white rounded-xl hover:bg-opacity-90 transition-colors">
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}