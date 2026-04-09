import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { DealStageBadge } from '../portal/StatusBadge';
import { AdminDealForm } from './SalesEntityForms';
import {
  AdminDeleteDialog,
  AdminLoadingState,
  AdminMetricCard,
} from './AdminWorkspaceComponents';
import {
  AdminFieldGroup,
  AdminFieldRow,
  AdminDetailMiniCard,
  AdminRecordNotFound,
  AdminRecordDetailLayout,
  RecordBreadcrumb,
} from './AdminRecordDetailLayout';
import { useSalesCrm } from './SalesCrmContext';
import { useAdminCrm } from './AdminCrmContext';
import {
  deleteDeal,
  fetchDealById,
  getContactDisplayName,
  updateDeal,
  type DealMutationValues,
  type SalesDealRecord,
} from './salesCrmApi';
import { formatCurrency, formatDateTime } from './adminCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { contacts, accounts, pipelines } = useSalesCrm();
  const { quotes } = useAdminCrm();

  const [record, setRecord] = useState<SalesDealRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingOpen, setIsDeletingOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchDealById(id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setRecord(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load deal.');
      })
      .finally(() => setLoading(false));
  }, [id, fetchKey]);

  async function handleUpdate(values: DealMutationValues) {
    if (!record) return;
    await updateDeal(record.id, values);
    setIsEditing(false);
    toast.success('Deal updated.');
    refetch();
  }

  async function handleDelete() {
    if (!record) return;
    setIsDeleting(true);
    try {
      await deleteDeal(record.id);
      toast.success('Deal deleted.');
      navigate('/portal/admin/deals');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete deal.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) return <AdminLoadingState label="Loading deal…" />;
  if (notFound) return <AdminRecordNotFound listLabel="Deal Pipeline" listPath="/portal/admin/deals" />;
  if (!record) return null;

  const contactName = getContactDisplayName(record.contact);
  const pipelineName = pipelines.find((p) => p.id === record.pipeline_id)?.name ?? '—';

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <AdminRecordDetailLayout
        headline={
          <div className={`${PORTAL_HERO_SURFACE_CLASS} p-6`}>
            <RecordBreadcrumb
              listLabel="Deal Pipeline"
              listPath="/portal/admin/deals"
              recordName={record.name}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-50">{record.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <DealStageBadge stage={record.stage} />
                  <span className="text-sm text-slate-300">
                    {record.probability}% probability
                  </span>
                  {record.owner && (
                    <span className="text-sm text-slate-400">Owner: {record.owner}</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                {role === 'admin' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    onClick={() => setIsDeletingOpen(true)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminMetricCard
                label="Value"
                value={formatCurrency(record.value)}
                helper="deal value"
                accentClassName="text-emerald-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Probability"
                value={`${record.probability}%`}
                helper="close probability"
                accentClassName="text-blue-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Expected Close"
                value={record.expected_close ?? '—'}
                helper="target close date"
                accentClassName="text-cyan-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Owner"
                value={record.owner ?? '—'}
                helper="assigned to"
                accentClassName="text-slate-300"
                variant="hero"
              />
            </div>
          </div>
        }
        left={
          <>
            <AdminFieldGroup title="Deal Details">
              <AdminFieldRow label="Deal Name" value={record.name} />
              <AdminFieldRow label="Value" value={formatCurrency(record.value)} />
              <AdminFieldRow label="Probability" value={`${record.probability}%`} />
              <AdminFieldRow label="Stage" value={<DealStageBadge stage={record.stage} />} />
              <AdminFieldRow label="Expected Close" value={record.expected_close} />
              <AdminFieldRow label="Pipeline" value={pipelineName} />
              <AdminFieldRow label="Owner" value={record.owner} />
              <AdminFieldRow
                label="Contact"
                value={
                  record.contact && record.contact_id ? (
                    <NavLink
                      to={`/portal/admin/contacts/${record.contact_id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {contactName}
                    </NavLink>
                  ) : null
                }
              />
              <AdminFieldRow
                label="Account"
                value={
                  record.account && record.account_id ? (
                    <NavLink
                      to={`/portal/admin/accounts/${record.account_id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {record.account.name}
                    </NavLink>
                  ) : null
                }
              />
              {record.quote_id && (
                <AdminFieldRow
                  label="Quote"
                  value={
                    <NavLink
                      to="/portal/admin/quotes"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View linked quote
                    </NavLink>
                  }
                />
              )}
            </AdminFieldGroup>

            <AdminFieldGroup title="System Info">
              <AdminFieldRow label="Created" value={formatDateTime(record.created_at)} />
              <AdminFieldRow label="Last Modified" value={formatDateTime(record.updated_at)} />
            </AdminFieldGroup>
          </>
        }
        right={
          <div className="space-y-4">
            {record.contact && record.contact_id && (
              <AdminDetailMiniCard
                title={contactName}
                titleTo={`/portal/admin/contacts/${record.contact_id}`}
                fields={[
                  {
                    label: 'Email',
                    value: record.contact.email ? (
                      <a
                        href={`mailto:${record.contact.email}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {record.contact.email}
                      </a>
                    ) : null,
                  },
                  {
                    label: 'Phone',
                    value: record.contact.phone ? (
                      <a
                        href={`tel:${record.contact.phone}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {record.contact.phone}
                      </a>
                    ) : null,
                  },
                  { label: 'Source', value: record.contact.source },
                ]}
              />
            )}

            {record.account && record.account_id && (
              <AdminDetailMiniCard
                title={record.account.name}
                titleTo={`/portal/admin/accounts/${record.account_id}`}
                fields={[
                  { label: 'Domain', value: record.account.domain },
                  { label: 'Industry', value: record.account.industry },
                  {
                    label: 'Revenue',
                    value: formatCurrency(record.account.annual_revenue),
                  },
                ]}
              />
            )}

            {!record.contact && !record.account && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No contact or account linked to this deal.
                </p>
              </div>
            )}
          </div>
        }
      />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update the deal stage, value, contact, or linked quote.
            </DialogDescription>
          </DialogHeader>
          <AdminDealForm
            contacts={contacts}
            accounts={accounts}
            pipelines={pipelines}
            quotes={quotes}
            initialRecord={record}
            onCancel={() => setIsEditing(false)}
            onSave={handleUpdate}
          />
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={isDeletingOpen}
        onOpenChange={setIsDeletingOpen}
        title="Delete deal?"
        description={`Are you sure you want to permanently delete "${record.name}"?`}
        confirmLabel="Delete Deal"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
