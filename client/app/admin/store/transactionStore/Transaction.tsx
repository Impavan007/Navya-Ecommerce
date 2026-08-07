'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

// -------------------------------
// 📘 Interfaces (Type Definitions)
// -------------------------------
export interface TransactionUser {
  name: string;
  avatar: string;
}

export interface Statistics {
  totalVolume: { amount: number; growth: string; period: string };
  pendingDeposits: { amount: number; count: number; status: string };
  releasedDeposits: { amount: number; growth: string; period: string };
  refundsIssued: { amount: number; growth: string; period: string };
  platformFees: { amount: number; growth: string; period: string };
}

export interface Transaction {
  id: string;
  orderId: string;
  type: string;
  amount: number;
  status: string;
  transaction_slug_id: string;
  order_slug_id: string;
  date: string;
  stripeId: string;
  borrower: TransactionUser;
  lender: TransactionUser;
  RentalStartDate: string;
  RentalEndDate: string;
  platformFee?: number;
  refundAmount?: number;
  cancellationFee?: number;
}

export interface TransactionDetail {
  _id: string;
  transaction_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  overview: {
    transactionId: string;
    transactionType: string;
    status: string;
    amount: number;
    currency: string;
    processingTime: string;
    created: string;
    paymentMethod: {
      type: string;
      last4: string;
      brand: string;
      expiryMonth: string;
      expiryYear: string;
    };
  };
  financialBreakdown: {
    paymentDistribution: {
      baseRentalAmount: number;
      platformFee: {
        amount: number;
        percentage: number;
      };
      netToLender: number;
    };
    processingFees: {
      stripeProcessingFee: number;
      currencyConversion: number;
    };
    paymentBreakdown?: {
      components?: {
        rentalAmount?: number;
        cleaningFee?: number;
        platformFee?: number;
        securityDeposit?: number;
      };
      totalPaidByRenter?: number;
    };
    distribution?: {
      lenderEarnings?: number;
      platformRevenue?: number;
      processingFees?: number;
      netAmount?: number;
      toadmin?: { amount?: number };
      toLender?: { amount?: number; description?: string };
      heldInEscrow?: { amount?: number; status?: string };
    };
  };
  stripeDetails: {
    transactionInformation: {
      stripeTransactionId: string;
      paymentIntentId: string;
      customerId: string;
      paymentMethodId: string;
    };
  };
  participants: {
    renter: {
      id: string;
      name: string;
      email: string;
      role: string;
      joinedDate: string;
    };
    lender: {
      id: string;
      name: string;
      email: string;
      role: string;
      joinedDate: string;
    };
  };
  relatedOrder: {
    orderId: string;
    orderNumber: string;
    status: string;
    rentalStartDate: string;
    rentalEndDate: string;
    totalAmount: number;
    products: Array<{
      id: string;
      name: string;
      image: string;
      quantity: number;
      size: string;
      dailyRate: number;
    }>;
  };
  relatedTransactions: any[];
  timeline: Array<{
    event: string;
    date: string;
    status: string;
    description: string;
    icon: string;
  }>;
  actions: {
    canExportReceipt: boolean;
    canRefund: boolean;
    canViewStripeDetails: boolean;
  };
}

export interface Statistics {
  totalVolume: {
    amount: number;
    growth: string;
    period: string;
  };
  pendingDeposits: {
    amount: number;
    count: number;
    status: string;
  };
  releasedDeposits: {
    amount: number;
    growth: string;
    period: string;
  };
  refundsIssued: {
    amount: number;
    growth: string;
    period: string;
  };
  platformFees: {
    amount: number;
    growth: string;
    period: string;
  };
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface UsersData {
  [key: string]: any;
}

export interface TransactionResponse {
  transactions: Transaction[];
  statistics: Statistics;
  pagination: Pagination;
  users: UsersData;
}

interface TransactionStore {
  transactions: Transaction[];
  transactionDetail: TransactionDetail | null;
  statistics: Statistics | null;
  pagination: Pagination | null;
  users: UsersData | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  fetchTransactions: (params?: {
    searchQuery?: string;
    filters?: any;
    page?: number;
  }) => Promise<void>;
  getTransactionById: (transactionId: string) => Promise<TransactionDetail | null>;
  clearError: () => void;
  clearTransactionDetail: () => void;
}

// -------------------------------
// 🧠 Zustand Store Implementation
// -------------------------------
export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  transactionDetail: null,
  statistics: null,
  pagination: null,
  users: null,
  loading: true,
  detailLoading: false,
  error: null,

  fetchTransactions: async (params?: {
    searchQuery?: string;
    filters?: any;
    page?: number;
  }) => {
    try {
      set({ loading: true, error: null });
      // Build query params for the API - only include non-empty values
      const queryParams: any = {};

      // Only add searchQuery if it has a value
      if (params?.searchQuery && params.searchQuery.trim() !== '') {
        queryParams.search = params.searchQuery.trim();
      }

      // Only add filters if they exist and have non-default values
      if (params?.filters) {
        const nonDefaultFilters = getNonDefaultFilters(params.filters);
        if (Object.keys(nonDefaultFilters).length > 0) {
          Object.assign(queryParams, nonDefaultFilters);
        }
      }

      // Only add page if it's defined and not the first page
      if (params?.page && params.page > 1) {
        queryParams.page = params.page;
      }
      // Only send params if there are any to send
      const requestConfig = Object.keys(queryParams).length > 0
        ? { params: queryParams }
        : {};

      const res = await axiosClient.get(API_ENDPOINTS.Transactions, requestConfig);

      const responseData = res.data?.data;

      if (!responseData) {
        throw new Error('No data received from server');
      }

      // Transform API data to match our frontend structure
      const transformedTransactions: Transaction[] = (responseData.transactions || []).map((txn: any) => {
        // Get user details directly from the transaction object
        const renter = txn.renter || {
          name: 'Unknown Buyer',
          avatar: 'https://readdy.ai/api/search-image?query=young%20professional%20woman%20portrait%20headshot%20clean%20background%20business%20casual%20confident%20smile%20modern%20lighting&width=40&height=40&seq=default-borrower&orientation=squarish'
        };

        const lender = txn.lender || {
          name: 'Unknown Seller',
          avatar: 'https://readdy.ai/api/search-image?query=elegant%20woman%20portrait%20headshot%20clean%20background%20professional%20attire%20warm%20smile%20modern%20lighting&width=40&height=40&seq=default-lender&orientation=squarish'
        };

        return {
          id: txn._id,
          transaction_slug_id: txn.transaction_slug_id,
          order_slug_id: txn.order?.order_slug_id,
          orderId: txn.order?.order_number || 'N/A',
          type: txn.type?.toLowerCase() || 'payment',
          amount: txn.amount,
          status: txn.status?.toLowerCase() || 'pending',
          date: txn.created_at,
          stripeId: txn.stripePaymentIntentId || 'N/A',
          borrower: {
            name: renter.name,
            avatar: renter.profile_image || renter.avatar // Use profile_image from API
          },
          lender: {
            name: lender.name,
            avatar: lender.profile_image || lender.avatar // Use profile_image from API
          },
          TransactionID: txn.transaction_id || 'N/A',
          RentalStartDate: txn.order?.rentalStartDate || txn.created_at,
          RentalEndDate: txn.order?.rentalEndDate || txn.created_at,
          platformFee: txn.platformFee ? txn.platformFee : 0,
          refundAmount: txn.refundAmount ? txn.refundAmount : 0,
          cancellationFee: txn.cancellationFee ? txn.cancellationFee : 0
        };
      });

      // Transform statistics data
      const transformedStatistics: Statistics = responseData.statistics ? {
        totalVolume: {
          amount: responseData.statistics.totalVolume?.amount || 0,
          growth: responseData.statistics.totalVolume?.growth || '+0',
          period: responseData.statistics.totalVolume?.period || 'Last 30 days'
        },
        pendingDeposits: {
          amount: responseData.statistics.pendingDeposits?.amount || 0,
          count: responseData.statistics.pendingDeposits?.count || 0,
          status: responseData.statistics.pendingDeposits?.status || 'Currently held'
        },
        releasedDeposits: {
          amount: responseData.statistics.releasedDeposits?.amount || 0,
          growth: responseData.statistics.releasedDeposits?.growth || '+0',
          period: responseData.statistics.releasedDeposits?.period || 'This month'
        },
        refundsIssued: {
          amount: responseData.statistics.refundsIssued?.amount || 0,
          growth: responseData.statistics.refundsIssued?.growth || '+0',
          period: responseData.statistics.refundsIssued?.period || 'This month'
        },
        platformFees: {
          amount: responseData.statistics.platformFees?.amount || 0,
          growth: responseData.statistics.platformFees?.growth || '+0',
          period: responseData.statistics.platformFees?.period || 'Collected this month'
        }
      } : getDefaultStatistics();

      set({
        transactions: transformedTransactions,
        statistics: transformedStatistics,
        pagination: responseData.pagination || null,
        users: responseData.users || null,
        loading: false
      });

    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      set({
        error: err.message || 'Failed to fetch transactions',
        loading: false
      });
    }
  },

  getTransactionById: async (transactionId: string) => {
    try {
      set({ detailLoading: true, error: null });
      const res = await axiosClient.get(`${API_ENDPOINTS.Transactions}/${transactionId}`);

      const transactionData = res.data?.data?.transaction;

      if (!transactionData) {
        throw new Error('No transaction data received from server');
      }

      set({
        transactionDetail: transactionData,
        detailLoading: false
      });

      return transactionData;
    } catch (err: any) {
      console.error('Error fetching transaction details:', err);
      set({
        error: err.message || 'Failed to fetch transaction details',
        detailLoading: false
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
  clearTransactionDetail: () => set({ transactionDetail: null })
}));

// Helper function to filter out default filter values
const getNonDefaultFilters = (filters: any) => {
  const nonDefaultFilters: any = {};

  // Define default values for each filter
  const defaultFilters = {
    type: 'all',
    status: 'all',
    dateRange: 'all',
    amountRange: 'all'
  };

  // Only include filters that are different from defaults
  Object.keys(filters).forEach(key => {
    if (filters[key] !== defaultFilters[key as keyof typeof defaultFilters] &&
      filters[key] !== '' &&
      filters[key] != null) {
      nonDefaultFilters[key] = filters[key];
    }
  });

  return nonDefaultFilters;
};

// Default statistics in case API doesn't provide them
const getDefaultStatistics = (): Statistics => ({
  totalVolume: {
    amount: 0,
    growth: '+0',
    period: 'Last 30 days'
  },
  pendingDeposits: {
    amount: 0,
    count: 0,
    status: 'Currently held'
  },
  releasedDeposits: {
    amount: 0,
    growth: '+0',
    period: 'This month'
  },
  refundsIssued: {
    amount: 0,
    growth: '+0',
    period: 'This month'
  },
  platformFees: {
    amount: 0,
    growth: '+0',
    period: 'Collected this month'
  }
});
