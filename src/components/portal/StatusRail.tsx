import type { ProjectStatus } from '../../types/portal';

interface StatusRailProps {
  currentStatus: ProjectStatus;
}

const LIFECYCLE_STEPS: { status: ProjectStatus; label: string }[] = [
  { status: 'intake', label: 'Intake' },
  { status: 'discovery', label: 'Discovery' },
  { status: 'scoping', label: 'Scoping' },
  { status: 'design_in_progress', label: 'Design' },
  { status: 'build_in_progress', label: 'Build' },
  { status: 'awaiting_client', label: 'Awaiting Client' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'uat', label: 'UAT' },
  { status: 'completed', label: 'Completed' },
  { status: 'archived', label: 'Archived' },
];

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function StatusRail({ currentStatus }: StatusRailProps) {
  const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <>
      {/* Desktop: horizontal stepper */}
      <div className="hidden md:flex items-start w-full overflow-x-auto pb-2">
        {LIFECYCLE_STEPS.map((step, idx) => {
          const isPast = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;
          const isBlocked = isCurrent && step.status === 'blocked';
          const isAwaiting = isCurrent && step.status === 'awaiting_client';
          const isLast = idx === LIFECYCLE_STEPS.length - 1;

          let circleClass = '';
          let connectorClass = 'bg-slate-700';
          let labelClass = 'text-slate-500';
          let ringClass = '';

          if (isPast) {
            circleClass = 'bg-blue-600 border-blue-600 text-white';
            connectorClass = 'bg-blue-600';
            labelClass = 'text-slate-400';
          } else if (isCurrent) {
            if (isBlocked) {
              circleClass = 'bg-red-600 border-red-500 text-white';
              ringClass = 'ring-2 ring-red-500/40 ring-offset-2 ring-offset-[#0F172B]';
              labelClass = 'text-red-400 font-semibold';
            } else if (isAwaiting) {
              circleClass = 'bg-amber-500 border-amber-400 text-white';
              ringClass = 'ring-2 ring-amber-500/40 ring-offset-2 ring-offset-[#0F172B]';
              labelClass = 'text-amber-400 font-semibold';
            } else {
              circleClass = 'bg-blue-600 border-blue-500 text-white';
              ringClass = 'ring-2 ring-blue-500/40 ring-offset-2 ring-offset-[#0F172B]';
              labelClass = 'text-blue-400 font-semibold';
            }
          } else {
            circleClass = 'bg-slate-800 border-slate-600 text-slate-500';
            labelClass = 'text-slate-600';
          }

          return (
            <div key={step.status} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Circle node */}
                <div
                  className={`
                    flex items-center justify-center rounded-full border-2
                    ${isCurrent ? 'w-8 h-8' : 'w-6 h-6'}
                    ${circleClass}
                    ${ringClass}
                    transition-all duration-200
                  `}
                >
                  {isPast ? (
                    <CheckIcon />
                  ) : isCurrent ? (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  ) : (
                    <span className="text-xs text-slate-500">{idx + 1}</span>
                  )}
                </div>
                {/* Label below */}
                <span className={`mt-1.5 text-[10px] leading-tight text-center whitespace-nowrap ${labelClass}`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className={`flex-1 h-0.5 mt-3 mx-1 rounded-full ${connectorClass}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact current-state indicator */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Current state badge */}
        <div className="flex items-center gap-3">
          {(() => {
            const isCurrent = true;
            const isBlocked = currentStatus === 'blocked';
            const isAwaiting = currentStatus === 'awaiting_client';
            let badgeClass = 'bg-blue-600/20 border-blue-500/40 text-blue-400';
            let dotClass = 'bg-blue-500';
            if (isBlocked) {
              badgeClass = 'bg-red-600/20 border-red-500/40 text-red-400';
              dotClass = 'bg-red-500';
            } else if (isAwaiting) {
              badgeClass = 'bg-amber-500/20 border-amber-400/40 text-amber-400';
              dotClass = 'bg-amber-400';
            }
            const currentLabel = LIFECYCLE_STEPS.find((s) => s.status === currentStatus)?.label ?? currentStatus;
            return (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${dotClass} animate-pulse`} />
                {currentLabel}
              </div>
            );
          })()}
          <span className="text-slate-500 text-xs">
            Step {currentIndex + 1} of {LIFECYCLE_STEPS.length}
          </span>
        </div>

        {/* Mini rail: show all steps as small dots */}
        <div className="flex items-center gap-1 flex-wrap">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isPast = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isBlocked = isCurrent && step.status === 'blocked';
            const isAwaiting = isCurrent && step.status === 'awaiting_client';

            let dotClass = 'w-2 h-2 rounded-full bg-slate-700';
            if (isPast) dotClass = 'w-2 h-2 rounded-full bg-blue-600';
            else if (isCurrent) {
              if (isBlocked) dotClass = 'w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/30';
              else if (isAwaiting) dotClass = 'w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-400/30';
              else dotClass = 'w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/30';
            }

            return (
              <span
                key={step.status}
                className={dotClass}
                title={step.label}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
