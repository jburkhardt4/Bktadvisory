import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Cal, { getCalApi } from '@calcom/embed-react';

// ── Cal.com account linkage ──────────────────────────────────────────
// Replace with your actual Cal.com username once the account is configured.
// Set VITE_CAL_USERNAME in .env.local to override without a code change.
const CAL_USERNAME =
  (import.meta.env.VITE_CAL_USERNAME as string | undefined) || 'bktadvisory';

export interface CalEventType {
  title: string;
  slug: string; // e.g. "intro-call-15"
  duration: string;
}

interface BookingModalProps {
  open: boolean;
  eventType: CalEventType | null;
  onClose: () => void;
}

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function BookingModal({ open, eventType, onClose }: BookingModalProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Apply BKT-brand tokens to Cal.com embed when it mounts / changes
  useEffect(() => {
    if (!open || !eventType) return;

    let cancelled = false;
    (async () => {
      try {
        const cal = await getCalApi();
        if (cancelled) return;

        // Brand the embed (light + dark)
        cal('ui', {
          theme: 'auto',
          cssVarsPerTheme: {
            light: {
              'cal-brand': '#2563eb', // blue-600
              'cal-text': '#0f172a',
              'cal-text-emphasis': '#0f172a',
              'cal-text-muted': '#64748b',
              'cal-bg': '#ffffff',
              'cal-bg-emphasis': '#f1f5f9',
              'cal-bg-muted': '#f8fafc',
              'cal-border': '#e2e8f0',
              'cal-border-subtle': '#f1f5f9',
              'cal-border-booker': '#e2e8f0',
              'cal-border-emphasis': '#cbd5e1',
            },
            dark: {
              'cal-brand': '#3b82f6', // blue-500 — brighter on dark
              'cal-text': '#f8fafc',
              'cal-text-emphasis': '#ffffff',
              'cal-text-muted': '#94a3b8',
              'cal-bg': '#0f172a', // slate-900
              'cal-bg-emphasis': '#1e293b', // slate-800
              'cal-bg-muted': '#0b1220',
              'cal-border': '#1e293b', // slate-800
              'cal-border-subtle': '#0b1220',
              'cal-border-booker': '#1e293b',
              'cal-border-emphasis': '#334155',
            },
          },
          hideEventTypeDetails: false,
          layout: 'month_view',
        });
      } catch {
        // swallow — the embed will still render with defaults
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, eventType]);

  if (!open || !eventType) return null;

  const calLink = `${CAL_USERNAME}/${eventType.slug}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${eventType.title}`}
    >
      <div
        ref={surfaceRef}
        className="relative flex w-full max-w-[1080px] flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-[0_28px_60px_rgba(0,0,0,0.34)] sm:rounded-2xl dark:border-slate-800 dark:bg-slate-950"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#0F172B] via-slate-900 to-blue-950 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/a-/ALV-UjUKsVkb4rL7QwPkEtDwipBhlu3deHrsCazzdAfDDA_HQI9kdPI=s112-c-mo"
              alt="John Burkhardt"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/40"
            />
            <div>
              <p className="text-sm font-semibold text-slate-50">John "JB" Burkhardt</p>
              <p className="text-xs text-slate-400">{eventType.title} · {eventType.duration}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-white/5 text-slate-300 transition-colors hover:border-blue-500/50 hover:bg-white/10 hover:text-slate-50"
          >
            <XIcon />
          </button>
        </div>

        {/* ── Cal.com embed ──────────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto bg-white dark:bg-slate-950">
          <Cal
            namespace={eventType.slug}
            calLink={calLink}
            style={{ width: '100%', height: '100%', minHeight: '640px', overflow: 'scroll' }}
            config={{ layout: 'month_view', theme: 'auto' }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
