import { EstimatorCTA } from './EstimatorCTA';
import { FinalCTA } from './FinalCTA';

const DatabaseIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    <path d="M3 12a9 3 0 0 0 18 0" />
  </svg>
);

const BotIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const TrendingUpIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const CheckIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface ServiceDetail {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  subtitle: string;
  description: string;
  capabilities: string[];
  deliverables: string[];
  idealFor: string[];
}

const services: ServiceDetail[] = [
  {
    icon: DatabaseIcon,
    title: 'CRM Architecture',
    subtitle: 'Full lifecycle Salesforce implementations and data foundations.',
    description:
      'End-to-end Salesforce implementations designed for scalability, data integrity, and seamless integration across your tech stack. We architect CRM systems that become the single source of truth for your business operations.',
    capabilities: [
      'End-to-end Salesforce implementations (FSC / Sales / Service)',
      'Data modeling, governance, and reporting foundations',
      'Integrations with internal tools, partner platforms, and 3rd-party services',
      'Custom object design and relationship mapping',
      'Migration from legacy CRM systems',
      'User training and change management',
    ],
    deliverables: [
      'Architecture blueprint and data model documentation',
      'Configured Salesforce org with custom objects and automation',
      'Integration connections (APIs, middleware)',
      'Reports, dashboards, and KPI tracking',
      'User training materials and admin runbooks',
    ],
    idealFor: [
      'Companies launching their first CRM',
      'Teams migrating from legacy systems',
      'Organizations needing data consolidation',
    ],
  },
  {
    icon: BotIcon,
    title: 'AI & Agentic Systems',
    subtitle: 'AI agents orchestrating CRM and operational data.',
    description:
      'Design and deploy intelligent AI agent systems that connect seamlessly to your CRM and automate complex workflows. Our agentic approach goes beyond simple chatbots — building autonomous systems that can reason, decide, and act.',
    capabilities: [
      'Design end-to-end AI agent workflows',
      'Connect agents to CRM and operational systems',
      'Automate underwriting, servicing, and growth operations',
      'Natural language processing for customer interactions',
      'Intelligent data extraction and classification',
      'Multi-agent orchestration for complex business processes',
    ],
    deliverables: [
      'AI agent architecture and workflow design',
      'Deployed Agentforce or custom AI agents',
      'Integration with Salesforce data and processes',
      'Monitoring dashboards and performance analytics',
      'Prompt engineering documentation and optimization',
    ],
    idealFor: [
      'Companies looking to automate manual processes',
      'Teams wanting to leverage Salesforce Agentforce',
      'Organizations ready for AI-driven decision making',
    ],
  },
  {
    icon: TrendingUpIcon,
    title: 'RevOps & Transformation',
    subtitle: 'Turning CRM + AI into predictable revenue.',
    description:
      'Transform your revenue operations by combining CRM intelligence with AI automation to compress cycles and accelerate growth. We don\'t just implement technology — we architect the systems that drive measurable business outcomes.',
    capabilities: [
      'Compress reimbursement and approval cycles',
      'Consolidate and automate due diligence workflows',
      'Double qualified pipeline and improve conversion efficiency',
      'Sales process optimization and pipeline forecasting',
      'Marketing-to-sales handoff automation',
      'Customer success and retention workflows',
    ],
    deliverables: [
      'RevOps strategy and implementation roadmap',
      'Automated lead scoring and routing rules',
      'Pipeline dashboards and forecasting models',
      'Workflow automation for approval and handoff processes',
      'Performance metrics and ROI tracking framework',
    ],
    idealFor: [
      'Startups scaling from seed to growth stage',
      'Companies with complex approval workflows',
      'Organizations optimizing sales and marketing alignment',
    ],
  },
];

export function ServicesPage() {
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
            Services
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Comprehensive Salesforce and AI solutions tailored for high-growth companies in FinTech, InsurTech, and beyond.
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 space-y-24">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="space-y-10">
                {/* Service Header */}
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-blue-600 rounded-xl flex-shrink-0">
                    <Icon className="text-white" size={28} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{service.title}</h2>
                    <p className="text-blue-600 font-medium">{service.subtitle}</p>
                    <p className="text-slate-700 leading-relaxed max-w-3xl">{service.description}</p>
                  </div>
                </div>

                {/* Capabilities & Deliverables Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Capabilities */}
                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-5">What We Do</h3>
                    <ul className="space-y-3">
                      {service.capabilities.map((cap, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckIcon size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-sm">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deliverables */}
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border border-blue-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-5">What You Get</h3>
                    <ul className="space-y-3">
                      {service.deliverables.map((del, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700 text-sm">{del}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Ideal For */}
                    <div className="mt-6 pt-5 border-t border-blue-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ideal For</p>
                      <div className="flex flex-wrap gap-2">
                        {service.idealFor.map((item) => (
                          <span
                            key={item}
                            className="px-3 py-1.5 bg-white text-slate-700 text-xs rounded-full border border-slate-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider between services */}
                {index < services.length - 1 && (
                  <div className="border-b border-slate-200" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Estimator CTA */}
      <EstimatorCTA />

      {/* Final CTA */}
      <FinalCTA />
    </>
  );
}
