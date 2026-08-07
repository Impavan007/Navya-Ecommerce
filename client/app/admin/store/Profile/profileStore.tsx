'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';
import { syncAuthUserProfile } from '@/shared/utils/syncAuthUserProfile';
import toast from 'react-hot-toast';

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string | File;
  bio?: string;
}

interface ProfileState {
  profile: ProfileData;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
}

const defaultProfile: ProfileData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  profileImage: '/api/placeholder/150/150',
  bio: '',
};

const useProfileStore = create<ProfileState>((set) => ({
  profile: defaultProfile,
  loading: true,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.get(API_ENDPOINTS.Profile);
      const apiData = res.data.data;

      const mappedProfile: ProfileData = {
        fullName: apiData.name || '',
        email: apiData.email || '',
        phone: apiData.phone || '',
        address: apiData.address || '',
        profileImage: apiData.profile_image || '/api/placeholder/150/150',
      };

      set({ profile: mappedProfile, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profile', loading: false });
    }
  },

  updateProfile: async (data: Partial<ProfileData>) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      if (data.fullName !== undefined) formData.append('name', data.fullName);
      if (data.phone !== undefined) formData.append('phone', data.phone);
      if (data.address !== undefined) formData.append('address', data.address);

      // Handle profile image
      if (data.profileImage && typeof data.profileImage !== 'string') {
        formData.append('profileImage', data.profileImage as any); // File object
      }

      const res = await axiosClient.post(API_ENDPOINTS.Profile, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const apiData = res.data.data;

      const updatedProfile: ProfileData = {
        fullName: apiData.name || '',
        email: apiData.email || '',
        phone: apiData.phone || '',
        address: apiData.address || '',
        profileImage: apiData.profile_image || '/api/placeholder/150/150',
      };

      set({ profile: updatedProfile, loading: false });
      syncAuthUserProfile({
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone,
        avatar: typeof updatedProfile.profileImage === 'string' ? updatedProfile.profileImage : undefined,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      set({ error: err.response?.data?.message || 'Failed to update profile', loading: false });
      throw err;
    }
  },
}));

export default useProfileStore;
