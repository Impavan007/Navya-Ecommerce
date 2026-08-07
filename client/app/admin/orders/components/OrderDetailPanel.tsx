'use client';

import { useState, useEffect } from 'react';
import CommonModal from '../../../components/common/CommonModal';
import { useLenderOrderTableStore } from '../../store/order/AdminOrderstore';
import CommonLoader from '../../../components/common/CommonLoader';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

const AvatarCircle = ({
  name,
  image,
  size = 'w-10 h-10',
  textSize = 'text-sm',
  withBorder = false,
  className = '',
}: {
  name?: string;
  image?: string | null;
  size?: string;
  textSize?: string;
  withBorder?: boolean;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${withBorder ? 'border border-gray-200' : ''} ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${withBorder ? 'border border-gray-200' : ''} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

interface OrderDetailPanelProps {
  order: any;
  onClose: () => void;
  onOrderAction: (action: string, order: any) => void;
}

interface OrderDetailPanelState {
  isOpen: boolean;
}

export default function OrderDetailPanel({ order: propOrder, onClose, onOrderAction }: OrderDetailPanelProps) {
  const { fetchOrderById } = useLenderOrderTableStore();
  const [order, setOrder] = useState(propOrder);
  const [localLoading, setLocalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const getDetailedOrder = async () => {
      if (propOrder?.id) {
        setLocalLoading(true);
        const detailed = await fetchOrderById(propOrder.id);
        if (detailed) {
          setOrder(detailed);
        }
        setLocalLoading(false);
      }
    };
    getDetailedOrder();
  }, [propOrder?.id, fetchOrderById]);

  // Map order data to match the detail panel format using actual API data
  const mappedTimeline = order.timeline?.length
    ? order.timeline.map((event: any) => {
      let status = 'completed';
      if (event.title?.toLowerCase().includes('requested')) status = 'completed';
      else if (event.title?.toLowerCase().includes('updated')) status = 'completed';
      else if (event.title?.toLowerCase().includes('return')) status = 'pending';
      else if (event.title?.toLowerCase().includes('completed')) status = 'completed';
      else if (event.title?.toLowerCase().includes('cancel')) status = 'overdue';

      return {
        action: event.title,
        date: new Date(event.date).toLocaleString(),
        user: event.by === order.borrower?.id
          ? order.borrower.name
          : 'System', // In real implementation, you might want to map user IDs to names
        note: event.note || '',
        status
      };
    })
    : [
      { action: 'Order Placed', date: 'N/A', user: 'N/A', status: 'pending' }
    ];

  // Map payment data from actual transaction data
  const payments = [
    {
      type: 'Rental Fee',
      amount: order.totalAmount || 0,
      status: 'charged',
      date: order.created ? new Date(order.created).toLocaleDateString() : 'N/A',
      transactionId: order.transaction?.transaction_id || 'N/A'
    },
    {
      type: 'Security Deposit',
      amount: order.depositHeld || 0,
      status: order.status === 'completed' ? 'refunded' : 'held',
      date: order.created ? new Date(order.created).toLocaleDateString() : 'N/A',
      transactionId: 'N/A'
    },
    {
      type: 'Platform Fee',
      amount: order?.platformFee || 0,
      status: 'charged',
      date: order.created ? new Date(order.created).toLocaleDateString() : 'N/A',
      transactionId: order.transaction?.transaction_id || 'N/A'
    },
    {
      type: 'Late Fee',
      amount: order.status === 'late' ? 15 : 0,
      status: order.status === 'late' ? 'pending' : 'n/a',
      date: order.status === 'late' ? new Date().toLocaleDateString() : 'N/A',
      transactionId: 'N/A'
    }
  ];

  // Map proofs from actual proofs data
  const proofs = order.proofs?.map((proof: any) => ({
    type: proof.title,
    url: proof.url,
    uploaded: new Date(proof.uploaded_at).toLocaleDateString(),
    uploader: proof.uploaded_by === order.borrower?.id ? order.borrower.name : 'Lender'
  })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-blue-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      charged: 'bg-[#F3D6DC] text-green-700 border border-green-200',
      held: 'bg-blue-100 text-blue-700 border border-blue-200',
      pending: 'bg-gray-100 text-gray-700 border border-gray-200',
      refunded: 'bg-orange-100 text-orange-700 border border-orange-200',
      'n/a': 'bg-gray-100 text-gray-500 border border-gray-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-poppins font-semibold ${styles[status as keyof typeof styles]}`}>
        {status === 'n/a' ? 'N/A' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();

    const styles: Record<string, string> = {
      requested: 'bg-gray-50 text-gray-800 border border-gray-200',
      confirmed: 'bg-blue-50 text-blue-800 border border-blue-200',
      orderplaced: 'bg-gray-100 text-gray-800 border border-gray-300',
      'awaiting lender acceptance': 'bg-yellow-50 text-yellow-800 border border-yellow-200',
      'lender rejected': 'bg-red-50 text-red-800 border border-red-200',
      'payment pending': 'bg-orange-50 text-orange-800 border border-orange-200',
      'preparing shipment': 'bg-indigo-50 text-indigo-800 border border-indigo-200',
      shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
      'in transit': 'bg-cyan-50 text-cyan-800 border border-cyan-200',
      delivered: 'bg-teal-50 text-teal-800 border border-teal-200',
      'late delivery - lender fault': 'bg-red-50 text-red-800 border border-red-200',
      'late delivery - carrier fault': 'bg-orange-50 text-orange-800 border border-orange-200',
      'awaiting renter decision': 'bg-purple-50 text-purple-800 border border-purple-200',
      active: 'bg-green-50 text-green-800 border border-green-200',
      return: 'bg-orange-50 text-orange-800 border border-orange-200',
      completed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      cancelled: 'bg-red-50 text-red-800 border border-red-200',
      refunded: 'bg-gray-50 text-gray-800 border border-gray-300',
      disputed: 'bg-red-50 text-red-800 border border-red-200',
      late: 'bg-red-50 text-red-800 border border-red-200',
    };

    const labels: Record<string, string> = {
      requested: 'Requested',
      orderplaced: 'Placed',
      'awaiting lender acceptance': 'Pending',
      'lender rejected': 'Rejected',
      'payment pending': 'Unpaid',
      confirmed: 'Confirmed',
      'preparing shipment': 'Preparing',
      shipped: 'Shipped',
      'in transit': 'Transit',
      delivered: 'Delivered',
      'late delivery - lender fault': 'Delayed(Lender)',
      'late delivery - carrier fault': 'Delayed(Carrier)',
      'awaiting renter decision': 'Decision(Renter)',
      active: 'Active',
      return: 'Return',
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      disputed: 'Disputed',
      late: 'Late',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border ${styles[s] || 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
      >
        {labels[s] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Order Details"
      size="xl"
      showCloseButton={true}
    >
      <div className="bg-white rounded-lg w-full flex relative">
        {localLoading && (
          <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex flex-col items-center">
              <CommonLoader size="lg" />
              <p className="mt-4 text-sm font-poppins font-medium text-gray-600 animate-pulse">Loading order details...</p>
            </div>
          </div>
        )}
        {/* Left Side - Order Summary */}
        {/* Left Side - Order Summary */}
        <div className="w-1/3 bg-[#EAD1D6] p-6 border-r border-[#D9B9C1]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-['canela'] font-medium text-gray-900">Order Details</h2>
          </div>

          {/* Order ID & Status */}
          <div className="bg-[#F4DEE2] rounded-lg p-4 mb-6 border border-[#E3C6CD]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-poppins text-lg font-bold text-[#3D1126]">{order.orderNumber}</span>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-600">Created: {new Date(order.created).toLocaleDateString()}</p>
            {order.trackingNumber && (
              <p className="text-sm text-gray-600 mt-1">Tracking: {order.trackingNumber}</p>
            )}
          </div>

          {/* Items */}
          <div className="bg-[#F4DEE2] rounded-lg p-4 mb-6 border border-[#E3C6CD]">
            <h3 className="font-poppins font-semibold text-gray-900 mb-3">Rental Items</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={item.image || 'https://readdy.ai/api/search-image?query=designer%20fashion%20product&width=60&height=80'}
                    alt={item.name}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-poppins font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">Excellent condition</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div className="bg-[#F4DEE2] rounded-lg p-4 mb-6 border border-[#E3C6CD]">
            <h3 className="font-poppins font-semibold text-gray-900 mb-3">Participants</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-2">Borrower</p>
                <div className="flex items-center space-x-3">
                  <AvatarCircle name={order.borrower?.name} image={order.borrower?.avatar} />
                  <div>
                    <p className="text-sm font-poppins font-medium text-gray-900">{order.borrower?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-600">Member since {order.created ? new Date(order.created).getFullYear() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">Lender</p>
                <div className="flex items-center space-x-3">
                  <AvatarCircle name={order.lender?.name} image={order.lender?.avatar} />
                  <div>
                    <p className="text-sm font-poppins font-medium text-gray-900">{order.lender?.name || 'Lender'}</p>
                    <p className="text-xs text-gray-600">Verified Lender</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-[#F4DEE2] rounded-lg p-4 border border-[#E3C6CD]">
            <h3 className="font-poppins font-semibold text-gray-900 mb-3">Financial Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Fee</span>
                <span className="font-poppins font-semibold">Rs.{order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security Deposit</span>
                <span className="font-poppins font-semibold">Rs.{order.depositHeld}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-poppins font-semibold">Rs.{order?.platformFee || 0}</span>
              </div>
              {order.status === 'late' && (
                <div className="flex justify-between text-gray-700">
                  <span>Late Fee</span>
                  <span className="font-poppins font-semibold">Rs.15</span>
                </div>
              )}
              <hr className="my-2 border-[#D9B9C1]" />
              <div className="flex justify-between font-poppins font-semibold">
                <span>Total Charged</span>
                <span>Rs.{(Number(order.totalAmount) || 0) + (Number(order.depositHeld) || 0) + (Number(order.transaction?.platformFee) || 0) + (order.status === 'late' ? 15 : 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Detailed Information */}
        <div className="w-2/3 p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6 flex justify-between">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'timeline', label: 'Order Timeline' },

                { id: 'overview', label: 'Overview' },
                { id: 'payments', label: 'Payments' },
                { id: 'proofs', label: 'Proofs & Documents' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-poppins font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

          </div>
          {activeTab === 'timeline' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Order Timeline
              </h3>

              {(() => {
                const FULL_TIMELINE = [
                  "Requested",
                  "Payment Confirmed",
                  "Status Updated to Confirmed",
                  "Preparing for shipment",
                  "Item shipped",
                  "Item delivered",
                  "Return due",
                  "Item returned",
                  "Completed"
                ];

                const completedTitles =
                  order.timeline?.map((t: any) =>
                    t.title?.toLowerCase()
                  ) || [];

                const lastCompleted =
                  completedTitles[completedTitles.length - 1];

                return (
                  <div className="relative">

                    {/* Vertical Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-[#BFE5D2]" />

                    <div className="space-y-8">
                      {FULL_TIMELINE.map((status, index) => {
                        const matched = order.timeline?.find(
                          (t: any) =>
                            t.title?.toLowerCase() === status.toLowerCase()
                        );

                        const isCompleted = completedTitles.includes(
                          status.toLowerCase()
                        );

                        const isCurrent =
                          status.toLowerCase() === lastCompleted;

                        return (
                          <div key={status} className="relative flex items-start">

                            {/* Circle Wrapper */}
                            <div className="relative z-10 flex items-center justify-center w-12">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                        ${isCompleted
                                    ? "bg-[#DFF4EA] border-[#2FB97F]"
                                    : "bg-gray-200 border-gray-300"
                                  }`}
                              >
                                {isCompleted ? (
                                  <svg
                                    className="w-5 h-5 text-[#2FB97F]"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Card */}
                            <div
                              className={`flex-1 ml-4 rounded-lg p-5 border transition-all
                      ${isCurrent
                                  ? "bg-[#E6F7F1] border-[#2FB97F]"
                                  : isCompleted
                                    ? "bg-white border-gray-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="w-full">

                                  {/* Title + Date Row */}
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900">
                                      {status}
                                    </h4>

                                    {matched && (() => {
                                      const d = new Date(matched.date);

                                      const day = String(d.getDate()).padStart(2, '0');
                                      const month = String(d.getMonth() + 1).padStart(2, '0');
                                      const year = String(d.getFullYear()).slice(-2);

                                      const hours = d.getHours();
                                      const minutes = String(d.getMinutes()).padStart(2, '0');
                                      const ampm = hours >= 12 ? 'PM' : 'AM';
                                      const formattedHour = String(hours % 12 || 12).padStart(2, '0');

                                      return (
                                        <p className="text-xs text-[#111827] whitespace-nowrap font-roboto font-medium">
                                          {day}-{month}-{year} {formattedHour}:{minutes}
                                        </p>
                                      );
                                    })()}


                                  </div>

                                  {/* Note */}
                                  {matched && (
                                    <p className="text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap">
                                      {matched.note}
                                    </p>
                                  )}

                                </div>
                              </div>


                              {status === "Return due" && isCurrent && (
                                <div className="flex justify-between mt-4 text-sm">
                                  <span className="text-gray-600">
                                    Expected return by deadline
                                  </span>
                                  <span className="text-[#2FB97F] font-semibold">
                                    3 days remaining
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-10">

              {/* Rental Period */}
              <div>
                <h3 className="text-2xl font-['canela'] font-medium text-[#1F1F1F] mb-6">
                  Rental Period
                </h3>

                <div className="bg-[#EFD8DB] rounded-xl px-10 py-6">
                  <div className="grid grid-cols-3 text-center gap-6">

                    <div>
                      <p className="text-sm text-[#6B6B6B] mb-1">Start Date</p>
                      <p className="text-lg font-semibold text-[#1F1F1F]">
                        {new Date(order.rentalPeriod.start).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#6B6B6B] mb-1">End Date</p>
                      <p className="text-lg font-semibold text-[#1F1F1F]">
                        {new Date(order.rentalPeriod.end).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#6B6B6B] mb-1">Buffer Period</p>
                      <p className="text-lg font-semibold text-[#1F1F1F]">
                        {order.rentalPeriod.buffer} Days
                      </p>
                    </div>

                  </div>
                </div>
              </div>


              {/* Current Status */}
              <div>
                <h3 className="text-2xl font-['canela'] font-medium text-[#1F1F1F] mb-6">
                  Current Status
                </h3>

                <div className="bg-[#EFD8DB] rounded-xl py-12 px-8 flex flex-col items-center justify-center text-center">

                  {/* Status Circle with Dynamic Icon based on status */}
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-6
            ${['completed', 'delivered', 'returned', 'confirmed', 'active'].includes(order.status.toLowerCase()) ? 'bg-[#DFF4EA]' :
                        ['in-progress', 'shipped', 'preparing shipment', 'in transit'].includes(order.status.toLowerCase()) ? 'bg-[#CDE9D8]' :
                          ['pending', 'awaiting lender acceptance', 'payment pending', 'awaiting-payment', 'awaiting-approval'].includes(order.status.toLowerCase()) ? 'bg-[#FFF3CD]' :
                            ['late', 'overdue', 'lender rejected', 'late delivery - lender fault', 'late delivery - carrier fault', 'disputed', 'rejected'].includes(order.status.toLowerCase()) ? 'bg-[#FDE2E4]' :
                              ['cancelled', 'refunded'].includes(order.status.toLowerCase()) ? 'bg-gray-200' :
                                'bg-[#EFD8DB]'
                      }`}
                  >

                    {/* Map icons based on status */}
                    {(() => {
                      const s = order.status.toLowerCase();
                      switch (true) {
                        // Success/Completed states - Right check mark
                        case ['completed', 'delivered', 'returned', 'confirmed', 'active'].includes(s):
                          return (
                            <svg className="w-10 h-10 text-[#1E9E5A]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          );

                        // In Progress states - Spinner/Progress icon
                        case ['in-progress', 'shipped', 'preparing shipment', 'in transit'].includes(s):
                          return (
                            <svg className="w-10 h-10 text-[#1E9E5A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                            </svg>
                          );

                        // Pending/Waiting states - Clock icon
                        case ['pending', 'awaiting lender acceptance', 'payment pending', 'awaiting-payment', 'awaiting-approval'].includes(s):
                          return (
                            <svg className="w-10 h-10 text-[#F59E0B]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                            </svg>
                          );

                        // Late/Overdue states - Exclamation icon
                        case ['late', 'overdue', 'lender rejected', 'late delivery - lender fault', 'late delivery - carrier fault', 'disputed', 'rejected'].includes(s):
                          return (
                            <svg className="w-10 h-10 text-[#C1121F]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5m0 4h.01" />
                            </svg>
                          );

                        // Cancelled/Rejected states - X icon
                        case ['cancelled', 'refunded'].includes(s):
                          return (
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
                            </svg>
                          );

                        // Default fallback
                        default:
                          return (
                            <svg className="w-10 h-10 text-[#6B6B6B]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          );
                      }
                    })()}

                  </div>

                  {/* Status Text - Format nicely */}
                  <h4 className="text-xl font-semibold text-[#1F1F1F]">
                    {(() => {
                      const labels: Record<string, string> = {
                        'awaiting lender acceptance': 'Pending',
                        'lender rejected': 'Rejected',
                        'payment pending': 'Unpaid',
                        'preparing shipment': 'Preparing',
                        'in transit': 'Transit',
                        'late delivery - lender fault': 'Delayed(Lender)',
                        'late delivery - carrier fault': 'Delayed(Carrier)',
                        'awaiting renter decision': 'Decision(Renter)'
                      };
                      return labels[order.status.toLowerCase()] || order.status.charAt(0).toUpperCase() + order.status.slice(1);
                    })()}
                  </h4>

                  {/* Optional: Add status description based on status */}
                  <p className="text-sm text-[#6B6B6B] mt-2">
                    {order.status === 'completed' && 'Your rental has been completed successfully'}
                    {order.status === 'confirmed' && 'Your booking has been confirmed ✓'}
                    {order.status === 'active' && 'Your rental is currently active ✓'}
                    {order.status === 'in-progress' && 'Your order is being processed'}
                    {order.status === 'pending' && 'Awaiting confirmation'}
                    {order.status === 'shipped' && 'Your item has been shipped'}
                    {order.status === 'delivered' && 'Your item has been delivered ✓'}
                    {order.status === 'late' && 'Your return is late'}
                    {order.status === 'overdue' && 'Your return is overdue'}
                    {order.status === 'cancelled' && 'This booking has been cancelled'}
                    {order.status === 'rejected' && 'Your booking request was rejected'}
                    {order.status === 'refunded' && 'Your payment has been refunded'}
                    {order.status === 'awaiting-payment' && 'Waiting for payment confirmation'}
                    {order.status === 'awaiting-approval' && 'Waiting for lender approval'}
                    {order.status === 'returned' && 'Item has been returned successfully ✓'}
                  </p>

                </div>
              </div>

            </div>
          )}





          {activeTab === 'payments' && (
            <div>
              <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-poppins font-medium text-gray-900">{payment.type}</h4>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Amount: <span className="font-poppins font-semibold text-gray-900">Rs.{payment.amount}</span>
                      </span>
                      <span className="text-gray-500">{payment.date}</span>
                    </div>
                    {payment.transactionId !== 'N/A' && (
                      <p className="text-xs text-gray-400 mt-1">Transaction ID: {payment.transactionId}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'proofs' && (
            <div>
              <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-4">Proofs & Documents</h3>
              <div className="space-y-4">
                {proofs.length > 0 ? proofs.map((proof: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-poppins font-medium text-gray-900">{proof.type}</h4>
                        <p className="text-sm text-gray-500">
                          Uploaded by {proof.uploader} on {proof.uploaded}
                        </p>
                      </div>
                      <button
                        onClick={() => window.open(proof.url, '_blank')}
                        className="px-3 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-900 transition-colors whitespace-nowrap"
                      >
                        View Document
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                    <p className="text-gray-500">No proofs or documents available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </CommonModal>
  );
}