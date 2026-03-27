import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../supabase/client';
import { BuildingIcon, MailIcon, PhoneIcon } from './PortalIcons';
import { EditButton } from './ActionDropdown';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string;
  company_name: string | null;
  role: string;
  phone: string | null;
  avatar_url: string | null;
}

// Utility to format raw 10-digit strings into (###) ###-####
const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return null;
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone; // Return original if it doesn't match 10 digits
};

const ALLOWED_TYPES = ['image/png', 'image/jpeg'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const MIN_DIM = 100;
const MAX_DIM = 2000;
const MIN_RATIO = 0.8;
const MAX_RATIO = 1.25;

/** Read an image file's natural dimensions. */
function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

/** Inline camera overlay icon */
const CameraIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [draft, setDraft] = useState({ first_name: '', last_name: '', company_name: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error('No user logged in');

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, company_name, role, phone, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function startEditing() {
    if (!profile) return;
    setDraft({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      company_name: profile.company_name ?? '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    // MIME check
    if (!ALLOWED_TYPES.includes(file.type)) {
      setToast({ type: 'error', message: 'Only PNG and JPEG images are allowed.' });
      return;
    }
    // Size check
    if (file.size > MAX_FILE_SIZE) {
      setToast({ type: 'error', message: 'Image must be under 2 MB.' });
      return;
    }
    // Dimension check
    try {
      const { width, height } = await readImageDimensions(file);
      if (width < MIN_DIM || height < MIN_DIM) {
        setToast({ type: 'error', message: `Image must be at least ${MIN_DIM}×${MIN_DIM} pixels.` });
        return;
      }
      if (width > MAX_DIM || height > MAX_DIM) {
        setToast({ type: 'error', message: `Image must be at most ${MAX_DIM}×${MAX_DIM} pixels.` });
        return;
      }
      const ratio = width / height;
      if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
        setToast({ type: 'error', message: 'Image should be roughly square (aspect ratio between 4:5 and 5:4).' });
        return;
      }
    } catch {
      setToast({ type: 'error', message: 'Could not read image dimensions.' });
      return;
    }

    // All good — show preview
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  }

  async function handleSaveProfile() {
    if (!profile) return;
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let newAvatarUrl: string | null = profile.avatar_url;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const ext = avatarFile.type === 'image/png' ? 'png' : 'jpg';
        const filePath = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Cache-buster so the browser picks up the new image immediately
        newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: draft.first_name || null,
          last_name: draft.last_name || null,
          company_name: draft.company_name || null,
          avatar_url: newAvatarUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({
        ...profile,
        first_name: draft.first_name || null,
        last_name: draft.last_name || null,
        company_name: draft.company_name || null,
        avatar_url: newAvatarUrl,
      });
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarBroken(false);
      setIsEditing(false);
      setToast({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err: any) {
      console.error('Error saving profile:', err.message);
      setToast({ type: 'error', message: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-32 animate-pulse bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>;
  }

  if (error || !profile) {
    return <div className="p-6 text-red-400 bg-slate-800/50 rounded-2xl border border-slate-700/50">Failed to load profile.</div>;
  }

  const inputCls =
    'w-full px-3 py-1.5 bg-slate-800/60 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';

  return (
    <div className="relative bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
      {/* Toast notification */}
      {toast && (
        <div
          className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : 'bg-red-500/15 text-red-400 border border-red-500/25'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Edit / Save / Cancel controls */}
      {!toast && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </>
          ) : (
            <EditButton onClick={startEditing} />
          )}
        </div>
      )}

      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0 group">
          {(() => {
            const displayUrl = avatarPreview ?? (avatarBroken ? null : profile.avatar_url);
            const initials = `${(isEditing ? draft.first_name[0] : profile.first_name?.[0]) || ''}${(isEditing ? draft.last_name[0] : profile.last_name?.[0]) || ''}`;

            return displayUrl ? (
              <img
                src={displayUrl}
                alt="Profile"
                className="w-14 h-14 rounded-lg object-cover shadow-lg shadow-blue-900/20"
                onError={() => { setAvatarBroken(true); }}
              />
            ) : (
              <div className="w-14 h-14 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/20">
                {initials}
              </div>
            );
          })()}

          {/* Upload overlay (edit mode only) */}
          {isEditing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Change photo"
            >
              <CameraIcon />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            /* ── Editing state ────────────────────────────── */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">First Name</label>
                  <input
                    type="text"
                    value={draft.first_name}
                    onChange={e => setDraft(d => ({ ...d, first_name: e.target.value }))}
                    placeholder="First name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    value={draft.last_name}
                    onChange={e => setDraft(d => ({ ...d, last_name: e.target.value }))}
                    placeholder="Last name"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Company</label>
                <input
                  type="text"
                  value={draft.company_name}
                  onChange={e => setDraft(d => ({ ...d, company_name: e.target.value }))}
                  placeholder="Company name"
                  className={inputCls}
                />
              </div>
            </div>
          ) : (
            /* ── Read-only state ──────────────────────────── */
            <>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">
                  {profile.first_name} {profile.last_name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div className="text-slate-400 text-sm mt-1 capitalize">
                {profile.role}
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-slate-300">
                {profile.company_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500"><BuildingIcon size={16} /></span>
                    <span>{profile.company_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500"><MailIcon size={16} /></span>
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500"><PhoneIcon size={16} /></span>
                    <span>{formatPhoneNumber(profile.phone)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}