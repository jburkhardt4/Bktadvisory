// Icon components to avoid lucide-react import issue
const AwardIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const BriefcaseIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const TrendingUpIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

import headshot from 'figma:asset/2db40784bd77d5bad84a04e4e645b0c1f3c7d8bf.png';
import { ScheduleCallButton } from './ScheduleCallButton';

export function About() {
  const highlights = [
    {
      icon: AwardIcon,
      title: '5x Salesforce Certified',
      description: 'Deep expertise across Sales Cloud, Service Cloud, and Financial Services Cloud'
    },
    {
      icon: BriefcaseIcon,
      title: 'Closed $837M+ in Multifamily Real Estate',
      description: 'Led Due Diligence projects at Carter Funds, closing major transactions across multifamily portfolios'
    },
    {
      icon: TrendingUpIcon,
      title: 'Strategy + Implementation',
      description: 'Unique blend of architectural vision and hands-on execution capabilities'
    }
  ];

  return (
    <section id="about" className="bg-neutral-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-neutral-900 mb-4 text-[24px] font-bold">About Me</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Salesforce & AI Systems Architect helping companies build predictable growth engines
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">
          {/* Left: Headshot */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src={headshot} 
                alt="John 'JB' Burkhardt" 
                className="rounded-2xl w-full max-w-md shadow-xl"
              />
            </div>
          </div>

          {/* Right: Bio */}
          <div className="space-y-6">
            <div className="space-y-4 text-neutral-600">
              <p>
                I'm John "JB" Burkhardt, founder of BKT Advisory. I help Startups, FinTech, and 
                InsurTech companies transform their revenue operations through strategic Salesforce 
                architecture and AI-powered systems.
              </p>
              <p>
                With 5x Salesforce certifications and a background managing $837M+ in multifamily 
                real estate transactions at Carter Funds, I bring a unique perspective that combines 
                enterprise-grade technical architecture with real-world deal execution experience.
              </p>
              <p>
                My approach isn't just about implementing technology—it's about architecting systems 
                that create predictable, scalable growth. From CRM foundations to AI agent orchestration, 
                I build solutions that compress sales cycles, accelerate pipeline velocity, and deliver 
                measurable ROI.
              </p>
              <p>
                Whether you're scaling from startup to growth stage or optimizing complex enterprise 
                workflows, I architect the technical infrastructure that turns your revenue operations 
                into a competitive advantage.
              </p>
            </div>

            <ScheduleCallButton />
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div 
                key={index}
                className="p-6 bg-white border border-neutral-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors inline-flex">
                      <Icon className="text-blue-600 group-hover:text-white transition-colors" size={24} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-neutral-900">{highlight.title}</h3>
                    <p className="text-neutral-600">{highlight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}