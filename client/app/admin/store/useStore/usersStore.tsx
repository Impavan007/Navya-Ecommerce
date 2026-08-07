'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  dateJoined: string;
  status: string;
  lastActive: string;
  bookings: number;
  listings: number;
  disputes: number;
  rating: number;
  notes: string[];
  is_top_lender?: boolean;
  avatar?: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  counts: {
    total: number;
    roleCounts: {
      Lender: number;
      Renter: number;
      Both: number;
    };
    statusCounts: {
      Active: number;
      Inactive: number;
      Suspended: number;
    };
  };
  fetchUsers: (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    dateJoined?: string; // today | week | month | quarter
  }) => Promise<any>;
  toggleTopLender: (userId: string) => Promise<any>;
  updateUserStatus: (userId: string, action: 'Activate' | 'Suspended', reason?: string) => Promise<any>;
  bulkUpdateUsers: (payload: { userIds: string[]; action: 'Activate' | 'Suspended' | 'MakeTopLender' | 'RemoveFromTopLender'; reason?: string }) => Promise<any>;
  fetchUserById: (userId: string) => Promise<any>;
}

export const useadminUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
  counts: {
    total: 0,
    roleCounts: {
      Lender: 0,
      Renter: 0,
      Both: 0,
    },
    statusCounts: {
      Active: 0,
      Inactive: 0,
      Suspended: 0,
    },
  },

  fetchUsers: async (params = {}) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem('token');
      const apiParams: any = { ...params };
      // Map dateJoined to period param if backend expects it
      if (params && (params as any).dateJoined) {
        apiParams.period = (params as any).dateJoined;
        delete apiParams.dateJoined;
      }
      const response = await axiosClient.get(API_ENDPOINTS.admin_Users, {
        params: apiParams,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const usersData = response.data?.data?.users || [];
      const paginationData = response.data?.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      };
      const countsData = response.data?.data?.counts || {
        total: paginationData.totalItems || 0,
        roleCounts: { Lender: 0, Renter: 0, Both: 0 },
        statusCounts: { Active: 0, Inactive: 0, Suspended: 0 },
      };

      set({
        users: usersData,
        pagination: paginationData,
        counts: countsData,
      });

      return usersData;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  toggleTopLender: async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.post(
        `${API_ENDPOINTS.Toggle}/${userId}`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (response.data.success) {
        // Update the user in the store
        const { users } = get();
        const updatedUsers = users.map(user =>
          user.id === userId
            ? { ...user, is_top_lender: response.data.data.is_top_lender }
            : user
        );

        set({ users: updatedUsers });
      }

      return response.data;
    } catch (error: any) {
      console.error('Error toggling top lender:', error);
      set({ error: error.message });
      throw error;
    }
  },

  updateUserStatus: async (userId: string, action: 'Activate' | 'Suspended', reason: string = 'No reason') => {
    try {
      const token = localStorage.getItem('token');

      const response = await axiosClient.post(
        `${API_ENDPOINTS.admin_User}/${userId}/update-status`,
        {
          action,
          reason,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (response.data.success) {
        // Update the user status in the store
        const { users } = get();
        const updatedUsers = users.map(user =>
          user.id === userId
            ? { ...user, status: response.data.data.newStatus }
            : user
        );

        set({ users: updatedUsers });
      }

      return response.data;
    } catch (error: any) {
      console.error('Error updating user status:', error);
      set({ error: error.message });
      throw error;
    }
  },

  bulkUpdateUsers: async ({ userIds, action, reason }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await axiosClient.post(
        API_ENDPOINTS.admin_Users_Bulk_Action,
        { userIds, action, reason },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );

      if (response.data?.success) {
        // Update local store statuses based on action
        const { users } = get();
        const newUsers = users.map(u => {
          if (!userIds.includes(u.id)) return u;
          if (action === 'Activate') return { ...u, status: 'Active' };
          if (action === 'Suspended') return { ...u, status: 'Suspended' };
          if (action === 'MakeTopLender') return { ...u, is_top_lender: true };
          if (action === 'RemoveFromTopLender') return { ...u, is_top_lender: false };
          return u;
        });
        set({ users: newUsers });
      }

      return response.data;
    } catch (error: any) {
      console.error('Error bulk updating users:', error);
      set({ error: error.message });
      throw error;
    }
  },

  fetchUserById: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      const response = await axiosClient.get(`${API_ENDPOINTS.admin_User}/${userId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.data.success) {
        const userData = response.data.data;
        // Optionally update the user in the local list if needed
        return userData;
      }
      throw new Error(response.data.message || 'Failed to fetch user details');
    } catch (error: any) {
      console.error('Error fetching user by ID:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useadminUsersStore;
