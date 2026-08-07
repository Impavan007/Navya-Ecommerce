'use client';

import { useState } from 'react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkApprove: () => void;
  onBulkReject: (reason: string) => void;
}

export default function BulkActionsBar({ selectedCount, onClearSelection, onBulkApprove, onBulkReject }: BulkActionsBarProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <>
      <div className="bg-gray-100 border-b border-gray-300 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-800 font-poppins">
              {selectedCount} review{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium font-poppins"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => { onBulkApprove(); onClearSelection(); }}
              className="px-4 py-2 bg-gray-900 text-white   transition-colors whitespace-nowrap font-poppins"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-check-line"></i>
                </div>
                <span>Approve All</span>
              </div>
            </button>

            {/* <button
              onClick={() => handleBulkAction('flag')}
              className="px-4 py-2 bg-gray-800 text-white  hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-flag-line"></i>
                </div>
                <span>Flag All</span>
              </div>
            </button> */}

            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-2 border border-gray-900 text-black  hover:bg-gray-900 hover:text-white transition-colors whitespace-nowrap font-poppins"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-delete-bin-line"></i>
                </div>
                <span>Remove All</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-poppins">Reject Reviews</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 hover:bg-gray-100  transition-colors"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-close-line text-gray-400"></i>
                  </div>
                </button>
              </div>

              <p className="text-gray-600 mb-3 font-playfair">Provide a reason for rejecting {selectedCount} selected review{selectedCount !== 1 ? 's' : ''}.</p>
              <textarea
                className="w-full border border-gray-300 p-2 mb-4 font-playfair"
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors font-poppins"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { if (!rejectReason.trim()) return; onBulkReject(rejectReason.trim()); setShowRejectModal(false); setRejectReason(''); onClearSelection(); }}
                  className={`flex-1 px-4 py-2 text-white  transition-colors font-poppins bg-red-600 hover:bg-red-700 disabled:opacity-50`}
                  disabled={!rejectReason.trim()}
                >
                  Reject Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
