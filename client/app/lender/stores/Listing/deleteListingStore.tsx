import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';
import { toast } from 'react-hot-toast';
import { useListingsStore } from './FetchProducts';

interface DeleteState {
  isOpen: boolean;
  targetId?: string | null;
  targetTitle?: string | null;
  deleting: boolean;
  error?: string | null;
  open: (id: string, title?: string) => void;
  close: () => void;
  confirmDelete: () => Promise<void>;
}

export const useDeleteListingStore = create<DeleteState>((set, get) => ({
  isOpen: false,
  targetId: null,
  targetTitle: null,
  deleting: false,
  error: null,

  open: (id: string, title?: string) => set({ isOpen: true, targetId: id, targetTitle: title || null }),

  close: () => set({ isOpen: false, targetId: null, targetTitle: null, deleting: false, error: null }),

  confirmDelete: async () => {
    const id = get().targetId;
    if (!id) return;
    try {
      set({ deleting: true, error: null });

      // DELETE /lender/product/:id/delete
      const url = `${API_ENDPOINTS.UpdateListing}/${id}/delete`;
      await axiosClient.delete(url);

      toast.success('Listing deleted');

      // refresh listings from the main listings store
      const fetchListings = useListingsStore.getState().fetchListings;
      if (fetchListings) await fetchListings();

      // close modal
      set({ isOpen: false, targetId: null, targetTitle: null });
    } catch (err: any) {
      console.error('Failed to delete listing:', err);
      const message = err?.response?.data?.message || err.message || 'Failed to delete listing';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ deleting: false });
    }
  },
}));

export default useDeleteListingStore;
