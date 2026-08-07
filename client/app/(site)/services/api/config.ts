/**
 * API Configuration for User Section
 * Centralized configuration for all API endpoints and settings
 */

export const API_CONFIG = {
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://8r859v3d-5000.inc1.devtunnels.ms/api/v1",
  version: process.env.NEXT_PUBLIC_API_VERSION || "v1",
  timeout: 10000,
  retries: 3,
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNIN: "/login",
    SIGNUP: "/register",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    REQUEST_OTP: "/request-otp",
    VERIFY_OTP_FORGOT: "/verify-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/reset-password",
    GOOGLE_OAUTH: "/google-oauth-url",
    SET_PASSWORD: "/set-password",
    SWITCH_ACCOUNT: "/switch-account",
  },

  // Products
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id: string) => `/product/${id}`,
    BY_CATEGORY: (slug: string) => `/products/category/${slug}`,
    BY_LENDER: (id: string) => `/product-bylender/${id}`,
    SEARCH: "/products/search",
    SUGGESTIONS: "/products/search/suggestions",
    FEATURED: "/products",
    REVIEWS: (id: string) => `/product/${id}/reviews`,
    SIMILAR_AND_MORE: (id: string) => `/products/similar-and-more/${id}`,
  },

  // Cart
  CART: {
    GET: "/renter/cart",
    ADD: "/renter/cart",
    UPDATE: (id: string) => `renter/cart/${id}`,
    CLEAR: "/renter/clear-cart",
  },

  // Bookings
  BOOKINGS: {
    LIST: "/renter/my-bookings",
    DETAIL: (id: string) => `/bookings/${id}`,
    RENTER_DETAIL: (id: string) => `/renter/my-bookings/${id}`,
    RENTER_TRACKING: (id: string) => `/renter/my-bookings/${id}/tracking`,
    CREATE: "create",
    CREATE_ORDER: "/renter/create-order",
    CREATE_CHECKOUT_SESSION: (transactionId: string) =>
      `/renter/create-checkout-session/${transactionId}`,
    CANCEL: (id: string) => `/renter/cancel-order/${id}`,
    EXTEND: (id: string) => `/renter/request-extension/${id}`,
    RETURN: (id: string) => `renter/return-order/${id}`,
    CONFIRM_DELIVERY: (id: string) => `/renter/confirm-delivery/${id}`,
  },

  // User Profile
  USER: {
    PROFILE: "/profile",
    UPDATE_PROFILE: "/profile/update",
    RENTER_ADDRESSES: "/renter/addresses",
    WISHLIST: "/wishlist",
    WISHLIST_ADD: "/wishlist/add",
    WISHLIST_REMOVE: "/wishlist/remove",
    ADD_ADDRESS: "/renter/addresses",
    UPDATE_ADDRESS: (id: string) => `/renter/addresses/${id}`,
    DELETE_ADDRESS: (id: string) => `/renter/addresses/${id}`,
    DELETE_ACCOUNT: "/delete-account",
    CHANGE_ACCOUNT_STATUS: "/change-account-status",
  },

  // Reviews
  REVIEWS: {
    LIST: "/reviews",
    PRODUCT: (id: string) => `/reviews/product/${id}`,
    CREATE: "/reviews/create",
    RENTER_CREATE: "/renter/create-review",
  },

  // Categories
  CATEGORIES: {
    LIST: "/categories",
    PRODUCTS: (id: string) => `/explore-by-category/${id}`,
    SUB_CATEGORIES: (id: string) => `/categories/${id}/sub-categories`,
    SUBCATEGORY_PRODUCTS: (id: string) => `/explore-by-subcategory/${id}`,
  },

  // Stories
  STORIES: {
    LIST: "/story",
  },

  // Waitlist
  WAITLIST: {
    CREATE: "/create-waitlist",
  },

  // Wishlist
  WISHLIST: {
    GET_ALL: "/renter/wishlists",
    ADD: "/renter/wishlist",
    UPDATE: "/renter/wishlists", // POST endpoint for updating wishlist with products array
    REMOVE: (productId: string) => `/renter/wishlist/${productId}/delete`,
  },

  // Support
  SUPPORT: {
    CREATE: "/support",
    LIST: "/support",
  },

  // Settings
  SETTINGS: {
    GET: "/setting",
  },

  // Notifications
  NOTIFICATIONS: {
    GET: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },

  // Chats
  CHATS: {
    MESSAGES: (id: string) => `/chats/${id}/messages`,
  },

  // KYC
  KYC: {
    START: "/kyc/start",
  },

  // How It Works
  HOW_IT_WORKS: {
    GET: "/how-it-works",
  },

  // Newsletter
  NEWSLETTER: {
    CREATE: "/newsletter",
  },

  // Checkout
  CHECKOUT: {
    CALCULATE: "/renter/checkout/calculate",
  },

  // AI Endpoints
  AI: {
    STYLIST_CHAT: "/ai/stylist/chat",
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
} as const;
