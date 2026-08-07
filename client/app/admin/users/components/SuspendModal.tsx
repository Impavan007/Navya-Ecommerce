'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface SuspendModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SuspendModal({ user, isOpen, onClose, onConfirm }: SuspendModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const isSuspended = user?.status === 'Suspended';
  const title = isSuspended ? 'Reinstate User Account' : 'Suspend User Account';
  const action = isSuspended ? 'Reinstate' : 'Suspend';

  const suspendReasons = [
    'Policy violations',
    'Fraudulent activity',
    'Multiple disputes',
    'Inappropriate behavior',
    'Payment issues',
    'Other'
  ];

  const handleConfirm = () => {
    if (!isSuspended && !reason) return;
    onConfirm();
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200">
          <img
            src={`https://readdy.ai/api/search-image?query=professional%20portrait&width=40&height=40&seq=${user?.id}`}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div>
            <h3 className="font-medium text-gray-900 font-playfair">{user?.name}</h3>
            <p className="text-sm text-gray-600 font-playfair">{user?.email}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 bg-gray-50 border border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 flex items-center justify-center mt-0.5">
              <i className={`${
                isSuspended 
                  ? 'ri-information-line text-gray-600' 
                  : 'ri-alert-line text-gray-600'
              }`}></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 font-poppins">
                {isSuspended ? 'Reinstate Account' : 'Suspend Account'}
              </h4>
              <p className="text-sm mt-1 text-gray-700 font-playfair">
                {isSuspended 
                  ? "This will restore the user's access to the platform and all features."
                  : "This will prevent the user from accessing the platform and all features."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        {!isSuspended && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
              Reason for suspension *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white pr-8 font-playfair"
              required
            >
              <option value="">Select a reason</option>
              {suspendReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            {isSuspended ? 'Reinstatement notes' : 'Additional notes'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isSuspended 
              ? 'Optional notes about the reinstatement...'
              : 'Optional additional details...'
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none font-playfair"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isSuspended && !reason}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap font-poppins bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-300 ${
            (!isSuspended && !reason) ? 'cursor-not-allowed' : ''
          }`}
        >
          {action} User
        </button>
      </div>
    </CommonModal>
  );
}