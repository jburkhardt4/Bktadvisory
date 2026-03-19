import { useEffect } from 'react';

const ESTIMATOR_URL = 'https://estimator.bktadvisory.com';

export function EstimatorBoundary() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = ESTIMATOR_URL;
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172B] text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-2">
            <svg className="animate-spin" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Project Estimator</h1>
          <p className="text-slate-400 text-lg">Redirecting to Project Estimator...</p>
          <p className="text-slate-500 text-sm">
            You will be redirected automatically. If not,{' '}
            <a
              href={ESTIMATOR_URL}
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              click here
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
