"use client";

import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';

interface ChangePasswordState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  changePassword: (payload: { oldPassword: string; newPassword: string; confirmPassword: string }) => Promise<boolean>;
}

export const useChangePasswordStore = create<ChangePasswordState>((set) => ({
  loading: false,
  error: null,
  successMessage: null,

  changePassword: async ({ oldPassword, newPassword, confirmPassword }) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const body = {
        oldPassword,
        newPassword,
        confirmPassword,
      };

      const res = await axiosClient.post('/change-password', body);
      const data = res?.data;
      // assume API responds with success flag or message
      const success = data?.success ?? true;
      const message = data?.message || 'Password changed successfully';
      if (success) {
        set({ successMessage: message, loading: false });
        return true;
      } else {
        set({ error: message || 'Failed to change password', loading: false });
        return false;
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to change password';
      set({ error: msg, loading: false });
      return false;
    }
  },
}));

export default useChangePasswordStore;
