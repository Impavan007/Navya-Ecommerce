'use client';

import { useState } from 'react';
import CommonModal from '@/app/components/common/CommonModal';
import { usePayoutStore } from '../../store/payout/payoutStore';
import toast from 'react-hot-toast';

interface ApproveModalProps {
  payout?: any;
  selectedPayouts: any[];
  initialStatus?: 'approve' | 'hold';
  onClose: () => void;
  onConfirm: () => void;
}

export default function ApproveModal({ payout, selectedPayouts, initialStatus = 'approve', onClose, onConfirm }: ApproveModalProps) {
  const isBulkFromList = selectedPayouts.length > 0;
  const effectivePayout = payout || (selectedPayouts.length > 0 ? selectedPayouts[0] : null);
  const isHeld = effectivePayout?.status?.toLowerCase() === 'held';

  const [approvalType, setApprovalType] = useState<string>(isHeld ? 'approve' : initialStatus);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { updatePayoutStatus, payoutDecisionHold, bulkUpdatePayouts } = usePayoutStore();

  const isBulkAction = selectedPayouts.length > 1;
  const payoutCount = isBulkFromList ? selectedPayouts.length : 1;

  const handleProceed = async () => {
    try {
      if ((approvalType === 'hold' || approvalType === 'reject') && !reason.trim()) {
        toast.error(`Please provide a reason for the ${approvalType}`);
        return;
      }

      setIsProcessing(true);

      let success = false;
      if (isBulkAction) {
        // Use the new bulk action API
        success = await bulkUpdatePayouts(
          selectedPayouts.map(p => p._id || p.id),
          approvalType as 'approve' | 'hold',
          reason
        );
      } else if (isHeld) {
        // Special case for held payouts: use decision-hold API
        success = await payoutDecisionHold(
          effectivePayout._id || effectivePayout.id,
          approvalType as 'approve' | 'reject',
          reason
        );
      } else {
        // Standard case for pending payouts
        success = await updatePayoutStatus(
          effectivePayout._id || effectivePayout.id,
          approvalType,
          reason
        );
      }

      if (success) {
        toast.success(`Payout ${approvalType}${payoutCount > 1 ? 's' : ''} successfully processed`);
        onConfirm();
      } else {
        toast.error('Failed to update payout status');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalAmount = () => {
    if (isBulkAction) {
      return selectedPayouts.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
    }
    return effectivePayout?.net_amount || effectivePayout?.netPayout || 0;
  };

  const getOptions = () => {
    if (isHeld) {
      return [
        { value: 'approve', label: 'approve Payout', desc: 'Verify and approve this payout for processing' },
        { value: 'reject', label: 'Reject Payout', desc: 'Reject this payout and notify the lender' }
      ];
    }
    return [
      { value: 'approve', label: 'Approve payout', desc: 'Queue for next payment batch (usually within 24 hours)' },
      { value: 'hold', label: 'Hold for review', desc: 'Place payout on hold for additional verification' }
    ];
  };

  return (
    <CommonModal isOpen={true} onClose={onClose} title={isHeld ? 'Review Held Payout' : (isBulkAction ? 'Approve Multiple Payouts' : 'Approve Payout')} size="md" loading={isProcessing}>
      <div className="bg-gray-50 p-4 mb-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 font-poppins">Payout Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 font-poppins">{isBulkAction ? 'Payouts to process' : 'Payout ID'}</span>
            <span className="font-semibold text-gray-900 font-poppins">{isBulkAction ? `${payoutCount} payouts` : (effectivePayout?.payout_slug_id || effectivePayout?.id)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-poppins">Total amount</span>
            <span className="font-bold text-lg text-gray-900 font-poppins">Rs.{getTotalAmount().toFixed(2)}</span>
          </div>
          {!isBulkAction && effectivePayout && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 font-poppins">Lender</span>
                <span className="text-gray-900 font-poppins">{effectivePayout.lender?.name || effectivePayout.lenderName || 'Unknown'}</span>
              </div>
              <div className="flex justify-between flex-col">
                <span className="text-gray-600 font-poppins">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${isHeld ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {effectivePayout.status}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Approval Options */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 font-poppins">Decision</h3>
        <div className="space-y-3">
          {getOptions().map(opt => (
            <label key={opt.value} className="flex items-center space-x-3 cursor-pointer">
              <input type="radio" name="approvalType" value={opt.value} checked={approvalType === opt.value} onChange={(e) => setApprovalType(e.target.value)} className="text-gray-800 focus:ring-gray-800" />
              <div>
                <p className="font-medium text-gray-900 font-poppins">{opt.label}</p>
                <p className="text-sm text-gray-500 font-playfair">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* admin Notes / Reason */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
          {(approvalType === 'hold' || approvalType === 'reject') ? `Reason for ${approvalType === 'hold' ? 'Hold' : 'Rejection'}` : 'admin Notes (Optional)'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={(approvalType === 'hold' || approvalType === 'reject') ? `Explain why this payout is being ${approvalType === 'hold' ? 'held' : 'rejected'}...` : "Add any notes about this action..."}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-white resize-none font-playfair"
        />
      </div>

      {/* Confirmation Notice */}
      <div className="bg-gray-100 border border-gray-300 p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 text-gray-700 flex items-center justify-center mt-0.5"><i className="ri-information-line"></i></div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1 font-poppins">Action Impact</h4>
            <p className="text-sm text-gray-700 font-playfair">
              {approvalType === 'approve' && 'Approved payouts will be processed in the next payment batch. Lenders will receive email notifications once payments are sent.'}
              {approvalType === 'hold' && 'The payout will be placed on hold. You can review and approve it later.'}
              {approvalType === 'approve' && 'The hold will be removed and the payout will proceed to the next stage.'}
              {approvalType === 'reject' && 'The payout will be rejected. This action is irreversible.'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap font-poppins">Cancel</button>
        <button onClick={handleProceed} disabled={isProcessing} className="flex-1 bg-gray-800 text-white px-4 py-3 font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-poppins">
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Processing...</span></div>
          ) : (`Proceed`)}
        </button>
      </div>
    </CommonModal>
  );
}