import { BuildingIcon, MailIcon, PhoneIcon } from './PortalIcons';
import { usePortalProfile } from '../../contexts/PortalProfileContext';
import { formatPhoneNumber } from './profileUtils';

interface UserProfileProps {
  onEditProfile: () => void;
}

export function UserProfile({ onEditProfile }: UserProfileProps) {
  const { profile, pendingEmail, isLoading, error, refreshProfile } = usePortalProfile();

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl border border-slate-700/50 bg-slate-800/50" />;
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 text-slate-200">
        <p className="text-sm text-red-300">{error ?? 'We could not load your profile.'}</p>
        <button
          type="button"
          onClick={() => {
            void refreshProfile();
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          Retry
        </button>
      </div>
    );
  }

  const initials = (profile.fullName || profile.email)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b]/50 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-5">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Profile"
              className="h-14 w-14 rounded-lg object-cover shadow-lg shadow-blue-900/20"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-900/20">
              {initials || 'B'}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-white">
                {profile.fullName || profile.email}
              </h2>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                Active
              </span>
              {!profile.hasProfileRow && (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                  Syncing profile
                </span>
              )}
            </div>

            <div className="mt-1 text-sm capitalize text-slate-400">
              {profile.role}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-300">
              {profile.companyName && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500"><BuildingIcon size={16} /></span>
                  <span>{profile.companyName}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-slate-500"><MailIcon size={16} /></span>
                <span>{pendingEmail ?? profile.email}</span>
                {pendingEmail && (
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                    Pending
                  </span>
                )}
              </div>

              {profile.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500"><PhoneIcon size={16} /></span>
                  <span>{formatPhoneNumber(profile.phone)}</span>
                </div>
              )}
            </div>

            {pendingEmail && (
              <p className="mt-3 text-xs text-amber-300">
                Confirm your new email address from your inbox to finish updating it.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Edit Profile
        </button>
      </div>
    </div>
  );
}
