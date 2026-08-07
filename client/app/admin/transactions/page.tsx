'use client';

import { useState, useEffect } from 'react';
import TransactionsHeader from './components/TransactionsHeader';
import TransactionsSummary from './components/TransactionsSummary';
import TransactionsTable from './components/TransactionsTable';
import TransactionDetailPanel from './components/TransactionDetailPanel';
import BulkActionsBar from './components/BulkActionsBar';
import RetryModal from './components/RetryModal';
import ExportModal from './components/ExportModal';
import { useTransactionStore, Transaction } from '../store/transactionStore/Transaction';
import Pagination from '../components/pagination';

export default function TransactionsPage() {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    amountRange: 'all'
  });

  const {
    transactions,
    statistics,
    transactionDetail,
    loading,
    detailLoading,
    error,
    pagination,
    fetchTransactions,
    getTransactionById,
    clearError,
    clearTransactionDetail
  } = useTransactionStore();

  useEffect(() => {
    fetchTransactions({
      searchQuery,
      filters
    });
  }, [searchQuery, filters, fetchTransactions]);

  const handleTransactionClick = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailPanel(true);
    try {
      await getTransactionById(transaction.id);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };

  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedTransaction(null);
    clearTransactionDetail();
  };

  const handleTransactionAction = (action: string, transaction?: Transaction) => {
    if (transaction) {
      setSelectedTransaction(transaction);
    }
    switch (action) {
      case 'retry':
        setShowRetryModal(true);
        break;
      case 'export':
        setShowDetailPanel(true);
        if (transaction) {
          try {
            getTransactionById(transaction.id);
          } catch (error) {
            console.error('Error fetching transaction details:', error);
          }
        }
        break;
      case 'reconcile':
        break;
      default:
    }
  };

  const handleBulkAction = (action: string) => {
    handleTransactionAction(action);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleRetry = () => {
    setShowRetryModal(false);
    setShowDetailPanel(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TransactionsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => fetchTransactions({ searchQuery, filters })}
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      <div className="px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <TransactionsSummary statistics={statistics} loading={loading && transactions.length === 0} />

        {selectedTransactions.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedTransactions.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedTransactions([])}
          />
        )}

        <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
          <TransactionsTable
            transactions={transactions}
            loading={loading && transactions.length === 0}
            searchQuery={searchQuery}
            filters={filters}
            selectedTransactions={selectedTransactions}
            onSelectionChange={setSelectedTransactions}
            onTransactionClick={handleTransactionClick}
            onTransactionAction={handleTransactionAction}
          />
        </div>
      </div>

      {!loading && (
        <Pagination
          currentPage={pagination?.currentPage || 1}
          totalPages={pagination?.totalPages || 1}
          onPageChange={(page) => fetchTransactions({
            searchQuery,
            filters,
            page
          })}
        />
      )}

      {showDetailPanel && selectedTransaction && (
        <TransactionDetailPanel
          transaction={selectedTransaction}
          transactionDetail={transactionDetail}
          detailLoading={detailLoading}
          onClose={handleCloseDetailPanel}
          onTransactionAction={handleTransactionAction}
        />
      )}

      {showRetryModal && (
        <RetryModal
          transaction={selectedTransaction}
          onClose={() => setShowRetryModal(false)}
          onConfirm={handleRetry}
        />
      )}

      {showExportModal && (
        <ExportModal
          searchQuery={searchQuery}
          filters={filters}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
