'use client';

import { useState } from 'react';

interface OrdersHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onExport: () => void;
}

export default function OrdersHeader({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onExport
}: OrdersHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearchClick = () => {
    onSearchChange(localSearch.trim());
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6 font-poppins">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3D1126] font-canela">Orders Management</h1>

        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative flex items-center">
            <div className="relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by order ID, user, lender..."
                className="block w-80 pl-3 pr-20 py-2 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair"
              />
            </div>
            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              className="absolute right-0 top-0 h-full px-4 bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors font-poppins"
            >
              Search
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border  text-sm font-medium transition-colors whitespace-nowrap ${showFilters
                ? 'bg-gray-100 border-gray-300 text-gray-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              } font-poppins`}
          >
            <div className="flex items-center space-x-2">
              <i className="ri-filter-line"></i>
              <span>Filters</span>
            </div>
          </button>

          {/* Export */}
          <button
            onClick={onExport}
            className="px-4 py-2 bg-gray-800 text-white  text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <i className="ri-download-line"></i>
              <span>Export</span>
            </div>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="shipped">Shipped</option>
                {/* <option value="late">Late Returns</option> */}
                <option value="disputed">Disputed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
                onFiltersChange({ status: 'all', dateRange: 'all', amountRange: 'all' });
              }}
              className="text-sm text-gray-600 hover:text-gray-800 font-poppins"
            >
              Clear all filters & search
            </button>
            <div className="text-sm text-gray-500 font-playfair">
              Showing filtered results
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
