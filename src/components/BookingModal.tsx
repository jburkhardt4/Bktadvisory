import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cal, { getCalApi } from '@calcom/embed-react';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  calLink: string; // e.g. "jb-burkhardt/intro-call"
  title: string;
  duration: string;
  description: string;
}

/**
 * BKT-branded booking modal wrapping the Cal.com embed.
 *
 * Theming strategy:
 *  - `getCalApi().then(cal => cal('ui', { cssVarsPerTheme: {...} }))` remaps the
 *    Cal.com design tokens to our BKT slate/blue palette so the iframe visually
 *    blends with the rest of the site.
 *  - Shell (header, backdrop, close) is entirely native — only the time picker
 *    itself is Cal.com.
 */
export function BookingModal({ open, onClose, calLink, title, duration, description }: BookingModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
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

  // Apply BKT brand tokens to the Cal embed iframe
  useEffect(() => {
    if (!open) return;
    (async () => {
      const cal = await getCalApi();
      cal('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
        cssVarsPerTheme: {
          light: {
            'cal-brand': '#2563eb', // blue-600
            'cal-text': '#0f172a', // slate-900
            'cal-text-emphasis': '#020617', // slate-950
            'cal-text-muted': '#64748b', // slate-500
            'cal-text-subtle': '#94a3b8', // slate-400
            'cal-bg': '#ffffff',
            'cal-bg-emphasis': '#f8fafc', // slate-50
            'cal-bg-muted': '#f1f5f9', // slate-100
            'cal-bg-subtle': '#e2e8f0', // slate-200
            'cal-border': '#e2e8f0', // slate-200
            'cal-border-subtle': '#f1f5f9', // slate-100
            'cal-border-emphasis': '#cbd5e1', // slate-300
            'cal-border-booker': '#e2e8f0',
          },
          dark: {
            'cal-brand': '#3b82f6', // blue-500 — slightly brighter for dark contrast
            'cal-text': '#f8fafc', // slate-50
            'cal-text-emphasis': '#ffffff',
            'cal-text-muted': '#94a3b8', // slate-400
            'cal-text-subtle': '#64748b', // slate-500
            'cal-bg': '#0f172a', // slate-900 — matches modal surface
            'cal-bg-emphasis': '#1e293b', // slate-800
            'cal-bg-muted': '#1e293b', // slate-800
            'cal-bg-subtle': '#334155', // slate-700
            'cal-border': '#1e293b', // slate-800
            'cal-border-subtle': '#0f172a',
            'cal-border-emphasis': '#334155', // slate-700
            'cal-border-booker': '#1e293b',
          },
        },
      });
    })();
  }, [open]);

  if (!open) return null;

  // Detect current theme so the embed mounts in the correct mode
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-slate-950/70 p-0 backdrop-blur-md sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${title}`}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-auto sm:max-h-[92vh] sm:max-w-[920px] sm:rounded-2xl sm:border sm:border-slate-200 sm:dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — native BKT branding */}
        <div className="relative flex-shrink-0 border-b border-slate-200 bg-gradient-to-br from-[#0F172B] via-slate-900 to-blue-950 px-6 py-5 dark:border-slate-800">
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close booking dialog"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <CloseIcon />
          </button>

          <div className="flex items-start gap-4 pr-12">
            <img
              src="https://lh3.googleusercontent.com/a-/ALV-UjUKsVkb4rL7QwPkEtDwipBhlu3deHrsCazzdAfDDA_HQI9kdPI=s112-c-mo"
              alt="John Burkhardt"
              className="h-14 w-14 flex-shrink-0 rounded-full object-cover ring-2 ring-blue-500/40"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
                {duration}
              </p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50 sm:text-2xl">
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Cal.com embed */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
          <Cal
            calLink={calLink}
            style={{ width: '100%', height: '100%', minHeight: '620px', overflow: 'scroll' }}
            config={{
              layout: 'month_view',
              theme: isDark ? 'dark' : 'light',
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
