'use client';

import { useState } from 'react';

interface WaitlistHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExport: () => void;
}

export default function WaitlistHeader({ searchQuery, onSearchChange, onExport }: WaitlistHeaderProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearch = () => {
    onSearchChange(localSearch.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-gray-50 shadow-sm border border-gray-200 p-6 font-roboto rounded-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3D1126] font-canela">Waitlist & Invites</h1>
          <p className="text-gray-600 mt-1 font-roboto">Manage beta waitlist and invitation system</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:border-transparent text-sm w-80 font-roboto rounded-l-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#1A1A1A] text-white px-4 py-2 text-sm font-medium hover:bg-black transition-colors rounded-r-lg border border-[#3D1126]"
            >
              Search
            </button>
          </div>

          {/* <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 border  text-sm font-medium transition-colors whitespace-nowrap font-poppins ${
              showAdvancedFilters 
                ? 'bg-gray-100 border-gray-300 text-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <i className="ri-filter-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
            Filters
          </button> */}

          <button
            onClick={onExport}
            className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-black transition-colors text-sm font-medium whitespace-nowrap font-roboto rounded-lg shadow-sm"
          >
            <i className="ri-download-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
            Export CSV
          </button>
        </div>
      </div>

      {/* {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Date Range</label>
              <select className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm pr-8 font-playfair">
                <option value="">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="quarter">This quarter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Invite Batch</label>
              <select className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm pr-8 font-playfair">
                <option value="">All batches</option>
                <option value="october-2025">October 2025</option>
                <option value="september-2025">September 2025</option>
                <option value="august-2025">August 2025</option>
              </select>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
