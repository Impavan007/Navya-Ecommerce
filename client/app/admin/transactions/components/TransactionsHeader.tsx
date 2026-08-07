'use client';

import { useState } from 'react';

interface TransactionsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onExport: () => void;
}

export default function TransactionsHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  filters,
  onFiltersChange,
  onExport
}: TransactionsHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchSubmit = () => {
    onSearchChange(localSearchQuery);
    onSearchSubmit();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange('');
    onSearchSubmit();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D1126] mb-2 font-canela">Transactions</h1>
          <p className="text-gray-600 font-playfair">Monitor all platform payments, deposits, and financial activity</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onExport}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
          >
            Export Ledger
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by transaction ID, order ID, user..."
              className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent font-playfair"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              {localSearchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-close-line"></i>
                  </div>
                </button>
              )}
              <button
                onClick={handleSearchSubmit}
                disabled={!localSearchQuery.trim()}
                className={`px-3 py-1 mr-1 rounded-md font-medium text-sm transition-colors font-poppins ${localSearchQuery.trim()
                    ? 'bg-gray-800 text-white hover:bg-gray-900'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg font-medium transition-colors whitespace-nowrap font-poppins ${showFilters
              ? 'border-gray-800 text-gray-800 bg-gray-100'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-filter-line"></i>
            </div>
            <span>Filters</span>
          </div>
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Transaction Type</label>
              <select
                value={filters.type}
                onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="all">All Types</option>
                <option value="payment">Payment</option>
                <option value="deposit-hold">Deposit Hold</option>
                <option value="deposit-release">Deposit Release</option>
                <option value="refund">Refund</option>
                <option value="late-fee">Late Fee</option>
                <option value="platform-fee">Platform Fee</option>
                <option value="payout">Payout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Date Range</label>
              <select
                value={filters.date_range}
                onChange={(e) => onFiltersChange({ ...filters, date_range: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Quarter">This Quarter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Amount Range</label>
              <select
                value={filters.amount_range}
                onChange={(e) => onFiltersChange({ ...filters, amount_range: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="All Amounts">All Amounts</option>
                <option value="Under Rs.50">Rs.0 - Rs.50</option>
                <option value="Rs.50 - Rs.200">Rs.50 - Rs.200</option>
                <option value="Rs.200 - Rs.500">Rs.200 - Rs.500</option>
                <option value="Over Rs.500">Rs.500+</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => onFiltersChange({
                type: 'all',
                status: 'all',
                date_range: 'all',
                amount_range: 'all'
              })}
              className="text-sm text-gray-600 hover:text-gray-800 font-poppins"
            >
              Clear all filters
            </button>
            <div className="text-sm text-gray-500 font-playfair">
              Showing transactions matching current filters
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
