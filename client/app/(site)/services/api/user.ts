/**
 * User Profile API Service for User Section
 * Handles all user profile and related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type {
  User,
  PaginatedResponse,
  ApiResponse,
  RenterAddressCreateRequest,
  RenterAddressCreateApiResponse,
  RenterAddressesApiResponse,
  NotificationsApiResponse,
} from '../../types/api';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    currency?: string;
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      marketing?: boolean;
      bookingUpdates?: boolean;
      reviewReminders?: boolean;
    };
    privacy?: {
      profileVisibility?: 'public' | 'friends' | 'private';
      showInSearch?: boolean;
      allowMessages?: boolean;
    };
  };
}

export interface UpdateAvatarRequest {
  avatar: File;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class UserApiService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return baseApiService.get<User>(ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return baseApiService.put<User>(ENDPOINTS.USER.UPDATE_PROFILE, data);
  }

  /**
   * Update user avatar
   */
  async updateAvatar(data: UpdateAvatarRequest): Promise<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('avatar', data.avatar);

    return baseApiService.upload<User>(ENDPOINTS.USER.UPDATE_PROFILE, formData);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.post<{ message: string }>('/change-password', data);
  }

  /**
   * Get user's wishlist
   */
  async getWishlist(params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
    }

    return baseApiService.get(ENDPOINTS.USER.WISHLIST, { params: queryParams });
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.post<{ message: string }>(ENDPOINTS.USER.WISHLIST_ADD, {
      productId,
    });
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.delete<{ message: string }>(`${ENDPOINTS.USER.WISHLIST_REMOVE}/${productId}`);
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
    }

    return baseApiService.get('/reviews', { params: queryParams });
  }

  /**
   * Get user's booking history
   */
  async getBookingHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.status) queryParams.status = params.status;
    }

    return baseApiService.get('/booking-history', { params: queryParams });
  }

  /**
   * Get user's notifications
   */
  async getNotifications(params?: { page?: number; limit?: number }): Promise<NotificationsApiResponse> {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
    }

    const resp = await baseApiService.get<NotificationsApiResponse['data']>(ENDPOINTS.NOTIFICATIONS.GET, { params: queryParams });
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as NotificationsApiResponse;
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.post<{ message: string }>(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.post<{ message: string }>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.delete<{ message: string }>(`/notifications/${notificationId}`);
  }

  /**
   * Get user's statistics
   */
  async getUserStats(): Promise<ApiResponse<{
    totalBookings: number;
    totalSpent: number;
    averageRating: number;
    favoriteCategories: string[];
    memberSince: string;
  }>> {
    return baseApiService.get('/stats');
  }

  /**
   * Renter create review (order, product, lender, rating, review)
   */
  async renterCreateReview(payload: {
    order: string;
    product: string;
    lender: string;
    rating: number | string;
    review: string;
  }): Promise<ApiResponse<any>> {
    return baseApiService.post(ENDPOINTS.REVIEWS.RENTER_CREATE, payload);
  }

  /**
   * Add a new renter address
   */
  async addRenterAddress(payload: RenterAddressCreateRequest): Promise<RenterAddressCreateApiResponse> {
    const resp = await baseApiService.post<RenterAddressCreateApiResponse['data']>(ENDPOINTS.USER.ADD_ADDRESS, payload);
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as RenterAddressCreateApiResponse;
  }

  /**
   * Get renter addresses list with primary address
   */
  async getRenterAddresses(): Promise<RenterAddressesApiResponse> {
    const resp = await baseApiService.get<RenterAddressesApiResponse['data']>(ENDPOINTS.USER.RENTER_ADDRESSES);
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as RenterAddressesApiResponse;
  }

  /**
   * Update renter address by id
   */
  async updateRenterAddress(
    id: string,
    payload: Partial<RenterAddressCreateRequest> & { is_primary?: boolean }
  ): Promise<RenterAddressCreateApiResponse> {
    const resp = await baseApiService.post<RenterAddressCreateApiResponse['data']>(ENDPOINTS.USER.UPDATE_ADDRESS(id), payload as any);
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as RenterAddressCreateApiResponse;
  }

  /**
   * Delete renter address by id
   */
  async deleteRenterAddress(id: string): Promise<RenterAddressCreateApiResponse> {
    const resp = await baseApiService.delete<RenterAddressCreateApiResponse['data']>(ENDPOINTS.USER.DELETE_ADDRESS(id));
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as RenterAddressCreateApiResponse;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    marketing?: boolean;
    bookingUpdates?: boolean;
    reviewReminders?: boolean;
  }): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.patch<{ message: string }>('/notification-preferences', preferences);
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.delete<{ message: string }>('/account', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Delete account (no password) - new endpoint
   */
  async deleteAccountNow(): Promise<ApiResponse<null>> {
    return baseApiService.delete<null>(ENDPOINTS.USER.DELETE_ACCOUNT);
  }

  /**
   * Change account status (Activate | Deactivate)
   */
  async changeAccountStatus(action: 'Activate' | 'Deactivate'): Promise<ApiResponse<{ status: string }>> {
    return baseApiService.post<{ status: string }>(ENDPOINTS.USER.CHANGE_ACCOUNT_STATUS, { action });
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> {
    return baseApiService.post('/export-data');
  }

  /**
   * Create a new support ticket
   */
  async createSupport(payload: {
    subject: string;
    description: string;
    productId?: string;
    lenderId?: string;
    orderId?: string;
    support_image?: File|null;
    category: string;
  }): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('subject', payload.subject || '');
    formData.append('description', payload.description || '');
    if (payload.productId) formData.append('productId', payload.productId);
    if (payload.lenderId) formData.append('lenderId', payload.lenderId);
    if (payload.orderId) formData.append('orderId', payload.orderId);
    formData.append('category', payload.category);
    if (payload.support_image) formData.append('support_image', payload.support_image);
    return baseApiService.upload(ENDPOINTS.SUPPORT.CREATE, formData);
  }
}

// Export singleton instance
export const userApiService = new UserApiService();
