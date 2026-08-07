import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  delivered: boolean;
  pushSent: boolean;
  emailSent: boolean;
  metadata: {
    currency?: string;
    role?: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    tags: string[];
    orderId?: {
      _id: string;
      order_number: string;
      status: string;
    };
    actionUrl?: string;
  };
  created_at: string;
  updated_at: string;
  __v?: number;
}

interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  // Actions
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  handleNewNotification: (notification: Notification) => void;
  handleNotificationRead: (notificationId: string) => void;
  handleAllNotificationsRead: () => void;
  handleNotificationStats: (data: any) => void;
  clearError: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalNotifications: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },

      fetchNotifications: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const url = `${API_ENDPOINTS.Notifications}?page=${page}&limit=${limit}`;
          const { data } = await axiosClient.get<NotificationResponse>(url);
          const responseData = (data as any).data || data;
          set({
            notifications: responseData.notifications,
            unreadCount: responseData.unreadCount ?? responseData.unread_count ?? (page === 1 ? responseData.notifications.filter((n: any) => !n.read).length : get().unreadCount),
            pagination: responseData.pagination,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Error fetching notifications:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch notifications',
            isLoading: false,
          });
        }
      },

      markAsRead: async (notificationId: string) => {
        try {

          const url = `${API_ENDPOINTS.Notifications}/${notificationId}/read`;
          await axiosClient.post(url);

          const { notifications, unreadCount } = get();
          const updated = notifications.map((n) =>
            n._id === notificationId ? { ...n, read: true } : n
          );

          set({
            notifications: updated,
            unreadCount: Math.max(0, unreadCount - 1),
          });
        } catch (error: any) {
          console.error('Error marking notification as read:', error);
        }
      },

      markAllAsRead: async () => {
        try {

          const url = `${API_ENDPOINTS.Notifications}/read-all`;
          await axiosClient.patch(url);

          const { notifications } = get();
          const updated = notifications.map((n) => ({ ...n, read: true }));

          set({
            notifications: updated,
            unreadCount: 0,
          });
        } catch (error: any) {
          console.error('Error marking all as read:', error);
        }
      },


      loadMoreNotifications: async () => {
        const { pagination, isLoading, notifications: existing } = get();
        if (isLoading || !pagination.hasNextPage) return;

        const nextPage = pagination.currentPage + 1;
        set({ isLoading: true, error: null });

        try {
          const url = `${API_ENDPOINTS.Notifications}?page=${nextPage}&limit=10`;
          const { data } = await axiosClient.get<NotificationResponse>(url);
          const responseData = (data as any).data || data;

          set({
            notifications: [...existing, ...responseData.notifications],
            unreadCount:
              existing.filter((n: any) => !n.read).length +
              responseData.notifications.filter((n: any) => !n.read).length,
            pagination: responseData.pagination,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Error loading more notifications:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to load notifications',
            isLoading: false,
          });
        }
      },

      handleNewNotification: (notification: Notification) => {
        
        const { notifications, unreadCount } = get();
        set({
          notifications: [notification, ...notifications],
          unreadCount: unreadCount + 1,
        });

        // Show toast
        import('react-hot-toast').then(({ toast }) => {
          toast.success(notification.title || "New notification received", {
            icon: '🔔',
          });
        });
      },

      handleNotificationRead: (notificationId: string) => {
        
        const { notifications, unreadCount } = get();
        const updated = notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        );
        set({
          notifications: updated,
          unreadCount: Math.max(0, unreadCount - 1),
        });
      },

      handleAllNotificationsRead: () => {
        
        const { notifications } = get();
        const updated = notifications.map((n) => ({ ...n, read: true }));
        set({
          notifications: updated,
          unreadCount: 0,
        });
      },

      handleNotificationStats: (data: any) => {
        
        const unread = data?.count ?? data?.unreadCount ?? data?.unread ?? (typeof data === 'number' ? data : 0);

        const newState: any = { unreadCount: unread };
        if (data?.notifications && Array.isArray(data.notifications)) {
          newState.notifications = data.notifications;
        }

        set(newState);
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalNotifications: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        pagination: state.pagination,
      }),
    }
  )
);