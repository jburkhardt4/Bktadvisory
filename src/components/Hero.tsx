import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero({ onOpenBooking }: { onOpenBooking: () => void }) {
  const techStack = [
    'Salesforce',
    'AI Agents',
    'n8n',
    'APIs',
    'RPA',
    'FSC',
    'Sales Cloud',
    'Service Cloud'
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-neutral-600">John Burkhardt · BKT Advisory</p>
              <h1 className="text-neutral-900">
                Building Predictable Growth Engines via Salesforce & AI Agents.
              </h1>
            </div>
            
            <p className="text-neutral-600 max-w-xl">
              I help Startups, FinTech, and InsurTech companies compress cycles, grow pipeline, 
              and operationalize AI on top of Salesforce—combining strategy with hands-on implementation.
            </p>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span 
                  key={tech}
                  className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Strategy Call
                <ArrowRight size={18} />
              </button>
              <a 
                href="#work" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                View Selected Work
              </a>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-50 to-neutral-100 rounded-2xl p-8 lg:p-12 border border-neutral-200">
              {/* Abstract System Diagram */}
              <div className="space-y-6">
                {/* Top Node */}
                <div className="flex items-center justify-center">
                  <div className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg flex items-center gap-2">
                    <Sparkles size={20} />
                    <span>AI Agent Layer</span>
                  </div>
                </div>
                
                {/* Connecting Lines */}
                <div className="flex justify-center">
                  <div className="w-px h-12 bg-neutral-300"></div>
                </div>

                {/* Middle Layer - CRM */}
                <div className="flex items-center justify-center">
                  <div className="px-8 py-4 bg-white border-2 border-blue-600 rounded-lg shadow-md">
                    <span className="text-neutral-900">Salesforce CRM</span>
                  </div>
                </div>

                {/* Connecting Lines */}
                <div className="flex justify-center gap-8">
                  <div className="w-px h-12 bg-neutral-300"></div>
                  <div className="w-px h-12 bg-neutral-300"></div>
                  <div className="w-px h-12 bg-neutral-300"></div>
                </div>

                {/* Bottom Layer - Data Sources */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="px-4 py-3 bg-white border border-neutral-200 rounded-lg text-center text-sm text-neutral-700">
                    Pipeline
                  </div>
                  <div className="px-4 py-3 bg-white border border-neutral-200 rounded-lg text-center text-sm text-neutral-700">
                    Operations
                  </div>
                  <div className="px-4 py-3 bg-white border border-neutral-200 rounded-lg text-center text-sm text-neutral-700">
                    Analytics
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
