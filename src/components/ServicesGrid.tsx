import { Database, Bot, TrendingUp, ArrowRight } from 'lucide-react';

export function ServicesGrid() {
  const services = [
    {
      icon: Database,
      title: 'CRM Architecture',
      subtitle: 'Full lifecycle Salesforce implementations and data foundations.',
      description: 'End-to-end Salesforce implementations designed for scalability, data integrity, and seamless integration across your tech stack.',
      bullets: [
        'End-to-end Salesforce implementations (FSC / Sales / Service)',
        'Data modeling, governance, and reporting foundations',
        'Integrations with internal tools, partner platforms, and 3rd-party services'
      ]
    },
    {
      icon: Bot,
      title: 'AI & Agentic Systems',
      subtitle: 'AI agents orchestrating CRM and operational data.',
      description: 'Design and deploy intelligent AI agent systems that connect seamlessly to your CRM and automate complex workflows.',
      bullets: [
        'Design end-to-end AI agent workflows',
        'Connect agents to CRM and operational systems',
        'Automate underwriting, servicing, and growth operations'
      ]
    },
    {
      icon: TrendingUp,
      title: 'RevOps & Transformation',
      subtitle: 'Turning CRM + AI into predictable revenue.',
      description: 'Transform your revenue operations by combining CRM intelligence with AI automation to compress cycles and accelerate growth.',
      bullets: [
        'Compress reimbursement and approval cycles',
        'Consolidate and automate due diligence workflows',
        'Double qualified pipeline and improve conversion efficiency'
      ]
    }
  ];

  return (
    <section id="services" className="bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-neutral-900">Services</h2>
          <p className="text-neutral-600">
            Comprehensive Salesforce and AI solutions tailored for high-growth companies in FinTech, InsurTech, and beyond.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index}
                className="p-8 bg-white border border-neutral-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
              >
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="p-3 bg-blue-50 rounded-lg w-fit group-hover:bg-blue-600 transition-colors">
                    <Icon className="text-blue-600 group-hover:text-white transition-colors" size={28} />
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2">
                    <h3 className="text-neutral-900">{service.title}</h3>
                    <p className="text-sm text-neutral-600">{service.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-neutral-600">{service.description}</p>

                  {/* Bullets */}
                  <ul className="space-y-3">
                    {service.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  <a href="#contact" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors group/link">
                    Learn more
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
