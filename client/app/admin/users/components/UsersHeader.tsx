"use client";

import { useState } from "react";

interface UsersHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onExportClick?: () => void;
}

export default function UsersHeader({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onExportClick,
}: UsersHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  const handleSearch = () => {
    onSearchChange(localSearch.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 font-roboto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#3D1126] mb-2 font-canela">
            Users Management
          </h1>
          <p className="text-gray-600 font-roboto">
            Manage Buyers and Sellers across the platform
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2  border text-sm font-medium transition-colors whitespace-nowrap font-roboto ${showFilters
              ? "bg-gray-50 border-gray-200 text-[#4B5563]"
              : "bg-white border-gray-200 text-gray-700 hover:bg-[#FAF6F3]"
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
            onClick={() => onExportClick && onExportClick()}
            className="px-4 py-2 bg-[#1A1A1A] text-white  text-sm font-medium hover:bg-black transition-colors whitespace-nowrap font-roboto"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-download-line"></i>
              </div>
              <span>Export CSV</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search Bar */}
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
              placeholder="Search by name, email, or user ID..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-200  text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent bg-white font-roboto rounded-l-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#1A1A1A] text-white px-6 py-3 text-sm font-medium hover:bg-black transition-colors rounded-r-lg border border-[#3D1126]"
          >
            Search
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white  border border-gray-200 p-6 font-roboto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) =>
                  onFiltersChange({ ...filters, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent bg-gray-50 text-black pr-8 font-roboto"
              >
                <option value="">All Roles</option>
                <option value="Renter">Renter</option>
                <option value="Lender">Lender</option>
              </select>
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  onFiltersChange({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent bg-gray-50 text-black pr-8 font-roboto"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending Approval">Pending Approval</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Date Joined
              </label>
              <select
                value={filters.dateJoined}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateJoined: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent bg-gray-50 text-black pr-8 font-roboto"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            {/* lastActive filter removed per requirements */}
          </div>
          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onFiltersChange({ role: "", status: "", dateJoined: "" });
                onSearchChange("");
                setLocalSearch("");
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap font-roboto"
            >
              Clear Filters & Search
            </button>
            {/* <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-[#1A1A1A] text-white  text-sm font-medium hover:bg-black transition-colors whitespace-nowrap font-roboto"
            >
              Apply Filters
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}
