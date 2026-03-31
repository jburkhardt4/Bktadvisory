const RocketIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ArrowRightIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SparklesIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export function EstimatorCTA() {
  return (
    <section className="bkt-brand-band relative overflow-hidden py-16 lg:py-20">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-6 border border-white/10">
          <SparklesIcon size={16} className="text-yellow-300" />
          AI-Powered Estimation
        </div>

        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
          Get an Instant Quote
        </h2>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
          Use our AI-powered Tech Project Estimator to scope your Salesforce project, 
          configure your tech stack, and receive a detailed quote — all in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://estimator.bktadvisory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-white px-8 py-4 font-semibold text-blue-700 shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group"
          >
            <RocketIcon size={20} />
            Launch Project Estimator
            <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <p className="bkt-brand-muted mt-6 text-sm">
          No sign-up required · Instant results · AI-assisted configuration
        </p>
      </div>
    </section>
  );
}
