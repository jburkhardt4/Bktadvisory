import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { setSession, isAuthenticated } from '../utils/authSession';

// BKT brand assets
const BKT_ICON_URL =
  'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo%20(Transparent).png';
const BKT_FULL_LOGO =
  'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo.png';

// Inline SVG icons (per Guidelines: no lucide-react)
const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

interface FormState {
  firstName: string;
  lastName: string;
  companyName: string;
  website: string;
  workEmail: string;
  mobilePhone: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

type AuthMode = 'signup' | 'signin';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    companyName: '',
    website: '',
    workEmail: '',
    mobilePhone: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);

  const getSafeRedirectPath = (): string => {
    const state = location.state as { from?: unknown } | null | undefined;
    const from = state?.from;

    // Handle React Router-style location object
    if (from && typeof from === 'object' && 'pathname' in from) {
      const loc = from as { pathname: string; search?: string; hash?: string };
      const pathname = loc.pathname || '/portal';
      const search = typeof loc.search === 'string' ? loc.search : '';
      const hash = typeof loc.hash === 'string' ? loc.hash : '';
      return pathname + search + hash;
    }

    // Handle simple string paths, guarding against open redirects
    if (typeof from === 'string') {
      try {
        const url = new URL(from, window.location.origin);
        if (url.origin !== window.location.origin) {
          return '/portal';
        }
        return url.pathname + url.search + url.hash;
      } catch {
        return '/portal'; // Fallback for malformed URLs
      }
    }

    return '/portal'; // Default fallback
  };

  useEffect(() => {
    if (!isAuthenticated()) return;
    const targetPath = getSafeRedirectPath();
    navigate(targetPath, { replace: true });
  }, [navigate, location]);

  useEffect(() => {
    firstNameRef.current?.focus();
  }, [mode]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim() ? '' : `${name === 'firstName' ? 'First' : 'Last'} name is required`;
      case 'companyName':
        return mode === 'signup' && !value.trim() ? 'Company name is required' : '';
      case 'workEmail':
        if (!value.trim()) return 'Work email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Minimum 8 characters';
        return '';
      default:
        return '';
    }
  };

  const validateAll = (): boolean => {
    const requiredFields = mode === 'signup'
      ? ['firstName', 'lastName', 'companyName', 'workEmail', 'password']
      : ['workEmail', 'password'];
    const newErrors: FormErrors = {};
    requiredFields.forEach((field) => {
      const err = validateField(field, form[field as keyof FormState]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    const allTouched: Record<string, boolean> = {};
    requiredFields.forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, form[name as keyof FormState]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));
    setIsLoading(false);
    // Establish session then navigate to saved destination
    setSession();
    const redirectPath = getSafeRedirectPath();
    navigate(redirectPath, { replace: true });
  };

  const handleSSO = async (provider: string) => {
    setSsoLoading(provider);
    await new Promise((r) => setTimeout(r, 1500));
    setSsoLoading(null);
    setSession();
    const redirectPath = getSafeRedirectPath();
    navigate(redirectPath, { replace: true });
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-slate-800/60 border ${
      errors[field] && touched[field]
        ? 'border-red-500/70 focus:ring-red-500/30'
        : 'border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20'
    } rounded-lg text-slate-100 placeholder-slate-400 text-sm outline-none focus:ring-2 transition-all duration-200`;

  const ssoProviders = [
    { id: 'linkedin', label: 'Continue with LinkedIn', icon: <LinkedInIcon />, color: 'text-[#0A66C2]' },
    { id: 'google', label: 'Continue with Google Workspace', icon: <GoogleIcon />, color: '' },
    { id: 'microsoft', label: 'Continue with Microsoft Business', icon: <MicrosoftIcon />, color: '' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172B] via-slate-900 to-[#0F172B] flex flex-col">
      {/* Subtle background grid pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.6) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm group">
          <ArrowLeftIcon />
          <span className="hidden sm:inline group-hover:underline">Back to BKT Advisory</span>
        </Link>
        <img src={BKT_ICON_URL} alt="BKT Advisory" className="h-10 w-auto opacity-80" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-[480px]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-50 tracking-tight mb-2">
              {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              {mode === 'signup'
                ? 'Access the BKT Advisory Client Portal, project estimator, and strategic planning tools.'
                : 'Sign in to your BKT Advisory account to continue.'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/20">
            {/* SSO Buttons */}
            <div className="space-y-3">
              {ssoProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleSSO(provider.id)}
                  disabled={!!ssoLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/40 hover:border-slate-500/60 rounded-lg text-slate-200 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ssoLoading === provider.id ? <SpinnerIcon /> : <span className={provider.color}>{provider.icon}</span>}
                  <span>{provider.label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-600/50" />
              <span className="text-xs text-slate-500 uppercase tracking-widest whitespace-nowrap font-medium">or continue manually</span>
              <div className="flex-1 h-px bg-slate-600/50" />
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">First Name *</label>
                      <input
                        ref={firstNameRef}
                        type="text"
                        value={form.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        placeholder="Brandon"
                        className={inputClass('firstName')}
                        disabled={isLoading}
                      />
                      {errors.firstName && touched.firstName && (
                        <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Name *</label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        placeholder="Thompson"
                        className={inputClass('lastName')}
                        disabled={isLoading}
                      />
                      {errors.lastName && touched.lastName && (
                        <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Name *</label>
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        onBlur={() => handleBlur('companyName')}
                        placeholder="Acme Corp"
                        className={inputClass('companyName')}
                        disabled={isLoading}
                      />
                      {errors.companyName && touched.companyName && (
                        <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Website</label>
                      <input
                        type="url"
                        value={form.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="acme.com"
                        className={inputClass('website')}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Work Email *</label>
                    <input
                      type="email"
                      value={form.workEmail}
                      onChange={(e) => handleChange('workEmail', e.target.value)}
                      onBlur={() => handleBlur('workEmail')}
                      placeholder="brandon@acme.com"
                      className={inputClass('workEmail')}
                      disabled={isLoading}
                    />
                    {errors.workEmail && touched.workEmail && (
                      <p className="text-red-400 text-xs mt-1">{errors.workEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Mobile Phone</label>
                    <input
                      type="tel"
                      value={form.mobilePhone}
                      onChange={(e) => handleChange('mobilePhone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={inputClass('mobilePhone')}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {mode === 'signin' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Work Email</label>
                  <input
                    ref={firstNameRef}
                    type="email"
                    value={form.workEmail}
                    onChange={(e) => handleChange('workEmail', e.target.value)}
                    onBlur={() => handleBlur('workEmail')}
                    placeholder="brandon@acme.com"
                    className={inputClass('workEmail')}
                    disabled={isLoading}
                  />
                  {errors.workEmail && touched.workEmail && (
                    <p className="text-red-400 text-xs mt-1">{errors.workEmail}</p>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Min. 8 characters"
                    className={inputClass('password') + ' pr-11'}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot password link (sign in only) */}
              {mode === 'signin' && (
                <div className="text-right">
                  <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <SpinnerIcon />
                    <span>{mode === 'signup' ? 'Creating Account…' : 'Signing In…'}</span>
                  </>
                ) : (
                  mode === 'signup' ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="text-center text-sm text-slate-400 mt-6">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('signin'); setErrors({}); setTouched({}); }}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  New to BKT Advisory?{' '}
                  <button
                    onClick={() => { setMode('signup'); setErrors({}); setTouched({}); }}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Create Account
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Compliance microcopy */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
              <ShieldCheckIcon />
              <span>256-bit SSL encrypted &middot; SOC 2 compliant</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed max-w-sm mx-auto">
              By continuing, you agree to BKT Advisory's{' '}
              <button className="text-slate-400 hover:text-blue-400 underline transition-colors">Terms of Service</button>{' '}
              and{' '}
              <button className="text-slate-400 hover:text-blue-400 underline transition-colors">Privacy Policy</button>.
              Your data is never shared with third parties.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom brand bar */}
      <div className="relative z-10 text-center py-5 text-slate-600 text-xs">
        &copy; {new Date().getFullYear()} BKT Advisory. All rights reserved.
      </div>
    </div>
  );
}
