'use client';

import { useState, useEffect } from 'react';
import CommonModal from '../../../components/common/CommonModal';
import { Payout, usePayoutStore } from '../../store/payout/payoutStore';
import toast from 'react-hot-toast';
import CommonLoader from '@/app/components/common/CommonLoader';

interface PayoutDetailPanelProps {
  payout: Payout;
  onClose: () => void;
  onApprove: () => void;
  onHold: () => void;
  onMarkPaid: () => void;
  onRetry: () => void;
}

export default function PayoutDetailPanel({ payout: initialPayout, onClose, onApprove, onHold, onMarkPaid, onRetry }: PayoutDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [payout, setPayout] = useState<Payout>(initialPayout);
  const [loading, setLoading] = useState(false);
  const { fetchPayoutById } = usePayoutStore();

  useEffect(() => {
    const payoutId = initialPayout._id || initialPayout.id;
    if (!payoutId) return;

    const loadPayoutDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchPayoutById(payoutId);
        if (data && data.payout) {
          setPayout(data.payout);
        } else if (data) {
          setPayout(data);
        }
      } catch (error) {
        toast.error('Failed to load payout details');
      } finally {
        setLoading(false);
      }
    };

    loadPayoutDetails();
  }, [initialPayout._id, initialPayout.id, fetchPayoutById]);

  const getStatusBadge = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-700 border border-gray-300', icon: 'ri-time-line' },
      approved: { color: 'bg-blue-100 text-blue-700 border border-blue-300', icon: 'ri-check-line' },
      completed: { color: 'bg-[#F3D6DC] text-green-700 border border-green-300', icon: 'ri-check-double-line' },
      held: { color: 'bg-red-100 text-red-700 border border-red-300', icon: 'ri-pause-line' }
    };

    const config = statusConfig[statusLower as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color} font-poppins`}>
        <div className="w-4 h-4 flex items-center justify-center">
          <i className={config.icon}></i>
        </div>
        <span className="capitalize">{statusLower}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-eye-line' },
    { id: 'breakdown', label: 'Breakdown', icon: 'ri-pie-chart-line' },
    { id: 'audit', label: 'Audit Trail', icon: 'ri-history-line' }
  ];

  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Payout Details"
      size="lg"
    >
      <div className="flex flex-col -mx-6 -my-6">
        {/* Status in content area */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-500 font-poppins">Current Status:</span>
            {getStatusBadge(payout.status)}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors font-poppins ${activeTab === tab.id
                ? 'border-gray-800 text-gray-800 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={tab.icon}></i>
              </div>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-white min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 z-50 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
              <CommonLoader size="lg" color="#3D1126" />
            </div>
          )}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Payout Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50  p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 font-poppins">Payout Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-poppins">Payout ID</span>
                      <span className="font-mono text-gray-900 font-poppins">{payout.payout_slug_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-poppins">Net Amount</span>
                      <span className="font-bold text-xl text-gray-900 font-poppins">Rs.{Number(payout.net_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-poppins">Date Created</span>
                      <span className="text-gray-900 font-playfair">{formatDate(payout.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-poppins">Transfer ID</span>
                      <span className="text-gray-900 font-mono text-xs">{payout.stripe_transfer_id || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50  p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 font-poppins">Lender Information</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={payout.lender?.profile_image ? (payout.lender.profile_image.startsWith('http') ? payout.lender.profile_image : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${payout.lender.profile_image}`) : '/placeholder-avatar.png'}
                      alt={payout.lender?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 font-poppins">{payout.lender?.name || 'Unknown'}</h4>
                      <p className="text-sm text-gray-600 font-playfair">Email: {payout.lender?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-poppins">Destination Account</span>
                    </div>
                    <div className="text-sm text-gray-900 font-mono bg-white p-3 rounded border border-gray-300 font-playfair">
                      {payout.stripe_destination_account || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-gray-50  p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 font-poppins">Related Order</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 font-poppins">Order ID</span>
                      <span className="font-mono text-gray-900 font-poppins">{payout.order?.order_slug_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 font-poppins">Rental Total</span>
                      <span className="text-gray-900 font-poppins">Rs.{Number(payout.order?.rental_fee_total || payout.gross_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-2 font-poppins">Transaction ID / Slug</span>
                    <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border border-gray-300 font-mono">
                      {payout.transaction?.transaction_slug_id || payout.transaction?.transaction_id || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              <div className="bg-gray-50  p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-6 font-poppins">Financial Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-poppins">Gross Amount</span>
                    <span className="font-semibold text-gray-900 font-poppins">Rs.{Number(payout.gross_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-poppins">Platform Fee</span>
                    <span className="font-semibold text-red-600 font-poppins">-Rs.{Number(payout.platform_fee || 0).toFixed(2)}</span>
                  </div>
                  {((payout.late_fee_deduction || 0) !== 0 || (payout.refund_deduction || 0) !== 0 || (payout.discount_deduction || 0) !== 0) && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600 font-poppins">Deductions (Late Fees/Refunds/Discounts)</span>
                      <span className="font-semibold text-red-600 font-poppins">
                        -Rs.{((payout.late_fee_deduction || 0) + (payout.refund_deduction || 0) + (payout.discount_deduction || 0)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {payout.total_deductions !== undefined && (payout.late_fee_deduction === 0 && payout.refund_deduction === 0 && payout.discount_deduction === 0) && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600 font-poppins">Total Deductions</span>
                      <span className="font-semibold text-red-600 font-poppins">
                        -Rs.{Number(payout.total_deductions).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 pt-6 border-t-2 border-gray-300">
                    <span className="text-lg font-semibold text-gray-900 font-poppins">Net Payout</span>
                    <span className="text-2xl font-bold text-gray-900 font-poppins">Rs.{Number(payout.net_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Visual Breakdown */}
              <div className="bg-gray-50  p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 font-poppins">Amount Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600 flex-1 font-poppins">Lender Payout</span>
                    <span className="text-sm font-semibold text-gray-900 font-poppins">
                      {payout.gross_amount > 0 ? ((payout.net_amount / payout.gross_amount) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-700 rounded mr-3"></div>
                    <span className="text-sm text-gray-600 flex-1 font-poppins">Platform Fee \u0026 Deductions</span>
                    <span className="text-sm font-semibold text-gray-900 font-poppins">
                      {payout.gross_amount > 0 ? (((payout.gross_amount - payout.net_amount) / payout.gross_amount) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 float-left"
                    style={{ width: `${payout.gross_amount > 0 ? (payout.net_amount / payout.gross_amount) * 100 : 0}%` }}
                  ></div>
                  <div
                    className="h-full bg-gray-700 float-left"
                    style={{ width: `${payout.gross_amount > 0 ? ((payout.gross_amount - payout.net_amount) / payout.gross_amount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 font-poppins">Activity Timeline</h3>
              <div className="space-y-4">
                {payout.timeline && payout.timeline.length > 0 ? (
                  payout.timeline.map((event: any, index: number) => (
                    <div key={event._id || index} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border bg-gray-100 text-gray-700 border-gray-300`}>
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-time-line"></i>
                          </div>
                        </div>
                        {index < payout.timeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 font-poppins">{event.title}</h4>
                          <span className="text-sm text-gray-500 font-playfair">{formatDate(event.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1 font-playfair">{event.note}</p>
                        <p className="text-xs text-gray-500 font-playfair">Status: {event.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No activity recorded for this payout.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex space-x-3">
            {payout.status?.toLowerCase() === 'pending' && (
              <>
                <button
                  onClick={onApprove}
                  className="px-6 py-2.5 bg-gray-900 text-white font-medium hover:bg-black transition-colors whitespace-nowrap font-poppins text-sm rounded-lg flex items-center gap-2"
                >
                  <i className="ri-check-line"></i>
                  Approve Payout
                </button>
                <button
                  onClick={onHold}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins text-sm rounded-lg flex items-center gap-2"
                >
                  <i className="ri-pause-line"></i>
                  Hold
                </button>
              </>
            )}

            {payout.status?.toLowerCase() === 'approved' && (
              <button
                onClick={onMarkPaid}
                className="px-6 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 transition-colors whitespace-nowrap font-poppins text-sm rounded-lg flex items-center gap-2"
              >
                <i className="ri-check-double-line"></i>
                Mark as Paid
              </button>
            )}

            {payout.status?.toLowerCase() === 'held' && (
              <button
                onClick={onApprove}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors whitespace-nowrap font-poppins text-sm rounded-lg flex items-center gap-2"
              >
                <i className="ri-play-line"></i>
                Release Hold
              </button>
            )}

            {payout.status?.toLowerCase() === 'failed' && (
              <button
                onClick={onRetry}
                className="px-6 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors whitespace-nowrap font-poppins text-sm rounded-lg flex items-center gap-2"
              >
                <i className="ri-refresh-line"></i>
                Retry Payout
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins text-sm rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
}