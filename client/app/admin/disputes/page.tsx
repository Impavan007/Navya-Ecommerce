'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import DisputesHeader from './components/DisputesHeader';
import DisputesFilters from './components/DisputesFilters';
import DisputesTable from './components/DisputesTable';
import DisputeDetailPanel from './components/DisputeDetailPanel';
import BulkActionsBar from './components/BulkActionsBar';
import DecisionModal from './components/DecisionModal';
import NonOrderDecisionModal from './components/NonOrderDecisionModal';
import useDisputeStore, { MappedDispute } from '../../admin/store/DisputeStore/Disputestore';
import CommonLoader from '../../components/common/CommonLoader';
import { Loader2 } from 'lucide-react';
import Pagination from '../components/pagination';
import toast from 'react-hot-toast';

export default function DisputesPage() {
  const {
    disputes,
    loading,
    error,
    fetchDisputes,
    resolveDispute,
    pagination,
    fetchDisputeById,
    statusCounts: statusCountsFromStore
  } = useDisputeStore();

  const [selectedDispute, setSelectedDispute] = useState<MappedDispute | null>(null);
  const [selectedDisputes, setSelectedDisputes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', reason: '', dateRange: '' });
  const [isOrder, setIsOrder] = useState<boolean | undefined>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [disputeToResolve, setDisputeToResolve] = useState<MappedDispute | null>(null);

  // Reset page to 1 when filters/search/tab/isOrder change
  useEffect(() => {
    setCurrentPage(1);
  }, [isOrder, activeTab, searchQuery, filters.status, filters.reason, filters.dateRange]);

  const searchParams = useSearchParams();
  const disputeIdParam = searchParams.get('disputeId');
  const chatIdParam = searchParams.get('chatId');

  // New effect to handle auto-opening a dispute from query params
  useEffect(() => {
    if (disputeIdParam && !loading && disputes?.length > 0) {
      const dispute = disputes.find(d => d.id === disputeIdParam);
      if (dispute) {
        handleDisputeClick(dispute);
      }
    } else if (chatIdParam && !loading && disputes?.length > 0) {
      // Find by chatId if disputeId is not available
      const dispute = disputes.find(d => d.id === chatIdParam || (d as any).chatId === chatIdParam);
      if (dispute) {
        handleDisputeClick(dispute);
      }
    }
  }, [disputeIdParam, chatIdParam, loading, disputes]);

  // Fetch disputes whenever filters/search/tab/page/isOrder change
  useEffect(() => {
    const statusParam = activeTab === 'all' ? undefined : activeTab;
    fetchDisputes({
      isOrder,
      page: currentPage,
      limit: pagination?.limit || 20,
      status: statusParam,
      reason: filters.reason,
      searched: searchQuery,
      dateRange: filters.dateRange
    });
  }, [isOrder, activeTab, searchQuery, filters.status, filters.reason, filters.dateRange, currentPage, fetchDisputes, pagination?.limit]);

  const disputeCounts = {
    all: statusCountsFromStore.all,
    open: statusCountsFromStore.Open,
    under_review: statusCountsFromStore.Progress,
    resolved: statusCountsFromStore.Resolved,
    escalated: statusCountsFromStore.Rejected,
  };

  const displayedDisputes = disputes || [];

  const handleSelectDispute = (disputeId: string) => {
    setSelectedDisputes(prev =>
      prev.includes(disputeId) ? prev.filter(id => id !== disputeId) : [...prev, disputeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDisputes(
      selectedDisputes.length === displayedDisputes.length
        ? []
        : displayedDisputes.map(d => d.id)
    );
  };

  const handleDisputeClick = async (dispute: MappedDispute) => {
    setSelectedDispute(dispute);
    setDetailLoading(true);
    try {
      const freshDisputeData = await fetchDisputeById(dispute.id);
      if (freshDisputeData) {
        setSelectedDispute(freshDisputeData);
      }
    } catch (err) {
      console.error('Error fetching dispute details:', err);
      toast.error('Unable To Fetch Data')
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClosePanel = () => {
    setSelectedDispute(null);
    setDetailLoading(false);
  };

  const handleOpenResolveModal = (dispute: MappedDispute) => {
    setDisputeToResolve(dispute);
    setShowDecisionModal(true);
    // If we're opening from the sidebar, we want to close the sidebar
    if (selectedDispute?.id === dispute.id) {
      handleClosePanel();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="flex flex-col transition-all duration-300">
        <DisputesHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          onToggleChange={(val) => setIsOrder(val)}
        />

        <div className="px-8 py-8">
          <DisputesFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={disputeCounts}
          />

          {selectedDisputes.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedDisputes.length}
              onClearSelection={() => setSelectedDisputes([])}
            />
          )}

          <div className="relative">
            {(loading && displayedDisputes.length === 0) ? (
              <div className="py-12 flex justify-center items-center">
                <CommonLoader size="md" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center mt-4">{error}</p>
            ) : (
              <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                <DisputesTable
                  disputes={displayedDisputes}
                  selectedDisputes={selectedDisputes}
                  onSelectDispute={handleSelectDispute}
                  onSelectAll={handleSelectAll}
                  onDisputeClick={handleDisputeClick}
                  onResolve={handleOpenResolveModal}
                />
              </div>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && !loading && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page: number) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      {selectedDispute && (
        <DisputeDetailPanel
          dispute={selectedDispute}
          onClose={handleClosePanel}
          onResolve={handleOpenResolveModal}
          loading={detailLoading}
        />
      )}

      {showDecisionModal && disputeToResolve && (
        disputeToResolve.isOrder ? (
          <DecisionModal
            dispute={disputeToResolve}
            onClose={() => {
              setShowDecisionModal(false);
              setDisputeToResolve(null);
            }}
          />
        ) : (
          <NonOrderDecisionModal
            dispute={disputeToResolve as any}
            onClose={() => {
              setShowDecisionModal(false);
              setDisputeToResolve(null);
            }}
          />
        )
      )}
    </div>
  );
}