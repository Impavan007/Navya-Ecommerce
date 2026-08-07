// stores/reviewStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';

interface Review {
  id: string;
  review_slug_id?: string;
  productId: string;
  borrowerName: string;
  borrowerAvatar: string;
  orderId: string;
  itemName: string;
  itemImage: string;
  rating: number;
  reviewText: string;
  status: string;
  datePosted: string;
}

interface ReviewStore {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetchReviews: (params?: {
    search?: string;
    rating?: string;
    period?: string;
    itemId?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  setPage: (page: number) => void;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: [],
      total: 0,
      page: 1,
      totalPages: 1,
      loading: false,
      error: null,
      
      fetchReviews: async (params = {}) => {
        set({ loading: true, error: null });

        try {
          let endpoint = API_ENDPOINTS.Review;
          const queryParams = new URLSearchParams();

          // Add pagination parameters
          const page = params.page || get().page || 1;
          const limit = params.limit || 10;
          
          queryParams.append('page', page.toString());
          queryParams.append('limit', limit.toString());

          // Add filter parameters if provided
          if (params.rating && params.rating !== 'all') {
            queryParams.append('rating', params.rating);
          }
          if (params.search && params.search.trim() !== '') {
            queryParams.append('search', params.search);
          }
          if (params.period && params.period !== 'all') {
            queryParams.append('period', params.period);
          }
          if (params.itemId && params.itemId !== 'all') {
            queryParams.append('itemId', params.itemId);
          }

          endpoint += `?${queryParams.toString()}`;

          const { data } = await axiosClient.get(endpoint);

          set({
            reviews: data.data.reviews || [],
            total: data.data.total || 0,
            page: data.data.page || page,
            totalPages: data.data.totalPages || 1,
            loading: false,
            error: null
          });
        } catch (err: any) {
          set({ 
            error: err.response?.data?.message || err.message || 'Failed to fetch reviews', 
            loading: false 
          });
        }
      },

      setPage: (page: number) => {
        set({ page });
        // Automatically fetch reviews when page changes
        const currentState = get();
        currentState.fetchReviews({
          page: page,
          limit: 10,
          search: currentState.reviews.length > 0 ? undefined : '', // Only pass search if we have existing filters
          rating: currentState.reviews.length > 0 ? undefined : 'all'
        });
      }
    }),
    {
      name: 'review-store',
      partialize: (state) => ({
        reviews: state.reviews,
        total: state.total,
        page: state.page,
        totalPages: state.totalPages
      })
    }
  )
);