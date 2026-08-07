'use client';

import { useState } from 'react';
import { RecentActivity } from '../store/Dashboards/Dashboard';
import CommonLoader from '../../components/common/CommonLoader';
import Skeleton from '../../components/common/Skeleton';

interface ActivityFeedProps {
  recentActivity: RecentActivity | null | undefined;
  timeFilter: string;
  loading: boolean;
}

export default function ActivityFeed({ recentActivity, timeFilter, loading }: ActivityFeedProps) {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'requested':
      case 'confirmed':
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'returned':
      case 'completed':
        return 'bg-[#F3D6DC] text-green-700';
      case 'refunded':
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      case 'open':
        return 'bg-red-100 text-red-700';
      case 'resolved':
        return 'bg-[#F3D6DC] text-green-700';


      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton variant="text" width={190} height={32} className="mb-2" />
          <Skeleton variant="text" width={250} height={16} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border border-[#F3D6DC] p-6 space-y-4">
              <Skeleton variant="rect" width="100%" height={40} className="mb-4" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between items-start border-b border-gray-50 pb-4">
                   <div className="space-y-2 flex-1">
                      <div className="flex gap-2">
                        <Skeleton variant="text" width={80} height={16} />
                        <Skeleton variant="rect" width={60} height={20} className="rounded-full" />
                      </div>
                      <Skeleton variant="text" width="70%" height={14} />
                      <Skeleton variant="text" width="50%" height={12} />
                   </div>
                   <div className="text-right space-y-2">
                      <Skeleton variant="text" width={50} height={16} />
                      <Skeleton variant="text" width={40} height={12} />
                   </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recentActivity) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-['Canela'] font-bold text-black mb-2">Recent Activity</h2>
          <p className="text-gray-600 font-poppins">Latest bookings and disputes across the platform</p>
        </div>

        <div>
          <div className="bg-[#FAF6F3] border border-[#E5E7EB] overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-shopping-bag-line text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-500">No activity data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-1">{recentActivity.title}</h2>
        <p className="text-gray-500 font-poppins text-sm">{recentActivity.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Bookings */}
        <div className="bg-white rounded-xl border border-[#F0E6D2] overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[#E5C9A4] bg-[#FAF4E8]">
            <h3 className="text-lg font-bold text-[#1A1A1A] font-serif">{recentActivity.latestBookings.title}</h3>
          </div>
          <div className="divide-y divide-[#F5EFE6]">
            {recentActivity.latestBookings.bookings.length > 0 ? (
              recentActivity.latestBookings.bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking.id)}
                  className="p-6 hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-base text-[#1A1A1A] font-poppins">{booking.bookingId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-poppins ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mb-1 font-poppins font-medium">{booking.productName}</p>
                      <p className="text-xs text-gray-500 font-poppins font-medium">
                        {booking.lenderName} → {booking.renterName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-poppins text-[#1A1A1A]">{booking.amount}</p>
                      <p className="text-xs text-gray-400 font-poppins font-medium">{booking.timeAgo}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#FAF4E8] rounded-full flex items-center justify-center text-[#BFA15F]">
                  <i className="ri-shopping-bag-line text-xl"></i>
                </div>
                <p className="text-gray-500">No bookings today 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Disputes */}
        <div className="bg-white rounded-xl border border-[#F0E6D2] overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[#E5C9A4] bg-[#FAF4E8]">
            <h3 className="text-lg font-bold text-[#1A1A1A] font-serif">{recentActivity.latestDisputes.title}</h3>
          </div>
          <div className="divide-y divide-[#F5EFE6]">
            {recentActivity.latestDisputes.disputes.length > 0 ? (
              recentActivity.latestDisputes.disputes.map((dispute: any) => (
                <div
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute.id)}
                  className="p-6 hover:bg-[#FAF8F5] cursor-pointer transition-colors bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-[#1A1A1A] font-poppins text-base">{dispute.disputeId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-poppins ${getStatusColor(dispute.status)}`}>
                          {dispute.status}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-poppins ${getPriorityColor(dispute.severity)}`}>
                          {dispute.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mb-1 font-poppins line-clamp-1">{dispute.title}</p>
                      <p className="text-xs text-gray-500 font-poppins">Booking: {dispute.bookingId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-poppins">{dispute.timeAgo}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#FAF4E8] rounded-full flex items-center justify-center text-[#BFA15F]">
                  <i className="ri-error-warning-line text-xl"></i>
                </div>
                <p className="text-gray-500">No disputes today 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}