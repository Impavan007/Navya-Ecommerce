'use client';

import { useState } from 'react';
import { Dispute } from '@/app/lender/disputes/page';
import CommonModal from '@/app/components/common/CommonModal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Dispute[];
  type: string;
}

export default function ExportModal({ isOpen, onClose, data, type }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [includeEvidence, setIncludeEvidence] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create mock download
    const filename = `navyaa-disputes-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    setIsExporting(false);
    onClose();
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values for spreadsheets' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel format with formatting' },
    { value: 'pdf', label: 'PDF', description: 'Formatted report for printing or sharing' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last-30', label: 'Last 30 Days' },
    { value: 'last-90', label: 'Last 90 Days' },
    { value: 'this-year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Disputes"
      size="md"
      loading={isExporting}
    >
      <div className="space-y-6">
        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
          <div className="space-y-3">
            {formatOptions.map((option) => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={exportFormat === option.value}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="mt-1 text-yellow-600 focus:ring-yellow-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-8"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                className="block w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                className="block w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Additional Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Additional Options</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEvidence}
                onChange={(e) => setIncludeEvidence(e.target.checked)}
                className="text-yellow-600 focus:ring-yellow-500 rounded"
              />
              <span className="text-sm text-gray-700">Include evidence summary</span>
            </label>
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Export Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Records to export: <span className="font-medium">{data.length} disputes</span></div>
            <div>Format: <span className="font-medium">{formatOptions.find(f => f.value === exportFormat)?.label}</span></div>
            <div>Date range: <span className="font-medium">{dateRangeOptions.find(d => d.value === dateRange)?.label}</span></div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            {isExporting ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <span>Exporting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
                <span>Export</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}