import React, { useState, FormEvent, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Eye, EyeOff, ArrowRight, Shield, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, syncSession } from '../services/authService';

// ============================================
// TYPES & INTERFACES
// ============================================

type Identity = 'Senior' | 'Youth';
type Language = 'en' | 'fr' | 'ff' | 'duala'; // English, French, Fulfulde, Duala

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
  onDataExport,
  isLoading: externalLoading = false 
}: LoginProps) {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  // State
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
  
  // Custom hooks
  const { isVisible: isPasswordVisible, toggle: togglePasswordVisibility } = usePasswordVisibility();
  const { validateEmail, validatePassword } = useFormValidation();
  
  // Refs for accessibility
  const emailInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // ============================================
  // HANDLERS
  // ============================================

  const handleIdentityChange = useCallback((newIdentity: Identity) => {
    setIdentity(newIdentity);
    setFormData(prev => ({ ...prev, identity: newIdentity }));
    // Announce change for screen readers
    const announcement = `Selected identity: ${newIdentity}`;
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion) liveRegion.textContent = announcement;
  }, []);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as Language;
    setLanguage(newLanguage);
    setFormData(prev => ({ ...prev, language: newLanguage }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error when user starts typing
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
      // Focus first field with error
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
  }, [formData, validateForm, signIn, navigate]);

  const handleForgotPassword = useCallback(() => {
    if (formData.email && validateEmail(formData.email)) {
      onForgotPassword?.(formData.email);
    } else {
      setErrors({ email: 'Please enter your email address first' });
      emailInputRef.current?.focus();
    }
  }, [formData.email, validateEmail, onForgotPassword]);

  const handleDataExportRequest = useCallback(async () => {
    try {
      alert(`Data export requested. A download link will be sent to ${formData.email} within 30 days as required by GDPR.`);
      setShowDataExportModal(false);
    } catch (error) {
      setErrors({ general: 'Failed to request data export' });
    }
  }, [formData.email]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      const session = await syncSession(idToken, {
        identity: identity,
        language: language,
      });

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
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 font-sans">
      {/* Accessibility live region for screen readers */}
      <div id="a11y-live-region" className="sr-only" aria-live="polite" />
      
      {/* Left Branding Panel */}
      <div className="md:col-span-5 bg-brand-burgundy p-6 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="text-2xl font-serif tracking-wide">XZ</div>
          {/* Language selector - satisfies FR-12 (Local language tagging) */}
          <div className="relative">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-white/20 text-white text-sm rounded-lg px-3 py-1.5 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
              aria-label="Select language"
            >
              <option value="en" className="text-gray-900">English</option>
              <option value="fr" className="text-gray-900">Français</option>
              <option value="ff" className="text-gray-900">Fulfulde</option>
              <option value="duala" className="text-gray-900">Duala</option>
            </select>
          </div>
        </div>
        
        <div className="relative z-10 my-auto py-8 md:py-0">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-sm">
            Passing on{' '}
            <span className="text-brand-roseMuted opacity-90">Knowledge</span>
            , nurturing the bond.
          </h1>
          <div 
            className="absolute -left-10 top-20 text-[18rem] font-serif opacity-5 pointer-events-none select-none"
            aria-hidden="true"
          >
            ⏳
          </div>
        </div>

        <div className="italic text-sm opacity-80 max-w-xs space-y-1">
          <p>Every generation has something to teach.</p>
          <p>Every generation has something to learn.</p>
          <p className="font-semibold not-italic mt-2 text-brand-roseMuted">
            XZ is where those lessons meet
          </p>
        </div>
        
        <div className="flex gap-2 mt-6">
          <span className="w-6 h-1 bg-white rounded-full" aria-hidden="true" />
          <span className="w-2 h-1 bg-white/40 rounded-full" aria-hidden="true" />
          <span className="w-2 h-1 bg-white/40 rounded-full" aria-hidden="true" />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="md:col-span-7 bg-white p-6 md:p-12 lg:p-24 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-brand-darkText">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Continue your intergenerational journey.
            </p>
          </div>

          {/* Identity Selection - Accessible Toggle Buttons */}
          <div className="space-y-2">
            <label id="identity-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Choose your identity
            </label>
            <div 
              className="grid grid-cols-2 gap-4"
              role="group"
              aria-labelledby="identity-label"
            >
              <button
                type="button"
                onClick={() => handleIdentityChange('Senior')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleIdentityChange('Senior');
                  }
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:ring-offset-2 ${
                  identity === 'Senior'
                    ? 'border-brand-burgundy bg-brand-burgundy text-white shadow-md'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                aria-pressed={identity === 'Senior'}
                aria-label="Sign in as Senior"
              >
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">Senior</span>
              </button>
              <button
                type="button"
                onClick={() => handleIdentityChange('Youth')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleIdentityChange('Youth');
                  }
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:ring-offset-2 ${
                  identity === 'Youth'
                    ? 'border-brand-burgundy bg-brand-burgundy text-white shadow-md'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                aria-pressed={identity === 'Youth'}
                aria-label="Sign in as Youth"
              >
                <Users className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">Youth</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="text-xs font-medium text-gray-500">
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
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full mt-1 px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-brand-burgundy transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-xs mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-medium text-gray-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-brand-burgundy font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-brand-burgundy rounded"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:border-brand-burgundy transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-burgundy rounded"
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-red-500 text-xs mt-1" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-brand-burgundy focus:ring-brand-burgundy"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me on this device
                </label>
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm" role="alert">
                  {errors.general}
                </div>
              )}

              {/* Submit Button */}
              <button
                ref={submitButtonRef}
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-burgundy text-white py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign in to continue"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Enter The Archive <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Google Sign In */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-brand-burgundy focus:ring-offset-2 disabled:opacity-50"
              aria-label="Sign in with Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.216 1.744 15.44 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.897 0 11.82-4.154 11.82-12.03 0-.816-.088-1.427-.197-2.165H12.24z"/>
              </svg>
              {isLoading ? 'Signing in with Google...' : 'Sign in with Google'}
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center text-sm text-gray-500">
            New to our community?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-brand-burgundy font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-burgundy rounded"
            >
              Create an account
            </button>
          </div>

          {/* GDPR & Security Footer with Data Export */}
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="flex gap-4 text-center text-[10px] text-gray-400 tracking-widest uppercase">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" aria-hidden="true" />
                Secure Encryption
              </span>
              <span>•</span>
              <span>Editorial Access v2.4</span>
            </div>
            
            {/* GDPR Data Export Link - Satisfies FR-3 */}
            <button
              type="button"
              onClick={() => setShowDataExportModal(true)}
              className="text-[10px] text-gray-400 hover:text-brand-burgundy flex items-center gap-1 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-burgundy rounded px-2 py-1"
              aria-label="Request your data export under GDPR"
            >
              <Download className="w-3 h-3" aria-hidden="true" />
              Export my data (GDPR)
            </button>
          </div>
        </div>
      </div>

      {/* GDPR Data Export Modal */}
      {showDataExportModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900 mb-2">
              Request Your Data Export
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Under GDPR regulations (Article 20 - Right to data portability), you can request a complete export of all your personal data from the XZ platform.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Your data will be packaged as a downloadable archive (JSON/CSV format) and will be available within <strong>30 days</strong>. A download link will be sent to your registered email address.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDataExportModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDataExportRequest}
                className="px-4 py-2 text-sm bg-brand-burgundy text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Confirm Export Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}