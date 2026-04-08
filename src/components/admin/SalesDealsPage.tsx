import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { DealStageBadge } from '../portal/StatusBadge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useAdminCrm } from './AdminCrmContext';
import { useSalesCrm } from './SalesCrmContext';
import { AdminDealForm } from './SalesEntityForms';
import {
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableHead,
  AdminDataTableHeader,
  AdminDataTableHeaderRow,
  AdminDataTableRow,
  AdminCenteredBadgeCell,
  AdminDeleteDialog,
  AdminEmptyState,
  AdminLoadingState,
  AdminMetricCard,
  AdminSectionCard,
  AdminWorkspaceHeader,
} from './AdminWorkspaceComponents';
import {
  createDeal,
  deleteDeal,
  getContactDisplayName,
  updateDeal,
  type DealMutationValues,
  type SalesDealRecord,
} from './salesCrmApi';
import { formatCurrency, formatDateTime } from './adminCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

function WorkspaceErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}

function RowActionButton({ label, onClick, destructive = false }: { label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <Button
      size="sm"
      variant="outline"
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

export function SalesDealsPage() {
  const { role } = useAuth();
  const { deals, contacts, accounts, pipelines, loading, error, isRefreshing, refreshData } = useSalesCrm();
  const { quotes } = useAdminCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<SalesDealRecord | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<SalesDealRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(values: DealMutationValues) {
    await createDeal(values);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Deal created successfully.');
  }

  async function handleUpdate(values: DealMutationValues) {
    if (!editingDeal) return;
    await updateDeal(editingDeal.id, values);
    await refreshData();
    setEditingDeal(null);
    toast.success('Deal updated successfully.');
  }

  async function handleDelete() {
    if (!deletingDeal) return;
    setIsDeleting(true);
    try {
      await deleteDeal(deletingDeal.id);
      await refreshData();
      toast.success('Deal deleted successfully.');
      setDeletingDeal(null);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'We could not delete the deal.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <AdminLoadingState label="Loading deals…" />;
  }

  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const wonDeals = deals.filter((d) => d.stage === 'won');
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const weightedPipeline = openDeals.reduce((sum, d) => sum + (d.value ?? 0) * (d.probability ?? 0) / 100, 0);

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <div className={`${PORTAL_HERO_SURFACE_CLASS} rounded-b-none border-b-0 p-6`}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-50">Deals Overview</h2>
          <p className="mt-1 text-sm text-slate-200">
            Track every deal from identification through close.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            label="Total Deals"
            value={String(deals.length)}
            helper={`${openDeals.length} open`}
            accentClassName="text-blue-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Pipeline Value"
            value={formatCurrency(pipelineValue)}
            helper="Open deals"
            accentClassName="text-indigo-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Weighted Pipeline"
            value={formatCurrency(weightedPipeline)}
            helper="By probability"
            accentClassName="text-cyan-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Closed Won"
            value={String(wonDeals.length)}
            helper={formatCurrency(wonValue)}
            accentClassName="text-emerald-200"
            variant="hero"
          />
        </div>
      </div>

      <AdminSectionCard>
        <AdminWorkspaceHeader
          title="All Deals"
          description="Create, edit, and track deals through each stage of the sales pipeline."
          count={deals.length}
          actionLabel="New Deal"
          onAction={() => setIsCreateOpen(true)}
          isRefreshing={isRefreshing}
        />

        {deals.length === 0 ? (
          <AdminEmptyState
            title="No deals yet"
            description="Start building your pipeline by adding the first deal."
            actionLabel="Add first deal"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <AdminDataTable>
            <AdminDataTableHeader>
              <AdminDataTableHeaderRow>
                <AdminDataTableHead>Deal</AdminDataTableHead>
                <AdminDataTableHead>Contact</AdminDataTableHead>
                <AdminDataTableHead align="center">Stage</AdminDataTableHead>
                <AdminDataTableHead align="right">Value</AdminDataTableHead>
                <AdminDataTableHead align="right">Probability</AdminDataTableHead>
                <AdminDataTableHead align="right">Last Updated</AdminDataTableHead>
                <AdminDataTableHead align="right">Actions</AdminDataTableHead>
              </AdminDataTableHeaderRow>
            </AdminDataTableHeader>
            <AdminDataTableBody>
              {deals.map((deal) => (
                <AdminDataTableRow key={deal.id}>
                  <AdminDataTableCell className="whitespace-normal">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">{deal.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {deal.account?.name || deal.owner || 'Unassigned'}
                      </p>
                    </div>
                  </AdminDataTableCell>
                  <AdminDataTableCell>{getContactDisplayName(deal.contact)}</AdminDataTableCell>
                  <AdminCenteredBadgeCell>
                    <DealStageBadge stage={deal.stage} />
                  </AdminCenteredBadgeCell>
                  <AdminDataTableCell className="text-right font-medium tabular-nums text-slate-900 dark:text-slate-50">
                    {formatCurrency(deal.value)}
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right tabular-nums">
                    {deal.probability}%
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right">{formatDateTime(deal.updated_at)}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <RowActionButton label="Edit" onClick={() => setEditingDeal(deal)} />
                      {role === 'admin' && (
                        <RowActionButton label="Delete" destructive onClick={() => setDeletingDeal(deal)} />
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
            <DialogTitle>Create Deal</DialogTitle>
            <DialogDescription>Add a new deal to the sales pipeline.</DialogDescription>
          </DialogHeader>
          <AdminDealForm
            contacts={contacts}
            accounts={accounts}
            pipelines={pipelines}
            quotes={quotes}
            onCancel={() => setIsCreateOpen(false)}
            onSave={handleCreate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editingDeal != null} onOpenChange={(open) => !open && setEditingDeal(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>Update the deal stage, value, contact, or linked quote.</DialogDescription>
          </DialogHeader>
          {editingDeal && (
            <AdminDealForm
              contacts={contacts}
              accounts={accounts}
              pipelines={pipelines}
              quotes={quotes}
              initialRecord={editingDeal}
              onCancel={() => setEditingDeal(null)}
              onSave={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={deletingDeal != null}
        onOpenChange={(open) => !open && setDeletingDeal(null)}
        title="Delete deal?"
        description={`Are you sure you want to permanently delete "${deletingDeal?.name}"?`}
        confirmLabel="Delete Deal"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
