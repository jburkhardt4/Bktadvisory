import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase/client';

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const INITIAL_VALUES: PasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function validatePasswordForm(values: PasswordFormValues): PasswordFormErrors {
  const errors: PasswordFormErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = 'Enter your current password.';
  }

  if (!values.newPassword) {
    errors.newPassword = 'Enter a new password.';
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'New password must be at least 8 characters.';
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = 'Choose a password you are not already using.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your new password.';
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = 'New passwords must match.';
  }

  return errors;
}

export function AccountSecurityPanel() {
  const { session } = useAuth();
  const [formValues, setFormValues] = useState<PasswordFormValues>(INITIAL_VALUES);
  const [formErrors, setFormErrors] = useState<PasswordFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const accountEmail = session?.user?.email ?? '';

  function updateField<K extends keyof PasswordFormValues>(
    field: K,
    value: PasswordFormValues[K],
  ) {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
    setFormErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validatePasswordForm(formValues);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please correct the highlighted password fields.');
      return;
    }

    if (!accountEmail) {
      toast.error('We could not verify your account email. Please sign in again.');
      return;
    }

    setIsSaving(true);

    try {
      // Verify the current password first so the user re-authenticates before updateUser runs.
      // If you enable Supabase's "Secure password change" setting in the email provider settings,
      // older sessions can still require the nonce-based reauthentication flow described in the docs.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: accountEmail,
        password: formValues.currentPassword,
      });

      if (verifyError) {
        setFormErrors((currentErrors) => ({
          ...currentErrors,
          currentPassword: 'Current password is incorrect.',
        }));
        toast.error('Current password is incorrect.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: formValues.newPassword,
      });

      if (updateError) {
        const needsExtraReauth = /nonce|reauth|recent/i.test(updateError.message);
        if (needsExtraReauth) {
          toast.error(
            'Supabase requested extra re-authentication before changing your password. Sign in again and retry after enabling the secure password change setting if needed.',
          );
          return;
        }

        toast.error(updateError.message);
        return;
      }

      setFormValues(INITIAL_VALUES);
      setFormErrors({});
      toast.success('Password updated successfully.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not update your password. Please try again.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400';
  const errorClass = 'mt-1 text-xs text-red-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Security</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Update your password for {accountEmail || 'your account'}.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
        For production, enable Supabase&apos;s <span className="font-semibold">Secure password change</span> option in your email provider settings if you want older sessions to require extra re-authentication before a password update.
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Current Password
          </label>
          <input
            id="current-password"
            type="password"
            value={formValues.currentPassword}
            onChange={(event) => updateField('currentPassword', event.target.value)}
            autoComplete="current-password"
            className={inputClass}
            disabled={isSaving}
          />
          {formErrors.currentPassword && (
            <p className={errorClass}>{formErrors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={formValues.newPassword}
            onChange={(event) => updateField('newPassword', event.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={inputClass}
            disabled={isSaving}
          />
          {formErrors.newPassword && (
            <p className={errorClass}>{formErrors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Confirm New Password
          </label>
          <input
            id="confirm-new-password"
            type="password"
            value={formValues.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
            autoComplete="new-password"
            className={inputClass}
            disabled={isSaving}
          />
          {formErrors.confirmPassword && (
            <p className={errorClass}>{formErrors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="bkt-primary-button disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Updating…
            </>
          ) : (
            'Change Password'
          )}
        </button>
      </div>
    </form>
  );
}
