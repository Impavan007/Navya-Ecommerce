"use client";

import Breadcrumb from "../components/Breadcrumb";
import ProtectedRoute from "../components/ProtectedRoute";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { wishlistApiService } from "../services/api/wishlist";
import type { WishlistProduct } from "../types/api";
import toast from "react-hot-toast";
import { ShimmerWrapper, ShimmerWishlistItems, ShimmerSearchBar, ShimmerPagination } from "../components/Shimmer";
import { useGlobalLoading } from "../contexts/LoadingContext";
import DeleteConfirmationPopup from "../components/DeleteConfirmationPopup";
import Link from "next/link";

export default function WishlistsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletePopup, setDeletePopup] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({ isOpen: false, productId: null, productName: "" });

  const { isLoading, withLoading } = useGlobalLoading();
  const itemsPerPage = 5;

  // Memoize fetch function to prevent unnecessary re-renders
  const fetchWishlistData = useCallback(async () => {
    try {
      setError(null);
      const response = await withLoading("wishlist", async () => {
        return await wishlistApiService.getAllWishlists();
      });

      if (response.success && response.data) {
        const allProducts: WishlistProduct[] = [];
        response.data.wishlists.forEach(wishlist => allProducts.push(...wishlist.products));
        setWishlistItems(allProducts);
      } else {
        setError(response.message || "Failed to fetch wishlist");
        toast.error(response.message || "Failed to fetch wishlist");
      }
    } catch (error: any) {
      console.error("Error fetching wishlist:", error);
      setError(error.message || "Failed to fetch wishlist");
      toast.error(error.message || "Failed to fetch wishlist");
    }
  }, [withLoading]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(wishlistItems);
    } else {
      const filtered = wishlistItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, wishlistItems]);

  const handleDeleteItem = (productId: string, productName: string) => {
    setDeletePopup({ isOpen: true, productId, productName });
  };

  const handleConfirmDelete = async () => {
    if (!deletePopup.productId) return;

    const productIdToDelete = deletePopup.productId;
    const productNameToDelete = deletePopup.productName;

    try {
      // Close popup immediately for better UX
      setDeletePopup({ isOpen: false, productId: null, productName: "" });

      const response = await withLoading(`delete-${productIdToDelete}`, async () => {
        return await wishlistApiService.removeFromWishlist(productIdToDelete);
      });

      if (response.success) {
        toast.success(response.message || "Item removed from wishlist");
        // Use functional update with the stored ID
        setWishlistItems(prev => prev.filter(item => item._id !== productIdToDelete));
      } else {
        toast.error(response.message || "Failed to remove item");
        // Refetch on failure to ensure sync
        await fetchWishlistData();
      }
    } catch (error: any) {
      console.error("Error removing item:", error);
      toast.error(error.message || "Failed to remove item");
      // Refetch on error to ensure sync
      await fetchWishlistData();
    }
  };

  const handleCloseDeletePopup = () => {
    if (!isLoading(`delete-${deletePopup.productId}`)) {
      setDeletePopup({ isOpen: false, productId: null, productName: "" });
    }
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <ProtectedRoute
      fallback={
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your wishlists</h2>
          <p className="text-white/80">Please sign in to access your saved items.</p>
        </div>
      }
    >
      <div className="w-full">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

        <div className=" mx-auto px-[20px] lg:px-[40px] py-6 flex flex-col gap-6">

          {/* Search Box */}
          <ShimmerWrapper isLoading={isLoading("wishlist")} shimmerComponent={<ShimmerSearchBar />}>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 w-full">
              <div className="flex flex-1 sm:flex-none border-b border-black border-solid gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search the bookings here...."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 font-poppins text-[14px] leading-[24px] text-[#a8a8a8] bg-transparent outline-none py-2 placeholder:text-[#a8a8a8] placeholder:text-[13px]"
                />
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none" className="text-[#a8a8a8]">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </ShimmerWrapper>

          {/* Wishlist Items */}
          <ShimmerWrapper isLoading={isLoading("wishlist")} shimmerComponent={<ShimmerWishlistItems count={5} />}>
            <div className="flex flex-col gap-4 w-full">
              {error ? (
                <div className="flex justify-center items-center py-8 text-red-600">{error}</div>
              ) : filteredItems.length === 0 ? (
                <div className="flex justify-center items-center py-8 text-[#3D1126]">
                  {searchQuery ? "No items found matching your search" : "No items in your wishlist"}
                </div>
              ) : (
                currentItems.map(item => (
                  <div key={item._id} className="border border-[#6D6D6D]  p-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

                    {/* Image - Updated for full image display */}
                    <div className="w-full h-[400px] sm:w-[80px] sm:h-[80px] relative flex-shrink-0 bg-white overflow-hidden">
                      <Image
                        src={item.images[0] || "/assets/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-fill"
                        sizes="(max-width: 640px) 100vw, 80px"
                        unoptimized
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center flex-1 gap-4 sm:gap-6 w-full">
                      <div className="flex flex-col gap-1 sm:w-[188px]">
                        <Link href={`/product/${item._id}`}>
                          <p className="capitalize font-medium text-[16px] leading-[24px] text-[#3D1126] hover:underline cursor-pointer">
                            {item.name}
                          </p>
                        </Link>
                        <p className="text-[16px] leading-[24px] text-black">Brand: {item.brand}</p>
                      </div>
                      <p className="text-[16px] leading-[24px] text-black whitespace-nowrap">From Rs.{item.rental_price_per_day} / Day</p>
                      <button
                        onClick={() => handleDeleteItem(item._id, item.name)}
                        disabled={isLoading(`delete-${item._id}`)}
                        className={`w-6 h-6 flex items-center justify-center transition-opacity ${isLoading(`delete-${item._id}`) ? "opacity-50 cursor-not-allowed" : "hover:opacity-70"
                          }`}
                      >
                        {isLoading(`delete-${item._id}`) ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ShimmerWrapper>

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="text-right text-[#3D1126] text-[14px]">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
            </div>
          )}

          <ShimmerWrapper isLoading={isLoading("wishlist")} shimmerComponent={<ShimmerPagination />}>
            {totalPages > 1 && (
              <div className="flex justify-end mt-4 gap-2 font-poppins text-[13px]">
                <button
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}
                  className={`px-4 py-2 border transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
                >
                  &lt; Back
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-[36px] h-[38px] flex items-center justify-center border transition-colors ${p === currentPage ? "bg-black text-white border-black" : "border-[#eee] bg-[#F3D6DC] text-[#1D2625] hover:border-[#ccc] hover:text-black"}`}>
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                  className={`px-4 py-2 border transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
                >
                  Next &gt;
                </button>
              </div>
            )}
          </ShimmerWrapper>

        </div>


        {/* Delete Confirmation Popup */}
        <DeleteConfirmationPopup
          isOpen={deletePopup.isOpen}
          onClose={handleCloseDeletePopup}
          onConfirm={handleConfirmDelete}
          itemName={deletePopup.productName}
          isLoading={isLoading(`delete-${deletePopup.productId}`)}
          context="wishlist"
        />
      </div>
    </ProtectedRoute>
  );
}