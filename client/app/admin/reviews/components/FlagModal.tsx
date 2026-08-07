'use client';

import { useState } from 'react';
import { Review } from '../../store/Reviews/Reviews';
import CommonModal from '../../../components/common/CommonModal';

interface FlagModalProps {
  review: Review;
  onClose: () => void;
  onConfirm: () => void;
}

export default function FlagModal({ review, onClose, onConfirm }: FlagModalProps) {
  const [flagReason, setFlagReason] = useState('inappropriate');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  const flagReasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'spam', label: 'Spam' },
    { value: 'false_claims', label: 'False Claims' },
    { value: 'irrelevant', label: 'Irrelevant' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Flag Review" size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="p-4 bg-gray-50 mb-4">
            <div className="text-sm font-medium text-gray-900 mb-1">Review ID: {review.id}</div>
            <div className="text-sm text-gray-600 mb-2">By {review.reviewer.name} for {review.recipient.name}</div>
            <div className="text-sm text-gray-900">"{review.reviewText}"</div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Flag Reason *</label>
          <select value={flagReason} onChange={(e) => setFlagReason(e.target.value)} className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-white pr-8" required>
            {flagReasons.map((reason) => (<option key={reason.value} value={reason.value}>{reason.label}</option>))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Provide additional context for this flag..." rows={4} className="w-full px-3 py-2 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent resize-none" />
        </div>

        <div className="flex space-x-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors">Flag Review</button>
        </div>
      </form>
    </CommonModal>
  );
}
