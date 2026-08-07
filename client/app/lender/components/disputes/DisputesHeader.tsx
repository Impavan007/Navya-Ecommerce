'use client';

import { useState } from 'react';

interface DisputesHeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  getTabCount: (status: string) => number;
  onExport: () => void;
}

export default function DisputesHeader({
  selectedTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  getTabCount,
  onExport
}: DisputesHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);

  const tabs = [
    { id: 'all', label: 'All', count: getTabCount('all') },
    { id: 'open', label: 'Open', count: getTabCount('open') },
    { id: 'in-review', label: 'In Review', count: getTabCount('in-review') },
    { id: 'resolved', label: 'Resolved', count: getTabCount('resolved') }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-review', label: 'In Review' },
    { value: 'resolved', label: 'Resolved' }
  ];

  return (
    <div className="bg-white  shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-canela font-semibold text-[#3D1126]">Disputes</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and resolve rental disputes</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
              <input
                type="text"
                placeholder="Search disputes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300  text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent whitespace-nowrap cursor-pointer"
            >
              <i className="ri-filter-line mr-2 w-4 h-4 flex items-center justify-center"></i>
              Filters
            </button>

            {/* Export */}
            <button
              onClick={onExport}
              className="inline-flex items-center px-4 py-2 bg-black text-white  text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-download-line mr-2 w-4 h-4 flex items-center justify-center"></i>
              Export
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-8 bg-[#F3D6DC] text-black"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select className="block w-full px-3 py-2 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-8 bg-[#F3D6DC] text-black">
                  <option>All Time</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select className="block w-full px-3 py-2 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-8 bg-[#F3D6DC] text-black">
                  <option>All Reasons</option>
                  <option>Late Return</option>
                  <option>Damaged Item</option>
                  <option>Non-Payment</option>
                  <option>Item Not as Described</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    onStatusFilterChange('all');
                    setShowFilters(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300  hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${selectedTab === tab.id
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${selectedTab === tab.id
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}