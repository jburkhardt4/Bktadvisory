// Icon components to avoid lucide-react import issue
const MailIcon = ({ size }: { size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LinkedinIcon = ({ size }: { size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

import { ScheduleCallButton } from './ScheduleCallButton';
import { ReviewCard, reviews } from './Reviews';

export function FinalCTA() {
  return (
    <section id="contact" className="bg-[#f8f9fb] py-20 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* 3-column layout: Review | CTA | Review on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_1fr] gap-8 items-start">
          {/* Left Review Card */}
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Verified on Upwork</p>
            <ReviewCard review={reviews[0]} />
          </div>

          {/* Center Blue CTA Container */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-8 py-16 lg:px-12 lg:py-20 text-center">
            <div className="space-y-8">
              {/* Headline */}
              <div className="space-y-4">
                <h2 className="text-white">
                  Ready to Build a Predictable Growth Engine?
                </h2>
                <p className="text-blue-100 max-w-2xl mx-auto">
                  Book a 30-minute strategy call to discuss your Salesforce and AI stack. 
                  We'll assess your current setup, identify quick wins, and outline a roadmap 
                  for turning your CRM and AI investments into measurable growth.
                </p>
              </div>

              {/* Primary CTA */}
              <div>
                <ScheduleCallButton />
              </div>

              {/* Contact Options */}
              <div className="pt-8 border-t border-blue-500">
                <p className="text-sm text-blue-100 mb-4">Or reach out directly:</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a 
                    href="mailto:john@bktadvisory.com" 
                    className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
                  >
                    <MailIcon size={18} />
                    <span>john@bktadvisory.com</span>
                  </a>
                  <span className="hidden sm:inline text-blue-400">•</span>
                  <a 
                    href="https://linkedin.com/in/johnburkhardt" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
                  >
                    <LinkedinIcon size={18} />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Review Card */}
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Verified on Upwork</p>
            <ReviewCard review={reviews[1]} />
          </div>

          {/* Mobile: Show both reviews below CTA */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Verified on Upwork</p>
              <ReviewCard review={reviews[0]} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Verified on Upwork</p>
              <ReviewCard review={reviews[1]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}