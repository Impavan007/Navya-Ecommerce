'use client';

import { useState } from 'react';

interface DisputesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    status: string;
    reason: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
  onToggleChange?: (isOrder: boolean) => void;
}

export default function DisputesHeader({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange
  , onToggleChange
}: DisputesHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [isOrder, setIsOrder] = useState(true);

  const statusOptions = [
    { value: '', label: 'All Disputes' },
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // const reasonOptions = [
  //   { value: '', label: 'All Reasons' },
  //   { value: 'damage', label: 'Damage' },
  //   { value: 'late_return', label: 'Late Return' },
  //   { value: 'not_returned', label: 'Not Returned' },
  //   { value: 'payment_issue', label: 'Payment Issue' },
  //   { value: 'other', label: 'Other' }
  // ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearch = () => {
    onSearchChange(localSearch.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExport = () => {
    // Export functionality would be implemented here
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 font-poppins">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#3D1126] font-canela">
          Disputes Management
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border transition-colors whitespace-nowrap font-poppins ${showFilters
              ? 'bg-gray-100 border-gray-300 text-gray-800'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-filter-line"></i>
            </div>
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Toggle: Order-related vs Other */}
        <div className="flex items-center space-x-2 mr-4">
          <button
            onClick={() => { setIsOrder(true); onToggleChange && onToggleChange(true); }}
            className={`px-3 py-2 rounded text-sm transition-colors ${isOrder ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
          >
            Order-related
          </button>
          <button
            onClick={() => { setIsOrder(false); onToggleChange && onToggleChange(false); }}
            className={`px-3 py-2 rounded text-sm transition-colors ${!isOrder ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
          >
            Non-order
          </button>
        </div>
        <div className="flex-1 max-w-md flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search by dispute ID, order ID, or user..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white font-playfair rounded-l-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-gray-800 text-white px-6 py-2 border border-gray-800 rounded-r-lg text-sm font-medium hover:bg-black transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center space-x-4 pt-4 mt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 font-poppins">Date Range:</label>
            <select
              value={filters.dateRange}
              onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
              className="border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              onFiltersChange({ status: '', reason: '', dateRange: '' });
              onSearchChange('');
              setLocalSearch('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium font-poppins"
          >
            Clear Filters & Search
          </button>
        </div>
      )}
    </div>
  );
}
