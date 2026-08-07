"use client";

import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';

type StoryState = {
  editStory: any | null;
  viewStory: any | null;
  setEditStory: (data: any | null) => void;
  setViewStory: (data: any | null) => void;
  clearStoryState: () => void;
  updateStory: (id: string, payload: any) => Promise<any>;
  updateLoading: boolean;
  updateError: string | null;
};

const useStoryManagementStore = create<StoryState>((set, get) => ({
  editStory: null,
  viewStory: null,
  setEditStory: (data) => set({ editStory: data }),
  setViewStory: (data) => set({ viewStory: data }),
  clearStoryState: () => set({ editStory: null, viewStory: null }),
  updateLoading: false,
  updateError: null,
  updateStory: async (id, payload) => {
    set({ updateLoading: true, updateError: null });
    try {
      // If payload is FormData (file upload), ensure multipart/form-data
      let res;
      if (payload instanceof FormData) {
        res = await axiosClient.post(`/lender/story/${id}/update`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axiosClient.post(`/lender/story/${id}/update`, payload);
      }
      set({ updateLoading: false });
      // return data so caller can update local UI
      return res?.data?.data ?? res?.data ?? res;
    } catch (err: any) {
      console.error('Failed to update story', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update story';
      set({ updateLoading: false, updateError: msg });
      throw err;
    }
  },
}));

export default useStoryManagementStore;
