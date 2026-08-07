'use client';

import { useMemo } from 'react';
import { useListingsStore } from '../../stores/Listing/FetchProducts';
import { useBulkListingActionsStore } from '../../stores/Listing/bulkListingActionsStore';

interface BulkActionsBarProps {
    statusFilter: string;
}

export default function BulkActionsBar({ statusFilter }: BulkActionsBarProps) {
    const { listings } = useListingsStore();
    const {
        selectedIds,
        setSelection,
        clearSelection,
        actionLoading,
        performBulkAction,
        openCalendar,
        handleApplyBlockedDates,
    } = useBulkListingActionsStore();

    // Compute visible listings based on filter (logic shared with Grid/Table)
    const listingsArray = useMemo(() => Object.values(listings), [listings]);
    const filteredListings = useMemo(
        () =>
            listingsArray.filter(
                (listing) => statusFilter === 'all' || listing.status === statusFilter
            ),
        [listingsArray, statusFilter]
    );

    const allFilteredIds = useMemo(
        () => filteredListings.map((listing) => listing.id),
        [filteredListings]
    );

    const allCurrentSelected =
        allFilteredIds.length > 0 &&
        allFilteredIds.every((id) => selectedIds.includes(id));

    const handleSelectAll = () => {
        if (allCurrentSelected) {
            // Deselect current page/filtered items
            const remaining = selectedIds.filter((id) => !allFilteredIds.includes(id));
            setSelection(remaining);
        } else {
            // Select all current page/filtered items
            const merged = Array.from(
                new Set([...selectedIds, ...allFilteredIds])
            );
            setSelection(merged);
        }
    };

    const handleSuccess = (message: string) => {
        // Toast handled by store or we can trigger it here if store doesn't
        // Store doesn't seem to trigger toast generally on performBulkAction? 
        // Actually Grid/Table passed callbacks.
        // We should pass callbacks too if we want toasts, or rely on store if it did (it takes callbacks).
        // For now, mirroring Grid/Table logic roughly
        const { fetchListings } = useListingsStore.getState();
        fetchListings({ status: statusFilter });
    };

    const handleSetStatus = (status: 'Active' | 'Inactive') => {
        performBulkAction('updateStatus', { status }, () => handleSuccess(''), () => { });
    };

    const handleClearBlockedDates = () => {
        performBulkAction('clearBlockedDates', {}, () => handleSuccess(''), () => { });
    };

    if (filteredListings.length === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 w-full">
            {/* Select All Checkbox */}
            <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        id="selectAll"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-400 checked:bg-[#1A1A1A] checked:border-[#1A1A1A] transition-all"
                        checked={allCurrentSelected}
                        onChange={handleSelectAll}
                    />
                    <i className="ri-check-line absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xs"></i>
                </div>
                <label htmlFor="selectAll" className="text-sm font-medium text-[#3D1126] cursor-pointer font-poppins select-none">
                    Select all
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleSetStatus('Active')}
                    disabled={!selectedIds.length || actionLoading}
                    className="px-4 py-2 bg-white border border-[#3D1126] text-[#3D1126] text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
                >
                    Set active
                </button>
                <button
                    onClick={() => handleSetStatus('Inactive')}
                    disabled={!selectedIds.length || actionLoading}
                    className="px-4 py-2 bg-white border border-[#3D1126] text-[#3D1126] text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
                >
                    Inactive
                </button>
                <button
                    onClick={handleClearBlockedDates}
                    disabled={!selectedIds.length || actionLoading}
                    className="px-4 py-2 bg-white border border-[#3D1126] text-[#3D1126] text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
                >
                    Clear Block Dates
                </button>
                <button
                    onClick={openCalendar}
                    disabled={!selectedIds.length || actionLoading}
                    className="px-4 py-2 bg-white border border-[#3D1126] text-[#3D1126] text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
                >
                    Block Dates
                </button>
            </div>
        </div>
    );
}
