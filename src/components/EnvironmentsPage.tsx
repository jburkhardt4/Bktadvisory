import { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Lock, Route, ShieldCheck, Sparkles } from 'lucide-react';
import {
  environmentManifest,
  getEnvironmentById,
  type EnvironmentAuthLevel,
  type EnvironmentDescriptor,
  type EnvironmentId,
  type WeeklyChange,
} from '../environments';

type ViewMode = 'map' | 'timeline';

type TimelineGroup = {
  date: string;
  items: Array<{
    environmentId: EnvironmentId;
    environmentLabel: string;
    change: WeeklyChange;
  }>;
};

const authCopy: Record<EnvironmentAuthLevel, { badge: string; detail: string }> = {
  public: {
    badge: 'Public',
    detail: 'Visible without sign-in.',
  },
  authenticated: {
    badge: 'Authenticated',
    detail: 'Requires sign-in before the surface is actually usable.',
  },
  admin: {
    badge: 'Admin only',
    detail: 'Protected by both authentication and admin-role checks.',
  },
};

const kindCopy: Record<EnvironmentDescriptor['kind'], string> = {
  'marketing-site': 'Public marketing shell',
  authentication: 'Auth entry surface',
  'client-portal': 'Client workspace',
  'admin-portal': 'Admin workspace',
  'standalone-app': 'Standalone sibling deployment',
};

function groupTimeline(): TimelineGroup[] {
  const groups = new Map<string, TimelineGroup>();

  for (const environment of environmentManifest) {
    for (const change of environment.weeklyChanges) {
      const existing = groups.get(change.date);
      const item = {
        environmentId: environment.id,
        environmentLabel: environment.label,
        change,
      };

      if (existing) {
        existing.items.push(item);
        continue;
      }

      groups.set(change.date, {
        date: change.date,
        items: [item],
      });
    }
  }

  return [...groups.values()].sort((left, right) => right.date.localeCompare(left.date));
}

function EnvironmentBadge({ level }: { level: EnvironmentAuthLevel }) {
  const copy = authCopy[level];
  const icon =
    level === 'admin' ? (
      <ShieldCheck className="h-3.5 w-3.5" />
    ) : level === 'authenticated' ? (
      <Lock className="h-3.5 w-3.5" />
    ) : (
      <Sparkles className="h-3.5 w-3.5" />
    );

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase text-slate-100">
      {icon}
      {copy.badge}
    </span>
  );
}

function EnvironmentNode({
  environment,
  selected,
  onSelect,
}: {
  environment: EnvironmentDescriptor;
  selected: boolean;
  onSelect: (id: EnvironmentId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(environment.id)}
      className={[
        'group w-full rounded-[1.75rem] border p-5 text-left transition duration-200',
        'bg-slate-950/75 backdrop-blur-md',
        selected
          ? 'border-blue-300/70 shadow-[0_18px_45px_rgba(29,78,216,0.26)]'
          : 'border-white/10 hover:border-blue-200/40 hover:bg-slate-900/80',
      ].join(' ')}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">
            {kindCopy[environment.kind]}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{environment.label}</h3>
        </div>
        <EnvironmentBadge level={environment.authLevel} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{environment.statusNote}</p>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>{environment.entryRoute}</span>
        <span className="inline-flex items-center gap-1 text-blue-100">
          Inspect
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

export function EnvironmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedEnvironmentId, setSelectedEnvironmentId] =
    useState<EnvironmentId>('marketing');

  const selectedEnvironment = getEnvironmentById(selectedEnvironmentId) ?? environmentManifest[0];
  const timelineGroups = useMemo(() => groupTimeline(), []);

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.26),_transparent_42%),linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#111827_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.04)_0%,transparent_28%,transparent_72%,rgba(96,165,250,0.06)_100%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200/80">
            Environment Map
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            See the product surfaces, boundaries, and last week of changes in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            This page turns the current codespace into a visual index for the marketing site,
            auth gateway, client portal, admin portal, and standalone estimator deployment.
          </p>
        </div>

        <div className="mt-10 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              viewMode === 'map'
                ? 'bg-blue-500 text-slate-950'
                : 'text-slate-300 hover:text-white',
            ].join(' ')}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              viewMode === 'timeline'
                ? 'bg-blue-500 text-slate-950'
                : 'text-slate-300 hover:text-white',
            ].join(' ')}
          >
            Last 7 Days
          </button>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur-md sm:p-7">
            {viewMode === 'map' ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {environmentManifest
                    .filter((environment) =>
                      ['marketing', 'auth'].includes(environment.id),
                    )
                    .map((environment) => (
                      <EnvironmentNode
                        key={environment.id}
                        environment={environment}
                        selected={selectedEnvironment.id === environment.id}
                        onSelect={setSelectedEnvironmentId}
                      />
                    ))}
                </div>

                <div className="flex flex-col gap-3 rounded-[1.5rem] border border-blue-300/20 bg-blue-500/10 p-4 text-sm text-blue-100 md:flex-row md:items-center md:justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    Public shell routes users from navigation into auth and protected portal paths.
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/20 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                    Shared root app
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {environmentManifest
                    .filter((environment) =>
                      ['client-portal', 'admin-portal'].includes(environment.id),
                    )
                    .map((environment) => (
                      <EnvironmentNode
                        key={environment.id}
                        environment={environment}
                        selected={selectedEnvironment.id === environment.id}
                        onSelect={setSelectedEnvironmentId}
                      />
                    ))}
                </div>

                <div className="rounded-[1.75rem] border border-amber-200/20 bg-amber-400/10 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 text-sm text-amber-50 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                        Cross-App Boundary
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        Redirect from /estimator to https://estimator.bktadvisory.com
                      </p>
                      <p className="mt-1 text-sm leading-6 text-amber-50/80">
                        The root router exposes the entry route, then hands off to the standalone estimator deployment.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEnvironmentId('standalone-estimator')}
                      className="inline-flex items-center justify-center rounded-full border border-amber-100/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Focus estimator
                    </button>
                  </div>
                </div>

                <EnvironmentNode
                  environment={getEnvironmentById('standalone-estimator')!}
                  selected={selectedEnvironment.id === 'standalone-estimator'}
                  onSelect={setSelectedEnvironmentId}
                />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm leading-6 text-slate-300">
                    Grouped commit summary for <span className="font-semibold text-white">2026-03-30</span> through{' '}
                    <span className="font-semibold text-white">2026-04-06</span>.
                  </p>
                </div>
                {timelineGroups.map((group) => (
                  <article
                    key={group.date}
                    className="rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-white">{group.date}</h2>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                        {group.items.length} update{group.items.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="mt-4 space-y-4">
                      {group.items.map((item) => (
                        <div
                          key={`${group.date}-${item.environmentId}-${item.change.title}`}
                          className="rounded-[1.25rem] border border-white/8 bg-white/5 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/80">
                                {item.environmentLabel}
                              </p>
                              <h3 className="mt-1 text-base font-semibold text-white">
                                {item.change.title}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEnvironmentId(item.environmentId);
                                setViewMode('map');
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-blue-200/40 hover:text-white"
                            >
                              Inspect surface
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            {item.change.summary}
                          </p>
                          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                            Commits: {item.change.commits.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">
              Details Drawer
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{selectedEnvironment.label}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{selectedEnvironment.statusNote}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <EnvironmentBadge level={selectedEnvironment.authLevel} />
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                {selectedEnvironment.hostType.replace('-', ' ')}
              </span>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Entry route
                </dt>
                <dd className="mt-2 text-base font-semibold text-white">
                  {selectedEnvironment.entryRoute}
                </dd>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Local preview
                </dt>
                <dd className="mt-2 flex items-center justify-between gap-3">
                  <span className="break-all text-slate-100">{selectedEnvironment.localUrl}</span>
                  <a
                    href={selectedEnvironment.localUrl}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-blue-200/40 hover:text-white"
                  >
                    Open
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </dd>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Live target
                </dt>
                <dd className="mt-2 break-all text-slate-100">
                  {selectedEnvironment.livePathOrDomain}
                </dd>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Auth requirement
                </dt>
                <dd className="mt-2 text-slate-100">
                  {authCopy[selectedEnvironment.authLevel].detail}
                </dd>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Repo ownership
                </dt>
                <dd className="mt-2 text-slate-100">{selectedEnvironment.sourceRepo}</dd>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Depends on
                </dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {selectedEnvironment.dependsOn.map((dependencyId) => {
                    const dependency = getEnvironmentById(dependencyId);
                    if (!dependency) return null;

                    return (
                      <button
                        key={dependency.id}
                        type="button"
                        onClick={() => setSelectedEnvironmentId(dependency.id)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-blue-200/40 hover:text-white"
                      >
                        {dependency.label}
                      </button>
                    );
                  })}
                </dd>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Weekly changes
                </dt>
                <dd className="mt-4 space-y-3">
                  {selectedEnvironment.weeklyChanges.map((change) => (
                    <div
                      key={`${selectedEnvironment.id}-${change.date}-${change.title}`}
                      className="rounded-[1rem] border border-white/8 bg-slate-900/60 p-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
                        {change.date}
                      </p>
                      <p className="mt-2 font-semibold text-white">{change.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{change.summary}</p>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </main>
  );
}
