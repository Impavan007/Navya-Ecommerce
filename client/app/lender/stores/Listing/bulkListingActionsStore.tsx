'use client';

import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';

export type BulkStatusOption = 'Active' | 'Inactive';

interface BulkListingActionsState {
  selectedIds: string[];
  calendarDates: string[];
  calendarOpen: boolean;
  statusToSet: BulkStatusOption;
  actionLoading: boolean;

  // Actions
  setActionLoading: (value: boolean) => void;
  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string, selected: boolean) => void;
  clearSelection: () => void;
  openCalendar: () => void;
  closeCalendar: () => void;
  toggleCalendarDate: (date: string) => void;
  setCalendarDates: (dates: string[]) => void;
  setStatusToSet: (status: BulkStatusOption) => void;

  // New API actions
  performBulkAction: (
    action: 'delete' | 'clearBlockedDates' | 'addBlockDates' | 'updateStatus',
    extraPayload?: Record<string, any>,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => Promise<void>;

  handleApplyBlockedDates: (
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => Promise<void>;
}

export const useBulkListingActionsStore = create<BulkListingActionsState>((set, get) => ({
  selectedIds: [],
  calendarDates: [],
  calendarOpen: false,
  statusToSet: 'Active',
  actionLoading: false,

  setActionLoading: (value) => set({ actionLoading: value }),

  setSelection: (ids) => set({ selectedIds: Array.from(new Set(ids)) }),

  toggleSelection: (id, selected) =>
    set((state) => {
      if (selected) {
        if (state.selectedIds.includes(id)) return state;
        return { selectedIds: [...state.selectedIds, id] };
      }
      return { selectedIds: state.selectedIds.filter((existingId) => existingId !== id) };
    }),

  clearSelection: () => set({ selectedIds: [] }),

  openCalendar: () => set({ calendarOpen: true }),
  closeCalendar: () => set({ calendarOpen: false, calendarDates: [] }),

  toggleCalendarDate: (date) =>
    set((state) => ({
      calendarDates: state.calendarDates.includes(date)
        ? state.calendarDates.filter((d) => d !== date)
        : [...state.calendarDates, date],
    })),

  setCalendarDates: (dates) => set({ calendarDates: dates }),

  setStatusToSet: (status) => set({ statusToSet: status }),

  // New API methods
  performBulkAction: async (action, extraPayload = {}, onSuccess, onError) => {
    const { selectedIds, clearSelection, closeCalendar } = get();

    if (!selectedIds.length) {
      onError?.('Select at least one listing first.');
      return;
    }

    try {
      set({ actionLoading: true });

      const payload: Record<string, any> = {
        action,
        productIds: selectedIds,
        ...extraPayload,
      };

      await axiosClient.post(API_ENDPOINTS.BulkListingAction, payload);

      onSuccess?.();
      clearSelection();
      closeCalendar();
    } catch (error: any) {
      console.error('Bulk action failed', error);
      onError?.(error?.response?.data?.message || 'Failed to perform bulk action.');
    } finally {
      set({ actionLoading: false });
    }
  },

  handleApplyBlockedDates: async (onSuccess, onError) => {
    const { calendarDates, performBulkAction } = get();

    if (!calendarDates.length) {
      onError?.('Select at least one date to block.');
      return;
    }

    const formatDateForPayload = (date: string) => {
      const [year, month, day] = date.split('-');
      if (!year || !month || !day) return date;
      return `${day}-${month}-${year}`;
    };

    const blockedDates = calendarDates.map((date) => {
      const formatted = formatDateForPayload(date);
      return { start: formatted, end: formatted };
    });

    await performBulkAction('addBlockDates', { blockedDates }, onSuccess, onError);
  },
}));