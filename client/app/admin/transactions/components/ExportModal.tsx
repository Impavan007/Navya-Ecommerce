'use client';

import { useState } from 'react';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';
import CommonModal from '../../../components/common/CommonModal';

interface ExportModalProps {
  searchQuery: string;
  filters: any;
  onClose: () => void;
}

export default function ExportModal({ searchQuery, filters, onClose }: ExportModalProps) {
  const [limit, setLimit] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildParams = () => {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 1;
    const params: Record<string, any> = { limit: safeLimit, page: 1 };

    if (searchQuery?.trim()) params.search = searchQuery.trim();

    const defaultFilters: Record<string, string> = {
      type: 'all', status: 'all', dateRange: 'all', amountRange: 'all',
    };

    Object.keys(filters || {}).forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '' && value !== defaultFilters[key]) {
        params[key] = value;
      }
    });

    return params;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await axiosClient.get(API_ENDPOINTS.Transactions, { params: buildParams() });

      const rows = response.data?.data?.transactions || [];
      if (!rows.length) {
        setError('No transactions found for the current filters.');
        return;
      }

      const headersSet = new Set<string>();
      rows.forEach((row: any) => { Object.keys(row || {}).forEach((key) => headersSet.add(key)); });

      const headers = Array.from(headersSet);
      const csvLines: string[] = [];
      csvLines.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));

      rows.forEach((row: any) => {
        const line = headers.map((header) => {
          const value = row?.[header];
          if (value === null || value === undefined) return '""';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
        csvLines.push(line);
      });

      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error('Failed to export transactions', err);
      setError('Failed to export transactions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Export Transactions" size="sm" loading={isExporting}>
      <p className="text-sm text-gray-600 mb-4 font-playfair">
        Specify how many rows to include. Current filters and search will apply to the export.
      </p>
      <div className="flex items-center gap-3 mb-4">
        <input type="number" min={1} value={limit} onChange={(e) => {
          const parsed = Number(e.target.value);
          setLimit(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
        }} className="w-32 px-3 py-2 border border-gray-300 rounded" />
        <span className="text-sm text-gray-500">rows</span>
      </div>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
        <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50">
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>
    </CommonModal>
  );
}
