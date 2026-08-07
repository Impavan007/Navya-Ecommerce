'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

export interface Review {
  id: string;
  reviewId: string;
  orderId: string;
  reviewer: {
    name: string;
    avatar: string;
    id: string;
    type: 'borrower' | 'lender';
  };
  recipient: {
    name: string;
    avatar: string;
    id: string;
    type: 'borrower' | 'lender';
  };
  rating: number;
  reviewText: string;
  status: 'pending' | 'approved' | 'flagged' | 'removed';
  datePosted: string;
  itemName?: string;
  itemImage?: string;
  auditTrail?: Array<{
    action: string;
    user: string;
    timestamp: string;
    notes?: string;
  }>;
  adminNotes?: string;
  flagReason?: string;
}

interface ReviewsPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface ReviewStatusCounts {
  all: number;
  pending: number;
  approved: number;
  flagged: number;
  removed: number;
}

interface ReviewStore {
  reviews: Review[];
  loading: boolean;
  pagination: ReviewsPagination;
  statusCounts: ReviewStatusCounts;
  fetchReviews: (filters?: {
    status?: string;
    rating?: number;
    period?: string;
    searchQuery?: string;
    reviewerType?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  updateReviewStatus: (id: string, status: 'approved' | 'removed', reason?: string) => Promise<void>;
  bulkUpdateReviews: (payload: { reviewIds: string[]; action: 'Approve' | 'Reject'; reason?: string }) => Promise<void>;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  loading: true,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  },
  statusCounts: {
    all: 0,
    pending: 0,
    approved: 0,
    flagged: 0,
    removed: 0,
  },

  // Fetch reviews
  fetchReviews: async (filters = {}) => {
    set({ loading: true });
    try {
      const params: any = {};
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.rating) params.rating = filters.rating;
      if (filters.period) params.period = filters.period;
      if (filters.reviewerType) params.reviewerType = filters.reviewerType;
      if (filters.searchQuery) params.search = filters.searchQuery;
      if (typeof filters.page === 'number') params.page = filters.page;
      if (typeof filters.limit === 'number') params.limit = filters.limit;

      const response = await axiosClient.get(API_ENDPOINTS.Reviews, { params });
      const apiReviews: any[] = response.data.data.reviews || [];
      const paginationResponse = response.data?.data?.pagination || {};

      const mappedReviews: Review[] = apiReviews.map((r) => ({
        id: r.id,
        reviewId: r.review_slug_id,
        orderId: r.orderId,
        reviewer: {
          id: r.reviewer.id,
          name: r.reviewer.name,
          avatar: r.reviewer.avatar,
          type: r.reviewer.type,
        },
        recipient: {
          id: r.recipient.id,
          name: r.recipient.name,
          avatar: r.recipient.avatar,
          type: r.recipient.type,
        },
        rating: r.rating,
        reviewText: r.reviewText,
        status: r.status.toLowerCase() as 'pending' | 'approved' | 'flagged' | 'removed',
        datePosted: r.datePosted,
        itemName: r.itemName,
        itemImage: r.itemImage,
        auditTrail: r.auditTrail || [],
        adminNotes: r.adminNotes,
        flagReason: r.flagReason,
      }));

      const statusCountsResponse = response.data?.data?.statusCounts || {};

      set({
        reviews: mappedReviews,
        pagination: {
          currentPage: paginationResponse.currentPage || paginationResponse.page || params.page || 1,
          totalPages: paginationResponse.totalPages || paginationResponse.pages || 1,
          totalItems: paginationResponse.totalItems || paginationResponse.total || mappedReviews.length,
          limit: paginationResponse.limit || params.limit || mappedReviews.length || 1,
        },
        statusCounts: {
          all: statusCountsResponse.all || 0,
          pending: statusCountsResponse.pending || 0,
          approved: statusCountsResponse.approved || 0,
          flagged: statusCountsResponse.flagged || 0,
          removed: statusCountsResponse.rejected || statusCountsResponse.removed || 0,
        },
      });
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      set({
        reviews: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: filters.limit || 10,
        },
      });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update review status by ID
  updateReviewStatus: async (id: string, status: 'approved' | 'removed', reason?: string) => {
    try {
      set({ loading: true });
      await axiosClient.post(`${API_ENDPOINTS.Reviews}/${id}`, {
        status,
        ...(reason && { reason })
      });

      const updated = get().reviews.map((review) =>
        review.id === id ? { ...review, status } : review
      );
      set({ reviews: updated });
      window.location.reload();
    } catch (error) {
      console.error(`Failed to update review ${id} status`, error);
    } finally {
      set({ loading: false });
    }
  }
  ,
  // ✅ Bulk update reviews (Approve/Reject)
  bulkUpdateReviews: async ({ reviewIds, action, reason }) => {
    try {
      set({ loading: true });
      await axiosClient.post(API_ENDPOINTS.Reviews_Bulk_Action, {
        reviewIds,
        action,
        ...(action === 'Reject' && reason ? { reason } : {}),
      });

      // Update local statuses
      const toStatus = action === 'Approve' ? 'approved' : 'removed';
      const updated = get().reviews.map((r) =>
        reviewIds.includes(r.id) ? { ...r, status: toStatus as 'approved' | 'removed' } : r
      );
      set({ reviews: updated });
    } catch (error) {
      console.error('Failed to bulk update reviews', error);
    } finally {
      set({ loading: false });
    }
  },
}));
