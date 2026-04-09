import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

/* ── Breadcrumb ─────────────────────────────────────────────────── */
export function RecordBreadcrumb({
  listLabel,
  listPath,
  recordName,
}: {
  listLabel: string;
  listPath: string;
  recordName: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-300">
      <NavLink
        to={listPath}
        className="transition-colors hover:text-slate-100 hover:underline"
      >
        ← {listLabel}
      </NavLink>
      <span className="text-slate-500">/</span>
      <span className="max-w-xs truncate text-slate-200">{recordName}</span>
    </div>
  );
}

/* ── Field group (titled section card) ─────────────────────────── */
export function AdminFieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bkt-shell-surface overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {title}
        </h3>
      </div>
      <dl className="divide-y divide-slate-100 dark:divide-slate-800/60">{children}</dl>
    </div>
  );
}

/* ── Field row (label : value) ──────────────────────────────────── */
export function AdminFieldRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 px-5 py-3">
      <dt className="w-36 shrink-0 pt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 break-words text-sm text-slate-900 dark:text-slate-100">
        {value ?? <span className="text-slate-400">—</span>}
      </dd>
    </div>
  );
}

/* ── Related list card ──────────────────────────────────────────── */
export function AdminRelatedList({
  title,
  count,
  emptyText = 'No records found.',
  children,
}: {
  title: string;
  count: number;
  emptyText?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bkt-shell-surface overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {title}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-400">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  );
}

/* ── Mini detail card (inline related entity) ───────────────────── */
export function AdminDetailMiniCard({
  title,
  titleTo,
  fields,
}: {
  title: string;
  titleTo?: string;
  fields: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="bkt-shell-surface overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        {titleTo ? (
          <NavLink
            to={titleTo}
            className="text-sm font-semibold text-slate-900 hover:underline dark:text-slate-50"
          >
            {title}
          </NavLink>
        ) : (
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</span>
        )}
      </div>
      <dl className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-start gap-4 px-5 py-2.5">
            <dt className="w-24 shrink-0 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {label}
            </dt>
            <dd className="min-w-0 flex-1 break-words text-sm text-slate-800 dark:text-slate-200">
              {value ?? <span className="text-slate-400">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── Not found state ────────────────────────────────────────────── */
export function AdminRecordNotFound({
  listLabel,
  listPath,
}: {
  listLabel: string;
  listPath: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-10 py-12 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Record not found
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          This record may have been deleted or the URL is incorrect.
        </p>
        <NavLink
          to={listPath}
          className="mt-5 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to {listLabel}
        </NavLink>
      </div>
    </div>
  );
}

/* ── Outer 2-column detail layout ───────────────────────────────── */
export function AdminRecordDetailLayout({
  headline,
  left,
  right,
}: {
  headline: ReactNode;
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="space-y-6">
      {headline}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[323px_1fr]">
        <div className="space-y-4">{left}</div>
        <div className="space-y-4">{right}</div>
      </div>
    </div>
  );
}
