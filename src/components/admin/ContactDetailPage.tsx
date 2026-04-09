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
import { AdminContactForm } from './SalesEntityForms';
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
import {
  deleteContact,
  fetchContactById,
  getContactDisplayName,
  updateContact,
  type ContactDetailRecord,
  type ContactMutationValues,
  type ContactSource,
} from './salesCrmApi';
import { formatCurrency, formatDateTime } from './adminCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

/* ── Source badge ──────────────────────────────────────────────── */
const SOURCE_STYLES: Record<ContactSource, { label: string; className: string }> = {
  website:   { label: 'Website',   className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300' },
  estimator: { label: 'Estimator', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  email:     { label: 'Gmail',     className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  linkedin:  { label: 'LinkedIn',  className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  upwork:    { label: 'Upwork',    className: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300' },
  referral:  { label: 'Referral',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  manual:    { label: 'Other',     className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
};

function SourceBadge({ source }: { source: ContactSource }) {
  const s = SOURCE_STYLES[source] ?? SOURCE_STYLES.manual;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { accounts } = useSalesCrm();

  const [record, setRecord] = useState<ContactDetailRecord | null>(null);
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
    fetchContactById(id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setRecord(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load contact.');
      })
      .finally(() => setLoading(false));
  }, [id, fetchKey]);

  async function handleUpdate(values: ContactMutationValues) {
    if (!record) return;
    await updateContact(record.id, values);
    setIsEditing(false);
    toast.success('Contact updated.');
    refetch();
  }

  async function handleDelete() {
    if (!record) return;
    setIsDeleting(true);
    try {
      await deleteContact(record.id);
      toast.success('Contact deleted.');
      navigate('/portal/admin/sales-contacts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete contact.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) return <AdminLoadingState label="Loading contact…" />;
  if (notFound) return <AdminRecordNotFound listLabel="Contacts" listPath="/portal/admin/sales-contacts" />;
  if (!record) return null;

  const displayName = getContactDisplayName(record);
  const sourceLabel = SOURCE_STYLES[record.source]?.label ?? record.source;

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
              listLabel="Contacts"
              listPath="/portal/admin/sales-contacts"
              recordName={displayName}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-50">{displayName}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <SourceBadge source={record.source} />
                  {record.account && (
                    <NavLink
                      to={`/portal/admin/accounts/${record.account.id}`}
                      className="text-sm text-slate-300 hover:text-slate-100 hover:underline"
                    >
                      {record.account.name}
                    </NavLink>
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
                label="Deals"
                value={String(record.dealCount)}
                helper="linked deals"
                accentClassName="text-blue-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Source"
                value={sourceLabel}
                helper="lead origin"
                accentClassName="text-indigo-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Tags"
                value={String(record.tags?.length ?? 0)}
                helper="applied tags"
                accentClassName="text-cyan-200"
                variant="hero"
              />
              <AdminMetricCard
                label="Account"
                value={record.account?.name ?? '—'}
                helper="linked account"
                accentClassName="text-slate-300"
                variant="hero"
              />
            </div>
          </div>
        }
        left={
          <>
            <AdminFieldGroup title="Contact Details">
              <AdminFieldRow label="First Name" value={record.first_name} />
              <AdminFieldRow label="Last Name" value={record.last_name} />
              <AdminFieldRow
                label="Email"
                value={
                  record.email ? (
                    <a
                      href={`mailto:${record.email}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {record.email}
                    </a>
                  ) : null
                }
              />
              <AdminFieldRow
                label="Phone"
                value={
                  record.phone ? (
                    <a
                      href={`tel:${record.phone}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {record.phone}
                    </a>
                  ) : null
                }
              />
              <AdminFieldRow
                label="Website"
                value={
                  record.website_url ? (
                    <a
                      href={record.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {record.website_url}
                    </a>
                  ) : null
                }
              />
              <AdminFieldRow
                label="LinkedIn"
                value={
                  record.linkedin_url ? (
                    <a
                      href={record.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View profile
                    </a>
                  ) : null
                }
              />
              <AdminFieldRow
                label="Upwork"
                value={
                  record.upwork_url ? (
                    <a
                      href={record.upwork_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View profile
                    </a>
                  ) : null
                }
              />
              <AdminFieldRow
                label="Account"
                value={
                  record.account ? (
                    <NavLink
                      to={`/portal/admin/accounts/${record.account.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {record.account.name}
                    </NavLink>
                  ) : null
                }
              />
              <AdminFieldRow label="Source" value={<SourceBadge source={record.source} />} />
              {record.tags && record.tags.length > 0 && (
                <AdminFieldRow
                  label="Tags"
                  value={
                    <div className="flex flex-wrap gap-1">
                      {record.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  }
                />
              )}
              <AdminFieldRow label="Notes" value={record.notes} />
            </AdminFieldGroup>

            <AdminFieldGroup title="System Info">
              <AdminFieldRow label="Created" value={formatDateTime(record.created_at)} />
              <AdminFieldRow label="Last Modified" value={formatDateTime(record.updated_at)} />
            </AdminFieldGroup>
          </>
        }
        right={
          <AdminRelatedList
            title="Deals"
            count={record.deals.length}
            emptyText="No deals linked to this contact."
          >
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  <th className="px-5 py-3">Deal</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3 text-right">Value</th>
                  <th className="px-5 py-3 text-right">Close</th>
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
                    <td className="px-5 py-3 text-right text-slate-500">
                      {d.expected_close ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminRelatedList>
        }
      />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact details, account link, and source.</DialogDescription>
          </DialogHeader>
          <AdminContactForm
            accounts={accounts}
            initialRecord={record}
            onCancel={() => setIsEditing(false)}
            onSave={handleUpdate}
          />
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={isDeletingOpen}
        onOpenChange={setIsDeletingOpen}
        title="Delete contact?"
        description={`Are you sure you want to permanently delete "${displayName}"?`}
        confirmLabel="Delete Contact"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
