'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface ExportModalProps {
  category: string;
  data: any;
  onClose: () => void;
}

export default function ExportModal({ category, data, onClose }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportScope, setExportScope] = useState('filtered');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [includeCharts, setIncludeCharts] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formatOptions = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values for spreadsheets' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel format with formatting' },
    { value: 'pdf', label: 'PDF', description: 'Formatted document for sharing' },
    { value: 'json', label: 'JSON', description: 'Raw data format for developers' }
  ];

  const scopeOptions = [
    { value: 'filtered', label: 'Current Results', description: 'Export only the filtered data shown' },
    { value: 'all', label: 'All Data', description: 'Export all records in this category' },
    { value: 'selected', label: 'Selected Rows', description: 'Export only selected table rows' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    onClose();
  };

  const quickExports = [
    { name: 'Last Month Summary', format: 'pdf', scope: 'filtered' },
    { name: 'Raw Data Export', format: 'csv', scope: 'all' },
    { name: 'Executive Report', format: 'excel', scope: 'filtered' }
  ];

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Export Report" size="lg" loading={isExporting}>
      <p className="text-sm text-gray-600 -mt-2 mb-6 capitalize">{category} data export options</p>

      {/* Quick Export Options */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickExports.map((option, index) => (
            <button key={index} onClick={() => { setExportFormat(option.format); setExportScope(option.scope); }} className="p-3 border border-gray-200 text-left hover:border-gray-600 hover:bg-yellow-50 transition-colors">
              <div className="font-medium text-sm text-gray-900">{option.name}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase">{option.format}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Custom Export</h3>

        {/* Export Format */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formatOptions.map((option) => (
              <label key={option.value} className={`p-3 border cursor-pointer transition-colors ${exportFormat === option.value ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="format" value={option.value} checked={exportFormat === option.value} onChange={(e) => setExportFormat(e.target.value)} className="sr-only" />
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${exportFormat === option.value ? 'border-yellow-600 bg-yellow-600' : 'border-gray-300'}`}>
                    {exportFormat === option.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Scope */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Data Scope</label>
          <div className="space-y-2">
            {scopeOptions.map((option) => (
              <label key={option.value} className={`p-3 border cursor-pointer transition-colors flex items-center space-x-3 ${exportScope === option.value ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="scope" value={option.value} checked={exportScope === option.value} onChange={(e) => setExportScope(e.target.value)} className="sr-only" />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${exportScope === option.value ? 'border-yellow-600 bg-yellow-600' : 'border-gray-300'}`}>
                  {exportScope === option.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        {(exportFormat === 'pdf' || exportFormat === 'excel') && (
          <div className="mb-6">
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-600" />
              <span className="text-sm text-gray-700">Include charts and visualizations</span>
            </label>
          </div>
        )}

        {/* Email Recipients */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Recipients (Optional)</label>
          <input type="email" value={emailRecipients} onChange={(e) => setEmailRecipients(e.target.value)} placeholder="admin@navyaa.com, finance@navyaa.com" className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
          <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas. Leave empty to download directly.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">Export will include {exportScope === 'all' ? 'all' : 'filtered'} {category} data</div>
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">Cancel</button>
          <button onClick={handleExport} disabled={isExporting} className="px-6 py-2 bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
            {isExporting ? (
              <div className="flex items-center space-x-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Exporting...</span></div>
            ) : (
              <div className="flex items-center space-x-2"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line"></i></div><span>Export Report</span></div>
            )}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}