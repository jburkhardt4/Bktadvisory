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
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
      {s.label}
    </span>
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
          <AdminDataTableHead>Company</AdminDataTableHead>
          <AdminDataTableHead>Source</AdminDataTableHead>
          <AdminDataTableHead>Email</AdminDataTableHead>
          <AdminDataTableHead>Phone</AdminDataTableHead>
          <AdminDataTableHead>Website</AdminDataTableHead>
          <AdminDataTableHead align="right">Created</AdminDataTableHead>
        </AdminDataTableHeaderRow>
      </AdminDataTableHeader>
      <AdminDataTableBody>
        {leads.map((contact) => (
          <AdminDataTableRow key={contact.id}>
            <AdminDataTableCell className="whitespace-normal">
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {contact.first_name} {contact.last_name}
              </p>
            </AdminDataTableCell>
            <AdminDataTableCell className="text-sm text-slate-700 dark:text-slate-300">
              {contact.account?.name ?? <span className="text-slate-400">—</span>}
            </AdminDataTableCell>
            <AdminDataTableCell>
              <SourceBadge source={contact.source} />
            </AdminDataTableCell>
            <AdminDataTableCell className="text-sm text-slate-600 dark:text-slate-400">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </AdminDataTableCell>
            <AdminDataTableCell className="text-sm text-slate-600 dark:text-slate-400">
              {contact.phone || <span className="text-slate-400">—</span>}
            </AdminDataTableCell>
            <AdminDataTableCell className="text-sm text-slate-600 dark:text-slate-400">
              {contact.website_url ? (
                <a href={contact.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{contact.website_url}</a>
              ) : (
                <span className="text-slate-400">—</span>
              )}
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

type LeadTab = 'all' | 'website' | 'linkedin' | 'upwork' | 'gmail' | 'other';

const TABS: { value: LeadTab; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'website',  label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'upwork',   label: 'Upwork' },
  { value: 'gmail',    label: 'Gmail' },
  { value: 'other',    label: 'Other' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function SalesPipelinePage() {
  const { contacts, loading, error } = useSalesCrm();
  const [activeTab, setActiveTab] = useState<LeadTab>('all');

  if (loading) return <AdminLoadingState label="Loading leads…" />;

  const websiteLeads    = contacts.filter((c) => c.source === 'website' || c.source === 'estimator');
  const linkedinLeads   = contacts.filter((c) => c.source === 'linkedin');
  const upworkLeads     = contacts.filter((c) => c.source === 'upwork');
  const gmailLeads      = contacts.filter((c) => c.source === 'email');
  const otherLeads      = contacts.filter((c) => c.source === 'manual' || c.source === 'referral');

  const visibleLeads: SalesContactRecord[] = (() => {
    if (activeTab === 'all')      return contacts;
    if (activeTab === 'website')  return websiteLeads;
    if (activeTab === 'linkedin') return linkedinLeads;
    if (activeTab === 'upwork')   return upworkLeads;
    if (activeTab === 'gmail')    return gmailLeads;
    if (activeTab === 'other')    return otherLeads;
    return [];
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
            label="Website"
            value={String(websiteLeads.length)}
            helper="estimator & site forms"
            accentClassName="text-cyan-200"
            variant="hero"
          />
          <AdminMetricCard
            label="LinkedIn"
            value={String(linkedinLeads.length)}
            helper="inbound contacts"
            accentClassName="text-indigo-200"
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
            </button>
          ))}
        </div>

        <div className="p-4">
          <LeadTable leads={visibleLeads} />
        </div>
      </div>
    </div>
  );
}
