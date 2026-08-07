'use client';

export default function KPIOverview() {
  const kpis = [
    {
      title: 'Total Bookings',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      period: 'Last 30 days',
      icon: 'ri-shopping-bag-line'
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: '+8.2%',
      trend: 'up',
      period: 'Last 30 days',
      icon: 'ri-user-line'
    },
    {
      title: 'GMV',
      value: 'Rs.89,420',
      change: '+15.7%',
      trend: 'up',
      period: 'This month',
      icon: 'ri-money-euro-circle-line'
    },
    {
      title: 'Refunds Processed',
      value: 'Rs.4,230',
      change: '-5.3%',
      trend: 'down',
      period: 'Last 30 days',
      icon: 'ri-refund-line'
    },
    {
      title: 'Dispute Rate',
      value: '2.1%',
      change: '+0.3%',
      trend: 'up',
      period: 'Last 30 days',
      icon: 'ri-alert-line'
    },
    {
      title: 'Avg Response Time',
      value: '4.2h',
      change: '-1.2h',
      trend: 'down',
      period: 'Last 7 days',
      icon: 'ri-time-line'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900">Platform Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-refresh-line"></i>
          </div>
          <span>Updated 5 min ago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="relative">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-100  flex items-center justify-center">
                <div className="w-5 h-5 flex items-center justify-center text-gray-600">
                  <i className={kpi.icon}></i>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-serif font-bold text-gray-900 mb-2">{kpi.value}</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change}
                  </span>
                  <div className={`w-4 h-4 flex items-center justify-center ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <i className={kpi.trend === 'up' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}></i>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{kpi.period}</p>
              </div>
            </div>
            <div className={`absolute top-0 right-0 w-1 h-16 rounded-full ${
              kpi.trend === 'up' ? 'bg-yellow-400' : 'bg-gray-300'
            }`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}