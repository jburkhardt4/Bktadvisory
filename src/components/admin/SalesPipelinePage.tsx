import { useState } from 'react';
import { toast } from 'sonner';
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

interface KanbanColumnProps {
  stage: DealStage;
  deals: SalesDealRecord[];
  onMoveLeft?: (deal: SalesDealRecord) => void;
  onMoveRight?: (deal: SalesDealRecord) => void;
}

function KanbanCard({ deal, onMoveLeft, onMoveRight }: { deal: SalesDealRecord; onMoveLeft?: () => void; onMoveRight?: () => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
      <div className="mt-2 flex justify-between gap-1">
        {onMoveLeft ? (
          <button
            type="button"
            onClick={onMoveLeft}
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            &larr;
          </button>
        ) : <span />}
        {onMoveRight && (
          <button
            type="button"
            onClick={onMoveRight}
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ stage, deals, onMoveLeft, onMoveRight }: KanbanColumnProps) {
  const stageValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div className="flex min-w-[220px] flex-col rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
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
          <KanbanCard
            key={deal.id}
            deal={deal}
            onMoveLeft={onMoveLeft ? () => onMoveLeft(deal) : undefined}
            onMoveRight={onMoveRight ? () => onMoveRight(deal) : undefined}
          />
        ))}
        {deals.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">No deals</p>
        )}
      </div>
    </div>
  );
}

export function SalesPipelinePage() {
  const { deals, contacts, accounts, pipelines, loading, error, refreshData } = useSalesCrm();
  const { quotes, refreshData: refreshAdminData } = useAdminCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const stages = DEAL_STAGE_OPTIONS;
  const stageKeys = stages.map((s) => s.value);

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

  async function handleMoveStage(deal: SalesDealRecord, direction: 'left' | 'right') {
    const currentIndex = stageKeys.indexOf(deal.stage);
    if (currentIndex === -1) return;
    const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= stageKeys.length) return;
    const nextStage = stageKeys[nextIndex];

    try {
      await updateDealStage(deal.id, nextStage);
      await refreshData();

      if (nextStage === 'won') {
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

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <div className={`${PORTAL_HERO_SURFACE_CLASS} rounded-b-none border-b-0 p-6`}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Sales Pipeline</h2>
            <p className="mt-1 text-sm text-slate-200">
              Visual pipeline board — move deals forward through each stage.
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
        <div className="flex gap-3" style={{ minWidth: `${stages.length * 240}px` }}>
          {stages.map((stageOption, index) => {
            const stageDeals = deals.filter((d) => d.stage === stageOption.value);
            return (
              <KanbanColumn
                key={stageOption.value}
                stage={stageOption.value}
                deals={stageDeals}
                onMoveLeft={index > 0 ? (deal) => handleMoveStage(deal, 'left') : undefined}
                onMoveRight={index < stages.length - 1 ? (deal) => handleMoveStage(deal, 'right') : undefined}
              />
            );
          })}
        </div>
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
