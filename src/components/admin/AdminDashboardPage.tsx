import { Link } from 'react-router';
import { MilestoneStatusBadge, ProjectStatusBadge, QuoteStatusBadge } from '../portal/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAdminCrm } from './AdminCrmContext';
import {
  AdminCenteredBadgeCell,
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableHead,
  AdminDataTableHeader,
  AdminDataTableHeaderRow,
  AdminDataTableRow,
  AdminLoadingState,
  AdminMetricCard,
  AdminPreviewLink,
} from './AdminWorkspaceComponents';
import {
  formatActivityType,
  formatCurrency,
  formatDate,
  formatDateTime,
  getProfileDisplayName,
} from './adminCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

export function AdminDashboardPage() {
  const { quotes, projects, activities, milestones, opportunities, loading, error } = useAdminCrm();

  if (loading) {
    return <AdminLoadingState label="Loading the CRM dashboard…" />;
  }

  const hasData =
    quotes.length > 0 ||
    projects.length > 0 ||
    activities.length > 0 ||
    milestones.length > 0;

  if (error && !hasData) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  const acceptedQuotes = quotes.filter((quote) => quote.status === 'accepted').length;
  const activeProjects = projects.filter((project) =>
    !['completed', 'archived'].includes(project.status),
  ).length;
  const completedMilestones = milestones.filter((milestone) => milestone.completed).length;
  const openOpportunities = opportunities.filter(
    (o) => o.status !== 'closed_won' && o.status !== 'closed_lost',
  ).length;

  return (
    <>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className={`${PORTAL_HERO_SURFACE_CLASS} rounded-b-none border-b-0 p-6`}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-50">Master CRM Dashboard</h2>
          <p className="mt-1 text-sm text-slate-200">
            Review every quote, project, activity, and milestone across all client accounts from one place.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            label="Quotes"
            value={String(quotes.length)}
            helper={`${acceptedQuotes} accepted`}
            accentClassName="text-blue-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Projects"
            value={String(projects.length)}
            helper={`${activeProjects} active engagements`}
            accentClassName="text-indigo-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Milestones"
            value={String(milestones.length)}
            helper={`${completedMilestones} completed`}
            accentClassName="text-emerald-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Opportunities"
            value={String(opportunities.length)}
            helper={`${openOpportunities} open in pipeline`}
            accentClassName="text-cyan-200"
            variant="hero"
          />
        </div>
      </div>

      <div className="bkt-shell-surface rounded-t-none border-t-0">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Operations Overview</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drill into quotes, projects, activities, and milestones from the shared CRM workspace.
          </p>
        </div>

        <div className="p-6">
          <Tabs defaultValue="quotes" className="gap-4">
            <TabsList className="grid h-[70px] w-full grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1 dark:bg-slate-950 md:grid-cols-4">
              <TabsTrigger value="quotes" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Quotes</TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Projects</TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Activities</TabsTrigger>
              <TabsTrigger value="milestones" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="quotes">
              <AdminDataTable>
                <AdminDataTableHeader>
                  <AdminDataTableHeaderRow>
                    <AdminDataTableHead>Client</AdminDataTableHead>
                    <AdminDataTableHead align="center">Status</AdminDataTableHead>
                    <AdminDataTableHead>Budget</AdminDataTableHead>
                    <AdminDataTableHead>Last Updated</AdminDataTableHead>
                    <AdminDataTableHead>Created</AdminDataTableHead>
                  </AdminDataTableHeaderRow>
                </AdminDataTableHeader>
                <AdminDataTableBody>
                  {quotes.slice(0, 5).map((quote) => (
                    <AdminDataTableRow key={quote.id}>
                      <AdminDataTableCell className="whitespace-normal">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">
                            {quote.metadata.company_name || quote.client?.company_name || 'Unnamed quote'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {quote.metadata.client_name || getProfileDisplayName(quote.client)}
                          </p>
                        </div>
                      </AdminDataTableCell>
                      <AdminCenteredBadgeCell>
                        <QuoteStatusBadge status={quote.status} />
                      </AdminCenteredBadgeCell>
                      <AdminDataTableCell>
                        {formatCurrency(quote.estimated_budget_min)} to {formatCurrency(quote.estimated_budget_max)}
                      </AdminDataTableCell>
                      <AdminDataTableCell>{formatDateTime(quote.updated_at)}</AdminDataTableCell>
                      <AdminDataTableCell>{formatDateTime(quote.created_at)}</AdminDataTableCell>
                    </AdminDataTableRow>
                  ))}
                </AdminDataTableBody>
              </AdminDataTable>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/quotes" label="Open quotes workspace" />
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <AdminDataTable>
                <AdminDataTableHeader>
                  <AdminDataTableHeaderRow>
                    <AdminDataTableHead>Project</AdminDataTableHead>
                    <AdminDataTableHead>Client</AdminDataTableHead>
                    <AdminDataTableHead align="center">Status</AdminDataTableHead>
                    <AdminDataTableHead>Owner</AdminDataTableHead>
                    <AdminDataTableHead>Progress</AdminDataTableHead>
                    <AdminDataTableHead>Last Updated</AdminDataTableHead>
                    <AdminDataTableHead>Created</AdminDataTableHead>
                  </AdminDataTableHeaderRow>
                </AdminDataTableHeader>
                <AdminDataTableBody>
                  {projects.slice(0, 5).map((project) => (
                    <AdminDataTableRow key={project.id}>
                      <AdminDataTableCell className="whitespace-normal">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">{project.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{project.company_name}</p>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>{getProfileDisplayName(project.client)}</AdminDataTableCell>
                      <AdminCenteredBadgeCell>
                        <ProjectStatusBadge status={project.status} />
                      </AdminCenteredBadgeCell>
                      <AdminDataTableCell>{project.owner}</AdminDataTableCell>
                      <AdminDataTableCell>
                        {project.completedMilestoneCount}/{project.milestoneCount} milestones
                      </AdminDataTableCell>
                      <AdminDataTableCell>{formatDateTime(project.updated_at)}</AdminDataTableCell>
                      <AdminDataTableCell>{formatDateTime(project.created_at)}</AdminDataTableCell>
                    </AdminDataTableRow>
                  ))}
                </AdminDataTableBody>
              </AdminDataTable>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/projects" label="Open projects workspace" />
              </div>
            </TabsContent>

            <TabsContent value="activities">
              <AdminDataTable>
                <AdminDataTableHeader>
                  <AdminDataTableHeaderRow>
                    <AdminDataTableHead>Type</AdminDataTableHead>
                    <AdminDataTableHead>Client</AdminDataTableHead>
                    <AdminDataTableHead>Project</AdminDataTableHead>
                    <AdminDataTableHead>Actor</AdminDataTableHead>
                    <AdminDataTableHead>Created</AdminDataTableHead>
                  </AdminDataTableHeaderRow>
                </AdminDataTableHeader>
                <AdminDataTableBody>
                  {activities.slice(0, 5).map((activity) => (
                    <AdminDataTableRow key={activity.id}>
                      <AdminDataTableCell>{formatActivityType(activity.type)}</AdminDataTableCell>
                      <AdminDataTableCell>{getProfileDisplayName(activity.client)}</AdminDataTableCell>
                      <AdminDataTableCell className="whitespace-normal">
                        {activity.project ? (
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-50">{activity.project.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{activity.project.company_name}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">{activity.record_id}</span>
                        )}
                      </AdminDataTableCell>
                      <AdminDataTableCell>{activity.actor || 'System'}</AdminDataTableCell>
                      <AdminDataTableCell>{formatDateTime(activity.created_at)}</AdminDataTableCell>
                    </AdminDataTableRow>
                  ))}
                </AdminDataTableBody>
              </AdminDataTable>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/activities" label="Open activities workspace" />
              </div>
            </TabsContent>

            <TabsContent value="milestones">
              <AdminDataTable>
                <AdminDataTableHeader>
                  <AdminDataTableHeaderRow>
                    <AdminDataTableHead>Milestone</AdminDataTableHead>
                    <AdminDataTableHead>Client</AdminDataTableHead>
                    <AdminDataTableHead>Project</AdminDataTableHead>
                    <AdminDataTableHead>Due</AdminDataTableHead>
                    <AdminDataTableHead align="center">Status</AdminDataTableHead>
                  </AdminDataTableHeaderRow>
                </AdminDataTableHeader>
                <AdminDataTableBody>
                  {milestones.slice(0, 5).map((milestone) => (
                    <AdminDataTableRow key={milestone.id}>
                      <AdminDataTableCell className="whitespace-normal">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">{milestone.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {milestone.description || 'No description'}
                          </p>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>{getProfileDisplayName(milestone.client)}</AdminDataTableCell>
                      <AdminDataTableCell>
                        {milestone.project ? (
                          <Link
                            to="/portal/admin/projects"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                          >
                            {milestone.project.name}
                          </Link>
                        ) : (
                          'Unknown project'
                        )}
                      </AdminDataTableCell>
                      <AdminDataTableCell>{formatDate(milestone.target_date)}</AdminDataTableCell>
                      <AdminCenteredBadgeCell>
                        <MilestoneStatusBadge completed={milestone.completed} />
                      </AdminCenteredBadgeCell>
                    </AdminDataTableRow>
                  ))}
                </AdminDataTableBody>
              </AdminDataTable>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/milestones" label="Open milestones workspace" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
