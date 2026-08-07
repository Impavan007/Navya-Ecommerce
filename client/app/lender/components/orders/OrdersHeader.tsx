'use client';

import { useState, useEffect } from 'react';
import { useLenderOrderStore } from '../../stores/orders/orderStrore';
import ExportModal from './Exportcsv';

interface OrdersHeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  getTabCount: (status: string) => number;
  onExport: (filters: any, limit: number) => Promise<void>;
  isExporting?: boolean;
  onClearAllFilters: () => void;
}

export default function OrdersHeader({
  selectedTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  category,
  onCategoryChange,
  getTabCount,
  onExport,
  isExporting = false,
  onClearAllFilters,
}: OrdersHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { orders, statusSummary } = useLenderOrderStore();

  const tabs = [
    { id: 'all', label: 'All Orders', count: statusSummary?.all },
    { id: 'requested', label: 'Requested', count: statusSummary?.requested },
    { id: 'accepted', label: 'Accepted', count: statusSummary?.accepted || statusSummary?.confirmed },
    { id: 'active', label: 'Active', count: statusSummary?.active },
    { id: 'completed', label: 'Completed', count: statusSummary?.completed },
    { id: 'cancelled', label: 'Cancelled', count: statusSummary?.cancelled },
    { id: 'disputed', label: 'Disputed', count: statusSummary?.disputed }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'requested', label: 'Requested' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'orderplaced', label: 'Order Placed' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'disputed', label: 'Disputed' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Dresses', label: 'Dresses' },
    { value: 'Jackets', label: 'Jackets' },
    { value: 'Bags', label: 'Bags' },
    { value: 'Shoes', label: 'Shoes' }
  ];

  const handleSearch = () => {
    onSearchChange(localSearchQuery);
    setShowMobileSearch(false); // Close mobile search after searching
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Build current filters object for export
  const buildCurrentFilters = () => {
    const filters: any = {};

    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (dateRange !== 'all') filters.dateRange = dateRange;
    if (category !== 'all') filters.category = category;
    if (selectedTab !== 'all') filters.tab = selectedTab;

    return filters;
  };

  const handleExportClick = async (limit: number) => {
    const currentFilters = buildCurrentFilters();
    await onExport(currentFilters, limit);
    setShowExportModal(false);
  };

  // Sync local search query with parent
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleClearFilters = () => {
    setLocalSearchQuery('');
    onClearAllFilters();
    setShowMobileSearch(false); // Close mobile search when clearing filters
  };

  return (
    <>
      <div className="bg-white shadow-sm border border-gray-200 mb-6 font-playfair">
        {/* Search & Filters */}
        <div className="px-3 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div>
                <h1 className="text-2xl font-canela font-semibold text-[#3D1126]">Orders</h1>
                <p className="text-sm text-gray-600 mt-1 flex-nowrap">
                  Manage your rental bookings and track order status
                </p>
              </div>

              {/* Mobile Search Toggle Button */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="sm:hidden flex items-center justify-center w-10 h-10 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                aria-label="Search orders"
              >
                <i className="ri-search-line text-gray-600"></i>
              </button>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search orders, items, or borrowers..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm w-full sm:w-80 font-playfair rounded-l-md rounded-r-none"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins border border-gray-800 rounded-r-md"
                >
                  Search
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
              >
                <i className="ri-filter-line"></i>
                Filters
                {showFilters ? <i className="ri-arrow-up-s-line"></i> : <i className="ri-arrow-down-s-line"></i>}
              </button>

              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
                title="Clear all filters"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="mt-4 sm:hidden">
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search orders, items, or borrowers..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm w-full font-playfair rounded-l-md rounded-r-none"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins border border-gray-800 rounded-r-md"
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Filters Section */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm font-playfair bg-[#F3D6DC] text-black"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => onDateRangeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm font-playfair bg-[#F3D6DC] text-black"
                  >
                    {dateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Item Category</label>
                  <select
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm font-playfair bg-[#F3D6DC] text-black"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setShowExportModal(true)}
                    disabled={isExporting}
                    className="w-full px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <i className="ri-download-line"></i>
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 underline font-poppins"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-3">
          <div className="hidden sm:flex overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${selectedTab === tab.id
                  ? 'border-gray-600 text-gray-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <span className="font-medium text-sm font-poppins">{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium font-poppins ${selectedTab === tab.id
                  ? 'bg-gray-100 text-gray-800 border border-gray-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportClick}
        isLoading={isExporting}
      />
    </>
  );
}