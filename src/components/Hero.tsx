import { ArrowRight, Sparkles } from "lucide-react";

export function Hero({
  onOpenBooking,
}: {
  onOpenBooking: () => void;
}) {
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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Actions (7 columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Eyebrow */}
            <p className="text-slate-400 tracking-wide">
              Principal Consultant · BKT Advisory
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
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#EFF6FF] text-slate-900 rounded-lg hover:bg-[#DBEAFE] transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                Book Strategy Call
                <ArrowRight size={20} />
              </button>
              <a
                href="#work"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white/20 text-slate-50 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm font-medium"
              >
                View Selected Work
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
                    <Sparkles
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
                  <div className="group px-8 py-4 bg-white/10 border-2 border-blue-600/50 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-default">
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
                  <div className="group px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-sm text-slate-300 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(239,246,255,0.2)] cursor-default">
                    <span className="font-medium">
                      Pipeline
                    </span>
                  </div>
                  <div className="group px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-sm text-slate-300 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(239,246,255,0.2)] cursor-default">
                    <span className="font-medium">
                      Operations
                    </span>
                  </div>
                  <div className="group px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-sm text-slate-300 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(239,246,255,0.2)] cursor-default">
                    <span className="font-medium">
                      Analytics
                    </span>
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