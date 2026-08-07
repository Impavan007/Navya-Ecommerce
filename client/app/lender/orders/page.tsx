'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import OrdersHeader from '../components/orders/OrdersHeader';
import OrdersTable from '../components/orders/OrdersTable';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { useLenderOrderStore, Order } from '../stores/orders/orderStrore';
import Pagination from '../components/Pagination';

export default function OrdersPage() {
  const { orders, fetchOrders, pagination, statusSummary, loading } = useLenderOrderStore();
  const [selectedTab, setSelectedTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const { fetchOrderById, clearSelectedOrder } = useLenderOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [category, setCategory] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const clearAllFilters = () => {
    setSelectedTab('all');
    setSearchQuery('');
    setStatusFilter('all');
    setDateRange('all');
    setCategory('all');
    // Refetch with cleared filters
    fetchOrders({});
  };

  // Map tab IDs to API status values
  const getApiStatusFromTab = (tabId: string) => {
    const tabToStatusMap: { [key: string]: string | undefined } = {
      'all': undefined,
      'pending': 'pending',
      'accepted': 'accepted',
      'orderplaced': 'orderplaced',
      'active': 'active',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'requested': 'requested',
      'disputed': 'disputed'
    };
    return tabToStatusMap[tabId];
  };

  // Build filters object
  const buildFilters = () => {
    const filters: any = {};

    // Search filter
    if (searchQuery) {
      filters.search = searchQuery;
    }

    // Status filter - prioritize tab selection over status filter dropdown
    const apiStatus = getApiStatusFromTab(selectedTab);
    if (apiStatus) {
      filters.status = apiStatus;
    } else if (statusFilter !== 'all') {
      filters.status = normalizeStatusForApi(statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      filters.startDate = getDateRangeValue(dateRange);
    }

    // Category filter
    if (category !== 'all') {
      filters.category = category;
    }

    return filters;
  };

  // Helper function to get date range values
  const getDateRangeValue = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'last7days':
        return new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      case 'last30days':
        return new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
      case 'last3months':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString().split('T')[0];
      default:
        return undefined;
    }
  };

  // CSV Export utility function
  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    // Define CSV headers based on your order structure
    const headers = [
      'Order ID',
      'Order Number',
      'Item Title',
      'Category',
      'Size',
      'Borrower Name',
      'Borrower Email',
      'Start Date',
      'End Date',
      'Duration (days)',
      'Rental Price/Day',
      'Cleaning Fee',
      'Security Deposit',
      'Subtotal',
      'Platform Fee',
      'Shipping Charge',
      'Total Price',
      'Status',
      'Created Date'
    ];

    // Convert data to CSV rows
    const csvRows = [
      headers.join(','),
      ...data.map(order => [
        order.id,
        `"${order.orderNumber || ''}"`,
        `"${order.item?.title || ''}"`,
        `"${order.item?.category || ''}"`,
        `"${order.item?.size || ''}"`,
        `"${order.borrower?.name || ''}"`,
        `"${order.borrower?.email || ''}"`,
        order.startDate,
        order.endDate,
        order.duration,
        order.rentalPricePerDay,
        order.cleaningFee,
        order.securityDeposit,
        order.subtotal,
        order.platformFee,
        order.shippingCharge,
        order.totalPrice,
        `"${order.status}"`,
        order.createdAt
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const statusParam = searchParams.get('status')?.toLowerCase();

  const normalizeStatusForApi = (status: string) => {
    if (status === 'confirmed' || status === 'accepted') return 'accepted';
    return status;
  };

  const statusToTab = (status: string) => {
    if (status === 'confirmed' || status === 'accepted') return 'accepted';
    if (status === 'pending') return 'pending';
    if (status === 'orderplaced') return 'orderplaced';
    if (status === 'active') return 'active';
    if (status === 'completed') return 'completed';
    if (status === 'cancelled') return 'cancelled';
    if (status === 'requested') return 'requested';
    if (status === 'disputed') return 'disputed';
    return 'all';
  };

  useEffect(() => {
    if (statusParam) {
      const mapped = statusToTab(statusParam);
      if (mapped !== 'all') {
        setSelectedTab(mapped);
        setStatusFilter('all');
      } else {
        setSelectedTab('all');
        setStatusFilter(normalizeStatusForApi(statusParam));
      }
    }
  }, [statusParam]);

  useEffect(() => {
    if (orderIdParam && !loading && orders?.length > 0) {
      const order = orders.find(o => o.id === orderIdParam);
      if (order) {
        setModalOpen(true);
        fetchOrderById(order.id);
      }
    }
  }, [orderIdParam, loading, orders, fetchOrderById]);

  // Handle CSV export
  const handleExport = async (filters: any, limit: number) => {
    try {
      setIsExporting(true);

      // Fetch data with the specified limit and current filters
      const exportFilters = {
        ...filters,
        limit: limit === 0 ? undefined : limit, // 0 means all records
        page: 1 // Always start from first page for exports
      };

      // Remove tab filter and use status filter directly for export
      if (exportFilters.tab && exportFilters.tab !== 'all') {
        const apiStatus = getApiStatusFromTab(exportFilters.tab);
        if (apiStatus) {
          exportFilters.status = apiStatus;
        }
        delete exportFilters.tab;
      }

      // Fetch orders for export (you might need to adjust your store method)
      await fetchOrders(exportFilters);

      // Use current orders from store (or you might want to create a separate export endpoint)
      const exportData = orders; // This uses the already filtered data from store

      if (exportData.length === 0) {
        toast.error('No data available to export with the current filters.');
        return;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `orders_export_${timestamp}.csv`;

      // Download CSV
      downloadCSV(exportData, filename);

    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch orders when filters change
  useEffect(() => {
    const filters = buildFilters();
    fetchOrders(filters);
  }, [selectedTab, searchQuery, statusFilter, dateRange, category, fetchOrders]);

  // Count orders per tab (client-side filtering for display only)
  const getTabCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    // Reset status filter when changing tabs to avoid conflicts
    if (tabId !== 'all') {
      setStatusFilter('all');
    }
  };
  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    // Reset tab selection when using status filter
    if (status !== 'all') {
      setSelectedTab('all');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with tabs, search, and status filter */}
        <OrdersHeader
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          category={category}
          onCategoryChange={setCategory}
          getTabCount={getTabCount}
          onExport={handleExport}
          isExporting={isExporting}
          onClearAllFilters={clearAllFilters}
        />

        {/* Orders table/grid */}
        <OrdersTable
          orders={orders}
          onOrderSelect={(o) => {
            setModalOpen(true);
            fetchOrderById(o.id);
          }}
          pagination={pagination}
          onPageChange={(page) => {
            const filters = buildFilters();
            fetchOrders({ ...filters, page });
          }}
        />
        {/* Order detail modal (reads selected order from store). */}
        {modalOpen && (
          <OrderDetailModal onClose={() => { setModalOpen(false); clearSelectedOrder(); }} />
        )}

        {pagination && pagination.totalPages > 1 && orders.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => {
                const filters = buildFilters();
                fetchOrders({ ...filters, page });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
