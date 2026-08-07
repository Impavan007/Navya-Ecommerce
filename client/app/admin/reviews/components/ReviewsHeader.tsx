'use client';

import { useState, useEffect } from 'react';

interface ReviewsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void; // triggers server-side search
  filters: {
    rating: string;
    reviewerType: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
  loading?: boolean;
}

export default function ReviewsHeader({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  loading
}: ReviewsHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleExport = (format: string) => {
    setShowExportModal(false);
  };

  const handleSearchClick = () => {
    onSearchChange(localSearch.trim());
  };

  return (
    <>
      <div className="bg-gray-50 border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#3D1126] font-canela">Reviews Management</h1>
            <p className="text-gray-600 mt-2 font-playfair">Monitor and moderate platform reviews</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border transition-colors whitespace-nowrap font-poppins text-sm flex items-center space-x-2 ${showFilters
                ? 'bg-gray-200 border-gray-400 text-gray-900'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <i className="ri-filter-3-line text-lg"></i>
              <span>Filters</span>
            </button>

            {/* <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-gray-800 text-white  hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-download-line"></i>
                </div>
                <span>Export</span>
              </div>
            </button> */}
          </div>
        </div>

        {/* Search input + button */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by user, order ID, or review text..."
              className="block w-full px-4 py-2 bg-white border border-gray-300 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 font-playfair"
            />
          </div>
          <button
            onClick={handleSearchClick}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors font-poppins"
          >
            Search
          </button>
        </div>

        {showFilters && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 font-poppins">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => onFiltersChange({ ...filters, rating: e.target.value })}
                  className="px-3 py-2 bg-white border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 font-playfair min-w-[140px]"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 font-poppins">Reviewer Type</label>
                <select
                  value={filters.reviewerType}
                  onChange={(e) => onFiltersChange({ ...filters, reviewerType: e.target.value })}
                  className="px-3 py-2 bg-white border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 font-playfair min-w-[140px]"
                >
                  <option value="">All Types</option>
                  <option value="borrower">Borrower</option>
                  <option value="lender">Lender</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 font-poppins">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
                  className="px-3 py-2 bg-white border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 font-playfair min-w-[140px]"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>

              <button
                onClick={() => onFiltersChange({ rating: '', reviewerType: '', dateRange: '' })}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-poppins ml-auto"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-poppins">Export Reviews</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-100  transition-colors"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-close-line text-gray-400"></i>
                  </div>
                </button>
              </div>
              <p className="text-gray-600 mb-6 font-playfair">Choose export format for reviews data</p>
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full p-3 text-left border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  CSV Export
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full p-3 text-left border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Excel Export
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full p-3 text-left border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
