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
    const baseClass = 'font-medium rounded-lg cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2';
    
    switch (variant) {
      case 'nav':
        return `${baseClass} whitespace-nowrap px-3.5 py-2 bg-blue-700 text-white text-sm hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(29,78,216,0.5)] hover:scale-[1.02] active:scale-[0.98] ${className}`;
      case 'footer':
        return `${baseClass} px-5 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 ${className}`;
      case 'secondary':
        return `${baseClass} px-8 py-4 bg-transparent border-2 border-white/20 text-slate-50 backdrop-blur-xl hover:bg-white/10 hover:border-white/30 ${className}`;
      case 'primary':
      default:
        return `${baseClass} px-6 py-3 bg-[#EFF6FF] text-slate-900 shadow-lg hover:shadow-[0_0_30px_rgba(239,246,255,0.6)] ${className}`;
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
          className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {!showBookingFrame ? (
              <>
                {/* Header */}
                <div className="flex flex-col items-center p-6 text-center border-b border-slate-200 m-[0px] mt-[0px] mr-[0px] mb-[0px] ml-[31px]">
                  <img 
                    alt="John Burkhardt" 
                    src="https://lh3.googleusercontent.com/a-/ALV-UjUKsVkb4rL7QwPkEtDwipBhlu3deHrsCazzdAfDDA_HQI9kdPI=s112-c-mo" 
                    className="rounded-full w-16 h-16 object-cover mb-2"
                  />
                  <h2 className="text-2xl font-normal text-slate-900 mb-1">John Burkhardt</h2>
                  <p className="text-sm text-slate-600">Appointments</p>
                </div>

                {/* Service Cards */}
                <div className="p-6 flex flex-wrap gap-4 justify-center">
                  {/* 15-Min Discovery */}
                  <div
                    onClick={() => openBooking('https://calendar.app.google/26nkEZE18gENpuGo8')}
                    className="relative flex flex-col justify-between w-[215px] h-[115px] bg-white border border-slate-300 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                  >
                    <h3 className="text-lg font-normal text-slate-900 mb-2">Discovery Call</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <svg className="w-4 h-4" viewBox="0 -960 960 960" fill="currentColor">
                          <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                        </svg>
                        <span> 15 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
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
                    className="relative flex flex-col justify-between w-[215px] h-[115px] bg-white border border-slate-300 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                  >
                    <h3 className="text-lg font-normal text-slate-900 mb-2">Strategic Planning</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <svg className="w-4 h-4" viewBox="0 -960 960 960" fill="currentColor">
                          <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                        </svg>
                        <span> 30 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
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
                    className="relative flex flex-col justify-between w-[215px] h-[115px] bg-white border border-slate-300 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                  >
                    <h3 className="text-lg font-normal text-slate-900 mb-2">Workshop</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <svg className="w-4 h-4" viewBox="0 -960 960 960" fill="currentColor">
                          <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                        </svg>
                        <span> 60 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
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
                <div className="p-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Booking Frame View */}
                <div className="relative h-[800px] flex items-center justify-center p-6">
                  {/* Back Button */}
                  <button
                    onClick={() => setShowBookingFrame(false)}
                    className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors text-slate-600"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors text-slate-600 text-2xl font-bold"
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