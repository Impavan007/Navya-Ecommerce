import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

export interface FaqCategory {
    _id: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Faq {
    _id: string;
    question: string;
    answer: string;
    roles: string[];
    category: {
        _id: string;
        name: string;
    };
    status: string;
    created_at: string;
    updated_at: string;
    faq_slug_id: string;
}

export interface FaqFilters {
    role?: string;
    category?: string;
    status?: string;
    search?: string;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface FaqStore {
    categories: FaqCategory[];
    faqs: Faq[];
    filters: FaqFilters;
    pagination: Pagination | null;
    currentPage: number;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
    fetchFaqs: (page?: number) => Promise<void>;
    setCurrentPage: (page: number) => void;
    setFilters: (filters: Partial<FaqFilters>) => void;
    addFaq: (faq: Omit<Faq, '_id' | 'created_at' | 'updated_at' | 'faq_slug_id' | 'category'> & { category: string }) => Promise<boolean>;
    updateFaq: (id: string, faqData: Partial<Omit<Faq, '_id' | 'created_at' | 'updated_at' | 'faq_slug_id'>>) => Promise<boolean>;
    deleteFaq: (id: string) => Promise<boolean>;
    addCategory: (name: string) => Promise<boolean>;
}

const useFaqStore = create<FaqStore>((set, get) => ({
    categories: [],
    faqs: [],
    filters: {
        role: 'All roles',
        category: 'All categories',
        status: 'All status',
        search: ''
    },
    pagination: null,
    currentPage: 1,
    isLoading: true,
    isSaving: false,
    error: null,

    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosClient.get(API_ENDPOINTS.FAQ_Categories);
            if (response.data.success) {
                set({ categories: response.data.data });
            } else {
                set({ error: response.data.message || 'Failed to fetch categories' });
            }
        } catch (error: any) {
            console.error('Error fetching FAQ categories:', error);
            set({ error: error.message || 'Error occurred while fetching categories' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFaqs: async (page) => {
        set({ isLoading: true, error: null });
        try {
            const { filters, categories, currentPage } = get();
            const targetPage = page || currentPage;
            const params = new URLSearchParams();

            params.append('page', targetPage.toString());
            params.append('limit', '12');

            if (filters.role && filters.role !== 'All roles') {
                params.append('role', filters.role);
            }

            if (filters.category && filters.category !== 'All categories') {
                const categoryObj = categories.find(c => c.name === filters.category);
                if (categoryObj) {
                    params.append('category', categoryObj._id);
                }
            }

            if (filters.status && filters.status !== 'All status') {
                params.append('status', filters.status);
            }

            if (filters.search) {
                params.append('search', filters.search);
            }

            const queryString = params.toString();
            const url = queryString ? `${API_ENDPOINTS.FAQs}?${queryString}` : API_ENDPOINTS.FAQs;

            const response = await axiosClient.get(url);
            if (response.data.success) {
                const faqList = response.data.data?.faqs || [];
                const pagination = response.data.data?.pagination || null;
                set({
                    faqs: faqList,
                    pagination,
                    currentPage: targetPage
                });
            } else {
                set({ error: response.data.message || 'Failed to fetch FAQs' });
            }
        } catch (error: any) {
            console.error('Error fetching FAQs:', error);
            set({ error: error.message || 'Error occurred while fetching FAQs' });
        } finally {
            set({ isLoading: false });
        }
    },

    setCurrentPage: (page: number) => {
        set({ currentPage: page });
        get().fetchFaqs(page);
    },

    addFaq: async (faqData) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.post(API_ENDPOINTS.FAQs, faqData);
            if (response.data.success) {
                get().fetchFaqs();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to add FAQ' });
                return false;
            }
        } catch (error: any) {
            console.error('Error adding FAQ:', error);
            set({ error: error.message || 'Error occurred while adding FAQ' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },
    updateFaq: async (id, faqData) => {
        set({ isSaving: true, error: null });
        try {
            const url = `${API_ENDPOINTS.FAQs}/${id}`;
            const response = await axiosClient.post(url, faqData);
            if (response.data.success) {
                get().fetchFaqs();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to update FAQ' });
                return false;
            }
        } catch (error: any) {
            console.error('Error updating FAQ:', error);
            set({ error: error.message || 'Error occurred while updating FAQ' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },
    deleteFaq: async (id) => {
        set({ isSaving: true, error: null });
        try {
            const url = `${API_ENDPOINTS.FAQs}/${id}`;
            const response = await axiosClient.delete(url);
            if (response.data.success) {
                get().fetchFaqs();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to delete FAQ' });
                return false;
            }
        } catch (error: any) {
            console.error('Error deleting FAQ:', error);
            set({ error: error.message || 'Error occurred while deleting FAQ' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },
    addCategory: async (name) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.post(API_ENDPOINTS.FAQ_Categories, { name });
            if (response.data.success) {
                await get().fetchCategories();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to add category' });
                return false;
            }
        } catch (error: any) {
            console.error('Error adding category:', error);
            set({ error: error.message || 'Error occurred while adding category' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            currentPage: 1
        }));
        get().fetchFaqs(1);
    },
}));

export default useFaqStore;
