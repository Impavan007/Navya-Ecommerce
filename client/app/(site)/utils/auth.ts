/**
 * Authentication utility functions
 * Provides helper functions for token management and authentication checks
 */

import Cookies from 'js-cookie';

/**
 * Get authentication token from cookies or localStorage
 * @returns {string | null} The authentication token or null if not found
 */
export function getAuthToken(): string | null {
  // First try cookies
  let token: string | null = Cookies.get('auth_token') || null;

  // Fallback to localStorage if no cookie token
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }

  return token;
}

/**
 * Check if user is authenticated by verifying token existence
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token;
}

/**
 * Store authentication token in both cookies and localStorage
 * @param {string} token - The authentication token to store
 * @param {number} expiresInDays - Number of days until token expires (default: 7)
 */
export function storeAuthToken(token: string, role: 'buyer' | 'seller' | 'admin' = 'buyer', expiresInDays: number = 7): void {
  // Store in cookies for API calls
  Cookies.set('auth_token', token, {
    expires: expiresInDays,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  // //
  // Store role in cookies for middleware role checking
  Cookies.set('user_role', role, {
    expires: expiresInDays,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Clear all authentication data from cookies and localStorage
 */
export function clearAuthData(): void {
  // Clear from cookies
  Cookies.remove('auth_token');

  // Clear from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('hasSeenWaitlistPopup');
    localStorage.removeItem('bookingProductMap')
    localStorage.removeItem('navyaa-cart');
    localStorage.removeItem('listing-storage');
    localStorage.removeItem('review-store')
    localStorage.removeItem('wishlist-storage');
  }
}

/**
 * Store user data in localStorage
 * @param {any} userData - The user data to store
 */
export function storeUserData(userData: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(userData));
  }
}

/**
 * Get user data from localStorage
 * @returns {any | null} The user data or null if not found
 */
export function getUserData(): any | null {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_user');
        return null;
      }
    }
  }
  return null;
}

/**
 * Sync token between cookies and localStorage
 * Ensures both storage methods have the same token
 */
export function syncAuthToken(): void {
  const cookieToken = Cookies.get('auth_token');
  const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (cookieToken && !localStorageToken && typeof window !== 'undefined') {
    // Cookie exists but localStorage doesn't - sync to localStorage
    localStorage.setItem('auth_token', cookieToken);
  } else if (!cookieToken && localStorageToken) {
    // localStorage exists but cookie doesn't - sync to cookies
    Cookies.set('auth_token', localStorageToken, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
}
