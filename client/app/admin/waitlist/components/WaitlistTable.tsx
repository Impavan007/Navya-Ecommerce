'use client';

import { useState } from 'react';
import { WaitlistUser } from '../page';
import { Eye } from 'lucide-react';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import CommonModal from '../../../components/common/CommonModal';

interface WaitlistTableProps {
  users: WaitlistUser[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onSelectAll: () => void;
  onUserClick: (user: WaitlistUser) => void;
  onApproveUser: (user: WaitlistUser) => void;
  onRejectUser: (user: WaitlistUser, reason?: string) => void;
  updatingMap: Record<string, boolean>;
  loading?: boolean;
}

export default function WaitlistTable({
  users,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onUserClick,
  onApproveUser,
  onRejectUser,
  updatingMap,
  loading,
}: WaitlistTableProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRejectUser, setSelectedRejectUser] = useState<WaitlistUser | null>(null);

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-gray-100 text-gray-800 border border-gray-200',
      Approved: 'bg-[#DCFCE7] text-[#166534] border-[#26B625]',
      Rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.Pending} font-roboto`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isUserUpdating = (user: WaitlistUser) =>
    user.id ? Boolean(updatingMap[user.id]) : false;

  const handleRejectClick = (user: WaitlistUser) => {
    setSelectedRejectUser(user);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (selectedRejectUser && rejectReason.trim()) {
      onRejectUser(selectedRejectUser, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRejectUser(null);
    }
  };

  const columns: Column<WaitlistUser>[] = [
    {
      header: 'Username',
      key: 'name',
      render: (name, user) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <span className="text-sm font-medium text-gray-800 font-roboto">{name.charAt(0)}</span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 font-roboto">{name}</div>
            <div className="text-sm text-gray-500 font-roboto">{user.waitlist_slug_id}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Email',
      key: 'email',
      render: (val) => <span className="text-sm text-gray-900 font-roboto">{val}</span>
    },
    {
      header: 'Interest Area',
      key: 'Role',
      render: (val) => <span className="text-sm text-gray-900 font-roboto">{val}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'City',
      key: 'City',
      render: (val) => <span className="text-sm text-gray-900 font-roboto">{val}</span>
    },
    // {
    //   header: 'Brands',
    //   key: 'Brands',
    //   render: (brands) => (
    //     <div className="max-w-[150px]">
    //       {brands.map((brand, idx) => (
    //         <div key={idx} className="text-xs text-gray-900 font-roboto truncate">{brand}</div>
    //       ))}
    //     </div>
    //   )
    // },
    {
      header: 'Date Signed Up',
      key: 'dateSignedUp',
      render: (val) => <span className="text-sm text-gray-900 font-roboto">{formatDate(val)}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (_, user) => (
        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          {user.status === 'Pending' && (
            <>
              <button
                onClick={() => onApproveUser(user)}
                disabled={isUserUpdating(user)}
                className="px-3 py-1 bg-[#1A1A1A] text-white hover:bg-black transition-colors disabled:opacity-60 text-xs font-roboto"
              >
                {isUserUpdating(user) ? '...' : 'Approve'}
              </button>
              <button
                onClick={() => handleRejectClick(user)}
                disabled={isUserUpdating(user)}
                className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-60 text-xs font-roboto"
              >
                {isUserUpdating(user) ? '...' : 'Reject'}
              </button>
            </>
          )}
          <button
            onClick={() => onUserClick(user)}
            className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white  border border-gray-200 rounded-lg overflow-hidden">
      <ReusableTable
        columns={columns}
        data={users}
        onRowClick={onUserClick}
        selectable
        selectedIds={selectedUsers}
        onSelectRow={onUserSelect}
        onSelectAll={onSelectAll}
        emptyMessage="No waitlist signups yet"
        loading={loading}
      />

      <CommonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject User"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-roboto">
            Please provide a reason for rejecting this signup:
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-700 focus:ring-2 focus:ring-gray-200 outline-none font-roboto"
            rows={4}
            placeholder="Enter reason for rejection..."
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
        </div>
      </CommonModal>
    </div>
  );
}
