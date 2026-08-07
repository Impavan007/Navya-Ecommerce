/**
 * Products Hooks for User Section
 * Provides React hooks for product operations
 */

import { useState, useEffect, useCallback } from 'react';
import { productsApiService } from '../services/api/products';
import { useApi } from './useApi';
import type { Product, ProductsResponse, Category, SearchParams } from '../types/api';

export function useProducts(params?: SearchParams) {
  const {
    data: products,
    loading,
    error,
    success,
    execute,
  } = useApi<ProductsResponse>();

  const fetchProducts = useCallback(async () => {
    return execute(() => productsApiService.getAllProducts(params as any));
  }, [execute, params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: products?.products || [],
    meta: products?.pagination,
    loading,
    error,
    success,
    refetch: fetchProducts,
  };
}

export function useProduct(id: string) {
  const {
    data: product,
    loading,
    error,
    success,
    execute,
  } = useApi<Product>();

  const fetchProduct = useCallback(async () => {
    return execute(() => productsApiService.getProductById(id) as any);
  }, [execute, id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [fetchProduct, id]);

  return {
    product,
    loading,
    error,
    success,
    refetch: fetchProduct,
  };
}

export function useProductsByCategory(slug: string, params?: Omit<SearchParams, 'filters'>) {
  const {
    data: products,
    loading,
    error,
    success,
    execute,
  } = useApi<ProductsResponse>();

  const fetchProducts = useCallback(async () => {
    return execute(() => productsApiService.getProductsByCategory(slug));
  }, [execute, slug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: products?.products || [],
    meta: products?.pagination,
    loading,
    error,
    success,
    refetch: fetchProducts,
  };
}

export function useProductSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchProducts = useCallback(async (searchQuery: string, params?: Omit<SearchParams, 'query'>) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setQuery(searchQuery);

    try {
      const response = await productsApiService.searchProducts(searchQuery);

      if (response.success && response.data) {
        setSearchResults(((response.data as ProductsResponse).products || []) as unknown as Product[]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    query,
    searchResults,
    isSearching,
    searchProducts,
    setQuery,
  };
}

export function useCategories() {
  const {
    data: categories,
    loading,
    error,
    success,
    execute,
  } = useApi<any>();

  const fetchCategories = useCallback(async () => {
    return execute(() => productsApiService.getAllProducts({ limit: 0 } as any));
  }, [execute]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories: [] as Category[],
    loading,
    error,
    success,
    refetch: fetchCategories,
  };
}

export function useProductAvailability() {
  const {
    data: availability,
    loading,
    error,
    success,
    execute,
  } = useApi<any>();

  const checkAvailability = useCallback(async (
    productId: string,
    startDate: string,
    endDate: string
  ) => {
    return execute(() =>
      productsApiService.getProductById(productId)
    );
  }, [execute]);

  return {
    availability,
    loading,
    error,
    success,
    checkAvailability,
  };
}

export function useFeaturedProducts(limit?: number) {
  const {
    data: products,
    loading,
    error,
    success,
    execute,
  } = useApi<ProductsResponse>();

  const fetchFeaturedProducts = useCallback(async () => {
    return execute(() => productsApiService.getFeaturedProducts(limit));
  }, [execute, limit]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return {
    products: products?.products || [],
    loading,
    error,
    success,
    refetch: fetchFeaturedProducts,
  };
}

export function useRelatedProducts(productId: string, limit?: number) {
  const {
    data: products,
    loading,
    error,
    success,
    execute,
  } = useApi<ProductsResponse>();

  const fetchRelatedProducts = useCallback(async () => {
    return execute(() => productsApiService.getRelatedProducts(productId, limit));
  }, [execute, productId, limit]);

  useEffect(() => {
    if (productId) {
      fetchRelatedProducts();
    }
  }, [fetchRelatedProducts, productId]);

  return {
    products: products?.products || [],
    loading,
    error,
    success,
    refetch: fetchRelatedProducts,
  };
}
