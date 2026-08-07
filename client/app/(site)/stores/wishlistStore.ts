/**
 * Wishlist Store using Zustand
 * Manages wishlist state and operations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApiService } from '../services/api/wishlist';
import { toast } from 'react-hot-toast';
import type { WishlistProductItem, UpdateWishlistApiResponse } from '../types/api';

export interface WishlistState {
  // State
  wishlistItems: string[]; // Array of product IDs
  loadingProducts: Set<string>; // Track which products are currently loading
  error: string | null;

  // Actions
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  updateWishlist: (productIds: string[]) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: (productId: string) => boolean; // Check if specific product is loading
  clearError: () => void;

  // Sync with API
  syncWishlistFromAPI: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      // Initial state
      wishlistItems: [],
      loadingProducts: new Set<string>(),
      error: null,

      // Check if specific product is loading
      isLoading: (productId: string) => {
        const { loadingProducts } = get();
        return loadingProducts.has(productId);
      },

      // Add item to wishlist
      addToWishlist: async (productId: string) => {
        const { wishlistItems, loadingProducts } = get();

        // Prevent duplicate additions
        if (wishlistItems.includes(productId)) {
          toast.error("Item is already in your wishlist");
          return;
        }

        // Prevent multiple simultaneous requests for the same product
        if (loadingProducts.has(productId)) {
          return;
        }

        // --- OPTIMISTIC UPDATE ---
        const previousItems = [...wishlistItems];
        set((state) => ({
          wishlistItems: [...state.wishlistItems, productId],
          loadingProducts: new Set([...state.loadingProducts, productId]),
          error: null,
        }));

        try {
          const response = await wishlistApiService.updateWishlist([
            ...previousItems,
            productId,
          ]);

          if (response.success && response.data) {
            const apiProductIds = response.data.products.map(
              (product: WishlistProductItem) => product._id
            );
            set((state) => ({
              wishlistItems: apiProductIds,
              loadingProducts: new Set(
                [...state.loadingProducts].filter((id) => id !== productId)
              ),
            }));
            toast.success("Added to wishlist successfully!");
          } else {
            throw new Error(response.message || "Failed to add to wishlist");
          }
        } catch (error: any) {
          console.error("Error adding to wishlist:", error);
          // --- REVERT STATE ---
          set((state) => ({
            wishlistItems: previousItems,
            error: error.message || "Failed to add to wishlist",
            loadingProducts: new Set(
              [...state.loadingProducts].filter((id) => id !== productId)
            ),
          }));
          toast.error(error.message || "Failed to add to wishlist");
        }
      },

      // Remove item from wishlist
      removeFromWishlist: async (productId: string) => {
        const { wishlistItems, loadingProducts } = get();

        // Prevent multiple simultaneous requests for the same product
        if (loadingProducts.has(productId)) {
          return;
        }

        // --- OPTIMISTIC UPDATE ---
        const previousItems = [...wishlistItems];
        set((state) => ({
          wishlistItems: state.wishlistItems.filter((id) => id !== productId),
          loadingProducts: new Set([...state.loadingProducts, productId]),
          error: null,
        }));

        try {
          const response = await wishlistApiService.removeFromWishlist(
            productId
          );

          if (response.success) {
            set((state) => ({
              loadingProducts: new Set(
                [...state.loadingProducts].filter((id) => id !== productId)
              ),
            }));
            toast.success("Removed from wishlist successfully!");
          } else {
            throw new Error(response.message || "Failed to remove from wishlist");
          }
        } catch (error: any) {
          console.error("Error removing from wishlist:", error);
          // --- REVERT STATE ---
          set((state) => ({
            wishlistItems: previousItems,
            error: error.message || "Failed to remove from wishlist",
            loadingProducts: new Set(
              [...state.loadingProducts].filter((id) => id !== productId)
            ),
          }));
          toast.error(error.message || "Failed to remove from wishlist");
        }
      },

      // Update entire wishlist
      updateWishlist: async (productIds: string[]) => {
        const { loadingProducts } = get();

        // Prevent multiple simultaneous requests
        if (loadingProducts.size > 0) {
          return;
        }

        try {
          set({ error: null });

          // Call API to update wishlist
          const response = await wishlistApiService.updateWishlist(productIds);

          if (response.success && response.data) {
            // Update local state with all products from API response
            const apiProductIds = response.data.products.map((product: WishlistProductItem) => product._id);
            set({
              wishlistItems: apiProductIds
            });
          } else {
            throw new Error(response.message || 'Failed to update wishlist');
          }
        } catch (error: any) {
          console.error('Error updating wishlist:', error);
          set({
            error: error.message || 'Failed to update wishlist'
          });
          toast.error(error.message || 'Failed to update wishlist');
        }
      },

      // Check if item is in wishlist
      isInWishlist: (productId: string) => {
        const { wishlistItems } = get();
        return wishlistItems.includes(productId);
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Sync wishlist from API
      syncWishlistFromAPI: async () => {
        const { loadingProducts } = get();

        if (loadingProducts.size > 0) {
          return;
        }

        try {
          set({ error: null });

          const response = await wishlistApiService.getAllWishlists();

          if (response.success && response.data) {
            // Extract product IDs from API response
            const apiProductIds = response.data.wishlists.flatMap((wishlist: any) =>
              wishlist.products.map((product: WishlistProductItem) => product._id)
            );
            set({
              wishlistItems: apiProductIds
            });
          } else {
            throw new Error(response.message || 'Failed to sync wishlist');
          }
        } catch (error: any) {
          console.error('Error syncing wishlist:', error);
          set({
            error: error.message || 'Failed to sync wishlist'
          });
        }
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        wishlistItems: state.wishlistItems
      }),
    }
  )
);
