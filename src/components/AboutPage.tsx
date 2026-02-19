import headshot from 'figma:asset/2db40784bd77d5bad84a04e4e645b0c1f3c7d8bf.png';
import { ScheduleCallButton } from './ScheduleCallButton';
import { Reviews } from './Reviews';
import { EstimatorCTA } from './EstimatorCTA';

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

const ShieldCheckIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const certifications = [
  'Salesforce Certified Administrator',
  'Salesforce Certified Platform App Builder',
  'Salesforce Certified Sales Cloud Consultant',
  'Salesforce Certified Service Cloud Consultant',
  'Salesforce Certified Financial Services Cloud (FSC)',
];

const highlights = [
  {
    icon: AwardIcon,
    title: '5x Salesforce Certified',
    description: 'Deep expertise across Sales Cloud, Service Cloud, and Financial Services Cloud',
  },
  {
    icon: BriefcaseIcon,
    title: 'Closed $837M+ in Multifamily Real Estate',
    description: 'Led Due Diligence projects at Carter Funds, closing major transactions across multifamily portfolios',
  },
  {
    icon: TrendingUpIcon,
    title: 'Strategy + Implementation',
    description: 'Unique blend of architectural vision and hands-on execution capabilities',
  },
];

export function AboutPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0F172B] via-slate-800 to-blue-950 py-20 lg:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <p className="text-blue-400 tracking-wide text-sm font-medium mb-4">BKT Advisory</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-50 tracking-tight mb-6">
            About
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Salesforce & AI Systems Architect helping companies build predictable growth engines.
          </p>
        </div>
      </section>

      {/* Bio Section */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Headshot */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src={headshot}
                  alt="John 'JB' Burkhardt"
                  className="rounded-2xl w-full max-w-lg shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>

            {/* Bio Text */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  John "JB" Burkhardt
                </h2>
                <p className="text-blue-600 font-medium">Founder & Principal Consultant</p>
              </div>

              <div className="space-y-4 text-slate-700 leading-relaxed">
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
                  My approach isn't just about implementing technology — it's about architecting systems
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
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Salesforce Certifications</h2>
            <p className="text-slate-600">Verified expertise across the Salesforce ecosystem.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {certifications.map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <ShieldCheckIcon size={20} className="text-blue-600 flex-shrink-0" />
                <span className="text-sm text-slate-800 font-medium">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors inline-flex">
                        <Icon className="text-blue-600 group-hover:text-white transition-colors" size={24} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-slate-900 font-bold">{highlight.title}</h3>
                      <p className="text-slate-600 text-sm">{highlight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Estimator CTA */}
      <EstimatorCTA />

      {/* Reviews */}
      <div className="bg-slate-50">
        <Reviews />
      </div>
    </>
  );
}