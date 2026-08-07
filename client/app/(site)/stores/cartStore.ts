/**
 * Cart Store using Zustand
 * Manages shopping cart state globally with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem, ApiCartItem } from '../types/api';

interface CartState {
  // State
  cart: Cart | null;
  items: CartItem[];
  apiItems: ApiCartItem[]; // New field for API cart items
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  lastUpdated: string | null;

  // Actions
  setCart: (cart: Cart) => void;
  setApiCart: (apiItems: ApiCartItem[], total: number) => void; // New action for API cart
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeItem: (itemId: string) => void;
  removeApiItem: (productId: string) => void; // New action for API cart item removal
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  updateCartTotals: () => void;
  getItemByProductId: (productId: string) => CartItem | undefined;
  isProductInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      items: [],
      apiItems: [],
      itemCount: 0,
      totalAmount: 0,
      isLoading: false,
      lastUpdated: null,

      // Actions
      setCart: (cart: Cart) => {
        set({
          cart,
          items: cart.items,
          itemCount: cart.itemCount,
          totalAmount: cart.totalAmount,
          lastUpdated: new Date().toISOString(),
        });
      },

      setApiCart: (apiItems: ApiCartItem[], total: number) => {
        set({
          apiItems,
          itemCount: apiItems.length,
          totalAmount: total,
          lastUpdated: new Date().toISOString(),
        });
      },

      addItem: (item: CartItem) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (i) => i.product.id === item.product.id && i.selectedSize === item.selectedSize
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          newItems = [...currentItems];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + item.quantity,
            subtotal: newItems[existingItemIndex].subtotal + item.subtotal,
          };
        } else {
          // Add new item
          newItems = [...currentItems, item];
        }

        set({
          items: newItems,
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          lastUpdated: new Date().toISOString(),
        });

        get().updateCartTotals();
      },

      updateItem: (itemId: string, updates: Partial<CartItem>) => {
        const currentItems = get().items;
        const itemIndex = currentItems.findIndex((item) => item.id === itemId);

        if (itemIndex >= 0) {
          const newItems = [...currentItems];
          newItems[itemIndex] = { ...newItems[itemIndex], ...updates };

          set({
            items: newItems,
            lastUpdated: new Date().toISOString(),
          });

          get().updateCartTotals();
        }
      },

      removeItem: (itemId: string) => {
        const currentItems = get().items;
        const newItems = currentItems.filter((item) => item.id !== itemId);

        set({
          items: newItems,
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          lastUpdated: new Date().toISOString(),
        });

        get().updateCartTotals();
      },

      removeApiItem: (productId: string) => {
        const currentApiItems = get().apiItems;
        const newApiItems = currentApiItems.filter((item) => item.product._id !== productId);

        // Recalculate total
        const newTotal = newApiItems.reduce((sum, item) => sum + item.subtotal, 0);

        set({
          apiItems: newApiItems,
          itemCount: newApiItems.length,
          totalAmount: newTotal,
          lastUpdated: new Date().toISOString(),
        });
      },

      clearCart: () => {
        set({
          cart: null,
          items: [],
          apiItems: [],
          itemCount: 0,
          totalAmount: 0,
          lastUpdated: new Date().toISOString(),
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateCartTotals: () => {
        const items = get().items;
        const newTotalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

        set({
          totalAmount: newTotalAmount,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        });
      },

      getItemByProductId: (productId: string) => {
        return get().items.find((item) => item.product.id === productId);
      },

      isProductInCart: (productId: string) => {
        return get().items.some((item) => item.product.id === productId);
      },
    }),
    {
      name: 'navyaa-cart', // Key for localStorage
      partialize: (state) => ({
        items: state.items,
        apiItems: state.apiItems,
        itemCount: state.itemCount,
        totalAmount: state.totalAmount,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
