import { mockUser } from './portalData';
import { BuildingIcon, MailIcon, PhoneIcon, UserIcon } from './PortalIcons';
import { EditButton } from './ActionDropdown';

export function UserProfile() {
  return (
    <div className="relative bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-xl p-5">
      <div className="absolute top-3 right-3">
        <EditButton />
      </div>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0">
          {mockUser.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-slate-50">{mockUser.name}</h2>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
              {mockUser.accountStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{mockUser.role}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2.5 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5"><BuildingIcon size={13} /> {mockUser.company}</span>
            <span className="inline-flex items-center gap-1.5"><MailIcon size={13} /> {mockUser.email}</span>
            <span className="inline-flex items-center gap-1.5"><PhoneIcon size={13} /> {mockUser.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}