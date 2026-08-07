/**
 * Base API Service for User Section
 * Provides common HTTP methods and error handling using Axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { clearAuthData } from '../../utils/auth';
import { useAuthStore } from '../../stores/authStore';
import { API_CONFIG, HTTP_METHODS, CONTENT_TYPES } from './config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
    public errorCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base API service class with common HTTP methods using Axios
 */
export class BaseApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': CONTENT_TYPES.JSON,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.data?.error_code === 673) {
          // Service not available in user's city
          if (typeof window !== 'undefined') {
            window.location.href = '/not-available';
          }
          return Promise.reject(error);
        }

        if (error.response?.status === 401) {
          // Token expired or invalid, clear all auth data and update store
          clearAuthData();
          // Update auth store to mark user as not authenticated
          // This will trigger ProtectedRoute to show waitlist popup
          if (typeof window !== 'undefined') {
            const { signOut } = useAuthStore.getState();
            signOut();
          }
          // Don't redirect to sign-in - let ProtectedRoute component handle showing waitlist popup
          // The ProtectedRoute will detect the user is not authenticated and show the waitlist popup
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic request method using Axios
   */
  private async request<T>(
    endpoint: string,
    method: keyof typeof HTTP_METHODS,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: endpoint,
      data: data,
      params: options.params,
      headers: {
        ...options.headers,
      },
      timeout: options.timeout || API_CONFIG.timeout,
    };

    try {
      const response = await this.axiosInstance.request<any>(config);
      const resData = response.data;
      if (resData && typeof resData === 'object') {
        if ('data' in resData) {
          return resData;
        }
        const { success, message, errors, ...dataPayload } = resData;
        return {
          success: success !== false,
          message,
          errors,
          data: dataPayload as any
        };
      }
      return resData;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        throw new ApiError(
          errorData?.message || `HTTP ${error.response.status}: ${error.response.statusText}`,
          error.response.status,
          errorData?.errors,
          errorData?.error_code
        );
      } else if (error.request) {
        // Network error
        throw new ApiError('Network error: Unable to connect to server', 0);
      } else {
        // Other error
        throw new ApiError(`Request error: ${error.message}`, 0);
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.GET, undefined, options);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.POST, data, options);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.PUT, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.PATCH, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.DELETE, undefined, options);
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: endpoint,
      data: formData,
      params: options?.params,
      headers: {
        ...options?.headers,
        'Content-Type': CONTENT_TYPES.FORM_DATA,
      },
      timeout: options?.timeout || API_CONFIG.timeout,
    };

    try {
      const response = await this.axiosInstance.request<any>(config);
      const resData = response.data;
      if (resData && typeof resData === 'object') {
        if ('data' in resData) {
          return resData;
        }
        const { success, message, errors, ...dataPayload } = resData;
        return {
          success: success !== false,
          message,
          errors,
          data: dataPayload as any
        };
      }
      return resData;
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data;
        throw new ApiError(
          errorData?.message || `Upload failed: ${error.response.status}`,
          error.response.status,
          errorData?.errors,
          errorData?.error_code
        );
      } else if (error.request) {
        throw new ApiError('Upload error: Unable to connect to server', 0);
      } else {
        throw new ApiError(`Upload error: ${error.message}`, 0);
      }
    }
  }
}

// Export singleton instance
export const baseApiService = new BaseApiService();
