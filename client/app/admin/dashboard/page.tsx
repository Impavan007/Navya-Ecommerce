'use client';

import { useEffect } from 'react';

import KPICards from '../components/KPICards';
import QuickActions from '../components/QuickActions';
import ActivityFeed from '../components/ActivityFeed';
import { useDashboardStore } from '../store/Dashboards/Dashboard';

export default function adminDashboard() {
  const {
    dashboardData,
    loading,
    error,
    timeFilter,
    setTimeFilter,
    fetchDashboardData,
    clearError
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-1">Dashboard</h1>
          <p className="text-gray-500 font-poppins text-sm">Welcome back to Navyaa Admin Portal</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeFilter}
            onChange={(e) => handleTimeFilterChange(e.target.value)}
            className="px-4 py-2 border border-[#E5C9A4] rounded-xl text-sm font-poppins font-medium focus:outline-none focus:ring-2 focus:ring-[#BFA15F] bg-white text-[#1A1A1A] shadow-xs pr-8 cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <KPICards
        summaryCards={dashboardData?.summaryCards}
        loading={loading}
      />

      {/* Quick Actions */}
      <QuickActions
        openDisputes={dashboardData?.summaryCards?.openDisputes?.count}
        pendingListings={dashboardData?.summaryCards?.pendingListings?.count}
        PendingOnboarding={dashboardData?.summaryCards?.pendingWaitlists?.count}
        loading={loading}
      />

      {/* Activity Feed */}
      <ActivityFeed
        recentActivity={dashboardData?.recentActivity}
        timeFilter={timeFilter}
        loading={loading}
      />
    </div>
  );
}
