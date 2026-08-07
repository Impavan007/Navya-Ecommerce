'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';
import toast from 'react-hot-toast';

export interface HowItWorksStep {
    title: string;
    description: string;
    icon: string | File;
    order: number;
    _id?: string;
}

export interface HowItWorksData {
    _id?: string;
    section_title: string;
    primary_cta_label: string;
    primary_cta_link: string;
    headline: string;
    sub_headline: string;
    supporting_paragraph: string;
    hero_image: string | File;
    renter_steps: HowItWorksStep[];
    lender_steps: HowItWorksStep[];
}

interface HowItWorksStore {
    data: HowItWorksData;
    isLoading: boolean;
    isSaving: boolean;
    isAddingStep: boolean;
    versions: any[];
    isVersionsLoading: boolean;
    isDraftSaving: boolean;
    setIsAddingStep: (val: boolean) => void;
    setData: (data: Partial<HowItWorksData>) => void;
    fetchHowItWorks: () => Promise<void>;
    fetchVersions: () => Promise<void>;
    restoreVersion: (versionId: string) => Promise<void>;
    updateHowItWorks: () => Promise<void>;
    saveHowItWorksDraft: () => Promise<void>;
    addHowItWorksStep: (step: { title: string; description: string; order: number; icon: File | string }) => Promise<void>;
    deleteHowItWorksStep: (id: string) => Promise<void>;
}

const initialData: HowItWorksData = {
    section_title: "How Navyaa Works",
    primary_cta_label: "Start sourcing today",
    primary_cta_link: "/signup",
    headline: "Want it? Source it. Own it? Supply it.",
    sub_headline: "Access the premium textiles you need, directly from manufacturers",
    supporting_paragraph: "Navyaa connects B2B buyers who need high-quality textiles with global manufacturers. It's sustainable, scalable, and efficient.",
    hero_image: "https://api.navyaa.eu/uploads/howItWorks/1770708060238-168436552.jpg",
    renter_steps: [],
    lender_steps: []
};

const useHowItWorksStore = create<HowItWorksStore>((set, get) => ({
    data: initialData,
    isLoading: true,
    isSaving: false,
    isAddingStep: false,
    versions: [],
    isVersionsLoading: false,
    isDraftSaving: false,

    setIsAddingStep: (val) => set({ isAddingStep: val }),

    setData: (partial) =>
        set((state) => ({
            data: { ...state.data, ...partial },
        })),

    fetchHowItWorks: async () => {

        set({ isLoading: true });
        try {
            const res = await axiosClient.get(API_ENDPOINTS.HowItWorks);

            if (res.data?.data) {
                set({ data: res.data.data });
            }
        } catch (error) {
            console.error('Error fetching How It Works content:', error);
            // toast.error('Failed to load How It Works content');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchVersions: async () => {
        if (get().isVersionsLoading) return;
        set({ isVersionsLoading: true });
        try {
            const res = await axiosClient.get(API_ENDPOINTS.HowItWorks_Versions);
            if (res.data?.data?.versions) {
                set({ versions: res.data.data.versions });
            }
        } catch (error) {
            console.error('Error fetching version history:', error);
        } finally {
            set({ isVersionsLoading: false });
        }
    },

    restoreVersion: async (versionId: string) => {
        const previousData = get().data;
        const previousVersions = get().versions;

        // Optimistic update
        const selectedVersion = previousVersions.find(v => v._id === versionId);
        if (selectedVersion) {
            set({
                data: {
                    ...previousData,
                    ...selectedVersion,
                    _id: previousData._id // ensure we keep the same document ID
                },
                versions: previousVersions.map(v => ({
                    ...v,
                    is_current: v._id === versionId
                })),
                isSaving: true
            });
        } else {
            set({ isSaving: true });
        }

        try {
            const res = await axiosClient.post(`${API_ENDPOINTS.HowItWorks_Versions}/${versionId}/restore`);
            if (res.data?.success) {
                toast.success('Changes applied successfully!');
                // We keep the optimistic state, but maybe fetch latest to be sure of IDs etc.
                // However, user said "if sucees keep the state same". 
                // So we won't call fetchHowItWorks() again if not needed.
            } else {
                // Revert if success is false
                set({ data: previousData, versions: previousVersions });
                toast.error(res.data?.message || 'Failed to restore version');
            }
        } catch (error) {
            console.error('Error restoring version:', error);
            // Revert on error
            set({ data: previousData, versions: previousVersions });
            toast.error('Failed to restore version');
        } finally {
            set({ isSaving: false });
        }
    },

    updateHowItWorks: async () => {

        set({ isSaving: true });
        try {
            const { data } = get();

            const formData = new FormData();

            formData.append('section_title', data.section_title);
            formData.append('primary_cta_label', data.primary_cta_label);
            formData.append('primary_cta_link', data.primary_cta_link);
            formData.append('headline', data.headline);
            formData.append('sub_headline', data.sub_headline);
            formData.append('supporting_paragraph', data.supporting_paragraph);

            // Handle Hero Image
            if (data.hero_image instanceof File) {
                formData.append('hero_image', data.hero_image);
            } else if (typeof data.hero_image === 'string') {
                formData.append('hero_image', data.hero_image);
            }

            // Handle Renter Steps
            data.renter_steps?.forEach((step, index) => {
                formData.append(`renter_steps[${index}][title]`, step.title);
                formData.append(`renter_steps[${index}][description]`, step.description);
                formData.append(`renter_steps[${index}][order]`, step.order.toString());

                if (step.icon instanceof File) {
                    formData.append(`renter_steps[${index}][icon]`, step.icon);
                } else if (typeof step.icon === 'string') {
                    formData.append(`renter_steps[${index}][icon]`, step.icon);
                }

                if (step._id) {
                    formData.append(`renter_steps[${index}][_id]`, step._id);
                }
            });

            // Handle Lender Steps
            data.lender_steps?.forEach((step, index) => {
                formData.append(`lender_steps[${index}][title]`, step.title);
                formData.append(`lender_steps[${index}][description]`, step.description);
                formData.append(`lender_steps[${index}][order]`, step.order.toString());

                if (step.icon instanceof File) {
                    formData.append(`lender_steps[${index}][icon]`, step.icon);
                } else if (typeof step.icon === 'string') {
                    formData.append(`lender_steps[${index}][icon]`, step.icon);
                }

                if (step._id) {
                    formData.append(`lender_steps[${index}][_id]`, step._id);
                }
            });


            const res = await axiosClient.post(API_ENDPOINTS.HowItWorks, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Changes published successfully!');
        } catch (error) {
            console.error('Error updating How It Works content:', error);
            toast.error('Failed to publish changes');
            throw error;
        } finally {
            set({ isSaving: false });
        }
    },

    saveHowItWorksDraft: async () => {

        set({ isDraftSaving: true });
        try {
            const { data } = get();

            const formData = new FormData();

            formData.append('section_title', data.section_title);
            formData.append('primary_cta_label', data.primary_cta_label);
            formData.append('primary_cta_link', data.primary_cta_link);
            formData.append('headline', data.headline);
            formData.append('sub_headline', data.sub_headline);
            formData.append('supporting_paragraph', data.supporting_paragraph);

            // Handle Hero Image
            if (data.hero_image instanceof File) {
                formData.append('hero_image', data.hero_image);
            } else if (typeof data.hero_image === 'string') {
                formData.append('hero_image', data.hero_image);
            }

            // Handle Renter Steps
            data.renter_steps?.forEach((step, index) => {
                formData.append(`renter_steps[${index}][title]`, step.title);
                formData.append(`renter_steps[${index}][description]`, step.description);
                formData.append(`renter_steps[${index}][order]`, step.order.toString());

                if (step.icon instanceof File) {
                    formData.append(`renter_steps[${index}][icon]`, step.icon);
                } else if (typeof step.icon === 'string') {
                    formData.append(`renter_steps[${index}][icon]`, step.icon);
                }

                if (step._id) {
                    formData.append(`renter_steps[${index}][_id]`, step._id);
                }
            });

            // Handle Lender Steps
            data.lender_steps?.forEach((step, index) => {
                formData.append(`lender_steps[${index}][title]`, step.title);
                formData.append(`lender_steps[${index}][description]`, step.description);
                formData.append(`lender_steps[${index}][order]`, step.order.toString());

                if (step.icon instanceof File) {
                    formData.append(`lender_steps[${index}][icon]`, step.icon);
                } else if (typeof step.icon === 'string') {
                    formData.append(`lender_steps[${index}][icon]`, step.icon);
                }

                if (step._id) {
                    formData.append(`lender_steps[${index}][_id]`, step._id);
                }
            });


            const res = await axiosClient.post(API_ENDPOINTS.HowItWorks_Draft, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving How It Works draft:', error);
            toast.error('Failed to save draft');
            throw error;
        } finally {
            set({ isDraftSaving: false });
        }
    },
    addHowItWorksStep: async (step) => {

        set({ isSaving: true });
        try {
            const formData = new FormData();
            formData.append('title', step.title);
            formData.append('description', step.description);
            formData.append('order', step.order.toString());

            if (step.icon instanceof File) {
                formData.append('icon', step.icon);
            } else {
                formData.append('icon', step.icon);
            }


            const res = await axiosClient.post(API_ENDPOINTS.HowItWorks_Steps, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('New step added successfully!');
            set({ isAddingStep: false });
        } catch (error) {
            console.error('Error adding new step:', error);
            toast.error('Failed to add new step');
            throw error;
        } finally {
            set({ isSaving: false });
        }
    },
    deleteHowItWorksStep: async (id) => {

        // We don't necessarily need to set isSaving but it helps with disabling buttons if needed
        set({ isSaving: true });
        try {
            const res = await axiosClient.delete(`${API_ENDPOINTS.HowItWorks_Steps}/${id}`);

            toast.success('Step deleted successfully');
        } catch (error) {
            console.error('Error deleting step:', error);
            toast.error('Failed to delete step');
            throw error;
        } finally {
            set({ isSaving: false });
        }
    },
}));

export default useHowItWorksStore;
