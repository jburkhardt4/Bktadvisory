import { useState } from 'react';
import { Link } from 'react-router';

// Icon components to avoid lucide-react import issue
const MenuIcon = ({ size }: { size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = ({ size }: { size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RocketIcon = ({ size }: { size?: number }) => (
  <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ExternalLinkIcon = ({ size }: { size?: number }) => (
  <svg width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const UserIcon = ({ size }: { size?: number }) => (
  <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

import logo from 'figma:asset/01ab4ddf9498ad72150c22c58a71c1af4fd5772b.png';
import mobileLogo from 'figma:asset/0e0a121653cc931918711be760206409b22eeac2.png';
import { ScheduleCallButton } from './ScheduleCallButton';

export function Navigation({ 
  onNavigateToEstimator
}: { 
  onNavigateToEstimator: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#EFF6FF]/90 backdrop-blur-md border-b border-blue-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8">
        <div className="flex items-center justify-between h-[80px] flex-nowrap">

          {/* ── Logo ── */}
          <div className="shrink-0">
            <a href="https://bktadvisory.com" className="block">
              <img
                src={logo}
                alt="BKT Advisory Logo"
                className="h-[52px] w-auto hidden xl:block"
              />
              <img
                src="https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo%20(Transparent).png"
                alt="BKT Advisory"
                className="h-[52px] w-auto hidden md:block xl:hidden"
              />
              <img
                src="https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo%20(Transparent).png"
                alt="BKT Advisory"
                className="h-[52px] w-auto block md:hidden"
              />
            </a>
          </div>

          {/* ── Desktop: single-row auto-layout ── */}
          <div className="hidden lg:flex items-center flex-nowrap gap-1 xl:gap-2 ml-auto">

            {/* Nav links cluster */}
            <div className="flex items-center flex-nowrap gap-1 xl:gap-2">
              {['Work', 'Services', 'Process', 'About'].map((label) => (
                <Link
                  key={label}
                  to={`/${label.toLowerCase()}`}
                  className="whitespace-nowrap px-3 py-2 text-sm font-medium text-slate-800 hover:text-blue-700 transition-colors relative group"
                >
                  {label}
                  <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-300/70 mx-1 xl:mx-2 shrink-0" />

            {/* CTA cluster */}
            <div className="flex items-center flex-nowrap gap-2 xl:gap-3">
              <a
                href="https://estimator.bktadvisory.com"
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <RocketIcon size={14} />
                <span className="hidden xl:inline">Project Estimator</span>
                <span className="xl:hidden">Estimator</span>
                <ExternalLinkIcon size={12} />
              </a>

              <ScheduleCallButton variant="nav" />

              <Link
                to="/auth"
                className="whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-400 rounded-lg transition-all duration-200 relative group"
              >
                <UserIcon size={15} />
                Sign In
                <span className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            </div>
          </div>

          {/* ── Mobile hamburger ── */}
          <div className="lg:hidden flex items-center ml-auto">
            <Link
                to="/auth"
                className="whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 border border-slate-300 hover:border-blue-400 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-700 transition-all duration-200 py-2 mx-1 relative group"
              >
                <UserIcon size={15} />
                Sign In
                <span className="absolute bottom-1.5 left-3.5 right-3.5 h-[2px] bg-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-900 hover:text-slate-700"
            >
              {isOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-blue-100">
            <div className="flex flex-col gap-1">
              {['Work', 'Services', 'Process', 'About'].map((label) => (
                <Link
                  key={label}
                  to={`/${label.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2.5 text-slate-900 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-left text-sm font-medium"
                >
                  {label}
                </Link>
              ))}

              <div className="h-px bg-slate-200 my-2" />

              <a
                href="https://estimator.bktadvisory.com/home"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-200"
              >
                <RocketIcon size={14} />
                Project Estimator
                <ExternalLinkIcon size={12} />
              </a>

              <ScheduleCallButton />

              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
              >
                <UserIcon size={15} />
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}