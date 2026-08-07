import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';

interface EarningsState {
  data: any | null;
  loading: boolean;
  error?: string | null;
  fetchEarnings: (period?: 'weekly' | 'monthly' | 'yearly') => Promise<void>;
  // transactions
  transactions: any[];
  transactionsLoading: boolean;
  transactionsError?: string | null;
  transactionFilters: {
    types: string[];
    statuses: string[];
    currentType: string;
    currentStatus: string;
    dateRange?: any;
  };
  pagination?: any;
  transactionCards?: any;
  fetchTransactions: (opts?: { type?: string; status?: string; page?: number; limit?: number }) => Promise<any[]>;
}

export const useEarningsStore = create<EarningsState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  transactions: [],
  transactionsLoading: false,
  transactionsError: null,
  transactionFilters: { types: [], statuses: [], currentType: 'All Types', currentStatus: 'All Status' },
  pagination: undefined,
  transactionCards: undefined,

  fetchEarnings: async (period = 'monthly') => {
    try {
      set({ loading: true, error: null });
      
      // ✅ Add period query parameter
      const res = await axiosClient.get(API_ENDPOINTS.EarningDashboard, {
        params: { period }
      });
      
      const payload = res?.data?.data ?? res?.data ?? null;
      set({ data: payload, loading: false });
    } catch (err: any) {
      console.error('Failed to fetch earnings dashboard:', err);
      set({ error: err?.response?.data?.message || err.message || 'Failed to load data', loading: false });
    }
  },
  // ✅ Fetch transactions (separate endpoint)
  fetchTransactions: async (opts: any = {}) => {
    try {
      set({ transactionsLoading: true, transactionsError: null });

      const params: any = {};
      if (opts.type && opts.type !== 'All Types' && opts.type !== 'all') params.type = opts.type;
      if (opts.status && opts.status !== 'All Status' && opts.status !== 'all') params.status = opts.status;
      if (opts.page) params.page = opts.page;
      if (opts.limit) params.limit = opts.limit;

      const res = await axiosClient.get(API_ENDPOINTS.EarningsTransactions, { params });
      const payload = res?.data?.data ?? res?.data ?? null;

      // map response
      const transactions = payload?.transactionHistory?.transactions || [];
      const filters = payload?.filters || {};
      const pagination = payload?.pagination || {};
      const cards = payload?.cards || {};

      set({
        transactions,
        transactionFilters: {
          types: filters.types || [],
          statuses: filters.statuses || [],
          currentType: filters.currentType || 'All Types',
          currentStatus: filters.currentStatus || 'All Status',
          dateRange: filters.dateRange || {},
        },
        pagination,
        transactionCards: cards,
        transactionsLoading: false,
      });
      // return transactions for callers that want the fetched data immediately (export flow)
      return transactions;
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      set({ transactionsError: err?.response?.data?.message || err.message || 'Failed to load transactions', transactionsLoading: false });
      return [];
    }
  },
}));

export default useEarningsStore;