'use client';

import { useState } from 'react';
import { WaitlistUser } from '../page';
import CommonModal from '../../../components/common/CommonModal';

interface WaitlistDetailPanelProps {
  user: WaitlistUser;
  onClose: () => void;
  onUpdateUser: (user: WaitlistUser) => void;
  onApproveUser: () => void;
  onRejectUser: (reason?: string) => void;
  isUpdating: boolean;
}

export default function WaitlistDetailPanel({
  user,
  onClose,
  onUpdateUser,
  onApproveUser,
  onRejectUser,
  isUpdating,
}: WaitlistDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState(user.notes || '');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-gray-100 text-gray-800 border border-gray-200',
      Invited: 'bg-blue-50 text-blue-700 border border-blue-200',
      Approved: 'bg-[#DCFCE7] text-[#166534] border-[#26B625]',
      Rejected: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-roboto ${styles[status as keyof typeof styles]
          }`}
      >
        {status}
      </span>
    );
  };

  const getStatusSteps = () => {
    const steps = [
      { id: 'pending', label: 'Pending', completed: true },
      { id: 'invited', label: 'Invited', completed: ['Invited', 'Approved'].includes(user.status) },
      { id: 'accepted', label: 'Accepted', completed: user.status === 'Approved' },
      { id: 'activated', label: 'Activated', completed: user.status === 'Approved' },
    ];

    if (user.status === 'Rejected') {
      return [
        { id: 'pending', label: 'Pending', completed: true },
        { id: 'rejected', label: 'Rejected', completed: true, isRejected: true },
      ];
    }

    return steps;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (rejectReason.trim()) {
      onRejectUser(rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Waitlist Details"
      size="md"
    >
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 -mx-6 px-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'status', label: 'Status Tracker' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors font-poppins ${activeTab === tab.id
                ? 'border-gray-800 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <span className="text-lg font-medium text-gray-800 font-roboto">{user.name.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 font-roboto">{user.name}</h3>
                  <p className="text-sm text-gray-500 font-roboto">{user.email}</p>
                </div>
              </div>
              {getStatusBadge(user.status)}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">Date Signed Up</label>
                <p className="text-sm text-gray-900 font-roboto">{formatDate(user.dateSignedUp)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">Role</label>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 font-roboto">
                  {user.Role}
                </span>
              </div>
            </div>

            {/* Images Section (only for Lenders) */}
            {user.Role === 'Lender' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  Uploaded Images
                </label>
                {user.Images && user.Images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative w-full h-32 overflow-hidden border border-gray-200 rounded-lg">
                      <img
                        src={user.Images}
                        alt={`Product image`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic font-roboto">No images uploaded.</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {user.status === 'Pending' && (
                <>
                  <button
                    onClick={onApproveUser}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-[#1A1A1A] text-white hover:bg-black transition-colors text-sm font-medium whitespace-nowrap font-roboto disabled:cursor-not-allowed disabled:opacity-60 rounded-lg shadow-sm"
                  >
                    <i className="ri-mail-send-line mr-2"></i>
                    {isUpdating ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={handleRejectClick}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap font-roboto disabled:cursor-not-allowed disabled:opacity-60 rounded-lg shadow-sm"
                  >
                    <i className="ri-close-circle-line mr-2"></i>
                    {isUpdating ? 'Processing...' : 'Reject'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 font-roboto">Status Progression</h3>
            <div className="space-y-4">
              {getStatusSteps().map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                      ? step.isRejected
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                  >
                    {step.completed ? (
                      step.isRejected ? (
                        <i className="ri-close-line"></i>
                      ) : (
                        <i className="ri-check-line"></i>
                      )
                    ) : (
                      <span className="text-sm font-medium font-roboto">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-sm font-medium font-roboto ${step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <CommonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject User"
        size="sm"
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter reason for rejection..."
          className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#F3D6DC] outline-none font-roboto"
          rows={4}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setShowRejectModal(false)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-roboto border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleRejectConfirm}
            disabled={!rejectReason.trim()}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 font-roboto"
          >
            Confirm Reject
          </button>
        </div>
      </CommonModal>
    </CommonModal>
  );
}