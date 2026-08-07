'use client';

import { useState, useEffect } from 'react';
import { useListingsStore } from '../../stores/Listing/FetchProducts';

interface ListingsFiltersProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function ListingsFilters({
  viewMode,
  setViewMode,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
}: ListingsFiltersProps) {
  const { statusSummary } = useListingsStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Sync local state if parent searchTerm changes (e.g. cleared)
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearch = () => {
    setSearchTerm(localSearchTerm);
  };

  // 3-second debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        handleSearch();
      }
    }, 3000);

    return () => clearTimeout(handler);
  }, [localSearchTerm]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Inactive', label: 'Unavailable' },
    { value: 'Draft', label: 'Drafted' },
  ];



  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="bg-[#F3D6DC] border border-[#F3D6DC] p-3 sm:p-4 w-full">

      {/* MOBILE FILTER BUTTON */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full bg-[#1A1A1A] text-white py-2 rounded-md font-medium font-poppins text-sm"
        >
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* FILTER CONTENT */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          {/* Status Filters */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-xs sm:text-sm font-medium text-[#374151] font-poppins">
              Filter by:
            </label>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-medium transition-colors font-poppins whitespace-nowrap ${statusFilter === option.value
                    ? 'bg-[#1A1A1A] text-white border border-[#3D1126]'
                    : 'bg-[#F3D6DC] text-[#4B5563] hover:bg-[#E8C4CB]'
                    }`}
                >
                  {option.label}
                  <span className="ml-1 opacity-80 text-[10px] sm:text-xs">
                    ({statusSummary[option.value.toLowerCase()] ?? statusSummary[option.value] ?? 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort & View */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-[#374151] font-poppins">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-[#F3D6DC] border border-[#F3D6DC] text-[12px] sm:text-sm font-medium text-[#111827] rounded-md py-1 sm:py-1.5 pr-8 font-poppins hover:bg-[#E8C4CB] outline-none"
              >
                <option value="recent">Recently Added</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-[#374151] font-poppins">
                View:
              </span>
              <div className="bg-[#F3D6DC] p-1 flex rounded-md border border-[#F3D6DC]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-[11px] sm:text-sm font-medium font-poppins transition-all ${viewMode === 'grid'
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-[#4B5563]'
                    }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-[11px] sm:text-sm font-medium font-poppins transition-all ${viewMode === 'table'
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-[#4B5563]'
                    }`}
                >
                  Table
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Search */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E8C4CB]">
            <div className="relative w-full lg:max-w-md">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="Search listings..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-l-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm font-poppins outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#1A1A1A] text-white px-4 py-2 sm:py-2.5 rounded-r-md text-sm font-medium font-poppins hover:bg-gray-900 transition-colors"
            >
              Search
            </button>
          </div>

      </div>
    </div>
  );
}