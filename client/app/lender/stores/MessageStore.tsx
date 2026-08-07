'use client';

import { create } from 'zustand';
import { messagesApiService } from '../../(site)/services/api/messages';

interface MessageStore {
  unreadCount: number;
  isLoading: boolean;
  fetchUnreadCount: () => Promise<void>;
  updateUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  unreadCount: 0,
  isLoading: false,
  fetchUnreadCount: async () => {
    set({ isLoading: true });
    try {
      const response = await messagesApiService.getLenderChats(1);
      if (response.success && response.data) {
        set({ unreadCount: response.data.totalUnreadCount, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      set({ isLoading: false });
    }
  },
  updateUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
