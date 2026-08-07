import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

export interface Promo {
    id: string;
    code: string;
    discount: string;
    discount_value: number;
    discount_type: "Percentage" | "Fixed";
    appliesTo: string;
    used: number;
    limit: number;
    expiry: string;
    rawExpiryDate: string;
    status: "Active" | "Expired" | "Disabled";
    _id: string; // Backend ID
}

export interface PromoFilters {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
}

interface StatusCounts {
    all: number;
    active: number;
    expired: number;
    disabled: number;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
}

export interface UsageHistory {
    date: string;
    users: number;
    discount: number;
}

export interface PromoPerformance {
    promoId: string;
    createdDate: string;
    lastUsed: string;
    totalDiscountApplied: number;
    usageHistory: UsageHistory[];
    usageProgress?: number;
}

interface PromoStore {
    promoCodes: Promo[];
    statusCounts: StatusCounts | null;
    pagination: Pagination | null;
    filters: PromoFilters;
    isLoading: boolean;
    isPerformanceLoading: boolean;
    isSaving: boolean;
    error: string | null;
    selectedPromoPerformance: PromoPerformance | null;
    fetchPromoCodes: () => Promise<void>;
    fetchPromoCodePerformance: (id: string) => Promise<void>;
    setFilters: (filters: Partial<PromoFilters>) => void;
    addPromoCode: (promoData: any) => Promise<boolean>;
    updatePromoCode: (id: string, promoData: any) => Promise<boolean>;
    deletePromoCode: (id: string) => Promise<boolean>;
}

const formatDiscount = (type: string, value: number) => {
    return type === 'Percentage' ? `${value}% off platform fee` : `Rs.${value} off platform fee`;
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const usePromoStore = create<PromoStore>((set, get) => ({
    promoCodes: [],
    statusCounts: null,
    pagination: null,
    filters: {
        search: '',
        status: 'All Status',
        type: 'All Types',
        page: 1,
    },
    isLoading: true,
    isPerformanceLoading: false,
    loading: true,
    isSaving: false,
    error: null,
    selectedPromoPerformance: null,

    fetchPromoCodes: async () => {
        set({ isLoading: true, error: null });
        try {
            const { filters } = get();
            const params = new URLSearchParams();

            if (filters.search) params.append('search', filters.search);
            if (filters.status && filters.status !== 'All Status') params.append('status', filters.status);
            if (filters.type && filters.type !== 'All Types') params.append('type', filters.type);
            if (filters.page) params.append('page', filters.page.toString());

            const response = await axiosClient.get(`${API_ENDPOINTS.PROMO_CODES}?${params.toString()}`);

            if (response.data.success) {
                const mappedPromos = response.data.data.promoCodes.map((p: any) => ({
                    id: p.promo_code_slug_id || p._id.slice(-6).toUpperCase(),
                    _id: p._id,
                    code: p.code,
                    discount: formatDiscount(p.discount_type, p.discount_value),
                    discount_value: p.discount_value,
                    discount_type: p.discount_type === 'Percentage' ? 'Percentage' : 'Fixed',
                    appliesTo: p.applies_to || "Platform fee only",
                    used: p.used_count || 0,
                    limit: p.usage_limit || 999999,
                    expiry: formatDate(p.expiry_date),
                    rawExpiryDate: p.expiry_date ? p.expiry_date.split('T')[0] : '',
                    status: p.status,
                }));
                set({
                    promoCodes: mappedPromos,
                    statusCounts: response.data.data.statusCounts,
                    pagination: response.data.data.pagination,
                });
            } else {
                set({ error: response.data.message || 'Failed to fetch promo codes' });
            }
        } catch (error: any) {
            console.error('Error fetching promo codes:', error);
            set({ error: error.response?.data?.message || error.message || 'Error occurred while fetching promo codes' });
        } finally {
            set({ isLoading: false });
        }
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 }
        }));
        get().fetchPromoCodes();
    },

    fetchPromoCodePerformance: async (id) => {
        set({ isPerformanceLoading: true, selectedPromoPerformance: null, error: null });
        try {
            const response = await axiosClient.get(`${API_ENDPOINTS.PROMO_CODES}/${id}`);
            if (response.data.success) {
                const data = response.data.data;
                const perf = data.performance;
                const performance: PromoPerformance = {
                    promoId: data._id,
                    createdDate: perf?.createdDate || formatDate(data.created_at),
                    lastUsed: perf?.lastUsed || formatDate(data.updated_at),
                    totalDiscountApplied: perf?.totalDiscountApplied || 0,
                    usageHistory: perf?.usageHistory || [],
                    usageProgress: perf?.usageProgress,
                };
                set({ selectedPromoPerformance: performance });
            } else {
                set({ error: response.data.message || 'Failed to fetch promo code performance' });
            }
        } catch (error: any) {
            console.error('Error fetching promo code performance:', error);
            set({ error: error.response?.data?.message || error.message || 'Error occurred while fetching promo code performance' });
        } finally {
            set({ isPerformanceLoading: false });
        }
    },

    addPromoCode: async (promoData) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.post(API_ENDPOINTS.PROMO_CODES, promoData);
            if (response.data.success) {
                await get().fetchPromoCodes();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to add promo code' });
                return false;
            }
        } catch (error: any) {
            console.error('Error adding promo code:', error);
            set({ error: error.response?.data?.message || error.message || 'Error occurred while adding promo code' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    updatePromoCode: async (id, promoData) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.post(`${API_ENDPOINTS.PROMO_CODES}/${id}`, promoData);
            if (response.data.success) {
                await get().fetchPromoCodes();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to update promo code' });
                return false;
            }
        } catch (error: any) {
            console.error('Error updating promo code:', error);
            set({ error: error.response?.data?.message || error.message || 'Error occurred while updating promo code' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    deletePromoCode: async (id) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.delete(`${API_ENDPOINTS.PROMO_CODES}/${id}`);
            if (response.data.success) {
                await get().fetchPromoCodes();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to delete promo code' });
                return false;
            }
        } catch (error: any) {
            console.error('Error deleting promo code:', error);
            set({ error: error.response?.data?.message || error.message || 'Error occurred while deleting promo code' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },
}));

export default usePromoStore;
