'use client';

import { useState } from 'react';
import useDisputeStore from '../../store/DisputeStore/Disputestore';
import type { MappedDispute } from '../../store/DisputeStore/Disputestore';
import CommonModal from '../../../components/common/CommonModal';

interface NonOrderDecisionModalProps {
  dispute: MappedDispute;
  onClose: () => void;
}

export default function NonOrderDecisionModal({ dispute, onClose }: NonOrderDecisionModalProps) {
  const { resolveDispute, rejectDispute } = useDisputeStore();
  const [decision, setDecision] = useState<'resolve' | 'reject' | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!decision) return;
    setSubmitting(true);
    try {
      if (decision === 'resolve') {
        await resolveDispute(dispute.id);
      } else {
        await rejectDispute(dispute.id, notes);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Make Decision" size="sm" loading={submitting}>
      {/* <p className="text-sm text-gray-500 font-playfair -mt-2 mb-4">{dispute.id}</p> */}

      <div className="space-y-3 mb-6">
        <label className={`flex items-center p-3 border cursor-pointer ${decision === 'resolve' ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="radio" name="nonorder-decision" className="mr-3" checked={decision === 'resolve'} onChange={() => setDecision('resolve')} />
          <span className="font-poppins text-gray-900">Resolve</span>
        </label>
        <label className={`flex items-center p-3 border cursor-pointer ${decision === 'reject' ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="radio" name="nonorder-decision" className="mr-3" checked={decision === 'reject'} onChange={() => setDecision('reject')} />
          <span className="font-poppins text-gray-900">Reject</span>
        </label>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2 font-poppins">Notes {decision === 'reject' && <span className="text-red-500">*</span>}</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for this decision"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 resize-none font-playfair"
        />
        {decision === 'reject' && !notes.trim() && (
          <p className="text-sm text-red-600 mt-1 font-poppins">Notes are required when rejecting.</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 font-poppins">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting || !decision || (decision === 'reject' && !notes.trim())} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 transition-colors disabled:opacity-50 font-poppins">
          {submitting ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </CommonModal>
  );
}
