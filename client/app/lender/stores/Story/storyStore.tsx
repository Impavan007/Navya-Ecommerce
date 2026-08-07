// stores/useStoryStore.ts
'use client';

import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';
import toast from 'react-hot-toast';

interface StoryState {
  loading: boolean;
  stories: any[];
  error: string | null;
  createStory: (data: FormData) => Promise<any>; // Changed to return Promise<any>
  deleteStory: (id: string) => Promise<any>;
  fetchStories: () => Promise<any[] | void>;
}

export const useStoryStore = create<StoryState>((set) => ({
  loading: false,
  stories: [],
  error: null,

  createStory: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.post(
        `${API_ENDPOINTS.Story}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if(res.status === 201){
        set((state) => ({ stories: [...state.stories, res.data], loading: false }));
        return res;
      } else {
        return res;
      }
    } catch (err: any) {
      console.error('❌ Error creating story:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create story';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  fetchStories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.get('/lender/your-story');
      const data = res?.data?.data ?? res?.data ?? [];
      set({ stories: Array.isArray(data) ? data : [data], loading: false });
      return data;
    } catch (err: any) {
      console.error('❌ Error fetching stories:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch stories';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  deleteStory: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.delete(`/lender/story/${id}/delete`);
      return res;
    } catch (err: any) {
      console.error('Failed to delete story', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete story';
      set({ error: msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  }
}));