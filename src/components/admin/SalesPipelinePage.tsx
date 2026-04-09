import { useState } from 'react';
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
  AdminLoadingState,
  AdminMetricCard,
} from './AdminWorkspaceComponents';
import {
  createDeal,
  getContactDisplayName,
  updateDealStage,
  DEAL_STAGE_OPTIONS,
  type DealMutationValues,
  type DealStage,
  type SalesDealRecord,
} from './salesCrmApi';
import { formatCurrency, createAdminProject } from './adminCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

function WorkspaceErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}

function KanbanCardContent({ deal }: { deal: SalesDealRecord }) {
  return (
    <>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{deal.name}</p>
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

export function SalesPipelinePage() {
  const { deals, contacts, accounts, pipelines, loading, error, refreshData } = useSalesCrm();
  const { quotes, refreshData: refreshAdminData } = useAdminCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const stages = DEAL_STAGE_OPTIONS;

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

  async function handleCreate(values: DealMutationValues) {
    await createDeal(values);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Deal created successfully.');
  }

  if (loading) {
    return <AdminLoadingState label="Loading pipeline…" />;
  }

  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const wonDeals = deals.filter((d) => d.stage === 'won');
  const lostDeals = deals.filter((d) => d.stage === 'lost');
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const winRate = deals.length > 0
    ? Math.round((wonDeals.length / deals.length) * 100)
    : 0;

  const activeDeal = activeDealId ? deals.find((d) => d.id === activeDealId) : null;

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <div className={`${PORTAL_HERO_SURFACE_CLASS} rounded-b-none border-b-0 p-6`}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Sales Pipeline</h2>
            <p className="mt-1 text-sm text-slate-200">
              Drag and drop deals between stages to move them through the pipeline.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bkt-primary-button rounded-xl"
          >
            New Deal
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            label="Pipeline Value"
            value={formatCurrency(pipelineValue)}
            helper={`${openDeals.length} open deals`}
            accentClassName="text-blue-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Won Revenue"
            value={formatCurrency(wonValue)}
            helper={`${wonDeals.length} deals won`}
            accentClassName="text-emerald-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Win Rate"
            value={deals.length > 0 ? `${winRate}%` : '—'}
            helper="of all deals"
            accentClassName="text-cyan-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Lost"
            value={String(lostDeals.length)}
            helper="deals lost"
            accentClassName="text-red-300"
            variant="hero"
          />
        </div>
      </div>

      <div className="bkt-shell-surface rounded-t-none border-t-0 overflow-x-auto p-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3" style={{ minWidth: `${stages.length * 240}px` }}>
            {stages.map((stageOption) => {
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
    </div>
  );
}
