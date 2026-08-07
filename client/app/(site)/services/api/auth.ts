/**
 * Authentication API Service for User Section
 * Handles all authentication-related API calls
 */

import Cookies from 'js-cookie';
import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpForgotRequest,
  VerifyOtpForgotResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  CreatePasswordRequest,
  CreatePasswordResponse,
  GoogleOAuthUrlResponse,
  KYCStartRequest,
  KYCStartResponse,
  ApiResponse,
} from '../../types/api';

export class AuthApiService {
  /**
   * Sign in user with email and password
   */
  async signIn(data: SignInRequest): Promise<ApiResponse<SignInResponse>> {
    return baseApiService.post<SignInResponse>(ENDPOINTS.AUTH.SIGNIN, data);
  }

  /**
   * Sign up new user
   */
  async signUp(data: SignUpRequest): Promise<ApiResponse<SignUpResponse>> {
    return baseApiService.post<SignUpResponse>(ENDPOINTS.AUTH.SIGNUP, data);
  }

  /**
   * Send OTP to email for verification
   */
  async sendOtp(data: SendOtpRequest): Promise<ApiResponse<SendOtpResponse>> {
    return baseApiService.post<SendOtpResponse>(ENDPOINTS.AUTH.SEND_OTP, data);
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> {
    return baseApiService.post<VerifyOtpResponse>(ENDPOINTS.AUTH.VERIFY_OTP, data);
  }

  /**
   * Request OTP for forgot password
   */
  async requestOtp(data: RequestOtpRequest): Promise<ApiResponse<RequestOtpResponse>> {
    return baseApiService.post<RequestOtpResponse>(ENDPOINTS.AUTH.REQUEST_OTP, data);
  }

  /**
   * Verify OTP for forgot password
   */
  async verifyOtpForgot(data: VerifyOtpForgotRequest): Promise<ApiResponse<VerifyOtpForgotResponse>> {
    return baseApiService.post<VerifyOtpForgotResponse>(ENDPOINTS.AUTH.VERIFY_OTP_FORGOT, data);
  }

  /**
   * Request password reset (legacy - keeping for compatibility)
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> {
    return baseApiService.post<ForgotPasswordResponse>(ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> {
    return baseApiService.post<ResetPasswordResponse>(ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  /**
   * Create password with token in query parameter (ref)
   */
  async createPassword(token: string, data: CreatePasswordRequest): Promise<CreatePasswordResponse> {
    // Token is passed as query parameter named 'ref'
    const endpoint = `${ENDPOINTS.AUTH.SET_PASSWORD}?ref=${encodeURIComponent(token)}`;
    const response = await baseApiService.post<CreatePasswordResponse['data']>(endpoint, {
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    return {
      success: response.success !== false,
      message: response.message || 'Password created successfully',
      data: response.data as any,
    };
  }

  /**
   * Refresh access token (if implemented on backend)
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> {
    return baseApiService.post('/auth/refresh', { refreshToken });
  }

  /**
   * Sign out user (client-side only, no API call needed)
   */
  async signOut(): Promise<void> {
    // Clear tokens from localStorage/sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user profile (requires authentication)
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: any }>> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token found');
    }

    return baseApiService.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('tokenExpiry');

    if (!token || !expiry) return false;

    // Check if token is expired
    return new Date(expiry).getTime() > Date.now();
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('auth_token') || null;
  }

  /**
   * Get stored refresh token (not used in current implementation)
   */
  getRefreshToken(): string | null {
    return null; // Not implemented in current API
  }

  /**
   * Store authentication tokens and user data
   */
  storeAuthData(authData: SignInResponse): void {
    if (typeof window === 'undefined') return;

    // Store token in cookies
    Cookies.set('auth_token', authData.token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  /**
   * Get stored user data
   */
  getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    return null; // User data is managed by Zustand store
  }

  /**
   * Get Google OAuth URL for authentication
   */
  async getGoogleOAuthUrl(): Promise<ApiResponse<GoogleOAuthUrlResponse>> {
    return baseApiService.get<GoogleOAuthUrlResponse>(ENDPOINTS.AUTH.GOOGLE_OAUTH);
  }

  /**
   * Switch account (e.g., toggle between lender/renter)
   */
  async switchAccount(): Promise<ApiResponse<any>> {
    return baseApiService.post<any>(ENDPOINTS.AUTH.SWITCH_ACCOUNT);
  }

  /**
   * Start KYC verification process
   */
  async startKYC(data: KYCStartRequest): Promise<ApiResponse<KYCStartResponse>> {
    return baseApiService.post<KYCStartResponse>(ENDPOINTS.KYC.START, data);
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
