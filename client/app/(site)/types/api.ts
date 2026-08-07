/**
 * TypeScript Types for User API Responses
 * Comprehensive type definitions for all API endpoints
 */

// Common types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Authentication Types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    switch_account?: boolean;
    is_switched?: boolean;
    user_slug_id?: string;
  };
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  city?: string;
  PostalCode?: string;
  phoneNumber?: string;
  confirm_password?: string;
}

export interface SignUpResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    switch_account?: boolean;
    is_switched?: boolean;
    user_slug_id?: string;
  };
  token?: string;
  requiresEmailVerification?: boolean;
}

export interface KYCStartRequest {
  verification_type: string;
  version_tag: string;
}

export interface KYCStartResponse {
  kyc_id: string;
  session_id: string;
  session_url: string;
}

export interface SendOtpRequest {
  email: string;
  type: "signup" | "forgot_password" | "login";
}

export interface SendOtpResponse {
  message: string;
  otpExpiresIn: number; // seconds
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  type: "signup" | "forgot_password" | "login";
}

export interface VerifyOtpResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface RequestOtpRequest {
  email: string;
}

export interface RequestOtpResponse {
  message: string;
}

export interface VerifyOtpForgotRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpForgotResponse {
  token: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

// Create Password Request (token in query param)
export interface CreatePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface CreatePasswordResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface ResetPasswordResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface GoogleOAuthUrlResponse {
  url: string;
}

// User Types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  address?: Address;
  preferences: UserPreferences;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: "buyer" | "seller" | "admin";
  status: "active" | "suspended" | "deactivated";
  // Optional: whether user can switch to lender account (from API)
  switch_account?: boolean;
  // Optional: whether the account has already been switched (from API)
  isSwitched?: boolean;
  profile_image?: string | null;
  name?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  bookingUpdates: boolean;
  reviewReminders: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showInSearch: boolean;
  allowMessages: boolean;
}

// Product Types
export interface Product extends BaseEntity {
  name: string;
  description: string;
  brand: string;
  category: Category;
  subcategory?: string;
  images: ProductImage[];
  price: number;
  originalPrice?: number;
  currency: string;
  sizes: string[];
  condition: "new" | "like_new" | "good" | "fair";
  fitNotes?: string;
  lender: Lender;
  isTopLender: boolean;
  rating: number;
  reviewCount: number;
  availability: ProductAvailability;
  rentalPeriods: RentalPeriod[];
  tags: string[];
  location: Location;
  policies: RentalPolicies;
  stats: ProductStats;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
}

export interface Lender {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  responseTime: number; // hours
  isVerified: boolean;
  joinedDate: string;
}

export interface Location {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ProductAvailability {
  isAvailable: boolean;
  availableFrom?: string;
  availableTo?: string;
  blackoutDates?: string[];
  maxRentalDays?: number;
  minRentalDays?: number;
}

export interface RentalPeriod {
  id: string;
  days: number;
  pricePerDay: number;
  totalPrice: number;
  discount?: number;
  isPopular?: boolean;
}

export interface RentalPolicies {
  securityDeposit?: number;
  lateFeePerDay?: number;
  cleaningFee?: number;
  deliveryFee?: number;
  cancellationPolicy: "flexible" | "moderate" | "strict";
  damagePolicy: string;
  additionalRules?: string;
}

export interface ProductStats {
  totalRentals: number;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  rentalPeriod: RentalPeriod;
  startDate: string;
  endDate: string;
  quantity: number;
  subtotal: number;
  fees: CartItemFees;
}

export interface CartItemFees {
  serviceFee: number;
  deliveryFee: number;
  cleaningFee: number;
  securityDeposit: number;
  taxes: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalFees: number;
  totalTaxes: number;
  totalAmount: number;
  currency: string;
  itemCount: number;
  expiresAt: string;
}

// Booking Types
export interface Booking extends BaseEntity {
  orderNumber: string;
  status: BookingStatus;
  renter: User;
  product: Product;
  rentalPeriod: RentalPeriod;
  startDate: string;
  endDate: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  currency: string;
  fees: BookingFees;
  payments: Payment[];
  deliveryAddress: Address;
  specialInstructions?: string;
  tracking?: BookingTracking;
  timeline: BookingTimeline[];
  canCancel: boolean;
  canExtend: boolean;
  canReview: boolean;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "in_use"
  | "returned"
  | "completed"
  | "cancelled"
  | "disputed";

export interface BookingFees {
  rentalFee: number;
  serviceFee: number;
  deliveryFee: number;
  cleaningFee: number;
  securityDeposit: number;
  taxes: number;
  lateFees?: number;
  damageFees?: number;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  processedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type PaymentMethod = "card" | "bank_transfer" | "wallet" | "paypal";

export interface BookingTracking {
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  returnTrackingNumber?: string;
  returnCarrier?: string;
  returnShippedAt?: string;
  returnDeliveredAt?: string;
}

export interface BookingTimeline {
  id: string;
  status: BookingStatus;
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

// Review Types
export interface Review extends BaseEntity {
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  images?: ReviewImage[];
  booking: Booking;
  reviewer: User;
  product: Product;
  lender?: Lender;
  isVerified: boolean;
  helpful: number;
  notHelpful: number;
}

export interface ReviewImage {
  id: string;
  url: string;
  alt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Story Types
export interface Story extends BaseEntity {
  title: string;
  content: string;
  excerpt: string;
  author: User;
  images: StoryImage[];
  tags: string[];
  category: string;
  isPublished: boolean;
  views: number;
  likes: number;
  comments: StoryComment[];
  publishedAt?: string;
}

export interface StoryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface StoryComment extends BaseEntity {
  content: string;
  author: User;
  story: Story;
  parentId?: string; // for nested comments
  likes: number;
}

// Wishlist Types
export interface WishlistItem extends BaseEntity {
  user: User;
  product: Product;
  addedAt: string;
}

// Search and Filter Types
export interface ProductFilters {
  category?: string[];
  subcategory?: string[];
  brand?: string[];
  size?: string[];
  condition?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number; // km
  };
  availability?: {
    startDate?: string;
    endDate?: string;
  };
  rating?: number;
  sortBy?:
  | "relevance"
  | "price_low"
  | "price_high"
  | "rating"
  | "newest"
  | "popular";
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: ProductFilters;
}

// API Request/Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

// Error types for better error handling
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  code?: string;
}

// Waitlist Types
export interface WaitlistRequest {
  name: string;
  email: string;
  city: string;
  PostalCode?: string;
  role?: string;
  brands?: string;
  brandImage?: File;
}

export interface WaitlistResponse {
  name: string;
  email: string;
  city: string;
  role: string;
  brands: string[];
  brand_image: string;
  status: string;
  _id: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

// Wishlist Types
export interface WishlistUserInfo {
  id: string;
  name: string;
  email: string;
  profile_image: string | null;
}

export interface WishlistProduct {
  _id: string;
  name: string;
  brand: string;
  rental_price_per_day: number;
  images: string[];
}

export interface WishlistData {
  _id: string;
  user: WishlistUserInfo;
  products: WishlistProduct[];
}

export interface WishlistResponse {
  wishlists: WishlistData[];
}

export interface WishlistApiResponse {
  success: boolean;
  message: string;
  data: WishlistResponse;
}

// Update Wishlist Response (for POST /renter/wishlists)
export interface UpdateWishlistResponse {
  _id: string;
  user: string;
  products: WishlistProductItem[];
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface WishlistProductItem {
  _id: string;
  name: string;
  brand: string;
  rental_price_per_day: number;
  images: string[];
}

export interface UpdateWishlistApiResponse {
  success: boolean;
  message: string;
  data: UpdateWishlistResponse;
}

// Product Types
export interface ProductLender {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  is_top_lender?: boolean;
}

export interface ProductCategory {
  _id: string;
  name: string;
}

export interface ProductSubCategory {
  _id: string;
  name: string;
}

export interface ProductBlockedDate {
  start_date: string;
  end_date: string;
}

export interface ApiProduct {
  id: string;
  lender: ProductLender;
  name: string;
  description: string;
  brand: string;
  occasion: string;
  size: string[];
  rentalPrice: number;
  cleaning_fee: number;
  blocked_dates: ProductBlockedDate[];
  images: string[];
  cover_image: string;
  quantity: number;
  status: string;
  category: ProductCategory;
  sub_category: ProductSubCategory;
  rating: number;
  rating_count: number;
  terms_and_condition: boolean;
  security_deposit: number;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  products: ApiProduct[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductsApiResponse {
  success: boolean;
  message: string;
  data: ProductsResponse;
}

export interface SimilarAndMoreResponse {
  similar: ApiProduct[];
  moreFromLender: ApiProduct[];
}

// Rental Period Option from Backend
export interface RentalPeriodOption {
  days: number;
  discount?: number | string; // Can be percentage string like "32%" or number
  priceperday: number;
  rental: number; // Total rental price
}

// Product Detail Response
export interface PricingOption {
  duration: number;
  label: string;
  discount: number;
  pricePerDay: number;
  totalPrice: number;
  breakdown: {
    rental: number;
    cleaning_fee: number;
    security_deposit: number;
    total: number;
  };
}

export interface ProductPricing {
  base_price_per_day: number;
  cleaning_fee: number;
  security_deposit: number;
  options: PricingOption[];
}

export interface ProductDetailResponse {
  _id: string;
  lender: {
    _id: string;
    name: string;
    email: string;
    profile_image: string | null;
    is_top_lender?: boolean;
  };
  name: string;
  description: string;
  brand: string;
  occasion: string;
  size: string[];
  rental_price_per_day: number;
  cleaning_fee: number;
  blocked_dates: ProductBlockedDate[];
  images: string[];
  cover_image: string;
  quantity: number;
  status: string;
  category: ProductCategory;
  sub_category: ProductSubCategory;
  rating: number;
  rating_count: number;
  terms_and_condition: boolean;
  security_deposit: number;
  is_featured: boolean;
  pricing?: ProductPricing; // Backend pricing options
  rental_periods?: RentalPeriodOption[]; // Backend rental period options (legacy)
  options?: RentalPeriodOption[]; // Alternative field name (legacy)
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface ProductDetailApiResponse {
  success: boolean;
  message: string;
  data: ProductDetailResponse;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  status: string;
  sub_categories: string[];
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

// Category Products Types
export interface CategoryProduct {
  _id: string;
  lender: string;
  name: string;
  description: string;
  brand: string;
  occasion: string;
  size: string[];
  rental_price_per_day: number;
  cleaning_fee: number;
  blocked_dates: ProductBlockedDate[];
  images: string[];
  cover_image: string;
  quantity: number;
  status: string;
  category: {
    _id: string;
    name: string;
  };
  sub_category: {
    _id: string;
    name: string;
  };
  rating: number;
  terms_and_condition: boolean;
  security_deposit: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface CategoryProductsResponse {
  success: boolean;
  message: string;
  data: CategoryProduct[];
}

// Cart Types
export interface ApiCartItem {
  _id: string;
  size: string;
  start_date: string;
  end_date: string;
  quantity: number;
  duration: number;
  subtotal: number;
  product: {
    _id: string;
    lender: string;
    name: string;
    description: string;
    brand: string;
    occasion: string;
    size: string[];
    rental_price_per_day: number;
    cleaning_fee: number;
    blocked_dates: ProductBlockedDate[];
    images: string[];
    cover_image: string;
    quantity: number;
    status: string;
    category: string;
    sub_category: string;
    rating: number;
    terms_and_condition: boolean;
    security_deposit: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
  };
  pricing?: {
    basePricePerDay: number;
    discountedPricePerDay: number;
    discountPercentage: number;
    rentalAmount: number;
    serviceFee: number;
    cleaningFee: number;
    securityDeposit: number;
    subtotal: number;
  };
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    cart: ApiCartItem[];
    total: number;
  };
}

// Profile Types
export interface ProfileAddress {
  label: string;
  street_name: string;
  house_number: string;
  house_number_suffix?: string;
  city: string;
  postal_code: string;
  is_primary: boolean;
  _id: string;
  created_at: string;
}

export interface ProfileData {
  name: string;
  email: string;
  address: string;
  addresses: ProfileAddress[];
  phone: string | null;
  profile_image: string | null;
  bio: string | null;
  status: string | null;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: ProfileData;
}

export interface ProfileApiResponse {
  success: boolean;
  message?: string;
  data?: ProfileData;
}

// Renter Address Create Types
export interface RenterAddressCreateRequest {
  label: string;
  street_name: string;
  house_number: string;
  house_number_suffix?: string;
  city: string;
  postal_code: string;
  is_primary: boolean;
}

export interface RenterAddressListItem {
  label: string;
  street_name: string;
  house_number: string;
  house_number_suffix?: string;
  city: string;
  postal_code: string;
  is_primary: boolean;
  created_at: string;
  _id: string;
}

export interface RenterAddressesPayload {
  addresses: RenterAddressListItem[];
  address: string;
  total_addresses: number;
  primary_address?: RenterAddressListItem;
}

export interface RenterAddressesApiResponse {
  success: boolean;
  message: string;
  data: RenterAddressesPayload;
}

export interface RenterAddressCreateResponseData {
  addresses: RenterAddressListItem[];
  address: string; // formatted address string
}

export interface RenterAddressCreateApiResponse {
  success: boolean;
  message: string;
  data: RenterAddressCreateResponseData;
}

// Bookings List (Renter) Types
export interface RenterBookingItem {
  orderId: string;
  orderInternalId: string;
  productId?: string; // added based on API response
  productName: string;
  productImage: string;
  size: string;
  price: number;
  itemCount: number;
  rentalPeriod: string;
  status: string;
  reviewAvailable: boolean;
  reviewText: string;
  createdAt: string;
  totalAmount: number;
  rentalFee: number;
  cleaningFee: number;
  securityDeposit: number;
  trackingNumber: string | null;
  trackingLink: string | null;
  shippingProvider: string | null;
  lenderId?: string; // added based on API response
}

export interface RenterBookingsPayload {
  bookings: RenterBookingItem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalBookings: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface RenterBookingsApiResponse {
  success: boolean;
  message: string;
  data: RenterBookingsPayload;
}

// Order Creation Types
export interface CreateOrderProduct {
  product: string;
  quantity: number;
  size: string;
  start_date: string;
  end_date: string;
}

export interface CreateOrderRequest {
  products: CreateOrderProduct[];
  address: string; // address ID
}

export interface OrderProduct {
  product: string;
  lender: string;
  quantity: number;
  size: string;
  start_date: string;
  end_date: string;
  duration: number;
  rental_price_per_day: number;
  cleaning_fee: number;
  security_deposit: number;
  subtotal: number;
}

export interface Order {
  order_number: string;
  renter: string;
  lender: string;
  products: OrderProduct[];
  rental_fee_total: number;
  cleaning_fee_total: number;
  security_deposit_total: number;
  platform_fee: number;
  earnings: number;
  shipping_charge: number;
  late_fee: number;
  total_price: number;
  cancellationReason: string | null;
  status: string;
  timeline: Array<{
    title: string;
    by: string;
    note: string;
    date: string;
  }>;
  address: string;
  funds_state: string;
  hold_expires_at: string | null;
  payout_status: string;
  payout_amount: number;
  payout_transfer_id: string | null;
  support: any;
  is_return: boolean;
  _id: string;
  proofs: any[];
  created_at: string;
  updated_at: string;
  __v: number;
  transaction: string;
}

export interface CreateOrderResponseData {
  orders: Order[];
  totalOrders: number;
  grandTotal: number;
  pricing: {
    rentalFees: number;
    cleaningFees: number;
    platformFees: number;
    securityDeposits: number;
    finalTotal: number;
  };
  transaction: {
    id: string;
    amount: number;
    status: string;
  };
}

export interface CreateOrderApiResponse {
  success: boolean;
  message: string;
  data: CreateOrderResponseData;
}

// Stripe Checkout Session Types
export interface CreateCheckoutSessionRequest {
  successUrl: string;
  cancelUrl: string;
  includeSecurityDeposit?: boolean;
}

export interface CheckoutSessionMetadata {
  transactionId: string;
  orderCount: number;
  customerId: string;
}

export interface CheckoutSessionResponseData {
  sessionId: string;
  sessionUrl: string;
  paymentAmount: number;
  currency: string;
  includeSecurityDeposit: boolean;
  metadata: CheckoutSessionMetadata;
}

export interface CreateCheckoutSessionApiResponse {
  success: boolean;
  message: string;
  data: CheckoutSessionResponseData;
}

// Stories list (public) types
export interface ApiStoryProductBrief {
  _id: string;
  name: string;
  images: string[];
  cover_image: string;
}

export interface ApiStoryItem {
  product: ApiStoryProductBrief | null;
}

export interface ApiStoryLenderBrief {
  _id: string;
  name: string;
  email: string;
}

export interface ApiStoryListItem {
  _id: string;
  lender: ApiStoryLenderBrief;
  title: string;
  description: string;
  cover_image: string;
  items: ApiStoryItem[];
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface ApiStoriesPayload {
  stories: ApiStoryListItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalStories: number;
}

export interface StoriesApiResponse {
  success: boolean;
  message: string;
  data: ApiStoriesPayload;
}

// Story detail types
export interface ApiStoryDetailProduct {
  _id: string;
  lender: string;
  name: string;
  description: string;
  brand: string;
  size?: string[];
  images: string[];
  cover_image: string;
  category: string;
  rating?: number;
  rating_count?: number;
}

export interface ApiStoryDetailItem {
  product: ApiStoryDetailProduct | null;
}

export interface ApiStoryDetail {
  _id: string;
  lender: ApiStoryLenderBrief;
  title: string;
  description: string;
  cover_image: string;
  items: ApiStoryDetailItem[];
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface StoryDetailPayload {
  story: ApiStoryDetail;
}

export interface StoryDetailApiResponse {
  success: boolean;
  message: string;
  data: StoryDetailPayload;
}

// Settings Types
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
}

export interface MetaTitle {
  title?: string;
  description?: string;
  keyword?: string;
}

export interface SettingsData {
  _id: string;
  title: string;
  description: string;
  email: string;
  website_url: string;
  logo: string;
  favicon: string;
  social_links: SocialLinks;
  meta_title: MetaTitle;
  mete_title?: MetaTitle;
  notification_banner?: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface SettingsApiResponse {
  success: boolean;
  message: string;
  data: SettingsData;
}

// Notification Types
export interface NotificationMetadata {
  currency?: string;
  role?: string;
  priority?: string;
  category?: string;
  tags?: string[];
  transactionId?: string;
  amount?: number;
  actionUrl?: string;
  orderId?: {
    _id: string;
    order_number: string;
    status: string;
  };
  productId?: {
    _id: string;
    name: string;
    cover_image: string;
  };
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  delivered: boolean;
  pushSent: boolean;
  emailSent: boolean;
  metadata?: NotificationMetadata;
  created_at: string;
  updated_at: string;
  readAt?: string;
  __v: number;
}

export interface NotificationPagination {
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationsPayload {
  notifications: Notification[];
  pagination: NotificationPagination;
  unreadCount: number;
}

export interface NotificationsApiResponse {
  success: boolean;
  message: string;
  data: NotificationsPayload;
}
// Support Ticket Types
export interface TicketOtherParty {
  _id: string;
  name: string;
  email: string;
}

export interface TicketProduct {
  _id: string;
  name: string;
  cover_image: string;
}

export interface TicketMessage {
  _id: string;
  text: string;
  senderType: string;
  created_at: string;
  attachments?: any[];
}

export interface SupportTicket {
  _id: string;
  user: string;
  creator_role: string;
  other_party: TicketOtherParty | null;
  product: TicketProduct | null;
  subject: string;
  description: string;
  category: string;
  support_image: string[];
  status: string;
  order: string | null;
  disputed: boolean;
  decision: string | null;
  decision_note: string | null;
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
  chat?: string | null;
  support_slug_id?: string;
  lender?: TicketOtherParty;
}

export interface SupportPagination {
  total: number;
  limit: number;
  page: number;
  pages: number;
}

export interface SupportTicketData {
  tickets: SupportTicket[];
  pagination: SupportPagination;
}

export interface SupportTicketApiResponse {
  success: boolean;
  message: string;
  data: SupportTicketData;
}

// Chat Types
export interface ChatParticipant {
  _id: string;
  name: string;
  role: string;
  profile_image: string;
}

export interface ChatParticipants {
  renter?: ChatParticipant;
  lender?: ChatParticipant;
  admin?: ChatParticipant;
  support?: ChatParticipant;
  [key: string]: ChatParticipant | undefined;
}

export interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  delivered: boolean;
  delivered_at: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
  status?: "sending" | "sent" | "error";
  tempId?: string;
  attachments?: any[];
}

export interface ChatData {
  participants: ChatParticipants;
  product: TicketProduct;
  chatId: string;
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ChatMessagesApiResponse {
  success: boolean;
  message: string;
  data: ChatData;
}

// How It Works Types
export interface HowItWorksStep {
  title: string;
  description: string;
  icon: string;
  order: number;
  _id: string;
}

export interface HowItWorksData {
  _id: string;
  headline: string;
  hero_image: string;
  primary_cta_label: string;
  primary_cta_link: string;
  section_title: string;
  renter_steps: HowItWorksStep[];
  lender_steps: HowItWorksStep[];
  sub_headline: string;
  supporting_paragraph: string;
  updated_at: string;
  created_at: string;
  status: string;
  is_current: boolean;
  published_at: string;
  version: number;
}

export interface HowItWorksApiResponse {
  success: boolean;
  message: string;
  data: HowItWorksData;
}

// Newsletter Types
export interface NewsletterRequest {
  email: string;
}

export interface NewsletterApiResponse {
  success: boolean;
  message: string;
}
