'use client';

import { useEffect, useState, useMemo } from "react";
import { useListingsStore } from "../../stores/Listing/FetchProducts";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CommonLoader from "@/app/components/common/CommonLoader";
import AvailabilityCalendar from "./AvailabilityCalendar";
import PreviewModal from "./PreviewModal";
import { useBulkListingActionsStore } from "../../stores/Listing/bulkListingActionsStore";
import useDeleteListingStore from "../../stores/Listing/deleteListingStore";
import ReusableTable, { Column } from "../../../components/common/ReusableTable";
import CommonModal from "../../../components/common/CommonModal";

interface ListingsTableProps {
  statusFilter: string;
}

export default function ListingsTable({ statusFilter }: ListingsTableProps) {
  const { listings, fetchListings, loading, updateListingStatus } = useListingsStore();
  const router = useRouter();
  const [previewListing, setPreviewListing] = useState<any>(null);
  const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({});

  const {
    selectedIds,
    setSelection,
    toggleSelection,
    clearSelection,
    calendarOpen,
    calendarDates,
    openCalendar,
    closeCalendar,
    toggleCalendarDate,
    actionLoading,
    performBulkAction,
    handleApplyBlockedDates,
  } = useBulkListingActionsStore();


  const listingsArray = useMemo(() => Object.values(listings), [listings]);

  const filteredListings = useMemo(
    () =>
      listingsArray.filter((listing) => {
        if (statusFilter === 'all') return true;
        return listing.status.toLowerCase() === statusFilter.toLowerCase();
      }),
    [listingsArray, statusFilter]
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]',
      pending: 'bg-blue-100 text-blue-800 border border-blue-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
      unavailable: 'bg-gray-100 text-gray-800 border border-gray-200',
      drafted: 'bg-gray-100 text-gray-800 border border-gray-200',
    };

    const labels: Record<string, string> = {
      active: 'Active',
      pending: 'Pending',
      rejected: 'Rejected',
      inactive: 'Inactive',
      unavailable: 'Unavailable',
      drafted: 'Drafted',
    };

    const normalizedStatus = status.toLowerCase();
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[normalizedStatus] || 'bg-gray-100 text-gray-800'}`}>
        {labels[normalizedStatus] || status}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase();
    const icons: Record<string, string> = {
      active: 'ri-check-circle-fill text-green-600',
      pending: 'ri-time-fill text-blue-600',
      rejected: 'ri-close-circle-fill text-red-600',
      unavailable: 'ri-pause-circle-fill text-gray-600',
      inactive: 'ri-pause-circle-fill text-gray-600',
    };
    return icons[s] || 'ri-circle-fill text-gray-400';
  };

  const handleStatusToggle = async (listingId: string, currentStatus: string) => {
    const normalizedStatus = (currentStatus || '').toLowerCase();
    const isPendingOrRejected = normalizedStatus === 'pending' || normalizedStatus === 'rejected';
    const isActive = normalizedStatus === 'active';

    if (!listingId || statusUpdating[listingId] || isPendingOrRejected) return;

    const nextStatus = isActive ? 'Inactive' : 'Active';

    try {
      setStatusUpdating(prev => ({ ...prev, [listingId]: true }));
      const response = await updateListingStatus(listingId, nextStatus);
      toast.success(response?.message || `Listing ${nextStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update status.';
      toast.error(message);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [listingId]: false }));
    }
  };

  const allFilteredIds = useMemo(
    () => filteredListings.map((listing) => listing.id),
    [filteredListings]
  );
  const allCurrentSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selectedIds.includes(id));

  const handleSelectAll = () => {
    if (allCurrentSelected) {
      const remaining = selectedIds.filter((id) => !allFilteredIds.includes(id));
      setSelection(remaining);
    } else {
      const merged = Array.from(
        new Set([...selectedIds, ...allFilteredIds])
      );
      setSelection(merged);
    }
  };

  const formatPrice = (listing: any) => {
    const price =
      listing.rentalPrice ??
      listing.price ??
      listing.rental_price_per_day ??
      0;
    return `Rs.${price}`;
  };

  const getCategoryName = (category: any) => {
    if (typeof category === "string") return category;
    return category?.name || "Unknown";
  };

  const handleSuccess = (message: string = 'Bulk action completed successfully.') => {
    toast.success(message);
    fetchListings({ status: statusFilter });
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

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

  const handleSingleListingCalendar = (listingId: string) => {
    toggleSelection(listingId, true);
    openCalendar();
  };

  const columns: Column<any>[] = [
    {
      header: 'Item',
      key: 'title',
      render: (_, listing) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-10 relative">
            <img
              className="h-12 w-10 rounded object-cover object-top"
              src={listing.cover_image || '/placeholder.png'}
              alt={listing.title}
            />
            <div className="absolute -top-1 -left-1">
              <i className={`${getStatusIcon(listing.status)} w-4 h-4 flex items-center justify-center drop-shadow-sm`}></i>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 font-poppins">{listing.name || listing.title}</div>
            <div className="text-sm text-gray-500 font-poppins">{listing.brand}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      key: 'category',
      render: (cat) => <span className="text-sm text-gray-900 font-poppins">{getCategoryName(cat)}</span>
    },
    {
      header: 'Price',
      key: 'price',
      render: (_, listing) => (
        <div className="text-sm font-medium text-gray-900 font-poppins">
          {formatPrice(listing)}
          <span className="text-xs text-gray-500 ml-1">/day</span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (_, listing) => {
        const normalizedStatus = (listing.status || '').toLowerCase();
        const isPendingOrRejected = normalizedStatus === 'pending' || normalizedStatus === 'rejected';
        const isActive = normalizedStatus === 'active';
        const isUpdating = statusUpdating[listing.id];

        return (
          <div className="flex items-center justify-end space-x-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewListing(listing)}
              className="text-gray-600 hover:text-gray-900 p-1"
              title="Preview listing"
            >
              <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
            </button>

            <button
              onClick={() => router.push(`/lender/listings/update/${listing.id}`)}
              disabled={isPendingOrRejected}
              className={`p-1 transition-colors ${isPendingOrRejected ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
              title="Edit listing"
            >
              <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
            </button>

            <button
              className={`p-1 ${isPendingOrRejected ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-600'}`}
              onClick={() => !isPendingOrRejected && handleSingleListingCalendar(listing.id)}
              disabled={isPendingOrRejected}
              title="Manage availability"
            >
              <i className="ri-calendar-line w-4 h-4 flex items-center justify-center"></i>
            </button>

            {['rejected', 'pending'].includes(normalizedStatus) ? (
              <button
                className="text-red-600 hover:text-red-800 transition-colors p-1"
                onClick={() => useDeleteListingStore.getState().open(listing.id, listing.name || listing.title)}
                disabled={isUpdating}
                title="Delete listing"
              >
                <i className="ri-delete-bin-line w-4 h-4"></i>
              </button>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={() => handleStatusToggle(listing.id, listing.status)}
                  disabled={isUpdating || isPendingOrRejected}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${isUpdating || isPendingOrRejected ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isActive ? 'bg-gray-600' : 'bg-gray-300'}`}
                  title={isActive ? 'Deactivate listing' : 'Activate listing'}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'} ${isUpdating ? 'animate-pulse' : ''}`} />
                  {isUpdating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CommonLoader size="sm" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="bg-white border-2 border-[#F3D6DC] overflow-hidden">
      {selectedIds.length > 0 && (
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <span className="text-sm text-gray-700 font-poppins font-medium">
            {selectedIds.length} item{selectedIds.length === 1 ? "" : "s"} selected
          </span>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={!selectedIds.length || actionLoading}
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={!selectedIds.length || actionLoading}
              onClick={() => handleSetStatus('Active')}
            >
              Set Active
            </button>
            <button
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={!selectedIds.length || actionLoading}
              onClick={() => handleSetStatus('Inactive')}
            >
              Set Inactive
            </button>
            <button
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={!selectedIds.length || actionLoading}
              onClick={handleClearBlockedDates}
            >
              Clear Dates
            </button>
            <button
              className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-800 text-white text-xs sm:text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
              disabled={!selectedIds.length || actionLoading}
              onClick={openCalendar}
            >
              Block Dates
            </button>
            <button
              className="w-full sm:w-auto px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={!selectedIds.length}
              onClick={clearSelection}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <ReusableTable
        columns={columns}
        data={filteredListings}
        loading={loading}
        onRowClick={(listing) => setPreviewListing(listing)}
        selectable
        selectedIds={selectedIds}
        onSelectRow={(id) => toggleSelection(id, !selectedIds.includes(id))}
        onSelectAll={handleSelectAll}
        emptyMessage="No listings found."
      />

      {previewListing && (
        <PreviewModal listing={previewListing} onClose={() => setPreviewListing(null)} />
      )}

      <CommonModal
        isOpen={calendarOpen}
        onClose={closeCalendar}
        title="Block Dates"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-poppins">
            Selected Items: {selectedIds.length} listings
          </p>

          <AvailabilityCalendar
            blockedDates={calendarDates}
            bookedDates={[]}
            onDateToggle={toggleCalendarDate}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={closeCalendar}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-poppins"
            >
              Cancel
            </button>
            <button
              onClick={handleBlockDates}
              disabled={actionLoading}
              className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors text-sm font-medium disabled:opacity-50 font-poppins"
            >
              {actionLoading ? 'Applying...' : 'Apply Dates'}
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
}