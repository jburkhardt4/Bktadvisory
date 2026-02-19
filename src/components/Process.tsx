// Icon components to avoid lucide-react import issue
const SearchIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MapIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const HammerIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
    <path d="M17.64 15 22 10.64" />
    <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
  </svg>
);

const RocketIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const TrendingUpIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export function Process() {
  const steps = [
    {
      number: 1,
      icon: SearchIcon,
      title: 'Discover',
      description: 'Deep dive into your current Salesforce setup, tech stack, and business goals. Identify gaps, opportunities, and quick wins.'
    },
    {
      number: 2,
      icon: MapIcon,
      title: 'Plan',
      description: 'Design the architecture and roadmap—data models, integrations, AI agent workflows, and RevOps processes tailored to your growth targets.'
    },
    {
      number: 3,
      icon: HammerIcon,
      title: 'Build',
      description: 'Hands-on implementation of Salesforce configurations, AI integrations, and automation workflows with rigorous testing and iteration.'
    },
    {
      number: 4,
      icon: RocketIcon,
      title: 'Launch',
      description: 'Deploy to production with user training, change management support, and monitoring to ensure seamless adoption and immediate impact.'
    },
    {
      number: 5,
      icon: TrendingUpIcon,
      title: 'Grow',
      description: 'Continuous optimization, performance tracking, and strategic enhancements to scale your growth engine and maximize ROI.'
    }
  ];

  return (
    <section id="process" className="bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-neutral-900 text-[24px] font-bold">Process</h2>
          <p className="text-neutral-600">
            A structured, five-phase approach from discovery to continuous growth—blending strategy with hands-on execution.
          </p>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-neutral-200">
              <div className="h-full w-0 bg-blue-600"></div>
            </div>

            <div className="grid grid-cols-5 gap-4 relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    {/* Number Circle */}
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center relative z-10">
                        <div className="p-3 bg-blue-50 rounded-full">
                          <Icon className="text-blue-600" size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm text-blue-600">Step {step.number}</p>
                        <h3 className="text-neutral-900">{step.title}</h3>
                      </div>
                      <p className="text-sm text-neutral-600">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex gap-6">
                {/* Left: Icon */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="text-blue-600" size={20} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full bg-neutral-200 mt-4"></div>
                  )}
                </div>

                {/* Right: Content */}
                <div className="pb-8 space-y-2 flex-1">
                  <div className="space-y-1">
                    <p className="text-sm text-blue-600">Step {step.number}</p>
                    <h3 className="text-neutral-900">{step.title}</h3>
                  </div>
                  <p className="text-neutral-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}