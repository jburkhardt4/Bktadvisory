import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import type { Database } from '../types/supabase';
import { joinFullName, splitFullName } from '../components/portal/profileUtils';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PortalProfileRow = Pick<
  ProfileRow,
  'id' | 'first_name' | 'last_name' | 'email' | 'company_name' | 'phone' | 'avatar_url' | 'role'
>;
type ProfileRole = ProfileRow['role'];

const PROFILE_SELECT = 'id, first_name, last_name, email, company_name, phone, avatar_url, role';
const PROFILE_LOAD_ATTEMPTS = 3;
const PROFILE_RETRY_MS = 250;

export interface PortalProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  companyName: string;
  phone: string;
  role: ProfileRole;
  avatarUrl: string | null;
  hasProfileRow: boolean;
}

export interface SavePortalProfileInput {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  avatarFile?: File | null;
}

export interface SavePortalProfileResult {
  emailConfirmationRequired: boolean;
  emailUpdateError: string | null;
}

interface PortalProfileContextValue {
  profile: PortalProfile | null;
  pendingEmail: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  saveProfile: (input: SavePortalProfileInput) => Promise<SavePortalProfileResult>;
}

const PortalProfileContext = createContext<PortalProfileContextValue | null>(null);

function getFallbackRole(user: User): ProfileRole {
  return user.app_metadata?.role === 'admin' ? 'admin' : 'client';
}

function buildPortalProfile(user: User, row: PortalProfileRow | null): PortalProfile {
  const metadata = user.user_metadata ?? {};
  const firstName =
    row?.first_name ??
    (typeof metadata.first_name === 'string' ? metadata.first_name : '') ??
    '';
  const lastName =
    row?.last_name ??
    (typeof metadata.last_name === 'string' ? metadata.last_name : '') ??
    '';
  const fullNameFromMetadata = typeof metadata.full_name === 'string' ? metadata.full_name : '';
  const fullName = joinFullName(firstName, lastName) || fullNameFromMetadata.trim();

  return {
    id: user.id,
    firstName: firstName ?? '',
    lastName: lastName ?? '',
    fullName,
    email: row?.email ?? user.email ?? '',
    companyName:
      row?.company_name ??
      (typeof metadata.company_name === 'string' ? metadata.company_name : '') ??
      '',
    phone:
      row?.phone ??
      (typeof metadata.phone === 'string' ? metadata.phone : user.phone ?? '') ??
      '',
    role: row?.role ?? getFallbackRole(user),
    avatarUrl:
      row?.avatar_url ??
      (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null),
    hasProfileRow: row !== null,
  };
}

async function getAuthenticatedUser(): Promise<User> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('No authenticated user.');
  }

  return user;
}

async function fetchProfileRow(userId: string): Promise<PortalProfileRow | null> {
  for (let attempt = 0; attempt < PROFILE_LOAD_ATTEMPTS; attempt += 1) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }

    if (attempt < PROFILE_LOAD_ATTEMPTS - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, PROFILE_RETRY_MS);
      });
    }
  }

  return null;
}

async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.type === 'image/png' ? 'png' : 'jpg';
  const filePath = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}

function getFriendlyProfileError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('row-level security') || message.includes('permission denied')) {
      return 'Your profile is still syncing. Please wait a few seconds and try again.';
    }
    return error.message;
  }

  return 'We could not save your profile. Please try again.';
}

export function PortalProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await getAuthenticatedUser();
      const row = await fetchProfileRow(user.id);
      const nextProfile = buildPortalProfile(user, row);

      setProfile(nextProfile);
      setPendingEmail((currentPendingEmail) => {
        if (!currentPendingEmail) return null;

        const confirmedEmail = (row?.email ?? user.email ?? '').trim().toLowerCase();
        return currentPendingEmail.trim().toLowerCase() === confirmedEmail
          ? null
          : currentPendingEmail;
      });
    } catch (loadError) {
      const message = getFriendlyProfileError(loadError);
      setError(message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const saveProfile = useCallback(async (input: SavePortalProfileInput): Promise<SavePortalProfileResult> => {
    setIsSaving(true);
    setError(null);

    try {
      const user = await getAuthenticatedUser();
      const currentProfile = profile ?? buildPortalProfile(user, null);
      const normalizedEmail = input.email.trim().toLowerCase();
      const normalizedCompanyName = input.companyName.trim();
      const normalizedPhone = input.phone.trim();
      const { firstName, lastName } = splitFullName(input.fullName);

      let avatarUrl = currentProfile.avatarUrl;
      if (input.avatarFile) {
        avatarUrl = await uploadAvatar(user.id, input.avatarFile);
      }

      const { data: savedRow, error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: currentProfile.email || user.email || normalizedEmail,
            company_name: normalizedCompanyName || null,
            phone: normalizedPhone || null,
            avatar_url: avatarUrl,
            role: currentProfile.role || getFallbackRole(user),
          },
          { onConflict: 'id' },
        )
        .select(PROFILE_SELECT)
        .single();

      if (profileError) {
        throw new Error(getFriendlyProfileError(profileError));
      }

      let nextProfile = buildPortalProfile(user, savedRow);
      let emailConfirmationRequired = false;
      let emailUpdateError: string | null = null;
      const currentAuthEmail = (user.email ?? '').trim().toLowerCase();

      if (normalizedEmail && normalizedEmail !== currentAuthEmail) {
        const { data: authData, error: authError } = await supabase.auth.updateUser({
          email: normalizedEmail,
        });

        if (authError) {
          emailUpdateError = authError.message;
        } else {
          const updatedEmail = (authData.user?.email ?? '').trim().toLowerCase();

          if (updatedEmail === normalizedEmail) {
            nextProfile = { ...nextProfile, email: normalizedEmail };
            setPendingEmail(null);

            const { error: emailSyncError } = await supabase
              .from('profiles')
              .update({ email: normalizedEmail })
              .eq('id', user.id);

            if (emailSyncError) {
              console.warn('Profile email update is waiting on auth sync.', emailSyncError);
            }
          } else {
            emailConfirmationRequired = true;
            setPendingEmail(normalizedEmail);
          }
        }
      } else {
        nextProfile = { ...nextProfile, email: normalizedEmail || nextProfile.email };
        setPendingEmail(null);
      }

      setProfile(nextProfile);
      return { emailConfirmationRequired, emailUpdateError };
    } catch (saveError) {
      const message = getFriendlyProfileError(saveError);
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [profile]);

  const value = useMemo<PortalProfileContextValue>(() => ({
    profile,
    pendingEmail,
    isLoading,
    isSaving,
    error,
    refreshProfile,
    saveProfile,
  }), [error, isLoading, isSaving, pendingEmail, profile, refreshProfile, saveProfile]);

  return (
    <PortalProfileContext.Provider value={value}>
      {children}
    </PortalProfileContext.Provider>
  );
}

export function usePortalProfile(): PortalProfileContextValue {
  const context = useContext(PortalProfileContext);

  if (!context) {
    throw new Error('usePortalProfile must be used within a PortalProfileProvider.');
  }

  return context;
}
