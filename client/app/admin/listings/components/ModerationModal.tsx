'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface ModerationModalProps {
  action: 'approve' | 'reject';
  listing?: any;
  selectedListings: string[];
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isOpen: boolean;
}

export default function ModerationModal({ action, listing, selectedListings, onClose, onConfirm, isOpen }: ModerationModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');

  const rejectReasons = [
    { value: 'blurry_photos', label: 'Photos too blurry or poor quality' },
    { value: 'incorrect_sizing', label: 'Incorrect sizing information' },
    { value: 'duplicate', label: 'Duplicate listing' },
    { value: 'counterfeit', label: 'Suspected counterfeit item' },
    { value: 'incomplete', label: 'Incomplete product details' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'other', label: 'Other (specify in notes)' }
  ];

  const reasons = (action === 'reject' && rejectReasons) || [];
  const isMultiple = selectedListings.length > 1;
  const itemCount = isMultiple ? selectedListings.length : 1;

  const getActionColor = () => {
    switch (action) {
      case 'reject': return 'red';
      case 'approve': return 'green';
      default: return 'gray';
    }
  };

  const color = getActionColor();

  const handleConfirm = () => {
    if (action !== 'approve' && !selectedReason) {
      return;
    }
    const reason = action === 'reject' ? (notes ? `${selectedReason}: ${notes}` : selectedReason) : undefined;
    onConfirm(reason);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${action.charAt(0).toUpperCase() + action.slice(1)} Listing${itemCount > 1 ? 's' : ''}`}
      size="sm"
      showCloseButton={true}
    >
      <div className="space-y-6 font-poppins">
        <p className="text-gray-600 font-playfair">
          {isMultiple
            ? `You are about to ${action} ${itemCount} selected listings.`
            : `You are about to ${action} "${listing?.title}" by ${listing?.lender.name}.`
          }
        </p>

        {action !== 'approve' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                Reason for {action}ing *
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair"
                required
              >
                <option value="">Select a reason...</option>
                {reasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional context or feedback..."
                rows={3}
                maxLength={500}
                className="w-full border border-gray-200 px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none font-playfair"
              />
              <div className="text-xs text-gray-500 mt-1 font-playfair">
                {notes.length}/500 characters
              </div>
            </div>
          </>
        )}

        {action === 'approve' && (
          <div className="bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                <i className="ri-check-line text-gray-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium font-poppins">
                  This will make the listing{itemCount > 1 ? 's' : ''} live on the platform
                </p>
                <p className="text-sm text-gray-700 mt-1 font-playfair">
                  {isMultiple ? 'Users' : 'The lender'} will be notified of the approval.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3 border-t border-gray-200 pt-6">
          <button
            onClick={handleConfirm}
            disabled={action !== 'approve' && !selectedReason}
            className={`flex-1 px-4 py-3 font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-poppins ${
              action === 'approve' 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {action.charAt(0).toUpperCase() + action.slice(1)} {itemCount > 1 ? `${itemCount} Listings` : 'Listing'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap font-poppins"
          >
            Cancel
          </button>
        </div>
      </div>
    </CommonModal>
  );
}