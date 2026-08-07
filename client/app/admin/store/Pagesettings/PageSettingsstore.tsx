'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';
import toast from 'react-hot-toast';

interface SocialLinks {
  facebook: string;
  instagram: string;
  linkedin?: string;
  twitter: string;
  tiktok: string;
}

interface MetaTitle {
  title: string;
  description: string;
  keyword: string;
}

interface PageSettings {
  _id?: string;
  title: string;
  description: string;
  website_url: string;
  email: string;
  notification_banner: string;
  social_links: SocialLinks;
  meta_title: MetaTitle;
  logo?: File | null;
  favicon?: File | null;
  platform_fee_percent?: number | string;
  platform_fee_renter_percent?: number | string;
  platform_fee_lender_percent?: number | string;
}

interface PageSettingsStore {
  settings: PageSettings;
  setSettings: (settings: Partial<PageSettings>) => void;
  fetchSettings: () => Promise<void>;
  updateSettings: () => Promise<void>;
}

const usePageSettingsStore = create<PageSettingsStore>((set, get) => ({
  settings: {
    title: '',
    description: '',
    website_url: '',
    email: '',
    notification_banner: '',
    social_links: { facebook: '', instagram: '', linkedin: '', twitter: '', tiktok: '' },
    meta_title: { title: '', description: '', keyword: '' },
    logo: null,
    favicon: null,
    platform_fee_percent: '',
    platform_fee_renter_percent: '',
    platform_fee_lender_percent: '',
  },

  setSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  fetchSettings: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.GetSetting);
      const data = res.data.data;
      set({
        settings: {
          ...data,
          social_links: {
            facebook: data.social_links?.facebook || '',
            instagram: data.social_links?.instagram || '',
            linkedin: data.social_links?.linkedin || '',
            twitter: data.social_links?.twitter || '',
            tiktok: data.social_links?.tiktok || '',
          },
          meta_title: {
            title: data.meta_title?.title || '',
            description: data.meta_title?.description || '',
            keyword: data.meta_title?.keyword || '',
          },
          logo: data.logo,
          favicon: data.favicon, // Correctly map favicon from data
          platform_fee_percent: data.platform_fee_percent || '',
          platform_fee_renter_percent: data.platform_fee_renter_percent || '',
          platform_fee_lender_percent: data.platform_fee_lender_percent || '',
        },
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  },

  updateSettings: async () => {
    try {
      const { settings } = get();
      const formData = new FormData();

      // Basic fields
      formData.append('title', settings.title || '');
      formData.append('description', settings.description || '');
      formData.append('website_url', settings.website_url || '');
      formData.append('email', settings.email || '');
      formData.append('notification_banner', settings.notification_banner || '');

      // Social links: append each platform individually
      formData.append('social_links_facebook', settings.social_links.facebook || '');
      formData.append('social_links_instagram', settings.social_links.instagram || '');
      formData.append('social_links_linkedin', settings.social_links.linkedin || '');
      formData.append('social_links_twitter', settings.social_links.twitter || '');
      formData.append('social_links_tiktok', settings.social_links.tiktok || '');

      // Meta title: append each field individually
      formData.append('meta_title_title', settings.meta_title.title || '');
      formData.append('meta_title_description', settings.meta_title.description || '');
      formData.append('meta_title_keyword', settings.meta_title.keyword || '');

      // Files - only append if a new file was selected
      if (settings.logo instanceof File) formData.append('logo', settings.logo);
      if (settings.favicon instanceof File) formData.append('favicon', settings.favicon);

      // Platform fees
      formData.append('platform_fee_percent', String(settings.platform_fee_percent || ''));
      formData.append('platform_fee_renter_percent', String(settings.platform_fee_renter_percent || ''));
      formData.append('platform_fee_lender_percent', String(settings.platform_fee_lender_percent || ''));

      // Send to API
      await axiosClient.post(API_ENDPOINTS.Settings, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });


    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },
}));

export default usePageSettingsStore;
