'use client';

import { useState, useEffect } from 'react';
import UsersHeader from './components/UsersHeader';
import UsersFilters from './components/UsersFilters';
import UsersTable from './components/UsersTable';
import UserDetailPanel from './components/UserDetailPanel';
import BulkActionsBar from './components/BulkActionsBar';
import ExportDataModal from './components/ExportDataModal';
import DeleteUserModal from './components/DeleteUserModal';
import useadminUsersStore from '../store/useStore/usersStore';
import Pagination from '../components/pagination';
import CommonModal from '../../components/common/CommonModal';

export default function UsersManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToAction, setUserToAction] = useState<any>(null);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateJoined: '',
    page: 1
  });

  const { users, loading, pagination, fetchUsers, bulkUpdateUsers, counts } = useadminUsersStore();
  const [showExportModalLocal, setShowExportModalLocal] = useState(false);
  const [exportLimit, setExportLimit] = useState<number>(100);
  const [exportLoading, setExportLoading] = useState(false);

  const getFilteredUsers = () => {
    return users || [];
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowDetailPanel(true);
  };

  const handleSuspendUser = (user: any) => {
    setUserToAction(user);
    // setSuspendModal(true); // This modal seems to be commented out or missing in original logic
  };

  const handleExportData = (user: any) => {
    setUserToAction(user);
    setShowExportModal(true);
  };

  const handleDeleteUser = (user: any) => {
    setUserToAction(user);
    setShowDeleteModal(true);
  };

  const getCounts = () => {
    return {
      all: counts.total || 0,
      Renters: counts.roleCounts.Renter || 0,
      lenders: counts.roleCounts.Lender || 0,
      suspended: counts.statusCounts.Suspended || 0
    };
  };

  useEffect(() => {
    const role = filters.role || (activeTab === 'Renters' ? 'Renter' : activeTab === 'lenders' ? 'Lender' : undefined);
    const status = filters.status || (activeTab === 'suspended' ? 'Suspended' : undefined);
    const dateJoined = filters.dateJoined || undefined;
    fetchUsers({ role, status, search: searchQuery, page: filters.page, limit: 10, dateJoined });
  }, [activeTab, searchQuery, filters.page, filters.role, filters.status, filters.dateJoined, fetchUsers]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setSelectedUsers([]);
  };

  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
    setSelectedUsers([]);
  }, [activeTab, searchQuery, filters.role, filters.status, filters.dateJoined]);

  const handleBulkExport = async () => {
    setExportLoading(true);
    try {
      const role = activeTab === 'Renters' ? 'Renter' : activeTab === 'lenders' ? 'Lender' : undefined;
      const status = activeTab === 'suspended' ? 'Suspended' : undefined;
      const exported = await fetchUsers({
        role,
        status,
        search: searchQuery,
        page: 1,
        limit: exportLimit
      });
      const rows = exported || [];
      if (rows.length === 0) {
        setExportLoading(false);
        return;
      }
      const headersSet = new Set<string>();
      rows.forEach((r: any) => Object.keys(r || {}).forEach((k) => headersSet.add(k)));
      const headers = Array.from(headersSet);
      const csvLines = [];
      csvLines.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));
      rows.forEach((r: any) => {
        const line = headers.map((h) => {
          const v = r?.[h];
          if (v === null || v === undefined) return '""';
          if (typeof v === 'object') return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
          return `"${String(v).replace(/"/g, '""')}"`;
        }).join(',');
        csvLines.push(line);
      });
      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExportLoading(false);
      setShowExportModalLocal(false);
    }
  };

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gray-50">
      <UsersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onExportClick={() => setShowExportModalLocal(true)}
      />

      <UsersFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={getCounts()}
      />

      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          onClearSelection={() => setSelectedUsers([])}
          onBulkExport={() => setShowExportModalLocal(true)}
          onBulkActivate={async () => {
            if (selectedUsers.length === 0) return;
            try {
              await bulkUpdateUsers({ userIds: selectedUsers, action: 'Activate' });
            } finally {
              setSelectedUsers([]);
            }
          }}
          onBulkReject={() => setShowBulkRejectModal(true)}
          onBulkMakeTopLender={async () => {
            if (selectedUsers.length === 0) return;
            try {
              await bulkUpdateUsers({ userIds: selectedUsers, action: 'MakeTopLender' });
            } finally {
              setSelectedUsers([]);
            }
          }}
          onBulkRemoveTopLender={async () => {
            if (selectedUsers.length === 0) return;
            try {
              await bulkUpdateUsers({ userIds: selectedUsers, action: 'RemoveFromTopLender' });
            } finally {
              setSelectedUsers([]);
            }
          }}
        />
      )}

      <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
        <UsersTable
          users={getFilteredUsers()}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
          onSelectAll={handleSelectAll}
          onViewUser={handleViewUser}
          onSuspendUser={handleSuspendUser}
          onExportData={handleExportData}
          onDeleteUser={handleDeleteUser}
          loading={loading && getFilteredUsers().length === 0}
        />
      </div>

      {pagination?.totalPages > 1 && !loading && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {showDetailPanel && selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setShowDetailPanel(false)}
          onSuspend={() => handleSuspendUser(selectedUser)}
          onExport={() => handleExportData(selectedUser)}
          onDelete={() => handleDeleteUser(selectedUser)}
        />
      )}

      {showExportModal && (
        <ExportDataModal
          user={userToAction}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onConfirm={() => {
            setShowExportModal(false);
            setUserToAction(null);
          }}
        />
      )}

      <CommonModal
        isOpen={showExportModalLocal}
        onClose={() => setShowExportModalLocal(false)}
        title="Export Users (CSV)"
        size="md"
      >
        <p className="text-sm text-gray-600 mb-4">Enter the maximum number of users to include in the export.</p>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="number"
            min={1}
            value={exportLimit}
            onChange={(e) => setExportLimit(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded"
          />
          <div className="text-sm text-gray-500">rows</div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowExportModalLocal(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
          <button onClick={handleBulkExport} disabled={exportLoading} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50">
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </CommonModal>

      {showDeleteModal && (
        <DeleteUserModal
          user={userToAction}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            setUserToAction(null);
            const role = activeTab === 'Renters' ? 'Renter' : activeTab === 'lenders' ? 'Lender' : undefined;
            const status = activeTab === 'suspended' ? 'Suspended' : undefined;
            fetchUsers({ role, status, search: searchQuery, page: filters.page, limit: 10 });
          }}
        />
      )}

      <CommonModal
        isOpen={showBulkRejectModal}
        onClose={() => { setShowBulkRejectModal(false); setBulkRejectReason(''); }}
        title="Reject Selected Users"
        size="md"
      >
        <p className="text-sm text-gray-600 mb-3 font-playfair">Please provide a reason to reject (suspend) the selected users.</p>
        <textarea
          className="w-full border border-gray-300 p-2 mb-4 font-playfair"
          rows={4}
          placeholder="Enter reason..."
          value={bulkRejectReason}
          onChange={(e) => setBulkRejectReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => { setShowBulkRejectModal(false); setBulkRejectReason(''); }} className="px-4 py-2 border">Cancel</button>
          <button
            onClick={async () => {
              if (!bulkRejectReason.trim()) return;
              try {
                await bulkUpdateUsers({ userIds: selectedUsers, action: 'Suspended', reason: bulkRejectReason.trim() });
              } finally {
                setShowBulkRejectModal(false);
                setBulkRejectReason('');
                setSelectedUsers([]);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white"
            disabled={!bulkRejectReason.trim()}
          >
            Confirm Reject
          </button>
        </div>
      </CommonModal>
    </div>
  );
}
