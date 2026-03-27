import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { usePortalProfile } from '../../contexts/PortalProfileContext';
import {
  formatPhoneNumber,
  joinFullName,
  validateAvatarFile,
  validateProfileForm,
  type ProfileFormErrors,
  type ProfileFormValues,
} from './profileUtils';

const CameraIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

function buildInitialFormValues(
  fullName: string,
  email: string,
  phone: string,
  companyName: string,
): ProfileFormValues {
  return {
    fullName,
    email,
    phone,
    companyName,
  };
}

export function EditProfilePanel() {
  const {
    profile,
    pendingEmail,
    isLoading,
    isSaving,
    error,
    refreshProfile,
    saveProfile,
  } = usePortalProfile();

  const [formValues, setFormValues] = useState<ProfileFormValues>(() =>
    buildInitialFormValues('', '', '', ''),
  );
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;

    setFormValues(
      buildInitialFormValues(
        joinFullName(profile.firstName, profile.lastName),
        pendingEmail ?? profile.email,
        profile.phone,
        profile.companyName,
      ),
    );
    setFormErrors({});
    setAvatarBroken(false);
  }, [pendingEmail, profile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function updateField<K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
    setFormErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  async function handleAvatarSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const validationMessage = await validateAvatarFile(file);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarBroken(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateProfileForm(formValues);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please correct the highlighted profile fields.');
      return;
    }

    try {
      const result = await saveProfile({
        ...formValues,
        avatarFile,
      });

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }

      setAvatarFile(null);

      if (result.emailUpdateError) {
        toast.error(`Profile details saved, but we could not update your email: ${result.emailUpdateError}`);
        return;
      }

      if (result.emailConfirmationRequired) {
        toast.success('Profile saved. Check your inbox to confirm your new email address.');
        return;
      }

      toast.success('Profile updated successfully.');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'We could not save your profile.';
      toast.error(message);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Edit Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">Loading your account details…</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Edit Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">We could not load your profile details.</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? 'Please try again.'}
        </div>
        <button
          type="button"
          onClick={() => {
            void refreshProfile();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Retry
        </button>
      </div>
    );
  }

  const displayAvatarUrl = avatarPreview ?? (avatarBroken ? null : profile.avatarUrl);
  const initials = (profile.fullName || formValues.fullName)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const inputClass =
    'w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const errorClass = 'mt-1 text-xs text-red-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Edit Profile</h3>
        <p className="text-xs text-slate-500 mt-0.5">Update your public portal details and account email.</p>
      </div>

      {!profile.hasProfileRow && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          We are still syncing your profile record. Saving again may take a moment while Supabase finishes creating it.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="relative shrink-0">
          {displayAvatarUrl ? (
            <img
              src={displayAvatarUrl}
              alt="Profile avatar"
              className="h-16 w-16 rounded-2xl object-cover shadow-sm"
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold text-white shadow-sm">
              {initials || 'B'}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            className="absolute -bottom-2 -right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Change avatar"
          >
            <CameraIcon size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{profile.fullName || 'Add your full name'}</p>
          <p className="mt-1 text-xs text-slate-500">
            Recommended image: PNG or JPEG, under 2 MB, roughly square.
          </p>
          {avatarFile && (
            <p className="mt-2 text-xs text-blue-700">
              Selected avatar: {avatarFile.name}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            value={formValues.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            placeholder="John Burkhardt"
            className={inputClass}
            disabled={isSaving}
          />
          {formErrors.fullName && <p className={errorClass}>{formErrors.fullName}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={formValues.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="john@bktadvisory.com"
            className={inputClass}
            disabled={isSaving}
          />
          {formErrors.email && <p className={errorClass}>{formErrors.email}</p>}
          {pendingEmail && (
            <p className="mt-1 text-xs text-amber-700">
              Email change pending confirmation for {pendingEmail}.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
          <input
            type="tel"
            value={formValues.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="(952) 334-6093"
            className={inputClass}
            disabled={isSaving}
          />
          {formErrors.phone && <p className={errorClass}>{formErrors.phone}</p>}
          {!formErrors.phone && profile.phone && (
            <p className="mt-1 text-xs text-slate-500">Current format: {formatPhoneNumber(profile.phone)}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Company Name</label>
          <input
            type="text"
            value={formValues.companyName}
            onChange={(event) => updateField('companyName', event.target.value)}
            placeholder="BKT Advisory"
            className={inputClass}
            disabled={isSaving}
          />
          {formErrors.companyName && <p className={errorClass}>{formErrors.companyName}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </form>
  );
}
