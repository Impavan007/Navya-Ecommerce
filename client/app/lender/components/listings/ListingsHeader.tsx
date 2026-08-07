'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';
import CommonModal from '@/app/components/common/CommonModal';
import { useListingsStore } from '../../stores/Listing/FetchProducts';
import toast from 'react-hot-toast';

export default function ListingsHeader() {
  const [showExportModal, setShowExportModal] = useState(false);
  const { lenderStatus, setLenderStatus } = useListingsStore();
  const isAvailable = lenderStatus === 'Available';

  const [exportLimit, setExportLimit] = useState<number>(100);
  const [exportLoading, setExportLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const handleToggleAvailability = async () => {
    setToggleLoading(true);
    const action = isAvailable ? 'Unavailable' : 'Available';

    try {
      const res = await axiosClient.post(API_ENDPOINTS.Availability, { action });
      setLenderStatus(action);
      if (res?.data?.success) {
        toast.success(res?.data?.message || 'Availability updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update availability');
    } finally {
      setToggleLoading(false);
    }
  };

  const onExport = async () => {
    setExportLoading(true);
    try {
      const res = await axiosClient.get(API_ENDPOINTS.Products, { params: { limit: exportLimit } });
      const payload = res?.data?.data ?? res?.data ?? {};
      const rows = payload?.products || [];

      if (!rows || rows.length === 0) {
        setShowExportModal(false);
        setExportLoading(false);
        return;
      }

      // collect all keys from products (flatten nested objects by JSON.stringify)
      const headersSet = new Set<string>();
      rows.forEach((r: any) => Object.keys(r || {}).forEach((k) => headersSet.add(k)));
      const headers = Array.from(headersSet);

      const csvLines: string[] = [];
      csvLines.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));
      rows.forEach((r: any) => {
        const line = headers
          .map((h) => {
            const v = r?.[h];
            if (v === null || v === undefined) return '""';
            if (typeof v === 'object') return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(',');
        csvLines.push(line);
      });

      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `listings_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (err) {
      console.error('Listings export failed', err);
      setShowExportModal(false);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
      {/* heading and cta button*/}
      <div>
        <h1 className="text-2xl font-canela font-bold text-[#3D1126] font-weight-700">My Listings</h1>
        <p className="text-sm sm:text-base text-[#4B5563] mt-1 sm:mt-2 font-roboto font-weight-400">Manage your textile inventory</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[#3D1126] font-medium font-poppins text-[13px] sm:text-[14px] whitespace-nowrap">Manage availability :</span>
          <button
            onClick={handleToggleAvailability}
            disabled={toggleLoading}
            className="flex items-center px-2 py-1.5 sm:px-3 sm:py-2 border border-[#3D1126] rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <div className={`w-8 h-4 sm:w-9 sm:h-5 flex items-center rounded-full p-1 transition-colors duration-300 mr-2 ${isAvailable ? 'bg-green-500' : 'bg-[#1A1A1A]'}`}>
              <div className={`bg-white w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full shadow-md transform duration-300 ${isAvailable ? 'translate-x-3.5 sm:translate-x-4' : ''}`}></div>
            </div>
            <span className="text-[12px] sm:text-sm font-medium text-[#3D1126] font-poppins w-20 sm:w-24 text-left">
              {toggleLoading ? 'Updating...' : (isAvailable ? 'Available' : 'Unavailable')}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-transparent text-[#3D1126] px-3 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-sm font-medium border border-[#3D1126] rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap font-poppins font-weight-500 flex items-center gap-2"
          >
            <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.65833 5H8.33333V0.833333C8.33333 0.375 7.95833 0 7.5 0H4.16667C3.70833 0 3.33333 0.375 3.33333 0.833333V5H2.00833C1.26667 5 0.891667 5.9 1.41667 6.425L5.24167 10.25C5.56667 10.575 6.09167 10.575 6.41667 10.25L10.2417 6.425C10.7667 5.9 10.4 5 9.65833 5ZM0 13.3333C0 13.7917 0.375 14.1667 0.833333 14.1667H10.8333C11.2917 14.1667 11.6667 13.7917 11.6667 13.3333C11.6667 12.875 11.2917 12.5 10.8333 12.5H0.833333C0.375 12.5 0 12.875 0 13.3333Z" fill="#323232" />
            </svg>
            Export
          </button>

          <Link
            href="/lender/listings/new"
            className="bg-[#1A1A1A] text-[#ffffff] px-4 py-1.5 sm:px-6 sm:py-2 text-[12px] sm:text-sm font-medium hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap shadow-sm font-poppins rounded-lg flex items-center gap-2"
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.33333 4.16667C7.875 4.16667 7.5 4.54167 7.5 5V7.5H5C4.54167 7.5 4.16667 7.875 4.16667 8.33333C4.16667 8.79167 4.54167 9.16667 5 9.16667H7.5V11.6667C7.5 12.125 7.875 12.5 8.33333 12.5C8.79167 12.5 9.16667 12.125 9.16667 11.6667V9.16667H11.6667C12.125 9.16667 12.5 8.79167 12.5 8.33333C12.5 7.875 12.125 7.5 11.6667 7.5H9.16667V5C9.16667 4.54167 8.79167 4.16667 8.33333 4.16667ZM8.33333 0C3.73333 0 0 3.73333 0 8.33333C0 12.9333 3.73333 16.6667 8.33333 16.6667C12.9333 16.6667 16.6667 12.9333 16.6667 8.33333C16.6667 3.73333 12.9333 0 8.33333 0ZM8.33333 15C4.65833 15 1.66667 12.0083 1.66667 8.33333C1.66667 4.65833 4.65833 1.66667 8.33333 1.66667C12.0083 1.66667 15 4.65833 15 8.33333C15 12.0083 12.0083 15 8.33333 15Z" fill="#F1F1F1" />
            </svg>
            Add New Listing
          </Link>
        </div>
      </div>

      <CommonModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Listings (CSV)"
        size="sm"
        loading={exportLoading}
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 font-playfair">
            Enter the maximum number of listings to include in the export.
          </p>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <input
              type="number"
              min={1}
              value={exportLimit}
              onChange={(e) => setExportLimit(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800 focus:border-transparent font-poppins text-sm"
            />
            <span className="text-sm text-gray-500 font-poppins">rows</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-poppins text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onExport}
              disabled={exportLoading}
              className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors disabled:opacity-50 font-poppins text-sm font-medium"
            >
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
}
