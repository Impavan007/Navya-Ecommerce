'use client';

import { useState } from 'react';
import { StatusCounts } from '../../store/payout/payoutStore';

interface PayoutsHeaderProps {
  filters: any;
  statusCounts: StatusCounts | null;
  onFiltersChange: (filters: any) => void;
  onExport: () => void;
}

export default function PayoutsHeader({ filters, statusCounts, onFiltersChange, onExport }: PayoutsHeaderProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearch = () => {
    onFiltersChange({ ...filters, search: localSearch.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses', count: statusCounts?.allStatuses || 0 },
    { value: 'pending', label: 'Pending', count: statusCounts?.pending || 0 },
    { value: 'approved', label: 'Approved', count: statusCounts?.approved || 0 },
    { value: 'completed', label: 'Completed', count: statusCounts?.completed || 0 },
    { value: 'held', label: 'Held', count: statusCounts?.held || 0 }
  ];

  return (
    <div className="mb-8">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D1126] mb-2 font-canela">Payouts</h1>
          <p className="text-gray-600 font-playfair">Manage lender payouts and payment processing</p>
        </div>

        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          {/* Global Search */}
          <div className="relative flex items-center">
            <div className="relative">
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
                placeholder="Search payouts, lenders, orders..."
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300  text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-white font-playfair rounded-l-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-gray-800 text-white px-4 py-2 text-sm font-medium hover:bg-black transition-colors rounded-r-lg border border-gray-800"
            >
              Search
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 border  text-sm font-medium transition-colors whitespace-nowrap font-poppins ${showAdvancedFilters
              ? 'border-gray-800 text-gray-800 bg-gray-100'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-filter-line"></i>
              </div>
              <span>Filters</span>
            </div>
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="px-4 py-2 bg-gray-800 text-white  text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-download-line"></i>
              </div>
              <span>Export</span>
            </div>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFiltersChange({ ...filters, status: option.value })}
            className={`px-4 py-2  text-sm font-medium transition-colors whitespace-nowrap font-poppins ${filters.status === option.value
              ? 'bg-gray-800 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center space-x-2">
              <span>{option.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold font-poppins ${filters.status === option.value
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-600'
                }`}>
                {option.count}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white  p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="quarter">This quarter</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Amount Range</label>
              <select
                value={
                  filters.amountFrom === '500' && !filters.amountTo ? '500+' :
                  filters.amountFrom && filters.amountTo ? `${filters.amountFrom}-${filters.amountTo}` : 
                  'all'
                }
                onChange={(e) => {
                  const range = e.target.value;
                  let amountFrom = '';
                  let amountTo = '';
                  
                  if (range !== 'all') {
                    if (range === '500+') {
                      amountFrom = '500';
                    } else {
                      const [from, to] = range.split('-');
                      amountFrom = from;
                      amountTo = to;
                    }
                  }
                  
                  onFiltersChange({ 
                    ...filters, 
                    amountFrom, 
                    amountTo 
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="all">All amounts</option>
                <option value="0-100">Rs.0 - Rs.100</option>
                <option value="100-300">Rs.100 - Rs.300</option>
                <option value="300-500">Rs.300 - Rs.500</option>
                <option value="500+">Rs.500+</option>
              </select>
            </div>

            {/* Lender Filter */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Lender</label>
              <input
                type="text"
                value={filters.lender}
                onChange={(e) => onFiltersChange({ ...filters, lender: e.target.value })}
                placeholder="Filter by lender name"
                className="w-full px-3 py-2 border border-gray-300  text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-white font-playfair"
              />
            </div> */}

            {/* Payment Method */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Payment Method</label>
              <select
                value={filters.paymentMethod || 'all'}
                onChange={(e) => onFiltersChange({ ...filters, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300  text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-[#F3D6DC] text-black pr-8 font-playfair"
              >
                <option value="all">All methods</option>
                <option value="bank">Bank Transfer</option>
                <option value="stripe">Stripe Connect</option>
                <option value="paypal">PayPal</option>
              </select>
            </div> */}
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => onFiltersChange({
                status: 'all',
                dateRange: 'all',
                amountFrom: '',
                amountTo: '',
                lender: '',
                search: '',
                paymentMethod: 'all'
              })}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium font-poppins"
            >
              Clear all filters
            </button>
            <div className="text-sm text-gray-600 font-playfair">
              Showing <span className="font-semibold text-gray-900 font-poppins">
                {filters.status === 'all'
                  ? (statusCounts?.allStatuses || 0)
                  : (statusCounts?.[filters.status as keyof StatusCounts] || 0)}
              </span> payouts
            </div>
          </div>
        </div>
      )}
    </div>
  );
}