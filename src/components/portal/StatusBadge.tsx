import { QUOTE_STATUS_CONFIG, PROJECT_STATUS_CONFIG } from './portalData';
import type { QuoteStatus, ProjectStatus } from './portalData';

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config = QUOTE_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = PROJECT_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  );
}
