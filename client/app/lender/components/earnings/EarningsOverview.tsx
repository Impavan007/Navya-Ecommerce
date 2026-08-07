"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

import useEarningsStore from '../../stores/earnings/earningsStore';
import CommonLoader from '@/app/components/common/CommonLoader';
import { toast } from 'react-hot-toast';
import Skeleton from '@/app/components/common/Skeleton';

export default function EarningsOverview() {
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('monthly');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const { data, loading, error, fetchEarnings } = useEarningsStore();

  // ✅ Fetch data when component mounts or chartView changes
  useEffect(() => {
    fetchEarnings(chartView);
  }, [chartView, fetchEarnings]);

  // ✅ Set initial chartView from API when available (optional)
  useEffect(() => {
    if (data?.earningsTrend?.currentFilter) {
      const f = String(data.earningsTrend.currentFilter).toLowerCase();
      if (['weekly', 'monthly'].includes(f)) {
        setChartView(f as any);
      }
    }
  }, [data]);

  // ✅ Show toast if error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const formatCurrency = (amount: number | string, currency = 'Rs.') => {
    const num = Number(amount || 0);
    try {
      return `${currency}${new Intl.NumberFormat().format(num)}`;
    } catch {
      return `${currency}${num}`;
    }
  };

  // Handle period change
  const handlePeriodChange = (period: 'weekly' | 'monthly') => {
    setChartView(period);
    // ✅ The useEffect above will automatically trigger fetchEarnings
  };

  // map cards from API to local card shape used by UI
  const kpiCards = useMemo(() => {
    const cards = data?.cards || {};
    return [
      {
        title: cards.totalEarnings?.label || 'Total Earnings',
        value: formatCurrency(cards.totalEarnings?.amount, cards.totalEarnings?.currency || 'Rs.'),
        subtitle: cards.totalEarnings?.subtitle || 'Lifetime',
        icon: 'ri-money-euro-circle-line',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: cards.pendingPayouts?.label || 'Pending Payouts',
        value: formatCurrency(cards.pendingPayouts?.amount, cards.pendingPayouts?.currency || 'Rs.'),
        subtitle: cards.pendingPayouts?.subtitle || 'Ready to withdraw',
        icon: 'ri-time-line',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
      },
      {
        title: cards.thisMonth?.label || 'This Month',
        value: formatCurrency(cards.thisMonth?.amount, cards.thisMonth?.currency || 'Rs.'),
        subtitle: cards.thisMonth?.subtitle || '',
        icon: 'ri-calendar-line',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title: cards.avgOrderValue?.label || 'Avg Order Value',
        value: formatCurrency(cards.avgOrderValue?.amount, cards.avgOrderValue?.currency || 'Rs.'),
        subtitle: cards.avgOrderValue?.subtitle || 'Per rental',
        icon: 'ri-bar-chart-line',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
    ];
  }, [data]);

  // build chart data array [{name, earnings}]
  const chartData = useMemo(() => {
    const chart = data?.earningsTrend?.chartData;
    if (!chart) return [];
    const labels: string[] = chart.labels || [];
    const dataset = chart.datasets?.[0]?.data || [];
    return labels.map((label: string, idx: number) => ({
      name: label,
      earnings: dataset[idx] ?? 0
    }));
  }, [data]);

  const trendPercentage = data?.earningsTrend?.trendPercentage ?? '';
  const trendPeriod = data?.earningsTrend?.trendPeriod ?? '';

  // Removed static error div return to ensure consistent toast usage

  return (
    <div className="space-y-6 font-playfair p-3 sm:p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 rounded-lg"
          >
            <div className="flex items-center">
              <div className={`${card.bgColor} p-3 rounded-md`}>
                <i
                  className={`${card.icon} ${card.color} text-xl flex items-center justify-center`}
                ></i>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 font-poppins">
                  {card.title}
                </p>
                {loading && !data ? (
                  <div className="space-y-2 mt-1">
                    <Skeleton width="100px" height="24px" />
                    <Skeleton width="80px" height="16px" />
                  </div>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins">
                      {card.value}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{card.subtitle}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-base sm:text-lg font-poppins font-bold text-gray-900">
              Earnings Trend
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chart Type Toggle */}
              <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
                {(['line', 'bar'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${chartType === type
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <i
                      className={`ri-${type === 'line' ? 'line' : 'bar'}-chart-line mr-1`}
                    ></i>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Time Period Toggle */}
              <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
                {(['weekly', 'monthly'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    disabled={loading}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${chartView === period
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >

                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="h-60 sm:h-80 relative">
            {loading ? (
              <CommonLoader pageCenter text="Updating chart..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickFormatter={(value) => `Rs.${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`Rs.${value}`, 'Earnings']}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#374151"
                      strokeWidth={3}
                      dot={{ fill: '#374151', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#374151' }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickFormatter={(value) => `Rs.${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`Rs.${value}`, 'Earnings']}
                    />
                    <Bar dataKey="earnings" fill="#374151" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          {/* Growth Indicator */}
          {trendPercentage && (
            <div className="mt-4 sm:mt-6 flex flex-wrap justify-center items-center gap-2 text-sm">
              <i className={`ri-arrow-${trendPercentage.includes('-') ? 'down' : 'up'}-line ${trendPercentage.includes('-') ? 'text-red-600' : 'text-green-600'}`}></i>
              <span className={`${trendPercentage.includes('-') ? 'text-red-600' : 'text-green-600'} font-medium font-poppins`}>
                {trendPercentage}
              </span>
              <span className="text-gray-600">{trendPeriod}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Ready for Payout
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(data?.cards?.pendingPayouts?.amount || 520)}
            </p>
            <p className="text-xs text-gray-500 mt-2">From completed orders</p>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="mt-4 px-4 py-2 sm:py-3 bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm sm:text-base font-poppins w-full rounded-md"
          >
            Request Payout
          </button>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Payout History
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              View all past payouts
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Track your payment history
            </p>
          </div>
          <button className="mt-4 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base font-poppins w-full rounded-md">
            View History
          </button>
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 font-playfair">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowPayoutModal(false)}
          ></div>
          <div className="relative bg-white rounded-lg max-w-sm w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg font-bold text-gray-900">Request Payout</h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-5 sm:space-y-6 text-sm sm:text-base">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="flex justify-between">
                  <span className="font-medium">Available Balance</span>
                  <span className="font-bold">
                    {formatCurrency(data?.cards?.pendingPayouts?.amount || 520)}
                  </span>
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  From completed orders
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payout Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    Rs.
                  </span>
                  <input
                    type="number"
                    defaultValue={data?.cards?.pendingPayouts?.amount || 520}
                    max={data?.cards?.pendingPayouts?.amount || 520}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(data?.cards?.pendingPayouts?.amount || 520)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Bank Account
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent">
                  <option>**** **** **** 1234 (Primary)</option>
                  <option>**** **** **** 5678 (Savings)</option>
                </select>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Amount</span>
                  <span>{formatCurrency(data?.cards?.pendingPayouts?.amount || 520)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee (2.5%)</span>
                  <span>-{formatCurrency((data?.cards?.pendingPayouts?.amount || 520) * 0.025)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between font-semibold">
                  <span>Net Payout</span>
                  <span>
                    {formatCurrency((data?.cards?.pendingPayouts?.amount || 520) * 0.975)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Payouts typically arrive within 1–2 business days.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-poppins transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPayoutModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-sm font-poppins transition-colors"
                >
                  Request Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}