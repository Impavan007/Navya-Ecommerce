/**
 * Products API Service
 * Handles product-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ApiResponse, ProductsApiResponse, ProductsResponse, ProductDetailResponse, SimilarAndMoreResponse } from '../../types/api';

export class ProductsApiService {
  /**
   * Get featured products
   */
  async getFeaturedProducts(limit?: number): Promise<ApiResponse<ProductsResponse>> {
    return baseApiService.get<ProductsResponse>(ENDPOINTS.PRODUCTS.FEATURED, {
      params: limit ? { is_featured: 'true', limit: String(limit) } : { is_featured: 'true' }
    });
  }

  /**
   * Get all products with pagination and filters
   */
  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    period?: number;
    is_featured?: boolean;
    available?: boolean;
    sizes?: string;
    fabric?: string;
    q?: string;
    min_price?: number;
    max_price?: number;
    start_date?: string;
    end_date?: string;
    top_lenders?: boolean;
    sort?: string;
  }): Promise<ApiResponse<ProductsResponse>> {
    const stringParams = params ? Object.fromEntries(
      Object.entries({
        page: params.page?.toString(),
        limit: params.limit?.toString(),
        category: params.category,
        search: params.search,
        period: params.period?.toString(),
        is_featured: params.is_featured?.toString(),
        available: params.available?.toString(),
        sizes: params.sizes,
        fabric: params.fabric,
        q: params.q,
        min_price: params.min_price?.toString(),
        max_price: params.max_price?.toString(),
        start_date: params.start_date,
        end_date: params.end_date,
        top_lenders: params.top_lenders?.toString(),
        sort: params.sort,
      }).filter(([_, value]) => value !== undefined && value !== "")
    ) as Record<string, string> : undefined;

    return baseApiService.get<ProductsResponse>(ENDPOINTS.PRODUCTS.LIST, { params: stringParams });
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<ProductDetailResponse>> {
    return baseApiService.get<ProductDetailResponse>(ENDPOINTS.PRODUCTS.DETAIL(id));
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(slug: string): Promise<ApiResponse<ProductsResponse>> {
    return baseApiService.get<ProductsResponse>(ENDPOINTS.PRODUCTS.BY_CATEGORY(slug));
  }

  /**
   * Get products by lender id (More from lender section)
   */
  async getProductsByLender(lenderId: string): Promise<ApiResponse<ProductsResponse>> {
    return baseApiService.get<ProductsResponse>(ENDPOINTS.PRODUCTS.BY_LENDER(lenderId));
  }

  /**
   * Search products
   */
  async searchProducts(
    query?: string,
    params?: { page?: number; limit?: number; fabric?: string }
  ): Promise<ApiResponse<ProductsResponse>> {
    const stringParams = params
      ? ((Object.fromEntries(
        Object.entries({
          page: params.page?.toString(),
          limit: params.limit?.toString(),
        }).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>))
      : undefined;

    const requestParams: Record<string, string> = {
      ...(stringParams || {}),
    };

    if (params?.fabric) {
      requestParams.fabric = params.fabric;
    } else if (query !== undefined) {
      requestParams.q = query;
    }

    return baseApiService.get<ProductsResponse>(ENDPOINTS.PRODUCTS.SEARCH, {
      params: requestParams
    });
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<ApiResponse<{ suggestions: { type: string; value: string; display: string }[]; searchTerm: string }>> {
    return baseApiService.get<any>(ENDPOINTS.PRODUCTS.SUGGESTIONS, {
      params: { q: query }
    });
  }

  /**
   * Get reviews for a product with optional pagination and period filter
   */
  async getProductReviews(
    id: string,
    params?: { page?: number; pageSize?: number; period?: string }
  ): Promise<ApiResponse<any>> {
    const stringParams = params
      ? (Object.fromEntries(
        Object.entries({
          page: params.page?.toString(),
          pageSize: params.pageSize?.toString(),
          period: params.period,
        }).filter(([_, v]) => v !== undefined)
      ) as Record<string, string>)
      : undefined;
    return baseApiService.get<any>(ENDPOINTS.PRODUCTS.REVIEWS(id), { params: stringParams });
  }

  /**
   * Aliases used by useProducts hooks
   */
  getProducts = this.getAllProducts.bind(this);
  getProduct = this.getProductById.bind(this);
  getCategories = async (): Promise<ApiResponse<any>> => {
    return baseApiService.get<any>(ENDPOINTS.PRODUCTS.FEATURED, { params: { is_featured: 'true' } });
  };
  checkAvailability = async (productId: string, startDate: string, endDate: string): Promise<ApiResponse<any>> => {
    return baseApiService.get<any>(ENDPOINTS.PRODUCTS.DETAIL(productId), { params: { startDate, endDate } });
  };
  getRelatedProducts = async (productId: string, limit?: number): Promise<ApiResponse<ProductsResponse>> => {
    return baseApiService.get<ProductsResponse>(ENDPOINTS.PRODUCTS.SIMILAR_AND_MORE(productId), {
      params: limit ? { limit: String(limit) } : undefined
    });
  };
  getSimilarAndMore = async (id: string): Promise<ApiResponse<SimilarAndMoreResponse>> => {
    return baseApiService.get<SimilarAndMoreResponse>(ENDPOINTS.PRODUCTS.SIMILAR_AND_MORE(id));
  };
}

// Export singleton instance
export const productsApiService = new ProductsApiService();
