'use client';

import React, { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface ExportModalProps {
    selectedPayouts: string[];
    filters: any;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ExportModal({
    selectedPayouts,
    filters,
    onClose,
    onConfirm
}: ExportModalProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');

    const handleExport = async () => {
        setIsExporting(true);
        // Simulate API call or data processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        onConfirm();
    };

    return (
        <CommonModal
            isOpen={true}
            onClose={onClose}
            title="Export Payouts"
            size="sm"
            loading={isExporting}
        >
            <div className="space-y-4 font-poppins">
                <p className="text-sm text-gray-600">
                    {selectedPayouts.length > 0
                        ? `Exporting ${selectedPayouts.length} selected payout records.`
                        : "Exporting all payout records matching current filters."}
                </p>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Export Format</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['csv', 'excel'].map((format) => (
                            <button
                                key={format}
                                onClick={() => setExportFormat(format)}
                                className={`p-3 border rounded-xl text-sm font-bold transition-all ${
                                    exportFormat === format
                                        ? 'border-gray-900 bg-gray-900 text-white'
                                        : 'border-gray-200 text-gray-400 hover:border-gray-400'
                                }`}
                            >
                                {format.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    >
                        {isExporting ? "Processing..." : "Download"}
                    </button>
                </div>
            </div>
        </CommonModal>
    );
}
