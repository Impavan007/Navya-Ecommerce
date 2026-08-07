export interface LenderStats {
  totalProducts: number;
  activeProducts: number;
  totalReviews: number;
  averageRating: number;
  reviewerCount: number;
}

export interface Lender {
  id: string;
  name: string;
  email: string;
  address: string;
  profileImage: string;
  joinDate: string;
  is_top_lender: boolean;
  stats: LenderStats;
  bio?: string;
}

export interface LenderProduct {
  _id: string;
  name: string;
  cover_image: string;
  brand: string;
  category: string;
  categoryName: string;
  subCategory: string;
  rental_price_per_day: number;
  rentFrom: number;
  rating: number;
  size: string[];
  cleaning_fee: number;
  security_deposit: number;
  occasion: string;
  status: string;
  isFeatured: boolean;
  created_at: string;
  availability: {
    isAvailable: boolean;
  };
}

export interface LenderPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LenderMetadata {
  lenderId: string;
  totalActiveProducts: number;
  displayMode: string;
  sortBy: string;
  sortOrder: string;
  appliedFilters: {
    minPrice: number | null;
    maxPrice: number | null;
    size: string | null;
    startDate: string | null;
    endDate: string | null;
    dateRange: string | null;
    isAvailable: boolean;
  };
}

export interface LenderProductsResponse {
  lender: Lender;
  products: LenderProduct[];
  pagination: LenderPagination;
  metadata: LenderMetadata;
}