"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Breadcrumb from "../../components/Breadcrumb";
import ProductGallery from "../../components/ProductGallery";
import RentalPeriodCard from "../../components/RentalPeriodCard";
import SimpleCalendar from "../../components/SimpleCalendar";
import InfoCard from "../../components/InfoCard";
import ProductCard from "../../components/ProductCard";
import ReviewCard from "../../components/ReviewCard";
import PrimaryButtonLight from "../../components/PrimaryButtonLight";
import PrimaryButton from "../../components/PrimaryButton";
import ProtectedRoute from "../../components/ProtectedRoute";
import { productsApiService } from "../../services/api/products";
import { bookingsApiService } from "../../services/api/bookings";
import { profileApiService } from "../../services/api/profile";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import type { ProductDetailResponse, ApiResponse, ProfileAddress } from "../../types/api";
import { ShimmerWrapper, ShimmerProductGrid, ShimmerReviewList, ShimmerProductDetail } from "../../components/Shimmer";
import { useWishlistStore } from "../../stores/wishlistStore";
import SizeGuide from "../../components/SizeGuide";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAddToCart } from "../../hooks/useCart";
import Link from "next/link";
import ChangeAddressPopup from "../../components/ChangeOrdersAddress";
import AddAddressPopup from "../../components/AddAddressPopup";
import { userApiService } from "../../services/api/user";
import Image from "next/image";
import ChatSidebar from "../../components/ChatSidebar";
import { checkoutApiService } from "../../services/api/checkout";
import { useCheckoutStore } from "../../stores/checkoutStore";
import { StarIcon, ProductDetailPageIcon1, ProductDetailPageIcon2, ProductDetailPageIcon3, MessageIcon, TopLenderIcon } from "../../icons/icons";
import { Menu, MenuItem, Box } from "@mui/material";
import CommonModal from "../../../components/common/CommonModal";
import CommonLoader from "../../../components/common/CommonLoader";
import { useAuthStore } from "../../stores/authStore";
import { useWaitlistPopup } from "../../hooks/useWaitlistPopup";


// Interface for transformed product data
interface TransformedProduct {
  id: string;
  name: string;
  brand: string;
  description: string;
  lender: string;
  lenderId?: string;
  isTopLender: boolean;
  size: string;
  fitNotes: string;
  retailPrice: string;
  saveAmount: string;
  rating: number;
  images: string[];
  price: string;
  rentalPeriods: Array<{
    days: number;
    pricePerDay: string;
    total: string;
    save: string | null;
  }>;
  coverimage: string;
  CleaningFee?: number;
  SecurityDeposit?: number;
  rating_count: number;
}

export default function ProductDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(0);
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ startDate: Date; endDate: Date } | null>({ startDate: new Date(), endDate: new Date() });
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const routeParams = useParams();
  const id = (routeParams as { id: string }).id;

  // Wishlist store
  const { syncWishlistFromAPI } = useWishlistStore();
  const [isChangeAddressOpen, setIsChangeAddressOpen] = useState(false);

  // Checkout store
  const { setCheckoutData } = useCheckoutStore();

  // Cart hook
  const { addToCart, loading: addingToCart } = useAddToCart();

  const [reviewsApi, setReviewsApi] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  // Reviews pagination/filter state
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize, setReviewPageSize] = useState(10);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewHasNext, setReviewHasNext] = useState(false);
  const [reviewHasPrev, setReviewHasPrev] = useState(false);
  const [reviewPeriod, setReviewPeriod] = useState<string>('newest');
  const [availablePeriods, setAvailablePeriods] = useState<string[]>(['newest', 'week ago', 'month ago', 'year ago']);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [lenderProducts, setLenderProducts] = useState<any[]>([]);
  const [lenderLoading, setLenderLoading] = useState(false);
  const swiperRefSimilar = useRef<any>(null);
  const swiperRefLender = useRef<any>(null);
  // Track beginning/end state for each slider to drive arrow disabled states
  const [lenderIsBeginning, setLenderIsBeginning] = useState(true);
  const [lenderIsEnd, setLenderIsEnd] = useState(false);
  const [similarIsBeginning, setSimilarIsBeginning] = useState(true);
  const [similarIsEnd, setSimilarIsEnd] = useState(false);
  // Review sort dropdown state
  const [reviewSortAnchor, setReviewSortAnchor] = useState<null | HTMLElement>(null);
  const isReviewSortOpen = Boolean(reviewSortAnchor);
  const [selectedReviewSort, setSelectedReviewSort] = useState<'Newest' | 'Week ago' | 'Month ago' | 'Year ago'>('Newest');
  const reviewSortRef = useRef<HTMLDivElement>(null);
  // Size guide modal state
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  // Order creation state
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);
  // Calendar ref for outside click detection
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [showProceedOrderModal, setShowProceedOrderModal] = useState(false);
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { openPopup } = useWaitlistPopup();

  // Handle automatic chat opening from notifications
  useEffect(() => {
    if (searchParams.get('openChat') === 'true') {
      setIsChatOpen(true);
    }
  }, [searchParams]);

  // Add ref to track address changes
  const isChangingAddress = useRef(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {

      // ⛔ Do NOT close the calendar while any modal is open
      if (isChangeAddressOpen || isAddAddressOpen || showProceedOrderModal) {
        return;
      }

      if (
        selectedPeriod !== null &&
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;

        // Don’t close when clicking buttons/links
        if (
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a")
        ) {
          return;
        }

        // ✔ Only close when user intentionally clicks outside the rental UI
        setSelectedPeriod(null);
        setSelectedRange(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [
    selectedPeriod,
    isChangeAddressOpen,
    isAddAddressOpen,
    showProceedOrderModal
  ]);


  // Fetch product data from API and sync wishlist
  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchProductReviews();
      fetchAddresses();
      syncWishlistFromAPI(); // Sync wishlist on page load
    }
  }, [id]);

  // Scroll to top when navigating to product page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Refetch reviews when page or period changes
  useEffect(() => {
    if (id) {
      fetchProductReviews();
    }
  }, [reviewPage, reviewPeriod]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isAddressDropdownOpen && addressDropdownRef.current && !addressDropdownRef.current.contains(e.target as Node)) {
        setIsAddressDropdownOpen(false);
      }
      if (isSizeDropdownOpen && sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target as Node)) {
        setIsSizeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isAddressDropdownOpen, isSizeDropdownOpen]);

  // (Older calendar outside-click handler removed; consolidated above to respect modal state)

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError("Product ID is missing");
        return;
      }

      const response = await productsApiService.getProductById(id);

      if (response.success && response.data) {
        setProduct(response.data);
        // Initialize selected size with first available size
        if (response.data.size && Array.isArray(response.data.size) && response.data.size.length > 0) {
          setSelectedSize(response.data.size[0]);
        } else {
          setSelectedSize("");
        }
        // fetch similar and more from lender
        fetchSimilarAndMore(id);
      } else {
        setError(response.message || "Failed to fetch product details");
        console.error("Failed to fetch product details:", response.message);
      }
    } catch (error: any) {
      console.error("Error fetching product details:", error);
      setError(error.message || "Failed to fetch product details");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async () => {
    try {
      setReviewsLoading(true);
      const resp = await productsApiService.getProductReviews(id, {
        page: reviewPage,
        pageSize: reviewPageSize,
        period: reviewPeriod,
      });
      if (resp.success) {
        const dataAny: any = resp.data;
        const list = dataAny?.reviews || (Array.isArray(resp.data) ? resp.data : []);
        setReviewsApi(Array.isArray(list) ? list : []);

        // Handle pagination block if present
        const p = dataAny?.pagination;
        if (p) {
          setReviewTotalPages(p.totalPages ?? 1);
          setReviewHasNext(!!p.hasNextPage);
          setReviewHasPrev(!!p.hasPrevPage);
        } else {
          setReviewTotalPages(1);
          setReviewHasNext(false);
          setReviewHasPrev(false);
        }

        // Handle filters block if present
        const f = dataAny?.filters;
        if (f) {
          if (Array.isArray(f.availablePeriods)) setAvailablePeriods(f.availablePeriods);
          // Don't update reviewPeriod or selectedReviewSort here to avoid infinite loops
          // The state is already updated by the onClick handler
        }
      } else {
        setReviewsApi([]);
        setReviewTotalPages(1);
        setReviewHasNext(false);
        setReviewHasPrev(false);
      }
    } catch (e) {
      console.error("Error fetching reviews:", e);
      setReviewsApi([]);
      setReviewTotalPages(1);
      setReviewHasNext(false);
      setReviewHasPrev(false);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchSimilarAndMore = async (productId: string) => {
    try {
      setSimilarLoading(true);
      setLenderLoading(true);
      const resp = await productsApiService.getSimilarAndMore(productId);
      if (resp.success && resp.data) {
        setSimilarProducts(resp.data.similar || []);
        setLenderProducts(resp.data.moreFromLender || []);
      } else {
        setSimilarProducts([]);
        setLenderProducts([]);
      }
    } catch (e) {
      console.error("Error fetching similar and more products:", e);
      setSimilarProducts([]);
      setLenderProducts([]);
    } finally {
      setSimilarLoading(false);
      setLenderLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await profileApiService.getProfile();
      if (response.success && response.data?.addresses) {
        setAddresses(response.data.addresses);
        // Set default to primary address if available
        const primaryAddress = response.data.addresses.find((addr: any) => addr.is_primary);
        if (primaryAddress) {
          setSelectedAddressId((primaryAddress as any)._id);
        } else if (response.data.addresses.length > 0) {
          setSelectedAddressId((response.data.addresses[0] as any)._id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch addresses:", e);
    }
  };

  const handleRentalPeriodSelect = (index: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // ⛔ Do nothing while change-address popup is open
    if (isChangeAddressOpen || isAddAddressOpen || showProceedOrderModal) {
      return;
    }

    // If already selected, do nothing
    if (selectedPeriod === index) return;

    setSelectedPeriod(index);
  };


  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openPopup();
      return;
    }

    // Validation - check if product data is available
    if (!product || !currentProduct) {
      toast.error("Product information is still loading");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    try {
      const cartData = {
        productId: id,
        size: selectedSize,
        quantity: quantity,
      };

      const response = await addToCart(cartData as any);

      if (response.success) {
        toast.success("Item added to cart successfully!");
        // Redirect to cart page so user can see the added item
        router.push('/cart');
      } else {
        toast.error(response.message || "Failed to add item to cart");
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error?.message || "Failed to add item to cart. Please try again.");
    }
  };

  const handleCreateOrder = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openPopup();
      return;
    }

    // Validation - check if product data is available
    if (!product || !currentProduct) {
      toast.error("Product information is still loading");
      return;
    }

    // Validation for size
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Check if we have addresses
    if (addresses.length === 0) {
      // No addresses, show add address popup directly
      setIsAddAddressOpen(true);
    } else {
      // Show proceed order modal
      setShowProceedOrderModal(true);
    }
  };

  const handleProceedOrder = () => {
    setShowProceedOrderModal(false);

    // Use the current selected address or primary address
    const addressToUse = selectedAddressId || addresses.find(addr => addr.is_primary)?._id;
    if (addressToUse) {
      handleCreateOrderWithAddress(addressToUse);
    } else {
      toast.error("Please select an address first");
    }
  };

  const handleCreateOrderWithAddress = async (selectedAddressId: string) => {
    try {
      setIsCreatingOrder(true);

      if (!selectedSize) {
        toast.error("Please select a size");
        return;
      }

      const payload = {
        products: [{
          product: id,
          quantity: quantity,
          size: selectedSize,
          start_date: '',
          end_date: '',
        }],
      };

      const response = await checkoutApiService.calculateCheckout(payload);

      if (response.success && response.data) {
        setCheckoutData({
          ...response.data,
          addressId: selectedAddressId
        });
        router.push("/checkout");
      } else {
        throw new Error(response.message || "Failed to calculate checkout");
      }
    } catch (error: any) {
      console.error("Error during checkout calculation:", error);
      toast.error(error?.message || "Failed to proceed to checkout. Please try again.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleSaveAddress = async (addressData: any) => {
    setIsSavingAddress(true);

    try {
      const payload = {
        label: addressData.label,
        street_name: addressData.street_name,
        house_number: addressData.house_number,
        house_number_suffix: addressData.house_number_suffix,
        postal_code: addressData.postal_code,
        city: addressData.city,
        is_primary: addressData.is_primary,
      };

      const resp = await userApiService.addRenterAddress(payload);

      if (!resp.success) {
        throw new Error(resp.message || 'Failed to add address');
      }

      // Refetch addresses after adding
      await fetchAddresses();
      toast.success(resp.message || 'Address added successfully!');
      setIsAddAddressOpen(false);

      // After adding new address, automatically select it and reopen checkout modal if we had it open
      const newAddressId = resp.data?.addresses?.[0]?._id;
      if (newAddressId) {
        setSelectedAddressId(newAddressId);
        setShowProceedOrderModal(true);
        // Proceed with order automatically
        handleCreateOrderWithAddress(newAddressId);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error('Failed to add address. Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const ProceedOrderModal = () => {
    return (
      <CommonModal
        isOpen={showProceedOrderModal}
        onClose={() => setShowProceedOrderModal(false)}
        title="Proceed with Order"
        size="sm"
      >
        <div className="flex flex-col gap-4 font-poppins">
          {/* Selected Items Display */}
          <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              Order Details
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase tracking-wider font-medium">Quantity</span>
                <span className="text-gray-900 font-semibold">{quantity} items</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase tracking-wider font-medium">Size</span>
                <span className="text-gray-900 font-semibold">{selectedSize}</span>
              </div>
            </div>
          </div>

          {/* Selected Address Display */}
          <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              Delivery Address
            </p>
            {selectedAddressId ? (
              <div className="text-sm text-gray-600">
                {(() => {
                  const selectedAddr = addresses.find(addr => addr._id === selectedAddressId);
                  return selectedAddr ? (
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-gray-900 text-sm">{selectedAddr.label || 'Address'}</p>
                      <p className="text-xs leading-relaxed">{selectedAddr.house_number} {selectedAddr.street_name}{selectedAddr.house_number_suffix ? `, ${selectedAddr.house_number_suffix}` : ''}</p>
                      <p className="text-xs leading-relaxed">{selectedAddr.city}, {selectedAddr.postal_code}</p>
                      {selectedAddr.is_primary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 mt-1 w-fit">
                          Primary Address
                        </span>
                      )}
                    </div>
                  ) : <span className="text-xs italic text-gray-400">No address selected</span>;
                })()}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No address selected</p>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleProceedOrder}
              disabled={!selectedAddressId}
              className="w-full bg-[#1A1A1A] text-white py-3.5 px-4 rounded-xl hover:bg-[#1a1a1a] transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-sm"
            >
              Proceed to Checkout
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowProceedOrderModal(false);
                  setIsChangeAddressOpen(true);
                }}
                className="flex-1 border border-gray-200 text-[#3D1126] py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-xs text-center"
              >
                Change
              </button>

              <button
                onClick={() => {
                  setShowProceedOrderModal(false);
                  setIsAddAddressOpen(true);
                }}
                className="flex-1 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-xs text-center"
              >
                Add New
              </button>
            </div>
          </div>
        </div>
      </CommonModal>
    );
  };

  // Fallback data for when product is loading or not available
  const fallbackProduct: TransformedProduct = {
    id: id || "loading",
    name: "",
    brand: "",
    description: "",
    lender: "",
    isTopLender: false,
    size: "",
    fitNotes: "",
    retailPrice: "",
    saveAmount: "",
    rating: 0,
    images: ["/assets/product-main.jpg"],
    price: "",
    rentalPeriods: [
      { days: 4, pricePerDay: "", total: "", save: null },
    ],
    coverimage: "/assets/product-main.jpg",
    rating_count: 0
  };

  // Transform API product data to component format
  const transformProductData = (apiProduct: ProductDetailResponse): TransformedProduct => {
    // Get rental periods from pricing.options (new API structure) or fallback to legacy fields
    let rentalPeriods: Array<{ days: number; pricePerDay: string; total: string; save: string | null }> = [];

    if (apiProduct.pricing && apiProduct.pricing.options && apiProduct.pricing.options.length > 0) {
      // Use pricing.options from API - this is the new structure
      rentalPeriods = apiProduct.pricing.options.map((option) => {
        // Show discount percentage from API (don't calculate)
        let saveText: string | null = null;
        if (option.discount !== undefined && option.discount !== null && option.discount > 0) {
          // Use discount value directly from API as percentage
          saveText = `Save ${option.discount}%`;
        }

        return {
          days: option.duration,
          pricePerDay: `Rs.${option.pricePerDay.toFixed(2)}`,
          total: `Rs.${option.breakdown.rental.toFixed(2)}`, // Using totalPrice from API response
          save: saveText
        };
      });
    } else if (apiProduct.rental_periods && apiProduct.rental_periods.length > 0) {
      // Fallback to legacy rental_periods field
      rentalPeriods = apiProduct.rental_periods.map((period: any) => {
        let saveText: string | null = null;
        if (period.discount !== undefined && period.discount !== null && period.discount > 0) {
          saveText = `Save ${period.discount}%`;
        }
        return {
          days: period.days || period.duration,
          pricePerDay: `Rs.${(period.priceperday || period.pricePerDay || apiProduct.rental_price_per_day).toFixed(2)}`,
          total: `Rs.${(period.rental || period.totalPrice || apiProduct.rental_price_per_day * (period.days || 4)).toFixed(2)}`,
          save: saveText
        };
      });
    } else {
      // Final fallback if no pricing data available
      rentalPeriods = [
        { days: 4, pricePerDay: `Rs.${apiProduct.rental_price_per_day.toFixed(2)}`, total: `Rs.${(apiProduct.rental_price_per_day * 4).toFixed(2)}`, save: null },
      ];
    }

    return {
      id: apiProduct._id,
      name: apiProduct.name,
      brand: apiProduct.brand,
      description: apiProduct.description,
      lender: apiProduct.lender?.name || "Unknown Lender",
      lenderId: apiProduct.lender?._id,
      isTopLender: apiProduct.lender?.is_top_lender || false,
      size: apiProduct.size && apiProduct.size.length > 0 ? apiProduct.size[0] : "N/A",
      fitNotes: "Runs small, True to size, Oversized fit",
      retailPrice: `Rs.${(apiProduct.rental_price_per_day * 10).toFixed(2)}`,
      saveAmount: `Rs.${(apiProduct.rental_price_per_day * 8).toFixed(2)}`,
      rating: apiProduct.rating || 0,
      images: apiProduct.images && apiProduct.images.length > 0 ? apiProduct.images : [apiProduct.cover_image || "/assets/product-main.jpg"],
      price: `Rs.${apiProduct.rental_price_per_day}`,
      rentalPeriods,
      coverimage: apiProduct.cover_image || "/assets/product-main.jpg",
      CleaningFee: apiProduct.pricing?.cleaning_fee,
      SecurityDeposit: apiProduct.pricing?.security_deposit,
      rating_count: apiProduct.rating_count || 0,
    };
  };

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""}`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""}`;

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""}`;
  };

  // Use transformed API data if available, otherwise use fallback
  const currentProduct: TransformedProduct = product ? transformProductData(product) : fallbackProduct;

  const mappedReviews = reviewsApi.map((r: any) => {
    const createdAt = r?.created_at || r?.createdAt || r?.datePosted;
    const timeAgo = formatRelativeTime(createdAt);
    return {
      userName: r?.borrowerName || 'user',
      userAvatar: r?.borrowerAvatar || "/assets/iconreview.jpg",
      rating: r?.rating ?? 0,
      sizeRented: r?.productSize || 'N/A',
      reviewTitle: r?.reviewText || '',
      timeAgo,
    };
  });

  // Helpers for mapping between API period values and UI labels
  const periodLabelMap: Record<string, string> = {
    'newest': 'Newest',
    'week ago': 'Week ago',
    'month ago': 'Month ago',
    'year ago': 'Year ago',
  };
  const labelToApiMap: Record<string, string> = {
    'Newest': 'newest',
    'Week ago': 'week ago',
    'Month ago': 'month ago',
    'Year ago': 'year ago',
  };
  const dropdownPeriodLabels: string[] = (availablePeriods || [])
    .map((p) => periodLabelMap[p] || p)
    .filter((lbl) => lbl !== selectedReviewSort);

  return (
    <ProtectedRoute
      requireAuth={false}
      fallback={
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view product details</h2>
          <p className="text-white/80">Please sign in to access product information and rental options.</p>
        </div>
      }
    >
      {loading ? (
        <CommonLoader pageCenter />
      ) : (
        <>
          <div className="bg-[#FAF6F3] overflow-x-hidden content-stretch flex flex-col  items-start justify-center relative w-full min-h-screen">
            <div className="w-full relative">
              <Breadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Products", href: "/productPage" },
                  ...(currentProduct?.name && currentProduct.name !== "" ? [{ label: currentProduct.name }] : [])
                ]}
              />
            </div>

            {/* Constrained main row only */}
            <div className="content-stretch flex flex-col items-start relative w-full mx-auto px-4 md:px-6 lg:px-[50px]">
              {/* Product Content */}
              <div className="box-border content-stretch layouting flex flex-col lg:flex-row gap-[20px]  items-start justify-center pb-[40px] pt-[20px] relative w-full">
                {/* Left Side - Product Gallery */}
                <div className="w-full lg:w-[751px] xl:w-[900px]">
                  <ShimmerWrapper
                    isLoading={loading}
                    shimmerComponent={<div className="w-full h-[400px] sm:h-[500px] lg:h-[844px] bg-gray-200 animate-pulse " />}
                  >
                    <ProductGallery images={currentProduct.images} coverImage={currentProduct.coverimage} productId={id} />
                  </ShimmerWrapper>
                </div>

                {/* Right Side - Product Details */}
                <div className="flex  flex-col gap-[22px] items-start overflow-x-clip overflow-y-auto relative w-full lg:w-[40%] xl:w-[60%] ">
                  {error ? (
                    <div className="flex justify-center items-center py-8 w-full">
                      <div className="text-red-600 text-center">
                        <h3 className="text-lg font-semibold mb-2">Error Loading Product</h3>
                        <p>{error}</p>
                        <button
                          onClick={fetchProductDetails}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ShimmerWrapper
                      isLoading={loading}
                      className="w-full"
                      shimmerComponent={<ShimmerProductDetail />}
                    >
                      {/* Header Info */}
                      <div className="content-stretch flex flex-col gap-[16px] items-start justify-between relative shrink-0 w-full">
                        <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                          <div className="flex flex-row w-full justify-between items-center gap-2">

                            {/* LEFT SECTION */}
                            <div className="flex flex-row items-center gap-2 sm:gap-4 overflow-hidden">
                              <p className="font-['Poppins'] leading-[16px] text-[#6D6D6D] text-[10px] sm:text-xs m-0 truncate">
                                Listed by{" "}
                                <span className="font-['Poppins'] font-medium text-[#3D1126] underline">
                                  <Link href={`/LenderPage/${currentProduct.lenderId || ''}`}>
                                    {currentProduct.lender}
                                  </Link>
                                </span>
                              </p>

                              {currentProduct.isTopLender && (
                                <div className="bg-[#FDA018] flex gap-1 sm:gap-2 items-center justify-center px-1.5 py-0.5 w-fit shrink-0">
                                  <div className="size-[14px] text-center sm:size-[20px]">
                                    <TopLenderIcon />
                                  </div>
                                  <p className="font-['Poppins'] leading-none text-[#3D1126] text-[9px] sm:text-[12px] m-0 whitespace-nowrap">
                                    Top Seller
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* RIGHT SECTION */}
                            <button
                              onClick={() => {
                                if (!isAuthenticated) {
                                  openPopup();
                                } else {
                                  setIsChatOpen(true);
                                }
                              }}
                              className="group flex items-center gap-1.5 sm:gap-2 text-black bg-transparent border border-black px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-[14px]  shrink-0 whitespace-nowrap"
                            >
                              <div className="relative size-[14px] sm:size-[18px]">
                                <MessageIcon
                                  size={18}
                                  className="text-[#3D1126] hover:text-white transition-colors"
                                />                        </div>
                              Message To Seller
                            </button>

                          </div>
                          {/* Product Name */}
                          <div className="flex flex-wrap gap-4">
                            <p className="font-['Poppins'] leading-[24px] text-[#3D1126] text-[16px] m-0">
                              <span className="text-[#3D1126]">Brand -</span> <span className="capitalize font-['Poppins'] font-medium">{currentProduct.brand.toUpperCase()}</span>
                            </p>
                            <section className="flex justify-center items-center gap-1">
                              {[...Array(5)].map((_, index) => (
                                <div key={index} className="relative shrink-0 size-[20px]">
                                  <StarIcon key={index} size={18} color="#3D1126" />
                                </div>
                              ))}</section>
                          </div>


                          <div className="flex flex-col gap-[12px]">
                            <div className="flex flex-col gap-2">
                              <h1 className="capitalize font-['Canela'] font-bold leading-[32px]  text-[24px]  text-[#3D1126] m-0 w-full">
                                {currentProduct.name}
                              </h1>
                              {/* Product Description */}
                              {currentProduct.description && (
                                <p className="font-['Poppins'] leading-[24px] font-normal text-[#6D6D6D] text-[14px] lg:text-[16px] m-0 w-full">
                                  {currentProduct.description}
                                </p>
                              )}
                              <p className="leading-[16px] font-normal text-xs italic text-[#A8A8A8]">
                                Premium designer fashion available for purchase.
                              </p>                      </div>

                            <div className="bg-[#FFFFFF] mt-4 flex flex-col gap-4 w-full py-6 px-7">
                              <div className="flex gap-2 items-center">
                                <p className="font-['Poppins'] font-medium text-base leading-[24px] text-black ">Purchase Price</p>
                              </div>
                              <div className="font-bold font-['Poppins'] text-2xl leading-[32px] text-black " >{currentProduct.price}</div>
                              {currentProduct.size && (

                                <div>
                                  <h1 className="font-['Poppins'] font-normal text-black leading-[24px] text-[14px] lg:text-[16px] m-0 w-full">
                                    Size:  {selectedSize}
                                  </h1>
                                  <div className="flex gap-[40px] items-center">
                                    <p className="font-normal font-['Poppins'] text-xs leading-[16px] text-[#6D6D6D]">Runs small, True to size, Oversized fit</p>
                                    <p className="font-['Poppins'] font-normal text-sm leading-[20px] text-black underline underline-offset-2 cursor-pointer" onClick={() => setIsSizeGuideOpen(true)}>Size guide</p>
                                  </div>
                                </div>

                              )}
                              <p className="capitalize font-['Poppins'] font-medium leading-[24px] text-[#3D1126] text-[16px] m-0">
                                Quantity
                              </p>
                              <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center font-bold text-lg hover:bg-gray-50 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(prev => Math.min(product?.quantity || 10, prev + 1))}
                                    className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center font-bold text-lg hover:bg-gray-50 transition-colors"
                                  >
                                    +
                                  </button>
                                  {product && (
                                    <span className="text-xs text-gray-500 font-['Poppins']">
                                      {product.quantity > 0 ? `${product.quantity} items available` : 'Out of Stock'}
                                    </span>
                                  )}
                                </div>

                                <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                                  <button
                                    onClick={handleCreateOrder}
                                    type='button'
                                    data-rent-now-button="true"
                                    className="bg-[#1A1A1A] rounded-md box-border content-stretch flex gap-[10px] items-center justify-center px-[16px] py-[12px] relative shrink-0 w-full cursor-pointer hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white font-['Poppins'] text-[14px]"
                                  >
                                    {isCreatingOrder ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                      </div>
                                    ) : "Buy Now"}
                                  </button>
                                  <PrimaryButton
                                    text={addingToCart ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Adding...
                                      </div>
                                    ) : "Add to Bag"}
                                    onClick={handleAddToCart}
                                    data-add-to-bag-button="true"
                                    className="border  bg-[#F3D6DC] rounded-md  content-stretch flex gap-[10px] items-center justify-center px-[16px] py-[12px] relative shrink-0 w-full cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                  <p className="mt-2 text-gray-500 font-normal font-['Poppins'] text-xs leading-[16px]">Orders are processed immediately. Shipping times vary by seller.</p>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>


                        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">

                        </div>


                        {/* Calendar Section - Only show when a rental period is selected */}



                      </div>
                    </ShimmerWrapper>
                  )}

                </div>
              </div>

            </div>

            {/* Info Cards - full width */}
            <div className="box-border content-stretch grid grid-cols-1 md:grid-cols-3 gap-[16px] items-stretch p-[20px] lg:p-[40px] relative shrink-0 w-full">
              <InfoCard
                icon={<ProductDetailPageIcon1 />}
                title="Security Deposit :"
                description="For high-value items, a temporary hold may be placed on your payment card. This isn't charged and is released once the item is returned and inspected in good condition."
              />
              <InfoCard
                icon={<ProductDetailPageIcon2 />}
                title="Service Fee Breakdown:"
                description="A 15% platform service fee is added at checkout to cover platform and support costs."
              />
              <InfoCard
                icon={<ProductDetailPageIcon3 />}
                title="Late Return Fee Information"
                description="Late returns may incur a daily late fee based on the item's rental price. If the delay is caused by a shipping carrier, this may be taken into consideration so be sure to keep evidence."
              />
            </div>

            {/* More from Lender - full width */}
            {lenderProducts.length > 0 && (
              <div className="box-border content-stretch flex flex-col gap-[8px] items-start overflow-clip p-[20px] lg:p-[40px] relative shrink-0 w-full">

                <div className="w-full mx-auto flex flex-col gap-[24px] lg:gap-[32px]">

                  {/* ===== HEADER ROW ===== */}
                  <div className="flex items-center justify-between w-full">

                    <p className="font-['Canela'] font-normal leading-[32px] lg:leading-[48px] text-[28px] lg:text-[48px] text-black m-0">
                      More from {currentProduct.lender}
                    </p>

                    {/* TOP RIGHT ARROWS */}
                    {lenderProducts.length > 4 && <div className="flex items-center gap-[12px]">

                      <button
                        onClick={() => swiperRefLender.current?.slidePrev()}
                        disabled={lenderIsBeginning}
                        className={`rounded-full p-[12px] lg:p-[15px] transition-all duration-300 ${lenderIsBeginning
                          ? 'bg-black/30 opacity-40 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-800'
                          }`}
                      >
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 21L12 15L18 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <button
                        onClick={() => swiperRefLender.current?.slideNext()}
                        disabled={lenderIsEnd}
                        className={`rounded-full p-[12px] lg:p-[15px] transition-all duration-300 ${lenderIsEnd
                          ? 'bg-black/30 opacity-40 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-800'
                          }`}
                      >
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21L18 15L12 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                    </div>}
                  </div>

                  {/* ===== SLIDER ===== */}
                  <ShimmerWrapper
                    isLoading={lenderLoading}
                    shimmerComponent={<ShimmerProductGrid count={4} />}
                  >
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={24}
                      slidesPerView={1}
                      navigation={false}
                      onSwiper={(swiper) => {
                        swiperRefLender.current = swiper;
                        setLenderIsBeginning(swiper.isBeginning);
                        setLenderIsEnd(swiper.isEnd);
                      }}
                      onSlideChange={(swiper) => {
                        setLenderIsBeginning(swiper.isBeginning);
                        setLenderIsEnd(swiper.isEnd);
                      }}
                      className="w-full"
                      breakpoints={{
                        320: { slidesPerView: 1, spaceBetween: 12 },
                        640: { slidesPerView: 2, spaceBetween: 16 },
                        1024: { slidesPerView: 4, spaceBetween: 24 },
                      }}
                    >
                      {lenderProducts.slice(0, 12).map((p: any) => (
                        <SwiperSlide key={p.id || p._id}>
                          <ProductCard
                            id={p.id || p._id}
                            imageSrc={
                              p.cover_image ||
                              (Array.isArray(p.images) && p.images[0]) ||
                              "/assets/product-1.jpg"
                            }
                            productName={p.name}
                            price={`Rs.${p.rentalPrice || p.rental_price_per_day}`}
                            sizes={Array.isArray(p.size) ? p.size.join(', ') : 'Multiple'}
                            brand={p.brand}
                            rating={p.rating}
                            rating_count={p.rating_count}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </ShimmerWrapper>

                </div>
              </div>
            )}



            {/* See Similar Items - full width */}
            {similarProducts.length > 0 && (
              <div className="box-border content-stretch flex flex-col gap-[8px] items-start overflow-clip p-[20px] lg:p-[40px] relative shrink-0 w-full">

                <div className="w-full mx-auto flex flex-col gap-[24px] lg:gap-[32px]">

                  {/* ===== HEADER ROW ===== */}
                  <div className="flex items-center justify-between w-full">

                    <p className="font-['Canela'] font-normal leading-[32px] lg:leading-[48px] text-[28px] lg:text-[48px] text-black m-0">
                      See Similar Items
                    </p>

                    {/* TOP RIGHT ARROWS */}
                    {similarProducts.length > 4 && <div className="flex items-center gap-[12px]">

                      <button
                        onClick={() => swiperRefSimilar.current?.slidePrev()}
                        disabled={similarIsBeginning}
                        className={`rounded-full p-[12px] lg:p-[15px] transition-all duration-300 ${similarIsBeginning
                          ? 'bg-black/30 opacity-40 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-800'
                          }`}
                      >
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 21L12 15L18 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <button
                        onClick={() => swiperRefSimilar.current?.slideNext()}
                        disabled={similarIsEnd}
                        className={`rounded-full p-[12px] lg:p-[15px] transition-all duration-300 ${similarIsEnd
                          ? 'bg-black/30 opacity-40 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-800'
                          }`}
                      >
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21L18 15L12 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                    </div>}
                  </div>

                  {/* ===== SLIDER ===== */}
                  <ShimmerWrapper
                    isLoading={similarLoading}
                    shimmerComponent={<ShimmerProductGrid count={4} />}
                  >
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={24}
                      slidesPerView={1}
                      navigation={false}
                      onSwiper={(swiper) => {
                        swiperRefSimilar.current = swiper;
                        setSimilarIsBeginning(swiper.isBeginning);
                        setSimilarIsEnd(swiper.isEnd);
                      }}
                      onSlideChange={(swiper) => {
                        setSimilarIsBeginning(swiper.isBeginning);
                        setSimilarIsEnd(swiper.isEnd);
                      }}
                      className="w-full"
                      breakpoints={{
                        320: { slidesPerView: 1, spaceBetween: 12 },
                        640: { slidesPerView: 2, spaceBetween: 16 },
                        1024: { slidesPerView: 4, spaceBetween: 24 },
                      }}
                    >
                      {similarProducts.slice(0, 12).map((p: any) => (
                        <SwiperSlide key={p.id || p._id}>
                          <ProductCard
                            id={p.id || p._id}
                            imageSrc={
                              p.cover_image ||
                              (Array.isArray(p.images) && p.images[0]) ||
                              "/assets/product-1.jpg"
                            }
                            productName={p.name}
                            price={`Rs.${p.rentalPrice || p.rental_price_per_day}`}
                            sizes={Array.isArray(p.size) ? p.size.join(', ') : 'Multiple'}
                            brand={p.brand}
                            rating={p.rating}
                            rating_count={p.rating_count}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </ShimmerWrapper>

                </div>
              </div>
            )}


            {/* Product Reviews - full width */}
            <div className="bg-[#F3D6DC] box-border flex flex-col gap-[32px] items-start px-4 md:px-[84px] lg:px-[214px] py-[48px] lg:py-[64px] relative w-full">
              <div className="flex flex-col gap-[40px] items-start relative w-full  mx-auto">
                <div className="flex flex-col gap-[32px] items-start relative w-full">
                  <div className="flex flex-row items-center justify-between w-full">
                    <p className="font-['Canela'] font-normal leading-tight text-[32px] lg:text-[48px] text-black">
                      Product reviews
                    </p>
                    {availablePeriods.length > 0 && (
                      <div className="relative flex justify-center lg:block">
                        <button
                          type="button"
                          onClick={(e) => setReviewSortAnchor(e.currentTarget)}
                          className="bg-[#2C2931] rounded-[8px] flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-black transition-colors min-w-[120px]"
                        >
                          <p className=" ml-4 font-['Poppins'] font-medium text-white text-[14px]">
                            {selectedReviewSort}
                          </p>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isReviewSortOpen ? 'rotate-180' : ''} transition-transform ml-2`}>
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <Menu
                          anchorEl={reviewSortAnchor}
                          open={isReviewSortOpen}
                          onClose={() => setReviewSortAnchor(null)}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                          PaperProps={{
                            sx: {
                              backgroundColor: '#FAF6F3',
                              width: '150px',
                              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                              borderRadius: '4px',
                              marginTop: '4px',
                              padding: 0,
                              '& .MuiList-root': { padding: 0 }
                            }
                          }}
                          disableScrollLock
                        >
                          {/* Header row */}
                          <Box sx={{ bgcolor: '#3D1126', color: '#FAF6F3', px: '8px', py: '8px', fontFamily: 'Poppins', fontSize: '14px', lineHeight: '24px' }}>
                            {selectedReviewSort}
                          </Box>
                          {/* Options */}
                          {dropdownPeriodLabels.map((opt) => (
                            <MenuItem
                              key={opt}
                              onClick={() => {
                                setSelectedReviewSort(opt as any);
                                const apiVal = labelToApiMap[opt] || 'newest';
                                setReviewPeriod(apiVal);
                                setReviewPage(1);
                                setReviewSortAnchor(null);
                              }}
                              sx={{
                                px: '8px',
                                py: '8px',
                                fontFamily: 'Poppins',
                                fontSize: '14px',
                                color: '#3D1126',
                                minHeight: 'auto',
                                '&:hover': {
                                  backgroundColor: '#f2efea',
                                }
                              }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </Menu>
                      </div>
                    )}
                  </div>
                  <div className="content-stretch flex flex-col gap-[16px] items-start relative  shrink-0 w-full">
                    <ShimmerWrapper isLoading={reviewsLoading && reviewsApi.length === 0} shimmerComponent={<ShimmerReviewList count={3} />}>
                      {mappedReviews.length === 0 && (
                        <div className="text-[#6d6d6d] font-['Poppins'] p-4 w-full text-center lg:text-center">Reviews Currently Not Available For This Product</div>
                      )}
                      {mappedReviews.map((review, index) => (
                        <ReviewCard
                          key={index}
                          {...review}
                          isLastReview={index === mappedReviews.length - 1}
                        />
                      ))}
                      {/* mesagination controls */}

                      {mappedReviews.length > 4 && <div className="flex items-center justify-center gap-2 mt-8 w-full font-['Poppins']">
                        {/* Back */}
                        <button
                          type="button"
                          onClick={() => reviewHasPrev && setReviewPage(p => Math.max(1, p - 1))}
                          disabled={!reviewHasPrev || reviewsLoading}
                          className="h-10 px-4 border border-[#EDC7CF] bg-transparent text-[14px] text-black flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#EDC7CF] transition-colors"
                        >
                          <span className="text-[12px]">{'<'}</span> Back
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: reviewTotalPages }, (_, i) => {
                          const page = i + 1;
                          const isActive = page === reviewPage;

                          return (
                            <button
                              key={page}
                              onClick={() => setReviewPage(page)}
                              className={`w-10 h-10 flex items-center justify-center border text-[14px] font-medium transition-colors
                            ${isActive
                                  ? "bg-[#2C2931] text-white border-[#2C2931]"
                                  : "border-[#EDC7CF] bg-transparent text-black hover:bg-[#EDC7CF]"
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {/* Next */}
                        <button
                          type="button"
                          onClick={() => reviewHasNext && setReviewPage(p => Math.min(reviewTotalPages, p + 1))}
                          disabled={!reviewHasNext || reviewsLoading}
                          className="h-10 px-4 border border-[#EDC7CF] bg-transparent text-[14px] text-black flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#EDC7CF] transition-colors"
                        >
                          Next <span className="text-[12px]">{'>'}</span>
                        </button>
                      </div>}


                    </ShimmerWrapper>
                  </div>
                </div>
              </div>
            </div>


            {/* Size Guide Modal */}
            <SizeGuide
              isOpen={isSizeGuideOpen}
              onClose={() => setIsSizeGuideOpen(false)}
              availableSizes={product?.size || []}
              selectedSize={selectedSize}
              onSizeSelect={(size) => {
                setSelectedSize(size);
                setIsSizeGuideOpen(false);
              }}
            />
          </div>

          {/* Proceed Order Modal */}
          {showProceedOrderModal && <ProceedOrderModal />}

          {/* Change Address Popup - Higher z-index to appear above proceed modal */}
          {isChangeAddressOpen && (
            <div className="fixed inset-0 z-[60]">
              <ChangeAddressPopup
                isOpen={isChangeAddressOpen}
                onClose={() => {
                  isChangingAddress.current = false;
                  setIsChangeAddressOpen(false);
                  setShowProceedOrderModal(true);
                }}
                addresses={addresses}
                selectedAddressId={selectedAddressId || addresses.find(addr => addr.is_primary)?._id || null}
                onSelectAddress={(addressId) => {
                  setSelectedAddressId(addressId);
                  setIsChangeAddressOpen(false);
                  setShowProceedOrderModal(true);
                }}
                onAddNewAddress={() => {
                  setIsChangeAddressOpen(false);
                  setIsAddAddressOpen(true);
                }}
              />
            </div>
          )}

          {/* Add Address Popup - Higher z-index */}
          {isAddAddressOpen && (
            <div className="fixed inset-0 z-[60]">
              <AddAddressPopup
                isOpen={isAddAddressOpen}
                onClose={() => {
                  setIsAddAddressOpen(false);
                  setShowProceedOrderModal(true);
                }}
                onSave={handleSaveAddress}
                isLoading={isSavingAddress}
              />
            </div>
          )}

          {/* Chat Sidebar */}
          {product && (
            <ChatSidebar
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              productId={currentProduct.id}
              productName={currentProduct.name}
              productImage={currentProduct.coverimage}
              lenderId={product?.lender?._id}
            />
          )}
        </>
      )}
    </ProtectedRoute>
  );
}
