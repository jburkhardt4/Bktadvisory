// Icon components to avoid lucide-react import issue
const AwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const DollarSignIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export function StatsBar() {
  const stats = [
    {
      icon: AwardIcon,
      label: 'Salesforce-Certified',
      value: 'x5'
    },
    {
      icon: DollarSignIcon,
      label: 'Multi-Million $ Portfolios',
      value: 'Managed'
    },
    {
      icon: TrendingUpIcon,
      label: 'Double-Digit',
      value: 'Pipeline Growth'
    },
    {
      icon: ClockIcon,
      label: 'Underwriting Time',
      value: 'Weeks → Days'
    }
  ];

  return (
    <section className="border-y border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-600">
                      <Icon />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-900">{stat.value}</p>
                  <p className="text-sm text-neutral-600">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
