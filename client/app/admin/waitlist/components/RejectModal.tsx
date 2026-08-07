'use client';

import { useState } from 'react';
import { WaitlistUser } from '../page';
import CommonModal from '../../../components/common/CommonModal';

interface RejectModalProps {
  user: WaitlistUser;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting?: boolean;
}

export default function RejectModal({
  user,
  onClose,
  onSubmit,
  isSubmitting = false,
}: RejectModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || isSubmitting) return;
    onSubmit(reason.trim());
  };

  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Reject Application"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <span className="text-sm font-medium text-gray-800 font-playfair">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 font-playfair">{user.name}</p>
              <p className="text-sm text-gray-500 font-playfair">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-2">
          <i className="ri-alert-line w-4 h-4 flex items-center justify-center text-red-600"></i>
          <p className="text-sm text-red-800 font-playfair">
            This action will reject the application and cannot be undone.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm font-playfair resize-none"
            placeholder="Provide a brief explanation for the rejection..."
          />
          <p className="mt-2 text-xs text-gray-500 font-playfair">
            This reason will be saved with the waitlist record for future reference.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Submitting...
              </div>
            ) : (
              <>
                <i className="ri-close-circle-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
                Submit Rejection
              </>
            )}
          </button>
        </div>
      </form>
    </CommonModal>
  );
}