/**
 * Bookings API Service for User Section
 * Handles all booking-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type {
  Booking,
  PaginatedResponse,
  ApiResponse,
  RenterBookingsApiResponse,
  CreateOrderRequest,
  CreateOrderApiResponse,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionApiResponse,
} from '../../types/api';

export interface CreateBookingRequest {
  cartItemIds: string[];
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  specialInstructions?: string;
  paymentMethod: 'card' | 'bank_transfer' | 'wallet';
}

export interface BookingFilters {
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  productId?: string;
}

export class BookingsApiService {
  /**
   * Get user's bookings with optional filters
   */
  async getBookings(params?: {
    page?: number;
    limit?: number;
    filters?: BookingFilters;
  }): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();

      if (params.filters) {
        const filters = params.filters;
        if (filters.status?.length) queryParams.status = filters.status.join(',');
        if (filters.dateRange) {
          queryParams.startDate = filters.dateRange.start;
          queryParams.endDate = filters.dateRange.end;
        }
        if (filters.productId) queryParams.productId = filters.productId;
      }
    }

    return baseApiService.get<PaginatedResponse<Booking>>(ENDPOINTS.BOOKINGS.LIST, {
      params: queryParams,
    });
  }

  /**
   * Get single booking by ID
   */
  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    return baseApiService.get<Booking>(ENDPOINTS.BOOKINGS.DETAIL(id));
  }

  /**
   * Get renter booking detail by ID (user-facing endpoint)
   */
  async getRenterBookingDetail(id: string) {
    return baseApiService.get(ENDPOINTS.BOOKINGS.RENTER_DETAIL(id));
  }

  /**
   * Get renter tracking information
   */
  async getTrackingInfo(id: string) {
    return baseApiService.get(ENDPOINTS.BOOKINGS.RENTER_TRACKING(id));
  }

  /**
   * Create new booking
   */
  async createBooking(data: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    return baseApiService.post<Booking>(ENDPOINTS.BOOKINGS.CREATE, data);
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.post<{ message: string }>(ENDPOINTS.BOOKINGS.CANCEL(id), {
      reason,
    });
  }

  /**
   * Extend booking
   */
  async extendBooking(id: string, payload: any): Promise<ApiResponse<Booking>> {
    return baseApiService.post<Booking>(ENDPOINTS.BOOKINGS.EXTEND(id), payload);
  }

  /**
   * Return booking
   */
  async returnBooking(
    id: string,
    payload: {

      description?: string;
      proof?: File[];
    }
  ): Promise<ApiResponse<Booking>> {
    const formData = new FormData();

    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.proof?.length) {
      payload.proof.forEach((file) => {
        formData.append('proof', file);
      });
    }

    return baseApiService.post<Booking>(ENDPOINTS.BOOKINGS.RETURN(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Confirm delivery with proof images and optional note
   */
  async confirmDelivery(
    id: string,
    payload: {
      note?: string;
      proof?: File[];
    }
  ): Promise<ApiResponse<{ message: string }>> {
    const formData = new FormData();

    if (payload.note) {
      formData.append('note', payload.note);
    }
    if (payload.proof?.length) {
      payload.proof.slice(0, 3).forEach((file) => {
        formData.append('proof', file);
      });
    }

    return baseApiService.post<{ message: string }>(ENDPOINTS.BOOKINGS.CONFIRM_DELIVERY(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Report issue with booking
   */
  async reportIssue(bookingId: string, issue: {
    type: 'damaged' | 'missing' | 'wrong_item' | 'late_delivery' | 'other';
    description: string;
    images?: string[];
  }): Promise<ApiResponse<{ message: string; disputeId?: string }>> {
    return baseApiService.post(`/bookings/${bookingId}/report-issue`, issue);
  }

  /**
   * Get booking timeline/history
   */
  async getBookingTimeline(bookingId: string): Promise<ApiResponse<any[]>> {
    return baseApiService.get(`/bookings/${bookingId}/timeline`);
  }

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(limit?: number): Promise<ApiResponse<Booking[]>> {
    const params: Record<string, string> | undefined =
      typeof limit === 'number' ? { limit: limit.toString() } : undefined;
    return baseApiService.get<Booking[]>('/bookings/upcoming', { params });
  }

  /**
   * Get active bookings (currently rented items)
   */
  async getActiveBookings(): Promise<ApiResponse<Booking[]>> {
    return baseApiService.get<Booking[]>('/bookings/active');
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(): Promise<ApiResponse<{
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalSpent: number;
    averageRating: number;
  }>> {
    return baseApiService.get('/bookings/stats');
  }

  async getRenterBookings(): Promise<RenterBookingsApiResponse> {
    const resp = await baseApiService.get<RenterBookingsApiResponse['data']>(ENDPOINTS.BOOKINGS.LIST);
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as RenterBookingsApiResponse;
  }

  /**
   * Get renter bookings with backend filtering (status, year, search)
   */
  async getRenterBookingsWithParams(params?: { status?: string; year?: string | number; search?: string; page?: number; limit?: number; }): Promise<RenterBookingsApiResponse> {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = String(params.status);
    if (params?.year !== undefined && params?.year !== null && params.year !== '') queryParams.year = String(params.year);
    if (params?.search) queryParams.search = params.search;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    const resp = await baseApiService.get<RenterBookingsApiResponse['data']>(ENDPOINTS.BOOKINGS.LIST, { params: queryParams });
    return {
      success: !!resp?.data,
      message: resp?.message || 'OK',
      data: resp?.data as any,
    } as RenterBookingsApiResponse;
  }

  /**
   * Create new order
   */
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderApiResponse> {
    const resp = await baseApiService.post<CreateOrderApiResponse['data']>(ENDPOINTS.BOOKINGS.CREATE_ORDER, data);
    return {
      success: resp?.success !== false,
      message: resp?.message || 'Order created successfully',
      data: resp?.data || resp as any,
    } as CreateOrderApiResponse;
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(
    transactionId: string,
    data: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionApiResponse> {
    const resp = await baseApiService.post<CreateCheckoutSessionApiResponse['data']>(
      ENDPOINTS.BOOKINGS.CREATE_CHECKOUT_SESSION(transactionId),
      data
    );
    return {
      success: resp?.success !== false,
      message: resp?.message || 'Checkout session created successfully',
      data: resp?.data || resp as any,
    } as CreateCheckoutSessionApiResponse;
  }

  /**
   * Retry payment for a booking using transaction ID
   */
  async retryPayment(
    transactionId: string,
    data: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionApiResponse> {
    return this.createCheckoutSession(transactionId, data);
  }
}

// Export singleton instance
export const bookingsApiService = new BookingsApiService();
