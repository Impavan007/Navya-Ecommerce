'use client';

import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';
import { syncAuthUserProfile } from '@/shared/utils/syncAuthUserProfile';

export interface LenderAddress {
  label: string;
  street_name: string;
  house_number: string;
  house_number_suffix?: string;
  postal_code: string;
  city: string;
  _id?: string;
}

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  addresses: LenderAddress[];
  profileImage: string | File;
  bio: string;
}

interface ProfileState {
  profile: ProfileData;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  // Stripe onboarding
  stripeOnboardingLoading: boolean;
  createStripeAccountLink: () => Promise<string | null>;
  // Stripe account details
  stripeAccount: StripeAccountDetails | null;
  stripeAccountLoading: boolean;
  fetchStripeAccountDetails: () => Promise<void>;
}

export interface StripeAccountDetails {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsPending: string[];
  requirementsDue: string[];
  requirementsErrors: string[];
}

const defaultProfile: ProfileData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  addresses: [],
  profileImage: '/api/placeholder/150/150',
  bio: '',
};

const useProfileStore = create<ProfileState>((set) => ({
  profile: defaultProfile,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.get(API_ENDPOINTS.PROFILE);
      const apiData = res.data.data;

      const mappedProfile: ProfileData = {
        fullName: apiData.name || '',
        email: apiData.email || '',
        phone: apiData.phone || '',
        address: apiData.address || '',
        addresses: Array.isArray(apiData.addresses) ? apiData.addresses : [],
        profileImage: apiData.profile_image || '/api/placeholder/150/150',
        bio: apiData.bio || '',
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
      if (data.bio !== undefined) formData.append('bio', data.bio);
      if (data.addresses !== undefined) formData.append('addresses', JSON.stringify(data.addresses));

      // Handle profile image
      if (data.profileImage && typeof data.profileImage !== 'string') {
        formData.append('profileImage', data.profileImage as any); // File object
      }

      const res = await axiosClient.post(API_ENDPOINTS.PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const apiData = res.data.data;

      const updatedProfile: ProfileData = {
        fullName: apiData.name || '',
        email: apiData.email || '',
        phone: apiData.phone || '',
        address: apiData.address || '',
        addresses: Array.isArray(apiData.addresses) ? apiData.addresses : [],
        profileImage: apiData.profile_image || '/api/placeholder/150/150',
        bio: apiData.bio || '',
      };

      set({ profile: updatedProfile, loading: false });
      syncAuthUserProfile({
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone,
        avatar: typeof updatedProfile.profileImage === 'string' ? updatedProfile.profileImage : undefined,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update profile', loading: false });
      throw err;
    }
  },
  // Stripe onboarding: request an account link from backend and return the url
  stripeOnboardingLoading: false,
  createStripeAccountLink: async () => {
    set({ stripeOnboardingLoading: true, error: null });
    try {
      // endpoint expected: /lender/stripe/account-link
      const res = await axiosClient.post('/lender/stripe/account-link');
      const url = res?.data?.data?.url || null;
      return url;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to create Stripe account link' });
      return null;
    } finally {
      set({ stripeOnboardingLoading: false });
    }
  },

  // Stripe account details
  stripeAccount: null,
  stripeAccountLoading: false,
  fetchStripeAccountDetails: async () => {
    set({ stripeAccountLoading: true, error: null });
    try {
      const res = await axiosClient.get('/lender/stripe/account-details');
      const d = res?.data?.data || null;
      if (d) {
        const mapped: StripeAccountDetails = {
          accountId: d.accountId || d.account_id || '',
          chargesEnabled: !!d.chargesEnabled,
          payoutsEnabled: !!d.payoutsEnabled,
          detailsSubmitted: !!d.detailsSubmitted,
          requirementsPending: Array.isArray(d.requirementsPending) ? d.requirementsPending : [],
          requirementsDue: Array.isArray(d.requirementsDue) ? d.requirementsDue : [],
          requirementsErrors: Array.isArray(d.requirementsErrors) ? d.requirementsErrors : [],
        };
        set({ stripeAccount: mapped, stripeAccountLoading: false });
      } else {
        set({ stripeAccount: null, stripeAccountLoading: false });
      }
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch stripe account details', stripeAccountLoading: false });
    }
  },
}));

export default useProfileStore;
