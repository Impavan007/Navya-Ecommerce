"use client";

import useDeleteListingStore from '../../stores/Listing/deleteListingStore';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import CommonModal from '@/app/components/common/CommonModal';

export default function DeleteListingModal() {
  const { isOpen, targetTitle, deleting, error, close, confirmDelete } = useDeleteListingStore();

  const onConfirm = useCallback(async () => {
    await confirmDelete();
  }, [confirmDelete]);

  useEffect(() => {
    if (error && isOpen) {
      toast.error(error);
    }
  }, [error, isOpen]);

  if (!isOpen) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={close}
      title="Confirm delete"
      size="sm"
      loading={deleting}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong className="text-gray-900">{targetTitle || 'this listing'}</strong>? This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
          <button
            onClick={close}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-poppins text-sm"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center font-poppins text-sm font-medium"
            disabled={deleting}
          >
            {deleting ? (
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <i className="ri-delete-bin-line mr-2"></i>
            )}
            Delete
          </button>
        </div>
      </div>
    </CommonModal>
  );
}