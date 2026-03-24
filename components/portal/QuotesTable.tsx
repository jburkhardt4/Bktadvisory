import { mockQuotes } from './portalData';
import { QuoteStatusBadge } from './StatusBadge';
import { EyeIcon, DownloadIcon } from './PortalIcons';

export function QuotesTable() {
  if (mockQuotes.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
        </div>
        <h3 className="text-base font-semibold text-slate-700">No quotes yet</h3>
        <p className="text-sm text-slate-500 mt-1">Your quotes will appear here once generated.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header inside tab content */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">All Quotes</h3>
        <span className="text-xs text-slate-500">{mockQuotes.length} total</span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-600 uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Amount</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockQuotes.map((q) => (
              <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{q.reference}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">{q.title}</td>
                <td className="px-6 py-4"><QuoteStatusBadge status={q.status} /></td>
                <td className="px-6 py-4 text-slate-900 text-right font-semibold">${q.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" title="View"><EyeIcon size={15} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" title="Download"><DownloadIcon size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-200">
        {mockQuotes.map((q) => (
          <div key={q.id} className="px-5 py-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{q.title}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{q.reference}</p>
              </div>
              <QuoteStatusBadge status={q.status} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="font-semibold text-slate-900">${q.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}