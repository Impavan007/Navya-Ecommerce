'use client';

import useDecisionStore from '../../store/DisputeStore/DisputestoreActions'; // path to the store
import { MappedDispute } from '../../store/DisputeStore/Disputestore';
import CommonLoader from '../../../components/common/CommonLoader';
import CommonModal from '../../../components/common/CommonModal';
import { useState } from 'react';

interface DecisionModalProps {
  dispute: MappedDispute;
  onClose: () => void;
}

export default function DecisionModal({ dispute, onClose }: DecisionModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const {
    selectedDecision,
    setSelectedDecision,
    refundAmount,
    setRefundAmount,
    lateFeeAmount,
    setLateFeeAmount,
    notes,
    setNotes,
    isSubmitting,
    submitDecision,
  } = useDecisionStore();

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  // IDs align with store + API payload keys
  const decisionOptions = [
    { id: 'FullRefund', label: 'Approve Full Refund', description: 'Refund the full rental amount to renter', icon: 'ri-money-dollar-circle-line', color: 'text-green-600' },
    { id: 'PartialDeduction', label: 'Approve Partial Refund', description: 'Refund a portion of the rental amount', icon: 'ri-money-dollar-circle-line', color: 'text-blue-600' },
    { id: 'ApplyLate', label: 'Apply Late Fee', description: 'Charge additional fee for late return', icon: 'ri-time-line', color: 'text-gray-700' },
    { id: 'ForfeitDeposit', label: 'Forfeit Deposit', description: 'Keep security deposit to cover damages', icon: 'ri-shield-line', color: 'text-red-600' },
    { id: 'RejectClaim', label: 'Reject Claim', description: 'Dismiss the dispute without action', icon: 'ri-close-circle-line', color: 'text-gray-600' },
    // { id: 'escalate', label: 'Escalate to Legal', description: 'Forward to legal team for review', icon: 'ri-arrow-up-line', color: 'text-purple-600' },
  ];

  const requiresAmount = selectedDecision === 'PartialDeduction' || selectedDecision === 'ApplyLate';
  const amountValue = selectedDecision === 'PartialDeduction' ? refundAmount : lateFeeAmount;
  const amountInvalid = requiresAmount && (amountValue === '' || Number(amountValue) < 0);

  const handleSubmit = async () => {
    if (amountInvalid) return;
    await submitDecision(dispute.id);
    handleClose();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Resolve Dispute - ${dispute.id}`}
      size="lg"
      showCloseButton={true}
    >
      <div className="bg-white w-full flex flex-col">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6">

          {/* Decision Options */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4 font-poppins">Select Resolution</h4>
            <div className="space-y-3">
              {decisionOptions.map(option => (
                <label
                  key={option.id}
                  className={`flex items-start p-4 border cursor-pointer transition-colors ${selectedDecision === option.id ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={option.id}
                    checked={selectedDecision === option.id}
                    onChange={(e) => setSelectedDecision(e.target.value)}
                    className="mt-1 text-gray-800 focus:ring-gray-800"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <i className={`${option.icon} ${option.color} text-lg mr-2`}></i>
                      <span className="font-medium text-gray-900 font-poppins">{option.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 font-playfair">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          {requiresAmount && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3 font-poppins">
                {selectedDecision === 'PartialDeduction' ? 'Refund Amount' : 'Late Fee Amount'}
              </h4>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-playfair">Rs.</span>
                <input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={amountValue}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (Number(next) < 0) return;
                    selectedDecision === 'PartialDeduction' ? setRefundAmount(next) : setLateFeeAmount(next);
                  }}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 font-playfair"
                />
              </div>
              {amountInvalid && <p className="text-sm text-red-600 mt-1 font-poppins">Amount must be zero or more.</p>}
              {selectedDecision === 'PartialDeduction' && <p className="text-sm text-gray-500 mt-1 font-playfair">Original rental amount: Rs.{dispute.orderValue}</p>}
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 font-poppins">
              Decision Notes {selectedDecision === 'reject_claim' && <span className="text-red-500">*</span>}
            </h4>
            <textarea
              placeholder="Explain the reasoning behind this decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 resize-none font-playfair"
            />
            {selectedDecision === 'RejectClaim' && <p className="text-sm text-red-600 mt-1 font-poppins">Notes are required when rejecting a claim</p>}
          </div>

          {/* Summary */}
          {selectedDecision && (
            <div className="bg-gray-50 p-4 mb-2 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2 font-poppins">Decision Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-poppins">Action:</span>
                  <span className="text-gray-900 font-poppins">{decisionOptions.find(opt => opt.id === selectedDecision)?.label}</span>
                </div>
                {selectedDecision === 'PartialDeduction' && refundAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-poppins">Refund Amount:</span>
                    <span className="text-gray-900 font-poppins font-semibold">Rs.{refundAmount}</span>
                  </div>
                )}
                {selectedDecision === 'ApplyLate' && lateFeeAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-poppins">Late Fee:</span>
                    <span className="text-gray-900 font-poppins font-semibold">Rs.{lateFeeAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 font-poppins">Deposit:</span>
                  <span className="text-gray-900 font-poppins font-semibold">
                    Rs.{dispute.depositAmount} {selectedDecision === 'forfeit_deposit' ? '(Forfeited)' : '(Released)'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 font-poppins"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDecision || isSubmitting || (selectedDecision === 'reject_claim' && !notes.trim()) || amountInvalid}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-poppins"
          >
            {isSubmitting ? (
              <>
                <CommonLoader size="sm" color="white" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="ri-check-line mr-2 inline-block"></i>
                Submit Decision
              </>
            )}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}
