"use client";

import Breadcrumb from "../components/Breadcrumb";
import ProtectedRoute from "../components/ProtectedRoute";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { bookingsApiService } from "../services/api/bookings";
import type { RenterBookingItem } from "../types/api";
import { ShimmerBookingCard } from "../components/Shimmer";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<RenterBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(),
  );
  const [selectedTimeKeys, setSelectedTimeKeys] = useState<Set<string>>(
    new Set(),
  );
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Map UI status labels to backend status values
  const uiToApiStatus: Record<string, string> = {
    "On the way": "Shipped",
    Delivered: "Delivered",
    Cancelled: "Cancelled",
    Returned: "Returned",
  };

  const fetchBookings = async (opts?: {
    page?: number;
    overrideSearch?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build backend params
      const statusParam = Array.from(selectedStatuses)
        .map((s) => uiToApiStatus[s] || s)
        .join(",");
      const yearParam = Array.from(selectedTimeKeys)[0] || "";
      const pageNum = opts?.page || currentPage;

      const currentSearch = opts?.overrideSearch !== undefined ? opts.overrideSearch : searchQuery;

      const resp = await bookingsApiService.getRenterBookingsWithParams({
        status: statusParam || undefined,
        year: yearParam || undefined,
        search: currentSearch.trim() || undefined,
        page: pageNum,
        limit: pageSize,
      });

      if (resp.success && resp.data) {
        const list = resp.data.bookings || [];
        setBookings(list);

        // Use pagination data directly from API response
        if (resp.data.pagination) {
          const paginationInfo: PaginationInfo = {
            currentPage: resp.data.pagination.currentPage,
            totalPages: resp.data.pagination.totalPages,
            totalBookings: resp.data.pagination.totalBookings,
            pageSize: resp.data.pagination.limit,
            hasNextPage: resp.data.pagination.hasNextPage,
            hasPrevPage: resp.data.pagination.hasPrevPage,
          };
          setPagination(paginationInfo);
        }
        setCurrentPage(pageNum);

        // Cache a lightweight mapping to help the review page if query params are missing
        try {
          const map: Record<string, { orderId: string; lenderId: string }> = {};
          for (const b of list) {
            if (b?.productId) {
              map[b.productId] = {
                orderId: (b as any).orderInternalId,
                lenderId: (b as any)?.lenderId,
              };
            }
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("bookingProductMap", JSON.stringify(map));
          }
        } catch { }
      } else {
        throw new Error(resp.message || "Failed to fetch bookings");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on filter changes (status/year)
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchBookings({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatuses, selectedTimeKeys]);

  const handleSearch = async () => {
    setCurrentPage(1); // Reset to first page on new search
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    await fetchBookings({ page: 1 });
  };

  const handleClearSearch = async () => {
    setSearchQuery("");
    setCurrentPage(1);
    await fetchBookings({ page: 1, overrideSearch: "" });
  };

  const handlePreviousPage = async () => {
    if (pagination && pagination.hasPrevPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const newPage = currentPage - 1;
      await fetchBookings({ page: newPage });
    }
  };

  const handleNextPage = async () => {
    if (pagination && pagination.hasNextPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const newPage = currentPage + 1;
      await fetchBookings({ page: newPage });
    }
  };

  // Server-filtered list used directly
  const filteredBookings = bookings;

  // Toggle handlers
  const toggleStatus = (label: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set<string>();
      if (!prev.has(label)) {
        next.add(label);
      }
      return next;
    });
  };

  const toggleTime = (key: string) => {
    setSelectedTimeKeys((prev) => {
      const next = new Set<string>();
      if (!prev.has(key)) {
        next.add(key);
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatuses(new Set());
    setSelectedTimeKeys(new Set());
    setCurrentPage(1);
    fetchBookings({ page: 1, overrideSearch: "" });
  };

  const isFilterActive = searchQuery !== "" || selectedStatuses.size > 0 || selectedTimeKeys.size > 0;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "requested":
        return "text-blue-600"; // Blue for requested/pending
      case "payment pending":
        return "text-orange-500"; // Orange for payment pending
      case "confirmed":
        return "text-green-600"; // Green for confirmed
      case "shipped":
        return "text-teal-600"; // Teal for shipped
      case "delivered":
        return "text-purple-600"; // Purple for delivered
      case "active":
        return "text-green-500"; // Bright green for active
      case "return":
        return "text-indigo-600"; // Indigo for return
      case "completed":
        return "text-gray-600"; // Gray for completed
      case "cancelled":
        return "text-red-600"; // Red for cancelled
      case "refunded":
        return "text-yellow-600"; // Yellow for refunded
      case "disputed":
        return "text-red-500"; // Bright red for disputed
      default:
        return "text-gray-800"; // Default color
    }
  };
  ////
  return (
    <ProtectedRoute
      fallback={
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Sign in to view your orders
          </h2>
          <p className="text-white/80">
            Please sign in to access your order history.
          </p>
        </div>
      }
    >
      <div className="bg-[#FAF6F3] relative size-full overflow-x-hidden">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "My Orders" }]}
        />

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden p-4 border-b border-[#e5e5e5]">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-[#1d2625] text-white px-4 py-2  flex items-center gap-2 w-full justify-center"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4H14M4 8H12M6 12H10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex w-full px-[20px] mx-auto lg:px-[40px] py-3">
          {/* Sidebar Filters - Hidden on mobile, shown when toggled */}
          {(showFilters ||
            typeof window === "undefined" ||
            window.innerWidth >= 1024) && (
              <div className="bg-[#F3D6DC] h-auto lg:h-fit w-full lg:w-[180px] mt-0 lg:mt-[99px] fixed lg:static top-0 left-0 z-40 lg:z-auto overflow-y-auto lg:overflow-visible pb-[20px]">
                {/* Mobile Close Button */}
                <div className="lg:hidden flex justify-between items-center p-4">
                  <p className="capitalize font-poppins font-medium leading-[24px] text-[16px] text-[#3D1126]">
                    Filters
                  </p>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-[#3D1126] p-2"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 5L5 15M5 5L15 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="hidden lg:flex items-center px-[12px] py-[8px] h-[40px] border-b border-[#F3D6DC] mb-[10px]">
                  <p className="capitalize font-poppins font-medium leading-[24px] text-[16px] text-[#3D1126]">
                    Filters
                  </p>
                </div>

                <div className="flex flex-col gap-[20px] px-[20px] py-[10px] ">
                  {/* Booking Status Filter */}
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-poppins font-medium leading-[20px] text-[14px] text-[#3D1126]">
                      Order status:
                    </p>
                    <div className="flex flex-col">
                      {["On the way", "Delivered", "Cancelled", "Returned"].map(
                        (label) => {
                          const checked = selectedStatuses.has(label);
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => toggleStatus(label)}
                              className="flex items-center gap-[8px] h-[32px] cursor-pointer"
                            >
                              <div className="w-[16px] h-[16px] bg-[#FAF6F3] border border-[#d1d1d1] flex items-center justify-center flex-none rounded-full">
                                {checked && (
                                  <div className="w-[10px] h-[10px] bg-[#1A1A1A] rounded-full" />
                                )}
                              </div>
                              <p className="font-poppins text-[12px] leading-[16px] text-[#3D1126] flex-none">
                                {label}
                              </p>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Booking Time Filter */}
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-poppins font-medium leading-[20px] text-[14px] text-[#3D1126]">
                      Order Time:
                    </p>
                    <div className="flex flex-col">
                      {[
                        { key: "last30", label: "last 30 days" },
                        ...Array.from({ length: 4 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return { key: year.toString(), label: year.toString() };
                        }),
                        { key: "older", label: "older" },
                      ].map((time) => {
                        const checked = selectedTimeKeys.has(time.key);
                        return (
                          <button
                            key={time.key}
                            type="button"
                            onClick={() => toggleTime(time.key)}
                            className="flex items-center gap-[8px] h-[32px] cursor-pointer"
                          >
                            <div className="w-[16px] h-[16px] bg-[#FAF6F3] border border-[#d1d1d1] flex items-center justify-center flex-none rounded-full">
                              {checked && (
                                <div className="w-[10px] h-[10px] bg-[#1A1A1A] rounded-full" />
                              )}
                            </div>
                            <p className="font-poppins text-[12px] leading-[16px] text-[#3D1126] flex-none">
                              {time.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile Apply Filters Button */}
                <div className="lg:hidden mt-6 p-4 border-t border-[#6d6d6d]">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="bg-[#1d2625] text-[#FAF6F3] w-full py-3  font-poppins font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-[20px] mt-0 lg:mt-[20px] w-full ">
            {/* Search Box */}
            <div className="w-full lg:w-[353px] lg:ml-auto mb-4 lg:mb-[20px]">
              <div className="flex items-center gap-2 p-1 border-b border-[#a8a8a8]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    debounceTimerRef.current = setTimeout(() => {
                      setCurrentPage(1);
                      fetchBookings({ page: 1, overrideSearch: val });
                    }, 500);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                      handleSearch();
                    }
                  }}
                   placeholder="Search the orders here"
                  className="bg-transparent outline-none border-none font-poppins text-[15px] leading-[24px] text-[#3D1126] placeholder-[#a8a8a8] flex-1 w-full"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="text-[#a8a8a8] p-1 flex items-center justify-center"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Booking Cards */}
            <div className="space-y-4 lg:space-y-[20px] ">
              {isLoading ? (
                <>
                  {[...Array(10)].map((_, s) => (
                    <ShimmerBookingCard key={s} />
                  ))}
                </>
              ) : (
                <>
                  {!error && filteredBookings.length === 0 && (
                    <div className="text-[#6d6d6d] font-poppins text-center p-4 flex flex-col items-center gap-4 py-12">
                      <p>No orders found.</p>
                      {isFilterActive && (
                        <button
                          onClick={clearAllFilters}
                          className="bg-[#1d2625] text-[#FAF6F3] px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-all"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}
                  {filteredBookings.map((booking, idx) => (
                    <div
                      key={`booking-${idx}`}
                      className="border-[#6D6D6D] border-[0.25px] p-[16px] md:p-[20px] rounded-[4px] cursor-pointer hover:bg-gray-50 transition-colors flex flex-col gap-[12px] w-full"
                      onClick={() =>
                        router.push(`/bookings/${booking.orderInternalId}`)
                      }
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-[16px] md:gap-[24px] w-full">
                        {/* Product Image and Details Group */}
                        <div className="flex flex-row items-center gap-[16px] md:gap-[20px] flex-1 w-full lg:w-auto">
                          {/* Product Image */}
                          <div className="relative flex-shrink-0 w-[60px] h-[60px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px] overflow-hidden rounded-[4px]">
                            <Image
                              src={
                                booking.productImage
                                  ? booking.productImage
                                  : "/assets/product-1.jpg"
                              }
                              alt={booking.productName}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 60px, (max-width: 1024px) 80px, 100px"
                              unoptimized
                            />
                          </div>

                          {/* Product Details Group */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-[12px] md:gap-[30px] lg:gap-[40px] flex-1 min-w-0">
                            {/* Product Info */}
                            <div className="flex flex-col gap-[2px] md:gap-[4px] min-w-0 sm:flex-1 md:max-w-[200px] lg:max-w-[240px]">
                              <h3 className="capitalize font-poppins font-medium text-[14px] md:text-[16px] text-[#3D1126] truncate">
                                {booking.productName}
                              </h3>
                              <p className="font-poppins font-normal text-[13px] md:text-[14px] text-black/60">
                                Size: {booking.size}
                              </p>
                            </div>

                            {/* Price and Date */}
                            <div className="min-w-0 sm:flex-1 md:max-w-[220px]">
                              <p className="font-poppins font-normal text-[14px] md:text-[16px] text-black">
                                From Rs.{booking.price} / {booking.rentalPeriod}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status and Review */}
                        <div className="flex flex-col gap-[6px] md:gap-[8px] w-full lg:w-[220px] pt-3 lg:pt-0 border-t lg:border-t-0 border-[#eee] lg:border-none lg:items-end">
                          <p className="font-poppins font-normal text-[14px] md:text-[16px] text-black lg:text-right">
                            {booking.status === "Shipped"
                              ? `Shipped on ${new Date(booking.createdAt).toLocaleDateString()}`
                              : booking.status === "Delivered"
                                ? `Delivered on ${new Date(booking.createdAt).toLocaleDateString()}`
                                : booking.status === "Cancelled"
                                  ? `Cancelled on ${new Date(booking.createdAt).toLocaleDateString()}`
                                  : booking.status === "Returned"
                                    ? `Returned on ${new Date(booking.createdAt).toLocaleDateString()}`
                                    : booking.status}
                          </p>
                          <p className="font-poppins font-normal text-[11px] md:text-[12px] text-[#3D1126] lg:text-right">
                            {booking.status === "Cancelled" ? "Booking was cancelled." : "Your item has been delivered."}
                          </p>
                          {booking.reviewAvailable &&
                            booking.status !== "Cancelled" && (
                              <Link
                                href={`/review/${encodeURIComponent((booking as any).productId || "")}?order=${encodeURIComponent((booking as any).orderInternalId || "")}&lender=${encodeURIComponent((booking as any)?.lenderId || "")}&name=${encodeURIComponent(booking.productName || "")}&image=${encodeURIComponent(booking.productImage || "")}&size=${encodeURIComponent(booking.size || "")}&price=${encodeURIComponent("Rs." + String(booking.price ?? ""))}&period=${encodeURIComponent(booking.rentalPeriod || "")}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-[4px] border-b-[0.25px] border-[#6D6D6D] w-fit h-[16px] lg:ml-auto"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8 1L9.09 5.26L13 5.27L9.95 8.14L11.09 12.4L8 9.53L4.91 12.4L6.05 8.14L3 5.27L6.91 5.26L8 1Z"
                                    fill="#000000"
                                  />
                                </svg>
                                <span className="font-poppins font-medium text-[11px] md:text-[12px] text-black">
                                  Rate & review
                                </span>
                              </Link>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {!isLoading && error && (
                <div className="text-red-500 font-poppins text-center p-4">
                  {error}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!isLoading && filteredBookings.length > 0 && pagination && pagination.totalPages > 1 && (
              <div className="flex justify-end mt-[80px] gap-2 font-poppins text-[13px] w-full">
                <button
                  disabled={!pagination?.hasPrevPage}
                  onClick={handlePreviousPage}
                  className={`px-4 py-2 border transition-colors ${!pagination?.hasPrevPage ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
                >
                  &lt; Back
                </button>
                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const num = i + 1;
                  const isActive = num === currentPage;
                  return (
                    <button
                      key={num}
                      onClick={async () => {
                        await fetchBookings({ page: num });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-[36px] h-[38px] flex items-center justify-center border transition-colors ${isActive ? "bg-black text-white border-black" : "border-[#eee] bg-[#F3D6DC] text-[#1D2625] hover:border-[#ccc] hover:text-black"}`}>
                      {num}
                    </button>
                  );
                })}
                <button
                  disabled={!pagination?.hasNextPage}
                  onClick={handleNextPage}
                  className={`px-4 py-2 border transition-colors ${!pagination?.hasNextPage ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
                >
                  Next &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
