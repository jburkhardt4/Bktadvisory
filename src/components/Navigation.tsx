import { useState } from 'react';

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

import logo from 'figma:asset/01ab4ddf9498ad72150c22c58a71c1af4fd5772b.png';
import mobileLogo from 'figma:asset/0e0a121653cc931918711be760206409b22eeac2.png';
import { ScheduleCallButton } from './ScheduleCallButton';

export function Navigation({ 
  onNavigateToEstimator
}: { 
  onNavigateToEstimator: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#EFF6FF]/90 backdrop-blur-md border-b border-blue-100 px-[20px] py-[0px]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[116px]">
          {/* Logo - always top-left on all viewports */}
          <div className="py-4 shrink-0">
            <a href="https://bktadvisory.com" className="block">
              <img
                src={logo}
                alt="BKT Advisory Logo"
                className="h-[68px] w-auto hidden xl:block"
              />
              <img
                src="https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo%20(Transparent).png"
                alt="BKT Advisory"
                className="h-[70px] w-auto hidden md:block xl:hidden"
              />
              <img
                src="https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo%20(Transparent).png"
                alt="BKT Advisory"
                className="h-[70px] w-auto block md:hidden"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="https://bktadvisory.com/#work" className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              Work
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="https://bktadvisory.com/#services" className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              Services
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="https://bktadvisory.com/#process" className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              Process
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="https://bktadvisory.com/#about" className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="https://estimator.bktadvisory.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <RocketIcon size={16} />
              Project Estimator
              <ExternalLinkIcon size={14} />
            </a>
            <ScheduleCallButton variant="nav" />
          </div>

          {/* Tablet Navigation (md to lg) - only icon logo, no nav links */}

          {/* Mobile: hamburger (right-anchored) */}
          <div className="lg:hidden flex items-center ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-900 hover:text-slate-700"
            >
              {isOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-blue-100">
            <div className="flex flex-col gap-4">
              <a href="https://bktadvisory.com/#work" className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                Work
              </a>
              <a href="https://bktadvisory.com/#services" className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                Services
              </a>
              <a href="https://bktadvisory.com/#process" className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                Process
              </a>
              <a href="https://bktadvisory.com/#about" className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                About
              </a>
              <a href="https://estimator.bktadvisory.com" className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <RocketIcon size={16} />
                Project Estimator
                <ExternalLinkIcon size={14} />
              </a>
              <ScheduleCallButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}