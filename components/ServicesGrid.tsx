// Icon components to avoid lucide-react import issue
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

const ArrowRightIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export function ServicesGrid() {
  const services = [
    {
      icon: DatabaseIcon,
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
      icon: BotIcon,
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
      icon: TrendingUpIcon,
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

  const upworkTiers = [
    { tier: 'Discovery Call', price: 'Free', desc: 'Initial consultation & project scoping', badge: 'Starter' },
    { tier: 'CRM Setup', price: '$2,500+', desc: 'Salesforce instance configuration & data modeling', badge: 'Foundation' },
    { tier: 'Sales Cloud', price: '$5,000+', desc: 'Full Sales Cloud implementation & training', badge: 'Growth' },
    { tier: 'AI Agent Build', price: '$7,500+', desc: 'Custom AI agent workflows & CRM integration', badge: 'Advanced' },
    { tier: 'Full RevOps', price: '$15,000+', desc: 'End-to-end revenue operations transformation', badge: 'Enterprise' },
    { tier: 'Platform Overhaul', price: '$25,000+', desc: 'Multi-cloud Salesforce architecture & migration', badge: 'Premium' },
  ];

  return (
    <section id="services" className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-24 lg:py-32">
      {/* Background gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight text-[36px]">Services</h2>
          <p className="text-xl text-slate-700">
            Comprehensive Salesforce and AI solutions tailored for high-growth companies in FinTech, InsurTech, and beyond.
          </p>
        </div>

        {/* Upwork Project Tiers Carousel */}
        <div className="relative mb-16 overflow-hidden">
          <div className="flex animate-[scrollLeft_30s_linear_infinite] gap-4 w-max">
            {[...upworkTiers, ...upworkTiers, ...upworkTiers].map((tier, i) => (
              <div
                key={`tier-${i}`}
                className="flex-shrink-0 w-[260px] p-5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl hover:border-blue-400/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-100">
                    {tier.badge}
                  </span>
                  <span className="text-lg font-bold text-slate-900">{tier.price}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">{tier.tier}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{tier.desc}</p>
              </div>
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10"></div>
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10"></div>
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
                      <ArrowRightIcon size={16} className="group-hover/link:translate-x-1 transition-transform" />
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