'use client';

import { PayoutStats } from '../../store/payout/payoutStore';

interface PayoutsSummaryProps {
  stats: PayoutStats | null;
}

export default function PayoutsSummary({ stats }: PayoutsSummaryProps) {
  const summaryCards = [
    {
      title: 'Pending Payouts',
      value: `Rs.${Number(stats?.byStatus?.pending?.amount || 0).toLocaleString()}`,
      subtitle: `${stats?.byStatus?.pending?.count || 0} payouts`,
      icon: 'ri-time-line',
      color: 'text-gray-700',
      bgColor: 'bg-[#efd1d6] border border-[#efd1d6]',
      trend: stats?.summary?.trend?.pending || '0%',
      trendUp: stats?.summary?.trend?.pending?.startsWith('+')
    },
    {
      title: 'Completed Payouts',
      value: `Rs.${Number(stats?.byStatus?.completed?.amount || 0).toLocaleString()}`,
      subtitle: `${stats?.byStatus?.completed?.count || 0} payouts`,
      icon: 'ri-check-line',
      color: 'text-green-700',
      bgColor: 'bg-gray-50 border border-green-300',
      trend: stats?.summary?.trend?.processing || '0%',
      trendUp: true
    },
    {
      title: 'Avg Processing Time',
      value: stats?.summary?.avgProcessingTime || '0 days',
      subtitle: 'Request to payment',
      icon: 'ri-speed-line',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100 border border-blue-300',
      trend: stats?.summary?.trend?.processing || '0 days',
      trendUp: true
    },
    {
      title: 'Total Payout Volume',
      value: `Rs.${Number(stats?.summary?.totalVolume || 0).toLocaleString()}`,
      subtitle: 'All time',
      icon: 'ri-money-euro-circle-line',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100 border border-gray-300',
      trend: '+0%', // Trend not provided for total volume in example
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryCards.map((card, index) => (
        <div key={index} className="bg-gray-50  p-6  border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card.bgColor}  flex items-center justify-center`}>
              <div className={`w-6 h-6 ${card.color} flex items-center justify-center`}>
                <i className={card.icon}></i>
              </div>
            </div>
            <div className={`flex items-center space-x-1 text-sm ${card.trendUp ? 'text-green-600' : 'text-red-600'} font-poppins`}>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={card.trendUp ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}></i>
              </div>
              <span className="font-medium">{card.trend}</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-sm text-gray-600 mb-1 font-poppins">{card.title}</p>
            <p className="text-xs text-gray-500 font-playfair">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
