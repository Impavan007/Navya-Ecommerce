'use client';

import { useState } from 'react';

interface MessagesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  totalUnreadCount: number;
}

export default function MessagesHeader({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  totalUnreadCount
}: MessagesHeaderProps) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Messages', count: null },
    { value: 'unread', label: 'Unread', count: totalUnreadCount },
    { value: 'flagged', label: 'Flagged', count: null },
    { value: 'active', label: 'Active Orders', count: null }
  ];

  const currentFilter = filterOptions.find(option => option.value === filter);

  return (
    <div className="bg-[#F3D6DC] border-b border-gray-200 p-4 sm:p-6 flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-canela font-bold text-[#3D1126]">Messages</h1>
        {totalUnreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs sm:text-sm px-2 py-0.5 sm:py-1 rounded-full">
            {totalUnreadCount}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-[#D1D5DB] text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F3D6DC] focus:border-transparent rounded-lg bg-[#FAF6F3]"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative rounded-md flex-shrink-0">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="w-full flex items-center justify-between sm:justify-start space-x-2 px-4 py-2 border border-[#8A8A8A] text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer whitespace-nowrap rounded-md bg-[#FAF6F3] sm:bg-transparent"
          >
            <div className="flex items-center space-x-2">
              <i className="ri-filter-line w-4 h-4 flex items-center justify-center text-[#374151]"></i>
              <span className='text-sm sm:text-base font-roboto'>{currentFilter?.label || 'All Messages'}</span>
            </div>
            <div className="flex items-center space-x-2">
              {currentFilter && currentFilter.count !== null && currentFilter.count > 0 && (
                <span className="bg-[#F3D6DC] text-[#374151] text-xs px-2 py-0.5 rounded-full">
                  {currentFilter.count}
                </span>
              )}
              <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
            </div>
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white shadow-lg border border-gray-200 z-50 rounded-md">
              <div className="py-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilterChange(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between cursor-pointer whitespace-nowrap ${filter === option.value ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700'
                      }`}
                  >
                    <span>{option.label}</span>
                    {option.count !== null && option.count > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {option.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showFilterDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFilterDropdown(false)}
        ></div>
      )}
    </div>
  );
}