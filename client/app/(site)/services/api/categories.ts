/**
 * Categories API Service
 * Handles category-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ApiResponse, Category, CategoryProduct } from '../../types/api';

export class CategoriesApiService {
    async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return baseApiService.get<Category[]>(ENDPOINTS.CATEGORIES.LIST);
  }
  /**
   * Get products by category ID with optional filters
   * 
   */

 async getSubCategories(categoryId: string): Promise<ApiResponse<Category[]>> {
    return baseApiService.get<Category[]>(ENDPOINTS.CATEGORIES.SUB_CATEGORIES(categoryId));
  }
  async getProductsByCategory(
    categoryId: string, 
    filters?: {
      page?: number;
      limit?: number;
      sizes?: string[];
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    }
  ): Promise<ApiResponse<CategoryProduct[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters?.sort) queryParams.append('sort', filters.sort);
    if (filters?.sizes && filters.sizes.length > 0) {
      queryParams.append('sizes', filters.sizes.join(','));
    }
    
    const url = `${ENDPOINTS.CATEGORIES.PRODUCTS(categoryId)}?${queryParams.toString()}`;
    return baseApiService.get<CategoryProduct[]>(url);
  }

  /**
   * Get products by sub-category ID with optional filters
   */
  async getProductsBySubCategory(
    subCategoryId: string,
    filters?: {
      page?: number;
      limit?: number;
      sizes?: string[];
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters?.sort) queryParams.append('sort', filters.sort);
    if (filters?.sizes && filters.sizes.length > 0) {
      queryParams.append('sizes', filters.sizes.join(','));
    }
    
    const url = `${ENDPOINTS.CATEGORIES.SUBCATEGORY_PRODUCTS(subCategoryId)}?${queryParams.toString()}`;
    return baseApiService.get<any>(url);
  }
}
// Export singleton instance
export const categoriesApiService = new CategoriesApiService();
