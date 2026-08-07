/**
 * Cart Hooks for User Section
 * Provides React hooks for cart operations using Zustand
 */

import { useCallback } from 'react';
import { cartApiService } from '../services/api/cart';
import { useCartStore } from '../stores/cartStore';
import { useUIStore } from '../stores/uiStore';
import { useApi } from './useApi';
import type { Cart } from '../types/api';
import type { AddToCartRequest, UpdateCartItemRequest } from '../services/api/cart';

export function useCart() {
  const { cart, items, itemCount, totalAmount, isLoading, setCart, setLoading } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    loading,
    error,
    success,
    execute,
  } = useApi<Cart>();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await execute(() => cartApiService.getCart());

      if (response.success && response.data) {
        setCart(response.data);
      }

      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, setCart, setLoading, setApiLoading]);

  return {
    cart,
    items,
    itemCount,
    totalAmount,
    loading: loading || isLoading,
    error,
    success,
    refetch: fetchCart,
  };
}

export function useCartCount() {
  const { itemCount, isLoading } = useCartStore();

  return {
    count: itemCount,
    loading: isLoading,
    refetch: () => { }, // Cart count is derived from store state
  };
}

export function useAddToCart() {
  const { setApiCart, setLoading } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    loading,
    error,
    success,
    execute,
  } = useApi<Cart>();

  const addToCart = useCallback(async (data: AddToCartRequest) => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await execute(() => cartApiService.addToCart(data));

      if (response.success) {
        // After adding to cart, fetch the updated cart from API to ensure sync
        try {
          const cartResponse = await cartApiService.getCart();
          if (cartResponse.success && cartResponse.data) {
            // Update store with the latest cart data from API
            setApiCart(cartResponse.data.cart, cartResponse.data.total);
          }
        } catch (cartError) {
          console.error("Error fetching updated cart:", cartError);
          // Continue even if fetch fails - the add was successful
        }
      }

      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, setApiCart, setLoading, setApiLoading]);

  return {
    addToCart,
    loading: loading || useCartStore.getState().isLoading,
    error,
    success,
  };
}

export function useUpdateCartItem() {
  const { updateItem, setLoading, setCart } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    loading,
    error,
    success,
    execute,
  } = useApi<Cart>();

  const updateCartItem = useCallback(async (data: UpdateCartItemRequest) => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await execute(() => cartApiService.updateCartItem(data));

      if (response.success && response.data) {
        // Update Zustand store
        setCart(response.data);
      }

      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, updateItem, setLoading, setApiLoading, setCart]);

  return {
    updateCartItem,
    loading: loading || useCartStore.getState().isLoading,
    error,
    success,
  };
}

export function useRemoveFromCart() {
  const { removeItem, setLoading, setCart } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    loading,
    error,
    success,
    execute,
  } = useApi<Cart>();

  const removeFromCart = useCallback(async (cartItemId: string) => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await execute(() => cartApiService.removeFromCart(cartItemId));

      if (response.success && response.data) {
        // Update Zustand store
        setCart(response.data);
      }

      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, removeItem, setLoading, setApiLoading, setCart]);

  return {
    removeFromCart,
    loading: loading || useCartStore.getState().isLoading,
    error,
    success,
  };
}

export function useClearCart() {
  const { clearCart, setLoading } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    loading,
    error,
    success,
    execute,
  } = useApi<{ message: string }>();

  const clearCartAction = useCallback(async () => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await execute(() => cartApiService.clearCart());

      if (response.success) {
        // Clear Zustand store
        clearCart();
      }

      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, clearCart, setLoading, setApiLoading]);

  return {
    clearCart: clearCartAction,
    loading: loading || useCartStore.getState().isLoading,
    error,
    success,
  };
}

export function useValidateCart() {
  const { setLoading } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    data: validation,
    loading,
    error,
    success,
    execute,
  } = useApi();

  const validateCart = useCallback(async () => {
    setLoading(true);
    setApiLoading(true);

    try {
      return await execute(() => cartApiService.validateCart());
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, setLoading, setApiLoading]);

  return {
    validation: validation?.data,
    loading: loading || useCartStore.getState().isLoading,
    error,
    success,
    validateCart,
  };
}

export function useApplyCoupon() {
  const { setLoading, setCart } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    data: couponResult,
    loading,
    error,
    success,
    execute,
  } = useApi();

  const applyCoupon = useCallback(async (couponCode: string) => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await execute(() => cartApiService.applyCoupon(couponCode));

      if (response.success && response.data?.updatedCart) {
        // Update Zustand store with coupon-applied cart
        setCart(response.data.updatedCart);
      }

      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, setLoading, setApiLoading, setCart]);

  return {
    couponResult: couponResult?.data,
    loading: loading || useCartStore.getState().isLoading,
    error,
    success,
    applyCoupon,
  };
}

export function useRemoveCoupon() {
  const { setLoading, setCart } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    data: cart,
    loading,
    error,
    success,
    execute,
  } = useApi<Cart>();

  const removeCoupon = useCallback(async () => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await execute(() => cartApiService.removeCoupon());

      if (response.success && response.data) {
        // Update Zustand store
        setCart(response.data);
      }

      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, setLoading, setApiLoading, setCart]);

  return {
    cart,
    loading: loading || useCartStore.getState().isLoading,
    error,
    success,
    removeCoupon,
  };
}

export function useCalculateShipping() {
  const { setLoading } = useCartStore();
  const { setApiLoading } = useUIStore();

  const {
    data: shipping,
    loading,
    error,
    success,
    execute,
  } = useApi();

  const calculateShipping = useCallback(async (address: {
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => {
    setLoading(true);
    setApiLoading(true);

    try {
      return await execute(() => cartApiService.calculateShipping(address));
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [execute, setLoading, setApiLoading]);

  return {
    shipping: shipping?.data,
    loading: loading || useCartStore.getState().isLoading,
    error,
    success,
    calculateShipping,
  };
}
