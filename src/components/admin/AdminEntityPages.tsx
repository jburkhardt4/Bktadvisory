import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import {
  MilestoneStatusBadge,
  ProjectStatusBadge,
  QuoteStatusBadge,
} from '../portal/StatusBadge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useAdminCrm } from './AdminCrmContext';
import {
  AdminActivityForm,
  AdminMilestoneForm,
  AdminProjectForm,
  AdminQuoteForm,
} from './AdminEntityForms';
import {
  AdminCenteredBadgeCell,
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableHead,
  AdminDataTableHeader,
  AdminDataTableHeaderRow,
  AdminDataTableRow,
  AdminDeleteDialog,
  AdminEmptyState,
  AdminLoadingState,
  AdminSectionCard,
  AdminWorkspaceHeader,
} from './AdminWorkspaceComponents';
import {
  createAdminActivity,
  createAdminMilestone,
  createAdminProject,
  createAdminQuote,
  deleteAdminActivity,
  deleteAdminMilestone,
  deleteAdminProject,
  deleteAdminQuote,
  formatActivityType,
  formatCurrency,
  formatDate,
  formatDateTime,
  getProfileDisplayName,
  updateAdminActivity,
  updateAdminMilestone,
  updateAdminProject,
  updateAdminQuote,
  type AdminActivityRecord,
  type AdminMilestoneRecord,
  type AdminProjectRecord,
  type AdminQuoteRecord,
  type ProjectRecord,
} from './adminCrmApi';

function WorkspaceErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}

function RowActionButton({
  label,
  onClick,
  destructive = false,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={
        destructive
          ? 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50'
      }
    >
      {label}
    </Button>
  );
}

function resolveProject(projects: ProjectRecord[], projectId: string) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function AdminQuotesPage() {
  const { role } = useAuth();
  const { quotes, profiles, loading, error, isRefreshing, refreshData } = useAdminCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<AdminQuoteRecord | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<AdminQuoteRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(values: Parameters<typeof createAdminQuote>[0]) {
    const client = profiles.find((profile) => profile.id === values.clientId) ?? null;
    await createAdminQuote(values, client);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Quote created successfully.');
  }

  async function handleUpdate(values: Parameters<typeof updateAdminQuote>[1]) {
    if (!editingQuote) return;

    const client = profiles.find((profile) => profile.id === values.clientId) ?? null;
    await updateAdminQuote(editingQuote.id, values, client);
    await refreshData();
    setEditingQuote(null);
    toast.success('Quote updated successfully.');
  }

  async function handleDelete() {
    if (!deletingQuote) return;

    setIsDeleting(true);

    try {
      await deleteAdminQuote(deletingQuote.id);
      await refreshData();
      toast.success('Quote deleted successfully.');
      setDeletingQuote(null);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'We could not delete the quote.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <AdminLoadingState label="Loading quotes workspace…" />;
  }

  const hasData = quotes.length > 0;

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <AdminSectionCard>
        <AdminWorkspaceHeader
          title="Quotes CRM"
          description="Manage every quote request, pricing range, and client assignment across the portal."
          count={quotes.length}
          actionLabel="New Quote"
          onAction={() => setIsCreateOpen(true)}
          isRefreshing={isRefreshing}
        />

        {!hasData ? (
          <AdminEmptyState
            title="No quotes yet"
            description="Once a quote is created or imported, it will appear here for admin review and editing."
            actionLabel="Create the first quote"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <AdminDataTable>
            <AdminDataTableHeader>
              <AdminDataTableHeaderRow>
                <AdminDataTableHead>Reference</AdminDataTableHead>
                <AdminDataTableHead>Client</AdminDataTableHead>
                <AdminDataTableHead align="center">Status</AdminDataTableHead>
                <AdminDataTableHead>Budget</AdminDataTableHead>
                <AdminDataTableHead align="right">Last Updated</AdminDataTableHead>
                <AdminDataTableHead align="right">Created</AdminDataTableHead>
                <AdminDataTableHead align="right">Actions </AdminDataTableHead>
              </AdminDataTableHeaderRow>
            </AdminDataTableHeader>
            <AdminDataTableBody>
              {quotes.map((quote) => (
                <AdminDataTableRow key={quote.id}>
                  <AdminDataTableCell className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400">
                    {quote.id.slice(0, 8)}
                  </AdminDataTableCell>
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
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {formatCurrency(quote.estimated_budget_min)} to {formatCurrency(quote.estimated_budget_max)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {quote.metadata.description || 'No description'}
                    </p>
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right">{formatDateTime(quote.updated_at)}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">{formatDateTime(quote.created_at)}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <RowActionButton label="Edit" onClick={() => setEditingQuote(quote)} />
                      {role === 'admin' && (
                        <RowActionButton
                          label="Delete"
                          destructive
                          onClick={() => setDeletingQuote(quote)}
                        />
                      )}
                    </div>
                  </AdminDataTableCell>
                </AdminDataTableRow>
              ))}
            </AdminDataTableBody>
          </AdminDataTable>
        )}
      </AdminSectionCard>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Quote</DialogTitle>
            <DialogDescription>Capture a new quote and assign it to the correct client account.</DialogDescription>
          </DialogHeader>
          <AdminQuoteForm clients={profiles} onCancel={() => setIsCreateOpen(false)} onSave={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={editingQuote != null} onOpenChange={(open) => !open && setEditingQuote(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
            <DialogDescription>Update budget ranges, lifecycle status, and client ownership.</DialogDescription>
          </DialogHeader>
          {editingQuote && (
            <AdminQuoteForm
              clients={profiles}
              initialRecord={editingQuote}
              onCancel={() => setEditingQuote(null)}
              onSave={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={deletingQuote != null}
        onOpenChange={(open) => !open && setDeletingQuote(null)}
        title="Delete quote?"
        description="This permanently removes the quote record from the CRM."
        confirmLabel="Delete Quote"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function AdminProjectsPage() {
  const { role } = useAuth();
  const { projects, profiles, loading, error, isRefreshing, refreshData } = useAdminCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProjectRecord | null>(null);
  const [deletingProject, setDeletingProject] = useState<AdminProjectRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(values: Parameters<typeof createAdminProject>[0]) {
    await createAdminProject(values);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Project created successfully.');
  }

  async function handleUpdate(values: Parameters<typeof updateAdminProject>[1]) {
    if (!editingProject) return;

    const client = profiles.find((profile) => profile.id === values.clientId) ?? null;
    await updateAdminProject(editingProject.id, values, client);
    await refreshData();
    setEditingProject(null);
    toast.success('Project updated successfully.');
  }

  async function handleDelete() {
    if (!deletingProject) return;

    setIsDeleting(true);

    try {
      await deleteAdminProject(deletingProject.id);
      await refreshData();
      toast.success('Project and related records deleted successfully.');
      setDeletingProject(null);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'We could not delete the project.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <AdminLoadingState label="Loading projects workspace…" />;
  }

  const hasData = projects.length > 0;

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <AdminSectionCard>
        <AdminWorkspaceHeader
          title="Projects CRM"
          description="Manage ownership, delivery status, target milestones, and client assignments for every project."
          count={projects.length}
          actionLabel="New Project"
          onAction={() => setIsCreateOpen(true)}
          isRefreshing={isRefreshing}
        />

        {!hasData ? (
          <AdminEmptyState
            title="No projects yet"
            description="Create the first project to begin managing delivery work inside the admin CRM."
            actionLabel="Create the first project"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <AdminDataTable>
            <AdminDataTableHeader>
              <AdminDataTableHeaderRow>
                <AdminDataTableHead>Project</AdminDataTableHead>
                <AdminDataTableHead>Client</AdminDataTableHead>
                <AdminDataTableHead align="center">Status</AdminDataTableHead>
                <AdminDataTableHead>Progress</AdminDataTableHead>
                <AdminDataTableHead align="right">Last Updated</AdminDataTableHead>
                <AdminDataTableHead align="right">Created</AdminDataTableHead>
                <AdminDataTableHead align="right">Actions </AdminDataTableHead>
              </AdminDataTableHeaderRow>
            </AdminDataTableHeader>
            <AdminDataTableBody>
              {projects.map((project) => (
                <AdminDataTableRow key={project.id}>
                  <AdminDataTableCell className="whitespace-normal">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">{project.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {project.description || project.target_milestone}
                      </p>
                    </div>
                  </AdminDataTableCell>
                  <AdminDataTableCell className="whitespace-normal">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {project.client?.company_name || project.company_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {getProfileDisplayName(project.client)}
                      </p>
                    </div>
                  </AdminDataTableCell>
                  <AdminCenteredBadgeCell>
                    <ProjectStatusBadge status={project.status} />
                  </AdminCenteredBadgeCell>
                  <AdminDataTableCell>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {project.completedMilestoneCount}/{project.milestoneCount} milestones
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {project.activityCount} activities logged
                    </p>
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right">{formatDateTime(project.updated_at)}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">{formatDateTime(project.created_at)}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <RowActionButton label="Edit" onClick={() => setEditingProject(project)} />
                      {role === 'admin' && (
                        <RowActionButton
                          label="Delete"
                          destructive
                          onClick={() => setDeletingProject(project)}
                        />
                      )}
                    </div>
                  </AdminDataTableCell>
                </AdminDataTableRow>
              ))}
            </AdminDataTableBody>
          </AdminDataTable>
        )}
      </AdminSectionCard>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>Assign the project to a client and define the delivery metadata.</DialogDescription>
          </DialogHeader>
          <AdminProjectForm
            clients={profiles}
            onCancel={() => setIsCreateOpen(false)}
            onSave={handleCreate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editingProject != null} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update the project owner, status, description, target milestone, and client relationship.</DialogDescription>
          </DialogHeader>
          {editingProject && (
            <AdminProjectForm
              clients={profiles}
              initialRecord={editingProject}
              onCancel={() => setEditingProject(null)}
              onSave={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={deletingProject != null}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        title="Delete project?"
        description="This deletes the project and its related milestones and activity history."
        confirmLabel="Delete Project"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function AdminActivitiesPage() {
  const { role } = useAuth();
  const { activities, projects, loading, error, isRefreshing, refreshData } = useAdminCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<AdminActivityRecord | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<AdminActivityRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(values: Parameters<typeof createAdminActivity>[0]) {
    const project = resolveProject(projects, values.projectId);
    await createAdminActivity(values, project);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Activity created successfully.');
  }

  async function handleUpdate(values: Parameters<typeof updateAdminActivity>[1]) {
    if (!editingActivity) return;

    const project = resolveProject(projects, values.projectId);
    await updateAdminActivity(editingActivity.id, values, project);
    await refreshData();
    setEditingActivity(null);
    toast.success('Activity updated successfully.');
  }

  async function handleDelete() {
    if (!deletingActivity) return;

    setIsDeleting(true);

    try {
      await deleteAdminActivity(deletingActivity.id);
      await refreshData();
      toast.success('Activity deleted successfully.');
      setDeletingActivity(null);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'We could not delete the activity.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <AdminLoadingState label="Loading activities workspace…" />;
  }

  const hasData = activities.length > 0;

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <AdminSectionCard>
        <AdminWorkspaceHeader
          title="Activities CRM"
          description="Create, edit, and remove timeline events across every project record in the portal."
          count={activities.length}
          actionLabel="New Activity"
          onAction={() => setIsCreateOpen(true)}
          isRefreshing={isRefreshing}
        />

        {!hasData ? (
          <AdminEmptyState
            title="No activities yet"
            description="Project timeline entries will appear here as soon as they are created."
            actionLabel="Create the first activity"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <AdminDataTable>
            <AdminDataTableHeader>
              <AdminDataTableHeaderRow>
                <AdminDataTableHead>Type</AdminDataTableHead>
                <AdminDataTableHead>Project</AdminDataTableHead>
                <AdminDataTableHead>Client</AdminDataTableHead>
                <AdminDataTableHead>Actor</AdminDataTableHead>
                <AdminDataTableHead align="right">Created</AdminDataTableHead>
                <AdminDataTableHead align="right">Actions </AdminDataTableHead>
              </AdminDataTableHeaderRow>
            </AdminDataTableHeader>
            <AdminDataTableBody>
              {activities.map((activity) => (
                <AdminDataTableRow key={activity.id}>
                  <AdminDataTableCell className="whitespace-normal">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {formatActivityType(activity.type)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.description}
                      </p>
                    </div>
                  </AdminDataTableCell>
                  <AdminDataTableCell className="whitespace-normal">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {activity.project?.name || activity.record_id}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.project?.company_name || 'Unknown project'}
                      </p>
                    </div>
                  </AdminDataTableCell>
                  <AdminDataTableCell>{getProfileDisplayName(activity.client)}</AdminDataTableCell>
                  <AdminDataTableCell>{activity.actor || 'System'}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">{formatDateTime(activity.created_at)}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <RowActionButton label="Edit" onClick={() => setEditingActivity(activity)} />
                      {role === 'admin' && (
                        <RowActionButton
                          label="Delete"
                          destructive
                          onClick={() => setDeletingActivity(activity)}
                        />
                      )}
                    </div>
                  </AdminDataTableCell>
                </AdminDataTableRow>
              ))}
            </AdminDataTableBody>
          </AdminDataTable>
        )}
      </AdminSectionCard>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Activity</DialogTitle>
            <DialogDescription>Log an admin-facing activity event against any project.</DialogDescription>
          </DialogHeader>
          <AdminActivityForm
            projects={projects}
            onCancel={() => setIsCreateOpen(false)}
            onSave={handleCreate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editingActivity != null} onOpenChange={(open) => !open && setEditingActivity(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>Update the project link, actor, or description for this timeline event.</DialogDescription>
          </DialogHeader>
          {editingActivity && (
            <AdminActivityForm
              projects={projects}
              initialRecord={editingActivity}
              onCancel={() => setEditingActivity(null)}
              onSave={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={deletingActivity != null}
        onOpenChange={(open) => !open && setDeletingActivity(null)}
        title="Delete activity?"
        description="This permanently removes the activity from the project timeline."
        confirmLabel="Delete Activity"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function AdminMilestonesPage() {
  const { role } = useAuth();
  const { milestones, projects, loading, error, isRefreshing, refreshData } = useAdminCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<AdminMilestoneRecord | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<AdminMilestoneRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(values: Parameters<typeof createAdminMilestone>[0]) {
    await createAdminMilestone(values);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Milestone created successfully.');
  }

  async function handleUpdate(values: Parameters<typeof updateAdminMilestone>[1]) {
    if (!editingMilestone) return;

    await updateAdminMilestone(editingMilestone.id, values, editingMilestone);
    await refreshData();
    setEditingMilestone(null);
    toast.success('Milestone updated successfully.');
  }

  async function handleDelete() {
    if (!deletingMilestone) return;

    setIsDeleting(true);

    try {
      await deleteAdminMilestone(deletingMilestone);
      await refreshData();
      toast.success('Milestone deleted successfully.');
      setDeletingMilestone(null);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'We could not delete the milestone.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <AdminLoadingState label="Loading milestones workspace…" />;
  }

  const hasData = milestones.length > 0;

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <AdminSectionCard>
        <AdminWorkspaceHeader
          title="Milestones CRM"
          description="Edit milestone schedules, mark delivery checkpoints complete, and manage project targets."
          count={milestones.length}
          actionLabel="New Milestone"
          onAction={() => setIsCreateOpen(true)}
          isRefreshing={isRefreshing}
        />

        {!hasData ? (
          <AdminEmptyState
            title="No milestones yet"
            description="Create milestones to define project checkpoints and target dates."
            actionLabel="Create the first milestone"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <AdminDataTable>
            <AdminDataTableHeader>
              <AdminDataTableHeaderRow>
                <AdminDataTableHead>Milestone</AdminDataTableHead>
                <AdminDataTableHead>Project</AdminDataTableHead>
                <AdminDataTableHead>Client</AdminDataTableHead>
                <AdminDataTableHead align="center">Status</AdminDataTableHead>
                <AdminDataTableHead align="right">Due Date</AdminDataTableHead>
                <AdminDataTableHead align="right">Actions </AdminDataTableHead>
              </AdminDataTableHeaderRow>
            </AdminDataTableHeader>
            <AdminDataTableBody>
              {milestones.map((milestone) => {
                const isCurrentTarget =
                  milestone.project?.target_milestone === milestone.title;

                return (
                  <AdminDataTableRow key={milestone.id}>
                    <AdminDataTableCell className="whitespace-normal">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-slate-50">{milestone.title}</p>
                          {isCurrentTarget && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                              Current Target
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {milestone.description || 'No description'}
                        </p>
                      </div>
                    </AdminDataTableCell>
                    <AdminDataTableCell>{milestone.project?.name || milestone.project_id}</AdminDataTableCell>
                    <AdminDataTableCell>{getProfileDisplayName(milestone.client)}</AdminDataTableCell>
                    <AdminCenteredBadgeCell>
                      <MilestoneStatusBadge completed={milestone.completed} />
                    </AdminCenteredBadgeCell>
                    <AdminDataTableCell className="text-right">{formatDate(milestone.target_date)}</AdminDataTableCell>
                    <AdminDataTableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <RowActionButton label="Edit" onClick={() => setEditingMilestone(milestone)} />
                        {role === 'admin' && (
                          <RowActionButton
                            label="Delete"
                            destructive
                            onClick={() => setDeletingMilestone(milestone)}
                          />
                        )}
                      </div>
                    </AdminDataTableCell>
                  </AdminDataTableRow>
                );
              })}
            </AdminDataTableBody>
          </AdminDataTable>
        )}
      </AdminSectionCard>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Milestone</DialogTitle>
            <DialogDescription>Define a milestone, due date, and completion state for any project.</DialogDescription>
          </DialogHeader>
          <AdminMilestoneForm
            projects={projects}
            onCancel={() => setIsCreateOpen(false)}
            onSave={handleCreate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editingMilestone != null} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>Update milestone timing, completion state, and project linkage.</DialogDescription>
          </DialogHeader>
          {editingMilestone && (
            <AdminMilestoneForm
              projects={projects}
              initialRecord={editingMilestone}
              onCancel={() => setEditingMilestone(null)}
              onSave={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={deletingMilestone != null}
        onOpenChange={(open) => !open && setDeletingMilestone(null)}
        title="Delete milestone?"
        description="If this milestone is the project's current target, the project target will be reset to TBD."
        confirmLabel="Delete Milestone"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
