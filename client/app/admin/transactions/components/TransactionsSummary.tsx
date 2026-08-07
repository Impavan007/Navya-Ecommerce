'use client';

import { Statistics } from '../../store/transactionStore/Transaction';

interface TransactionsSummaryProps {
  statistics: Statistics | null;
  loading: boolean;
}

export default function TransactionsSummary({ statistics, loading }: TransactionsSummaryProps) {
  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Determine change type for styling
  const getChangeType = (change: string) => {
    if (change.startsWith('+') && change !== '+0') return 'positive';
    if (change.startsWith('-')) return 'negative';
    return 'neutral';
  };

  // Transform statistics data to match the UI structure
  const summaryData = statistics ? [
    {
      title: 'Total Volume',
      value: formatCurrency(statistics.totalVolume.amount),
      change: statistics.totalVolume.growth,
      changeType: getChangeType(statistics.totalVolume.growth),
      period: statistics.totalVolume.period,
      icon: 'ri-money-euro-circle-line'
    },
    {
      title: 'Pending Deposits',
      value: formatCurrency(statistics.pendingDeposits.amount),
      change: `+${statistics.pendingDeposits.count} new`,
      changeType: 'neutral',
      period: statistics.pendingDeposits.status,
      icon: 'ri-time-line'
    },
    {
      title: 'Released Deposits',
      value: formatCurrency(statistics.releasedDeposits.amount),
      change: statistics.releasedDeposits.growth,
      changeType: getChangeType(statistics.releasedDeposits.growth),
      period: statistics.releasedDeposits.period,
      icon: 'ri-check-double-line'
    },
    {
      title: 'Refunds Issued',
      value: formatCurrency(statistics.refundsIssued.amount),
      change: statistics.refundsIssued.growth,
      changeType: getChangeType(statistics.refundsIssued.growth),
      period: statistics.refundsIssued.period,
      icon: 'ri-refund-line'
    },
    {
      title: 'Platform Fees',
      value: formatCurrency(statistics.platformFees.amount),
      change: statistics.platformFees.growth,
      changeType: getChangeType(statistics.platformFees.growth),
      period: statistics.platformFees.period,
      icon: 'ri-percent-line'
    }
  ] : [];

  if (loading) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-[#FAF6F3] rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div>
                  <div className="h-7 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-[#FAF6F3] rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300 mx-auto mb-4">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-error-warning-line text-gray-400 text-xl"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-poppins">No data available</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {summaryData.map((item, index) => (
          <div key={index} className="bg-[#FAF6F3] rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                index === 0 ? 'bg-gray-100 border-gray-300' :
                index === 1 ? 'bg-gray-100 border-gray-300' :
                index === 2 ? 'bg-gray-50 border-green-300' :
                index === 3 ? 'bg-orange-100 border-orange-300' :
                'bg-purple-100 border-purple-300'
              }`}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`${item.icon} ${
                    index === 0 ? 'text-gray-700' :
                    index === 1 ? 'text-gray-700' :
                    index === 2 ? 'text-green-700' :
                    index === 3 ? 'text-orange-700' :
                    'text-purple-700'
                  } text-xl`}></i>
                </div>
              </div>
              <span className={`text-sm font-medium font-poppins ${
                item.changeType === 'positive' ? 'text-green-600' :
                item.changeType === 'negative' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {item.change}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-1">{item.value}</h3>
              <p className="text-sm font-medium text-gray-900 mb-1 font-poppins">{item.title}</p>
              <p className="text-xs text-gray-500 font-playfair">{item.period}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
