'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface DeleteUserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({ user, isOpen, onClose, onConfirm }: DeleteUserModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const expectedText = 'DELETE';
  const canDelete = confirmText === expectedText && reason;

  const deleteReasons = [
    'GDPR Right to be Forgotten request',
    'Account closure request',
    'Fraudulent account',
    'Duplicate account',
    'Legal requirement',
    'Other'
  ];

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);

    // Simulate deletion process
    setTimeout(() => {
      setIsDeleting(false);
      onConfirm();
    }, 2000);
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Delete User Account" size="md">
      <div className="space-y-6 flex-1 pr-2">
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
              <i className="ri-alert-line text-gray-600"></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 font-poppins">Permanent Deletion</h4>
              <p className="text-sm text-gray-700 mt-1 font-playfair">
                This action cannot be undone. All user data, including profile, bookings, messages, and activity history will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Data Impact */}
        <div className="p-4 bg-gray-50 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2 font-poppins">Data to be deleted:</h4>
          <ul className="text-sm text-gray-700 space-y-1 font-playfair">
            <li>• Profile information and preferences</li>
            <li>• {user?.bookings || 0} booking records</li>
            <li>• {user?.listings || 0} listing records</li>
            <li>• Message history and communications</li>
            <li>• Payment and transaction records</li>
            <li>• Reviews and ratings</li>
            <li>• Activity logs and audit trail</li>
          </ul>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Reason for deletion *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white pr-8 font-playfair"
            required
          >
            <option value="">Select a reason</option>
            {deleteReasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Confirmation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair"
          />
        </div>

        {/* GDPR Notice */}
        <div className="p-4 bg-gray-50 border border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 flex items-center justify-center mt-0.5">
              <i className="ri-information-line text-gray-600"></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 font-poppins">GDPR Compliance</h4>
              <p className="text-sm text-gray-700 mt-1 font-playfair">
                Some data may be retained for legal and compliance purposes as required by law, even after account deletion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap disabled:opacity-50 font-poppins"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={!canDelete || isDeleting}
          className="px-4 py-2 bg-gray-800 text-white font-medium hover:bg-gray-900 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed font-poppins"
        >
          {isDeleting ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span>Deleting...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-delete-bin-line"></i>
              </div>
              <span>Delete User</span>
            </div>
          )}
        </button>
      </div>
    </CommonModal>
  );
}