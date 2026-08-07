import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';

// 🧱 Listing interface
interface Listing {
  id: string;
  title?: string;
  name: string;
  category: any;
  brand: string;
  price?: number;
  rentalPrice?: number;
  status: string;
  views?: number;
  bookings?: number;
  lastRented?: string | null;
  image?: string;
  images?: string[];
  cover_image?: string;
  blocked_dates?: any[];
  bookedDates?: string[];
}

// 📄 Pagination interface
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
}

// 📦 Zustand store interface
interface ListingsState {
  listings: Record<string, Listing>;
  loading: boolean;
  pagination?: Pagination;
  lenderStatus?: string;
  statusSummary: Record<string, number>;
  fetchListings: (filters?: {
    status?: string;
    category?: string;
    brand?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => Promise<void>;
  getListingById: (id: string) => Listing | undefined;
  setListing: (listing: Listing) => void;
  updateListingStatus: (id: string, status: string) => Promise<any>;
  setLenderStatus: (status: string) => void;
}

// 🧠 Zustand Store (Persisted)
export const useListingsStore = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: {},
      loading: true,
      pagination: undefined,
      statusSummary: {},

      // ✅ Fetch listings (supports filters & pagination)
      fetchListings: async (filters = {}) => {
        try {
          set({ loading: true });

          // 🧮 Build query params
          const params = new URLSearchParams();
          if (filters.status && filters.status !== 'all') params.append('status', filters.status);
          if (filters.category && filters.category !== 'all') params.append('category', filters.category);
          if (filters.brand && filters.brand !== 'all') params.append('brand', filters.brand);
          if (filters.search?.trim()) params.append('search', filters.search);
          if (filters.page) params.append('page', String(filters.page));
          if (filters.limit) params.append('limit', String(filters.limit));
          if (filters.sort) params.append('sort', filters.sort);

          const query = params.toString();
          const url = query ? `${API_ENDPOINTS.Products}?${query}` : API_ENDPOINTS.Products;
          const res = await axiosClient.get(url);

          const products: Listing[] = res.data?.data?.products || [];
          const pagination: Pagination | undefined = res.data?.data?.pagination;
          const lenderStatus: string | undefined = res.data?.data?.lender_status;
          const statusSummary: Record<string, number> = res.data?.data?.status_summary || {};

          // 🗺️ Convert to ID-based map
          const listingsMap: Record<string, Listing> = {};
          products.forEach((p) => (listingsMap[p.id] = p));

          // 🧩 Update store
          set({
            listings: listingsMap,
            pagination,
            lenderStatus,
            statusSummary,
          });
        } catch (err) {
          console.error('❌ Failed to fetch listings:', err);
        } finally {
          set({ loading: false });
        }
      },

      // 🔍 Get a single listing by ID
      getListingById: (id) => get().listings[id],

      // ✏️ Update or add a listing
      setListing: (listing) => {
        set((state) => ({
          listings: { ...state.listings, [listing.id]: listing },
        }));
      },

      updateListingStatus: async (id, status) => {
        try {
          const response = await axiosClient.post(`${API_ENDPOINTS.UpdateListing}/${id}/status`, {
            status,
          });
          set((state) => {
            const existing = state.listings[id];
            if (!existing) return state;
            return {
              listings: {
                ...state.listings,
                [id]: { ...existing, status },
              },
            };
          });
          return response?.data;
        } catch (error) {
          console.error('Failed to update listing status', error);
          throw error;
        }
      },

      setLenderStatus: (status) => set({ lenderStatus: status }),
    }),
    {
      name: 'listing-storage', // localStorage key
      partialize: (state) => ({
        listings: state.listings,
        pagination: state.pagination,
      }),
    }
  )
);
