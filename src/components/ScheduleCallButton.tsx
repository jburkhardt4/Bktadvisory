import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ScheduleCallButtonProps {
  variant?: 'primary' | 'secondary' | 'nav' | 'footer';
  className?: string;
  children?: React.ReactNode;
}

export function ScheduleCallButton({ 
  variant = 'primary', 
  className = '',
  children = 'Schedule Strategy Call'
}: ScheduleCallButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [showBookingFrame, setShowBookingFrame] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const getButtonClass = () => {
    const baseClass = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
    
    switch (variant) {
      case 'nav':
        return `${baseClass} whitespace-nowrap px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm shadow-sm hover:from-blue-700 hover:to-indigo-700 hover:shadow-[0_0_30px_rgba(29,78,216,0.38)] hover:scale-[1.02] active:scale-[0.98] ${className}`;
      case 'footer':
        return `${baseClass} px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm shadow-sm hover:from-blue-700 hover:to-indigo-700 ${className}`;
      case 'secondary':
        return `${baseClass} px-8 py-4 bg-transparent border border-white/20 text-slate-50 backdrop-blur-xl hover:bg-white/10 hover:border-white/30 ${className}`;
      case 'primary':
      default:
        return `${baseClass} px-6 py-3 bg-blue-50 text-slate-900 shadow-lg hover:shadow-[0_0_30px_rgba(239,246,255,0.6)] dark:bg-white/10 dark:text-slate-50 dark:hover:bg-white/15 ${className}`;
    }
  };

  const openBooking = (url: string) => {
    setSelectedDuration(url);
    setShowBookingFrame(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowBookingFrame(false);
    setSelectedDuration(null);
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className={getButtonClass()}
      >
        {children}
      </button>

      {/* Main Modal - Rendered as Portal at document body level */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-slate-950/70"
          onClick={closeModal}
        >
          <div 
            className="bkt-shell-surface w-full max-w-[800px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {!showBookingFrame ? (
              <>
                {/* Header */}
                <div className="relative border-b border-slate-200 p-6 text-center dark:border-slate-800">
                  <img
                    src="https://bktadvisory.com/assets/01ab4ddf9498ad72150c22c58a71c1af4fd5772b-DOsu0GN4.png"
                    alt="BKT Advisory"
                    className="bkt-custom-logo absolute left-[45px] top-6 hidden h-[46px] w-auto sm:block"
                  />
                  <img
                    alt="John Burkhardt"
                    src="https://lh3.googleusercontent.com/a-/ALV-UjUKsVkb4rL7QwPkEtDwipBhlu3deHrsCazzdAfDDA_HQI9kdPI=s112-c-mo"
                    className="mx-auto mb-2 block h-16 w-16 rounded-full object-cover"
                  />
                  <h2 className="mb-1 text-2xl font-normal text-slate-900 dark:text-slate-50">John Burkhardt</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Appointments</p>
                </div>

                {/* Service Cards */}
                <div className="flex flex-wrap justify-center gap-[28px] px-[45px] py-6">
                  {/* 15-Min Discovery */}
                  <div
                    onClick={() => openBooking('https://calendar.app.google/26nkEZE18gENpuGo8')}
                    className="relative flex h-[115px] w-full flex-col justify-between rounded-lg border border-slate-300 bg-white p-4 transition-all duration-300 cursor-pointer hover:border-blue-200 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-blue-500/30 sm:w-[215px]"
                  >
                    <h3 className="mb-2 text-lg font-normal text-slate-900 dark:text-slate-50">Discovery Call</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <svg className="w-4 h-4" viewBox="0 -960 960 960" fill="currentColor">
                          <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                        </svg>
                        <span> 15 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <img 
                          src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" 
                          className="w-4 h-4" 
                          alt="Google Meet"
                        />
                        <span>Google Meet</span>
                      </div>
                    </div>
                  </div>

                  {/* 30-Min Strategy */}
                  <div
                    onClick={() => openBooking('https://calendar.app.google/ybjY5qL32semyiJ88')}
                    className="relative flex h-[115px] w-full flex-col justify-between rounded-lg border border-slate-300 bg-white p-4 transition-all duration-300 cursor-pointer hover:border-blue-200 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-blue-500/30 sm:w-[215px]"
                  >
                    <h3 className="mb-2 text-lg font-normal text-slate-900 dark:text-slate-50">Strategic Planning</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <svg className="w-4 h-4" viewBox="0 -960 960 960" fill="currentColor">
                          <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                        </svg>
                        <span> 30 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <img 
                          src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" 
                          className="w-4 h-4" 
                          alt="Google Meet"
                        />
                        <span>Google Meet</span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Hr Deep Dive */}
                  <div
                    onClick={() => openBooking('https://calendar.app.google/SDquXNuRq74gJFq46')}
                    className="relative flex h-[115px] w-full flex-col justify-between rounded-lg border border-slate-300 bg-white p-4 transition-all duration-300 cursor-pointer hover:border-blue-200 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-blue-500/30 sm:w-[215px]"
                  >
                    <h3 className="mb-2 text-lg font-normal text-slate-900 dark:text-slate-50">Workshop</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <svg className="w-4 h-4" viewBox="0 -960 960 960" fill="currentColor">
                          <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                        </svg>
                        <span> 60 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <img 
                          src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" 
                          className="w-4 h-4" 
                          alt="Google Meet"
                        />
                        <span>Google Meet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end border-t border-slate-200 p-4 dark:border-slate-800">
                  <button
                    onClick={closeModal}
                    className="bkt-secondary-button"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Booking Frame View */}
                <div className="relative flex h-[80vh] max-h-[800px] items-center justify-center p-6">
                  {/* Back Button */}
                  <button
                    onClick={() => setShowBookingFrame(false)}
                    className="bkt-icon-button absolute left-3 top-3 z-10 h-8 w-8 rounded-full bg-white shadow-lg dark:bg-slate-900"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="bkt-icon-button absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-white text-2xl font-bold shadow-lg dark:bg-slate-900"
                  >
                    ×
                  </button>
                  <iframe
                    src={selectedDuration || ''}
                    className="w-full h-full border-0 rounded-2xl"
                    title="Google Calendar Booking"
                  />
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Type declaration for window.calendar (kept for compatibility)
declare global {
  interface Window {
    calendar?: {
      schedulingButton?: {
        load: (config: {
          url: string;
          color: string;
          label: string;
          target: HTMLElement;
        }) => void;
      };
    };
  }
}
