import { Award, TrendingUp, Clock, DollarSign } from 'lucide-react';

export function StatsBar() {
  const stats = [
    {
      icon: Award,
      label: 'Salesforce-Certified',
      value: 'x5'
    },
    {
      icon: DollarSign,
      label: 'Multi-Million $ Portfolios',
      value: 'Managed'
    },
    {
      icon: TrendingUp,
      label: 'Double-Digit',
      value: 'Pipeline Growth'
    },
    {
      icon: Clock,
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
                    <Icon className="text-blue-600" size={24} />
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
