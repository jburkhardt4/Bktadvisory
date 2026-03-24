const MOCK_USER = {
  name: 'Sarah Mitchell',
  company: 'Apex FinTech Solutions',
  email: 'sarah.mitchell@apexfintech.com',
  phone: '+1 (415) 555-0192',
  accountStatus: 'Active' as const,
};

export function UserProfileCard() {
  const initials = MOCK_USER.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
      {/* Avatar + name row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold tracking-wide">{initials}</span>
        </div>
        <div className="min-w-0">
          <div className="text-white font-semibold text-sm leading-tight">{MOCK_USER.name}</div>
          <div className="text-slate-400 text-xs mt-0.5 truncate">{MOCK_USER.company}</div>
        </div>
        <div className="ml-auto flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
            {MOCK_USER.accountStatus}
          </span>
        </div>
      </div>

      {/* Contact details */}
      <div className="space-y-2 pt-1 border-t border-slate-700/40">
        <div className="flex items-center gap-2 text-xs">
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 flex-shrink-0">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="text-slate-400 truncate">{MOCK_USER.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 flex-shrink-0">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="text-slate-400">{MOCK_USER.phone}</span>
        </div>
      </div>
    </div>
  );
}
