import { Award, Briefcase, Sparkles } from 'lucide-react';
import headshot from 'figma:asset/2db40784bd77d5bad84a04e4e645b0c1f3c7d8bf.png';

export function About({ onOpenBooking }: { onOpenBooking: () => void }) {
  const highlights = [
    {
      icon: Award,
      title: '5x Salesforce Certified',
      description: 'Deep expertise across Sales Cloud, Service Cloud, and Financial Services Cloud'
    },
    {
      icon: Briefcase,
      title: 'Closed $837M+ in Multifamily Real Estate',
      description: 'Led Due Diligence projects at Carter Funds, closing major transactions across multifamily portfolios'
    },
    {
      icon: Sparkles,
      title: 'Strategy + Implementation',
      description: 'Unique blend of architectural vision and hands-on execution capabilities'
    }
  ];

  return (
    <section id="about" className="bg-neutral-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-neutral-900 mb-4">About Me</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Salesforce & AI Systems Architect helping companies build predictable growth engines
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">
          {/* Left: Headshot */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src={headshot} 
                alt="John 'JB' Burkhardt" 
                className="rounded-2xl w-full max-w-md shadow-xl"
              />
            </div>
          </div>

          {/* Right: Bio */}
          <div className="space-y-6">
            <div className="space-y-4 text-neutral-600">
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
                My approach isn't just about implementing technology—it's about architecting systems 
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

            <button 
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Let's Talk
            </button>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div 
                key={index}
                className="p-6 bg-white border border-neutral-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors inline-flex">
                      <Icon className="text-blue-600 group-hover:text-white transition-colors" size={24} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-neutral-900">{highlight.title}</h3>
                    <p className="text-neutral-600">{highlight.description}</p>
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
