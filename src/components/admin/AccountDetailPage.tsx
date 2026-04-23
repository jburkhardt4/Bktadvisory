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
import { AdminAccountForm, AdminContactForm, AdminDealForm } from './SalesEntityForms';
import {
  AdminDeleteDialog,
  AdminLoadingState,
  AdminMetricCard,
} from './AdminWorkspaceComponents';
import {
  AdminFieldGroup,
  AdminFieldRow,
  AdminRelatedList,
  AdminRecordNotFound,
  AdminRecordDetailLayout,
  RecordBreadcrumb,
} from './AdminRecordDetailLayout';
import { useSalesCrm } from './SalesCrmContext';
import { useAdminCrm } from './AdminCrmContext';
import {
  createContact,
  createDeal,
  deleteAccount,
  fetchAccountById,
  updateAccount,
  type AccountDetailRecord,
  type AccountMutationValues,
  type ContactMutationValues,
  type DealMutationValues,
} from './salesCrmApi';
import { formatCurrency, formatDateTime } from './adminCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { accounts, contacts, pipelines, refreshData } = useSalesCrm();
  const { quotes } = useAdminCrm();

  const [record, setRecord] = useState<AccountDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingOpen, setIsDeletingOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchAccountById(id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setRecord(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load account.');
      })
      .finally(() => setLoading(false));
  }, [id, fetchKey]);

  async function handleUpdate(values: AccountMutationValues) {
    if (!record) return;
    await updateAccount(record.id, values);
    setIsEditing(false);
    toast.success('Account updated.');
    refetch();
  }

  async function handleDelete() {
    if (!record) return;
    setIsDeleting(true);
    try {
      await deleteAccount(record.id);
      toast.success('Account deleted.');
      navigate('/portal/admin/accounts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete account.');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCreateContact(values: ContactMutationValues) {
    await createContact(values);
    await refreshData();
    setIsCreatingContact(false);
    toast.success('Contact created.');
    refetch();
  }

  async function handleCreateDeal(values: DealMutationValues) {
    await createDeal(values);
    await refreshData();
    setIsCreatingDeal(false);
    toast.success('Deal created.');
    refetch();
  }

  if (loading) return <AdminLoadingState label="Loading account…" />;
  if (notFound) return <AdminRecordNotFound listLabel="Accounts" listPath="/portal/admin/accounts" />;
  if (!record) return null;

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
              listLabel="Accounts"
              listPath="/portal/admin/accounts"
              recordName={record.name}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-50">{record.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  {record.industry && <span>{record.industry}</span>}
                  {record.domain && (
                    <a
                      href={`https://${record.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-200 hover:underline"
                    >
                      {record.domain}
                    </a>
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
                label="Contacts"
                value={String(record.contacts.length)}
                helper="linked contacts"
                accentClassName="text-blue-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Deals"
                value={String(record.deals.length)}
                helper="linked deals"
                accentClassName="text-indigo-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Annual Revenue"
                value={formatCurrency(record.annual_revenue)}
                helper="reported"
                accentClassName="text-emerald-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Employees"
                value={record.employee_count != null ? record.employee_count.toLocaleString() : '—'}
                helper="headcount"
                accentClassName="text-cyan-200"
                variant="hero"
              />
            </div>
          </div>
        }
        left={
          <>
            <AdminFieldGroup title="Details">
              <AdminFieldRow label="Account Name" value={record.name} />
              <AdminFieldRow
                label="Domain"
                value={
                  record.domain ? (
                    <a
                      href={`https://${record.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {record.domain}
                    </a>
                  ) : null
                }
              />
              <AdminFieldRow label="Industry" value={record.industry} />
              <AdminFieldRow
                label="Employees"
                value={
                  record.employee_count != null
                    ? record.employee_count.toLocaleString()
                    : null
                }
              />
              <AdminFieldRow
                label="Annual Revenue"
                value={formatCurrency(record.annual_revenue)}
              />
              <AdminFieldRow label="Notes" value={record.notes} />
            </AdminFieldGroup>

            <AdminFieldGroup title="System Info">
              <AdminFieldRow label="Created" value={formatDateTime(record.created_at)} />
              <AdminFieldRow label="Last Modified" value={formatDateTime(record.updated_at)} />
            </AdminFieldGroup>
          </>
        }
        right={
          <>
            <AdminRelatedList
              title="Contacts"
              count={record.contacts.length}
              emptyText="No contacts linked to this account."
              action={
                <Button
                  size="sm"
                  className="bkt-primary-button h-8 rounded-lg px-3 text-xs"
                  onClick={() => setIsCreatingContact(true)}
                >
                  New Contact
                </Button>
              }
            >
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 dark:border-slate-800">
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3 text-right">Deals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {record.contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="px-5 py-3">
                        <NavLink
                          to={`/portal/admin/contacts/${c.id}`}
                          className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                        >
                          {c.first_name} {c.last_name}
                        </NavLink>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{c.email || '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{c.source}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                        {c.dealCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminRelatedList>

            <AdminRelatedList
              title="Deals"
              count={record.deals.length}
              emptyText="No deals linked to this account."
              action={
                <Button
                  size="sm"
                  className="bkt-primary-button h-8 rounded-lg px-3 text-xs"
                  onClick={() => setIsCreatingDeal(true)}
                >
                  Create Deal
                </Button>
              }
            >
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 dark:border-slate-800">
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3">Deal</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3 text-right">Value</th>
                    <th className="px-5 py-3 text-right">Prob.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {record.deals.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="px-5 py-3">
                        <NavLink
                          to={`/portal/admin/deals/${d.id}`}
                          className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                        >
                          {d.name}
                        </NavLink>
                      </td>
                      <td className="px-5 py-3">
                        <DealStageBadge stage={d.stage} />
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                        {formatCurrency(d.value)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                        {d.probability}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminRelatedList>
          </>
        }
      />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update account details, industry, and notes.</DialogDescription>
          </DialogHeader>
          <AdminAccountForm
            initialRecord={record}
            onCancel={() => setIsEditing(false)}
            onSave={handleUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingContact} onOpenChange={setIsCreatingContact}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Contact</DialogTitle>
            <DialogDescription>
              Add a new contact linked to {record.name}.
            </DialogDescription>
          </DialogHeader>
          <AdminContactForm
            accounts={accounts}
            defaults={{ accountId: record.id }}
            onCancel={() => setIsCreatingContact(false)}
            onSave={handleCreateContact}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingDeal} onOpenChange={setIsCreatingDeal}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Deal</DialogTitle>
            <DialogDescription>
              Create a new deal linked to {record.name}.
            </DialogDescription>
          </DialogHeader>
          <AdminDealForm
            contacts={contacts}
            accounts={accounts}
            pipelines={pipelines}
            quotes={quotes}
            defaults={{ accountId: record.id }}
            onCancel={() => setIsCreatingDeal(false)}
            onSave={handleCreateDeal}
          />
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={isDeletingOpen}
        onOpenChange={setIsDeletingOpen}
        title="Delete account?"
        description={`Are you sure you want to permanently delete "${record.name}"? Contacts linked to this account will be unlinked.`}
        confirmLabel="Delete Account"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
