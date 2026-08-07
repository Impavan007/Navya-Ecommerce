'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '../../stores/orders/orderStrore';
import { useOrderActionStore } from '../../stores/orders/actionsStore';
import { toast } from 'react-hot-toast';
import { useLenderOrderStore } from '../../stores/orders/orderStrore';
import { FaEye } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { RiCloseLine } from 'react-icons/ri';
import CommonLoader from '../../../components/common/CommonLoader';
import axiosClient from '../../LenderAPi/Axiosclient';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

const formatDate = (date: string | undefined) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '—';
  }
};

const AvatarCircle = ({
  name,
  src,
  size = 'w-12 h-12',
  textSize = 'text-base',
  className = '',
}: {
  name?: string;
  src?: string | null;
  size?: string;
  textSize?: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

interface OrderDetailModalProps {
  order?: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const router = useRouter();

  const [showExtensionDetails, setShowExtensionDetails] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isFetchingTracking, setIsFetchingTracking] = useState(false);

  // Single tracking details object
  const [trackingDetails, setTrackingDetails] = useState({
    trackingNumber: '',
    trackingLink: '',
    shippingProvider: '',
  });
  const [shipmentProofs, setShipmentProofs] = useState<File[]>([]);

  const { loading, error, success, updateOrderStatus } = useOrderActionStore();

  // Use selected order from lender store (store fetches full order by id when table row clicked)
  const { selectedOrder, fetchOrderById, isFetchingOrder, acceptExtension: storeAcceptExtension, rejectExtension: storeRejectExtension } = useLenderOrderStore();
  // compute effective order data (prefer store-selected order)
  const orderData = selectedOrder ?? order;

  // Fetch tracking data if order is shipped/active/delivered/completed
  useEffect(() => {
    const fetchTrackingInfo = async () => {
      if (!orderData?.id) return;

      const status = orderData.status?.toLowerCase();
      const trackingStatuses = ['shipped', 'active', 'delivered', 'completed', 'return'];

      if (trackingStatuses.includes(status)) {
        try {
          setIsFetchingTracking(true);
          const response = await axiosClient.get(`/lender/orders/${orderData.id}/tracking`);
          if (response.data?.success) {
            setTrackingData(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching tracking data:', error);
        } finally {
          setIsFetchingTracking(false);
        }
      }
    };

    fetchTrackingInfo();
  }, [orderData?.id, orderData?.status]);

  // --- Extension helpers & actions ---
  const findExtensionForItem = (item: any) => {
    const extList = orderData?.metadata?.extensionRequests || orderData?.extensions || orderData?.extensionRequests || [];
    if (!extList || !extList.length) return null;

    const extensionIndex = extList.findIndex((e: any) => {
      const pid = item?.id?._id || item?.id;
      const reqPid = e?.productId;
      return String(reqPid) === String(pid);
    });

    if (extensionIndex === -1) return null;

    return {
      ...extList[extensionIndex],
      extensionIndex, // Add the index to the extension object
      orderId: orderData?.id // Add order ID
    };
  };

  const handleAcceptExtension = async (ext: any) => {
    const key = `ext:accept:${ext?.extensionIndex ?? 'na'}`;
    setActionLoading(key);
    try {
      const payload = {
        action: "approve",
        extensionRequestId: ext.extensionIndex.toString(),
        reason: "Extension approved by lender"
      };

      const response = await storeAcceptExtension({
        orderId: ext.orderId || orderData?.id,
        payload: payload
      });
      if (response?.message) toast.success(response.message);
      setShowExtensionDetails(false);
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message;
      if (msg) toast.error(msg);
      onClose();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectExtension = async (ext: any, reason?: string) => {
    const key = `ext:reject:${ext?.extensionIndex ?? 'na'}`;
    setActionLoading(key);
    try {
      const rejectionReasonText = reason || "Cannot approve extension due to conflicts with next booking";
      const payload = {
        action: "reject",
        extensionRequestId: ext.extensionIndex.toString(),
        reason: rejectionReasonText
      };

      const response = await storeRejectExtension({
        orderId: ext.orderId || orderData?.id,
        payload: payload
      });
      if (response?.message) toast.success(response.message);
      setShowExtensionDetails(false);
      setRejectionReason('');
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message;
      if (msg) toast.error(msg);
      onClose();
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    status = status.toLowerCase();
    const styles: Record<string, string> = {
      requested: 'bg-blue-50 text-blue-800 border border-blue-200',
      upcoming: 'bg-blue-50 text-blue-800 border border-blue-200',
      confirmed: 'bg-blue-50 text-blue-800 border border-blue-200',
      shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
      active: 'bg-gray-100 text-gray-800 border border-gray-300',
      return: 'bg-purple-50 text-purple-800 border border-purple-200',
      completed: 'bg-green-50 text-green-800 border border-green-200',
      cancelled: 'bg-red-50 text-red-800 border border-red-200',
      disputed: 'bg-red-50 text-red-800 border border-red-200',
      delivered: 'bg-teal-50 text-teal-800 border border-teal-200',
    };

    const labels: Record<string, string> = {
      requested: 'Requested',
      upcoming: 'Upcoming',
      confirmed: 'Order Placed',
      delivered: 'Delivered',
      shipped: 'Item Shipped',
      active: 'Active Rental',
      return: 'Return',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
  };

  const timelineSteps = useMemo(() => {
    // Basic structural steps that always exist in some form
    const base = [
      { id: 'requested', label: 'Order Requested', stage: 'awaiting_acceptance', icon: 'ri-mail-line', description: 'Booking request sent to lender', color: '', note: '' },
      { id: 'lender_accepted', label: 'Lender Accepted', stage: 'lender_accepted', icon: 'ri-checkbox-circle-line', description: 'Lender has accepted the request', color: '', note: '' },
      { id: 'confirmed', label: 'Order Confirmed', stage: 'confirmed', icon: 'ri-shopping-bag-line', description: 'Order is confirmed and ready for preparation', color: '', note: '' },
      { id: 'prepare', label: 'Prepared For Delivery', stage: 'prepare', icon: 'ri-archive-line', description: 'Lender is preparing the item for shipping', color: '', note: '' },
      { id: 'shipped', label: 'Item Shipped', stage: 'shipped', icon: 'ri-truck-line', description: 'Tracking will be available once shipped', color: '', note: '' },
      { id: 'active', label: 'Enjoy Your Rental', stage: 'active', icon: 'ri-heart-line', description: 'Rental period is currently active', color: '', note: '' },
      { id: 'return', label: 'Return Due', stage: 'return', icon: 'ri-calendar-event-line', description: 'Item return is due soon', color: '', note: '' },
      { id: 'returned', label: 'Item Returned', stage: 'returned', icon: 'ri-arrow-go-back-line', description: 'Item has been returned to the lender', color: '', note: '' },
      { id: 'completed', label: 'Completed', stage: 'completed', icon: 'ri-check-double-line', description: 'Booking successfully completed', color: '', note: '' }
    ];

    const timeline = orderData?.timeline || [];
    const steps = [...base];

    // Check for Payment Failed
    const paymentFailed = timeline.find(t => t.title === 'Payment Failed');
    if (paymentFailed) {
      const idx = steps.findIndex(s => s.id === 'lender_accepted');
      if (idx !== -1) {
        steps.splice(idx + 1, 0, { id: 'payment_failed', label: 'Payment Failed', stage: 'payment_failed', icon: 'ri-error-warning-line', color: 'red', note: paymentFailed.note || '', description: paymentFailed.note || 'Payment attempt failed' });
      }
    }

    // Check for Late Delivery
    const lateDelivery = timeline.find(t => t.title === 'Late Delivery Detected' || t.title === 'Order Delay');
    if (lateDelivery) {
      const idx = steps.findIndex(s => s.id === 'shipped');
      if (idx !== -1) {
        steps.splice(idx + 1, 0, { id: 'late_delivery', label: 'Late Delivery Detected', stage: 'late_delivery', icon: 'ri-error-warning-line', color: 'red', note: lateDelivery.note || '', description: lateDelivery.note || 'Delivery is delayed' });
      } else {
        // Fallback if shipped is not found for some reason
        steps.splice(5, 0, { id: 'late_delivery', label: 'Late Delivery Detected', stage: 'late_delivery', icon: 'ri-error-warning-line', color: 'red', note: lateDelivery.note || '', description: lateDelivery.note || 'Delivery is delayed' });
      }
    }

    return steps;
  }, [orderData?.timeline]);

  const currentStageIndex = useMemo(() => {
    const status = (orderData?.status ?? order?.status)?.toLowerCase();
    const timeline = orderData?.timeline || [];

    // Find the latest completed step in our dynamic steps array
    const completedIndexes = timelineSteps.map((s, i) => {
      const found = timeline.find(t =>
        t.title?.toLowerCase() === s.label.toLowerCase() ||
        (s.id === 'requested' && t.title?.toLowerCase() === 'awaiting lender acceptance') ||
        (s.id === 'confirmed' && t.title?.toLowerCase() === 'status updated to confirmed') ||
        (s.id === 'prepare' && t.title?.toLowerCase() === 'prepared for delivery') ||
        (s.id === 'shipped' && t.title?.toLowerCase() === 'in transit') ||
        (s.id === 'shipped' && t.title?.toLowerCase() === 'shipping label created') ||
        (s.id === 'payment_failed' && t.title === 'Payment Failed') ||
        (s.id === 'late_delivery' && (t.title === 'Late Delivery Detected' || t.title === 'Order Delay'))
      );
      return found ? i : -1;
    }).filter(idx => idx !== -1);

    if (completedIndexes.length > 0) {
      let maxIdx = Math.max(...completedIndexes);

      // If the latest step is a red alert (failure/delay), it should be CONSIDERED CURRENT even if follow-up steps exist (to highlight the issue)
      // However, usually we just want to highlight the latest overall progress.

      // Adjust for current status if it suggests a further step not yet in the timeline array
      if (status === 'shipped' && maxIdx < timelineSteps.findIndex(s => s.id === 'shipped')) return timelineSteps.findIndex(s => s.id === 'shipped');
      if (status === 'active' && maxIdx < timelineSteps.findIndex(s => s.id === 'active')) return timelineSteps.findIndex(s => s.id === 'active');
      if (status === 'return' && maxIdx < timelineSteps.findIndex(s => s.id === 'return')) return timelineSteps.findIndex(s => s.id === 'return');
      if (status === 'completed' && maxIdx < timelineSteps.findIndex(s => s.id === 'completed')) return timelineSteps.findIndex(s => s.id === 'completed');

      return maxIdx;
    }

    // Fallback status-based mapping
    if (status === 'awaiting lender acceptance') return 0;
    if (status === 'confirmed') return timelineSteps.findIndex(s => s.id === 'prepare'); // Prepare stage
    if (status === 'shipped') return timelineSteps.findIndex(s => s.id === 'shipped');
    if (status === 'active') return timelineSteps.findIndex(s => s.id === 'active');

    return 0;
  }, [orderData, timelineSteps]);

  const currentItem = (orderData?.items ?? order?.items)?.[currentItemIndex];

  const handleShipmentConfirm = async () => {
    const { trackingNumber, trackingLink, shippingProvider } = trackingDetails;
    if (!trackingNumber.trim() || !trackingLink.trim() || !shippingProvider.trim()) {
      toast.error('Please fill in all tracking details.');
      return;
    }
    const note = `Tracking Number: ${trackingNumber}, Tracking Link: ${trackingLink}, Shipping Provider: ${shippingProvider}`;
    setActionLoading('shipment:confirm');
    try {
      await updateOrderStatus((orderData?.id || order?.id || '') as string, 'shipped', note, undefined, shipmentProofs.length ? shipmentProofs : undefined);
      setShowShipmentModal(false);
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      onClose();
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (status.toLowerCase() === 'shipped') {
      setShowShipmentModal(true);
    } else {
      const key = `status:${status}`;
      setActionLoading(key);
      try {
        await updateOrderStatus((orderData?.id || order?.id || '') as string, status);
        onClose();
        window.location.reload();
      } catch (err) {
        console.error(err);
        onClose();
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTrackingDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleShipmentProofChange = (e: any) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files) as File[];
    setShipmentProofs(arr.slice(0, 3));
  };
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col font-roboto"
        >
          {/* Loader Overlay */}
          <AnimatePresence>
            {isFetchingOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center"
              >
                <CommonLoader />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden min-h-[60vh] max-h-[90vh] overflow-y-auto">
            {!isFetchingOrder && orderData ? (
              <>
                <div className="bg-[#E6D3D7] px-8 py-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-700">{orderData?.orderNumber}</span>
                      {getStatusBadge((orderData?.status || order?.status) as string)}
                    </div>
                  </div>
                  <button onClick={onClose}><RiCloseLine className="w-6 h-6 text-gray-600" /></button>
                </div>

                {(orderData?.status?.toLowerCase() === "confirmed") && (
                  <div className="bg-red-50 border-b border-red-200 px-8 py-4 flex justify-between items-center">
                    <div>
                      <p className="text-red-600 font-medium">Action Required</p>
                      <p className="text-sm text-red-500">Shipping overdue by 13 days</p>
                    </div>
                    <button onClick={() => setShowShipmentModal(true)} className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition">Mark as Shipped</button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 p-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Order Timeline</h3>
                    <p className="text-sm text-gray-500 mb-6">Track your order status and required actions</p>
                    <div className="relative space-y-8">
                      {timelineSteps.map((step, index) => {
                        const isCompleted = index < currentStageIndex;
                        const isCurrent = index === currentStageIndex;
                        const isLast = index === timelineSteps.length - 1;
                        return (
                          <div key={step.id} className="relative">
                            {!isLast && <div className={`absolute left-10 top-10 w-px h-full ${isCompleted ? "bg-green-300" : "bg-gray-200"}`} />}
                            <div className={`relative p-5 rounded-xl border ${step.color === 'red' ? "bg-[#FFF1F2] border-[#FECDD3]" : isCurrent ? "bg-[#EAF7F6] border-[#2CA39C] ring-1 ring-[#2CA39C]/20" : isCompleted ? "bg-white border-gray-100 opacity-60" : "bg-white border-gray-100"}`}>
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border ${step.color === 'red' ? "bg-[#FEE2E2] border-[#FCA5A5] text-[#B91C1C]" : isCompleted ? "bg-green-50 border-green-200 text-green-600" : isCurrent ? "bg-[#14B8A6] border-[#14B8A6] text-white" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                                  <i className={`${step.icon} text-lg`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <p className={`font-semibold ${step.color === 'red' ? "text-[#991B1B]" : isCurrent ? "text-gray-900" : "text-gray-500"}`}>{step.label}</p>
                                    {isCompleted && !step.color && <span className="text-[10px] uppercase tracking-wider bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">Completed</span>}
                                    {step.color === 'red' && <span className="text-[10px] uppercase tracking-wider bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">Issue</span>}
                                  </div>
                                  <p className={`text-sm mt-0.5 ${step.color === 'red' ? "text-[#B91C1C]" : isCurrent ? "text-gray-600" : "text-gray-400"}`}>
                                    {step.stage === 'prepare' ? `Ship by ${formatDate(orderData?.startDate)}` :
                                      step.stage === 'active' ? `Rental period: ${formatDate(orderData?.startDate)} - ${formatDate(orderData?.endDate)}` :
                                        step.stage === 'return' ? `Expected return by ${formatDate(orderData?.endDate)}` :
                                          step.stage === 'shipped' && trackingData ? `${trackingData.status_description}${trackingData.events?.[0] ? `: ${trackingData.events[0].description}` : ''}` :
                                            step.note || step.description}
                                  </p>
                                  {isCurrent && (
                                    <div className="mt-4">
                                      {step.stage === "awaiting_acceptance" && (
                                        <div className="flex gap-3">
                                          <button onClick={() => handleStatusUpdate('confirmed')} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors">Accept Order</button>
                                          <button onClick={() => handleStatusUpdate('cancelled')} className="px-6 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Decline</button>
                                        </div>
                                      )}
                                      {step.stage === "prepare" && (
                                        <div className="space-y-4">
                                          <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#B91C1C] text-sm px-4 py-3 rounded-lg flex items-center gap-2"><i className="ri-error-warning-line text-lg" /><span>Shipping overdue by 13 days</span></div>
                                          <div className="flex gap-3">
                                            <button onClick={() => setShowShipmentModal(true)} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-black transition-colors">Mark as Shipped</button>
                                            <button className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">Upload Photos</button>
                                          </div>
                                        </div>
                                      )}
                                      {step.stage === "shipped" && (
                                        <div className="mt-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><i className="ri-map-pin-line text-lg" /></div>
                                            <div>
                                              <p className="text-sm font-semibold text-gray-900">{trackingData?.status_description || 'Shipment Tracking'}</p>
                                              <p className="text-xs text-gray-500">{trackingData?.events?.[0]?.description || 'Real-time courier updates'}</p>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => {
                                              onClose();
                                              router.push(`/lender/orders/${orderData?.id || order?.id}/track-shipment`);
                                            }}
                                            className="px-5 py-2.5 bg-[#111827] text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-black transition-colors"
                                          >
                                            <i className="ri-map-pin-line text-lg" />Track Shipment
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#FDF2F4] p-5 rounded-2xl border border-[#F9E1E5]">
                      <h4 className="font-semibold text-gray-900 mb-4 font-poppins text-sm uppercase tracking-wider">Rental Item</h4>
                      <div className="flex gap-4">
                        <img src={currentItem?.image || ''} className="w-16 h-20 object-cover rounded-xl shadow-sm" />
                        <div><p className="font-semibold text-gray-900">{currentItem?.title}</p><p className="text-sm text-gray-500 mt-1">Size {currentItem?.size}</p><p className="text-sm text-gray-500">{currentItem?.category}</p></div>
                      </div>
                    </div>

                    <div className="bg-[#FDF2F4] p-5 rounded-2xl border border-[#F9E1E5]">
                      <h4 className="font-semibold text-gray-900 mb-4 font-poppins text-sm uppercase tracking-wider">Borrower</h4>
                      <div className="flex items-center gap-3">
                        <AvatarCircle name={orderData?.borrower?.name} src={orderData?.borrower?.profileImage} size="w-10 h-10" />
                        <div><p className="font-semibold text-gray-900">{orderData?.borrower?.name}</p><p className="text-xs text-gray-500 mt-0.5">{orderData?.borrower?.email}</p></div>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          const data = orderData as any;
                          const chatId = data?.chatId || data?.chat_id || data?.product?.chat_id || data?.products?.[0]?.chat_id;
                          if (chatId) {
                            router.push(`/lender/messages?chatId=${chatId}`);
                          } else {
                            const productId = data?.product?._id || data?.items?.[0]?.id || data?.products?.[0]?.productId || data?.productId;
                            const orderId = data?.id || data?._id;
                            const buyerId = data?.borrower?.id || data?.renter?._id || data?.borrower?._id || data?.buyerId;
                            const buyerName = data?.borrower?.name || data?.renter?.name || "Borrower";
                            const buyerAvatar = data?.borrower?.avatar || data?.borrower?.profileImage || data?.renter?.profile_image || "";
                            const productName = data?.product?.name || data?.items?.[0]?.title || data?.productName || data?.products?.[0]?.productName;
                            const productImage = data?.product?.cover_image || data?.items?.[0]?.image || data?.products?.[0]?.coverImage || "";

                            router.push(`/lender/messages?productId=${productId}&orderId=${orderId}&buyerId=${buyerId}&buyerName=${encodeURIComponent(buyerName)}&buyerAvatar=${encodeURIComponent(buyerAvatar)}&productName=${encodeURIComponent(productName || '')}&productImage=${encodeURIComponent(productImage)}`);
                          }
                        }}
                        className="mt-5 w-full bg-[#111827] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors"
                      >
                        <i className="ri-chat-1-line" />
                        Message Borrower
                      </button>
                    </div>

                    <div className="bg-[#FDF2F4] p-5 rounded-2xl border border-[#F9E1E5]">
                      <h4 className="font-semibold text-gray-900 mb-4 font-poppins text-sm uppercase tracking-wider">Rental Period</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Start:</span><span className="font-semibold text-gray-900">{formatDate(orderData?.startDate)}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="text-gray-500">End:</span><span className="font-semibold text-gray-900">{formatDate(orderData?.endDate)}</span></div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-[#F9E1E5]"><span className="text-gray-500">Duration:</span><span className="font-semibold text-gray-900">{orderData?.duration} days</span></div>
                      </div>
                    </div>

                    <div className="bg-[#FFFCEB] p-5 rounded-2xl border border-[#FEF3C7]">
                      <h4 className="font-semibold text-gray-900 mb-4 font-poppins text-sm uppercase tracking-wider">Financial Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Rental Price:</span><span className="font-semibold text-gray-900">Rs.{orderData?.rentalFeeTotal}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Security Deposit:</span><span className="font-semibold text-gray-900">Rs.{orderData?.securityDepositTotal}</span></div>
                        <div className="flex justify-between items-center text-sm text-[#B91C1C]"><span>Platform Fee (15%)</span><span className="font-semibold">-Rs.{orderData?.platformFee}</span></div>
                        <div className="border-t border-[#FEF3C7] pt-3 mt-3 flex justify-between items-center font-bold text-[#059669]"><span className="text-sm">Your Earnings:</span><span className="text-lg">Rs.{(orderData?.rentalFeeTotal || 0) - (orderData?.platformFee || 0)}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {showExtensionDetails && selectedExtension && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] font-playfair">
              <div className="bg-white shadow-xl w-full max-w-md p-6 rounded-xl">
                <h2 className="text-lg font-poppins font-semibold text-gray-900 mb-4">Extension Request Details</h2>
                <div className="space-y-4 text-sm text-gray-700">
                  <div><strong className="block mb-1">Reason:</strong><p className="bg-gray-50 p-3 rounded border">{selectedExtension.reason ?? selectedExtension.message ?? '—'}</p></div>
                  <div><strong className="block mb-1">Requested Days:</strong><p className="bg-gray-50 p-3 rounded border">{selectedExtension.extensionDays ?? selectedExtension.requestedDays ?? selectedExtension.days ?? '—'}</p></div>
                  <div><strong className="block mb-1">Price Breakdown:</strong><div className="bg-gray-50 p-3 rounded border space-y-1"><p>Extension cost: Rs.{selectedExtension.pricing?.baseAmountEUR ?? '—'}</p><p>Platform fee: Rs.{selectedExtension.pricing?.platformFeeEUR ?? '—'}</p><p className="font-semibold pt-2 border-t border-gray-200">Total: Rs.{selectedExtension.pricing?.totalAmountEUR ?? selectedExtension.total ?? '—'}</p></div></div>
                  <div><strong className="block mb-1">Rejection Reason (optional):</strong><textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter reason for rejection..." className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 font-playfair rounded" rows={3} /></div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowExtensionDetails(false)} disabled={!!actionLoading} className="px-4 py-2 border border-gray-300 font-poppins hover:bg-gray-50 rounded-md disabled:opacity-60">Close</button>
                  <button onClick={() => handleAcceptExtension(selectedExtension)} disabled={!!actionLoading} className="px-4 py-2 bg-green-600 text-white font-poppins hover:bg-green-700 rounded-md disabled:opacity-60 min-w-[100px] flex items-center justify-center">
                    {actionLoading?.includes('ext:accept') ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : 'Accept'}
                  </button>
                  <button onClick={() => handleRejectExtension(selectedExtension, rejectionReason)} disabled={!!actionLoading} className="px-4 py-2 bg-red-200 text-red-800 font-poppins hover:bg-red-300 rounded-md disabled:opacity-60 min-w-[100px] flex items-center justify-center">
                    {actionLoading?.includes('ext:reject') ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showShipmentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] font-playfair">
              <div className="bg-white shadow-xl w-full max-w-md p-6 rounded-xl">
                <h2 className="text-lg font-poppins font-semibold text-gray-900 mb-4">Mark as Shipped</h2>
                <input type="text" value={trackingDetails.trackingNumber} onChange={(e) => handleInputChange('trackingNumber', e.target.value)} placeholder="Enter Tracking Number" className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 font-playfair mb-4" />
                <input type="text" value={trackingDetails.trackingLink} onChange={(e) => handleInputChange('trackingLink', e.target.value)} placeholder="Enter Tracking Link" className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 font-playfair mb-4" />
                <input type="text" value={trackingDetails.shippingProvider} onChange={(e) => handleInputChange('shippingProvider', e.target.value)} placeholder="Enter Shipping Provider" className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 font-playfair mb-4" />
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">Upload Proof Image (optional)</label>
                  <input type="file" accept="image/*" multiple onChange={handleShipmentProofChange} className="w-full" />
                  {shipmentProofs.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {shipmentProofs.map((file, idx) => (
                        <div key={idx} className="w-16 h-16 border rounded overflow-hidden"><img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" /></div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowShipmentModal(false)} disabled={!!actionLoading} className="px-4 py-2 border border-gray-300 font-poppins hover:bg-gray-50 rounded-md disabled:opacity-60">Cancel</button>
                  <button
                    onClick={handleShipmentConfirm}
                    disabled={!!actionLoading}
                    className="px-4 py-2 bg-gray-800 text-white font-poppins hover:bg-gray-900 rounded-md disabled:opacity-60 min-w-[140px] flex items-center justify-center"
                  >
                    {actionLoading === 'shipment:confirm' ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : 'Confirm Shipment'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}