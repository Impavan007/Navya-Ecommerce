"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import OfferBanner from "../components/OfferBanner";
import Breadcrumb from "../components/Breadcrumb";
import CartItemCard from "../components/CartItemCard";
import ChangeCartItemDates from "../components/ChangeCartItemDates";
import PriceDetails from "../components/PriceDetails";
import PrimaryButton from "../components/PrimaryButton";
import PrimaryButtonLight from "../components/PrimaryButtonLight";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { cartApiService } from "../services/api/cart";
import { userApiService } from "../services/api/user";
import { wishlistApiService } from "../services/api/wishlist";
import { bookingsApiService } from "../services/api/bookings";
import { useRouter } from "next/navigation";
import { useCartStore } from "../stores/cartStore";
import type { ApiCartItem, RenterAddressListItem } from "../types/api";
import { ShimmerWrapper, ShimmerCartItems, ShimmerCartPage } from "../components/Shimmer";
import DeleteConfirmationPopup from "../components/DeleteConfirmationPopup";
import { toast } from "react-hot-toast";
import ChangeAddressPopup from "../components/ChangeOrdersAddress";
import AddAddressPopup from "../components/AddAddressPopup";
import { checkoutApiService } from "../services/api/checkout";
import { useCheckoutStore } from "../stores/checkoutStore";


interface AddressData {
  id?: number;
  _id?: string;
  label: string;
  street_name: string;
  house_number: string;
  house_number_suffix: string;
  postal_code: string;
  city: string;
  is_primary: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<ApiCartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [rentalAmountTotal, setRentalAmountTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [securityDepositTotal, setSecurityDepositTotal] = useState(0);
  const [cleaningFeeTotal, setCleaningFeeTotal] = useState(0);
  const [serviceChargeTotal, setServiceChargeTotal] = useState(0);
  const [addresses, setAddresses] = useState<RenterAddressListItem[]>([]);
  const [primaryAddress, setPrimaryAddress] =
    useState<RenterAddressListItem | null>(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletePopup, setDeletePopup] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: "",
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [moveToWishlistLoading, setMoveToWishlistLoading] = useState<string | null>(null);
  const [isChangeAddressOpen, setIsChangeAddressOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [clearCartPopup, setClearCartPopup] = useState({ isOpen: false });
  const [clearCartLoading, setClearCartLoading] = useState(false);
  const [editItem, setEditItem] = useState<ApiCartItem | null>(null);

  // Checkout store
  const { setCheckoutData } = useCheckoutStore();

  // Cart store
  const { clearCart: clearCartStore } = useCartStore();

  useEffect(() => {
    fetchCartData();
    fetchAddresses();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartApiService.getCart();

      if (response.success && response.data) {
        const items = response.data.cart || [];
        const total = response.data.total || 0;
        setCartItems(items);
        setTotalAmount(total);

        // Use totalPricing from backend response if available
        const totalPricing = (response.data as any).totalPricing;
        if (totalPricing) {
          // Use backend calculated totals
          setRentalAmountTotal(totalPricing.rentalAmount || 0);
          setSecurityDepositTotal(totalPricing.securityDeposit || 0);
          setCleaningFeeTotal(totalPricing.cleaningFee || 0);
          setServiceChargeTotal(totalPricing.serviceFee || 0);
          setGrandTotal(totalPricing.total || total);
        } else {
          // Fallback: derive totals from items if totalPricing not available
          const rentalAmt = items.reduce(
            (sum: number, it: ApiCartItem) => sum + (((it as any).pricing?.rentalAmount) || 0),
            0
          );
          const secDep = items.reduce(
            (sum: number, it: ApiCartItem) =>
              sum + (it.product?.security_deposit || 0),
            0
          );
          const cleanFee = items.reduce(
            (sum: number, it: ApiCartItem) =>
              sum + (it.product?.cleaning_fee || 0),
            0
          );
          setRentalAmountTotal(rentalAmt);
          setSecurityDepositTotal(secDep);
          setCleaningFeeTotal(cleanFee);
          setServiceChargeTotal(0); // Set to 0 if not provided by backend
          setGrandTotal(total);
        }
      } else {
        setError(response.message || "Failed to fetch cart data");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch cart data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const resp = await userApiService.getRenterAddresses();
      if (resp.success && resp.data) {
        setAddresses(resp.data.addresses || []);
        setPrimaryAddress(resp.data.primary_address || null);
        // Set selected address to primary if available
        if (resp.data.primary_address?._id) {
          setSelectedAddressId(resp.data.primary_address._id);
        } else if (resp.data.addresses?.length > 0) {
          setSelectedAddressId(resp.data.addresses[0]._id);
        }
      }
    } catch (e) {
      // ignore address fetch errors in cart page
    }
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      setIsCreatingOrder(true);

      // Convert cart items to order products format for calculation
      const products = cartItems.map((item) => {
        // Format dates to ISO string
        const startDate = new Date(item.start_date);
        const endDate = new Date(item.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        return {
          product: item.product._id,
          quantity: item.quantity || 1,
          size: item.size,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        };
      });

      const payload = {
        products,
        // promo_code: "", // Optional: could be added if you have a field for it
      };

      const response = await checkoutApiService.calculateCheckout(payload);

      if (response.success && response.data) {
        // Save response in global state
        setCheckoutData({
          ...response.data,
          addressId: selectedAddressId || undefined
        });
        // Redirect to checkout page
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
  // Compute blocked dates from other cart items for the edit modal
  // This prevents overlapping rentals of the same product
  const getBlockedDatesForItem = (currentItem: ApiCartItem) => {
    const otherItems = cartItems.filter(i => i._id !== currentItem._id && i.product._id === currentItem.product._id);
    return otherItems.map(item => ({
      start_date: item.start_date,
      end_date: item.end_date,
    }));
  };

  // Transform API cart item to CartItemCard props
  const transformCartItem = (item: ApiCartItem) => {
    // Safe date handling with fallbacks
    const startDate = item.start_date ? new Date(item.start_date) : new Date();
    const endDate = item.end_date ? new Date(item.end_date) : new Date();

    const monthStart = startDate.toLocaleDateString("en-US", { month: "short" });
    const monthEnd = endDate.toLocaleDateString("en-US", { month: "short" });

    const dateStr =
      monthStart === monthEnd
        ? `${startDate.getDate()}-${endDate.getDate()} ${monthStart}`
        : `${startDate.getDate()} ${monthStart} - ${endDate.getDate()} ${monthEnd}`;

    // Safe product data extraction
    const product = (item.product || {}) as any;
    const lender = (product as any)?.lender || {};
    const pricing = (item as any).pricing || {};

    // Safe image handling
    const imageSrc =
      product.cover_image ||
      (product.images && product.images[0]) ||
      "/assets/product-1.jpg";

    // Safe pricing calculations
    const rentalPrice = product.rental_price_per_day || 0;
    const discountedPrice = pricing.discountedPricePerDay || rentalPrice;
    const subtotal = pricing.subtotal || item.subtotal || 0;

    return {
      imageSrc,
      brand: product.brand || "No Brand",
      name: product.name || "Unnamed Product",
      description: product.description || "No description available",
      color: "White", // Default as per original
      size: item.size || "Standard",
      availability: "Available", // Default as per original
      rrp: `Rs.${discountedPrice}`,
      date: String(item.quantity),
      total: `Rs.${subtotal}`,
      lenderName: lender.name || "Lender",
      lenderAvatar: lender.avatar || "/assets/default-avatar.png",
      isTopLender: (lender as any).is_top_lender || false,
    };
  };

  const handleDeleteItem = (productId: string, productName: string) => {
    setDeletePopup({ isOpen: true, productId, productName });
  };

  const handleConfirmDelete = async () => {
    if (!deletePopup.productId) return;
    try {
      setDeleteLoading(true);
      const response = await cartApiService.removeFromCart(
        deletePopup.productId
      );
      if (response.success && response.data) {
        toast.success(response.message || "Item removed from cart");
        setCartItems(response.data.cart);
        setTotalAmount(response.data.total);
      } else {
        toast.error(response.message || "Failed to remove item");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    } finally {
      setDeleteLoading(false);
      handleCloseDeletePopup();
    }
  };

  const handleCloseDeletePopup = () => {
    setDeletePopup({ isOpen: false, productId: null, productName: "" });
  };

  const handleClearCart = async () => {
    try {
      setClearCartLoading(true);
      const response = await cartApiService.clearCart();

      if (response.success) {
        // Clear local state
        setCartItems([]);
        setTotalAmount(0);
        setSecurityDepositTotal(0);
        setCleaningFeeTotal(0);
        setServiceChargeTotal(0);

        // Clear cart store
        clearCartStore();

        toast.success(response.message || "Cart cleared successfully");
        setClearCartPopup({ isOpen: false });
      } else {
        toast.error(response.message || "Failed to clear cart");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to clear cart");
    } finally {
      setClearCartLoading(false);
    }
  };

  const handleSaveAddress = async (addressData: AddressData) => {
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
    } catch (error) {
      toast.error('Failed to add address. Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleMoveToWishlist = async (productId: string, productName: string) => {
    try {
      setMoveToWishlistLoading(productId);
      const response = await wishlistApiService.updateWishlist([productId]);
      if (response.success) {
        toast.success(`${productName} moved to wishlist successfully!`);
        const cartResponse = await cartApiService.removeFromCart(productId);
        if (cartResponse.success && cartResponse.data) {
          setCartItems(cartResponse.data.cart);
          setTotalAmount(cartResponse.data.total);
        }
      } else {
        toast.error(response.message || "Failed to move item to wishlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to move item to wishlist");
    } finally {
      setMoveToWishlistLoading(null);
    }
  };
  ////
  return (
    <ProtectedRoute
      fallback={
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Sign in to access your cart
          </h2>
          <p className="text-white/80">
            Please sign in to view and manage your cart items.
          </p>
        </div>
      }
    >
      <div className="relative w-full min-h-screen bg-[#FAF6F3] overflow-x-hidden ">
        <div className="flex flex-col items-center w-full">

          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: " Shopping Cart" }]} />

          {/* Main Cart Content */}
          {loading ? (
            <ShimmerCartPage />
          ) : (
            <div className="bg-[#FAF6F3] box-border content-stretch flex flex-col gap-[32px] items-center overflow-clip pb-20 lg:pb-[104px] pt-[40px] px-[20px] sm:px-[24px] lg:px-[40px] relative shrink-0 w-full ">
              {/* Cart Header */}
              <div className="box-border content-stretch flex flex-col gap-[16px] items-start  py-0 relative shrink-0 w-full">
                <div className="flex  items-center justify-between w-full">
                  <h1 className="font-['Canela'] font-medium leading-[32px] text-[24px] lg:text-[28px]text-[#3D1126] m-0 sm:mb-4">
                    Shopping Cart
                  </h1>
                  {cartItems.length > 0 && (
                    <button
                      onClick={() => setClearCartPopup({ isOpen: true })}
                      disabled={clearCartLoading}
                      className="font-poppins font-medium text-[14px] leading-[20px] sm:pt-2 text-[#6d6d6d] hover:text-[#3D1126] border border-[#d5d5d5] hover:border-[#6d6d6d] px-4 py-2 rounded-[8px] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed "
                    >
                      {clearCartLoading ? "Clearing..." : "Clear Cart"}
                    </button>
                  )}
                </div>
                <div className="bg-[#C7C7C7] h-px shrink-0 w-full" />
              </div>

              {/* Cart Items and Price Details */}
              <div className="box-border content-stretch flex flex-col lg:flex-row gap-[20px] items-start pb-[100px] pt-0  relative shrink-0 w-full">
                {/* Left Column - Cart Items */}
                <div className="lg:basis-0 content-stretch flex flex-col gap-[20px] lg:grow items-end min-h-px min-w-px relative shrink-0 w-full lg:w-auto">
                  {/* Delivery Address */}
                  <div className="bg-[#F3D6DC] border border-[#F3D6DC] border-solid box-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 relative w-full sm:h-[76px]">
                    <div className="flex flex-col gap-[4px] items-start relative shrink-0  w-full max-w-[320px]">
                      <p className="font-poppins leading-[20px] text-[#3D1126] text-[14px] m-0 w-full">
                        <span>Deliver to: </span>.
                        <span className="font-poppins font-bold text-[#3D1126]">
                          {primaryAddress ? `${primaryAddress.street_name} ${primaryAddress.house_number}${primaryAddress.house_number_suffix || ''}` : '—'}
                        </span>
                      </p>
                      {primaryAddress && (
                        <>
                          <p className="font-poppins leading-4 lg:leading-[16px] text-[#3D1126] text-xs lg:text-[12px] m-0">
                            <span>Address:</span> {primaryAddress.postal_code} {primaryAddress.city?.toUpperCase()}
                          </p>
                        </>
                      )}

                      {showAllAddresses && addresses.length > 0 && (
                        <div className="mt-2 border-t border-[#e4e0dd] pt-2 w-full">
                          {addresses.map((addr) => (
                            <div key={addr._id} className="flex flex-col sm:flex-row sm:items-start justify-between py-2 gap-2 sm:gap-0">
                              <div className="text-xs lg:text-[12px] text-[#3D1126] font-poppins pr-0 sm:pr-4">
                                <p className="m-0 font-medium text-[#3D1126]">{addr.label} • {addr.street_name} {addr.house_number}{addr.house_number_suffix || ''}</p>
                                <p className="m-0 font-semibold">{addr.postal_code} {addr.city?.toUpperCase()}</p>
                              </div>
                              {addr.is_primary ? (
                                <span className="text-xs lg:text-[12px] text-[#26b625] font-poppins">Primary</span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className=" flex flex-col items-end justify-end relative shrink-0 ml-auto">
                      <button
                        onClick={() => setIsChangeAddressOpen(true)}
                        className="border border-[#3D1126] h-[44px] min-w-[89px] flex items-center justify-center px-[16px] py-[12px] rounded-[8px] font-poppins font-medium text-[14px] text-[#3D1126] hover:bg-[#1A1A1A]/5 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="content-stretch flex flex-col gap-4 lg:gap-[16px] items-start relative shrink-0 w-full">
                    {error ? (
                      <div className="flex justify-center items-center py-6 lg:py-8 w-full">
                        <div className="text-red-600 text-center">
                          <h3 className="text-lg font-semibold mb-2">Error Loading Cart</h3>
                          <p>{error}</p>
                          <button
                            onClick={fetchCartData}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    ) : cartItems.length === 0 ? (
                      <div className="flex justify-center items-center py-6 lg:py-8 w-full text-center text-[#3D1126]">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Your cart is empty
                          </h3>
                          <p>Add some items to get started!</p>
                        </div>
                      </div>
                    ) : (
                      cartItems.map((item, index) => (
                        <CartItemCard
                          key={item._id || index}
                          {...transformCartItem(item)}
                          onEdit={() => setEditItem(item)}
                          onRemove={() => handleDeleteItem(item.product._id, item.product.name)}
                          onMoveToWishlist={() =>
                            handleMoveToWishlist(item.product._id, item.product.name)
                          }
                          isMoveToWishlistLoading={
                            moveToWishlistLoading === item.product._id
                          }
                          pricing={item.pricing}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column - Price Details */}
                <div className="w-full lg:w-1/3 relative lg:static">
                  <PriceDetails
                    itemCount={cartItems.length}
                    price={`Rs.${rentalAmountTotal}`}
                    securityDeposit={`Rs.${securityDepositTotal}`}
                    cleaningFee={`Rs.${cleaningFeeTotal}`}
                    serviceCharges={`Rs.${serviceChargeTotal}`}
                    totalAmount={`Rs.${grandTotal || totalAmount + securityDepositTotal + cleaningFeeTotal + serviceChargeTotal}`}
                  />
                </div>
              </div>

              {/* Place Order Button - Fixed at Bottom for mobile only */}
              <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-[50]">
                <div className="bg-[#FAF6F3] shadow-[0px_-2px_4px_rgba(0,0,0,0.25)] h-[104px] p-[24px] box-border flex flex-col justify-center items-end w-full">
                  <PrimaryButtonLight
                    text={isCreatingOrder ? "Creating Order..." : "Place Order"}
                    className="w-[134px] h-[56px] bg-[#1A1A1A] rounded-[8px] flex items-center justify-center p-[16px_20px] gap-[10px] cursor-pointer hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    textClassName="font-poppins font-medium text-[16px] leading-[24px] capitalize text-white"
                    onClick={handlePlaceOrder}
                    disabled={isCreatingOrder || cartItems.length === 0 || !selectedAddressId}
                  />
                </div>
              </div>

              {/* Place Order Button - Normal for desktop */}
              <div className="hidden lg:block absolute bottom-0 left-0 w-full">
                <div className="bg-[#FAF6F3] shadow-[0px_-2px_4px_rgba(0,0,0,0.25)] h-[104px] p-[24px] box-border flex flex-col justify-center items-end w-full ">
                  <PrimaryButtonLight
                    text={isCreatingOrder ? "Creating Order..." : "Place Order"}
                    className="w-[134px] h-[56px] bg-[#1A1A1A] rounded-[8px] flex items-center justify-center p-[16px_20px] gap-[10px] cursor-pointer hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    textClassName="font-poppins font-medium text-[16px] leading-[24px] capitalize text-white"
                    onClick={handlePlaceOrder}
                    disabled={isCreatingOrder || cartItems.length === 0 || !selectedAddressId}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer - Moved outside the main cart content */}


          {/* Change Address Popup */}
          {isChangeAddressOpen && (
            <ChangeAddressPopup
              isOpen={isChangeAddressOpen}
              onClose={() => setIsChangeAddressOpen(false)}
              addresses={addresses}
              selectedAddressId={selectedAddressId || primaryAddress?._id || null}
              onSelectAddress={(id) => {
                setSelectedAddressId(id);
                const selected = addresses.find((a) => a._id === id);
                if (selected) setPrimaryAddress(selected);
                setIsChangeAddressOpen(false);
              }}
              onAddNewAddress={() => {
                setIsChangeAddressOpen(false);
                setIsAddAddressOpen(true);
              }}
            />
          )}

          {/* Add Address Popup */}
          {isAddAddressOpen && (
            <AddAddressPopup
              isOpen={isAddAddressOpen}
              onClose={() => setIsAddAddressOpen(false)}
              onSave={handleSaveAddress}
              isLoading={isSavingAddress}
            />
          )}


          {/* Edit Cart Item Modal */}
          {editItem && (
            <ChangeCartItemDates
              isOpen={!!editItem}
              item={editItem}
              blockedDates={getBlockedDatesForItem(editItem)}
              onClose={() => setEditItem(null)}
              onSave={async ({ size, startDate, endDate, rentalDays }) => {
                try {
                  const resp = await cartApiService.updateCartItem({
                    cartItemId: editItem._id,
                    size,
                    startDate,
                    endDate,
                    rentalDays,
                  });
                  if (resp.success) {
                    toast.success(resp.message || 'Cart updated');
                    await fetchCartData();
                  } else {
                    toast.error(resp.message || 'Failed to update cart');
                  }
                } catch (e: any) {
                  toast.error(e?.message || 'Failed to update cart');
                }
              }}
            />
          )}


          <DeleteConfirmationPopup
            isOpen={deletePopup.isOpen}
            onClose={handleCloseDeletePopup}
            onConfirm={handleConfirmDelete}
            itemName={deletePopup.productName}
            isLoading={deleteLoading}
            context="cart"
          />

          {/* Clear Cart Confirmation Popup */}
          <DeleteConfirmationPopup
            isOpen={clearCartPopup.isOpen}
            onClose={() => setClearCartPopup({ isOpen: false })}
            onConfirm={handleClearCart}
            itemName="all items"
            isLoading={clearCartLoading}
            context="cart"
            customMessage="Are you sure you want to clear all items from your cart? This action cannot be undone."
          />
        </div>

      </div>
    </ProtectedRoute>
  );
}
