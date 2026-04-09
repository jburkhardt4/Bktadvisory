import { useState } from 'react';
import { useSalesCrm } from './SalesCrmContext';
import {
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableHead,
  AdminDataTableHeader,
  AdminDataTableHeaderRow,
  AdminDataTableRow,
  AdminEmptyState,
  AdminLoadingState,
  AdminMetricCard,
} from './AdminWorkspaceComponents';
import {
  CONTACT_SOURCE_OPTIONS,
  type ContactSource,
  type SalesContactRecord,
} from './salesCrmApi';
import { formatDateTime } from './adminCrmApi';
import { PORTAL_HERO_SURFACE_CLASS } from '../portal/portalBranding';

/* ------------------------------------------------------------------ */
/*  Source badge                                                       */
/* ------------------------------------------------------------------ */

const SOURCE_STYLES: Record<ContactSource, { label: string; className: string }> = {
  estimator: { label: 'Estimator', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  email:     { label: 'Email',     className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  linkedin:  { label: 'LinkedIn',  className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  upwork:    { label: 'Upwork',    className: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300' },
  referral:  { label: 'Referral',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  manual:    { label: 'Manual',    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
};

function SourceBadge({ source }: { source: ContactSource }) {
  const s = SOURCE_STYLES[source] ?? SOURCE_STYLES.manual;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Tag chips                                                          */
/* ------------------------------------------------------------------ */

function TagChips({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return <span className="text-xs text-slate-400">—</span>;
  const visible = tags.slice(0, 2);
  const overflow = tags.length - 2;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {t}
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lead table                                                         */
/* ------------------------------------------------------------------ */

function LeadTable({ leads }: { leads: SalesContactRecord[] }) {
  if (leads.length === 0) {
    return (
      <AdminEmptyState
        title="No leads in this category"
        description="Leads will appear here as contacts are added from this source."
      />
    );
  }

  return (
    <AdminDataTable>
      <AdminDataTableHeader>
        <AdminDataTableHeaderRow>
          <AdminDataTableHead>Lead</AdminDataTableHead>
          <AdminDataTableHead>Source</AdminDataTableHead>
          <AdminDataTableHead>Tags</AdminDataTableHead>
          <AdminDataTableHead align="right">Added</AdminDataTableHead>
        </AdminDataTableHeaderRow>
      </AdminDataTableHeader>
      <AdminDataTableBody>
        {leads.map((contact) => (
          <AdminDataTableRow key={contact.id}>
            <AdminDataTableCell className="whitespace-normal">
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {contact.first_name} {contact.last_name}
              </p>
              {contact.email && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{contact.email}</p>
              )}
            </AdminDataTableCell>
            <AdminDataTableCell>
              <SourceBadge source={contact.source} />
            </AdminDataTableCell>
            <AdminDataTableCell>
              <TagChips tags={contact.tags ?? []} />
            </AdminDataTableCell>
            <AdminDataTableCell className="text-right text-sm text-slate-500 dark:text-slate-400">
              {formatDateTime(contact.created_at)}
            </AdminDataTableCell>
          </AdminDataTableRow>
        ))}
      </AdminDataTableBody>
    </AdminDataTable>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab bar                                                            */
/* ------------------------------------------------------------------ */

type LeadTab = 'all' | 'contact_form' | 'estimator' | 'gmail';

const TABS: { value: LeadTab; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'contact_form', label: 'Contact Form' },
  { value: 'estimator',    label: 'Estimator' },
  { value: 'gmail',        label: 'Gmail' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function SalesPipelinePage() {
  const { contacts, loading, error } = useSalesCrm();
  const [activeTab, setActiveTab] = useState<LeadTab>('all');

  if (loading) return <AdminLoadingState label="Loading leads…" />;

  const estimatorLeads  = contacts.filter((c) => c.source === 'estimator');
  const contactFormLeads = contacts.filter((c) => c.source !== 'estimator');

  const visibleLeads: SalesContactRecord[] = (() => {
    if (activeTab === 'all')          return contacts;
    if (activeTab === 'contact_form') return contactFormLeads;
    if (activeTab === 'estimator')    return estimatorLeads;
    return []; // gmail — placeholder
  })();

  const sourceLabel = CONTACT_SOURCE_OPTIONS.find((o) => o.value)?.label;
  void sourceLabel; // unused but keeps import live

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Hero */}
      <div className={`${PORTAL_HERO_SURFACE_CLASS} rounded-b-none border-b-0 p-6`}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-50">Leads</h2>
          <p className="mt-1 text-sm text-slate-200">
            Inbound queue from all lead sources.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <AdminMetricCard
            label="Total Leads"
            value={String(contacts.length)}
            helper="all sources"
            accentClassName="text-blue-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Contact Form"
            value={String(contactFormLeads.length)}
            helper="inbound contacts"
            accentClassName="text-indigo-200"
            variant="hero"
          />
          <AdminMetricCard
            label="Estimator"
            value={String(estimatorLeads.length)}
            helper="quote submissions"
            accentClassName="text-cyan-200"
            variant="hero"
          />
        </div>
      </div>

      {/* Tab bar + content */}
      <div className="bkt-shell-surface rounded-t-none border-t-0">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-4 dark:border-slate-800">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.value === 'gmail' && (
                <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'gmail' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <svg
                  className="h-6 w-6 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Gmail sync coming soon</p>
              <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                Tag emails with <span className="font-medium text-slate-600 dark:text-slate-300">"Web Leads"</span> in Gmail and they will automatically appear here.
              </p>
            </div>
          ) : (
            <LeadTable leads={visibleLeads} />
          )}
        </div>
      </div>
    </div>
  );
}
