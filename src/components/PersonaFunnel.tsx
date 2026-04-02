import { useState } from 'react';
import { PersonaMode, PersonaRole } from '../types';

interface PersonaFunnelProps {
  onComplete: (mode: PersonaMode, role: PersonaRole) => void;
}

const roles: { value: PersonaRole; label: string; description: string }[] = [
  { value: 'business-owner', label: 'Business Owner', description: 'Focus on ROI, timelines, and outcomes' },
  { value: 'technical-lead', label: 'Technical Lead', description: 'Focus on stack, integrations, and architecture' },
  { value: 'project-manager', label: 'Project Manager', description: 'Focus on scope, resources, and delivery' },
  { value: 'other', label: 'Other', description: 'General project scoping' },
];

const ZapIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const BuildingIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ArrowRightIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ArrowLeftIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function PersonaFunnel({ onComplete }: PersonaFunnelProps) {
  const [screen, setScreen] = useState<1 | 2>(1);
  const [selectedMode, setSelectedMode] = useState<PersonaMode | null>(null);
  const [selectedRole, setSelectedRole] = useState<PersonaRole | null>(null);

  const handleModeSelect = (mode: PersonaMode) => {
    setSelectedMode(mode);
    setScreen(2);
  };

  const handleContinue = () => {
    if (selectedMode && selectedRole) {
      onComplete(selectedMode, selectedRole);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-2xl">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className={`w-2 h-2 rounded-full transition-colors ${screen === 1 ? 'bg-blue-500' : 'bg-blue-500'}`} />
          <div className={`w-8 h-px transition-colors ${screen === 2 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${screen === 2 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
        </div>

        {/* Screen 1: Mode selection */}
        {screen === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                What kind of project are you scoping?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">
                Choose the experience that fits your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {/* Lite card */}
              <button
                onClick={() => handleModeSelect('lite')}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <ZapIcon />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-50 text-lg mb-1">
                    Quick Estimate
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Streamlined inputs, fast results. Best for scoping a focused project or getting a ballpark figure.
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    5–7 min
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Fewer inputs
                  </span>
                </div>
                <ArrowRightIcon size={16} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                  <ArrowRightIcon size={16} />
                </div>
              </button>

              {/* Enterprise card */}
              <button
                onClick={() => handleModeSelect('enterprise')}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <BuildingIcon />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-50 text-lg mb-1">
                    Full Proposal
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Full tech stack configuration, advanced controls, and a detailed enterprise-ready proposal.
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    10–15 min
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    Full controls
                  </span>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                  <ArrowRightIcon size={16} />
                </div>
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              No sign-up required · Both paths produce a downloadable quote
            </p>
          </div>
        )}

        {/* Screen 2: Role selection */}
        {screen === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                What's your role?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">
                We'll tailor the questions and language to fit your perspective.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {roles.map((role) => {
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <CheckIcon size={11} />}
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>
                        {role.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {role.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setScreen(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeftIcon />
                Back
              </button>

              <button
                onClick={handleContinue}
                disabled={!selectedRole}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-semibold text-sm transition-all duration-150 disabled:cursor-not-allowed"
              >
                Start Estimator
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
