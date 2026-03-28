import { Link } from 'react-router';
import { QuoteStatusBadge, ProjectStatusBadge } from '../portal/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useAdminCrm } from './AdminCrmContext';
import {
  AdminLoadingState,
  AdminMetricCard,
  AdminPreviewLink,
  AdminSectionCard,
} from './AdminWorkspaceComponents';
import {
  formatActivityType,
  formatCurrency,
  formatDate,
  formatDateTime,
  getProfileDisplayName,
} from './adminCrmApi';

export function AdminDashboardPage() {
  const { quotes, projects, activities, milestones, loading, error } = useAdminCrm();

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
  const blockedProjects = projects.filter((project) => project.status === 'blocked').length;
  const completedMilestones = milestones.filter((milestone) => milestone.completed).length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Quotes"
          value={String(quotes.length)}
          helper={`${acceptedQuotes} accepted`}
          accentClassName="text-blue-600 dark:text-blue-300"
        />
        <AdminMetricCard
          label="Projects"
          value={String(projects.length)}
          helper={`${activeProjects} active engagements`}
          accentClassName="text-indigo-600 dark:text-indigo-300"
        />
        <AdminMetricCard
          label="Activities"
          value={String(activities.length)}
          helper={`${blockedProjects} blocked project states`}
          accentClassName="text-cyan-600 dark:text-cyan-300"
        />
        <AdminMetricCard
          label="Milestones"
          value={String(milestones.length)}
          helper={`${completedMilestones} completed`}
          accentClassName="text-emerald-600 dark:text-emerald-300"
        />
      </div>

      <AdminSectionCard>
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Master CRM Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review every quote, project, activity, and milestone across all client accounts from one place.
          </p>
        </div>

        <div className="p-6">
          <Tabs defaultValue="quotes" className="gap-4">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/70 md:grid-cols-4">
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="quotes">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.slice(0, 5).map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="whitespace-normal">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">
                            {quote.metadata.company_name || quote.client?.company_name || 'Unnamed quote'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {quote.metadata.client_name || getProfileDisplayName(quote.client)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <QuoteStatusBadge status={quote.status} />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(quote.estimated_budget_min)} to {formatCurrency(quote.estimated_budget_max)}
                      </TableCell>
                      <TableCell>{formatDate(quote.updated_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/quotes" label="Open quotes workspace" />
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.slice(0, 5).map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="whitespace-normal">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">{project.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{project.company_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ProjectStatusBadge status={project.status} />
                      </TableCell>
                      <TableCell>{project.owner}</TableCell>
                      <TableCell>
                        {project.completedMilestoneCount}/{project.milestoneCount} milestones
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/projects" label="Open projects workspace" />
              </div>
            </TabsContent>

            <TabsContent value="activities">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.slice(0, 5).map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{formatActivityType(activity.type)}</TableCell>
                      <TableCell className="whitespace-normal">
                        {activity.project ? (
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-50">{activity.project.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{activity.project.company_name}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">{activity.record_id}</span>
                        )}
                      </TableCell>
                      <TableCell>{activity.actor || 'System'}</TableCell>
                      <TableCell>{formatDateTime(activity.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/activities" label="Open activities workspace" />
              </div>
            </TabsContent>

            <TabsContent value="milestones">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestones.slice(0, 5).map((milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell className="whitespace-normal">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">{milestone.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {milestone.description || 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>{formatDate(milestone.target_date)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            milestone.completed
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                          }`}
                        >
                          {milestone.completed ? 'Completed' : 'Open'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <AdminPreviewLink to="/portal/admin/milestones" label="Open milestones workspace" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminSectionCard>
    </div>
  );
}
