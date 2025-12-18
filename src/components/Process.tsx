import { Search, Map, Hammer, Rocket, TrendingUp } from 'lucide-react';

export function Process() {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: 'Discover',
      description: 'Deep dive into your current Salesforce setup, tech stack, and business goals. Identify gaps, opportunities, and quick wins.'
    },
    {
      number: 2,
      icon: Map,
      title: 'Plan',
      description: 'Design the architecture and roadmap—data models, integrations, AI agent workflows, and RevOps processes tailored to your growth targets.'
    },
    {
      number: 3,
      icon: Hammer,
      title: 'Build',
      description: 'Hands-on implementation of Salesforce configurations, AI integrations, and automation workflows with rigorous testing and iteration.'
    },
    {
      number: 4,
      icon: Rocket,
      title: 'Launch',
      description: 'Deploy to production with user training, change management support, and monitoring to ensure seamless adoption and immediate impact.'
    },
    {
      number: 5,
      icon: TrendingUp,
      title: 'Grow',
      description: 'Continuous optimization, performance tracking, and strategic enhancements to scale your growth engine and maximize ROI.'
    }
  ];

  return (
    <section id="process" className="bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-neutral-900">Process</h2>
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
