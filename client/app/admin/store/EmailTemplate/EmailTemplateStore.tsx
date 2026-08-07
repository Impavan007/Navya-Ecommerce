import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

export interface EmailTemplate {
    _id: string;
    id?: string; // For UI compatibility if needed
    name: string;
    slug: string;
    trigger: string;
    status: "Active" | "Inactive";
    subject: string;
    body: string;
    lastUpdated: string;
    requiredMergeTags: string[];
    usedMergeTags: string[];
    currentVersion: number;
}

export interface MergeTag {
    key: string;
    label: string;
    sample: string;
}

export interface TemplateVersion {
    version: number;
    subject: string;
    body: string;
    note?: string;
    desc?: string; // For UI mapping
    name?: string; // For UI mapping
    date?: string; // For UI mapping
    current?: boolean; // For UI mapping
    created_at?: string;
}

interface EmailTemplateStore {
    templates: EmailTemplate[];
    selectedTemplate: EmailTemplate | null;
    mergeTags: MergeTag[];
    versions: TemplateVersion[];
    currentVersionNumber: number | null;
    isLoading: boolean;
    isVersionsLoading: boolean;
    isSaving: boolean;
    isSendingTestEmail: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    } | null;

    fetchTemplates: (params?: { search?: string; page?: number; limit?: number }) => Promise<void>;
    fetchTemplateById: (id: string) => Promise<void>;
    fetchMergeTags: () => Promise<void>;
    fetchVersions: (id: string) => Promise<void>;
    createTemplate: (data: any) => Promise<boolean>;
    updateTemplate: (id: string, data: any) => Promise<boolean>;
    previewTemplate: (id: string, data: any) => Promise<{ subject: string; body: string } | null>;
    sendTestEmail: (id: string, email: string, data: any) => Promise<boolean>;
    restoreVersion: (id: string, version: number) => Promise<boolean>;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const useEmailTemplateStore = create<EmailTemplateStore>((set, get) => ({
    templates: [],
    selectedTemplate: null,
    mergeTags: [],
    versions: [],
    currentVersionNumber: null,
    isLoading: false,
    isVersionsLoading: false,
    isSaving: false,
    isSendingTestEmail: false,
    error: null,
    pagination: null,

    fetchTemplates: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const { search, page = 1, limit = 10 } = params;
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            queryParams.append('page', page.toString());
            queryParams.append('limit', limit.toString());

            const response = await axiosClient.get(`${API_ENDPOINTS.EMAIL_TEMPLATES}?${queryParams.toString()}`);
            if (response.data.success) {
                const mappedTemplates = response.data.data.templates.map((t: any) => ({
                    ...t,
                    id: t._id,
                    lastUpdated: formatDate(t.updated_at || t.created_at)
                }));
                set({
                    templates: mappedTemplates,
                    pagination: response.data.data.pagination || {
                        currentPage: page,
                        totalPages: Math.ceil((response.data.data.totalCount || mappedTemplates.length) / limit),
                        totalItems: response.data.data.totalCount || mappedTemplates.length
                    }
                });
            } else {
                set({ error: response.data.message || 'Failed to fetch templates' });
            }
        } catch (error: any) {
            console.error('Error fetching templates:', error);
            set({ error: error.response?.data?.message || 'Error occurred while fetching templates' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTemplateById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosClient.get(`${API_ENDPOINTS.EMAIL_TEMPLATES}/${id}`);
            if (response.data.success) {
                const t = response.data.data.template;
                set({
                    selectedTemplate: {
                        ...t,
                        id: t._id,
                        lastUpdated: formatDate(t.updated_at || t.created_at)
                    }
                });
            } else {
                set({ error: response.data.message || 'Failed to fetch template details' });
            }
        } catch (error: any) {
            console.error('Error fetching template:', error);
            set({ error: error.response?.data?.message || 'Error occurred while fetching template details' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMergeTags: async () => {
        try {
            const response = await axiosClient.get(API_ENDPOINTS.MERGE_TAGS);
            if (response.data.success) {
                set({ mergeTags: response.data.data.tags });
            }
        } catch (error) {
            console.error('Error fetching merge tags:', error);
        }
    },

    fetchVersions: async (id) => {
        if (get().isVersionsLoading) return;
        set({ isVersionsLoading: true, error: null });
        try {
            const response = await axiosClient.get(`${API_ENDPOINTS.EMAIL_TEMPLATES}/${id}/versions`);
            if (response.data.success) {
                const currentVer = response.data.data.currentVersion;
                const mappedVersions = response.data.data.versions.map((v: any) => ({
                    ...v,
                    date: formatDate(v.created_at),
                    desc: v.note || "No description provided.",
                    current: v.version === currentVer,
                    name: "admin User", // Placeholder if not provided by API
                }));
                set({
                    versions: mappedVersions,
                    currentVersionNumber: currentVer
                });
            } else {
                set({ error: response.data.message || 'Failed to fetch versions' });
            }
        } catch (error: any) {
            console.error('Error fetching versions:', error);
            set({ error: error.response?.data?.message || 'Error occurred while fetching versions' });
        } finally {
            set({ isVersionsLoading: false });
        }
    },

    createTemplate: async (data) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.post(API_ENDPOINTS.EMAIL_TEMPLATES, data);
            if (response.data.success) {
                await get().fetchTemplates();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to create template' });
                return false;
            }
        } catch (error: any) {
            console.error('Error creating template:', error);
            set({ error: error.response?.data?.message || 'Error occurred while creating template' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    updateTemplate: async (id, data) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.post(`${API_ENDPOINTS.EMAIL_TEMPLATES}/${id}`, data);
            if (response.data.success) {
                await get().fetchTemplateById(id);
                await get().fetchTemplates();
                return true;
            } else {
                set({ error: response.data.message || 'Failed to update template' });
                return false;
            }
        } catch (error: any) {
            console.error('Error updating template:', error);
            set({ error: error.response?.data?.message || 'Error occurred while updating template' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    previewTemplate: async (id, data) => {
        try {
            const response = await axiosClient.post(`${API_ENDPOINTS.EMAIL_TEMPLATES}/${id}/preview`, { data });
            if (response.data.success) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Error previewing template:', error);
            return null;
        }
    },

    sendTestEmail: async (id, email, data) => {
        set({ isSendingTestEmail: true, error: null });
        try {
            const response = await axiosClient.post(`${API_ENDPOINTS.EMAIL_TEMPLATES}/${id}/test`, { email, data });
            return response.data.success;
        } catch (error: any) {
            console.error('Error sending test email:', error);
            set({ error: error.response?.data?.message || 'Error occurred while sending test email' });
            return false;
        } finally {
            set({ isSendingTestEmail: false });
        }
    },

    restoreVersion: async (id, version) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.post(`${API_ENDPOINTS.EMAIL_TEMPLATES}/${id}/versions/${version}/restore`);
            if (response.data.success) {
                await get().fetchTemplateById(id);
                await get().fetchVersions(id);
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Error restoring version:', error);
            set({ error: error.response?.data?.message || 'Error occurred while restoring version' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },
}));

export default useEmailTemplateStore;
