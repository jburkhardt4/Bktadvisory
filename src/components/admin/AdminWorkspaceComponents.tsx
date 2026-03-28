import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface AdminWorkspaceHeaderProps {
  title: string;
  description: string;
  count: number;
  actionLabel?: string;
  onAction?: () => void;
  isRefreshing?: boolean;
}

interface AdminMetricCardProps {
  label: string;
  value: string;
  helper: string;
  accentClassName: string;
}

interface AdminEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AdminDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => Promise<void>;
}

interface AdminPreviewLinkProps {
  to: string;
  label: string;
}

export function AdminWorkspaceHeader({
  title,
  description,
  count,
  actionLabel,
  onAction,
  isRefreshing = false,
}: AdminWorkspaceHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {count} total
          </span>
          {isRefreshing && (
            <span className="text-xs text-blue-600 dark:text-blue-300">Refreshing…</span>
          )}
        </div>
        <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button
          type="button"
          onClick={onAction}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function AdminMetricCard({
  label,
  value,
  helper,
  accentClassName,
}: AdminMetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-bold ${accentClassName}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 dark:border-slate-700 dark:bg-slate-950/60">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
        {actionLabel && onAction && (
          <Button
            type="button"
            variant="outline"
            onClick={onAction}
            className="mt-5 rounded-xl"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function AdminDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  isDeleting = false,
  onConfirm,
}: AdminDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? 'Deleting…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminPreviewLink({ to, label }: AdminPreviewLinkProps) {
  return (
    <Button asChild variant="outline" className="rounded-xl">
      <Link to={to}>{label}</Link>
    </Button>
  );
}

export function AdminLoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function AdminSectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      {children}
    </div>
  );
}
