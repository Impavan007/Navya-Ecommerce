'use client';

import { useState } from 'react';

interface ReportsHeaderProps {
  onExport: () => void;
  onSaveReport: () => void;
  showChartView: boolean;
  onToggleChart: () => void;
}

export default function ReportsHeader({ 
  onExport, 
  onSaveReport, 
  showChartView, 
  onToggleChart 
}: ReportsHeaderProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    // If there was an onSearch prop, we'd call it here. 
    // Since searchQuery is internal state and unused in parent, 
    // we just follow the visual pattern for consistency.
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 className="text-2xl font-bold text-[#3D1126] mb-2 font-canela">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and export platform performance reports</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
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
              placeholder="Search reports..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-200  text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-white rounded-l-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-yellow-600 text-white px-4 py-2 text-sm font-medium hover:bg-yellow-700 transition-colors rounded-r-lg border border-yellow-600"
          >
            Search
          </button>
        </div>

        {/* Chart Toggle */}
        <button
          onClick={onToggleChart}
          className={`px-4 py-2  text-sm font-medium transition-colors whitespace-nowrap ${
            showChartView
              ? 'bg-yellow-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-bar-chart-line"></i>
            </div>
            <span>Charts</span>
          </div>
        </button>

        {/* Save Report */}
        <button
          onClick={onSaveReport}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-200  text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-bookmark-line"></i>
            </div>
            <span>Save Report</span>
          </div>
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="px-4 py-2 bg-yellow-600 text-white  text-sm font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap"
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
  );
}