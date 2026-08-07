'use client';

import { useState, useEffect } from 'react';
import useadminUsersStore from '../../store/useStore/usersStore';
import toast from 'react-hot-toast';
import CommonModal from '../../../components/common/CommonModal';
import CommonLoader from '../../../components/common/CommonLoader';

const getInitials = (name?: string) => {
  if (!name) return 'U';
  return name.trim().charAt(0).toUpperCase();
};

interface UserDetailPanelProps {
  user: any;
  onClose: () => void;
  onSuspend: (user: any, reason?: string) => void;
  onExport: () => void;
  onDelete: () => void;
  loading?: boolean;
}

interface SuspensionModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

const SuspensionModal = ({ isOpen, user, onClose, onConfirm, loading }: SuspensionModalProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Suspend User"
      size="sm"
    >
      <p className="text-gray-600 mb-4 font-poppins">
        Are you sure you want to suspend <span className="font-semibold">{user?.name}</span>?
        Please provide a reason for this action.
      </p>

      <div className="mb-4">
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
          Reason for suspension *
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter the reason for suspending this user..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-poppins"
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleClose}
          disabled={loading}
          className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors font-poppins disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || !reason.trim()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Suspending...' : 'Confirm Suspension'}
        </button>
      </div>
    </CommonModal>
  );
};

export default function UserDetailPanel({ user, onClose, onSuspend, onExport, onDelete, loading }: UserDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [suspensionModal, setSuspensionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toggleTopLender, updateUserStatus, fetchUserById } = useadminUsersStore()
  const [loadingStatusUpdate, setLoadingStatusUpdate] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  useEffect(() => {
    const getDetailedUser = async () => {
      if (!user?.id) return;
      try {
        setFetchingDetail(true);
        const detail = await fetchUserById(user.id);
        if (detail) {
          setUserDetail(detail);
        }
      } catch (err) {
        console.error('Error fetching detailed user:', err);
      } finally {
        setFetchingDetail(false);
      }
    };
    getDetailedUser();
  }, [user?.id, fetchUserById]);

  const displayUser = userDetail || user;

  const getStatusBadge = (status: string) => {
    const styles = {
      'Active': 'bg-green-50 text-green-700 border-green-200',
      'Suspended': 'bg-red-50 text-red-700 border-red-200',
      'Pending Approval': 'bg-gray-50 text-gray-700 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[status as keyof typeof styles] || styles['Active']} font-poppins`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      'Renter': 'bg-blue-50 text-blue-700 border-blue-200',
      'Lender': 'bg-gray-100 text-gray-700 border-gray-300'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[role as keyof typeof styles]} font-poppins`}>
        {role}
      </span>
    );
  };

  const handleStatusButtonClick = () => {
    if (displayUser.status === 'Active') {
      setSuspensionModal(true);
    } else {
      handleStatusUpdate(displayUser);
    }
  };

  const handleStatusUpdate = async (user: any, reason?: string) => {
    try {
      setLoadingStatusUpdate(user.id);
      const action = user.status === 'Active' ? 'Suspended' : 'Activate';
      const suspensionReason = action === 'Suspended' ? reason : "No reason";

      const response = await updateUserStatus(user.id, action, suspensionReason);

      if (response.success) {
        toast.success(`User ${action === 'Suspended' ? 'suspended' : 'activated'} successfully`);
        onClose()
        if (action === 'Suspended') {
          closeSuspensionModal();
        }
      }
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      alert(`Failed to update user status: ${error.message}`);
    } finally {
      setLoadingStatusUpdate(null);
    }
  };

  const handleConfirmSuspension = (reason: string) => {
    handleStatusUpdate(displayUser, reason);
  };

  const closeSuspensionModal = () => {
    setSuspensionModal(false);
  };

  const getStatusButton = () => {
    const isActive = displayUser?.status === 'Active';
    const isLoading = actionLoading;

    return (
      <button
        onClick={handleStatusButtonClick}
        disabled={isLoading}
        className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap font-poppins ${isActive
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-green-600 text-white hover:bg-green-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {isActive ? 'Suspending...' : 'Activating...'}
          </>
        ) : isActive ? (
          'Suspend User'
        ) : (
          'Activate User'
        )}
      </button>
    );
  };

  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title={displayUser?.name || 'User Details'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Profile Header Info */}
        <div className="flex items-center space-x-4 mb-6">
          {displayUser?.avatar ? (
            <img
              src={displayUser.avatar}
              alt={displayUser.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              <span className="text-blue-700 font-bold text-lg font-poppins">
                {getInitials(displayUser?.name)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-poppins">{displayUser?.name}</h2>
            <div className="flex items-center space-x-3 mt-1">
              {getRoleBadge(displayUser?.role)}
              {getStatusBadge(displayUser?.status)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {fetchingDetail ? (
            <div className="py-20">
              <CommonLoader pageCenter />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-poppins">Profile Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500 font-poppins">User ID</label>
                    <p className="font-medium text-gray-900 font-poppins">{displayUser?.user_slug_id || displayUser?.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 font-poppins">Email</label>
                    <p className="font-medium text-gray-900 font-poppins">{displayUser?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 font-poppins">Date Joined</label>
                    <p className="font-medium text-gray-900 font-poppins">{displayUser?.dateJoined}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 font-poppins">Last Active</label>
                    <p className="font-medium text-gray-900 font-poppins">{displayUser?.lastActive}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-poppins">Activity Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-poppins">Bookings Made</span>
                    <span className="font-medium text-gray-900 font-poppins">{displayUser?.activitySummary?.bookingsMade ?? displayUser?.bookings ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-poppins">Listings Created</span>
                    <span className="font-medium text-gray-900 font-poppins">{displayUser?.activitySummary?.listingsCreated ?? displayUser?.listings ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-poppins">Disputes</span>
                    <span className="font-medium text-gray-900 font-poppins">{displayUser?.activitySummary?.disputes ?? displayUser?.disputes ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-poppins">Rating</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium text-gray-900 font-poppins">{displayUser?.activitySummary?.rating ?? displayUser?.rating ?? 0}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-4 h-4 flex items-center justify-center">
                            <i className={`ri-star-${i < Math.floor(displayUser?.activitySummary?.rating ?? displayUser?.rating ?? 0) ? 'fill' : 'line'} text-gray-400 text-xs`}></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6 bg-gray-50 -mx-6 px-6 py-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins"
          >
            Close
          </button>
          <div className="flex items-center space-x-3">
            {getStatusButton()}
          </div>
        </div>
      </div>

      {/* Suspension Confirmation Modal (Only for suspension) */}
      <SuspensionModal
        isOpen={suspensionModal}
        user={displayUser}
        onClose={closeSuspensionModal}
        onConfirm={handleConfirmSuspension}
        loading={actionLoading}
      />
    </CommonModal>
  );
}