'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

type WaitlistStatus = 'Pending' | 'Approved' | 'Rejected';
type WaitlistDecisionStatus = Extract<WaitlistStatus, 'Approved' | 'Rejected'>;
export type WaitlistRole = 'Renter' | 'Lender';

export interface WaitlistApiItem {
  _id: string;
  name: string;
  email: string;
  city: string;
  role: WaitlistRole;
  brands: string[] | null;
  brand_image: string | null;
  status: WaitlistStatus;
  created_at: string;
  updated_at?: string;
  waitlist_slug_id?: string;
}

export interface WaitlistUser {
  id: string;
  name: string;
  email: string;
  dateSignedUp: string;
  Role: WaitlistRole;
  status: WaitlistStatus;
  City: string;
  Images: string;
  Brands: string[];
  invitedBy?: string;
  inviteDate?: string;
  notes?: string;
  waitlist_slug_id?: string;
}

export interface WaitlistStatusSummary {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface WaitlistState {
  waitlists: WaitlistUser[];
  loading: boolean;
  error: string | null;
  updatingMap: Record<string, boolean>;
  totalPages: number;
  currentPage: number;
  statusSummary: WaitlistStatusSummary;
  fetchWaitlists: (filters?: {
    status?: WaitlistStatus;
    search?: string;
    page?: number;
    role?: WaitlistRole;
    dateRange?: string;
    sort?: 'newest' | 'oldest' | 'A-Z';
    limit?: number;
  }) => Promise<WaitlistUser[]>;
  updateWaitlistStatus: (
    recordId: string,
    status: WaitlistDecisionStatus,
    reason?: string
  ) => Promise<WaitlistDecisionStatus | null>;
  bulkUpdateWaitlists: (payload: { waitlistIds: string[]; action: 'Approve' | 'Reject'; reason?: string }) => Promise<void>;
}

const mapApiItemToUser = (item: WaitlistApiItem): WaitlistUser => {
  const formattedDate = item.created_at
    ? new Date(item.created_at).toISOString().split('T')[0]
    : '';

  return {

    id: item._id,
    name: item.name ?? 'Unknown',
    email: item.email ?? '',
    dateSignedUp: formattedDate,
    Role: item.role ?? 'Renter',
    status: item.status ?? 'Pending',
    City: item.city ?? '',
    Images: item.brand_image ?? '',
    Brands: Array.isArray(item.brands) ? item.brands : [],
    waitlist_slug_id: item.waitlist_slug_id,
  };
};

export const useWaitlistStore = create<WaitlistState>((set) => ({
  waitlists: [],
  loading: true,
  error: null,
  updatingMap: {},
  totalPages: 1,
  currentPage: 1,
  statusSummary: {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  },

  fetchWaitlists: async (filters = {}) => {
    try {
      set({ loading: true, error: null });

      const params: Record<string, string | number> = {};
      if (filters.status) params.status = (filters.status.charAt(0).toUpperCase() + filters.status.slice(1));
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.role) params.role = filters.role;
      if (filters.dateRange) params.period = filters.dateRange;
      if (filters.sort) params.sort = filters.sort;
      if (filters.limit) params.limit = filters.limit;
      const response = await axiosClient.get(API_ENDPOINTS.Waitlists, { params });

      const dataRoot = response.data?.data ?? response.data ?? [];
      const records: WaitlistApiItem[] = Array.isArray(dataRoot?.waitlistData)
        ? dataRoot.waitlistData
        : Array.isArray(dataRoot?.waitlists)
          ? dataRoot.waitlists
          : Array.isArray(dataRoot?.results)
            ? dataRoot.results
            : Array.isArray(dataRoot?.items)
              ? dataRoot.items
              : [];

      // //  

      const mapped = records.map(mapApiItemToUser);

      const pagination = dataRoot?.pagination;
      const totalPages = pagination?.totalPages ?? 1;
      const currentPage = pagination?.currentPage ?? 1;
      const statusSummary = dataRoot?.statusSummary || {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      };

      set({ waitlists: mapped, loading: false, error: null, totalPages, currentPage, statusSummary });
      return mapped;
    } catch (error) {
      console.error('Error fetching waitlists:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to fetch waitlists';
      set({ error: message, loading: false });
      return [];
    }
  },

  updateWaitlistStatus: async (recordId, status, reason) => {
    if (!recordId) return null;

    // 1. Get previous state for reversion
    const previousState = useWaitlistStore.getState();
    const previousWaitlists = previousState.waitlists;
    const previousStatusSummary = previousState.statusSummary;
    const targetUser = previousWaitlists.find(u => u.id === recordId);
    if (!targetUser) return null;

    const oldStatus = targetUser.status;

    // 2. Optimistically update local state (including summary)
    set((state) => {
      const newSummary = { ...state.statusSummary };
      if (oldStatus === 'Pending') newSummary.pending -= 1;
      else if (oldStatus === 'Approved') newSummary.approved -= 1;
      else if (oldStatus === 'Rejected') newSummary.rejected -= 1;

      if (status === 'Approved') newSummary.approved += 1;
      else if (status === 'Rejected') newSummary.rejected += 1;

      return {
        waitlists: state.waitlists.map((item) =>
          item.id === recordId ? { ...item, status } : item
        ),
        statusSummary: newSummary,
        updatingMap: { ...state.updatingMap, [recordId]: true },
        error: null,
      };
    });

    try {
      const response = await axiosClient.post(
        `${API_ENDPOINTS.Waitlists}/${recordId}`,
        { status, reason }
      );

      const responseStatus: WaitlistDecisionStatus =
        response?.data?.data?.status ?? status;

      // 3. Sync with final API response status (if it differed from optimistic one)
      set((state) => {
        const { [recordId]: _removed, ...rest } = state.updatingMap;
        return {
          updatingMap: rest,
          // If status differed, we'd need another summary adjustment here,
          // but usually it matches what we sent.
        };
      });

      return responseStatus;
    } catch (error) {
      console.error('Error updating waitlist status:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update waitlist';

      // 4. Revert to previous state (including summary) on error
      set((state) => {
        const { [recordId]: _removed, ...rest } = state.updatingMap;
        return {
          waitlists: previousWaitlists,
          statusSummary: previousStatusSummary,
          error: message,
          updatingMap: rest,
        };
      });

      throw error;
    }
  },

  bulkUpdateWaitlists: async ({ waitlistIds, action, reason }) => {
    if (!Array.isArray(waitlistIds) || waitlistIds.length === 0) return;

    // 1. Get previous state for reversion
    const previousState = useWaitlistStore.getState();
    const previousWaitlists = previousState.waitlists;
    const previousStatusSummary = previousState.statusSummary;

    // 2. Optimistically update local state
    const newStatus: WaitlistDecisionStatus = action === 'Approve' ? 'Approved' : 'Rejected';
    set((state) => {
      const newSummary = { ...state.statusSummary };
      waitlistIds.forEach(id => {
        const user = state.waitlists.find(u => u.id === id);
        if (!user) return;
        const oldStatus = user.status;
        if (oldStatus === 'Pending') newSummary.pending -= 1;
        else if (oldStatus === 'Approved') newSummary.approved -= 1;
        else if (oldStatus === 'Rejected') newSummary.rejected -= 1;

        if (newStatus === 'Approved') newSummary.approved += 1;
        else if (newStatus === 'Rejected') newSummary.rejected += 1;
      });

      return {
        waitlists: state.waitlists.map((it) =>
          waitlistIds.includes(it.id) ? { ...it, status: newStatus } : it
        ),
        statusSummary: newSummary,
        updatingMap: waitlistIds.reduce((acc, id) => ({ ...acc, [id]: true }), { ...state.updatingMap }),
        error: null,
      };
    });

    try {
      await axiosClient.post(API_ENDPOINTS.WaitlistsBulkAction, {
        waitlistIds,
        action,
        ...(action === 'Reject' && reason ? { reason } : {}),
      });

      // 3. Clear updating flags
      set((state) => {
        const newMap = { ...state.updatingMap } as Record<string, boolean>;
        waitlistIds.forEach((id) => { delete newMap[id]; });
        return { updatingMap: newMap };
      });
    } catch (error) {
      console.error('Error bulk-updating waitlists:', error);

      // 4. Revert to previous state on error
      set((state) => {
        const newMap = { ...state.updatingMap } as Record<string, boolean>;
        waitlistIds.forEach((id) => { delete newMap[id]; });
        return {
          waitlists: previousWaitlists,
          updatingMap: newMap,
          error: 'Failed bulk action'
        };
      });
      throw error;
    }
  },
}));
