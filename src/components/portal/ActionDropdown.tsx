import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './PortalIcons';

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  adminOnly?: boolean;
}

interface ActionDropdownProps {
  label: string;
  items: ActionItem[];
  userRole?: 'admin' | 'client';
}

export function ActionDropdown({ label, items, userRole = 'client' }: ActionDropdownProps) {
  const visibleItems = items.filter(item => !item.adminOnly || userRole === 'admin');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (visibleItems.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
      >
        {label}
        <ChevronDownIcon size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150" role="menu">
          {visibleItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick?.(); setOpen(false); }}
              role="menuitem"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1d293d] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="text-slate-500">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EditButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
      title="Edit"
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    </button>
  );
}
