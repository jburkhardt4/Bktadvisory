import { EstimatorCTA } from './EstimatorCTA';
import { FinalCTA } from './FinalCTA';
import { useState, useEffect, useRef, useCallback } from 'react';

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

interface ProcessStep {
  number: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  duration: string;
  description: string;
  activities: string[];
  deliverables: string[];
}

const steps: ProcessStep[] = [
  {
    number: 1,
    icon: SearchIcon,
    title: 'Discover',
    duration: '1 – 2 weeks',
    description:
      'Deep dive into your current Salesforce setup, tech stack, and business goals. We identify gaps, opportunities, and quick wins through stakeholder interviews, system audits, and data analysis.',
    activities: [
      'Stakeholder interviews and requirements gathering',
      'Current system audit and gap analysis',
      'Data quality assessment',
      'Competitive landscape review',
      'Quick-win identification',
    ],
    deliverables: [
      'Discovery report with findings and recommendations',
      'Current-state architecture diagram',
      'Prioritized opportunity backlog',
    ],
  },
  {
    number: 2,
    icon: MapIcon,
    title: 'Plan',
    duration: '1 – 2 weeks',
    description:
      'Design the architecture and roadmap — data models, integrations, AI agent workflows, and RevOps processes tailored to your growth targets. Every decision is guided by your business outcomes.',
    activities: [
      'Solution architecture design',
      'Data model and relationship mapping',
      'Integration strategy and API planning',
      'AI/agent workflow design',
      'Implementation roadmap creation',
    ],
    deliverables: [
      'Solution architecture blueprint',
      'Technical specifications document',
      'Phased implementation roadmap',
      'Resource and timeline estimates',
    ],
  },
  {
    number: 3,
    icon: HammerIcon,
    title: 'Build',
    duration: '4 – 8 weeks',
    description:
      'Hands-on implementation of Salesforce configurations, AI integrations, and automation workflows. We build in agile sprints with rigorous testing and continuous stakeholder feedback.',
    activities: [
      'Salesforce configuration and customization',
      'AI agent development and training',
      'Integration development and testing',
      'Workflow automation setup',
      'Data migration and validation',
    ],
    deliverables: [
      'Configured Salesforce environment',
      'Deployed AI agents and automations',
      'Connected integrations',
      'Test results and quality assurance reports',
    ],
  },
  {
    number: 4,
    icon: RocketIcon,
    title: 'Launch',
    duration: '1 – 2 weeks',
    description:
      'Deploy to production with comprehensive user training, change management support, and real-time monitoring to ensure seamless adoption and immediate impact.',
    activities: [
      'Production deployment and cutover',
      'User acceptance testing (UAT)',
      'Training sessions for admins and end users',
      'Change management communication',
      'Go-live monitoring and support',
    ],
    deliverables: [
      'Production-ready deployment',
      'Training materials and documentation',
      'Admin runbooks and SOPs',
      'Post-launch support plan',
    ],
  },
  {
    number: 5,
    icon: TrendingUpIcon,
    title: 'Grow',
    duration: 'Ongoing',
    description:
      'Continuous optimization, performance tracking, and strategic enhancements to scale your growth engine and maximize ROI. We stay engaged to ensure your systems evolve with your business.',
    activities: [
      'Performance monitoring and analytics',
      'Iterative optimization and A/B testing',
      'New feature development',
      'Quarterly business reviews',
      'Strategic advisory and roadmap updates',
    ],
    deliverables: [
      'Monthly performance reports',
      'Optimization recommendations',
      'Roadmap updates based on business evolution',
      'Ongoing technical support',
    ],
  },
];

export function ProcessPage() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [intensities, setIntensities] = useState<number[]>([1, 1, 1, 1, 1]);

  const updateIntensities = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    const distances = stepRefs.current.map((ref) => {
      if (!ref) return Infinity;
      const rect = ref.getBoundingClientRect();
      // Distance from the step's icon area (top ~40px) to viewport center
      const stepCenter = rect.top + 40;
      return Math.abs(stepCenter - viewportCenter);
    });

    const newIntensities = distances.map((dist) => {
      // === WIDE PEAK: Full intensity plateau within 100px of viewport center ===
      if (dist <= 100) return 1.0;

      // === SOFT FADE: Gradual fade over 700px range beyond the plateau edge ===
      const fadeDistance = dist - 100;
      const normalized = Math.min(fadeDistance / 700, 1);
      return Math.max(0.12, 1 - normalized * 0.88);
    });

    setIntensities(newIntensities);
  }, []);

  useEffect(() => {
    updateIntensities();
    const onScroll = () => requestAnimationFrame(updateIntensities);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateIntensities]);

  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0F172B] via-slate-800 to-blue-950 py-20 lg:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8 text-center pt-5 lg:pt-0 pb-1 lg:pb-0">
          <p className="text-blue-400 tracking-wide text-sm font-medium mb-4">BKT Advisory</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-50 tracking-tight mb-6">
            Our Process
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            A structured, five-phase approach from discovery to continuous growth — blending strategy with hands-on execution.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const intensity = intensities[index] ?? 0.15;
              const iconBg = `rgba(37, 99, 235, ${intensity})`;
              const shadowColor = `rgba(37, 99, 235, ${intensity * 0.25})`;
              const labelOpacity = 0.2 + intensity * 0.7;
              const connectorOpacity = intensity;
              return (
                <div key={index} className="relative" ref={(el) => { stepRefs.current[index] = el; }}>
                  {/* Connector line - desktop */}
                  {index < steps.length - 1 && (
                    <div
                      className="hidden lg:block absolute left-[119px] top-[80px] bottom-0 w-0.5 mx-[30px] my-[0px]"
                      style={{ backgroundColor: `rgba(37, 99, 235, ${connectorOpacity})`, transition: 'background-color 0.3s ease' }}
                    />
                  )}
                  {/* Connector line - mobile: left-aligned behind content */}
                  {index < steps.length - 1 && (
                    <div
                      className="lg:hidden absolute left-[35px] top-[72px] bottom-0 w-0.5 z-0"
                      style={{ backgroundColor: `rgba(37, 99, 235, ${connectorOpacity})`, transition: 'background-color 0.3s ease' }}
                    />
                  )}

                  {/* Mobile layout */}
                  <div className="lg:hidden pb-16 relative">
                    {/* Top row: Icon flush left + Step # + Title + Duration */}
                    <div className="flex items-center gap-4 mb-5">
                      {/* Icon */}
                      <div
                        className="w-18 h-18 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 relative z-10"
                        style={{ backgroundColor: iconBg, boxShadow: `0 10px 15px -3px ${shadowColor}`, transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}
                      >
                        <Icon className="text-white" size={28} />
                      </div>
                      {/* Step # label + Title & duration below */}
                      <div className="min-w-0">
                        <span
                          className="text-blue-600 font-bold block px-[0px] py-[3px]"
                          style={{ fontSize: '1.3em', opacity: labelOpacity }}
                        >
                          Step {step.number}:
                        </span>
                        <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                          <h2 className="font-bold text-slate-900 tracking-tight text-[24px] leading-none">{step.title}</h2>
                          <span className="bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 mx-[10px] my-[0px] leading-none translate-y-[-2px] px-[10px] py-[3px]">
                            {step.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content - offset to clear the connector line */}
                    <div className="relative z-10 space-y-6 pl-[96px] pr-[0px] py-[0px]">
                      <p className="text-slate-700 leading-relaxed">{step.description}</p>

                      <div className="grid gap-6">
                        {/* Activities */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <h3 className="text-sm font-bold text-slate-900 mb-4">Key Activities</h3>
                          <ul className="space-y-2.5">
                            {step.activities.map((activity, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Deliverables */}
                        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border border-blue-100">
                          <h3 className="text-sm font-bold text-slate-900 mb-4">Deliverables</h3>
                          <ul className="space-y-2.5">
                            {step.deliverables.map((del, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 flex-shrink-0 mt-0.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {del}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden lg:grid lg:grid-cols-[80px_80px_1fr] gap-0 lg:gap-8 pb-16 lg:pb-20">
                    {/* Step Label */}
                    <div className="hidden lg:flex items-center h-20">
                      <span className="text-blue-600 font-medium whitespace-nowrap mx-[8px] my-[0px] text-[24px]" style={{ opacity: labelOpacity, transition: 'opacity 0.3s ease' }}>Step {step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className="flex lg:flex-col items-center gap-4 lg:gap-0">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg relative z-10" style={{ backgroundColor: iconBg, boxShadow: `0 10px 15px -3px ${shadowColor}`, transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}>
                        <Icon className="text-white" size={28} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h2 className="font-bold text-slate-900 tracking-tight leading-none text-[32px]">{step.title}</h2>
                        <span className="bg-blue-50 text-blue-700 font-medium rounded-full border border-blue-100 text-[14px] leading-none translate-y-[-2px] mx-[12px] my-[0px] px-[12px] py-[4px]">
                          {step.duration}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed max-w-3xl">{step.description}</p>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Activities */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <h3 className="text-sm font-bold text-slate-900 mb-4">Key Activities</h3>
                          <ul className="space-y-2.5">
                            {step.activities.map((activity, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Deliverables */}
                        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border border-blue-100">
                          <h3 className="text-sm font-bold text-slate-900 mb-4">Deliverables</h3>
                          <ul className="space-y-2.5">
                            {step.deliverables.map((del, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 flex-shrink-0 mt-0.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {del}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
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

      {/* Final CTA */}
      <FinalCTA />
    </>
  );
}