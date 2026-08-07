'use client';

import { useState } from 'react';

interface ReportBuilderProps {
  category: string;
  onGenerateReport: (filters: any) => void;
  filters: any;
}

export default function ReportBuilder({ category, onGenerateReport, filters }: ReportBuilderProps) {
  const [localFilters, setLocalFilters] = useState(filters || {
    dateRange: '30d',
    status: 'all',
    userRole: 'all',
    amountMin: '',
    amountMax: '',
    customDateFrom: '',
    customDateTo: ''
  });
  const [showCustomDate, setShowCustomDate] = useState(localFilters?.dateRange === 'custom');

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const statusOptions = {
    bookings: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'active', label: 'Active' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    transactions: [
      { value: 'all', label: 'All Statuses' },
      { value: 'success', label: 'Success' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' }
    ],
    disputes: [
      { value: 'all', label: 'All Statuses' },
      { value: 'open', label: 'Open' },
      { value: 'investigating', label: 'Investigating' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'closed', label: 'Closed' }
    ],
    users: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' }
    ],
    payouts: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'completed', label: 'Completed' },
      { value: 'failed', label: 'Failed' }
    ],
    reviews: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'flagged', label: 'Flagged' },
      { value: 'removed', label: 'Removed' }
    ]
  };

  const userRoleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'borrower', label: 'Borrowers' },
    { value: 'lender', label: 'Lenders' },
    { value: 'both', label: 'Both Roles' }
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    if (key === 'dateRange' && value !== 'custom') {
      setShowCustomDate(false);
      newFilters.customDateFrom = '';
      newFilters.customDateTo = '';
    } else if (key === 'dateRange' && value === 'custom') {
      setShowCustomDate(true);
    }
    setLocalFilters(newFilters);
  };

  const handleGenerate = () => {
    onGenerateReport(localFilters);
  };

  const savedReports = [
    { name: 'Monthly Bookings Summary', category: 'bookings' },
    { name: 'Weekly Payout Report', category: 'payouts' },
    { name: 'Dispute Analysis', category: 'disputes' }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
      <h2 className="text-lg font-serif font-semibold text-gray-900 mb-6">Report Builder</h2>

      <div className="space-y-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={localFilters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-white pr-8"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {showCustomDate && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <input
                type="date"
                value={localFilters.customDateFrom}
                onChange={(e) => handleFilterChange('customDateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="date"
                value={localFilters.customDateTo}
                onChange={(e) => handleFilterChange('customDateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-white pr-8"
          >
            {statusOptions[category as keyof typeof statusOptions]?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* User Role Filter */}
        {(category === 'bookings' || category === 'users' || category === 'reviews') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
            <select
              value={localFilters.userRole}
              onChange={(e) => handleFilterChange('userRole', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-white pr-8"
            >
              {userRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount Range */}
        {(category === 'bookings' || category === 'transactions' || category === 'payouts') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range (Rs.)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                className="px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                className="px-3 py-2 border border-gray-200  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full px-4 py-3 bg-yellow-600 text-white  font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-file-chart-line"></i>
            </div>
            <span>Generate Report</span>
          </div>
        </button>

        {/* Saved Reports */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Reports</h3>
          <div className="space-y-2">
            {savedReports.map((report, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50  transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-bookmark-line"></i>
                  </div>
                  <span className="truncate">{report.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}