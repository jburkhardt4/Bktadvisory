import { useState } from 'react';
import { PortalAppShell } from './PortalAppShell';
import { UserProfileCard } from './UserProfileCard';
import { QuotesTable } from './QuotesTable';
import { ProjectSegmentedView } from './ProjectSegmentedView';
import { ActivityTimeline } from './ActivityTimeline';
import { mockQuotes, mockProjects } from '../../mocks/portalData';

type NavSection = 'dashboard' | 'quotes' | 'projects' | 'activity' | 'settings';

function formatUSD(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 space-y-1">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</div>
      <div className="text-white text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="text-slate-500 text-xs">{sub}</div>}
    </div>
  );
}

function DashboardContent() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const totalQuotes = mockQuotes.length;
  const activeProjects = mockProjects.filter((p) =>
    ['intake', 'discovery', 'scoping', 'design_in_progress', 'build_in_progress'].includes(p.status)
  ).length;
  const pendingActions = mockQuotes.filter((q) =>
    ['revision_requested', 'sent'].includes(q.status)
  ).length;
  const pipelineValue = mockQuotes.reduce((sum, q) => sum + q.amount, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, Sarah</h1>
        <p className="text-slate-400 text-sm mt-1">{today}</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Quotes" value={String(totalQuotes)} sub="Across all statuses" />
        <StatCard label="Active Projects" value={String(activeProjects)} sub="In progress" />
        <StatCard label="Pending Actions" value={String(pendingActions)} sub="Require your attention" />
        <StatCard label="Total Pipeline" value={formatUSD(pipelineValue)} sub="Combined quote value" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: wider main content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Quotes section */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">Quotes</h2>
            <QuotesTable />
          </section>

          {/* Projects section */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">Projects</h2>
            <ProjectSegmentedView />
          </section>
        </div>

        {/* Right: narrower sidebar content */}
        <div className="space-y-6">
          {/* Profile */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">Your Profile</h2>
            <UserProfileCard />
          </section>

          {/* Activity */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">Recent Activity</h2>
            <ActivityTimeline />
          </section>
        </div>
      </div>
    </div>
  );
}

function QuotesSectionContent() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Quotes</h1>
      <QuotesTable />
    </div>
  );
}

function ProjectsSectionContent() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Projects</h1>
      <ProjectSegmentedView />
    </div>
  );
}

function ActivitySectionContent() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Activity</h1>
      <ActivityTimeline />
    </div>
  );
}

export function PortalDashboardPage() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'quotes':    return <QuotesSectionContent />;
      case 'projects':  return <ProjectsSectionContent />;
      case 'activity':  return <ActivitySectionContent />;
      default:          return <DashboardContent />;
    }
  };

  return (
    <PortalAppShell activeSection={activeSection} onNavigate={setActiveSection}>
      {renderSection()}
    </PortalAppShell>
  );
}
