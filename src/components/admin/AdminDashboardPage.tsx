import { Link } from 'react-router';
import { DealStageBadge, MilestoneStatusBadge, ProjectStatusBadge, QuoteStatusBadge } from '../portal/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAdminCrm } from './AdminCrmContext';
import { useSalesCrm } from './SalesCrmContext';
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
import { getContactDisplayName } from './salesCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

export function AdminDashboardPage() {
  const { quotes, projects, activities, milestones, loading, error } = useAdminCrm();
  const { deals, contacts: salesContacts, accounts, loading: salesLoading, error: salesError } = useSalesCrm();

  if (loading || salesLoading) {
    return <AdminLoadingState label="Loading the CRM dashboard…" />;
  }

  const displayError = error || salesError;

  const hasData =
    quotes.length > 0 ||
    projects.length > 0 ||
    activities.length > 0 ||
    milestones.length > 0 ||
    deals.length > 0 ||
    salesContacts.length > 0 ||
    accounts.length > 0;

  if (displayError && !hasData) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
        {displayError}
      </div>
    );
  }

  const acceptedQuotes = quotes.filter((quote) => quote.status === 'accepted').length;
  const activeProjects = projects.filter((project) =>
    !['completed', 'archived'].includes(project.status),
  ).length;
  const completedMilestones = milestones.filter((milestone) => milestone.completed).length;
  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <>
      {displayError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {displayError}
        </div>
      )}

      <div className={`${PORTAL_HERO_SURFACE_CLASS} rounded-b-none border-b-0 p-6`}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-50">Master CRM Dashboard</h2>
          <p className="mt-1 text-sm text-slate-200">
            Sales pipeline, delivery operations, and client accounts — all from one place.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <AdminMetricCard
            label="Pipeline"
            value={formatCurrency(pipelineValue)}
            helper={`${openDeals.length} open deals`}
            accentClassName="text-blue-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Contacts"
            value={String(salesContacts.length)}
            helper={`${accounts.length} accounts`}
            accentClassName="text-purple-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Quotes"
            value={String(quotes.length)}
            helper={`${acceptedQuotes} accepted`}
            accentClassName="text-indigo-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Projects"
            value={String(projects.length)}
            helper={`${activeProjects} active`}
            accentClassName="text-emerald-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Milestones"
            value={String(milestones.length)}
            helper={`${completedMilestones} completed`}
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
          <Tabs defaultValue="deals" className="gap-4">
            <TabsList className="grid h-[70px] w-full grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1 dark:bg-slate-950 md:grid-cols-5">
              <TabsTrigger value="deals" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Deals</TabsTrigger>
              <TabsTrigger value="quotes" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Quotes</TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Projects</TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Activities</TabsTrigger>
              <TabsTrigger value="milestones" className="data-[state=active]:border-blue-500 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:data-[state=active]:border-blue-400 dark:data-[state=active]:bg-slate-950">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="deals">
              <AdminDataTable>
                <AdminDataTableHeader>
                  <AdminDataTableHeaderRow>
                    <AdminDataTableHead>Deal</AdminDataTableHead>
                    <AdminDataTableHead>Contact</AdminDataTableHead>
                    <AdminDataTableHead align="center">Stage</AdminDataTableHead>
                    <AdminDataTableHead align="right">Value</AdminDataTableHead>
                    <AdminDataTableHead>Last Updated</AdminDataTableHead>
                  </AdminDataTableHeaderRow>
                </AdminDataTableHeader>
                <AdminDataTableBody>
                  {deals.slice(0, 5).map((deal) => (
                    <AdminDataTableRow key={deal.id}>
                      <AdminDataTableCell className="whitespace-normal">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">{deal.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{deal.account?.name || deal.owner || 'Unassigned'}</p>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>{getContactDisplayName(deal.contact)}</AdminDataTableCell>
                      <AdminCenteredBadgeCell>
                        <DealStageBadge stage={deal.stage} />
                      </AdminCenteredBadgeCell>
                      <AdminDataTableCell className="text-right font-medium tabular-nums text-slate-900 dark:text-slate-50">
                        {formatCurrency(deal.value)}
                      </AdminDataTableCell>
                      <AdminDataTableCell>{formatDateTime(deal.updated_at)}</AdminDataTableCell>
                    </AdminDataTableRow>
                  ))}
                </AdminDataTableBody>
              </AdminDataTable>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/pipeline" label="Open pipeline" />
              </div>
            </TabsContent>

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
