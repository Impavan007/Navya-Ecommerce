'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface LateFeeModalProps {
  order: any;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LateFeeModal({ order, onClose, onConfirm }: LateFeeModalProps) {
  const [feeType, setFeeType] = useState('daily');
  const [customAmount, setCustomAmount] = useState('');
  const [daysLate, setDaysLate] = useState('3');
  const [reason, setReason] = useState('');

  const dailyFeeRate = 5;
  const fixedFeeAmount = 25;

  const getLateFeeAmount = () => {
    if (feeType === 'daily') return dailyFeeRate * parseInt(daysLate);
    else if (feeType === 'fixed') return fixedFeeAmount;
    else return parseFloat(customAmount) || 0;
  };

  const handleConfirm = () => { onConfirm(); };

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Apply Late Fee" size="sm">
      {/* Order Info */}
      <div className="bg-gray-50 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-sm font-semibold text-gray-800 font-poppins">{order.id}</span>
          <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold font-poppins">Late Return</span>
        </div>
        <div className="text-sm text-gray-600 font-playfair">
          <p>Borrower: {order.borrower.name}</p>
          <p>Return due: {new Date(order.rentalPeriod.end).toLocaleDateString()}</p>
          <p>Days overdue: 3 days</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 font-poppins">Late Fee Type</label>
          <div className="space-y-3">
            {[
              { value: 'daily', label: `Daily Fee (Rs.${dailyFeeRate}/day)` },
              { value: 'fixed', label: `Fixed Fee (Rs.${fixedFeeAmount})` },
              { value: 'custom', label: 'Custom Amount' }
            ].map(opt => (
              <label key={opt.value} className="flex items-center">
                <input type="radio" value={opt.value} checked={feeType === opt.value} onChange={(e) => setFeeType(e.target.value)} className="w-4 h-4 text-gray-700 border-gray-300 focus:ring-gray-500" />
                <span className="ml-3 text-sm text-gray-900 font-playfair">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {feeType === 'daily' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Days Late</label>
            <input type="number" value={daysLate} onChange={(e) => setDaysLate(e.target.value)} min="1" className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair" />
          </div>
        )}

        {feeType === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Custom Fee Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-playfair">Rs.</span>
              <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="0.00" className="w-full pl-8 pr-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Reason for Late Fee</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-8 font-playfair">
            <option value="">Select a reason</option>
            <option value="late-return">Late Return</option>
            <option value="no-communication">No Communication from Borrower</option>
            <option value="damaged-item">Item Returned Damaged</option>
            <option value="policy-violation">Policy Violation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2 font-poppins">Late Fee Summary</h3>
          <div className="space-y-1 text-sm font-playfair">
            {feeType === 'daily' && <div className="flex justify-between"><span className="text-gray-600">{daysLate} days × Rs.{dailyFeeRate}/day</span><span className="font-semibold">Rs.{getLateFeeAmount()}</span></div>}
            {feeType === 'fixed' && <div className="flex justify-between"><span className="text-gray-600">Fixed Late Fee</span><span className="font-semibold">Rs.{getLateFeeAmount()}</span></div>}
            {feeType === 'custom' && <div className="flex justify-between"><span className="text-gray-600">Custom Late Fee</span><span className="font-semibold">Rs.{getLateFeeAmount()}</span></div>}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold"><span>Total Late Fee</span><span className="text-gray-800">Rs.{getLateFeeAmount()}</span></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-playfair">This fee will be charged to the borrower's payment method.</p>
        </div>
      </div>

      <div className="flex space-x-3 mt-8">
        <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap font-poppins">Cancel</button>
        <button onClick={handleConfirm} disabled={!reason || (feeType === 'custom' && !customAmount)} className="flex-1 bg-gray-800 text-white px-4 py-3 font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-poppins">Apply Late Fee</button>
      </div>
    </CommonModal>
  );
}