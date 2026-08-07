'use client';

import { useState } from 'react';
import CommonModal from '@/app/components/common/CommonModal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (limit: number) => void;
  isLoading?: boolean;
}

export default function ExportModal({ isOpen, onClose, onExport, isLoading = false }: ExportModalProps) {
  const [limit, setLimit] = useState<number>(100);

  const handleExport = () => {
    onExport(limit);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Orders to CSV"
      size="md"
      loading={isLoading}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Number of Records
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm font-playfair disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={50}>50 records</option>
            <option value={100}>100 records</option>
            <option value={250}>250 records</option>
            <option value={500}>500 records</option>
            <option value={1000}>1000 records</option>
            <option value={0}>All records</option>
          </select>
          <p className="text-xs text-gray-500 mt-2 font-playfair">
            {limit === 0 
              ? 'Exporting all available records' 
              : `Exporting up to ${limit} records`
            }
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <i className="ri-information-line text-blue-500 mt-0.5"></i>
            <div>
              <p className="text-sm text-blue-800 font-medium font-poppins">
                Export Information
              </p>
              <p className="text-xs text-blue-700 mt-1 font-playfair">
                The exported CSV will include all currently applied filters and search criteria.
                Large exports may take a few moments to process.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm font-medium font-poppins disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <i className="ri-download-line"></i>
                <span>Download CSV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}