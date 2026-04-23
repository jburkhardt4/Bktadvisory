import { useState } from 'react';
import { NavLink } from 'react-router';
import { toast } from 'sonner';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
  updateDealStage,
  DEAL_STAGE_OPTIONS,
  type DealMutationValues,
  type DealStage,
  type SalesDealRecord,
} from './salesCrmApi';
import { formatCurrency, formatDateTime, createAdminProject } from './adminCrmApi';
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

/* ------------------------------------------------------------------ */
/*  Kanban helpers                                                     */
/* ------------------------------------------------------------------ */

function KanbanCardContent({ deal }: { deal: SalesDealRecord }) {
  return (
    <>
      <NavLink
        to={`/portal/admin/deals/${deal.id}`}
        className="block truncate text-sm font-medium text-slate-900 hover:underline dark:text-slate-50"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {deal.name}
      </NavLink>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
        {deal.account?.name || getContactDisplayName(deal.contact)}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
          {formatCurrency(deal.value)}
        </span>
        {deal.probability > 0 && (
          <span className="text-xs tabular-nums text-slate-400">{deal.probability}%</span>
        )}
      </div>
      {deal.owner && (
        <p className="mt-1.5 text-[11px] text-slate-400 truncate">{deal.owner}</p>
      )}
    </>
  );
}

function KanbanCard({ deal }: { deal: SalesDealRecord }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id });
  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 cursor-grab active:cursor-grabbing select-none touch-none transition-opacity ${isDragging ? 'opacity-40' : 'opacity-100'}`}
    >
      <KanbanCardContent deal={deal} />
    </div>
  );
}

function KanbanCardOverlay({ deal }: { deal: SalesDealRecord }) {
  return (
    <div className="rounded-xl border-2 border-blue-400 bg-white p-3 shadow-2xl dark:border-blue-500 dark:bg-slate-900 rotate-2 cursor-grabbing select-none">
      <KanbanCardContent deal={deal} />
    </div>
  );
}

function KanbanColumn({ stage, deals }: { stage: DealStage; deals: SalesDealRecord[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const stageValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[220px] flex-col rounded-xl border-2 transition-colors ${
        isOver
          ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <DealStageBadge stage={stage} />
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {deals.length}
          </span>
        </div>
      </div>
      <div className="px-2 py-1.5 text-[10px] font-medium text-slate-400 tabular-nums">
        {formatCurrency(stageValue)}
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3" style={{ maxHeight: '60vh' }}>
        {deals.map((deal) => (
          <KanbanCard key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">Drop deals here</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export function SalesDealsPage() {
  const { role } = useAuth();
  const { deals, contacts, accounts, pipelines, loading, error, isRefreshing, refreshData } = useSalesCrm();
  const { quotes, refreshData: refreshAdminData } = useAdminCrm();

  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
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

  async function handleCreateProjectFromDeal(deal: SalesDealRecord) {
    try {
      const companyName = deal.account?.name ?? deal.contact?.last_name ?? 'New Client';
      await createAdminProject({
        clientId: '',
        name: `${companyName} — ${deal.name}`,
        companyName,
        description: `Project created from won deal: ${deal.name}`,
        owner: deal.owner ?? 'John Burkhardt',
        status: 'intake',
        targetMilestone: 'TBD',
      });
      await refreshAdminData();
      toast.success('Project created from deal.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create project.');
    }
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveDealId(String(active.id));
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDealId(null);
    if (!over) return;
    const dealId = String(active.id);
    const newStage = String(over.id) as DealStage;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;
    try {
      await updateDealStage(dealId, newStage);
      await refreshData();
      if (newStage === 'won') {
        toast.success('Deal won!', {
          action: {
            label: 'Create Project',
            onClick: () => { void handleCreateProjectFromDeal(deal); },
          },
          duration: 10000,
        });
      }
    } catch (moveError) {
      toast.error(moveError instanceof Error ? moveError.message : 'Could not move deal.');
    }
  }

  if (loading) {
    return <AdminLoadingState label="Loading deals…" />;
  }

  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const wonDeals = deals.filter((d) => d.stage === 'won');
  const lostDeals = deals.filter((d) => d.stage === 'lost');
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const weightedPipeline = openDeals.reduce((sum, d) => sum + (d.value ?? 0) * (d.probability ?? 0) / 100, 0);
  const closedCount = wonDeals.length + lostDeals.length;
  const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;

  const activeDeal = activeDealId ? deals.find((d) => d.id === activeDealId) : null;

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      {/* 8-metric hero */}
      <div className={`${PORTAL_HERO_SURFACE_CLASS} rounded-b-none border-b-0 p-6`}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Deal Pipeline</h2>
            <p className="mt-1 text-sm text-slate-200">
              Track and close deals across every stage.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bkt-primary-button rounded-xl"
          >
            New Deal
          </Button>
        </div>
        <div className="space-y-3">
          {/* Row 1 */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminMetricCard
              label="Pipeline Value"
              value={formatCurrency(pipelineValue)}
              helper={`${openDeals.length} open`}
              accentClassName="text-blue-200"
              variant="hero"
            />
            <AdminMetricCard
              label="Weighted Pipeline"
              value={formatCurrency(weightedPipeline)}
              helper="by probability"
              accentClassName="text-indigo-200"
              variant="hero"
            />
            <AdminMetricCard
              label="Active Deals"
              value={String(openDeals.length)}
              helper="in pipeline"
              accentClassName="text-cyan-200"
              variant="hero"
            />
            <AdminMetricCard
              label="Total Deals"
              value={String(deals.length)}
              helper="all time"
              accentClassName="text-slate-300"
              variant="hero"
            />
          </div>
          {/* Row 2 */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminMetricCard
              label="Won Revenue"
              value={formatCurrency(wonValue)}
              helper="closed won"
              accentClassName="text-emerald-200"
              variant="hero"
            />
            <AdminMetricCard
              label="Win Rate"
              value={closedCount > 0 ? `${winRate}%` : '—'}
              helper="won vs closed"
              accentClassName="text-teal-200"
              variant="hero"
            />
            <AdminMetricCard
              label="Deals Won"
              value={String(wonDeals.length)}
              helper="closed won"
              accentClassName="text-green-200"
              variant="hero"
            />
            <AdminMetricCard
              label="Deals Lost"
              value={String(lostDeals.length)}
              helper="closed lost"
              accentClassName="text-red-300"
              variant="hero"
            />
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-end gap-2 px-1">
        <Button
          size="sm"
          variant={view === 'list' ? 'default' : 'outline'}
          className="rounded-lg"
          onClick={() => setView('list')}
        >
          List
        </Button>
        <Button
          size="sm"
          variant={view === 'kanban' ? 'default' : 'outline'}
          className="rounded-lg"
          onClick={() => setView('kanban')}
        >
          Kanban
        </Button>
      </div>

      {/* List view */}
      {view === 'list' && (
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
                  <AdminDataTableHead align="right">Expected Close</AdminDataTableHead>
                  <AdminDataTableHead align="right">Last Updated</AdminDataTableHead>
                  <AdminDataTableHead align="right">Actions</AdminDataTableHead>
                </AdminDataTableHeaderRow>
              </AdminDataTableHeader>
              <AdminDataTableBody>
                {deals.map((deal) => (
                  <AdminDataTableRow key={deal.id}>
                    <AdminDataTableCell className="whitespace-normal">
                      <div>
                        <NavLink
                          to={`/portal/admin/deals/${deal.id}`}
                          className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                        >
                          {deal.name}
                        </NavLink>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {deal.account?.name || deal.owner || 'Unassigned'}
                        </p>
                      </div>
                    </AdminDataTableCell>
                    <AdminDataTableCell>
                      {deal.contact && deal.contact_id ? (
                        <NavLink
                          to={`/portal/admin/contacts/${deal.contact_id}`}
                          className="hover:underline"
                        >
                          {getContactDisplayName(deal.contact)}
                        </NavLink>
                      ) : getContactDisplayName(deal.contact)}
                    </AdminDataTableCell>
                    <AdminCenteredBadgeCell>
                      <DealStageBadge stage={deal.stage} />
                    </AdminCenteredBadgeCell>
                    <AdminDataTableCell className="text-right font-medium tabular-nums text-slate-900 dark:text-slate-50">
                      {formatCurrency(deal.value)}
                    </AdminDataTableCell>
                    <AdminDataTableCell className="text-right tabular-nums">
                      {deal.probability}%
                    </AdminDataTableCell>
                    <AdminDataTableCell className="text-right tabular-nums text-slate-600 dark:text-slate-400">
                      {deal.expected_close ?? '—'}
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
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="bkt-shell-surface overflow-x-auto p-4">
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3" style={{ minWidth: `${DEAL_STAGE_OPTIONS.length * 240}px` }}>
              {DEAL_STAGE_OPTIONS.map((stageOption) => {
                const stageDeals = deals.filter((d) => d.stage === stageOption.value);
                return (
                  <KanbanColumn
                    key={stageOption.value}
                    stage={stageOption.value}
                    deals={stageDeals}
                  />
                );
              })}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeDeal ? <KanbanCardOverlay deal={activeDeal} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Dialogs */}
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
