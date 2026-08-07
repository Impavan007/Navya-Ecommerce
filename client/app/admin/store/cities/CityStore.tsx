import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

export interface City {
    id: string;
    _id: string; // From backend
    name: string;
    state: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

interface CityStore {
    cities: City[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    } | null;
    stats: {
        totalCities: number;
        activeCities: number;
        inactiveCities: number;
    } | null;

    fetchCities: (params?: { search?: string; status?: string; page?: number; limit?: number }) => Promise<void>;
    createCity: (data: { name: string; state: string; is_active: boolean }) => Promise<boolean>;
    updateCity: (id: string, data: { name: string; state: string; is_active: boolean }) => Promise<boolean>;
    deleteCity: (id: string) => Promise<boolean>;
}

const useCityStore = create<CityStore>((set, get) => ({
    cities: [],
    isLoading: false,
    isSaving: false,
    error: null,
    pagination: null,
    stats: null,

    fetchCities: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const { search, status, page = 1, limit = 10 } = params;
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (status && status !== 'All') queryParams.append('is_active', status === 'Active' ? 'true' : 'false');
            queryParams.append('page', page.toString());
            queryParams.append('limit', limit.toString());

            const response = await axiosClient.get(`${API_ENDPOINTS.CITIES}?${queryParams.toString()}`);
            if (response.data.success) {
                const fetchedData = response.data.data.cities || response.data.data || [];
                const mappedCities = fetchedData.map((c: any) => ({
                    ...c,
                    id: c._id || c.id
                }));

                const pagInfo = response.data.data.pagination || {
                    currentPage: page,
                    totalPages: Math.ceil((response.data.data.totalCount || mappedCities.length) / limit),
                    totalItems: response.data.data.totalCount || mappedCities.length
                };

                const stats = response.data.data.stats || {
                    totalCities: pagInfo.totalItems,
                    activeCities: mappedCities.filter((c: any) => c.is_active).length,
                    inactiveCities: mappedCities.filter((c: any) => !c.is_active).length
                };

                set({
                    cities: mappedCities,
                    pagination: pagInfo,
                    stats: stats
                });
            } else {
                set({ error: response.data.message || 'Failed to fetch cities' });
            }
        } catch (error: any) {
            console.error('Error fetching cities:', error);
            set({ error: error.response?.data?.message || 'Error occurred while fetching cities' });
        } finally {
            set({ isLoading: false });
        }
    },

    createCity: async (data) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.post(API_ENDPOINTS.CITIES, data);
            if (response.data.success) {
                return true;
            } else {
                set({ error: response.data.message || 'Failed to create city' });
                return false;
            }
        } catch (error: any) {
            console.error('Error creating city:', error);
            set({ error: error.response?.data?.message || 'Error occurred while creating city' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    updateCity: async (id, data) => {
        set({ isSaving: true, error: null });
        try {
            // User requested POST method for update
            const response = await axiosClient.post(`${API_ENDPOINTS.CITIES}/${id}`, data);
            if (response.data.success) {
                return true;
            } else {
                set({ error: response.data.message || 'Failed to update city' });
                return false;
            }
        } catch (error: any) {
            console.error('Error updating city:', error);
            set({ error: error.response?.data?.message || 'Error occurred while updating city' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    deleteCity: async (id) => {
        set({ isSaving: true, error: null });
        try {
            const response = await axiosClient.delete(`${API_ENDPOINTS.CITIES}/${id}`);
            if (response.data.success) {
                return true;
            } else {
                set({ error: response.data.message || 'Failed to delete city' });
                return false;
            }
        } catch (error: any) {
            console.error('Error deleting city:', error);
            set({ error: error.response?.data?.message || 'Error occurred while deleting city' });
            return false;
        } finally {
            set({ isSaving: false });
        }
    }
}));

export default useCityStore;
