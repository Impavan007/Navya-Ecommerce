'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Skeleton from '../../components/common/Skeleton';
import CommonLoader from '@/app/components/common/CommonLoader';

export default function EarningsSnapshot({ earningsSnapshot, loading, partialLoading, onFilterChange }: any) {
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Parse the earningsSnapshot if it's a string, otherwise use it directly
  const snapshotData = typeof earningsSnapshot === 'string'
    ? JSON.parse(earningsSnapshot)
    : earningsSnapshot;

  const viewMode = snapshotData?.currentFilter || 'monthly';

  // Transform chart data to match the required format
  const chartData = snapshotData?.chartData?.labels.map((label: string, index: number) => ({
    name: label,
    earnings: snapshotData?.chartData.data[index]
  })) || [];

  const currentData = chartData;

  const handleExport = (format: string) => {
    setShowExportModal(false);
  };

  // Calculate growth percentage for the trend indicator
  const getGrowthPercentage = (trendText: string) => {
    const match = trendText?.match(/\+([\d.]+)%/);
    return match ? match[1] : '0';
  };

  return (
    <>
      <div className="bg-[#FFFFFF] border border-[#F1F1F1]/1 overflow-hidden relative min-h-[400px]">
        {/* Partial Loading Overlay */}
        {partialLoading && !loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <CommonLoader size="md" />
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            <div className="bg-[#FAF4E8] p-8 space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton variant="text" width={200} height={32} className="bg-gray-200" />
                <Skeleton variant="text" width={80} height={20} className="bg-gray-200" />
              </div>
              <Skeleton variant="rect" width={150} height={36} className="bg-gray-200" />
            </div>
            <div className="p-8 space-y-8">
              <div className="flex justify-around">
                <div className="text-center space-y-2">
                  <Skeleton variant="text" width={100} height={28} />
                  <Skeleton variant="text" width={80} height={14} />
                </div>
                <div className="text-center space-y-2">
                  <Skeleton variant="text" width={100} height={28} />
                  <Skeleton variant="text" width={80} height={14} />
                </div>
              </div>
              <Skeleton variant="rect" width="100%" height={160} />
              <div className="flex justify-center">
                <Skeleton variant="text" width={200} height={20} />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section with Clean White & Gold Accent */}
            <div className="bg-white border-b border-[#F0E6D2] px-4 sm:px-6 pt-6 pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 sm:gap-0">
                <h1 className="text-[#1A1A1A] font-serif font-bold text-[24px] sm:text-[28px] leading-tight">
                  Earnings Snapshot
                </h1>

                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2 text-[#BFA15F] font-semibold text-[14px] font-roboto hover:text-[#9E7D3B] transition-colors"
                >
                  <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 9.91732H10.4963V11.084H0V9.91732ZM5.83125 6.52232L9.37665 2.97565L10.193 3.80398L5.24813 8.75065L0.303225 3.80398L1.1196 2.97565L4.665 6.52232V0.00065136H5.83125V6.52232Z" fill="#BFA15F" />
                  </svg>
                  Export
                </button>
              </div>

              <div className="inline-flex bg-[#FAF6F0] p-1 rounded-xl border border-[#F0E6D2] w-full sm:w-auto">
                <button
                  onClick={() => onFilterChange('weekly')}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 rounded-lg text-[13px] font-semibold font-poppins transition-all duration-200 ${viewMode === 'weekly'
                    ? 'bg-white text-[#BFA15F] border border-[#E5C9A4] shadow-xs'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                    }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => onFilterChange('monthly')}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 rounded-md text-[13px] font-semibold font-poppins transition-all duration-200 ${viewMode === 'monthly'
                    ? 'bg-white text-[#BFA15F] border border-[#E5C9A4] shadow-xs'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                    }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Body Section with White Background */}
            <div className="bg-white px-4 sm:px-6 pt-6 pb-6">
              {/* Key Stats - Structured in 2 clean columns with proper gap to prevent overlap */}
              <div className="grid grid-cols-2 gap-4 text-center mb-6 pb-6 border-b border-[#F5EFE6]">
                <div className="px-2 border-r border-[#F5EFE6]">
                  <p className="text-xl sm:text-2xl font-poppins font-extrabold text-[#1A1A1A] mb-1 truncate">
                    {snapshotData?.currentPeriod.currency} {snapshotData?.currentPeriod.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-500 font-poppins text-xs font-medium truncate">{snapshotData?.currentPeriod.label}</p>
                </div>
                <div className="px-2">
                  <p className="text-xl sm:text-2xl font-poppins font-extrabold text-[#1A1A1A] mb-1 truncate">
                    {snapshotData?.previousPeriod.currency} {snapshotData?.previousPeriod.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-500 font-poppins text-xs font-medium truncate">{snapshotData?.previousPeriod.label}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-40 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: '#9CA3AF', dy: 10 }}
                      interval={0}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFDF9',
                        border: '1px solid #E5C9A4',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) => [`Rs.${value}`, 'Earnings']}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#BFA15F"
                      strokeWidth={3}
                      dot={{ fill: '#BFA15F', strokeWidth: 0, r: 5 }}
                      activeDot={{ r: 6, fill: '#BFA15F' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Growth Indicator */}
              <div className="flex items-center justify-center gap-2">
                <i className="ri-arrow-up-line text-[#BFA15F] text-[14px]"></i>
                <span className="text-[14px] text-[#BFA15F] font-semibold font-poppins">
                  +{getGrowthPercentage(snapshotData?.previousPeriod.trend)}%
                </span>
                <span className="text-[15px] text-gray-500 font-poppins font-medium">
                  vs last {viewMode === 'monthly' ? 'month' : 'week'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Export Modal can be uncommented if needed */}
    </>
  );
}