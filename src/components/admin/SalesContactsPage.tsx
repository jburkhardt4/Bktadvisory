import { useState } from 'react';
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
import { AdminContactForm } from './SalesEntityForms';
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
  createContact,
  deleteContact,
  formatContactSource,
  getContactDisplayName,
  updateContact,
  type ContactMutationValues,
  type SalesContactRecord,
} from './salesCrmApi';
import { formatDateTime } from './adminCrmApi';

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

export function SalesContactsPage() {
  const { role } = useAuth();
  const { contacts, accounts, loading, error, isRefreshing, refreshData } = useSalesCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SalesContactRecord | null>(null);
  const [deletingContact, setDeletingContact] = useState<SalesContactRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(values: ContactMutationValues) {
    await createContact(values);
    await refreshData();
    setIsCreateOpen(false);
    toast.success('Contact created successfully.');
  }

  async function handleUpdate(values: ContactMutationValues) {
    if (!editingContact) return;
    await updateContact(editingContact.id, values);
    await refreshData();
    setEditingContact(null);
    toast.success('Contact updated successfully.');
  }

  async function handleDelete() {
    if (!deletingContact) return;
    setIsDeleting(true);
    try {
      await deleteContact(deletingContact.id);
      await refreshData();
      toast.success('Contact deleted successfully.');
      setDeletingContact(null);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'We could not delete the contact.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <AdminLoadingState label="Loading contacts…" />;
  }

  return (
    <div className="space-y-6">
      {error && <WorkspaceErrorBanner message={error} />}

      <AdminSectionCard>
        <AdminWorkspaceHeader
          title="Contacts"
          description="Manage prospects and leads across all outbound channels."
          count={contacts.length}
          actionLabel="New Contact"
          onAction={() => setIsCreateOpen(true)}
          isRefreshing={isRefreshing}
        />

        {contacts.length === 0 ? (
          <AdminEmptyState
            title="No contacts yet"
            description="Add your first contact to start building the sales pipeline."
            actionLabel="Add first contact"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <AdminDataTable>
            <AdminDataTableHeader>
              <AdminDataTableHeaderRow>
                <AdminDataTableHead>Contact</AdminDataTableHead>
                <AdminDataTableHead>Account</AdminDataTableHead>
                <AdminDataTableHead>Source</AdminDataTableHead>
                <AdminDataTableHead align="right">Deals</AdminDataTableHead>
                <AdminDataTableHead align="right">Last Updated</AdminDataTableHead>
                <AdminDataTableHead align="right">Actions</AdminDataTableHead>
              </AdminDataTableHeaderRow>
            </AdminDataTableHeader>
            <AdminDataTableBody>
              {contacts.map((contact) => (
                <AdminDataTableRow key={contact.id}>
                  <AdminDataTableCell className="whitespace-normal">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">{getContactDisplayName(contact)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{contact.email || 'No email'}</p>
                    </div>
                  </AdminDataTableCell>
                  <AdminDataTableCell>{contact.account?.name || '—'}</AdminDataTableCell>
                  <AdminDataTableCell>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {formatContactSource(contact.source)}
                    </span>
                  </AdminDataTableCell>
                  <AdminDataTableCell className="text-right tabular-nums">{contact.dealCount}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">{formatDateTime(contact.updated_at)}</AdminDataTableCell>
                  <AdminDataTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <RowActionButton label="Edit" onClick={() => setEditingContact(contact)} />
                      {role === 'admin' && (
                        <RowActionButton label="Delete" destructive onClick={() => setDeletingContact(contact)} />
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
            <DialogTitle>Create Contact</DialogTitle>
            <DialogDescription>Add a new prospect or lead to the CRM.</DialogDescription>
          </DialogHeader>
          <AdminContactForm accounts={accounts} onCancel={() => setIsCreateOpen(false)} onSave={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={editingContact != null} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact details, account link, and source.</DialogDescription>
          </DialogHeader>
          {editingContact && (
            <AdminContactForm accounts={accounts} initialRecord={editingContact} onCancel={() => setEditingContact(null)} onSave={handleUpdate} />
          )}
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={deletingContact != null}
        onOpenChange={(open) => !open && setDeletingContact(null)}
        title="Delete contact?"
        description={`Are you sure you want to permanently delete "${deletingContact ? getContactDisplayName(deletingContact) : ''}"?`}
        confirmLabel="Delete Contact"
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
