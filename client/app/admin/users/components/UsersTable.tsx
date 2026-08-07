'use client';

import { useState } from 'react';
import { useadminUsersStore } from '../../store/useStore/usersStore';
import toast from 'react-hot-toast';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import CommonModal from '../../../components/common/CommonModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  dateJoined: string;
  status: string;
  lastActive: string;
  bookings: number;
  listings: number;
  disputes: number;
  rating: number;
  notes: string[];
  is_top_lender?: boolean;
  avatar?: string;
}

interface UsersTableProps {
  users: User[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onSelectAll: () => void;
  onViewUser: (user: User) => void;
  onSuspendUser: (user: User) => void;
  onExportData: (user: User) => void;
  onDeleteUser: (user: User) => void;
  loading?: boolean;
}

export default function UsersTable({
  users,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onViewUser,
  onSuspendUser,
  onExportData,
  onDeleteUser,
  loading
}: UsersTableProps) {
  const [loadingTopLender, setLoadingTopLender] = useState<string | null>(null);
  const [loadingStatusUpdate, setLoadingStatusUpdate] = useState<string | null>(null);
  const [suspensionModal, setSuspensionModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });
  const { toggleTopLender, updateUserStatus } = useadminUsersStore();

  const handleMarkTopLender = async (user: User) => {
    try {
      setLoadingTopLender(user.id);
      const response = await toggleTopLender(user.id);
      if (response.success) {
        // toast success managed by store or caller if needed
      }
    } catch (error: any) {
      console.error('Failed to update top lender status:', error);
      toast.error(`Failed to update top lender status: ${error.message}`);
    } finally {
      setLoadingTopLender(null);
    }
  };

  const openSuspensionModal = (user: User) => {
    setSuspensionModal({
      isOpen: true,
      user
    });
  };

  const closeSuspensionModal = () => {
    setSuspensionModal({
      isOpen: false,
      user: null
    });
  };

  const handleStatusUpdate = async (user: User, reason?: string) => {
    try {
      setLoadingStatusUpdate(user.id);
      const action = user.status === 'Active' ? 'Suspended' : 'Activate';
      const suspensionReason = action === 'Suspended' ? reason : "No reason";
      const response = await updateUserStatus(user.id, action, suspensionReason);

      if (response.success) {
        toast.success(`User ${action === 'Suspended' ? 'suspended' : 'activated'} successfully`);
        if (action === 'Suspended') {
          closeSuspensionModal();
        }
      }
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      toast.error(`Failed to update user status: ${error.message}`);
    } finally {
      setLoadingStatusUpdate(null);
    }
  };

  const handleStatusButtonClick = (user: User) => {
    if (user.status === 'Active') {
      openSuspensionModal(user);
    } else {
      handleStatusUpdate(user);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Active': 'bg-[#DCFCE7] text-[#166534] border-[#26B625]',
      'Suspended': 'bg-red-50 text-red-700 border-red-200',
      'Pending Approval': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[status as keyof typeof styles] || styles['Active']} font-roboto`}>
        {status}
      </span>
    );
  };

  const getStatusButton = (user: User) => {
    const isActive = user.status === 'Active';
    const isLoading = loadingStatusUpdate === user.id;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStatusButtonClick(user);
        }}
        disabled={isLoading}
        className={`p-2 transition-colors flex-shrink-0 ${isActive
          ? 'text-red-400 hover:text-red-600'
          : 'text-green-400 hover:text-green-600'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isActive ? "Suspend User" : "Activate User"}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {isLoading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : isActive ? (
            <i className="ri-user-forbid-line"></i>
          ) : (
            <i className="ri-user-follow-line"></i>
          )}
        </div>
      </button>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      'Renter': 'bg-blue-50 text-blue-700 border-blue-200',
      'Lender': 'bg-gray-100 text-gray-700 border-gray-300',
      'Borrower': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[role as keyof typeof styles] || styles['Renter']} font-roboto`}>
        {role}
      </span>
    );
  };

  const getTopLenderBadge = (user: User) => {
    if (!user.is_top_lender || user.role === 'Renter') return null;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 whitespace-nowrap font-roboto ml-2`}>
        Top Seller
      </span>
    );
  };

  const columns: Column<User>[] = [
    {
      header: 'User ID',
      key: 'user_slug_id',
      className: 'font-poppins whitespace-nowrap'
    },
    {
      header: 'Name',
      key: 'name',
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700 uppercase">
                {user.name?.charAt(0) || "U"}
              </span>
            </div>
          )}

          <div className="flex items-center min-w-0">
            <span className="text-sm font-medium text-gray-900 font-poppins truncate">
              {user.name}
            </span>
            {getTopLenderBadge(user)}
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      key: 'role',
      render: (role) => getRoleBadge(role)
    },
    {
      header: 'Email',
      key: 'email',
      className: 'font-poppins whitespace-nowrap truncate max-w-xs'
    },
    {
      header: 'Date Joined',
      key: 'dateJoined',
      className: 'font-poppins whitespace-nowrap',
      sortable: true
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewUser(user)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            title="View Details"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-eye-line"></i>
            </div>
          </button>

          {getStatusButton(user)}

          {user.role !== 'Renter' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkTopLender(user);
              }}
              disabled={loadingTopLender === user.id}
              className={`p-2 transition-colors flex-shrink-0 ${user.is_top_lender
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-yellow-500'
                } ${loadingTopLender === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={user.is_top_lender ? "Remove from Top Lenders" : "Mark as Top Lender"}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {loadingTopLender === user.id ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : user.is_top_lender ? (
                  <i className="ri-star-fill"></i>
                ) : (
                  <i className="ri-star-line"></i>
                )}
              </div>
            </button>
          )}
        </div>
      )
    }
  ];

  const [suspensionReason, setSuspensionReason] = useState('');

  const handleConfirmSuspension = () => {
    if (!suspensionReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }
    if (suspensionModal.user) {
      handleStatusUpdate(suspensionModal.user, suspensionReason);
    }
    setSuspensionReason('');
  };
  return (
    <>
      <ReusableTable
        columns={columns}
        data={users}
        loading={loading}
        selectable={true}
        selectedIds={selectedUsers}
        onSelectRow={onUserSelect}
        onSelectAll={onSelectAll}
        onRowClick={onViewUser}
        idKey="id"
      />

      <CommonModal
        isOpen={suspensionModal.isOpen}
        onClose={closeSuspensionModal}
        title="Suspend User"
        loading={loadingStatusUpdate === suspensionModal.user?.id}
      >
        <div className="space-y-4">
          <p className="text-gray-600 font-poppins">
            Are you sure you want to suspend <span className="font-semibold">{suspensionModal.user?.name}</span>?
            Please provide a reason for this action.
          </p>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
              Reason for suspension *
            </label>
            <textarea
              id="reason"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Enter the reason for suspending this user..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-roboto"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={closeSuspensionModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors font-roboto"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSuspension}
              disabled={!suspensionReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Suspension
            </button>
          </div>
        </div>
      </CommonModal>
    </>
  );
}