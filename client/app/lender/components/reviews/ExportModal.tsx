
'use client';

import { useState } from 'react';
import CommonModal from '@/app/components/common/CommonModal';

interface ExportModalProps {
  onClose: () => void;
  type: 'reviews' | 'analytics';
}

export default function ExportModal({ onClose, type }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 
    
    setIsExporting(false);
    onClose();
  };

  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title={`Export ${type === 'reviews' ? 'Reviews' : 'Analytics'}`}
      size="md"
      loading={isExporting}
    >
      <div className="space-y-6">
        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 font-poppins">Export Format</label>
          <div className="space-y-3">
            {[
              { id: 'csv', label: 'CSV', desc: 'Comma-separated values for spreadsheets' },
              { id: 'excel', label: 'Excel', desc: 'Microsoft Excel format' },
              { id: 'pdf', label: 'PDF', desc: 'Formatted report document' }
            ].map((option) => (
              <label key={option.id} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value={option.id}
                  checked={exportFormat === option.id}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="mt-1 text-yellow-600 focus:ring-yellow-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 font-poppins">{option.label}</div>
                  <div className="text-xs text-gray-500 font-playfair">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-8 font-playfair"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 font-poppins">Options</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="text-yellow-600 focus:ring-yellow-500 rounded"
              />
              <span className="text-sm text-gray-900 font-playfair">
                {type === 'reviews' ? 'Include full review text' : 'Include detailed breakdowns'}
              </span>
            </label>
            {type === 'reviews' && (
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="text-yellow-600 focus:ring-yellow-500 rounded" />
                <span className="text-sm text-gray-900 font-playfair">Include borrower contact info</span>
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-poppins text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white hover:bg-yellow-700 transition-colors disabled:opacity-50 font-poppins text-sm font-medium"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}