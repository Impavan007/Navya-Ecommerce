"use client";

import { useEffect, useState } from "react";
import ProductGallery from "../../../components/ProductGallery";
import InfoCard from "../../../components/InfoCard";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PrimaryButtonLight from "../../../components/PrimaryButtonLight";
import Breadcrumb from "../../../components/Breadcrumb";
import { useParams } from "next/navigation";
import { bookingsApiService } from "../../../services/api/bookings";
import { baseApiService } from "../../../services/api/base";
import toast from "react-hot-toast";

export default function ExtendBookingPage() {
  const routeParams = useParams();
  const id = (routeParams as { id: string }).id;

  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [extensionDays, setExtensionDays] = useState<number>(4);
  const [reason, setReason] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await bookingsApiService.getRenterBookingDetail(id);
        if (resp && resp.success !== false) {
          setBooking(resp.data || resp);
        } else {
          throw new Error(resp?.message || "Failed to load booking detail");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load booking detail");
        toast.error(e?.message || "Failed to load booking detail");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  const products = booking?.products || [];
  const selectedProduct = products[selectedProductIndex] || null;

  const handleRequestExtension = async () => {
    try {
      setIsLoading(true);
      if (!selectedProduct || !selectedProduct.productId) {
        throw new Error('Selected product is invalid');
      }

      const payload = {
        extensionDays: extensionDays,
        productIds: [selectedProduct.productId],
        reason: reason || undefined,
      };

      const reqResp = await bookingsApiService.extendBooking(id, payload)
      if (!reqResp || !reqResp.success) {
        throw new Error(reqResp?.message || 'Failed to create extension request');
      }

      const data = (reqResp.data || reqResp) as any;

      // If server returned a transaction id, use existing checkout flow
      const transactionId = data?.transaction?.id;
      if (transactionId) {
        const checkoutResp = await bookingsApiService.createCheckoutSession(transactionId, {
          successUrl: window.location.origin + `/bookings/${id}`,
          cancelUrl: window.location.origin + `/bookings/${id}`,
        });
        if (checkoutResp.success && checkoutResp.data?.sessionUrl) {
          window.location.href = checkoutResp.data.sessionUrl;
          return;
        }
        throw new Error(checkoutResp?.message || 'Failed to create checkout session');
      }

      // Otherwise call pay-extension with orderId returned by server
      const orderId = data?.orderId;
      if (orderId) {
        const payResp = (await baseApiService.post(`/renter/pay-extension/${orderId}`)) as any;
        if (!payResp || !payResp.success) throw new Error(payResp?.message || 'Failed to initiate payment for extension');
        const sessionUrl = payResp?.data?.sessionUrl || payResp?.data?.session?.url;
        if (sessionUrl) {
          window.location.href = sessionUrl;
          return;
        }

        // fallback: transaction id returned here
        const tx = payResp?.data?.transaction?.id;
        if (tx) {
          const checkoutResp2 = await bookingsApiService.createCheckoutSession(tx, {
            successUrl: window.location.origin + `/bookings/${id}`,
            cancelUrl: window.location.origin + `/bookings/${id}`,
          });
          if (checkoutResp2.success && checkoutResp2.data?.sessionUrl) {
            window.location.href = checkoutResp2.data.sessionUrl;
            return;
          }
        }
        throw new Error('Payment initiation did not return a redirect URL');
      }

      const directSession = data?.sessionUrl || data?.session?.url;
      if (directSession) {
        window.location.href = directSession;
        return;
      }

      throw new Error('Unexpected server response when creating extension');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to request extension');
      setError(e?.message || 'Failed to request extension');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB");
  };

  const addDays = (dateValue: any, days: number) => {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + days);
    return d;
  };

  const currentReturnDate =
    selectedProduct?.returnDate ||
    booking?.returnDate ||
    booking?.rentalPeriod?.endDate ||
    booking?.deliveryDetails?.returnDate ||
    null;

  const newReturnDate = addDays(currentReturnDate || new Date(), extensionDays);

  const extensionFeeLabel =
    booking?.priceDetails?.extensionFee ||
    booking?.priceDetails?.extension_fee ||
    booking?.priceDetails?.totalAmount ||
    "Extension Fee";

  return (
    <ProtectedRoute>
      <div className="bg-[#FAF6F3] content-stretch flex flex-col  items-start justify-center relative w-full  min-h-screen">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Orders", href: "/bookings" }, { label: "Orders" }, { label: "Extend Requests" }, { label: booking?.orderNumber || "Extend Order" }]} />

        {/* Constrain only the main row */}
        <div className="content-stretch flex flex-col items-start relative w-full max-w-[1442px] mx-auto ">

          {/* Title */}
          <div className="w-full px-4 lg:px-[50px] pt-4 lg:pt-[16px]">
            <p className="font-['Playfair_Display'] font-normal leading-[32px] lg:leading-[48px] text-3xl lg:text-[48px] text-black m-0 text-center lg:text-left">
              Extend
            </p>
          </div>

          {/* Content Row */}
          <div className="box-border flex flex-col lg:flex-row gap-6 lg:gap-6 items-start justify-center pb-8 lg:pb-8 pt-4 lg:pt-5 px-4 lg:px-8 relative w-full max-w-[1400px] mx-auto">
            {/* Left - Gallery */}
            <div className="w-full lg:flex-1 max-w-full">
              <ProductGallery
                coverImage={(selectedProduct?.productImages && selectedProduct.productImages[0]) || booking?.productImage || '/assets/product-1.jpg'}
                images={(selectedProduct?.productImages && selectedProduct.productImages.length) ? selectedProduct.productImages : (booking?.productImage ? [booking.productImage] : ['/assets/product-1.jpg'])}
              />
            </div>

            {/* Right - Extend panel */}
            <div className="flex flex-col gap-4 lg:gap-6 items-start w-full lg:flex-1 max-w-full">
              {/* Header Info */}
              <div className="flex flex-col gap-4 lg:gap-4 items-start w-full">
                <div className="flex flex-col gap-3 lg:gap-3 items-start w-full">
                  <p className="font-poppins leading-4 text-[#6d6d6d] text-xs m-0 text-center lg:text-left w-full">
                    Booking #{id}
                  </p>
                  <h1 className="font-['Playfair_Display'] font-bold leading-7 lg:leading-8 text-xl lg:text-2xl text-[#3D1126] m-0 w-full text-center lg:text-left">
                    {selectedProduct?.productName || booking?.productName || 'Product'}
                  </h1>
                  <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 items-center justify-center lg:justify-start w-full">
                    <p className="font-poppins leading-5 lg:leading-6 text-sm lg:text-base text-[#3D1126] m-0 text-center sm:text-left">
                      <span className="text-[#3D1126]">seller -</span> <span className="capitalize font-poppins font-medium">{selectedProduct?.seller || booking?.seller || ''}</span>
                    </p>
                    <p className="font-poppins leading-5 lg:leading-6 text-sm lg:text-base text-[#3D1126] m-0 text-center sm:text-left">
                      <span className="font-normal">Size:</span> {selectedProduct?.size || booking?.size || ''}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:gap-2 items-start w-full">
                  <p className="capitalize font-poppins font-medium leading-5 lg:leading-6 text-sm lg:text-base text-black m-0 w-full text-center lg:text-left">
                    Total: {booking?.priceDetails?.totalAmount ?? booking?.totalAmount ?? ''}
                  </p>
                </div>
              </div>

              {/* Extend Details Box */}
              <div className="bg-white box-border flex gap-4 lg:gap-4 items-center w-full px-4 lg:px-6 py-4 lg:py-6 rounded-lg border shadow-sm">
                <div className="flex flex-col gap-4 lg:gap-4 items-start w-full">
                  {/* Choose product when multiple */}
                  {products.length > 1 && (
                    <div className="w-full">
                      <p className="font-poppins text-sm mb-2 font-medium">Products in this booking:</p>
                      <div className="flex flex-wrap gap-2">
                        {products.map((p: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedProductIndex(idx)}
                            className={`px-3 py-2 rounded text-sm border transition-colors ${selectedProductIndex === idx
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {p.productName || `Product ${idx + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="w-full">
                    <p className="capitalize font-poppins font-medium text-sm text-black m-0 mb-2">Extension period</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[4, 7, 14, 30].map((d) => (
                        <button
                          key={d}
                          onClick={() => setExtensionDays(d)}
                          className={`px-3 py-2 rounded text-sm border transition-colors ${extensionDays === d
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {d} days
                        </button>
                      ))}
                    </div>

                    <label className="block text-sm text-[#3D1126] mb-2 font-medium">Reason (optional)</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Why do you need the extension?"
                      rows={3}
                    />
                  </div>

                  <div className="w-full">
                    <PrimaryButtonLight
                      text={isLoading ? 'Processing...' : 'Pay & Request Extension'}
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full bg-[#1A1A1A] hover:bg-[#1a1a1a] transition-colors text-white font-medium py-3 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards - full width */}
        <div className="box-border content-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-[16px] items-stretch p-4 lg:p-[40px] relative shrink-0 w-full">
          <InfoCard icon="/assets/security-deposit-icon.svg" title="Security Deposit :" description="For high-value items, a temporary hold may be placed on your payment card. This isn't charged and is released once the item is returned and inspected in good condition." />
          <InfoCard icon="/assets/service-fee-icon.svg" title="Service Fee Breakdown:" description="A 15% platform service fee is added at checkout to cover platform and support costs." />
          <InfoCard icon="/assets/late-return-icon.svg" title="Late Return Fee Information" description="Late returns may incur a daily late fee based on the item's rental price. If the delay is caused by a shipping carrier, this may be taken into consideration so be sure to keep evidence." />
        </div>

      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-[560px] rounded-[10px] shadow-lg relative p-6 sm:p-8">
            <button
              className="absolute top-4 right-4 text-xl text-[#3D1126] hover:opacity-70"
              onClick={() => setShowConfirmModal(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="flex flex-col items-center text-center gap-4 sm:gap-6 h-[90vh]">
              <div className="flex items-center justify-center size-[64px] rounded-full bg-[#fff4e6] border border-[#f7c26c]">
                <span className="text-[32px] text-[#f7b731]">!</span>
              </div>

              <div className="space-y-3">
                <h2 className="font-['Playfair_Display'] text-[24px] sm:text-[26px] text-[#3D1126] font-semibold m-0">
                  Request Order Extension
                </h2>
                <p className="font-poppins text-[14px] sm:text-[15px] leading-[22px] text-[#4a4a4a] m-0">
                  You’re enjoying your rental, but you need a little more time? Let your Lender know you’d like to extend your rental period.
                </p>
              </div>

              <div className="w-full bg-[#e9e1d2] p-4 sm:p-5 text-left">
                <p className="font-poppins font-semibold text-[14px] text-[#3D1126] mb-3">Details:</p>
                <div className="space-y-3 text-[14px] font-poppins text-[#3D1126]">
                  <div className="flex items-start justify-between gap-2 border-b border-[#d1c6b3] pb-2">
                    <span className="font-medium">Requested Extension Period:</span>
                    <span>{extensionDays} more days</span>
                  </div>
                  {/* <div className="flex items-start justify-between gap-2 border-b border-[#d1c6b3] pb-2">
                    <span className="font-medium">Current Return Date:</span>
                    <span>{formatDate(currentReturnDate)}</span>
                  </div> */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#d1c6b3] pb-2">
                    <span className="font-medium">New Requested Return Date:</span>
                    <span>{formatDate(newReturnDate)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">Additional Charge:</span>
                    <span>Rs.{extensionFeeLabel} for {extensionDays} additional days</span>
                  </div>
                </div>
              </div>

              <p className="font-poppins text-[12px] sm:text-[13px] text-[#4a4a4a] leading-[18px] m-0">
                After submitting request you will get a notification from lender for payment request if order approves
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  className="border border-[#3D1126] px-6 py-3 font-poppins text-[14px] text-[#3D1126] bg-white hover:bg-gray-50"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isLoading}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="bg-[#1A1A1A] text-white px-6 py-3 font-poppins text-[14px] hover:bg-[#1f1b22] disabled:opacity-60"
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleRequestExtension();
                  }}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? "Processing..." : "Request Extension"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
