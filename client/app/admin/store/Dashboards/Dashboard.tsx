'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

// -------------------------------
// 📘 Interfaces (Type Definitions)
// -------------------------------
export interface PeriodFilter {
  current: string;
  options: string[];
  label: string;
}

export interface SummaryCard {
  count?: number;
  amount?: number;
  currency?: string;
  label: string;
  subtitle: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface SummaryCards {
  totalActiveUsers: SummaryCard;
  totalBookings: SummaryCard;
  gmv: SummaryCard;
  pendingListings: SummaryCard;
  openDisputes: SummaryCard;
  pendingWaitlists?: SummaryCard;
}

export interface Booking {
  id: string;
  bookingId: string;
  status: string;
  productName: string;
  renterName: string;
  lenderName: string;
  amount: string;
  timeAgo: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  disputeId: string;
  status: string;
  severity: string;
  title: string;
  description: string;
  bookingId: string;
  timeAgo: string;
  created_at: string;
}

export interface RecentActivity {
  title: string;
  subtitle: string;
  latestBookings: {
    title: string;
    bookings: Booking[];
  };
  latestDisputes: {
    title: string;
    disputes: Dispute[];
  };
}

export interface DashboardData {
  periodFilter: PeriodFilter;
  summaryCards: SummaryCards;
  recentActivity: RecentActivity;
}

interface DashboardStore {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  timeFilter: string;
  fetchDashboardData: (timeFilter?: string) => Promise<void>;
  setTimeFilter: (filter: string) => void;
  clearError: () => void;
}

// -------------------------------
// 🧠 Zustand Store Implementation
// -------------------------------
export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboardData: null,
  loading: true,
  error: null,
  timeFilter: '30d',

  fetchDashboardData: async (timeFilter?: string) => {
    try {
      set({ loading: true, error: null });

      const filter = timeFilter || get().timeFilter;
      const queryParams: any = {};
      if (filter && filter !== '30d') {
        queryParams.period = filter;
      }

      const requestConfig = Object.keys(queryParams).length > 0
        ? { params: queryParams }
        : {};

      const res = await axiosClient.get(API_ENDPOINTS.Dashboard, requestConfig);

      const responseData = res.data?.data;

      if (!responseData) {
        throw new Error('No dashboard data received from server');
      }

      set({
        dashboardData: responseData,
        loading: false
      });

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      set({
        error: err.message || 'Failed to fetch dashboard data',
        loading: false
      });
    }
  },

  setTimeFilter: (filter: string) => {
    set({ timeFilter: filter });
    // Automatically refetch data when filter changes
    get().fetchDashboardData(filter);
  },

  clearError: () => set({ error: null })
}));