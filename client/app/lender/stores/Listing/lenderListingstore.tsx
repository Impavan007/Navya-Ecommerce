'use client';

import { create } from 'zustand';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

// ===================== INTERFACES =====================

interface Photo {
  id?: string;
  url?: string;
  file?: File;
  isCover?: boolean;
  isNew?: boolean;
}

interface ListingFormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  size: string[];
  occasion: string;
  measurements: string;
  rentalPrice: string;
  cleaningPrice: string;
  deposit: string;
  photos: Photo[];
  blockedDates: string[];
  quantity: number;
  subcategory: string;
}

interface LenderState {
  formData: ListingFormData;
  currentStep: number;
  savedSteps: number[]; // 👈 Track saved steps
  showPreview: boolean;
  loading: boolean;

  setFormData: (data: Partial<ListingFormData>, replace?: boolean) => void;
  setCurrentStep: (step: number) => void;
  togglePreview: (state?: boolean) => void;
  saveDraft: (step: number, status?: string) => Promise<boolean>;
  submitListing: () => Promise<void>;
  updateListing: () => Promise<void>;
  deletePhoto: (photo: Photo) => Promise<void>;
  resetFormData: () => void;
}

// ===================== INITIAL DATA =====================

export const createInitialFormData = (): ListingFormData => ({
  id: undefined,
  title: '',
  description: '',
  category: '',
  brand: '',
  size: [],
  occasion: '',
  measurements: '',
  rentalPrice: '',
  cleaningPrice: '',
  deposit: '',
  photos: [],
  blockedDates: [],
  quantity: 1,
  subcategory: '',
});

// ===================== STORE =====================

export const useLenderStore = create<LenderState>((set, get) => ({

  formData: createInitialFormData(),
  currentStep: 1,
  savedSteps: [], // 👈 Initialize empty
  showPreview: false,
  loading: false,

  setFormData: (data, replace = false) =>
    set((state) => {
      // If we're updating data, and it's not a full replace, 
      // we remove the current step from savedSteps so it gets re-saved on Next.
      const isActuallyChanging = Object.keys(data).length > 0;
      const newSavedSteps = (replace || isActuallyChanging)
        ? state.savedSteps.filter(s => s !== state.currentStep)
        : state.savedSteps;

      return {
        formData: replace ? { ...createInitialFormData(), ...data } : { ...state.formData, ...data },
        savedSteps: newSavedSteps,
      };
    }),

  setCurrentStep: (step) => set({ currentStep: step }),

  togglePreview: (state) =>
    set((s) => ({ showPreview: state !== undefined ? state : !s.showPreview })),

  saveDraft: async (step: number, status: string = 'Draft') => {
    const { formData, setFormData, savedSteps } = get();
    try {
      set({ loading: true });
      let payload: any = { step };

      if (step === 1) {
        payload = {
          ...payload,
          name: formData.title,
          category: formData.category,
          sub_category: formData.subcategory,
          occasion: formData.occasion,
          size: formData.size,
          brand: formData.brand,
          quantity: formData.quantity,
          description: formData.description,
          rental_price_per_day: Number(formData.rentalPrice),
          price: Number(formData.rentalPrice),
        };
      } else if (step === 2) {
        // Frontend Step 2 is Photos (Originally Step 3 on backend)
        const data = new FormData();
        data.append('step', '3');
        data.append('productId', formData.id || '');

        formData.photos.forEach((photo) => {
          if (photo.isCover) {
            if (photo.file) data.append('coverImage', photo.file);
          } else {
            if (photo.file) data.append('productImages', photo.file);
          }
        });

        const res = await axiosClient.post(API_ENDPOINTS.ListingStep, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.data?.product) {
          const prod = res.data.data.product;
          set((state) => ({
            formData: {
              ...state.formData,
              cover_image: prod.cover_image,
              images: prod.images,
            },
          }));
        }

        // Update savedSteps if not already present
        if (!savedSteps.includes(step)) {
          set({ savedSteps: [...savedSteps, step] });
        }
        return true;
      } else if (step === 4) {
        payload = {
          ...payload,
          productId: formData.id,
          status,
        };
      }

      const res = await axiosClient.post(API_ENDPOINTS.ListingStep, payload);

      if (step === 1 && res.data?.data?.product?._id) {
        setFormData({ id: res.data.data.product._id });
      }

      // Update savedSteps if not already present
      if (!savedSteps.includes(step)) {
        set({ savedSteps: [...savedSteps, step] });
      }

      return true;
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.response?.data?.error || "Failed to save draft";
      toast.error(`❌ ${serverMessage}`);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  submitListing: async () => {
    const { saveDraft, formData } = get();
    
    // 1. Upload photos first (frontend Step 2)
    if (formData.photos && formData.photos.length > 0) {
      const uploadSuccess = await saveDraft(2);
      if (!uploadSuccess) return;
    }

    // 2. Finalize and submit listing (frontend Step 4 / backend finalize)
    const success = await saveDraft(4, 'Pending');
    if (success) {
      toast.success('Listing submitted successfully!');
      window.location.href = '/lender/listings';
    }
  },

  updateListing: async () => {
    const { formData } = get();
    try {
      set({ loading: true });
      const data = new FormData();

      // Basic Info
      data.append('name', formData.title);
      data.append('category', formData.category);
      data.append('sub_category', formData.subcategory);
      data.append('occasion', formData.occasion);
      data.append('size', JSON.stringify(formData.size));
      data.append('brand', formData.brand);
      data.append('quantity', String(formData.quantity));
      data.append('description', formData.description);

      // Pricing
      data.append('rental_price_per_day', String(formData.rentalPrice));
      data.append('cleaning_fee', String(formData.cleaningPrice));
      data.append('security_deposit', String(formData.deposit));

      // Photos
      formData.photos.forEach((photo) => {
        if (photo.isCover) {
          if (photo.file) {
            data.append('coverImage', photo.file);
          } else if (photo.url) {
            data.append('coverImageUrl', photo.url);
          }
        } else {
          if (photo.file) {
            data.append('productImages', photo.file);
          } else if (photo.url) {
            data.append('imageUrls', photo.url);
          }
        }
      });

      // Availablity
      if (formData.blockedDates.length > 0) {
        data.append('blocked_dates', JSON.stringify(formData.blockedDates.map(date => ({
          start_date: date,
          end_date: date,
        }))));
      }

      await axiosClient.post(`${API_ENDPOINTS.UpdateListing}/${formData.id}/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Listing updated successfully!');
      window.location.href = '/lender/listings';
    } catch (error: any) {
      console.error('❌ Listing update failed:', error);
      const serverMessage = error.response?.data?.message || error.response?.data?.error || "Failed to update listing";
      toast.error(`❌ ${serverMessage}`);
    } finally {
      set({ loading: false });
    }
  },

  // ===================== DELETE PHOTO =====================
  deletePhoto: async (photo: Photo) => {
    const { formData, setFormData, currentStep, savedSteps } = get();

    const photoUrl = photo.url;
    if (!photoUrl) {
      toast.error('Photo URL missing.');
      return;
    }

    // 🟡 New photo → remove locally only
    if (photo.isNew) {
      const updatedPhotos = formData.photos.filter((p) => p.id !== photo.id);
      setFormData({ photos: updatedPhotos });
      return;
    }

    // 🔵 Existing photo → delete via API
    if (!formData.id) {
      toast.error('Listing ID missing.');
      return;
    }

    try {
      await axiosClient.post(
        `${API_ENDPOINTS.UpdateListing}/${formData.id}/image/delete`,
        { image: photoUrl }
      );

      const updatedPhotos = formData.photos.filter((p) => p.url !== photoUrl);
      // Remove step 3 from savedSteps since photos changed
      set({
        formData: { ...formData, photos: updatedPhotos },
        savedSteps: savedSteps.filter(s => s !== 3)
      });

    } catch (err) {
      console.error(err);
      toast.error('Failed to delete photo.');
    }
  },

  resetFormData: () => {
    set({
      formData: createInitialFormData(),
      currentStep: 1,
      savedSteps: [],
    });
  },

}));
