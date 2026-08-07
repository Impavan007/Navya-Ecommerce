'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Skeleton from '../../components/common/Skeleton';
import CommonLoader from '@/app/components/common/CommonLoader';

export default function NotificationsFeed({ notifications, loading, partialLoading, onFilterChange }: any) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');

  const handleActionClick = (notification: any) => {
    if (notification.actionUrl && notification.id) {
      const url = new URL(notification.actionUrl, window.location.origin);
      
      // Map category to query parameter name
      if (notification.category === 'orders') {
        url.searchParams.set('orderId', notification.id);
      } else if (notification.category === 'reviews') {
        url.searchParams.set('reviewId', notification.id);
      } else {
        url.searchParams.set('id', notification.id);
      }
      
      router.push(url.pathname + url.search);
    }
  };

  const handleFilterClick = (filterKey: string) => {
    setActiveFilter(filterKey);
    if (onFilterChange) {
      onFilterChange(filterKey);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-[#F0E6D2] overflow-hidden shadow-xs relative min-h-[300px]">
        {/* Partial Loading Overlay */}
        {partialLoading && !loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <CommonLoader size="md" />
          </div>
        )}

        <div className="p-4 sm:p-6 border-b border-[#E5C9A4] bg-[#FAF4E8]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-[22px] sm:text-[25px] font-serif font-bold text-[#1A1A1A]">Notifications & Activity</h2>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'orders', label: 'Orders' },
                { key: 'earnings', label: 'Earnings' },
                { key: 'reviews', label: 'Reviews' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => handleFilterClick(filterOption.key)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap font-poppins ${activeFilter === filterOption.key
                    ? 'bg-[#1A1A1A] text-[#FAF4E8] shadow-xs'
                    : 'bg-white text-[#BFA15F] border border-[#E5C9A4] hover:bg-[#FAF4E8]'
                    }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#F5EFE6]">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 sm:p-6 flex items-start space-x-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="text" width="20%" height={20} />
                    </div>
                    <Skeleton variant="text" width="80%" height={16} />
                    <Skeleton variant="text" width="30%" height={14} />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications?.length > 0 ? (
            notifications?.map((notification: any) => (
              <div key={notification.id} className="p-4 sm:p-6 hover:bg-[#FAF8F5] transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0">
                      <div className="flex-1">
                        <h3 className="text-[16px] font-semibold text-[#1A1A1A] font-poppins">{notification.title}</h3>
                        <p className="text-[14px] text-gray-700 mt-1 font-poppins">{notification.description}</p>
                        <p className="text-[12px] text-gray-400 mt-2 font-poppins">{notification.time}</p>
                      </div>

                      <button
                        onClick={() => handleActionClick(notification)}
                        className="text-[14px] text-[#BFA15F] hover:text-[#9E7D3B] font-semibold cursor-pointer whitespace-nowrap font-poppins self-start sm:self-auto sm:ml-4 bg-[#FAF4E8] sm:bg-transparent px-3 py-1 sm:p-0 rounded-md sm:rounded-none"
                      >
                        {notification.actionText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <i className="ri-notification-off-line text-4xl text-gray-300 mb-4 w-16 h-16 mx-auto flex items-center justify-center"></i>
              <p className="text-gray-500 font-playfair">No notifications found for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}