import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { UserIcon, BellIcon, ShieldIcon } from './PortalIcons';
import { EditProfilePanel } from './EditProfilePanel';

export type SettingsCategory = 'profile' | 'appearance' | 'notifications' | 'security';
type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  initialCategory?: SettingsCategory;
}

/* ── Inline icons not already in PortalIcons ─────────────────────────── */

const SunIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const MonitorIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const PaletteIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="10.5" r="2.5" />
    <circle cx="8.5" cy="7.5" r="2.5" />
    <circle cx="6.5" cy="12.5" r="2.5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

/* ── Sidebar nav items ───────────────────────────────────────────────── */

const categories: { key: SettingsCategory; label: string; icon: ReactNode }[] = [
  { key: 'profile', label: 'Profile', icon: <UserIcon size={18} /> },
  { key: 'appearance', label: 'Appearance', icon: <PaletteIcon size={18} /> },
  { key: 'notifications', label: 'Notifications', icon: <BellIcon size={18} /> },
  { key: 'security', label: 'Security', icon: <ShieldIcon size={18} /> },
];

/* ── Theme helpers ───────────────────────────────────────────────────── */

function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem('bkt-theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch { /* SSR / quota */ }
  return 'system';
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (mode === 'dark' || (mode === 'system' && prefersDark)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try { localStorage.setItem('bkt-theme', mode); } catch { /* quota */ }
}

/* ── Toggle switch ───────────────────────────────────────────────────── */

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

function AppearancePanel() {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => { applyTheme(theme); }, [theme]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const opts: { mode: ThemeMode; label: string; icon: ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <SunIcon size={20} /> },
    { mode: 'dark', label: 'Dark', icon: <MoonIcon size={20} /> },
    { mode: 'system', label: 'System', icon: <MonitorIcon size={20} /> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Appearance</h3>
        <p className="text-xs text-slate-500 mt-0.5">Choose how the portal looks for you.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {opts.map(o => (
          <button
            key={o.mode}
            type="button"
            onClick={() => setTheme(o.mode)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              theme === o.mode
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {o.icon}
            <span className="text-xs font-semibold">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [portalAlerts, setPortalAlerts] = useState(true);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
        <p className="text-xs text-slate-500 mt-0.5">Manage how you receive updates.</p>
      </div>
      <div className="space-y-4 divide-y divide-slate-100">
        <div className="pt-0">
          <Toggle checked={emailNotifs} onChange={setEmailNotifs} label="Email Notifications" />
          <p className="text-xs text-slate-400 mt-1 ml-0">Receive project updates and quote notifications via email.</p>
        </div>
        <div className="pt-4">
          <Toggle checked={portalAlerts} onChange={setPortalAlerts} label="Portal Alerts" />
          <p className="text-xs text-slate-400 mt-1 ml-0">Show in-app notification badges and banners.</p>
        </div>
      </div>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Security</h3>
        <p className="text-xs text-slate-500 mt-0.5">Manage your account security settings.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
        <p className="text-sm text-slate-700">Password</p>
        <p className="text-xs text-slate-500">Update your password periodically to keep your account secure.</p>
        <button
          type="button"
          className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

/* ── Panel renderer ──────────────────────────────────────────────────── */

const panels: Record<SettingsCategory, () => ReactNode> = {
  profile: EditProfilePanel,
  appearance: AppearancePanel,
  notifications: NotificationsPanel,
  security: SecurityPanel,
};

/* ── Main modal ──────────────────────────────────────────────────────── */

export function SettingsModal({ open, onClose, initialCategory = 'profile' }: SettingsModalProps) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setActiveCategory(initialCategory);
  }, [initialCategory, open]);

  if (!open) return null;

  const ActivePanel = panels[activeCategory];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Mobile tabs (visible < md) */}
        <div className="flex md:hidden border-b border-slate-200 overflow-x-auto shrink-0">
          {categories.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveCategory(c.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeCategory === c.key
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 min-h-0">
          {/* Desktop sidebar (hidden < md) */}
          <nav className="hidden md:flex flex-col w-48 border-r border-slate-200 py-3 shrink-0">
            {categories.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveCategory(c.key)}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors text-left cursor-pointer ${
                  activeCategory === c.key
                    ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {c.icon}
                {c.label}
              </button>
            ))}
          </nav>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-6">
            <ActivePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
