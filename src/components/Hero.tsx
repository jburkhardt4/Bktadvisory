import { ScheduleCallButton } from "./ScheduleCallButton";

const SparklesIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const RocketIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ArrowRightIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function TechMarqueeRow({ items, direction }: { items: string[]; direction: 'left' | 'right' }) {
  return (
    <div className="bkt-marquee">
      <div className={`bkt-marquee-track ${direction === 'right' ? 'bkt-marquee-track-right' : 'bkt-marquee-track-left'}`}>
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            aria-hidden={index >= items.length ? true : undefined}
            className="bkt-tech-pill flex-shrink-0"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const salesforceStack = [
    "Salesforce Platform",
    "Sales Cloud",
    "Service Cloud",
    "Financial Services Cloud (FSC)",
    "Data Cloud",
    "Apex",
    "LWC",
    "Visualforce Pages",
    "Lightning Apps",
    "Agentforce",
  ];

  const nonSalesforceStack = [
    "OpenAI",
    "Claude",
    "ChatGPT",
    "n8n",
    "Make.com",
    "Zapier",
    "APIs",
    "RPA",
    "GitHub",
    "Copilot",
    "Cursor",
    "Replit",
    "Figma",
  ];

  return (
    <section className="bkt-home-hero-gradient relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Copy & Actions (7 columns) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 min-w-0">
            {/* Eyebrow */}
            <p className="text-sm sm:text-base text-slate-400 tracking-wide">
              Technical Consulting Advisor | BKT Advisory
            </p>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[38px] font-bold text-slate-50 tracking-tight leading-tight break-words">
              Building Predictable Growth Engines via Salesforce
              & AI Agents.
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Architecting systems that compress sales cycles
              and operationalize AI.
            </p>

            {/* Tech Stack Marquee */}
            <div className="space-y-3 sm:space-y-4">
              <TechMarqueeRow items={salesforceStack} direction="left" />
              <TechMarqueeRow items={nonSalesforceStack} direction="right" />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <ScheduleCallButton className="w-full sm:w-auto px-6 py-3 border border-slate-200/80 dark:border-white/15" />
              <a
                href="https://estimator.bktadvisory.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-white/10 border border-white/20 text-slate-50 rounded-lg hover:bg-white/15 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 backdrop-blur-sm font-medium group"
              >
                <RocketIcon size={18} className="text-blue-300" />
                Get an Instant Quote
                <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: Visual Diagram Card (5 columns) */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-white/5 rounded-2xl p-8 lg:p-10 border border-white/10 backdrop-blur-sm">
              {/* Abstract System Diagram */}
              <div className="space-y-6">
                {/* Top Node - AI Agent Layer */}
                <div className="flex items-center justify-center">
                  <div className="group px-6 py-3 bg-[#EFF6FF] text-slate-900 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,246,255,0.6)] cursor-default">
                    <SparklesIcon
                      size={20}
                      className="text-blue-700"
                    />
                    <span className="font-semibold">
                      AI Agent Layer
                    </span>
                  </div>
                </div>

                {/* Connecting Line */}
                <div className="flex justify-center">
                  <div className="w-[2px] h-12 bg-gradient-to-b from-blue-400/50 to-blue-600/50"></div>
                </div>

                {/* Middle Layer - CRM */}
                <div className="flex items-center justify-center">
                  <div className="bkt-hero-diagram-node cursor-default">
                    <span className="text-slate-50 font-semibold">
                      Salesforce CRM
                    </span>
                  </div>
                </div>

                {/* Connecting Lines (Three branches) */}
                <div className="flex justify-center gap-12">
                  <div className="w-[2px] h-12 bg-gradient-to-b from-blue-600/50 to-blue-400/30"></div>
                  <div className="w-[2px] h-12 bg-gradient-to-b from-blue-600/50 to-blue-400/30"></div>
                  <div className="w-[2px] h-12 bg-gradient-to-b from-blue-600/50 to-blue-400/30"></div>
                </div>

                {/* Bottom Layer - Data Sources */}
                <div className="grid grid-cols-3 gap-3">
                  {["IT Systems", "Cloud Apps", "AI Tools"].map((label) => (
                    <div key={label} className="bkt-hero-diagram-node w-full px-4 text-center text-[13px] leading-tight cursor-default">
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Glow Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
