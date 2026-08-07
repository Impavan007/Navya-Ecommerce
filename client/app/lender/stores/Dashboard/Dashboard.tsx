'use client';

import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';

// -------------------------------
// 📘 Interfaces (Type Definitions)
// -------------------------------
export interface SummaryCard {
  count?: number;
  amount?: number;
  currency?: string;
  label: string;
  subtitle: string;
  trend?: string;
}

export interface SummaryCards {
  activeListings: SummaryCard;
  upcomingRentals: SummaryCard;
  pendingReturns: SummaryCard;
  totalEarnings: SummaryCard;
}

export interface Activity {
  type: string;
  title: string;
  description: string;
  time: string;
  actionText: string;
  id: string;
}

export interface Notifications {
  title: string;
  tabs: string[];
  activities: Activity[];
}

export interface OrderDate {
  start: string;
  end: string;
}

export interface UpcomingOrder {
  orderId: string;
  status: string;
  productName: string;
  renterName: string;
  dates: OrderDate;
  amount: string;
}

export interface UpcomingOrders {
  title: string;
  viewAllText: string;
  orders: UpcomingOrder[];
}

export interface PeriodData {
  amount: number;
  currency: string;
  label: string;
  period?: string;
  trend?: string;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface EarningsSnapshot {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
  chartData: ChartData;
}

export interface VendorDashboardData {
  summaryCards: SummaryCards;
  notifications: Notifications;
  upcomingOrders: UpcomingOrders;
  earningsSnapshot: EarningsSnapshot;
}

interface VendorDashboardStore {
  dashboardData: VendorDashboardData | null;
  loading: boolean;
  earningsLoading: boolean;
  notificationsLoading: boolean;
  error: string | null;
  fetchDashboardData: (params?: { period?: string; activityFilter?: string }, updateSource?: 'earnings' | 'notifications') => Promise<void>;
  clearError: () => void;
}

// -------------------------------
// 🧠 Zustand Store Implementation
// -------------------------------
export const useVendorDashboardStore = create<VendorDashboardStore>((set, get) => ({
  dashboardData: null,
  loading: true,
  earningsLoading: false,
  notificationsLoading: false,
  error: null,

  fetchDashboardData: async (params = {}, updateSource?: 'earnings' | 'notifications') => {
    try {
      // Determine if this is a partial update or a full initial load
      const isInitialLoad = !get().dashboardData;
      const isPeriodUpdate = updateSource === 'earnings';
      const isActivityUpdate = updateSource === 'notifications';

      set({ 
        loading: isInitialLoad, 
        earningsLoading: isPeriodUpdate,
        notificationsLoading: isActivityUpdate,
        error: null 
      });

      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.activityFilter) queryParams.append('activityFilter', params.activityFilter);

      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.Dashboard}?${queryParams.toString()}`
        : API_ENDPOINTS.Dashboard;

      const res = await axiosClient.get(url);
      
      const responseData = res.data?.data;
      
      if (!responseData) {
        throw new Error('No dashboard data received from server');
      }

      set({
        dashboardData: responseData,
        loading: false,
        earningsLoading: false,
        notificationsLoading: false
      });

    } catch (err: any) {
      console.error('Error fetching vendor dashboard data:', err);
      set({ 
        error: err.message || 'Failed to fetch dashboard data',
        loading: false,
        earningsLoading: false,
        notificationsLoading: false
      });
    }
  },

  clearError: () => set({ error: null })
}));