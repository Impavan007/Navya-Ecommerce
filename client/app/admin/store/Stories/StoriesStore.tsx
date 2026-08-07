'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';

export interface StoryLender {
  _id: string;
  name: string;
  email: string;
  profile_image: string;
  is_top_lender?: boolean;
}

export interface StoryItemProduct {
  _id: string;
  name: string;
  brand: string;
  rental_price_per_day: number;
  cover_image: string;
  category?: string;
}

export interface StoryItem {
  product: StoryItemProduct;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  lender: StoryLender;
  items: StoryItem[];
  status: 'Pending' | 'Active' | 'Rejected' | string;
  created_at: string;
  updated_at?: string;
  submitted?: string;
}

interface StoriesState {
  stories: Story[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  } | null;
  statusCounts: {
    all?: number;
    active?: number;
    pending?: number;
    rejected?: number;
    inactive?: number;
  } | null;
  fetchStories: (opts?: { status?: 'pending' | 'active' | 'rejected'; search?: string; page?: number; limit?: number; period?: 'today' | 'week' | 'month' | 'year' }) => Promise<void>;
  updateStoryStatus: (id: string, action: 'Approved' | 'Rejected') => Promise<void>;
}

const STORIES_ENDPOINT = '/admin/stories';

export const useStoriesStore = create<StoriesState>((set, get) => ({
  stories: [],
  loading: false,
  error: null,
  pagination: null,
  statusCounts: null,

  fetchStories: async (opts = {}) => {
    set({ loading: true, error: null });
    try {
      const params: any = {};
      if (opts.status) params.status = opts.status; // expecting lowercase in API
      if (opts.search) params.searched = opts.search;
      if (typeof opts.page === 'number') params.page = opts.page;
      if (typeof opts.limit === 'number') params.limit = opts.limit;
      if (opts.period) params.period = opts.period;

      const res = await axiosClient.get(STORIES_ENDPOINT, { params });
      // Accept various shapes; prefer res.data.data.stories
      const apiData = res.data?.data || res.data || {};
      const apiStories = apiData?.stories || apiData || [];

      const mapped: Story[] = (Array.isArray(apiStories) ? apiStories : []).map((s: any) => ({
        id: s._id || s.id,
        title: s.title,
        description: s.description || '',
        coverImage: s.cover_image,
        lender: s.lender,
        items: s.items || [],
        status: s.status || 'Pending',
        created_at: s.created_at,
        updated_at: s.updated_at,
        submitted: s.submitted,
      }));

      const pagination = apiData?.pagination
        ? {
          currentPage: apiData.pagination.currentPage ?? apiData.pagination.page ?? 1,
          totalPages: apiData.pagination.totalPages ?? apiData.pagination.last_page ?? 1,
          totalItems: apiData.pagination.totalItems ?? apiData.pagination.total ?? mapped.length,
          limit: apiData.pagination.limit ?? apiData.pagination.per_page ?? 10,
          hasNextPage: apiData.pagination.hasNextPage,
          hasPrevPage: apiData.pagination.hasPrevPage,
        }
        : null;

      const statusCounts = apiData?.statusCounts || null;

      set({ stories: mapped, pagination, statusCounts });
    } catch (err: any) {
      console.error('Failed to fetch stories', err);
      set({ stories: [], error: err?.message || 'Failed to fetch stories' });
    } finally {
      set({ loading: false });
    }
  },

  updateStoryStatus: async (id: string, action: 'Approved' | 'Rejected') => {
    try {
      set({ loading: true });
      await axiosClient.post(`${STORIES_ENDPOINT}/${id}/status-update`, { action });
      const newStatus = action === 'Approved' ? 'Active' : 'Rejected';
      const updated = get().stories.map((s) => (s.id === id ? { ...s, status: newStatus } : s));
      set({ stories: updated });
    } catch (err) {
      console.error(`Failed to update story ${id} status`, err);
    } finally {
      set({ loading: false });
    }
  },
}));
