import { cn } from '../ui/utils';
import { QUOTE_STATUS_CONFIG, PROJECT_STATUS_CONFIG } from './portalData';
import type { QuoteStatus, ProjectStatus } from './portalData';

function BaseStatusBadge({
  label,
  className,
  dotClassName,
}: {
  label: string;
  className?: string;
  dotClassName: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotClassName)} />
      {label}
    </span>
  );
}

export function QuoteStatusBadge({
  status,
  className,
}: {
  status: QuoteStatus;
  className?: string;
}) {
  const config = QUOTE_STATUS_CONFIG[status];
  return (
    <BaseStatusBadge
      label={config.label}
      className={cn(config.bg, config.color, className)}
      dotClassName={config.color.replace('text-', 'bg-')}
    />
  );
}

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const config = PROJECT_STATUS_CONFIG[status];
  return (
    <BaseStatusBadge
      label={config.label}
      className={cn('capitalize', config.bg, config.color, className)}
      dotClassName={config.color.replace('text-', 'bg-')}
    />
  );
}

export function MilestoneStatusBadge({
  completed,
  className,
}: {
  completed: boolean;
  className?: string;
}) {
  return (
    <BaseStatusBadge
      label={completed ? 'Completed' : 'Open'}
      className={cn(
        completed
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400'
          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400',
        className,
      )}
      dotClassName={completed ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'}
    />
  );
}
