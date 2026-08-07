'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

// -------------------------------
// 📘 Interfaces (Type Definitions)
// -------------------------------

export interface PayoutStats {
  summary: {
    totalPayouts: number;
    totalVolume: string;
    avgProcessingTime: string;
    trend: {
      pending: string;
      processing: string;
    };
  };
  byStatus: {
    pending: { count: number; amount: string };
    approved: { count: number; amount: string };
    completed: { count: number; amount: string };
    failed: { count: number; amount: string };
    held: { count: number; amount: string };
  };
}

export interface StatusCounts {
  allStatuses: number;
  pending: number;
  approved: number;
  completed: number;
  held: number;
}

export interface Payout {
  _id: string;
  id?: string;
  payout_slug_id: string;
  order: {
    _id: string;
    start_date?: string;
    end_date?: string;
    rental_fee_total?: number;
    order_slug_id: string;
  };
  lender: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profile_image: string;
    stripeAccountId?: string;
  };
  transaction: {
    _id: string;
    transaction_id?: string;
    transaction_slug_id?: string;
    stripePaymentIntentId?: string;
  };
  gross_amount: number;
  platform_fee: number;
  late_fee_deduction: number;
  refund_deduction: number;
  discount_deduction: number;
  net_amount: number;
  status: string;
  funds_state: string;
  hold_started_at: string;
  hold_expires_at: string;
  hold_duration_hours: number;
  stripe_destination_account: string;
  failure_count: number;
  max_retry_attempts: number;
  requires_manual_processing: boolean;
  has_open_dispute: boolean;
  timeline: any[];
  created_at: string;
  updated_at: string;
  processing_at: string;
  completed_at: string;
  stripe_transfer_id: string;
  total_deductions?: number;
  is_retryable?: boolean;
  hold_expired?: boolean;
}

interface PayoutStore {
  payouts: Payout[];
  stats: PayoutStats | null;
  statusCounts: StatusCounts | null;
  payoutsLoading: boolean;
  statsLoading: boolean;
  pagination: any;
  fetchPayouts: (params?: any) => Promise<void>;
  fetchPayoutStats: () => Promise<void>;
  fetchPayoutById: (id: string) => Promise<any>;
  updatePayoutStatus: (id: string | string[], status: string, reason?: string) => Promise<boolean>;
  payoutDecisionHold: (id: string, status: 'approve' | 'reject', reason?: string) => Promise<boolean>;
  bulkUpdatePayouts: (payoutIds: string[], action: 'approve' | 'hold', reason?: string) => Promise<boolean>;
  markPayoutAsPaid: (id: string | string[]) => Promise<boolean>;
}

// -------------------------------
// 🧠 Zustand Store Implementation
// -------------------------------
export const usePayoutStore = create<PayoutStore>((set) => ({
  payouts: [],
  stats: null,
  statusCounts: null,
  payoutsLoading: true,
  statsLoading: true,
  pagination: null,

  fetchPayouts: async (params?: any) => {
    try {
      set({ payoutsLoading: true });
      const res = await axiosClient.get(API_ENDPOINTS.admin_Payouts, { params });
      if (res.data.success) {
        set({
          payouts: res.data.data.payouts,
          pagination: res.data.data.pagination,
          statusCounts: res.data.data.statusCounts,
          payoutsLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
      set({ payoutsLoading: false });
    }
  },

  fetchPayoutStats: async () => {
    try {
      set({ statsLoading: true });
      const res = await axiosClient.get(API_ENDPOINTS.admin_Payouts_Stats);
      if (res.data.success) {
        set({
          stats: res.data.data,
          statsLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching payout stats:', error);
      set({ statsLoading: false });
    }
  },

  fetchPayoutById: async (id: string) => {
    try {
      const res = await axiosClient.get(`${API_ENDPOINTS.admin_Payouts}/${id}`);
      if (res.data.success) {
        return res.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching payout by id:', error);
      return null;
    }
  },

  updatePayoutStatus: async (id: string | string[], status: string, reason?: string) => {
    try {
      const ids = Array.isArray(id) ? id : [id];
      const requests = ids.map(payoutId =>
        axiosClient.post(`${API_ENDPOINTS.admin_Payouts}/${payoutId}/${status}`, { reason })
      );
      const responses = await Promise.all(requests);
      return responses.every(res => res.data.success);
    } catch (error) {
      console.error(`Error performing ${status} action:`, error);
      return false;
    }
  },

  payoutDecisionHold: async (id: string, status: 'approve' | 'reject', reason?: string) => {
    try {
      const res = await axiosClient.post(`${API_ENDPOINTS.admin_Payouts}/${id}/decision-hold`, {
        status,
        reason: status === 'reject' ? reason : undefined
      });
      return res.data.success;
    } catch (error) {
      console.error(`Error performing hold decision ${status}:`, error);
      return false;
    }
  },

  bulkUpdatePayouts: async (payoutIds: string[], action: 'approve' | 'hold', reason?: string) => {
    try {
      const res = await axiosClient.post(`${API_ENDPOINTS.admin_Payouts}/bulk/action`, {
        payoutIds,
        action,
        reason: action === 'hold' ? reason : undefined
      });
      return res.data.success;
    } catch (error) {
      console.error(`Error performing bulk action ${action}:`, error);
      return false;
    }
  },

  markPayoutAsPaid: async (id: string | string[]) => {
    try {
      const ids = Array.isArray(id) ? id : [id];
      const requests = ids.map(payoutId =>
        axiosClient.post(`${API_ENDPOINTS.admin_Payouts}/${payoutId}/mark-paid`)
      );
      const responses = await Promise.all(requests);
      return responses.every(res => res.data.success);
    } catch (error) {
      console.error('Error marking payout as paid:', error);
      return false;
    }
  }
}));
