import { NavLink, useLocation } from 'react-router';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu';
import {
  ActivityIcon,
  BarChartIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  CpuIcon,
  FileTextIcon,
  FolderIcon,
  LayersIcon,
  SettingsIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from '../portal/PortalIcons';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  end?: boolean;
  badge?: string;
}

interface NavSection {
  heading?: string;
  items: NavItem[];
}

interface NavGroup {
  trigger: string;
  /** Route prefix used to highlight the trigger when any child is active */
  activePrefix: string;
  sections: NavSection[];
  /** Columns for the dropdown content grid */
  columns?: number;
}

/* ------------------------------------------------------------------ */
/*  Icon colour helpers (per-group accent)                             */
/* ------------------------------------------------------------------ */

const iconColor: Record<string, string> = {
  Sales: 'text-blue-500 dark:text-blue-400',
  Delivery: 'text-emerald-500 dark:text-emerald-400',
  'AI / Automations': 'text-violet-500 dark:text-violet-400',
};

/* ------------------------------------------------------------------ */
/*  Navigation data                                                    */
/* ------------------------------------------------------------------ */

function useNavGroups(counts: NavCounts): NavGroup[] {
  return [
    {
      trigger: 'Sales',
      activePrefix: '/portal/admin',
      sections: [
        {
          heading: 'Pipeline',
          items: [
            { path: '/portal/admin', label: 'Home (Overview)', description: 'Master CRM dashboard', icon: <LayersIcon size={16} />, end: true },
            { path: '/portal/admin/pipeline', label: 'Leads (Pipeline)', description: 'Visual deal board', icon: <TrendingUpIcon size={16} />, badge: counts.activeDeals },
            { path: '/portal/admin/sales-contacts', label: 'Contacts', description: 'Prospects and leads', icon: <UsersIcon size={16} />, badge: counts.contacts },
            { path: '/portal/admin/accounts', label: 'Accounts', description: 'Companies and orgs', icon: <BuildingIcon size={16} />, badge: counts.accounts },
            { path: '/portal/admin/deals', label: 'Opportunities (Deals)', description: 'All deal records', icon: <BriefcaseIcon size={16} />, badge: counts.deals },
          ],
        },
        {
          heading: 'Analytics & Schedule',
          items: [
            { path: '/portal/admin/calendar', label: 'Calendar', description: 'Schedule overview', icon: <CalendarIcon size={16} /> },
            { path: '/portal/admin/reports', label: 'Reports / Dashboards', description: 'Metrics and insights', icon: <BarChartIcon size={16} /> },
          ],
        },
      ],
      columns: 2,
    },
    {
      trigger: 'Delivery',
      activePrefix: '/portal/admin/quotes',
      sections: [
        {
          heading: 'Active Work',
          items: [
            { path: '/portal/admin/quotes', label: 'Quotes', description: 'Pricing and assignments', icon: <FileTextIcon size={16} />, badge: counts.quotes },
            { path: '/portal/admin/projects', label: 'Projects', description: 'Delivery management', icon: <FolderIcon size={16} />, badge: counts.projects },
            { path: '/portal/admin/activities', label: 'Activities', description: 'Timeline control', icon: <ActivityIcon size={16} />, badge: counts.activities },
            { path: '/portal/admin/milestones', label: 'Milestones', description: 'Delivery checkpoints', icon: <TargetIcon size={16} />, badge: counts.milestones },
          ],
        },
        {
          heading: 'Review',
          items: [
            { path: '/portal/admin/approvals', label: 'Client Approvals', description: 'Pending sign-offs', icon: <CheckCircleIcon size={16} /> },
          ],
        },
      ],
    },
    {
      trigger: 'AI / Automations',
      activePrefix: '/portal/admin/automation',
      sections: [
        {
          items: [
            { path: '/portal/admin/automation', label: 'Agent Workflows', description: 'Automated agent runs', icon: <CpuIcon size={16} /> },
            { path: '/portal/admin/prompt-library', label: 'Prompt Library', description: 'Saved prompt templates', icon: <BookOpenIcon size={16} /> },
            { path: '/portal/admin/automation-rules', label: 'Automation Rules', description: 'Trigger and action rules', icon: <SettingsIcon size={16} /> },
            { path: '/portal/admin/analytics', label: 'Analytics', description: 'AI usage insights', icon: <ZapIcon size={16} /> },
          ],
        },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Public interface                                                   */
/* ------------------------------------------------------------------ */

export interface NavCounts {
  activeDeals?: string;
  contacts?: string;
  accounts?: string;
  deals?: string;
  quotes?: string;
  projects?: string;
  activities?: string;
  milestones?: string;
}

export function AdminTopNav({ counts }: { counts: NavCounts }) {
  const location = useLocation();
  const groups = useNavGroups(counts);

  /** Check whether the current route falls under a given group */
  function isTriggerActive(group: NavGroup): boolean {
    for (const section of group.sections) {
      for (const item of section.items) {
        if (item.end && location.pathname === item.path) return true;
        if (!item.end && location.pathname.startsWith(item.path)) return true;
      }
    }
    return false;
  }

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {groups.map((group) => {
          const active = isTriggerActive(group);
          return (
            <NavigationMenuItem key={group.trigger}>
              <NavigationMenuTrigger
                className={
                  active
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                    : 'text-slate-900 dark:text-slate-300'
                }
              >
                {group.trigger}
              </NavigationMenuTrigger>

              <NavigationMenuContent className="min-w-[320px]">
                <div
                  className={
                    group.columns === 2
                      ? 'grid w-[480px] grid-cols-2 gap-x-2'
                      : 'w-[300px]'
                  }
                >
                  {group.sections.map((section, si) => (
                    <div key={si} className="p-1">
                      {section.heading && (
                        <p className="mb-1 px-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                          {section.heading}
                        </p>
                      )}
                      <ul className="space-y-0.5">
                        {section.items.map((item) => (
                          <li key={item.path}>
                            <NavLink
                              to={item.path}
                              end={item.end}
                              className={({ isActive }) =>
                                `group/link flex items-start gap-3 rounded-md px-2 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                                    : 'text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`
                              }
                            >
                              <span
                                className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                  iconColor[group.trigger] ?? 'text-slate-500'
                                } bg-slate-100 dark:bg-slate-800`}
                              >
                                {item.icon}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium leading-5">{item.label}</span>
                                  {item.badge && (
                                    <span className="rounded-full bg-slate-200 px-1.5 py-px text-[10px] font-semibold tabular-nums text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs leading-4 text-slate-500 dark:text-slate-400">
                                  {item.description}
                                </p>
                              </div>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
