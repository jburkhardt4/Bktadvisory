import { useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon, FileTextIcon, FolderIcon, ActivityIcon, PenIcon,
  TargetIcon, ZapIcon, UploadIcon,
} from './PortalIcons';

type ActionContext = 'dashboard' | 'project';

interface ActionItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  adminOnly?: boolean;
}

const DASHBOARD_ITEMS: Omit<ActionItem, 'onClick'>[] = [
  { key: 'create-quote', label: 'Create Quote', icon: <FileTextIcon size={15} />, adminOnly: true },
  { key: 'create-project', label: 'Create Project', icon: <FolderIcon size={15} />, adminOnly: true },
  { key: 'add-activity', label: 'Add Activity', icon: <ActivityIcon size={15} /> },
  { key: 'request-scope-change', label: 'Request Scope Change', icon: <PenIcon size={15} /> },
];

const PROJECT_ITEMS: Omit<ActionItem, 'onClick'>[] = [
  { key: 'update-project', label: 'Update Project', icon: <FolderIcon size={15} />, adminOnly: true },
  { key: 'add-milestone', label: 'Add Milestone', icon: <TargetIcon size={15} />, adminOnly: true },
  { key: 'add-activity', label: 'Add Activity', icon: <ZapIcon size={15} /> },
  { key: 'upload-document', label: 'Upload Document', icon: <UploadIcon size={15} /> },
];

const CONTEXT_ITEMS: Record<ActionContext, Omit<ActionItem, 'onClick'>[]> = {
  dashboard: DASHBOARD_ITEMS,
  project: PROJECT_ITEMS,
};

interface ActionDropdownProps {
  label: string;
  context?: ActionContext;
  items?: ActionItem[];
  onAction?: (action: string) => void;
  userRole?: 'admin' | 'client';
}

export function ActionDropdown({ label, context, items, onAction, userRole = 'client' }: ActionDropdownProps) {
  const resolvedItems: ActionItem[] = context
    ? CONTEXT_ITEMS[context].map(item => ({ ...item, onClick: () => onAction?.(item.key) }))
    : items ?? [];
  const visibleItems = resolvedItems.filter(item => !item.adminOnly || userRole === 'admin');
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
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30" role="menu">
          {visibleItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick?.(); setOpen(false); }}
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#1d293d] transition-colors cursor-pointer hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="text-slate-500 dark:text-slate-400">{item.icon}</span>
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
      className="cursor-pointer rounded-lg p-1.5 text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      title="Edit"
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    </button>
  );
}
