import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { supabase } from "../supabase/client";
import { useAuth } from "../contexts/AuthContext";

// BKT brand assets
const BKT_ICON_URL =
  "https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo%20(Transparent).png";
const BKT_FULL_LOGO =
  "https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo.png";

// Inline SVG icons (per Guidelines: no lucide-react)
const LinkedInIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
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
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const UserIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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
  [key: string]: string | undefined;
}

interface RecoveryFormState {
  newPassword: string;
  confirmPassword: string;
}

interface NoticeState {
  variant: "info" | "success";
  message: string;
}

type AuthMode = "signup" | "signin" | "recovery";

const INITIAL_RECOVERY_FORM: RecoveryFormState = {
  newPassword: "",
  confirmPassword: "",
};

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    companyName: "",
    website: "",
    workEmail: "",
    mobilePhone: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] =
    useState(false);
  const [isUpdatingRecoveryPassword, setIsUpdatingRecoveryPassword] =
    useState(false);
  const [recoveryForm, setRecoveryForm] =
    useState<RecoveryFormState>(INITIAL_RECOVERY_FORM);
  const [recoveryErrors, setRecoveryErrors] = useState<FormErrors>(
    {},
  );
  const [notice, setNotice] = useState<NoticeState | null>(
    null,
  );
  const firstNameRef = useRef<HTMLInputElement>(null);
  const recoveryPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "recovery") {
      recoveryPasswordRef.current?.focus();
      return;
    }
    firstNameRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event !== "PASSWORD_RECOVERY") return;

        setMode("recovery");
        setServerError(null);
        setNotice({
          variant: "info",
          message:
            "Your reset link is confirmed. Choose a new password below.",
        });
        setErrors({});
        setTouched({});
        setShowPassword(false);
        setRecoveryErrors({});
        setRecoveryForm(INITIAL_RECOVERY_FORM);
        setForm((prev) => ({
          ...prev,
          workEmail:
            session?.user.email ?? prev.workEmail,
          password: "",
        }));
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (mode === "recovery") return;
    if (session) {
      const from = location.state?.from;
      const destination =
        typeof from === "string" && from.startsWith("/") ? from : "/portal";
      navigate(destination, { replace: true });
    }
  }, [authLoading, session, navigate, location.state, mode]);

  const validateField = (
    name: string,
    value: string,
  ): string => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim()
          ? ""
          : `${name === "firstName" ? "First" : "Last"} name is required`;
      case "workEmail":
        if (!value.trim()) return "Work email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters";
        return "";
      default:
        return "";
    }
  };

  const validateAll = (): boolean => {
    const requiredFields =
      mode === "signup"
        ? ["firstName", "lastName", "workEmail", "password"]
        : ["workEmail", "password"];
    const newErrors: FormErrors = {};
    requiredFields.forEach((field) => {
      const err = validateField(
        field,
        form[field as keyof FormState],
      );
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    const allTouched: Record<string, boolean> = {};
    requiredFields.forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    return Object.keys(newErrors).length === 0;
  };

  const validateRecoveryField = (
    name: string,
    value: string,
  ): string => {
    switch (name) {
      case "newPassword":
        if (!value) return "New password is required";
        if (value.length < 8)
          return "Minimum 8 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your new password";
        if (value !== recoveryForm.newPassword)
          return "Passwords must match";
        return "";
      default:
        return "";
    }
  };

  const validateRecoveryForm = (): boolean => {
    const nextErrors: FormErrors = {};

    ["newPassword", "confirmPassword"].forEach((field) => {
      const value =
        recoveryForm[field as keyof RecoveryFormState];
      const error = validateRecoveryField(field, value);
      if (error) nextErrors[field] = error;
    });

    setRecoveryErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
    const err = validateField(
      name,
      form[name as keyof FormState],
    );
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleRecoveryChange = (
    name: keyof RecoveryFormState,
    value: string,
  ) => {
    setRecoveryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setRecoveryErrors((prev) => ({
      ...prev,
      [name]: undefined,
      ...(name === "newPassword"
        ? { confirmPassword: undefined }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setIsLoading(true);
    setServerError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.workEmail,
          password: form.password,
          options: {
            data: {
              first_name: form.firstName,
              last_name: form.lastName,
              company_name: form.companyName || null,
              phone: form.mobilePhone || null,
            },
          },
        });
        if (error) {
          setServerError(error.message);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.workEmail,
          password: form.password,
        });
        if (error) {
          setServerError(error.message);
          return;
        }
      }
      const from = location.state?.from;
      const destination = typeof from === "string" && from.startsWith("/") ? from : "/portal";
      navigate(destination, { replace: true });
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailError = validateField(
      "workEmail",
      form.workEmail,
    );

    if (emailError) {
      setErrors((prev) => ({
        ...prev,
        workEmail: emailError,
      }));
      setTouched((prev) => ({
        ...prev,
        workEmail: true,
      }));
      return;
    }

    setIsSendingResetEmail(true);
    setServerError(null);
    setNotice(null);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          form.workEmail,
          {
            redirectTo: `${window.location.origin}/auth?flow=recovery`,
          },
        );

      if (error) {
        setServerError(error.message);
        return;
      }

      setNotice({
        variant: "success",
        message: `Check ${form.workEmail} for your password reset link.`,
      });
    } catch {
      setServerError(
        "We could not send a reset email. Please try again.",
      );
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleRecoverySubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!validateRecoveryForm()) return;

    setIsUpdatingRecoveryPassword(true);
    setServerError(null);
    setNotice(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: recoveryForm.newPassword,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      await supabase.auth.signOut();

      setRecoveryForm(INITIAL_RECOVERY_FORM);
      setRecoveryErrors({});
      setShowPassword(false);
      setMode("signin");
      setForm((prev) => ({
        ...prev,
        password: "",
      }));
      setNotice({
        variant: "success",
        message:
          "Password updated. Sign in with your new password.",
      });
    } catch {
      setServerError(
        "We could not update your password. Please try again.",
      );
    } finally {
      setIsUpdatingRecoveryPassword(false);
    }
  };

  const handleSSO = async (providerId: string) => {
    setSsoLoading(providerId);
    setServerError(null);
    setNotice(null);
    const providerMap: Record<string, string> = {
      google: "google",
      microsoft: "azure",
      linkedin: "linkedin_oidc",
    };
    const from = location.state?.from;
    const destination = typeof from === "string" && from.startsWith("/") ? from : "/portal";
    const redirectTo = `${window.location.origin}${destination}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: (providerMap[providerId] ?? providerId) as "google" | "azure" | "linkedin_oidc",
      options: { redirectTo },
    });
    if (error) {
      setServerError(error.message);
      setSsoLoading(null);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-white border ${
      errors[field] && touched[field]
        ? "border-red-500 focus:ring-red-500/20"
        : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
    } rounded-lg text-slate-900 placeholder-slate-400 text-sm outline-none focus:ring-4 transition-all duration-200 shadow-sm`;

  const recoveryInputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-white border ${
      recoveryErrors[field]
        ? "border-red-500 focus:ring-red-500/20"
        : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
    } rounded-lg text-slate-900 placeholder-slate-400 text-sm outline-none focus:ring-4 transition-all duration-200 shadow-sm`;

  const ssoProviders = [
    {
      id: "google",
      label: "Continue with Google",
      icon: <GoogleIcon />,
      color: "",
    },
    {
      id: "microsoft",
      label: "Continue with Microsoft",
      icon: <MicrosoftIcon />,
      color: "",
    },
    {
      id: "linkedin",
      label: "Continue with LinkedIn",
      icon: <LinkedInIcon />,
      color: "text-[#0A66C2]",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Panel - Dark Mode Brand Panel */}
      <div className="hidden md:flex md:w-[45%] lg:w-1/2 bg-gradient-to-br from-[#0F172B] via-slate-800 to-blue-950 p-10 lg:p-16 flex-col justify-between relative overflow-hidden shadow-2xl z-10">
        {/* Subtle background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Abstract glowing orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex justify-between items-center"></div>

        <div className="relative z-10 max-w-lg mx-auto mt-auto mb-auto px-[0px] pt-[48px] pb-[86px] text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight text-left">
            Elevate Your <br /> Strategic Planning
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-light mx-auto text-left">
            Join elite organizations using BKT Advisory to
            architect, execute, and scale their strategic
            initiatives with precision and clarity.
          </p>

          <div className="mt-12 flex items-center gap-4 text-slate-400 text-sm">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center overflow-hidden"
                >
                  <UserIcon
                    size={16}
                    className="text-slate-400"
                  />
                </div>
              ))}
            </div>
            <span>Trusted by forward-thinking leaders</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs mt-8">
          <div>
            &copy; {new Date().getFullYear()} BKT Advisory.
          </div>
          <div className="flex gap-4">
            <button className="hover:text-slate-300 transition-colors">
              Privacy
            </button>
            <button className="hover:text-slate-300 transition-colors">
              Terms
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-[425px]">
          {/* ── Logo ── */}
          <div className="shrink-0 mb-8 w-full flex justify-center">
            <a href="https://bktadvisory.com" className="block">
              {/* Full Logo (Desktop/Large Screens) */}
              <img
                src={BKT_FULL_LOGO}
                alt="BKT Advisory Logo"
                className="h-[52px] w-auto hidden xl:block mx-auto"
              />
              {/* Icon Logo (Tablet/Medium Screens) */}
              <img
                src={BKT_ICON_URL}
                alt="BKT Advisory"
                className="h-[52px] w-auto block xl:hidden mx-auto"
              />
            </a>
          </div>

          {/* ── Heading ── */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight text-center mx-[0px] mt-[0px] mb-[12px]">
              {mode === "signup"
                ? "Create an account"
                : mode === "recovery"
                  ? "Reset your password"
                  : "Welcome back"}
            </h2>
            <p className="text-slate-500 text-sm text-center">
              {mode === "signup"
                ? "Enter your details below to create your account and get started."
                : mode === "recovery"
                  ? "Create a new password for your account."
                  : "Enter your details below to sign in to your account."}
            </p>
          </div>

          {notice && (
            <div
              className={`mb-4 rounded-lg border p-3 text-sm ${
                notice.variant === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {notice.message}
            </div>
          )}

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {serverError}
            </div>
          )}

          {/* SSO Buttons */}
          {mode !== "recovery" && (
            <>
              <div className="space-y-3 mb-6">
                {ssoProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleSSO(provider.id)}
                    disabled={!!ssoLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm rounded-lg text-slate-700 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ssoLoading === provider.id ? (
                      <SpinnerIcon />
                    ) : (
                      <span className={provider.color}>
                        {provider.icon}
                      </span>
                    )}
                    <span>{provider.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                  or continue with email
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </>
          )}

          {/* Manual Form */}
          <form
            onSubmit={
              mode === "recovery"
                ? handleRecoverySubmit
                : handleSubmit
            }
            className="space-y-4"
            noValidate
          >
            {mode === "recovery" ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    New Password
                  </label>
                  <input
                    ref={recoveryPasswordRef}
                    type="password"
                    value={recoveryForm.newPassword}
                    onChange={(e) =>
                      handleRecoveryChange(
                        "newPassword",
                        e.target.value,
                      )
                    }
                    placeholder="Min. 8 characters"
                    className={recoveryInputClass("newPassword")}
                    disabled={isUpdatingRecoveryPassword}
                  />
                  {recoveryErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {recoveryErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={recoveryForm.confirmPassword}
                    onChange={(e) =>
                      handleRecoveryChange(
                        "confirmPassword",
                        e.target.value,
                      )
                    }
                    placeholder="Repeat your new password"
                    className={recoveryInputClass(
                      "confirmPassword",
                    )}
                    disabled={isUpdatingRecoveryPassword}
                  />
                  {recoveryErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {recoveryErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                {mode === "signup" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        First Name
                      </label>
                      <input
                        ref={firstNameRef}
                        type="text"
                        value={form.firstName}
                        onChange={(e) =>
                          handleChange(
                            "firstName",
                            e.target.value,
                          )
                        }
                        onBlur={() => handleBlur("firstName")}
                        placeholder="Brandon"
                        className={inputClass("firstName")}
                        disabled={isLoading}
                      />
                      {errors.firstName &&
                        touched.firstName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.firstName}
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) =>
                          handleChange(
                            "lastName",
                            e.target.value,
                          )
                        }
                        onBlur={() => handleBlur("lastName")}
                        placeholder="Thompson"
                        className={inputClass("lastName")}
                        disabled={isLoading}
                      />
                      {errors.lastName &&
                        touched.lastName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.lastName}
                          </p>
                        )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Work Email
                  </label>
                  <input
                    ref={mode === "signin" ? firstNameRef : undefined}
                    type="email"
                    value={form.workEmail}
                    onChange={(e) =>
                      handleChange("workEmail", e.target.value)
                    }
                    onBlur={() => handleBlur("workEmail")}
                    placeholder="brandon@acme.com"
                    className={inputClass("workEmail")}
                    disabled={isLoading || isSendingResetEmail}
                  />
                  {errors.workEmail && touched.workEmail && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.workEmail}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-600">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={
                          isSendingResetEmail || isLoading
                        }
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSendingResetEmail
                          ? "Sending…"
                          : "Forgot password?"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        handleChange("password", e.target.value)
                      }
                      onBlur={() => handleBlur("password")}
                      placeholder="Min. 8 characters"
                      className={
                        inputClass("password") + " pr-11"
                      }
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOffIcon />
                      ) : (
                        <EyeIcon />
                      )}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={
                mode === "recovery"
                  ? isUpdatingRecoveryPassword
                  : isLoading
              }
              className="w-full py-2.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
            >
              {mode === "recovery" ? (
                isUpdatingRecoveryPassword ? (
                  <>
                    <SpinnerIcon />
                    <span>Updating Password…</span>
                  </>
                ) : (
                  "Update Password"
                )
              ) : isLoading ? (
                <>
                  <SpinnerIcon />
                  <span>
                    {mode === "signup"
                      ? "Creating Account…"
                      : "Signing In…"}
                  </span>
                </>
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setErrors({});
                    setTouched({});
                    setServerError(null);
                    setNotice(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : mode === "recovery" ? (
              <>
                Back to{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setServerError(null);
                    setRecoveryErrors({});
                    setRecoveryForm(
                      INITIAL_RECOVERY_FORM,
                    );
                    setNotice(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setErrors({});
                    setTouched({});
                    setServerError(null);
                    setNotice(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </p>

          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
              <ShieldCheckIcon />
              <span>
                256-bit SSL encrypted &middot; SOC 2 compliant
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed max-w-[280px] mx-auto">
              By continuing, you agree to BKT Advisory's{" "}
              <button className="text-slate-500 hover:text-blue-600 underline transition-colors">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-slate-500 hover:text-blue-600 underline transition-colors">
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
