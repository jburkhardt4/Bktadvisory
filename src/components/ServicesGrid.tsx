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
    <section id="services" className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-24 lg:py-32">
      {/* Background gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight">Services</h2>
          <p className="text-xl text-slate-700">
            Comprehensive Salesforce and AI solutions tailored for high-growth companies in FinTech, InsurTech, and beyond.
          </p>
        </div>

        {/* Symmetrical 3-Column Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index}
                className="group relative"
              >
                {/* Glass Card */}
                <div className="h-full p-8 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] relative overflow-hidden">
                  {/* Inner glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-100/50 group-hover:via-transparent group-hover:to-blue-100/50 transition-all duration-500 rounded-2xl pointer-events-none"></div>
                  
                  <div className="relative space-y-6">
                    {/* Icon */}
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl w-fit group-hover:bg-blue-100 group-hover:border-blue-300 transition-all duration-300">
                      <Icon className="text-blue-700 group-hover:text-blue-800 transition-colors" size={32} />
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-950 tracking-tight">{service.title}</h3>
                      <p className="text-sm text-slate-600">{service.subtitle}</p>
                    </div>

                    {/* Description */}
                    <p className="text-slate-700 leading-relaxed">{service.description}</p>

                    {/* Bullets */}
                    <ul className="space-y-3">
                      {service.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0 group-hover:bg-blue-700 transition-colors"></span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Link */}
                    <a href="#contact" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors group/link mt-4 font-medium">
                      Learn more
                      <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </a>
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