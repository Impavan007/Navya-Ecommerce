'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import DashboardHeader from '../components/DashboardHeader';
import KPICards from '../components/KPICards';
import QuickActions from '../components/QuickActions';
import NotificationsFeed from '../components/NotificationsFeed';
import UpcomingOrders from '../components/UpcomingOrders';
import { useVendorDashboardStore } from '../stores/Dashboard/Dashboard';

export default function VendorDashboard() {
  const {
    dashboardData,
    loading,
    notificationsLoading,
    error,
    fetchDashboardData,
    clearError
  } = useVendorDashboardStore();

  const [currentPeriod, setCurrentPeriod] = useState('monthly');
  const [currentActivityFilter, setCurrentActivityFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleActivityFilterChange = (activityFilter: string) => {
    setCurrentActivityFilter(activityFilter);
    fetchDashboardData({ period: currentPeriod, activityFilter }, 'notifications');
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="w-full max-w-full bg-[#FAFAF7] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPI Summary Cards */}
          <KPICards
            summaryCards={dashboardData?.summaryCards}
            loading={loading}
          />

          {/* Quick Actions */}
          <QuickActions />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notifications & Activity Feed */}
            <div className="lg:col-span-2">
              <NotificationsFeed
                notifications={dashboardData?.notifications?.activities}
                loading={loading}
                partialLoading={notificationsLoading}
                onFilterChange={handleActivityFilterChange}
              />
            </div>

            {/* Upcoming Orders Preview */}
            <div className="space-y-8">
              <UpcomingOrders
                upcomingOrders={dashboardData?.upcomingOrders?.orders}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
