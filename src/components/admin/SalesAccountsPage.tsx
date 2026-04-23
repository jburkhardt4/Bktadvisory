import { useMemo, useState } from 'react';
import { NavLink } from 'react-router';
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
import { useSalesCrm } from './SalesCrmContext';
import { AdminAccountForm } from './SalesEntityForms';
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
  AdminSectionCard,
  AdminWorkspaceHeader,
} from './AdminWorkspaceComponents';
import {
  createAccount,
  deleteAccount,
  updateAccount,
  type AccountMutationValues,
  type AccountRecord,
} from './salesCrmApi';
import { formatCurrency, formatDateTime } from './adminCrmApi';

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

export function SalesAccountsPage() {
  const { role } = useAuth();
  const { accounts, contacts, deals, loading, error, isRefreshing, refreshData } = useSalesCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRecord | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<AccountRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(values: AccountMutationValues) {
    await createAccount(values);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Account created successfully.');
  }

  async function handleUpdate(values: AccountMutationValues) {
    if (!editingAccount) return;
    await updateAccount(editingAccount.id, values);
    await refreshData();
    setEditingAccount(null);
    toast.success('Account updated successfully.');
  }

  async function handleDelete() {
    if (!deletingAccount) return;
    setIsDeleting(true);
    try {
      await deleteAccount(deletingAccount.id);
      await refreshData();
      toast.success('Account deleted successfully.');
      setDeletingAccount(null);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'We could not delete the account.');
    } finally {
      setIsDeleting(false);
    }
  }

  const contactCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of contacts) {
      if (c.account_id) map[c.account_id] = (map[c.account_id] ?? 0) + 1;
    }
    return map;
  }, [contacts]);

  const dealCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of deals) {
      if (d.account_id) map[d.account_id] = (map[d.account_id] ?? 0) + 1;
    }
    return map;
  }, [deals]);

  if (loading) {
    return <AdminLoadingState label="Loading accounts…" />;
  }

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <AdminSectionCard>
        <AdminWorkspaceHeader
          title="Accounts"
          description="Manage companies and organizations in the sales pipeline."
          count={accounts.length}
          actionLabel="New Account"
          onAction={() => setIsCreateOpen(true)}
          isRefreshing={isRefreshing}
        />

        {accounts.length === 0 ? (
          <AdminEmptyState
            title="No accounts yet"
            description="Add your first account to group contacts and deals by company."
            actionLabel="Add first account"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <AdminDataTable>
            <AdminDataTableHeader>
              <AdminDataTableHeaderRow>
                <AdminDataTableHead>Account</AdminDataTableHead>
                <AdminDataTableHead>Industry</AdminDataTableHead>
                <AdminDataTableHead align="right">Employees</AdminDataTableHead>
                <AdminDataTableHead align="right">Contacts</AdminDataTableHead>
                <AdminDataTableHead align="right">Deals</AdminDataTableHead>
                <AdminDataTableHead align="right">Revenue</AdminDataTableHead>
                <AdminDataTableHead align="right">Last Updated</AdminDataTableHead>
                <AdminDataTableHead align="right">Actions</AdminDataTableHead>
              </AdminDataTableHeaderRow>
            </AdminDataTableHeader>
            <AdminDataTableBody>
              {accounts.map((account) => (
                <AdminDataTableRow key={account.id}>
                  <AdminDataTableCell className="whitespace-normal">
                    <div>
                      <NavLink
                        to={`/portal/admin/accounts/${account.id}`}
                        className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                      >
                        {account.name}
                      </NavLink>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{account.domain || 'No domain'}</p>
                    </div>
                  </AdminDataTableCell>
                  <AdminDataTableCell>{account.industry || '—'}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right tabular-nums">
                    {account.employee_count != null ? account.employee_count.toLocaleString() : '—'}
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right tabular-nums">{contactCountMap[account.id] ?? 0}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right tabular-nums">{dealCountMap[account.id] ?? 0}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right font-medium tabular-nums text-slate-900 dark:text-slate-50">
                    {formatCurrency(account.annual_revenue)}
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right">{formatDateTime(account.updated_at)}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <RowActionButton label="Edit" onClick={() => setEditingAccount(account)} />
                      {role === 'admin' && (
                        <RowActionButton label="Delete" destructive onClick={() => setDeletingAccount(account)} />
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
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>Add a new company or organization to the CRM.</DialogDescription>
          </DialogHeader>
          <AdminAccountForm onCancel={() => setIsCreateOpen(false)} onSave={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={editingAccount != null} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update account details, industry, and notes.</DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <AdminAccountForm initialRecord={editingAccount} onCancel={() => setEditingAccount(null)} onSave={handleUpdate} />
          )}
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={deletingAccount != null}
        onOpenChange={(open) => !open && setDeletingAccount(null)}
        title="Delete account?"
        description={`Are you sure you want to permanently delete "${deletingAccount?.name}"? Contacts linked to this account will be unlinked.`}
        confirmLabel="Delete Account"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
