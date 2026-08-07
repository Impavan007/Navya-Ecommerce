'use client';

import { useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import ListingCard from './ListingCard';
import EmptyState from './EmptyState';
import AvailabilityCalendar from './AvailabilityCalendar';
import { useListingsStore } from '../../stores/Listing/FetchProducts';
import { useBulkListingActionsStore } from '../../stores/Listing/bulkListingActionsStore';
import CommonLoader from '@/app/components/common/CommonLoader';

interface ListingsGridProps {
  statusFilter: string;
}

export default function ListingsGrid({ statusFilter }: ListingsGridProps) {
  const { listings, fetchListings, loading } = useListingsStore();
  const {
    selectedIds,
    toggleSelection,
    clearSelection,
    calendarDates,
    calendarOpen,
    openCalendar,
    closeCalendar,
    toggleCalendarDate,
    actionLoading,
    performBulkAction,
    handleApplyBlockedDates,
  } = useBulkListingActionsStore();

  // Success and error handlers

  // Convert persisted map to array
  const listingsArray = useMemo(() => Object.values(listings), [listings]);

  // ✅ Filter on frontend (just for safety)
  const filteredListings = useMemo(
    () =>
      listingsArray.filter(
        (listing) => statusFilter === 'all' || listing.status === statusFilter
      ),
    [listingsArray, statusFilter]
  );

  // Success and error handlers
  const handleSuccess = (message: string = 'Bulk action completed successfully.') => {
    toast.success(message);
    fetchListings({ status: statusFilter }); // Refresh listings
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  // Bulk action handlers
  const handleDelete = () => {
    performBulkAction('delete', {},
      () => handleSuccess('Listings deleted successfully.'),
      handleError
    );
  };

  const handleSetStatus = (status: 'Active' | 'Inactive') => {
    performBulkAction('updateStatus', { status },
      () => handleSuccess(`Listings set to ${status} successfully.`),
      handleError
    );
  };

  const handleClearBlockedDates = () => {
    performBulkAction('clearBlockedDates', {},
      () => handleSuccess('Blocked dates cleared successfully.'),
      handleError
    );
  };

  const handleBlockDates = () => {
    handleApplyBlockedDates(
      () => handleSuccess('Dates blocked successfully.'),
      handleError
    );
  };

  return (
    <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
      {loading && listingsArray.length === 0 && (
        <CommonLoader pageCenter />
      )}

      {listingsArray.length === 0 && !loading && <EmptyState />}

      {listingsArray.length > 0 && (
        <>

          {selectedIds.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 bg-white/50 p-3 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-700 font-poppins font-medium">
                {selectedIds.length} item{selectedIds.length === 1 ? '' : 's'} selected
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={!selectedIds.length || actionLoading}
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={!selectedIds.length || actionLoading}
                  onClick={() => handleSetStatus('Active')}
                >
                  Set Active
                </button>
                <button
                  className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={!selectedIds.length || actionLoading}
                  onClick={() => handleSetStatus('Inactive')}
                >
                  Set Inactive
                </button>
                <button
                  className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={!selectedIds.length || actionLoading}
                  onClick={handleClearBlockedDates}
                >
                  Clear Dates
                </button>
                <button
                  className="flex-1 sm:flex-none px-3 py-2 bg-gray-800 text-white text-xs sm:text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
                  disabled={!selectedIds.length || actionLoading}
                  onClick={openCalendar}
                >
                  Block Dates
                </button>
                <button
                  className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={!selectedIds.length}
                  onClick={clearSelection}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
            {filteredListings.map((listing, index) => (
              <ListingCard
                key={listing.id || index}
                listing={listing}
                isSelected={selectedIds.includes(listing.id)}
                onSelect={(id, selected) => {
                  toggleSelection(id, selected);
                }}
              />
            ))}
          </div>

          {calendarOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white  w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto relative p-4">
                <button
                  onClick={closeCalendar}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                >
                  <i className="ri-close-line"></i>
                </button>

                <h2 className="text-lg font-semibold mb-4 font-poppins">
                  Manage Availability
                </h2>
                <p className="mb-2 text-sm text-gray-600 font-playfair">
                  Selected Items: {selectedIds.join(', ')}
                </p>

                <AvailabilityCalendar
                  blockedDates={calendarDates}
                  bookedDates={[]}
                  onDateToggle={toggleCalendarDate}
                />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleBlockDates}
                    className="bg-gray-800 text-white px-4 py-2  hover:bg-gray-900 transition-colors font-medium font-poppins disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    Apply Dates
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}