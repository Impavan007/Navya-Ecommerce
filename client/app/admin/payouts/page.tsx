'use client';

import { useEffect, useState } from 'react';
import { usePayoutStore } from '../store/payout/payoutStore';
import PayoutsSummary from './components/PayoutsSummary';
import PayoutsHeader from './components/PayoutsHeader';
import PayoutsTable from './components/PayoutsTable';
import PayoutDetailPanel from './components/PayoutDetailPanel';
import BulkActionsBar from './components/BulkActionsBar';
import ApproveModal from './components/ApproveModal';
import ExportModal from './components/ExportModal';
import CommonModal from '@/app/components/common/CommonModal';
import Pagination from '../components/pagination';
import toast from 'react-hot-toast';

export default function PayoutsPage() {
  const { payouts, statusCounts, stats, payoutsLoading, pagination, fetchPayouts, fetchPayoutStats, markPayoutAsPaid, updatePayoutStatus } = usePayoutStore();
  const [selectedPayouts, setSelectedPayouts] = useState<any[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [initialStatus, setInitialStatus] = useState<'approve' | 'hold'>('approve');
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    amountFrom: '',
    amountTo: '',
    lender: '',
    search: '',
    page: 1
  });

  useEffect(() => {
    fetchPayouts(filters);
    fetchPayoutStats();
  }, [filters, fetchPayouts, fetchPayoutStats]);

  const handlePayoutSelect = (payoutId: string) => {
    setSelectedPayouts(prev => {
      const isSelected = prev.some(p => p._id === payoutId);
      if (isSelected) {
        return prev.filter(p => p._id !== payoutId);
      } else {
        const payoutToAdd = payouts.find(p => p._id === payoutId);
        return payoutToAdd ? [...prev, payoutToAdd] : prev;
      }
    });
  };

  const handleSelectAll = () => {
    const selectablePayouts = payouts.filter(p => p.status.toLowerCase() !== 'completed');
    const selectableIds = selectablePayouts.map(p => p._id);
    const allSelectableOnPageSelected = selectableIds.length > 0 && selectableIds.every(id => selectedPayouts.some(p => p._id === id));

    if (allSelectableOnPageSelected) {
      // Remove all IDs from current page while keeping selections from other pages
      setSelectedPayouts(prev => prev.filter(p => !selectableIds.includes(p._id)));
    } else {
      // Add missing selectable payouts from current page
      setSelectedPayouts(prev => {
        const missingPayouts = selectablePayouts.filter(p => !prev.some(sp => sp._id === p._id));
        return [...prev, ...missingPayouts];
      });
    }
  };

  const handlePayoutClick = (payout: any) => {
    setSelectedPayout(payout);
    setShowDetailPanel(true);
  };

  const handleApprove = (payout: any) => {
    setSelectedPayout(payout);
    setInitialStatus('approve');
    setShowApproveModal(true);
  };

  const handleHold = (payout: any) => {
    setSelectedPayout(payout);
    setInitialStatus('hold');
    setShowApproveModal(true);
  };

  const handleRetry = (payout: any) => {
    setSelectedPayout(payout);
    setShowRetryModal(true);
  };

  const confirmRetry = async () => {
    if (!selectedPayout) return;
    try {
      setIsRetrying(true);
      const success = await updatePayoutStatus(selectedPayout._id || selectedPayout.id, 'retry');
      if (success) {
        toast.success('Payout retry-attempted successfully');
        setShowRetryModal(false);
        fetchPayouts(filters);
        fetchPayoutStats();
      } else {
        toast.error('Failed to retry payout');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleMarkPaid = (payout: any) => {
    setSelectedPayout(payout);
    setShowMarkPaidModal(true);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const confirmMarkPaid = async () => {
    if (!selectedPayout) return;
    try {
      setIsMarkingPaid(true);
      const success = await markPayoutAsPaid(selectedPayout._id || selectedPayout.id);
      if (success) {
        toast.success('Payout marked as paid successfully');
        setShowMarkPaidModal(false);
        fetchPayouts(filters);
        fetchPayoutStats();
      } else {
        toast.error('Failed to mark payout as paid');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  return (
    <div className="p-8 pt-10 min-h-screen bg-[#FAF6F3]">
      <PayoutsHeader
        filters={filters}
        statusCounts={statusCounts}
        onFiltersChange={setFilters}
        onExport={() => setShowExportModal(true)}
      />

      <PayoutsSummary stats={stats} />

      {selectedPayouts.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedPayouts.length}
          onApproveSelected={() => {
            setInitialStatus('approve');
            setShowApproveModal(true);
          }}
          onExportSelected={() => setShowExportModal(true)}
          onClearSelection={() => setSelectedPayouts([])}
        />
      )}

      <PayoutsTable
        payouts={payouts}
        loading={payoutsLoading}
        selectedPayouts={selectedPayouts.map(p => p._id)}
        onPayoutSelect={handlePayoutSelect}
        onSelectAll={handleSelectAll}
        onPayoutClick={handlePayoutClick}
        onApprove={handleApprove}
        onHold={handleHold}
        onMarkPaid={handleMarkPaid}
        onRetry={handleRetry}
      />

      {pagination?.totalPages > 1 && !payoutsLoading && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {showDetailPanel && selectedPayout && (
        <PayoutDetailPanel
          payout={selectedPayout}
          onClose={() => setShowDetailPanel(false)}
          onApprove={() => handleApprove(selectedPayout)}
          onHold={() => handleHold(selectedPayout)}
          onMarkPaid={() => handleMarkPaid(selectedPayout)}
          onRetry={() => handleRetry(selectedPayout)}
        />
      )}

      {showApproveModal && (
        <ApproveModal
          payout={selectedPayout}
          selectedPayouts={selectedPayouts}
          initialStatus={initialStatus}
          onClose={() => {
            setShowApproveModal(false);
            setInitialStatus('approve');
          }}
          onConfirm={() => {
            setShowApproveModal(false);
            setInitialStatus('approve');
            setSelectedPayouts([]);
            fetchPayouts(filters);
            fetchPayoutStats();
          }}
        />
      )}

      {showMarkPaidModal && (
        <CommonModal
          isOpen={true}
          onClose={() => setShowMarkPaidModal(false)}
          title="Mark as Paid"
          size="sm"
          loading={isMarkingPaid}
        >
          <div className="space-y-4">
            <p className="text-gray-700 font-poppins text-center py-4">Do you want to proceed with marking this payout as paid?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMarkPaidModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors font-poppins rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkPaid}
                disabled={isMarkingPaid}
                className="flex-1 bg-green-600 text-white px-4 py-2 font-medium hover:bg-green-700 transition-colors disabled:opacity-50 font-poppins rounded-lg"
              >
                Proceed
              </button>
            </div>
          </div>
        </CommonModal>
      )}

      {showRetryModal && (
        <CommonModal
          isOpen={true}
          onClose={() => setShowRetryModal(false)}
          title="Retry Payout"
          size="sm"
          loading={isRetrying}
        >
          <div className="space-y-4">
            <p className="text-gray-700 font-poppins text-center py-4">Do you want to proceed with retrying this failed payout?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRetryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors font-poppins rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmRetry}
                disabled={isRetrying}
                className="flex-1 bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 font-poppins rounded-lg"
              >
                Proceed
              </button>
            </div>
          </div>
        </CommonModal>
      )}

      {showExportModal && (
        <ExportModal
          selectedPayouts={selectedPayouts.map(p => p._id)}
          filters={filters}
          onClose={() => setShowExportModal(false)}
          onConfirm={() => {
            setShowExportModal(false);
            setSelectedPayouts([]);
          }}
        />
      )}
    </div>
  );
}