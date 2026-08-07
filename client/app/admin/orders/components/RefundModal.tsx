'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface RefundModalProps {
  order: any;
  selectedOrders: string[];
  onClose: () => void;
  onConfirm: () => void;
  isOpen: boolean;
}

export default function RefundModal({ order, selectedOrders, onClose, onConfirm, isOpen }: RefundModalProps) {
  const [refundType, setRefundType] = useState('full');
  const [customAmount, setCustomAmount] = useState('');
  const [reason, setReason] = useState('');
  const [releaseDeposit, setReleaseDeposit] = useState(true);

  const isBulkAction = selectedOrders.length > 1;
  const totalAmount = order ? order.totalAmount : 0;
  const depositAmount = order ? order.depositHeld : 0;

  const getRefundAmount = () => {
    if (refundType === 'full') {
      return totalAmount + (releaseDeposit ? depositAmount : 0);
    } else if (refundType === 'partial') {
      return (parseFloat(customAmount) || 0) + (releaseDeposit ? depositAmount : 0);
    } else {
      return releaseDeposit ? depositAmount : 0;
    }
  };

  const handleConfirm = () => {
    // 
    onConfirm();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isBulkAction ? `Process Refunds (${selectedOrders.length} orders)` : 'Process Refund'}
      size="sm"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {!isBulkAction && (
          <div className="bg-gray-50  p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-semibold text-gray-800 font-poppins">{order?.id}</span>
              <span className="text-sm text-gray-500 font-playfair">Total: Rs.{totalAmount + depositAmount}</span>
            </div>
            <div className="text-sm text-gray-600 font-playfair">
              Rental Fee: Rs.{totalAmount} • Deposit: Rs.{depositAmount}
            </div>
          </div>
        )}

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 font-poppins">Refund Type</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="w-4 h-4 text-gray-700 border-gray-300 focus:ring-gray-500"
                />
                <span className="ml-3 text-sm text-gray-900 font-playfair">Full Refund (Rental Fee + Deposit)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="w-4 h-4 text-gray-700 border-gray-300 focus:ring-gray-500"
                />
                <span className="ml-3 text-sm text-gray-900 font-playfair">Partial Refund</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="deposit-only"
                  checked={refundType === 'deposit-only'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="w-4 h-4 text-gray-700 border-gray-300 focus:ring-gray-500"
                />
                <span className="ml-3 text-sm text-gray-900 font-playfair">Deposit Release Only</span>
              </label>
            </div>
          </div>

          {/* Custom Amount */}
          {refundType === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Custom Refund Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-playfair">Rs.</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 font-playfair">Maximum: Rs.{totalAmount}</p>
            </div>
          )}

          {/* Deposit Release */}
          {refundType !== 'deposit-only' && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={releaseDeposit}
                  onChange={(e) => setReleaseDeposit(e.target.checked)}
                  className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500"
                />
                <span className="ml-3 text-sm text-gray-900 font-playfair">
                  Also release security deposit (Rs.{depositAmount})
                </span>
              </label>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Refund Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-8 font-playfair"
            >
              <option value="">Select a reason</option>
              <option value="order-cancelled">Order Cancelled</option>
              <option value="item-damaged">Item Damaged</option>
              <option value="item-not-as-described">Item Not as Described</option>
              <option value="shipping-issue">Shipping Issue</option>
              <option value="customer-request">Customer Request</option>
              <option value="dispute-resolution">Dispute Resolution</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Refund Summary */}
          <div className="bg-gray-50  p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2 font-poppins">Refund Summary</h3>
            <div className="space-y-1 text-sm font-playfair">
              {refundType === 'full' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Fee Refund</span>
                    <span className="font-semibold">Rs.{totalAmount}</span>
                  </div>
                  {releaseDeposit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Release</span>
                      <span className="font-semibold">Rs.{depositAmount}</span>
                    </div>
                  )}
                </>
              )}
              {refundType === 'partial' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Partial Refund</span>
                    <span className="font-semibold">Rs.{parseFloat(customAmount) || 0}</span>
                  </div>
                  {releaseDeposit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Release</span>
                      <span className="font-semibold">Rs.{depositAmount}</span>
                    </div>
                  )}
                </>
              )}
              {refundType === 'deposit-only' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Release</span>
                  <span className="font-semibold">Rs.{depositAmount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 border-t border-gray-200 pt-6 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700  font-medium hover:bg-gray-50 transition-colors whitespace-nowrap font-poppins"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason || (refundType === 'partial' && !customAmount)}
            className="flex-1 bg-gray-800 text-white px-4 py-3  font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-poppins"
          >
            Process Refund
          </button>
        </div>
    </CommonModal>
  );
}