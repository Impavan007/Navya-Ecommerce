"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "../../components/Breadcrumb";
import ProductCard from "../../components/ProductCard";
import { lenderApiService } from "../../services/api/Lender";
import type { LenderProductsResponse, LenderProduct } from "../../types/lender";
import { ShimmerWrapper, ShimmerProductGrid, ShimmerProductItem, ShimmerLenderPage } from "../../components/Shimmer";
import { StarIcon, TopLenderIcon } from "../../icons/icons";
import { Slider } from "@mui/material";

// Define filter types
interface FilterState {
  priceRange: { min: number | null; max: number | null };
  selectedSizes: string[];
  sort: string;
  page: number;
  limit: number;
  rentalDays: number;
}

export default function LenderPage() {
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const slug = (routeParams as { slug: string }).slug;

  const [lenderData, setLenderData] = useState<LenderProductsResponse | null>(null);
  const [products, setProducts] = useState<LenderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 12,
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
  const [copied, setCopied] = useState(false);

  // Filter states - initially empty
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: null, max: null },
    selectedSizes: [],
    sort: "newest",
    page: 1,
    limit: 12,
    rentalDays: 4
  });

  // Toggles state
  const [toggles, setToggles] = useState({
    availableToRent: false,
    managedStock: true,
    topLenders: false
  });

  // Sidebar Sections Expand/Collapse State
  const [openSections, setOpenSections] = useState({
    price: true,
    size: true,
    rentalPeriod: true,
    availability: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // 0 = Sunday, 1 = Monday. we want 0 = Monday, 6 = Sunday for grid alignment
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const offsetMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const isDateEqual = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  const isBetween = (date: Date, start: Date, end: Date) => {
    return date > start && date < end;
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      // Start new selection
      setSelectedRange({ start: clickedDate, end: null });
    } else {
      // Complete selection
      if (clickedDate < selectedRange.start) {
        // If clicked before start, make it the new start
        setSelectedRange({ start: clickedDate, end: null });
      } else if (isDateEqual(clickedDate, selectedRange.start)) {
        // Clicked same date, do nothing or toggle? Let's just keep start
      } else {
        setSelectedRange(prev => ({ ...prev, end: clickedDate }));
      }
    }
  };

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

  const sizes2 = [
    'S', 'M', 'L', 'XL', '2XL', '3XL'
  ];

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

  // Fetch lender products with filters
  const fetchLenderProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const lenderId = slug;

      // Only include filters that have values
      const filterParams: any = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        rentalDays: filters.rentalDays,
      };

      // Add size filter only if sizes are selected
      if (filters.selectedSizes.length > 0) {
        filterParams.sizes = filters.selectedSizes.join(",");
      }

      // Add price filters only if values are provided
      if (filters.priceRange.min !== null) {
        filterParams.minPrice = filters.priceRange.min;
      }
      if (filters.priceRange.max !== null) {
        filterParams.maxPrice = filters.priceRange.max;
      }

      // Add calendar dates
      if (selectedRange.start) {
        filterParams.startDate = selectedRange.start.toISOString().split('T')[0];
      }
      if (selectedRange.end) {
        filterParams.endDate = selectedRange.end.toISOString().split('T')[0];
      }

      // Add availability
      filterParams.available = toggles.availableToRent;

      const response = await lenderApiService.getProductsByLender(lenderId, filterParams);

      if (response.success && response.data) {
        const responseData = response.data;

        setLenderData(responseData);
        setProducts(responseData.products);
        setPagination(responseData.pagination);

        // Update available sort options based on metadata if needed
        if (responseData.metadata?.sortBy) {
          // You can customize sort options based on metadata
        }
      } else {
        setError(response.message || "Failed to fetch lender products");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch lender products");
    } finally {
      setLoading(false);
    }
  }, [slug, filters, selectedRange, toggles]);

  // Fetch products when filters change
  useEffect(() => {
    fetchLenderProducts();
  }, [fetchLenderProducts]);

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

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max },
      page: 1
    }));
  };

  const goToPage = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: { min: null, max: null },
      selectedSizes: [],
      sort: "newest",
      page: 1,
      limit: 12,
      rentalDays: 4
    });
    setSelectedRange({ start: null, end: null });
    setToggles({
      availableToRent: false,
      managedStock: true,
      topLenders: false
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
    }
  };

  const transformProduct = (product: LenderProduct) => ({
    id: product._id,
    imageSrc: product.cover_image || "/assets/product-1.jpg",
    productName: product.name,
    price: `Rs.${product.rental_price_per_day ?? 0}`,
    sizes: Array.isArray(product.size) ? product.size.join(", ") : (product.size as string[] || []).join(", "),
    brand: product.brand,
    rating: product.rating,
    rating_count: (product as any).rating_count ?? 0,
  });

  // Check if any filters are active
  const hasActiveFilters = filters.selectedSizes.length > 0 ||
    filters.priceRange.min !== null ||
    filters.priceRange.max !== null;

  // Function to render star rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return (
              <StarIcon key={index} size={18} color="#3D1126" />
            );
          } else if (index === fullStars && hasHalfStar) {
            return (
              <StarIcon key={index} size={18} color="#3D1126" />
            );
          } else {
            return (
              <StarIcon key={index} size={18} color="#d1d1d1" />
            );
          }
        })}
      </div>
    );
  };

  if (loading && !lenderData) return <ShimmerLenderPage />;

  return (
    <div className="bg-[#FAF6F3] min-h-screen">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Lender Profile" }]} />

      {/* Lender Profile Header - Updated to match design */}
      <div className="w-full bg-[#F3D6DC]">
        <div className="mx-auto px-[20px] lg:px-[40px] py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
            {/* Lender Profile Image - Large Square/Rect */}
            <div className="shrink-0">
              <div className="w-[280px] h-[280px] bg-gray-200 overflow-hidden shadow-sm relative">
                {lenderData?.lender?.profileImage ? (
                  <Image
                    src={lenderData.lender.profileImage}
                    alt={lenderData.lender.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full  flex items-center justify-center bg-[#e5e5e5]">
                    <span className="text-4xl text-gray-400 font-['canela'] font-bold">
                      {lenderData?.lender?.name?.charAt(0) || 'L'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Lender Info */}
            <div className="flex-1 flex flex-col items-start pt-4">
              <div className="w-full flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <h1 className="font-['canela'] font-bold text-4xl lg:text-5xl text-[#3D1126] font-normal">
                    {lenderData?.lender?.name || "Lender Name"}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(lenderData?.lender?.stats?.averageRating || 0)}
                    <span className="font-poppins text-sm text-[#3D1126]">
                      ({lenderData?.lender?.stats?.totalReviews || 0}+)
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mt-2 text-[#3D1126]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#3D1126" />
                    </svg>
                    <span className="font-poppins text-sm">
                      {lenderData?.lender?.address || "Location not specified"}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="font-poppins text-[#6D6D6D] text-sm leading-relaxed max-w-2xl mt-4">
                    {lenderData?.lender?.bio || "No bio available."}
                  </p>

                  {/* Share Button */}
                  <div className="mt-8">
                    <button
                      onClick={handleShare}
                      className="bg-[#1A1A1A] text-white font-poppins text-sm px-6 py-3 rounded hover:bg-black transition-colors flex items-center gap-2"
                    >
                      {copied ? (
                        <svg width="15" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.5 11.7333C11.8667 11.7333 11.3 11.9833 10.8667 12.375L4.925 8.91667C4.96667 8.725 5 8.53333 5 8.33333C5 8.13333 4.96667 7.94167 4.925 7.75L10.8 4.325C11.25 4.74167 11.8417 5 12.5 5C13.8833 5 15 3.88333 15 2.5C15 1.11667 13.8833 0 12.5 0C11.1167 0 10 1.11667 10 2.5C10 2.7 10.0333 2.89167 10.075 3.08333L4.2 6.50833C3.75 6.09167 3.15833 5.83333 2.5 5.83333C1.11667 5.83333 0 6.95 0 8.33333C0 9.71667 1.11667 10.8333 2.5 10.8333C3.15833 10.8333 3.75 10.575 4.2 10.1583L10.1333 13.625C10.0917 13.8 10.0667 13.9833 10.0667 14.1667C10.0667 15.5083 11.1583 16.6 12.5 16.6C13.8417 16.6 14.9333 15.5083 14.9333 14.1667C14.9333 12.825 13.8417 11.7333 12.5 11.7333Z" fill="#F1F1F1" />
                        </svg>
                      )}
                      {copied ? "Copied!" : "Share Page"}
                    </button>
                  </div>
                </div>

                {/* Top Lender Badge */}
                {lenderData?.lender?.is_top_lender && (
                  <div className="bg-[#FDA018] px-3 py-1.5 flex items-center gap-2 rounded-sm">
                    <TopLenderIcon />
                    <span className="font-poppins text-xs font-medium text-[#3D1126]">Top Seller</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-[20px] lg:px-[40px] py-6 mx-auto w-full">
        <div className="flex items-center justify-between w-full mt-6">
          <p className="font-poppins font-medium text-[#647462] text-[16px] m-0">
            {loading ? "Loading..." : `${pagination.totalItems}+ Items`}
          </p>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden bg-white border border-[#3D1126] px-4 py-2 flex items-center gap-2 rounded hover:bg-gray-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M6 12H18M10 18H14" stroke="#3D1126" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-poppins font-medium text-[#3D1126] text-[14px]">
                Filter
              </span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="bg-white border border-[#3D1126] px-4 py-2 flex items-center gap-2 rounded hover:bg-gray-50 transition-colors min-w-[120px] justify-between"
              >
                <span className="font-poppins font-medium text-[#3D1126] text-[14px]">
                  {sortLabels[filters.sort] || "Newest"}
                </span>
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}>
                  <path d="M1 1L6 6L11 1" stroke="#3D1126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Sort Dropdown Menu */}
              <div className={`absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-[100] transition-all duration-200 ease-in-out origin-top ${showSortDropdown ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
                {availableSortOptions.map((sortOption) => (
                  <button
                    key={sortOption}
                    onClick={() => updateSort(sortOption)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${filters.sort === sortOption
                      ? 'bg-gray-100 text-[#3D1126] font-medium'
                      : 'text-gray-700'
                      }`}
                  >
                    {sortLabels[sortOption] || sortOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Filters + Products */}
      <div className="flex mb-4 flex-col lg:flex-row px-[20px] lg:px-[40px] gap-6 lg:gap-10 mx-auto w-full relative">
        {/* Mobile Filter Backdrop */}
        {showFilters && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-[1001]"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Sidebar Filters */}
        <aside
          className={`
              fixed lg:sticky top-0 lg:top-[24px] left-0 bottom-0 
              w-[280px] sm:w-[320px] lg:w-[360px] 
              bg-white lg:bg-transparent
              z-[1002] lg:z-20
              p-6 lg:p-0 lg:pr-8 lg:border-r lg:border-[#E5E5E5]
              overflow-y-auto lg:max-h-[calc(100vh-48px)] lg:self-start
              transition-transform duration-300 ease-in-out
              ${showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              lg:flex flex-col gap-8
            `}
        >
          {/* Mobile Header for Sidebar */}
          <div className="flex lg:hidden justify-between items-center mb-8">
            <h2 className="font-['canela'] font-bold text-2xl text-[#3D1126]">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#3D1126" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Rental Price Range */}
          <div className="border-t border-gray-200 pt-2">
            <div
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => toggleSection('price')}
            >
              <p className="font-poppins font-medium text-base text-[#3D1126]">Rental Price Range</p>
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${openSections.price ? 'rotate-180' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="#3D1126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.price ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pt-8 px-3">
                <div className="px-3 mb-5">
                  <Slider
                    value={[
                      filters.priceRange.min !== null ? filters.priceRange.min : 0,
                      filters.priceRange.max !== null ? filters.priceRange.max : 500
                    ]}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={500}
                    sx={{
                      color: '#3D1126',
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#3D1126',
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: '#3D1126',
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: '#E5E7EB',
                      },
                    }}
                  />
                </div>

                <div className="flex justify-between items-center gap-4">

                  <div className="flex-1 flex items-center ">
                    <span className="text-gray-900 text-sm mr-2">Min</span>

                    <div className="flex items-center border border-gray-300 px-2 py-2">
                      <span className="text-gray-900">Rs.</span>
                      <input
                        type="number"
                        value={filters.priceRange.min === null ? '' : filters.priceRange.min}
                        onChange={(e) => updatePriceRange('min', e.target.value)}
                        className="w-full bg-transparent outline-none text-gray-900 ml-1 font-poppins text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>


                  <div className="flex-1 flex items-center ">
                    <span className="text-gray-900 text-sm mr-2">Max</span>

                    <div className="flex items-center border border-gray-300 px-2 py-2">
                      <span className="text-gray-900">Rs.</span>
                      <input
                        type="number"
                        value={filters.priceRange.max === null ? '' : filters.priceRange.max}
                        onChange={(e) => updatePriceRange('max', e.target.value)}
                        className="w-full outline-none text-gray-900 ml-1 bg-transparent font-poppins text-sm"
                        placeholder="500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Size Filter */}
          <div className="border-t border-gray-200 pt-6">
            <div
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => toggleSection('size')}
            >
              <p className="font-poppins font-medium text-base text-[#3D1126]">Size</p>
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${openSections.size ? 'rotate-180' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="#3D1126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.size ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex text-[#3D1126] flex-wrap gap-2 pt-2">
                {[
                  "XS (UK/IN 6)", "S (UK/IN 8)", "M (UK/IN 10)", "L (UK/IN 12)", "XL (UK/IN 14)", "XXL (UK/IN 16)", "3XL (UK/IN 18)",
                  "4XL (UK/IN 20)", "5XL (UK/IN 22)"
                ].map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`font-poppins px-4 py-2 border text-sm transition-colors whitespace-nowrap ${filters.selectedSizes.includes(size)
                      ? "bg-[#F9F0F2] text-[#3D1126] border-[#3D1126]"
                      : "bg-transparent text-[#3D1126] border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rental Period Filter */}
          <div className="border-t border-gray-200 pt-6">
            <div
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => toggleSection('rentalPeriod')}
            >
              <p className="font-poppins font-medium text-base text-[#3D1126]">Rental Period</p>
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${openSections.rentalPeriod ? 'rotate-180' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="#3D1126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.rentalPeriod ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mt-9 px-1">
                <div className="px-3 mb-5">


                  <Slider
                    min={4}
                    max={30}
                    step={null}
                    marks={[
                      { value: 4, label: '4d' },
                      { value: 7, label: '1w' },
                      { value: 14, label: '2w' },
                      { value: 30, label: '1m' },
                    ]}
                    value={filters.rentalDays}
                    onChange={(e, val) => {
                      setFilters(prev => ({ ...prev, rentalDays: val as number, page: 1 }));
                    }}
                    valueLabelDisplay="auto"
                    sx={{
                      color: '#3D1126',
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#3D1126',
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: '#3D1126',
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: '#E5E7EB',
                      },
                      '& .MuiSlider-markLabel': {
                        fontFamily: 'Poppins',
                        fontSize: '11px',
                        color: '#3D1126'
                      }
                    }}
                  /></div>
              </div>

              <div className="flex items-center gap-4 mt-6 text-[13px] font-poppins text-gray-500 font-light pb-2">
                <span>Days</span>
                <div className="border border-gray-200 px-4 py-1.5 rounded-[4px] text-gray-900 min-w-[50px] text-center">
                  {filters.rentalDays}
                </div>
              </div>
            </div>
          </div>

          {/* Availability - Calendar */}
          <div className="border-t border-gray-200 pt-6">
            <div
              className="flex justify-between items-center mb-6 cursor-pointer"
              onClick={() => toggleSection('availability')}
            >
              <p className="font-poppins font-medium text-base text-[#3D1126]">Availability</p>
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${openSections.availability ? 'rotate-180' : ''}`}>
                <path d="M1 1L6 6L11 1" stroke="#3D1126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.availability ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="w-full bg-white pb-2 select-none pt-2">
                {/* Calendar Header */}
                <div className="flex pt-2 justify-between items-center mb-8 px-2">
                  <button onClick={() => offsetMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 13L1 7L7 1" stroke="#3D1126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="font-poppins font-bold text-lg text-[#3D1126]">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => offsetMonth(1)} className="p-1 hover:bg-gray-100 rounded">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 13L7 7L1 1" stroke="#3D1126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Days Headers */}
                <div className="grid grid-cols-7 mb-4 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <span key={d} className="text-xs text-[#6B7280] font-normal font-poppins">{d}</span>
                  ))}
                </div>

                {/* Dates Grid */}
                <div className="grid pt-4 grid-cols-7 gap-y-4 text-center text-[15px] font-poppins text-[#3D1126]" style={{ rowGap: '20px' }}>

                  {/* Empty slots for previous month */}
                  {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                    <span key={`empty-${i}`} className="pointer-events-none"></span>
                  ))}

                  {/* Days Generation */}
                  {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                    const day = i + 1;
                    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

                    const isStart = selectedRange.start && isDateEqual(currentDate, selectedRange.start);
                    const isEnd = selectedRange.end && isDateEqual(currentDate, selectedRange.end);
                    const isInRange = selectedRange.start && selectedRange.end && isBetween(currentDate, selectedRange.start, selectedRange.end);

                    // Logic for background connectors
                    const showRightConnector = isStart && selectedRange.end;
                    const showLeftConnector = isEnd && selectedRange.start;

                    return (
                      <div
                        key={day}
                        className={`relative flex items-center justify-center cursor-pointer ${isInRange ? 'bg-[#FAE9EC] -mx-[4px]' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        {/* Connectors for start/end points */}
                        {showRightConnector && (
                          <div className="w-[50%] h-full absolute right-0 bg-[#FAE9EC]" />
                        )}
                        {showLeftConnector && (
                          <div className="w-[50%] h-full absolute left-0 bg-[#FAE9EC]" />
                        )}

                        {/* Circle/Number */}
                        <span
                          className={`
                                      relative z-10 w-10 h-10 flex items-center justify-center font-medium transition-colors
                                      ${(isStart || isEnd) ? 'bg-[#1A1A1A] text-white' : ''}
                                  `}
                        >
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-6 border-t border-gray-200 pt-6">

            {/* Toggle 1 */}
            <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggle('availableToRent')}>
              <span className="font-poppins font-medium text-sm text-[#3D1126]">Available To Rent Now</span>
              <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${toggles.availableToRent ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white  absolute top-[4px] shadow-sm transition-all duration-200 ${toggles.availableToRent ? 'right-1' : 'left-1'}`} style={{ borderRadius: '50%' }}></div>
              </div>
            </div>

            {/* Toggle 2 */}
            {/* <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggle('managedStock')}>
                <span className="font-poppins font-medium text-sm text-[#3D1126]">Managed Stock</span>
                <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${toggles.managedStock ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white  absolute top-[4px] shadow-sm transition-all duration-200 ${toggles.managedStock ? 'right-1' : 'left-1'}`} style={{ borderRadius: '50%' }}></div>
                </div>
              </div> */}

            {/* Toggle 3 */}
            {/* <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggle('topLenders')}>
                <span className="font-poppins font-medium text-sm text-[#3D1126]">Top Lenders</span>
                <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${toggles.topLenders ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white  absolute top-[4px] shadow-sm transition-all duration-200 ${toggles.topLenders ? 'right-1' : 'left-1'}`} style={{ borderRadius: '50%' }}></div>
                </div>
              </div> */}

          </div>

        </aside>

        {/* Products Grid */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-poppins text-sm text-gray-600">Active filters:</span>
              {filters.selectedSizes.map(size => (
                <span
                  key={size}
                  className="bg-[#1A1A1A] text-white px-2 py-1 rounded text-xs flex items-center gap-1 font-poppins"
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
                <span className="bg-[#1A1A1A] text-white px-2 py-1 rounded text-xs flex items-center gap-1 font-poppins">
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
                className="font-poppins text-sm text-blue-600 hover:text-blue-800 ml-2"
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
            ) : error || products.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-gray-500 font-poppins text-lg">
                  {error
                    ? "Something went wrong while loading products."
                    : hasActiveFilters
                      ? "No products found matching your filters."
                      : "No products available from this lender."}
                </p>
                {(error || hasActiveFilters) && (
                  <button
                    onClick={error ? fetchLenderProducts : clearAllFilters}
                    className="mt-4 text-black underline font-poppins hover:text-gray-600 transition-colors"
                  >
                    {error ? "Try Again" : "Clear all filters"}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} {...transformProduct(product)} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-end mt-[80px] gap-2 font-poppins text-[13px]">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => goToPage(Math.max(1, pagination.currentPage - 1))}
                className={`px-4 py-2 border transition-colors ${!pagination.hasPrevPage ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
              >
                &lt; Back
              </button>
              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-[36px] h-[38px] flex items-center justify-center border transition-colors ${p === pagination.currentPage ? "bg-black text-white border-black" : "border-[#eee] bg-[#F3D6DC] text-[#1D2625] hover:border-[#ccc] hover:text-black"}`}>
                    {p}
                  </button>
                );
              })}
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => goToPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                className={`px-4 py-2 border transition-colors ${!pagination.hasNextPage ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
              >
                Next &gt;
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}