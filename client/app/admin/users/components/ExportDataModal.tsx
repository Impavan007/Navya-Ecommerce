'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface ExportDataModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExportDataModal({ user, isOpen, onClose, onConfirm }: ExportDataModalProps) {
  const [exportType, setExportType] = useState('complete');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      onConfirm();
    }, 2000);
  };

  const exportOptions = [
    {
      id: 'complete',
      title: 'Complete Data Export',
      description: 'All user data including profile, bookings, messages, and activity logs',
      size: '~2-5 MB'
    },
    {
      id: 'profile',
      title: 'Profile Data Only',
      description: 'Basic profile information, preferences, and account settings',
      size: '~50-100 KB'
    },
    {
      id: 'activity',
      title: 'Activity Data Only',
      description: 'Bookings, listings, reviews, and transaction history',
      size: '~500 KB - 2 MB'
    }
  ];

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Export User Data" size="md">
      <div className="space-y-6 flex-1 pr-2">
        {/* User Info */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200">
          <img
            src={`https://readdy.ai/api/search-image?query=professional%20portrait&width=40&height=40&seq=${user?.id}`}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div>
            <h3 className="font-medium text-gray-900 font-playfair">{user?.name}</h3>
            <p className="text-sm text-gray-600 font-playfair">{user?.email}</p>
          </div>
        </div>

        {/* GDPR Notice */}
        <div className="p-4 bg-gray-50 border border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 flex items-center justify-center mt-0.5">
              <i className="ri-information-line text-gray-600"></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 font-poppins">GDPR Compliance</h4>
              <p className="text-sm text-gray-700 mt-1 font-playfair">
                This export will include all personal data we hold about this user as required by GDPR Article 20.
              </p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 font-poppins">Export Type</label>
          <div className="space-y-3">
            {exportOptions.map((option) => (
              <label key={option.id} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  value={option.id}
                  checked={exportType === option.id}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mt-1 w-4 h-4 text-gray-700 border-gray-300 focus:ring-gray-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 font-playfair">{option.title}</h4>
                    <span className="text-xs text-gray-500 font-playfair">{option.size}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 font-playfair">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500"
            />
            <div>
              <span className="font-medium text-gray-900 font-playfair">Include deleted data</span>
              <p className="text-sm text-gray-600 font-playfair">Include data that has been soft-deleted but not purged</p>
            </div>
          </label>
        </div>

        {/* Export Info */}
        <div className="p-4 bg-gray-50 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2 font-poppins">Export Details</h4>
          <ul className="text-sm text-gray-600 space-y-1 font-playfair">
            <li>• Data will be exported in JSON format</li>
            <li>• Export will be available for download for 7 days</li>
            <li>• You will receive an email when the export is ready</li>
            <li>• All timestamps are in UTC</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          disabled={isExporting}
          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap disabled:opacity-50 font-poppins"
        >
          Cancel
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-gray-800 text-white font-medium hover:bg-gray-900 transition-colors whitespace-nowrap disabled:opacity-50 font-poppins"
        >
          {isExporting ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span>Exporting...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-download-line"></i>
              </div>
              <span>Export Data</span>
            </div>
          )}
        </button>
      </div>
    </CommonModal>
  );
}