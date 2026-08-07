'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';
import toast from 'react-hot-toast';

interface Lender {
  name: string;
  email: string;
  avatar: string;
  id: string;
}

interface Listing {
  id: string;
  title: string;
  brand: string;
  lender: Lender;
  submitted: string;
  rentalPrice: number;
  status: string;
  category: string;
  images: string[];
  size?: string[];
  description?: string;
  is_featured?: boolean;
  coverageImage?: string;
  rejection_reason?: string;
}

interface ListingsState {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  statusCount: any;
  fetchListings: (filters?: {
    status?: string;
    category?: string;
    dateRange?: string;
    brand?: string;
    page?: number;
    search?: string;
  }) => Promise<void>;
  updateListing: (listingId: string, updatedData: Partial<Listing>) => Promise<void>;
  bulkUpdateListings: (payload: { productIds: string[]; action: 'approve' | 'reject' | 'feature' | 'unfeature'; reason?: string }) => Promise<void>;
}

// Helper: Capitalize first letter
const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Helper: Convert date range to API format
const convertDateRangeToPeriod = (dateRange: string): string => {
  switch (dateRange) {
    case 'today':
      return 'today';
    case 'this_week':
      return 'this_week';
    case 'this_month':
      return 'this_month';
    case 'last_month':
      return 'last_month';
    case 'All':
    default:
      return '';
  }
};

export const useListingsStore = create<ListingsState>((set, get) => ({
  listings: [],
  loading: true,
  error: null,
  totalPages: 1,
  currentPage: 1,
  statusCount: {},

  // ✅ Fetch Listings API
  fetchListings: async (filters = {}) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem('token');

      const params: Record<string, string | number> = {};

      // Handle all filters including dateRange conversion
      if (filters.status && filters.status !== 'All') {
        params.status = capitalizeFirstLetter(filters.status);
      }

      if (filters.category && filters.category !== 'All') {
        params.category = filters.category;
      }

      if (filters.dateRange && filters.dateRange !== 'All') {
        params.period = convertDateRangeToPeriod(filters.dateRange);
      }

      if (filters.brand && filters.brand !== 'All') {
        params.brand = capitalizeFirstLetter(filters.brand);
      }

      if (filters.search && filters.search.trim() !== '') {
        params.searched = filters.search.trim();
      }

      if (filters.page && filters.page > 0) {
        params.page = filters.page;
      }

      const response = await axiosClient.get(`${API_ENDPOINTS.Listings}`, {
        ...(Object.keys(params).length > 0 ? { params } : {}),
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const products = response.data?.data?.products || [];
      const statusCount = response.data?.data?.statusCounts || {};

      const mappedListings = products.map((item: any) => ({
        id: item._id || item.id,
        title: item.name || item.title,
        brand: item.brand,
        lender: {
          email: item.lender?.email || 'Unknown',
          name: item.lender?.name || 'Unknown',
          id: item.lender?.id || item.lender,
          avatar: item.lender?.avatar || 'https://via.placeholder.com/40',
        },
        size: item.size,
        submitted: item.created_at || item.submitted,
        description: item.description,
        rentalPrice: item.rental_price_per_day || item.rentalPrice,
        status: item.status.toLowerCase(),
        category: item.category,
        images: item.images?.length ? item.images : [item.cover_image],
        coverageImage: item.cover_image,
        is_featured: item.is_featured || false,
        rejection_reason: item.rejection_reason || '',
      }));

      const totalPages = response.data?.data?.totalPages || 1;
      const currentPage = filters.page || 1;

      set({
        listings: mappedListings,
        totalPages,
        currentPage,
        statusCount
      });
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      set({ error: err.message || 'Failed to fetch listings' });
      toast.error('Failed to fetch listings');
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update Listing API
  updateListing: async (listingId, updatedData) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem('token');

      // ✅ Ensure if is_featured is true, status becomes Active automatically
      const payload = {
        ...updatedData,
        ...(updatedData.is_featured ? { status: 'Active', is_featured: true } : {}),
      };

      const response = await axiosClient.post(
        `${API_ENDPOINTS.Listing}/${listingId}/update`,
        payload,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Listing updated successfully');
      }

      const updatedItem = response.data?.data?.updatedProduct;
      if (!updatedItem) throw new Error('Update failed');

      const currentListings = get().listings;

      const newListings = currentListings.map((listing) =>
        listing.id === listingId
          ? {
            ...listing,
            title: updatedItem.name,
            brand: updatedItem.brand,
            size: updatedItem.size,
            submitted: updatedItem.created_at,
            description: updatedItem.description,
            rentalPrice: updatedItem.rental_price_per_day,
            status: updatedItem.status.toLowerCase(),
            category: updatedItem.category,
            images: updatedItem.images?.length
              ? updatedItem.images
              : [updatedItem.cover_image],
            is_featured: updatedItem.is_featured || false,
            rejection_reason: updatedItem.rejection_reason || '',
          }
          : listing
      );

      set({ listings: newListings });

    } catch (err: any) {
      console.error('Error updating listing:', err);
      const errorMessage = err.message || 'Failed to update listing';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Bulk update listings
  bulkUpdateListings: async ({ productIds, action, reason }) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');

      const response = await axiosClient.post(
        API_ENDPOINTS.Listings_Bulk_Action,
        {
          productIds,
          action,
          ...(action === 'reject' && reason ? { reason } : {})
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      );

      if (response.status === 200) {
        toast.success(`Listings ${action}d successfully`);
      }

      // Update local state optimistically
      const toStatus = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : undefined;
      const isFeaturedChange = action === 'feature' || action === 'unfeature';

      const newListings = get().listings.map((listing) => {
        if (!productIds.includes(listing.id)) return listing;
        return {
          ...listing,
          ...(toStatus ? { status: toStatus } : {}),
          ...(isFeaturedChange ? { is_featured: action === 'feature' } : {}),
          ...(action === 'reject' && reason ? { rejection_reason: reason } : {}),
        };
      });

      set({ listings: newListings });
    } catch (err: any) {
      console.error('Error bulk updating listings:', err);
      const errorMessage = err.message || 'Failed to perform bulk action';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
}));