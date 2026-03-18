import { useEffect, useRef } from 'react';
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

function MarqueeRow({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    let raf: number;
    let pos = 0;
    const halfWidth = inner.scrollWidth / 2;
    const step = speed / 60;
    const animate = () => {
      pos += step;
      if (pos >= halfWidth) pos = 0;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <div ref={scrollRef} className="overflow-hidden whitespace-nowrap" style={{ scrollbarWidth: 'none' }}>
      <div ref={innerRef} className="inline-flex gap-3">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300 backdrop-blur-sm flex-shrink-0">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const techStack = [
    "Salesforce",
    "AI Agents",
    "n8n",
    "APIs",
    "RPA",
    "FSC",
    "Sales Cloud",
    "Service Cloud",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#0F172B] via-slate-800 to-blue-950">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Actions (7 columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Eyebrow */}
            <p className="text-slate-400 tracking-wide">
              Technical Consulting Advisor | BKT Advisory
            </p>

            {/* Headline */}
            <h1 className="text-[38px] font-bold text-slate-50 tracking-tight leading-[1.1]">
              Building Predictable Growth Engines via Salesforce
              & AI Agents.
            </h1>

            {/* Subhead */}
            <p className="text-xl text-slate-300 max-w-2xl text-[16px]">
              Architecting systems that compress sales cycles
              and operationalize AI.
            </p>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 backdrop-blur-sm hover:bg-white/10 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <ScheduleCallButton />
              <a
                href="https://estimator.bktadvisory.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 border-2 border-white/20 text-slate-50 rounded-lg hover:bg-white/15 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 backdrop-blur-sm font-medium group"
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
                  <div className="group px-8 py-3 bg-white/10 border-2 border-blue-600/50 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-default">
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
                  <div className="group py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm overflow-hidden cursor-default">
                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider text-center mb-1.5 px-2">IT Systems</p>
                    <MarqueeRow items={["Salesforce", "Agentforce", "Sales Cloud", "Service Cloud", "Marketing Cloud", "Financial Services Cloud (FSC)", "Insurance Cloud", "Experience Cloud", "Commerce Cloud"]} speed={25} />
                  </div>
                  <div className="group py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm overflow-hidden cursor-default">
                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider text-center mb-1.5 px-2">Cloud Apps</p>
                    <MarqueeRow items={["Claude", "OpenAI Chat GPT 5", "Codex", "Copilot", "GitHub", "Figma", "Replit"]} speed={22} />
                  </div>
                  <div className="group py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm overflow-hidden cursor-default">
                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider text-center mb-1.5 px-2">AI Tools</p>
                    <MarqueeRow items={["AI Agents", "n8n", "APIs", "RPA", "FSC", "n8n", "APIs", "RPA"]} speed={20} />
                  </div>
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