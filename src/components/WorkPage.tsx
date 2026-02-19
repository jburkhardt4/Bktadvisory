import { Reviews } from './Reviews';
import { EstimatorCTA } from './EstimatorCTA';
import { ScheduleCallButton } from './ScheduleCallButton';

const FileCheckIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="9 15 11 17 15 13" />
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

const ZapIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CheckCircleIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

interface CaseStudy {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  industry: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  techStack: string[];
}

const caseStudies: CaseStudy[] = [
  {
    icon: FileCheckIcon,
    label: 'Underwriting Automation',
    industry: 'InsurTech',
    challenge:
      'Manual underwriting processes were creating bottlenecks, with risk assessments taking weeks and data quality issues causing compliance concerns.',
    solution:
      'Designed an AI-driven underwriting system integrating Salesforce Financial Services Cloud with intelligent agents to streamline risk assessment, automate data validation, and accelerate approval workflows.',
    outcomes: [
      'Cut underwriting times from weeks to days',
      'Reduced vendor R&D spend significantly',
      'Improved data quality and compliance tracking',
      'Automated risk scoring with AI agent workflows',
    ],
    techStack: ['Salesforce FSC', 'AI Agents', 'RPA', 'Custom APIs'],
  },
  {
    icon: RocketIcon,
    label: 'Pipeline Acceleration',
    industry: 'B2B FinTech',
    challenge:
      'A fast-growing FinTech startup needed to scale their pipeline but lacked the systems to track, nurture, and convert leads efficiently across their sales and marketing stack.',
    solution:
      'Built an end-to-end RevOps system connecting Salesforce Sales Cloud with AI agents and marketing automation to optimize lead flow, scoring, and conversion tracking.',
    outcomes: [
      'Doubled qualified pipeline within 90 days',
      'Cut campaign time-to-market from days to hours',
      'Increased sales team productivity by 40%',
      'Established data-driven pipeline forecasting',
    ],
    techStack: ['Salesforce Sales Cloud', 'AI Agents', 'Marketing Automation', 'n8n'],
  },
  {
    icon: ZapIcon,
    label: 'Reimbursement Ops',
    industry: 'HealthTech',
    challenge:
      'Manual reimbursement and approval processes were taking weeks, with significant data entry overhead and poor customer satisfaction.',
    solution:
      'Transformed reimbursement operations by architecting automated workflows on Salesforce Service Cloud with RPA integration for data extraction and intelligent routing.',
    outcomes: [
      'Compressed reimbursement cycles from weeks to days',
      'Reduced manual data entry by 75%',
      'Improved customer satisfaction scores significantly',
      'Automated approval routing and escalation paths',
    ],
    techStack: ['Salesforce Service Cloud', 'RPA', 'Workflow Automation', 'DocuSign'],
  },
];

export function WorkPage() {
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
            Selected Work
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Real results from Salesforce and AI transformations across FinTech, InsurTech, and high-growth startups.
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="space-y-16">
            {caseStudies.map((study, index) => {
              const Icon = study.icon;
              return (
                <div
                  key={index}
                  className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start"
                >
                  {/* Left: Case Info */}
                  <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600 rounded-xl">
                        <Icon className="text-white" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{study.label}</h2>
                        <span className="text-sm text-blue-600 font-medium">{study.industry}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Challenge</h3>
                        <p className="text-slate-700 leading-relaxed">{study.challenge}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Solution</h3>
                        <p className="text-slate-700 leading-relaxed">{study.solution}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {study.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Outcomes Card */}
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl p-8 space-y-5">
                      <h3 className="text-lg font-bold text-slate-900">Key Outcomes</h3>
                      <ul className="space-y-4">
                        {study.outcomes.map((outcome, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircleIcon size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4 border-t border-slate-200">
                        <ScheduleCallButton variant="primary">
                          Discuss a Similar Project
                        </ScheduleCallButton>
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

      {/* Reviews */}
      <div className="bg-slate-50">
        <Reviews />
      </div>
    </>
  );
}