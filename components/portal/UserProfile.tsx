import { mockUser } from './portalData';
import { BuildingIcon, MailIcon, PhoneIcon, UserIcon } from './PortalIcons';

export function UserProfile() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {mockUser.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-slate-50">{mockUser.name}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
              {mockUser.accountStatus}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{mockUser.role}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-1.5"><BuildingIcon size={14} /> {mockUser.company}</span>
            <span className="inline-flex items-center gap-1.5"><MailIcon size={14} /> {mockUser.email}</span>
            <span className="inline-flex items-center gap-1.5"><PhoneIcon size={14} /> {mockUser.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
