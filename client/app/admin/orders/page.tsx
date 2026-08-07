'use client';

import { useState } from 'react';

import OrdersHeader from './components/OrdersHeader';
import OrdersFilters from './components/OrdersFilters';
import OrdersTable from './components/OrdersTable';
import OrderDetailPanel from './components/OrderDetailPanel';
import BulkActionsBar from './components/BulkActionsBar';
import RefundModal from './components/RefundModal';
import LateFeeModal from './components/LateFeeModal';
import Pagination from '@/app/lender/components/Pagination';
import { useLenderOrderTableStore } from '../store/order/AdminOrderstore';
import axiosClient from '../adminApi/axiosClient';
import { API_ENDPOINTS } from '../adminApi/apiEndpoints';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showLateFeeModal, setShowLateFeeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    amountRange: 'all'
  });

  const { orders, pagination, fetchOrderById, loading } = useLenderOrderTableStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLimit, setExportLimit] = useState(100);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setShowDetailPanel(true);
  };

  const handleOrderAction = (action: string, order?: any) => {
    if (order) {
      setSelectedOrder(order);
    }

    switch (action) {
      case 'refund':
        setShowRefundModal(true);
        break;
      case 'late-fee':
        setShowLateFeeModal(true);
        break;
      case 'mark-returned':

        break;
      case 'cancel':

        break;
      case 'mark-disputed':

        break;
      default:

    }
  };

  const handleBulkAction = (action: string) => {
    handleOrderAction(action);
  };

  const handleExport = () => {
    setExportError(null);
    setShowExportModal(true);
  };

  const buildExportParams = () => {
    const limitValue =
      Number.isFinite(exportLimit) && exportLimit > 0 ? Math.floor(exportLimit) : 1;

    const params: Record<string, any> = {
      limit: limitValue,
      page: 1,
    };

    const normalizedStatus =
      (filters.status && filters.status !== 'all' && filters.status) ||
      (activeTab !== 'all' ? activeTab : undefined);

    if (normalizedStatus) params.status = normalizedStatus;
    if (filters.dateRange && filters.dateRange !== 'all') params.dateRange = filters.dateRange;
    if (filters.amountRange && filters.amountRange !== 'all') params.amountRange = filters.amountRange;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    return params;
  };

  const handleExportConfirm = async () => {
    setExportLoading(true);
    setExportError(null);

    try {
      const response = await axiosClient.get(API_ENDPOINTS.Orders, {
        params: buildExportParams(),
      });

      const rows = response.data?.data?.orders || [];
      if (!rows.length) {
        setExportError('No orders found for the current filters.');
        return;
      }

      const headersSet = new Set<string>();
      rows.forEach((row: any) => {
        Object.keys(row || {}).forEach((key) => headersSet.add(key));
      });
      const headers = Array.from(headersSet);

      const csvLines: string[] = [];
      csvLines.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));

      rows.forEach((row: any) => {
        const line = headers
          .map((header) => {
            const value = row?.[header];
            if (value === null || value === undefined) return '""';
            if (typeof value === 'object') {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(',');
        csvLines.push(line);
      });

      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (error) {
      console.error('Failed to export orders', error);
      setExportError('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Keep filters.status in sync with the active tab so API params are consistent
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      // omit status (undefined) when 'all' is selected so we don't send status=all to API
      status: tab === 'all' ? '' : tab,
    }));
  };

  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <OrdersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      <div className="px-8 py-8">
        <OrdersFilters
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {selectedOrders.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedOrders.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedOrders([])}
          />
        )}

        <OrdersTable
          activeTab={activeTab}
          searchQuery={searchQuery}
          filters={filters}
          selectedOrders={selectedOrders}
          onSelectionChange={setSelectedOrders}
          onOrderClick={handleOrderClick}
          onOrderAction={handleOrderAction}
        />
      </div>

      {!(loading && orders.length === 0) && (
        <div className="mb-4">
          <Pagination
            currentPage={pagination?.currentPage}
            onPageChange={handlePageChange}
            totalPages={pagination?.totalPages}
          />
        </div>
      )}

      {showDetailPanel && selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={handleCloseDetailPanel}
          onOrderAction={handleOrderAction}
        />
      )}

      {showRefundModal && (
        <RefundModal
          isOpen={showRefundModal}
          order={selectedOrder}
          selectedOrders={selectedOrders}
          onClose={() => setShowRefundModal(false)}
          onConfirm={() => {
            setShowRefundModal(false);
            setSelectedOrders([]);
            setShowDetailPanel(false);
          }}
        />
      )}

      {showLateFeeModal && (
        <LateFeeModal
          order={selectedOrder}
          onClose={() => setShowLateFeeModal(false)}
          onConfirm={() => {
            setShowLateFeeModal(false);
            setShowDetailPanel(false);
          }}
        />
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 relative font-poppins">
            <button
              onClick={() => {
                setShowExportModal(false);
                setExportError(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
              aria-label="Close export modal"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-2">Export Orders (CSV)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the maximum number of rows to include in the export. Current filters will be applied.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                min={1}
                value={exportLimit}
                onChange={(e) => {
                  const parsed = Number(e.target.value);
                  setExportLimit(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
                }}
                className="w-32 px-3 py-2 border border-gray-300 rounded"
              />
              <span className="text-sm text-gray-500">rows</span>
            </div>
            {exportError && (
              <div className="mb-4 text-sm text-red-600">
                {exportError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExportConfirm}
                disabled={exportLoading}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
              >
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}