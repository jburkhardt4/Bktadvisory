import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { OpportunityStatusBadge } from '../portal/StatusBadge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useAdminCrm } from './AdminCrmContext';
import { AdminOpportunityForm } from './AdminEntityForms';
import {
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
  AdminMetricCard,
  AdminSectionCard,
  AdminWorkspaceHeader,
} from './AdminWorkspaceComponents';
import {
  createAdminOpportunity,
  deleteAdminOpportunity,
  formatCurrency,
  formatDate,
  updateAdminOpportunity,
  type OpportunityMutationValues,
  type OpportunityRecord,
} from './adminCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

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
      size="sm"
      variant={destructive ? 'outline' : 'outline'}
      className={
        destructive
          ? 'h-7 rounded-lg border-red-200 px-2.5 text-xs text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/30'
          : 'h-7 rounded-lg px-2.5 text-xs'
      }
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function AdminContactsPage() {
  const { role } = useAuth();
  const { opportunities, loading, error, isRefreshing, refreshData } = useAdminCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<OpportunityRecord | null>(null);
  const [deletingOpportunity, setDeletingOpportunity] = useState<OpportunityRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(values: OpportunityMutationValues) {
    await createAdminOpportunity(values);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Opportunity created successfully.');
  }

  async function handleUpdate(values: OpportunityMutationValues) {
    if (!editingOpportunity) return;
    await updateAdminOpportunity(editingOpportunity.id, values);
    await refreshData();
    setEditingOpportunity(null);
    toast.success('Opportunity updated successfully.');
  }

  async function handleDelete() {
    if (!deletingOpportunity) return;

    setIsDeleting(true);

    try {
      await deleteAdminOpportunity(deletingOpportunity.id);
      await refreshData();
      toast.success('Opportunity deleted successfully.');
      setDeletingOpportunity(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error ? deleteError.message : 'We could not delete the opportunity.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <AdminLoadingState label="Loading contacts pipeline…" />;
  }

  const openOpportunities = opportunities.filter(
    (o) => o.status !== 'closed_won' && o.status !== 'closed_lost',
  );
  const closedWon = opportunities.filter((o) => o.status === 'closed_won');
  const pipelineValue = openOpportunities.reduce((sum, o) => sum + (o.value ?? 0), 0);
  const wonValue = closedWon.reduce((sum, o) => sum + (o.value ?? 0), 0);

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      {/* Pipeline metrics */}
      <div className={`${PORTAL_HERO_SURFACE_CLASS} rounded-b-none border-b-0 p-6`}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-50">Contacts &amp; Leads Pipeline</h2>
          <p className="mt-1 text-sm text-slate-200">
            Track every sales opportunity from first discovery through negotiation and close.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            label="Total Leads"
            value={String(opportunities.length)}
            helper={`${openOpportunities.length} open`}
            accentClassName="text-blue-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Pipeline Value"
            value={formatCurrency(pipelineValue)}
            helper="Open opportunities"
            accentClassName="text-indigo-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Closed Won"
            value={String(closedWon.length)}
            helper={formatCurrency(wonValue)}
            accentClassName="text-emerald-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Win Rate"
            value={
              opportunities.length > 0
                ? `${Math.round((closedWon.length / opportunities.length) * 100)}%`
                : '—'
            }
            helper="of all leads"
            accentClassName="text-cyan-200"
            variant="hero"
          />
        </div>
      </div>

      {/* Leads table */}
      <AdminSectionCard>
        <AdminWorkspaceHeader
          title="Opportunities"
          description="Create, edit, and track leads through each stage of the sales pipeline."
          count={opportunities.length}
          actionLabel="New Opportunity"
          onAction={() => setIsCreateOpen(true)}
          isRefreshing={isRefreshing}
        />

        {opportunities.length === 0 ? (
          <AdminEmptyState
            title="No opportunities yet"
            description="Start building your pipeline by adding the first lead or opportunity."
            actionLabel="Add first opportunity"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <AdminDataTable>
            <AdminDataTableHeader>
              <AdminDataTableHeaderRow>
                <AdminDataTableHead>Opportunity</AdminDataTableHead>
                <AdminDataTableHead>Stage</AdminDataTableHead>
                <AdminDataTableHead align="right">Value</AdminDataTableHead>
                <AdminDataTableHead align="right">Created</AdminDataTableHead>
                <AdminDataTableHead align="right">Actions</AdminDataTableHead>
              </AdminDataTableHeaderRow>
            </AdminDataTableHeader>
            <AdminDataTableBody>
              {opportunities.map((opp) => (
                <AdminDataTableRow key={opp.id}>
                  <AdminDataTableCell className="whitespace-normal">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">{opp.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{opp.company_name}</p>
                    </div>
                  </AdminDataTableCell>
                  <AdminDataTableCell>
                    <OpportunityStatusBadge status={opp.status} />
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right font-medium tabular-nums text-slate-900 dark:text-slate-50">
                    {formatCurrency(opp.value)}
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right">
                    {formatDate(opp.created_at)}
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <RowActionButton label="Edit" onClick={() => setEditingOpportunity(opp)} />
                      {role === 'admin' && (
                        <RowActionButton
                          label="Delete"
                          destructive
                          onClick={() => setDeletingOpportunity(opp)}
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

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Opportunity</DialogTitle>
            <DialogDescription>
              Add a new lead or sales opportunity to the pipeline.
            </DialogDescription>
          </DialogHeader>
          <AdminOpportunityForm
            onCancel={() => setIsCreateOpen(false)}
            onSave={handleCreate}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editingOpportunity != null}
        onOpenChange={(open) => !open && setEditingOpportunity(null)}
      >
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
            <DialogDescription>
              Update the name, stage, or estimated value for this opportunity.
            </DialogDescription>
          </DialogHeader>
          {editingOpportunity && (
            <AdminOpportunityForm
              initialRecord={editingOpportunity}
              onCancel={() => setEditingOpportunity(null)}
              onSave={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AdminDeleteDialog
        open={deletingOpportunity != null}
        onOpenChange={(open) => !open && setDeletingOpportunity(null)}
        title="Delete Opportunity"
        description={`Are you sure you want to permanently delete "${deletingOpportunity?.name}"? This cannot be undone.`}
        confirmLabel="Delete Opportunity"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
