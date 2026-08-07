'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface SaveReportModalProps {
  category: string;
  filters: any;
  onClose: () => void;
}

export default function SaveReportModal({ category, filters, onClose }: SaveReportModalProps) {
  const [reportName, setReportName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!reportName.trim()) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    onClose();
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Save Report" size="md" loading={isSaving}>
      <p className="text-sm text-gray-600 -mt-2 mb-6">Save this report configuration for future use</p>

      <div className="space-y-6">
        {/* Report Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Name *</label>
          <input type="text" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="e.g., Monthly Bookings Summary" className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of what this report shows..." rows={3} className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent resize-none" />
        </div>

        {/* Current Filters Summary */}
        <div className="bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Filters</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Category: <span className="font-medium capitalize">{category}</span></div>
            <div>Date Range: <span className="font-medium">{filters?.dateRange || 'N/A'}</span></div>
            <div>Status: <span className="font-medium">{filters?.status || 'N/A'}</span></div>
            {filters?.userRole && filters.userRole !== 'all' && <div>User Role: <span className="font-medium">{filters.userRole}</span></div>}
            {(filters?.amountMin || filters?.amountMax) && (
              <div>Amount Range: <span className="font-medium">{filters.amountMin && `Rs.${filters.amountMin}`}{filters.amountMin && filters.amountMax && ' - '}{filters.amountMax && `Rs.${filters.amountMax}`}</span></div>
            )}
          </div>
        </div>

        {/* Sharing */}
        <label className="flex items-center space-x-3">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-600" />
          <div>
            <span className="text-sm font-medium text-gray-700">Share with team</span>
            <p className="text-xs text-gray-500">Allow other admins to access this saved report</p>
          </div>
        </label>

        {/* Scheduling */}
        <div>
          <label className="flex items-center space-x-3 mb-3">
            <input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-600" />
            <div>
              <span className="text-sm font-medium text-gray-700">Schedule automatic generation</span>
              <p className="text-xs text-gray-500">Automatically generate and email this report</p>
            </div>
          </label>
          {scheduleEnabled && (
            <div className="ml-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select value={scheduleFrequency} onChange={(e) => setScheduleFrequency(e.target.value)} className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-white pr-8">
                {frequencyOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
        <div className="text-sm text-gray-600">Report will be saved to your dashboard</div>
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">Cancel</button>
          <button onClick={handleSave} disabled={!reportName.trim() || isSaving} className="px-6 py-2 bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
            {isSaving ? (
              <div className="flex items-center space-x-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Saving...</span></div>
            ) : (
              <div className="flex items-center space-x-2"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-bookmark-line"></i></div><span>Save Report</span></div>
            )}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}