import { useState } from 'react';

interface MessagingHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  dateRange: { from: string; to: string };
  setDateRange: (range: { from: string; to: string }) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export default function MessagingHeader({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  dateRange,
  setDateRange,
  statusFilter,
  setStatusFilter
}: MessagingHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearch = () => {
    setSearchQuery(localSearch.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleExportAll = () => {
  };

  return (
<div className="bg-white border-b border-gray-200 px-8  pb-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D1126] font-canela">Messaging Oversight</h1>
          <p className="text-gray-600 mt-2">Monitor and moderate borrower-lender conversations</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2  border transition-colors whitespace-nowrap ${
              showFilters 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-filter-line"></i>
              </div>
              <span>Filters</span>
            </div>
          </button>
          
          <button
            onClick={handleExportAll}
            className="px-4 py-2 bg-yellow-600 text-white  hover:bg-yellow-700 transition-colors whitespace-nowrap"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-download-line"></i>
              </div>
              <span>Export All</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="flex-1 max-w-md flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by user, order ID, or keyword..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200  text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent rounded-l-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-yellow-600 text-white px-4 py-2 text-sm font-medium hover:bg-yellow-700 transition-colors rounded-r-lg border border-yellow-600"
          >
            Search
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 p-4 bg-gray-50  border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="flagged">Flagged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateRange({ from: '', to: '' });
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-200  hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
