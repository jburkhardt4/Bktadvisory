import { Link } from 'react-router';

export function PortalPlaceholder() {
  return (
    <div className="min-h-screen bg-[#0F172B] text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-2">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Client Portal</h1>
          <p className="text-slate-400 text-lg">Coming Soon</p>
          <p className="text-slate-500 text-sm leading-relaxed">
            The BKT Advisory client portal is under development. It will provide secure access to your project status, quotes, activity feed, and documents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Home
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            Sign In
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
