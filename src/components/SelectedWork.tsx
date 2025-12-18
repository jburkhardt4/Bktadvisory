import { FileCheck, Rocket, Zap, ArrowRight } from 'lucide-react';

export function SelectedWork() {
  const cases = [
    {
      icon: FileCheck,
      label: 'Underwriting Automation',
      summary: 'Designed AI-driven underwriting system for InsurTech client, integrating Salesforce FSC with intelligent agents to streamline risk assessment and approval workflows.',
      outcomes: [
        'Cut underwriting times materially',
        'Reduced vendor R&D spend',
        'Improved data quality and compliance tracking'
      ]
    },
    {
      icon: Rocket,
      label: 'Pipeline Acceleration',
      summary: 'Built end-to-end RevOps system for B2B FinTech startup, connecting Salesforce with AI agents and marketing automation to optimize lead flow and conversion.',
      outcomes: [
        'Doubled qualified pipeline',
        'Cut campaign time-to-market from days to hours',
        'Increased sales team productivity by 40%'
      ]
    },
    {
      icon: Zap,
      label: 'Reimbursement Ops',
      summary: 'Transformed reimbursement and approval operations for healthcare startup by architecting automated workflows on Salesforce Service Cloud with RPA integration.',
      outcomes: [
        'Compressed reimbursement/approval cycles from weeks to days',
        'Reduced manual data entry by 75%',
        'Improved customer satisfaction scores significantly'
      ]
    }
  ];

  return (
    <section id="work" className="bg-neutral-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-neutral-900">Selected Work</h2>
          <p className="text-neutral-600">
            Real results from Salesforce and AI transformations across FinTech, InsurTech, and high-growth startups.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((caseStudy, index) => {
            const Icon = caseStudy.icon;
            return (
              <div 
                key={index}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="p-6 border-b border-neutral-200 bg-gradient-to-br from-blue-50 to-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Icon className="text-white" size={20} />
                    </div>
                    <span className="text-sm text-neutral-900">{caseStudy.label}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  <p className="text-neutral-600">{caseStudy.summary}</p>

                  {/* Outcomes */}
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-500 uppercase tracking-wide">Key Outcomes</p>
                    <ul className="space-y-2">
                      {caseStudy.outcomes.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group">
                    Request Case Study
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
