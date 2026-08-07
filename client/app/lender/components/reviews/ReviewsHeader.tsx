'use client';

import { useState } from 'react';
import { useReviewStore } from '../../stores/Review/ReviewStore';

interface ReviewsHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  ratingFilter: string;
  setRatingFilter: (filter: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  itemFilter: string;
  setItemFilter: (filter: string) => void;
}

export default function ReviewsHeader({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  ratingFilter,
  setRatingFilter,
  dateRange,
  setDateRange,
  itemFilter,
  setItemFilter,
}: ReviewsHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const fetchReviews = useReviewStore((state) => state.fetchReviews);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews({
      search: searchInput || 'all',
      rating: ratingFilter,
      period: dateRange,
      itemId: itemFilter,
    });
  };

  const handleClearFilters = () => {
    setRatingFilter('all');
    setDateRange('all');
    setItemFilter('all');
    setSearchInput('');
    fetchReviews({ search: '' });
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden ">
      {/* 🔹 Header Top */}
      <div className="p-6 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* 🔹 Title Section */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-canela font-semibold text-[#3D1126]">
              Reviews
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base font-poppins">
              Check feedback and track your performance
            </p>
          </div>

          {/* 🔹 Search + Filter Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-800 hover:text-white transition-colors font-poppins text-sm rounded-md"
            >
              <i className="ri-filter-line"></i>
              Filters
            </button>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center relative w-full sm:w-auto"
            >
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none text-sm rounded-md w-full sm:w-64"
              />
              <button
                type="submit"
                className="ml-2 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 🔹 Filters Panel */}
      {showFilters && (
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                Rating
              </label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full font-poppins px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm bg-[#F3D6DC] text-black"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full font-poppins px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm bg-[#F3D6DC] text-black"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Item Filter */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                Item
              </label>
              <select
                value={itemFilter}
                onChange={(e) => setItemFilter(e.target.value)}
                className="w-full font-poppins px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
              >
                <option value="all">All Items</option>
                <option value="red-silk-dress">Red Silk Dress</option>
                <option value="sequin-jacket">Sequin Jacket</option>
                <option value="chanel-bag">Chanel Bag</option>
                <option value="black-blazer">Black Blazer</option>
                <option value="designer-heels">Designer Heels</option>
              </select>
            </div> */}
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 font-poppins text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
