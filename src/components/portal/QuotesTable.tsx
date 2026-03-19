import { mockQuotes } from '../../mocks/portalData';
import type { QuoteRecord, QuoteStatus } from '../../types/portal';

function formatUSD(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_CONFIG: Record<QuoteStatus, { label: string; classes: string }> = {
  draft:              { label: 'Draft',              classes: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  scoping:            { label: 'Scoping',            classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  quoted:             { label: 'Quoted',             classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  sent:               { label: 'Sent',               classes: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  revision_requested: { label: 'Revision Req.',      classes: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  accepted:           { label: 'Accepted',           classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  declined:           { label: 'Declined',           classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
  expired:            { label: 'Expired',            classes: 'bg-slate-600/20 text-slate-500 border-slate-600/30' },
};

function StatusChip({ status }: { status: QuoteStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}

function QuoteRow({ quote }: { quote: QuoteRecord }) {
  return (
    <tr className="border-t border-slate-700/40 hover:bg-slate-800/30 transition-colors">
      <td className="py-3 px-4">
        <div className="text-white text-sm font-medium leading-snug max-w-xs">{quote.description}</div>
      </td>
      <td className="py-3 px-4 text-slate-400 text-sm whitespace-nowrap">{quote.companyName}</td>
      <td className="py-3 px-4 text-white text-sm font-medium whitespace-nowrap tabular-nums">{formatUSD(quote.amount)}</td>
      <td className="py-3 px-4 whitespace-nowrap"><StatusChip status={quote.status} /></td>
      <td className="py-3 px-4 text-slate-400 text-sm whitespace-nowrap">{formatDate(quote.createdAt)}</td>
      <td className="py-3 px-4">
        <button
          onClick={() => console.log('[Portal] View quote', quote.id)}
          className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
        >
          View
        </button>
      </td>
    </tr>
  );
}

function QuoteCard({ quote }: { quote: QuoteRecord }) {
  return (
    <div className="p-4 border border-slate-700/40 rounded-lg bg-slate-900/40 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-white text-sm font-medium leading-snug flex-1">{quote.description}</p>
        <StatusChip status={quote.status} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{quote.companyName}</span>
        <span className="text-white font-semibold tabular-nums">{formatUSD(quote.amount)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{formatDate(quote.createdAt)}</span>
        <button
          onClick={() => console.log('[Portal] View quote', quote.id)}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );
}

export function QuotesTable() {
  const quotes = mockQuotes;

  if (quotes.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        No quotes found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50">
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <QuoteRow key={quote.id} quote={quote} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {quotes.map((quote) => (
          <QuoteCard key={quote.id} quote={quote} />
        ))}
      </div>
    </>
  );
}
