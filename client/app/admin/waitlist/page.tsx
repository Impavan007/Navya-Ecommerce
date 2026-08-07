'use client';

import { useEffect, useState } from 'react';
// import adminLayout from '../components/adminLayout'; // Removed
import WaitlistHeader from './components/WaitlistHeader';
import WaitlistFilters from './components/WaitlistFilters';
import WaitlistTable from './components/WaitlistTable';
import WaitlistDetailPanel from './components/WaitlistDetailPanel';
import BulkActionsBar from './components/BulkActionsBar';
import { useWaitlistStore } from '../store/Waitlist/useWaitlistStore';
import type { WaitlistUser, WaitlistRole } from '../store/Waitlist/useWaitlistStore';
import Pagination from '../components/pagination';
import CommonModal from '../../components/common/CommonModal';
import CommonLoader from '../../components/common/CommonLoader';
export type { WaitlistUser } from '../store/Waitlist/useWaitlistStore';

export default function WaitlistPage() {
  const {
    waitlists,
    loading,
    error,
    fetchWaitlists,
    updateWaitlistStatus,
    updatingMap,
    currentPage,
    totalPages,
    statusSummary
  } = useWaitlistStore();
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<WaitlistUser | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status: string;
    Role: WaitlistRole | '';
    dateRange: string;
    sort: 'newest' | 'oldest' | 'A-Z';
    page: number;
    source?: string;
  }>({
    status: '',
    Role: '',
    dateRange: '',
    sort: 'newest',
    page: 1,
  });
  // ✅ Trigger whenever *any* filter, search, or activeTab changes
  useEffect(() => {
    useWaitlistStore.getState().fetchWaitlists({
      status: (activeTab !== 'all' ? activeTab : (filters.status || undefined)) as any,
      role: filters.Role || undefined,
      dateRange: filters.dateRange || undefined,
      sort: filters.sort || 'newest',
      search: searchQuery || undefined,
      page: filters.page || currentPage,
    });
  }, [filters, searchQuery, currentPage, activeTab]);
  useEffect(() => {
    setUsers(waitlists);
    setSelectedUser((prev) => {
      if (!prev) return prev;
      const latest = waitlists.find((item) => item.id === prev.id);
      return latest ?? prev;
    });
  }, [waitlists]);
  const isUpdating = (user: WaitlistUser | null) =>
    user?.id ? Boolean(updatingMap[user.id]) : false;

  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by tab
    // if (activeTab !== 'all') {
    //   const statusMap = {
    //     'pending': 'Pending',
    //     'approved': 'Approved',
    //     'rejected': 'Rejected'
    //   };
    //   filtered = filtered.filter(user => user.status === statusMap[activeTab as keyof typeof statusMap]);
    // }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    // if (filters.status) {
    //   filtered = filtered.filter(user => user.status === filters.status);
    // }

    // Filter by source
    if (filters.source) {
      filtered = filtered.filter(user => user.Role === filters.Role);
    }

    return filtered;
  };

  const tabCounts = {
    all: statusSummary.total,
    pending: statusSummary.pending,
    approved: statusSummary.approved,
    rejected: statusSummary.rejected
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
    const allSelected = filteredUsers.every(user => selectedUsers.includes(user.id));

    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleUserClick = (user: WaitlistUser) => {
    // Keep existing behavior to open the detail panel
    setSelectedUser(user);
    setShowDetailPanel(true);
  };

  const handleStatusUpdate = async (
    user: WaitlistUser,
    status: 'Approved' | 'Rejected',
    rejectionReason?: string
  ) => {
    if (!user.id) return;
    try {
      // The store now handles optimistic updates and reversion on error.
      await updateWaitlistStatus(user.id, status, rejectionReason);

    } catch (err) {
      console.error('❌ Failed to update waitlist status:', err);
    }
  };

  // Export CSV Modal state (like Users page)
  const [showExportModalLocal, setShowExportModalLocal] = useState(false);
  const [exportLimit, setExportLimit] = useState<number>(100);
  const [exportLoading, setExportLoading] = useState(false);

  const handleBulkAction = async (action: string) => {
    if (action === 'export') {
      setShowExportModalLocal(true);
      return;
    }
    const ids = selectedUsers;
    if (ids.length === 0) return;

    // Open reject modal for reason instead of prompt
    if (action === 'reject') {
      setShowBulkRejectModal(true);
      return;
    }

    try {
      await useWaitlistStore.getState().bulkUpdateWaitlists({ waitlistIds: ids, action: 'Approve' });
    } finally {
      setSelectedUsers([]);
    }
  };

  // Bulk Reject Modal
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const confirmBulkReject = async () => {
    const ids = selectedUsers;
    if (ids.length === 0 || !bulkRejectReason.trim()) return;
    try {
      await useWaitlistStore.getState().bulkUpdateWaitlists({ waitlistIds: ids, action: 'Reject', reason: bulkRejectReason.trim() });
      setShowBulkRejectModal(false);
      setBulkRejectReason('');
    } finally {
      setSelectedUsers([]);
    }
  };

  // Export CSV handler for waitlists
  const handleExportWaitlists = async () => {
    setExportLoading(true);
    try {
      const rows = await useWaitlistStore.getState().fetchWaitlists({
        status: filters.status as any || undefined,
        role: filters.Role || undefined,
        dateRange: filters.dateRange || undefined,
        sort: filters.sort || 'newest',
        search: searchQuery || undefined,
        page: 1,
        limit: exportLimit,
      });

      if (!rows || rows.length === 0) {
        setExportLoading(false);
        setShowExportModalLocal(false);
        return;
      }

      const headersSet = new Set<string>();
      rows.forEach((r: any) => Object.keys(r || {}).forEach((k) => headersSet.add(k)));
      const headers = Array.from(headersSet);
      const csvLines: string[] = [];
      csvLines.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));
      rows.forEach((r: any) => {
        const line = headers
          .map((h) => {
            const v = r?.[h];
            if (v === null || v === undefined) return '""';
            if (typeof v === 'object') return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(',');
        csvLines.push(line);
      });

      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitlists_export_${Date.now()}.csv`;
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

  const handleUpdateUser = (updatedUser: WaitlistUser) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setSelectedUser(updatedUser);
  };

  const filteredUsers = getFilteredUsers();

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    useWaitlistStore.setState({ currentPage: page }); // keep Zustand synced
  };

  return (
    <div className="p-8 space-y-6">
      <WaitlistHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={() => setShowExportModalLocal(true)}
      />

      <WaitlistFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedUsers([])}
        />
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-roboto">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        <div className={`transition-all duration-300 w-full`}>
          {loading ? (
            <div className="bg-white shadow-sm border border-gray-200 p-12 min-h-[400px] flex items-center justify-center">
              <CommonLoader size="md" text="Loading waitlists..." />
            </div>
          ) : (
            <WaitlistTable
              users={filteredUsers}
              selectedUsers={selectedUsers}
              onUserSelect={handleUserSelect}
              onSelectAll={handleSelectAll}
              onUserClick={handleUserClick}
              onApproveUser={(user) => handleStatusUpdate(user, 'Approved')}
              onRejectUser={(user, reason) => handleStatusUpdate(user, 'Rejected', reason)}
              updatingMap={updatingMap}
            />
          )}
        </div>


        {showDetailPanel && selectedUser && (
          <WaitlistDetailPanel
            user={selectedUser}
            onClose={() => setShowDetailPanel(false)}
            onUpdateUser={handleUpdateUser}
            onApproveUser={() =>
              selectedUser && handleStatusUpdate(selectedUser, 'Approved')
            }
            // ✅ Fix: Pass a function that accepts reason parameter
            onRejectUser={(reason) =>
              selectedUser && handleStatusUpdate(selectedUser, 'Rejected', reason)
            }
            isUpdating={isUpdating(selectedUser)}
          />
        )}
      </div>

      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      {/* Export CSV Modal */}
      <CommonModal
        isOpen={showExportModalLocal}
        onClose={() => setShowExportModalLocal(false)}
        title="Export Waitlists (CSV)"
        size="md"
      >
        <p className="text-sm text-gray-600 mb-4">Enter the maximum number of rows to include in the export.</p>
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
          <button onClick={handleExportWaitlists} disabled={exportLoading} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50">
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </CommonModal>

      {/* Bulk Reject Reason Modal */}
      <CommonModal
        isOpen={showBulkRejectModal}
        onClose={() => { setShowBulkRejectModal(false); setBulkRejectReason(''); }}
        title="Reject Selected Users"
        size="md"
      >
        <p className="text-sm text-gray-600 mb-3">Please provide a reason for rejecting the selected waitlist users.</p>
        <textarea
          value={bulkRejectReason}
          onChange={(e) => setBulkRejectReason(e.target.value)}
          placeholder="Enter reason for rejection..."
          rows={4}
          className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 focus:ring-2 focus:ring-gray-200 outline-none font-roboto"
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => { setShowBulkRejectModal(false); setBulkRejectReason(''); }} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-roboto">Cancel</button>
          <button onClick={confirmBulkReject} disabled={!bulkRejectReason.trim()} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 font-roboto">Confirm Reject</button>
        </div>
      </CommonModal>
    </div>
  );
}

