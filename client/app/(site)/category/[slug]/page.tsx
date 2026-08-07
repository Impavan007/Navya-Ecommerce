"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "../../components/Breadcrumb";
import ProtectedRoute from "../../components/ProtectedRoute";
import ProductCard from "../../components/ProductCard";
import FilterCalendar from "../../components/FilterCalendar";
import { categoriesApiService } from "../../services/api/categories";
import type { CategoryProduct } from "../../types/api";
import { ShimmerWrapper, ShimmerProductGrid, ShimmerProductItem } from "../../components/Shimmer";

// Define filter types
interface FilterState {
  priceRange: { min: number | null; max: number | null };
  selectedSizes: string[];
  sort: string;
  page: number;
  limit: number;
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponseData {
  products: CategoryProduct[];
  pagination: PaginationInfo;
  availableSortOptions: string[];
}

export default function CategoryPage() {
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const slug = (routeParams as { slug: string }).slug;

  const categoryTitle = searchParams.get("title") || "Category";

  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [availableSortOptions, setAvailableSortOptions] = useState<string[]>([
    "newest",
    "oldest",
    "priceLowToHigh",
    "priceHighToLow",
    "nameAZ",
    "nameZA",
    "rating"
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const defaultFilters: FilterState = {
    priceRange: { min: null, max: null },
    selectedSizes: [],
    sort: "newest",
    page: 1,
    limit: 12
  };

  // Filter states - initially empty
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);

  const sizes = [
    "XS (UK/IN 6)",
    "S (UK/IN 8)",
    "M (UK/IN 10)",
    "L (UK/IN 12)",
    "XL (UK/IN 14)",
    "XXL (UK/IN 16)",
    "3XL (UK/IN 18)",
    "4XL (UK/IN 20)",
    "5XL (UK/IN 22)",
  ];

  // const sizes2 = [
  //   'S', 'M', 'L', 'XL', '2XL', '3XL'
  // ];

  // Map sort values to display labels
  const sortLabels: { [key: string]: string } = {
    "newest": "Newest",
    "oldest": "Oldest",
    "priceLowToHigh": "Price: Low to High",
    "priceHighToLow": "Price: High to Low",
    "nameAZ": "Name: A to Z",
    "nameZA": "Name: Z to A",
    "rating": "Rating"
  };

  // Fetch products with filters
  const fetchCategoryProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const subId = searchParams.get("sub");
      const categoryId = slug;

      // Only include filters that have values
      const filterParams: any = {
        page: appliedFilters.page,
        limit: appliedFilters.limit,
        sort: appliedFilters.sort,
      };

      // Add size filter only if sizes are selected
      if (appliedFilters.selectedSizes.length > 0) {
        filterParams.sizes = appliedFilters.selectedSizes;
      }

      // Add price filters only if values are provided
      if (appliedFilters.priceRange.min !== null) {
        filterParams.minPrice = appliedFilters.priceRange.min;
      }
      if (appliedFilters.priceRange.max !== null) {
        filterParams.maxPrice = appliedFilters.priceRange.max;
      }

      let response;
      if (subId) {
        response = await categoriesApiService.getProductsBySubCategory(subId, filterParams);
      } else {
        response = await categoriesApiService.getProductsByCategory(categoryId, filterParams);
      }

      if (response.success && response.data) {
        const responseData = response.data as ApiResponseData;

        // Handle both response formats for backward compatibility
        if (responseData.products && responseData.pagination) {
          // New format with pagination and sort options
          setProducts(responseData.products);
          setPagination(responseData.pagination);
          if (responseData.availableSortOptions) {
            setAvailableSortOptions(responseData.availableSortOptions);
          }
        } else {
          // Old format - fallback
          const list = Array.isArray(responseData)
            ? responseData
            : (responseData as any)?.products || responseData;
          setProducts(list as any);

          // Create pagination info from fallback data
          setPagination({
            totalItems: list.length,
            totalPages: 1,
            currentPage: 1,
            limit: appliedFilters.limit,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
      } else {
        setError(response.message || "Failed to fetch products");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [slug, searchParams, appliedFilters]);

  // Fetch products when filters change
  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  // Handler functions
  const toggleSize = (size: string) => {
    setFilters(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size)
        ? prev.selectedSizes.filter(s => s !== size)
        : [...prev.selectedSizes, size],
      page: 1 // Reset to first page when filters change
    }));
  };

  const updatePriceRange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : Number(value);
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: numValue
      },
      page: 1
    }));
  };

  const updateSort = (sort: string) => {
    setFilters(prev => ({
      ...prev,
      sort,
      page: 1
    }));
    setShowSortDropdown(false);
  };

  const goToPage = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    setAppliedFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const applyFilters = () => {
    // Always reset to first page when applying new filters
    setAppliedFilters({
      ...filters,
      page: 1,
    });
    setFilters(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const transformProduct = (product: any) => ({
    id: product._id || product.id,
    imageSrc:
      product.cover_image || (product.images && product.images[0]) || "/assets/product-1.jpg",
    productName: product.name,
    price: `Rs.${product.rental_price_per_day ?? product.rentalPrice ?? 0}`,
    sizes: Array.isArray(product.size) ? product.size.join(", ") : (product.size || []).join(", "),
    brand: product.brand,
    rating: product.rating,
    rating_count: product.rating_count,
  });

  // Check if any filters are active
  const hasActiveFilters = filters.selectedSizes.length > 0 ||
    filters.priceRange.min !== null ||
    filters.priceRange.max !== null;

  return (
    // <ProtectedRoute
    //   fallback={
    //     <div className="text-center p-8">
    //       <h2 className="text-2xl font-bold text-white mb-4">
    //         Sign in to browse categories
    //       </h2>
    //       <p className="text-white/80">
    //         Please sign in to explore our product categories.
    //       </p>
    //     </div>
    //   }
    // >
    <div className="w-full">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: categoryTitle }]} />

      {/* Page Header */}
      <div className="px-4 sm:px-6 lg:px-16 py-6 lg:py-10 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col gap-4 sm:gap-6">
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-[48px] font-normal text-black">
            {categoryTitle}
          </h1>
          <p className="font-poppins text-sm sm:text-base lg:text-[16px] text-black/90">
            Discover stunning wedding guest outfits to rent at Navyaa! Choose from elegant
            dresses, stylish jumpsuits, and tailored suits for your next event. Be the
            best-dressed guest without the high price tag.
          </p>
        </div>

        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full mt-6">
          <p className="capitalize font-poppins font-medium leading-[24px] not-italic relative shrink-0 text-[#647462] text-[16px] m-0">
            {loading ? "Loading..." : `${pagination.totalItems}+ Results`}
          </p>

          {/* Mobile Filter Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-[#1A1A1A] box-border flex gap-2 items-center justify-center px-4 py-2 hover:bg-[#1a1a1a] transition-colors rounded"
            >
              <span className="font-poppins font-medium text-white text-sm">
                Filters
              </span>
              {/* <Image
                  src="/assets/filter-icon.svg"
                  alt="Filter"
                  width={16}
                  height={16}
                /> */}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="bg-[#1A1A1A] box-border content-stretch flex gap-[8px] items-center justify-center pl-[16px] pr-[12px] py-[12px] relative shrink-0 w-[140px] hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="font-poppins font-medium leading-[20px] not-italic relative shrink-0 text-[#FAF6F3] text-[14px] text-nowrap whitespace-pre">
                  {sortLabels[filters.sort] || "Newest"}
                </span>
                {/* <div className="overflow-clip relative shrink-0 size-[20px]">
                    <Image
                      src="/assets/arrow-down.svg"
                      alt="Sort"
                      width={20}
                      height={20}
                      className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
                    />
                  </div> */}
              </button>

              {/* Sort Dropdown Menu */}
              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {availableSortOptions.map((sortOption) => (
                    <button
                      key={sortOption}
                      onClick={() => updateSort(sortOption)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${filters.sort === sortOption
                          ? 'bg-gray-100 text-[#3D1126] font-medium'
                          : 'text-gray-700'
                        } first:rounded-t-lg last:rounded-b-lg`}
                    >
                      {sortLabels[sortOption] || sortOption}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Filters + Products */}
      <div className="flex flex-col lg:flex-row px-4 sm:px-6 lg:px-16 gap-6 lg:gap-8 max-w-[1440px] mx-auto w-full">
        {/* Sidebar Filters - Hidden on mobile by default */}
        <aside className={`w-full lg:w-[373px] flex-shrink-0 flex flex-col gap-6 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
          <div className="flex flex-col gap-6 bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none">
            {/* Filter Header for Mobile */}
            <div className="flex justify-between items-center lg:hidden">
              <h3 className="font-poppins font-semibold text-lg">Filters</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Rental Price */}
            <div>
              <p className="font-medium text-sm sm:text-base text-black mb-2">Rental price range</p>
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm">Min</p>
                  <input
                    type="number"
                    value={filters.priceRange.min === null ? '' : filters.priceRange.min}
                    onChange={(e) => updatePriceRange('min', e.target.value)}
                    placeholder="Min"
                    className="border border-gray-400 px-2 py-1 rounded w-16 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm">Max</p>
                  <input
                    type="number"
                    value={filters.priceRange.max === null ? '' : filters.priceRange.max}
                    onChange={(e) => updatePriceRange('max', e.target.value)}
                    placeholder="Max"
                    className="border border-gray-400 px-2 py-1 rounded w-16 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Size Filter - Indian Sizes */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-sm sm:text-base text-black">Indian Sizes</p>
                {filters.selectedSizes.length > 0 && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedSizes: [] }))}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-2 py-1 border rounded text-xs sm:text-sm ${filters.selectedSizes.includes(size)
                        ? "bg-[#1A1A1A] text-white border-[#3D1126]"
                        : "bg-transparent text-gray-700 border-gray-400"
                      } transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter - Standard Sizes */}
            {/* <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-sm sm:text-base text-black">Standard Sizes</p>
                  {filters.selectedSizes.length > 0 && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, selectedSizes: [] }))}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes2.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-2 py-1 border rounded text-xs sm:text-sm ${
                        filters.selectedSizes.includes(size)
                          ? "bg-[#1A1A1A] text-white border-[#3D1126]"
                          : "bg-transparent text-gray-700 border-gray-400"
                      } transition-colors`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div> */}

            {/* Apply Filters Button for Mobile */}
            <button
              onClick={applyFilters}
              className="lg:hidden bg-[#1A1A1A] text-white py-2 px-4 rounded hover:bg-[#1a1a1a] transition-colors"
            >
              Apply Filters
            </button>

            {/* Apply Filters Desktop */}
            <button
              onClick={applyFilters}
              className="hidden lg:block bg-[#1A1A1A] text-white py-2 px-4 rounded hover:bg-[#1a1a1a] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.selectedSizes.map(size => (
                <span
                  key={size}
                  className="bg-[#1A1A1A] text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  {size}
                  <button
                    onClick={() => toggleSize(size)}
                    className="text-xs hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              ))}
              {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
                <span className="bg-[#1A1A1A] text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  Rs.{filters.priceRange.min || 0} - Rs.{filters.priceRange.max || '∞'}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, priceRange: { min: null, max: null } }))}
                    className="text-xs hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          <div className="w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ShimmerProductItem key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
                <p>{error}</p>
                <button
                  onClick={fetchCategoryProducts}
                  className="mt-4 px-4 py-2 bg-[#1A1A1A] text-white rounded hover:bg-[#1a1a1a] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-800">
                {appliedFilters.selectedSizes.length > 0 || appliedFilters.priceRange.min !== null || appliedFilters.priceRange.max !== null
                  ? "No products found matching your filters"
                  : "No products available in this category"
                }
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                   <ProductCard key={product._id || (product as any).id} {...transformProduct(product as any)} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination - Using API response data */}

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`p-2 border rounded ${!pagination.hasPrevPage
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-200'
                }`}
            >
              <Image src="/assets/arrow-right.svg" alt="Previous" width={24} height={24} className="rotate-180" />
            </button>
            <p className="text-sm sm:text-base text-gray-800">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <button
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`p-2 border rounded ${!pagination.hasNextPage
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-200'
                }`}
            >
              <Image src="/assets/arrow-right.svg" alt="Next" width={24} height={24} />
            </button>
          </div>

        </section>
      </div>


      {/* <Footer /> */}
    </div>
    // </ProtectedRoute>
  );
}
