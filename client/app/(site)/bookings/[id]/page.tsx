"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import ConfirmationModal from "../../components/ConfirmationModal";
import Image from "next/image";
import Link from "next/link";
import CommonLoader from "@/app/components/common/CommonLoader";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, ChangeEvent, useMemo } from "react";
import { bookingsApiService } from "../../services/api/bookings";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import Breadcrumb from "../../components/Breadcrumb";
import {
  Send,
  CheckCircle2,
  CreditCard,
  CheckCircle,
  Package,
  AlertCircle,
  Truck,
  Heart,
  RotateCcw,
  Store,
  CheckCheck
} from "lucide-react";
import ChatSidebar from "../../components/ChatSidebar";
import {
  StarIcon,
  BookingsMessageicon,
  RequestSentIcons,
  LenderAcceptedIcon,
  PaymentProceed,
  OrderConfirmedIcon,
  PreparedForDelivery,
  OrderDelayIcon,
  ItemDelivered,
  EnjoyRentalIcon,
  ReturnDue,
  ItemReturned,
  Completed
} from "../../icons/icons";

export default function BookingDetailPage() {
  const routeParams = useParams();
  const router = useRouter();
  const id = (routeParams as { id: string }).id;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showConfirmDeliveryModal, setShowConfirmDeliveryModal] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryProofs, setDeliveryProofs] = useState<File[]>([]);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const searchParams = useSearchParams();

  // Handle automatic chat opening from notifications
  useEffect(() => {
    if (searchParams.get('openChat') === 'true') {
      setIsChatOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await bookingsApiService.getRenterBookingDetail(id);
        if (resp && (resp as any).success !== false) {
          setDetail((resp as any).data);
        } else {
          throw new Error((resp as any)?.message || "Failed to load booking detail");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load booking detail");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const timelineSteps = useMemo(() => {
    const base: any[] = [
      { display: "Request Sent", key: "Awaiting Lender Acceptance", Icon: RequestSentIcons },
      { display: "Lender Accepted", key: "Lender Accepted", Icon: LenderAcceptedIcon },
      { display: "Payment", key: "Confirmed", Icon: PaymentProceed },
      { display: "Preparing Shipment", key: "Preparing Shipment", Icon: PreparedForDelivery },
      { display: "Shipped", key: "Shipped", Icon: Truck },
      { display: "Delivered", key: "Delivered", Icon: ItemDelivered },
      { display: "Enjoy Your Rental", key: "Active", Icon: EnjoyRentalIcon },
      { display: "Return", key: "Return", Icon: ReturnDue },
      { display: "Completed", key: "Completed", Icon: Completed }
    ];

    const history = detail?.timeline || [];
    const titles = history.map((t: any) => t.title?.toLowerCase());
    const currentStatus = detail?.currentStatus?.toLowerCase();

    // Define terminal titles
    const terminalTitles = ['cancelled', 'returned', 'lender rejected', 'refunded', 'disputed'];
    const isTerminal = terminalTitles.some(t => titles.includes(t) || currentStatus === t);

    // Initial steps: base + specific conditionals
    let steps = [...base];

    // Conditional: Lender Rejected (often terminal anyway but handled specifically here)
    if (titles.includes('lender rejected')) {
      steps.splice(1, 0, { display: "Lender Rejected", key: "Lender Rejected", Icon: AlertCircle, color: "red" });
    }

    // Conditional: Payment Pending
    if (titles.includes('payment pending')) {
      steps.splice(2, 0, { display: "Payment Pending", key: "Payment Pending", Icon: CreditCard });
    }

    // Conditional: In Transit
    if (titles.includes('in transit')) {
      const shippedIdx = steps.findIndex(s => s.key === 'Shipped');
      if (shippedIdx !== -1) {
        steps.splice(shippedIdx + 1, 0, { display: "In Transit", key: "In Transit", Icon: Truck });
      }
    }

    // Conditional: Late Deliveries
    if (titles.includes('late delivery - lender fault')) {
      steps.push({ display: "Late Delivery - Lender Fault", key: "Late Delivery - Lender Fault", Icon: AlertCircle, color: "red" });
    }
    if (titles.includes('late delivery - carrier fault')) {
      steps.push({ display: "Late Delivery - Carrier Fault", key: "Late Delivery - Carrier Fault", Icon: AlertCircle, color: "red" });
    }

    // Final logic: If terminal, truncate to ONLY what happened + terminal step
    if (isTerminal) {
      const terminalSteps: any[] = [];
      const actualTerminal = terminalTitles.find(t => titles.includes(t) || currentStatus === t || titles.some(title => title.includes(t)));

      // Collect all steps that have occurred
      steps.forEach(s => {
        const hasOccurred = history.some(h =>
          h.title?.toLowerCase() === s.key.toLowerCase() ||
          h.title?.toLowerCase() === s.display.toLowerCase() ||
          h.title?.toLowerCase().includes(s.key.toLowerCase())
        );
        if (hasOccurred) {
          terminalSteps.push(s);
        }
      });

      // Add the terminal step if it's missing from the already matched steps
      const terminalDisplayMap: Record<string, any> = {
        'cancelled': { display: "Cancelled", key: "Cancelled", Icon: AlertCircle, color: "red" },
        'returned': { display: "Returned", key: "Returned", Icon: ItemReturned, color: "#0D9488" },
        'lender rejected': { display: "Lender Rejected", key: "Lender Rejected", Icon: AlertCircle, color: "red" },
        'refunded': { display: "Refunded", key: "Refunded", Icon: CheckCircle, color: "red" },
        'disputed': { display: "Disputed", key: "Disputed", Icon: AlertCircle, color: "red" }
      };

      if (actualTerminal && !terminalSteps.some(s => s.key?.toLowerCase() === actualTerminal)) {
        terminalSteps.push(terminalDisplayMap[actualTerminal]);
      }

      return terminalSteps;
    }

    // Terminal states for non-terminal flow (shouldn't happen with the logic above, but kept for safety)
    if (titles.includes('cancelled')) {
      steps.push({ display: "Cancelled", key: "Cancelled", Icon: AlertCircle, color: "red" });
    }
    if (titles.includes('refunded')) {
      steps.push({ display: "Refunded", key: "Refunded", Icon: CheckCircle, color: "red" });
    }
    if (titles.includes('disputed')) {
      steps.push({ display: "Disputed", key: "Disputed", Icon: AlertCircle, color: "red" });
    }

    return steps;
  }, [detail?.timeline, detail?.currentStatus]);

  const generatePDFInvoice = () => {
    if (!detail) return;

    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Colors matching your theme
      const primaryColor = [44, 41, 48] as [number, number, number]; // #3D1126
      const secondaryColor = [125, 125, 125] as [number, number, number]; // #7d7d7d

      // Header
      doc.setFillColor((primaryColor as any)[0], (primaryColor as any)[1], (primaryColor as any)[2]);
      doc.rect(0, 0, pageWidth, 50, 'F');

      // Logo and title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('NAVYAA', margin, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("Amsterdam's Circular Wardrobe", margin, 35);

      // Invoice title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('INVOICE', pageWidth - margin - 30, 25);

      yPosition = 65;

      // Invoice details
      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.text(`Invoice No: INV-${(detail as any).orderId || id}`, margin, yPosition);
      doc.text(`Date: ${new Date().toLocaleDateString('nl-NL')}`, margin, yPosition + 6);

      yPosition += 20;

      // Customer Information
      doc.setFont('helvetica', 'bold');
      doc.text('BILLED TO:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text((detail as any).deliveryDetails?.deliverTo || 'Customer', margin + 25, yPosition);

      const addressLines = doc.splitTextToSize((detail as any).deliveryDetails?.address || '', pageWidth - 2 * margin);
      doc.text(addressLines, margin + 25, yPosition + 6);

      // Product Information
      yPosition += 25;
      doc.setFont('helvetica', 'bold');
      doc.text('PRODUCT:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text((detail as any).productName || 'N/A', margin + 25, yPosition);

      doc.text(`Size: ${(detail as any).size || 'N/A'}`, margin, yPosition + 6);
      doc.text(`seller: ${(detail as any).seller || 'N/A'}`, margin, yPosition + 12);
      doc.text(`Rental Period: ${(detail as any).rentalPeriod || 'N/A'}`, margin, yPosition + 18);

      yPosition += 30;

      // Price Breakdown
      doc.setFont('helvetica', 'bold');
      doc.text('PRICE BREAKDOWN', margin, yPosition);
      doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);

      yPosition += 10;

      // Price items - using the same data as displayed on page
      const priceItems = [
        { label: 'Rental Price', value: (detail as any).priceDetails?.price || 0 },
        { label: 'Security Deposit', value: (detail as any).priceDetails?.securityDeposit || 0 },
        { label: 'Cleaning Fee', value: (detail as any).priceDetails?.cleaningFee || 0 },
        { label: 'Service Charges', value: (detail as any).priceDetails?.serviceCharges || 0 }
      ];

      priceItems.forEach((item, index) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor((secondaryColor as any)[0], (secondaryColor as any)[1], (secondaryColor as any)[2]);
        doc.text(item.label, margin, yPosition + (index * 8));

        doc.setTextColor((primaryColor as any)[0], (primaryColor as any)[1], (primaryColor as any)[2]);
        doc.text(`Rs.${item.value}`, pageWidth - margin - 20, yPosition + (index * 8));
      });

      yPosition += (priceItems.length * 8) + 15;

      // Total
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('TOTAL AMOUNT', margin, yPosition);
      doc.text(`Rs.${(detail as any).priceDetails?.totalAmount || 0}`, pageWidth - margin - 20, yPosition);

      yPosition += 20;

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);

      const footerText = [
        'Navyaa B.V. | Amsterdam, Netherlands',
        'KVK: 12345678 | VAT: NL123456789B01',
        'info@navyaa.com | +31 20 123 4567',
        'Circular Fashion Platform',
        'Computer-generated invoice - No signature required'
      ];

      footerText.forEach((line, index) => {
        doc.text(line, pageWidth / 2, yPosition + (index * 4), { align: 'center' });
      });

      // Save PDF
      const fileName = `Navyaa-Invoice-${(detail as any).orderId || id}.pdf`;
      doc.save(fileName);

      toast.success("Invoice downloaded successfully!");

    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  const handleCancelBooking = async () => {
    try {
      setCancelLoading(true);
      await bookingsApiService.cancelBooking(id, "User confirmed cancellation");
      toast.success("Order cancelled successfully.");
      setDetail((prev: any) => (prev ? { ...prev, status: "Cancelled" } : prev));
      setShowCancelModal(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel order.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeliveryProofChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const updatedFiles = [...deliveryProofs, ...files];
    if (updatedFiles.length > 3) {
      toast.error('You can upload up to 3 images.');
    }
    setDeliveryProofs(updatedFiles.slice(0, 3));
    event.target.value = '';
  };

  const handleRemoveProof = (index: number) => {
    setDeliveryProofs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetConfirmDeliveryForm = () => {
    setDeliveryNote('');
    setDeliveryProofs([]);
  };

  const closeConfirmDeliveryModal = () => {
    setShowConfirmDeliveryModal(false);
    resetConfirmDeliveryForm();
  };

  const handleConfirmDelivery = async () => {
    if (!deliveryProofs.length) {
      toast.error('Please upload at least one proof image.');
      return;
    }

    try {
      setIsConfirmingDelivery(true);
      await bookingsApiService.confirmDelivery(id, {
        note: deliveryNote.trim() || undefined,
        proof: deliveryProofs,
      });
      toast.success('Delivery confirmation submitted.');
      setShowConfirmDeliveryModal(false);
      resetConfirmDeliveryForm();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to confirm delivery.');
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  const handleRetryPayment = async () => {
    if (!detail?.transactionId) {
      toast.error("Transaction ID not found");
      return;
    }

    try {
      setIsRetryingPayment(true);
      const checkoutData = {
        successUrl: `${window.location.origin}/bookings/${id}?payment=success`,
        cancelUrl: `${window.location.origin}/bookings/${id}?payment=cancelled`,
      };

      const response = await bookingsApiService.retryPayment(detail.transactionId, checkoutData);

      if (response?.data?.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = (response.data as any)?.sessionUrl || (response.data as any)?.session?.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to retry payment");
    } finally {
      setIsRetryingPayment(false);
    }
  };

  // Check if actions should be disabled
  const isCancelled = detail?.currentStatus?.toLowerCase() === 'cancelled';
  const isReturned = detail?.currentStatus?.toLowerCase() === 'returned';
  const shouldDisableActions = isCancelled || isReturned;

  ////

  if (isLoading) {
    return <CommonLoader pageCenter />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 font-poppins">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-[#FAF6F3] min-h-screen">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "My Orders", href: "/bookings" },
            { label: detail?.orderNumber },
          ]}
        />

        <div className=" mx-auto px-[20px] lg:px-[40px] py-5 flex flex-col lg:flex-row gap-8">

          {/* LEFT SECTION */}
          <div className="flex-1 space-y-6 border-r border-[#E5E5E5] pr-8 shadow-sm">

            {/* Product Card Only */}
            <div className="flex flex-col lg:flex-row gap-6 w-full">

              {/* Product Card */}
              <div className="bg-[#F3D6DC] border border-[#F3D6DC] rounded-xl p-6 w-full flex flex-col lg:flex-row items-center lg:items-start gap-6 flex-1 text-center lg:text-left">
                <div className="relative w-32 h-40 rounded overflow-hidden flex-shrink-0">
                  {detail?.productImage && (
                    <Image
                      src={detail.productImage}
                      alt={detail.productName || "Product"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg break-words">
                      {detail?.productName}
                    </h3>
                    {detail?.currentStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${detail.currentStatus.toLowerCase() === 'cancelled' ? 'bg-[#FFE4E6] text-[#C1121F]' :
                        detail.currentStatus.toLowerCase() === 'returned' ? 'bg-[#F0FDFA] text-[#0D9488]' :
                          detail.currentStatus.toLowerCase() === 'delivered' ? 'bg-[#F0FDFA] text-[#0D9488]' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {detail.currentStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">Size: {detail?.size}</p>
                  <p className="text-sm">From: Rs.{detail?.price}</p>
                  <p className="text-sm">
                    Rental Period: {detail?.rentalPeriod}
                  </p>
                </div>
              </div>

            </div>


            {/* Timeline */}
            {/* Timeline */}

            <div className="relative mt-6 w-full max-w-2xl lg:max-w-3xl flex flex-col">
              {timelineSteps.map((step, index, arr) => {

                const matchedStatus =
                  detail?.timeline?.find(
                    (t: any) =>
                      t.title?.toLowerCase() === step.key.toLowerCase()
                  ) ||
                  detail?.timeline?.find(
                    (t: any) =>
                      t.title?.toLowerCase() === step.display.toLowerCase()
                  ) ||
                  detail?.timeline?.find(
                    (t: any) =>
                      t.title?.toLowerCase().includes(step.key.toLowerCase())
                  );

                /* -------- Determine Current Step -------- */

                const completedIndexes = arr
                  .map((s, i) => {
                    const found =
                      detail?.timeline?.find(
                        (t: any) =>
                          t.title?.toLowerCase() === s.key.toLowerCase() ||
                          t.title?.toLowerCase() === s.display.toLowerCase()
                      );
                    return found ? i : -1;
                  })
                  .filter((i) => i !== -1);

                const currentIndex =
                  completedIndexes.length > 0
                    ? Math.max(...completedIndexes)
                    : -1;

                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isActive = !!matchedStatus;

                const isDelayed =
                  isActive &&
                  (step.color === 'red' ||
                    step.key === "Order Delay" ||
                    step.key.toLowerCase().includes("cancel"));

                /* -------- DEFAULT STYLES -------- */

                let cardBg = "bg-white";
                let iconBg = "bg-[#F2F4F7]";
                let imageFilter = "";
                let iconColor = "#9CA3AF"; // Default light gray

                /* 🔴 DELAY / CANCELLED / RED STATUS */
                if (isDelayed || step.color === 'red') {
                  cardBg = "bg-[#FFF1F2]";
                  iconBg = "bg-[#FFF1F2]";
                  imageFilter = "brightness(0) saturate(100%) sepia(20%) hue-rotate(330deg)";
                  iconColor = "#C1121F";
                }

                /* 🔵 CURRENT */
                else if (isCurrent) {
                  cardBg = "bg-[#F0FDFA]";
                  iconBg = "bg-[#2DD4BF]";
                  imageFilter = "brightness(0) invert(1)";
                  iconColor = "#0D9488";
                }

                /* ✅ COMPLETED */
                else if (isCompleted || isActive) {
                  cardBg = "bg-[#F3D6DC]";
                  iconBg = "bg-[#CCFBF1]";
                  imageFilter = "brightness(0) saturate(100%) sepia(40%) hue-rotate(150deg)";
                  iconColor = "#0D9488";
                }

                return (
                  <div key={step.key} className="relative w-full pb-6 last:pb-0">

                    {/* Timeline Line - Centered and Color-coded */}
                    <div className="absolute left-[38px] top-0 bottom-0 w-[2px] z-0 flex flex-col">
                      {/* Top segment: from top edge to middle of icon */}
                      <div
                        className={`w-full flex-grow-0 ${index === 0
                          ? "h-0"
                          : index <= currentIndex
                            ? "bg-[#0D9488]"
                            : "bg-[#E5E7EB]"
                          }`}
                        style={{ height: "38px" }}
                      />
                      {/* Bottom segment: from middle of icon to bottom edge */}
                      <div
                        className={`w-full flex-grow ${index === arr.length - 1
                          ? "h-0"
                          : index < currentIndex
                            ? "bg-[#0D9488]"
                            : "bg-[#E5E7EB]"
                          }`}
                      />
                    </div>

                    {/* Card */}
                    <div className={`relative z-10 w-full rounded-xl p-4 border border-[#E5E7EB] ${cardBg} flex gap-4 items-center`}>

                      <div className="flex-shrink-0 relative z-20">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center ${iconBg}`}
                        >
                          <step.Icon color={iconColor} size={20} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 relative z-20">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold font-['Poppins'] text-sm text-[#111827]">
                              {step.display}
                            </p>
                            {step.color === 'red' && (
                              <span className="px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#C1121F] text-[10px] font-bold uppercase tracking-wider">
                                Issue
                              </span>
                            )}
                          </div>

                          {matchedStatus && (
                            <p className="text-xs font-['Poppins'] text-[#6B7280] font-medium">
                              {new Date(matchedStatus.date).toLocaleString([], {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          )}
                        </div>

                        {matchedStatus?.note && (
                          <p className="mt-2 text-sm text-[#374151] whitespace-pre-wrap break-words">
                            {matchedStatus.note}
                          </p>
                        )}
                        {step.key === "In Transit" && isActive && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const trackingNo = detail?.deliveryDetails?.trackingNumber;
                                if (id) {
                                  router.push(`/bookings/${id}/track-shipment`);
                                } else {
                                  router.push(`/track-shipment`);
                                }
                              }}
                              className="bg-[#111827] text-white px-[14px] py-[8px] rounded-[6px] text-[13px] font-medium flex items-center gap-[6px] hover:bg-gray-800 transition-colors w-fit"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              Track Shipment
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>






            {!shouldDisableActions && (
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => router.push(`/bookings/${id}/extend`)}
                  disabled={!detail?.actions?.canExtend}
                  className={`bg-[#EFD8DB] px-5 py-4 rounded-lg text-sm ${!detail?.actions?.canExtend ? "opacity-50 cursor-not-allowed" : "hover:bg-[#E5C1C6] transition-colors"
                    }`}
                >
                  Extend
                </button>

                <button
                  onClick={() => router.push(`/bookings/${id}/return`)}
                  disabled={!detail?.actions?.canReturn}
                  className={`bg-[#EFD8DB] px-5 py-4 rounded-lg text-sm ${!detail?.actions?.canReturn ? "opacity-50 cursor-not-allowed" : "hover:bg-[#E5C1C6] transition-colors"
                    }`}
                >
                  Return
                </button>

                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={!detail?.actions?.canCancel}
                  className={`border border-black px-5 py-4 rounded-lg text-sm ${!detail?.actions?.canCancel ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 transition-colors"
                    }`}
                >
                  Cancel Order
                </button>
              </div>
            )}

            {(detail?.review?.hasRated || detail?.actions?.hasRated) ? (
              <div className="bg-white rounded-xl p-6 border mt-6 font-poppins">
                <p className="font-medium pb-2">Your Review</p>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      size={20}
                      color={i < (detail?.review?.rating || 0) ? "#3D1126" : "#D5D5D5"}
                    />
                  ))}
                </div>
                {detail?.review?.comment && (
                  <p className="text-sm text-[#3D1126] italic bg-[#FAF6F3] p-3 rounded-lg border border-[#eee]">
                    "{detail.review.comment}"
                  </p>
                )}
                {detail?.review?.reviewedAt && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    Reviewed on {new Date(detail.review.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : detail?.actions?.canRate ? (
              <div className="bg-white rounded-xl p-6 border mt-6">
                <p className="font-medium pb-2">Rate Your Experience</p>
                <p className="text-sm text-[#3D1126] font-poppins mb-4">You haven't rated this product yet.</p>
                <button
                  onClick={() => {
                    const product = detail?.products?.[0] || detail;
                    // Use orderId or the route id for the order parameter
                    const orderParam = detail?.orderId || id;
                    const lenderParam = product?.lenderId || detail?.sellerId || "";
                    const productId = product?.productId || detail?.productId || "";

                    const url = `/review/${encodeURIComponent(productId)}?order=${encodeURIComponent(orderParam)}&lender=${encodeURIComponent(lenderParam)}&name=${encodeURIComponent(detail.productName || "")}&image=${encodeURIComponent(detail.productImage || "")}&size=${encodeURIComponent(detail.size || "")}&price=${encodeURIComponent("Rs." + String(detail.price ?? ""))}&period=${encodeURIComponent(detail.rentalPeriod || "")}`;
                    router.push(url);
                  }}
                  className="bg-[#1A1A1A] text-white px-6 py-2 rounded-lg text-sm hover:bg-black transition-colors"
                >
                  Rate now
                </button>
              </div>
            ) : null}
          </div>

          {/* RIGHT SECTION */}
          <div className="w-full lg:w-[420px] space-y-6">

            {/* Delivery Details */}
            <div className="bg-[#EFD8DB] p-6 ">

              {/* Delivery Details */}
              <h4 className="font-medium text-[16px] mb-4">Delivery Details</h4>

              {/* Address */}
              <div className="flex gap-3 border-b border-[#D9B8BE] pb-4">
                <div className="bg-[#E7C5CA] p-2 rounded-lg h-fit">
                  {/* Location Icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#3D1126" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 6-9 11-9 11S3 16 3 10a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#6B5E63] mb-1">Delivery Address</p>
                  <p className="text-sm">
                    {detail?.deliveryDetails?.address?.street_name ? (
                      `${detail.deliveryDetails.address.street_name} ${detail.deliveryDetails.address.house_number || ''} ${detail.deliveryDetails.address.house_number_suffix || ''}`
                    ) : (
                      detail?.deliveryDetails?.address?.street || ""
                    )},{" "}
                    {detail?.deliveryDetails?.address?.city}
                  </p>
                  <p className="text-sm">
                    {detail?.deliveryDetails?.address?.postal_code},{" "}
                    {detail?.deliveryDetails?.address?.country}
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex gap-3 border-b border-[#D9B8BE] py-4">
                <div className="bg-[#E7C5CA] p-2 rounded-lg h-fit">
                  {/* Phone Icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#3D1126" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2
          19.79 19.79 0 0 1-8.63-3.07
          19.5 19.5 0 0 1-6-6
          19.79 19.79 0 0 1-3.07-8.67
          A2 2 0 0 1 4.11 2h3
          a2 2 0 0 1 2 1.72
          12.84 12.84 0 0 0 .7 2.81
          2 2 0 0 1-.45 2.11L8.09 9.91
          a16 16 0 0 0 6 6l1.27-1.27
          a2 2 0 0 1 2.11-.45
          12.84 12.84 0 0 0 2.81.7
          A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#6B5E63] mb-1">Mobile Number</p>
                  <p className="text-sm">
                    {detail?.deliveryDetails?.address?.mobileNumber || detail?.deliveryDetails?.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Tracking */}
              <div className="flex gap-3 pt-4">
                <div className="bg-[#E7C5CA] p-2 rounded-lg h-fit">
                  {/* Truck Icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#3D1126" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#6B5E63] mb-1">Tracking Number</p>
                  <p className="text-sm">
                    {detail?.deliveryDetails?.trackingNumber}
                  </p>
                </div>
              </div>

              {/* Price Details */}
              <h4 className="font-medium text-[16px] mt-8 mb-4">Price Details</h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-[#D9B8BE] pb-3">
                  <span>Price</span>
                  <span>Rs.{detail?.priceDetails?.price}</span>
                </div>

                <div className="flex justify-between border-b border-[#D9B8BE] pb-3">
                  <span>Security deposit</span>
                  <span>Rs.{detail?.priceDetails?.securityDeposit}</span>
                </div>

                <div className="flex justify-between border-b border-[#D9B8BE] pb-3">
                  <span>Cleaning fee</span>
                  <span>Rs.{detail?.priceDetails?.cleaningFee}</span>
                </div>

                <div className="flex justify-between border-b border-[#D9B8BE] pb-3">
                  <span>Service charges</span>
                  <span>Rs.{detail?.priceDetails?.serviceCharges}</span>
                </div>

                <div className="flex justify-between font-medium pt-3">
                  <span>Total Amount</span>
                  <span>Rs.{detail?.priceDetails?.totalAmount}</span>
                </div>
              </div>

              <button
                onClick={generatePDFInvoice}
                className="mt-6 w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-sm"
              >
                Download Invoice
              </button>

            </div>


            {/* Return Deadline Card */}
            <div className="bg-[#EFD8DB] rounded-xl p-6">
              <p className="text-sm">Return Deadline</p>
              <p className="text-2xl font-['canela'] font-medium text-[#C1121F] mt-2">
                {detail?.currentStatus?.toLowerCase() === 'delivered'
                  ? `${detail?.return_date ?? 0} days left`
                  : "Product is not delivered"}
              </p>
              <button
                onClick={() => router.push(`/bookings/${id}/return`)}
                disabled={detail?.currentStatus?.toLowerCase() !== 'delivered'}
                className={`mt-6 w-full py-3 rounded-lg text-sm transition-colors ${detail?.currentStatus?.toLowerCase() === 'delivered' ? 'bg-[#1A1A1A] text-white hover:bg-black' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Return Order
              </button>
            </div>

          </div>
        </div>


        {detail && (
          <ChatSidebar
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            lenderName={detail?.seller || "Lender"}
            lenderImage={detail?.sellerImage}
            productName={detail?.productName || "Product"}
            productImage={detail?.productImage || ""}
            lenderId={detail?.products?.[0]?.lenderId || detail?.sellerId}
            productId={detail?.products?.[0]?.productId || detail?.productId}
            orderId={detail?.orderId}
            chatId={detail?.chatId}
          />
        )}

        {showCancelModal && (
          <ConfirmationModal
            title="Cancel Order"
            message="Are you sure you want to cancel this order? This action cannot be undone."
            confirmLabel="Confirm Cancellation"
            cancelLabel="Keep Order"
            onConfirm={handleCancelBooking}
            onCancel={() => setShowCancelModal(false)}
            loading={cancelLoading}
          />
        )}
      </div>
    </ProtectedRoute>
  );

}
