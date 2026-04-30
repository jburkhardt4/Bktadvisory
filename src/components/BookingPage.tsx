import { useState } from 'react';
import { BookingModal } from './BookingModal';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — replace `CAL_USERNAME` with your Cal.com username and adjust the
// event-type slugs to match the ones created in your Cal.com dashboard.
//
//   Cal link format: `<username>/<event-type-slug>`
//   Example:        "jb-burkhardt/intro-call"
// ─────────────────────────────────────────────────────────────────────────────
const CAL_USERNAME = 'john-burkhardt';

const BKT_LOGO =
  'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Portal%20Horizontal_White%20(Dark%20Theme)%20-%20HD.png';
const HEADSHOT =
  'https://lh3.googleusercontent.com/a-/ALV-UjUKsVkb4rL7QwPkEtDwipBhlu3deHrsCazzdAfDDA_HQI9kdPI=s112-c-mo';
const MEET_LOGO =
  'https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg';
const TIMELAPSE_HD =
  'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/Timelapse%20-%20White-Transparent%20HD.PNG';

interface Appointment {
  id: string;
  title: string;
  duration: string;
  description: string;
  slug: string;
  accent: string;
}

const appointments: Appointment[] = [
  {
    id: 'intro',
    title: 'Intro Call',
    duration: '15 min',
    description:
      'A quick introduction to learn about your role and the opportunity.',
    slug: 'intro-call',
    accent: 'from-[#172554] to-[#172554]',
  },
  {
    id: 'interview-30',
    title: '30-Minute Interview',
    duration: '30 min',
    description:
      'A focused conversation covering background, experience, and alignment with the position.',
    slug: '30-minute-interview',
    accent: 'from-[#3d35b8] to-[#3d35b8]',
  },
  {
    id: 'interview-60',
    title: '1-Hour Interview',
    duration: '60 min',
    description:
      'An in-depth discussion including technical depth, portfolio walkthrough, and cultural-fit assessment.',
    slug: '1-hour-interview',
    accent: 'from-violet-500 to-violet-600',
  },
];

// ── Icon helpers (no lucide-react) ──────────────────────────────────────────
<<<<<<< HEAD

=======
>>>>>>> 59bdfe53027286d76bcb57dc84792b0975baa306
const PhoneIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13.93a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 3.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const LinkedinIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const MailIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const UpworkIcon = () => (
  <img
    src="https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/upwork-white.svg"
    onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/upwork-white-transparent-256.png'; }}
    alt=""
    className="h-4 w-4 object-contain"
    aria-hidden="true"
  />
);
const TrailheadIcon = () => (
  <img
    src="https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/trailhead-white-outline.svg"
    onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/trailhead-white-outline-transparent-256.png'; }}
    alt=""
    className="h-4 w-4 object-contain"
    aria-hidden="true"
  />
);

export function BookingPage() {
  const [active, setActive] = useState<Appointment | null>(null);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172B] via-slate-900 to-blue-950 pt-9 pb-5 lg:pt-12 lg:pb-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[780px] px-6 text-center lg:px-8">
          {/* Logo */}
          <div className="mb-10 flex justify-center">
            <a href="https://bktadvisory.com" target="_blank" rel="noopener noreferrer">
              <img src={BKT_LOGO} alt="BKT Advisory" className="h-12 w-auto md:h-16" />
            </a>
          </div>

          {/* Headshot */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <img
                src={HEADSHOT}
                alt="John Burkhardt"
                className="h-24 w-24 rounded-full object-cover shadow-[0_0_32px_rgba(59,130,246,0.25)] ring-4 ring-blue-500/40"
              />
              <span
                className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-[#0F172B]"
                aria-hidden="true"
              />
            </div>
          </div>

          <h1 className="mb-1 text-[40px] font-normal tracking-tight text-slate-50">
            John Burkhardt
          </h1>
          <p className="mb-4 text-lg font-medium text-slate-300">
            Salesforce &amp; AI Systems Architect | Founder
          </p>
          <div className="mx-auto mt-2 mb-5 h-px w-[100px] bg-blue-400"></div>
          <div className="mt-10 mb-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:john@bktadvisory.com"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm transition-colors hover:border-blue-500/50"
            >
              <span className="text-slate-300 group-hover:text-slate-300"><MailIcon /></span>
              <span className="group-hover:text-blue-400">
                <span className="md:hidden">Email</span>
                <span className="hidden md:inline">john@bktadvisory.com</span>
              </span>
            </a>
            <a
              href="https://linkedin.com/in/johndavisburkhardt"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm transition-colors hover:border-blue-500/50"
            >
              <span className="text-slate-300 group-hover:text-slate-300"><LinkedinIcon /></span>
              <span className="group-hover:text-blue-400">LinkedIn</span>
            </a>
            <a
              href="https://www.upwork.com/freelancers/~01dd56d750898225c0"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm transition-colors hover:border-blue-500/50"
            >
              <UpworkIcon />
              <span className="group-hover:text-blue-400">Upwork</span>
            </a>
            <a
              href="https://www.salesforce.com/trailblazer/profile"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm transition-colors hover:border-blue-500/50"
            >
              <TrailheadIcon />
              <span className="group-hover:text-blue-400">Trailhead</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Cards ─────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 pt-8 pb-16 dark:bg-[#0a0f1e] lg:pt-10 lg:pb-24">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 lg:text-3xl">
              Schedule an Interview
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
              Select the meeting type below. Please pick a time that works with your schedule.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {appointments.map((appt) => (
              <button
                key={appt.id}
                type="button"
                onClick={() => setActive(appt)}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(37,99,235,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/30 dark:hover:shadow-[0_12px_40px_rgba(37,99,235,0.18)] dark:focus-visible:ring-offset-[#0a0f1e]"
              >
                <span
                  className={`mb-4 inline-flex w-fit items-center rounded-full bg-gradient-to-r ${appt.accent} px-3 py-1 text-xs font-semibold text-white shadow-sm`}
                >
<<<<<<< HEAD
=======
                  <img src={TIMELAPSE_HD} alt="" className="h-4 w-4 object-contain" aria-hidden="true" />
>>>>>>> 59bdfe53027286d76bcb57dc84792b0975baa306
                  {appt.duration}
                </span>

                <h3 className="mb-2 text-xl font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-50 dark:group-hover:text-blue-400">
                  {appt.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {appt.description}
                </p>

                {appt.id === 'intro' && (
                  <div className="mt-5 flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <PhoneIcon />
                    <span className="text-xs">Phone</span>
                  </div>
                )}
                <div className={`${appt.id === 'intro' ? 'mt-2' : 'mt-5'} flex items-center gap-1.5`}>
                  <img src={MEET_LOGO} alt="Google Meet" className="h-4 w-4" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">Google Meet</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                    Book this slot
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                    <ArrowRightIcon />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-600">
            All meetings are conducted via Google Meet.
          </p>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-600">
<<<<<<< HEAD
            © 2026 BKT Advisory. All rights reserved.
=======
            © {new Date().getFullYear()} BKT Advisory. All rights reserved.
>>>>>>> 59bdfe53027286d76bcb57dc84792b0975baa306
          </p>
        </div>
      </section>

      {/* ── Booking Modal ─────────────────────────────────────────────── */}
      <BookingModal
        open={active !== null}
        onClose={() => setActive(null)}
        calLink={active ? `${CAL_USERNAME}/${active.slug}` : ''}
        title={active?.title ?? ''}
        duration={active?.duration ?? ''}
        description={active?.description ?? ''}
      />
    </>
  );
}
