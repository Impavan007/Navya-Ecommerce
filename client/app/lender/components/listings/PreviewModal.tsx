'use client';

import { useState, useEffect } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { useListingsStore } from "../../stores/Listing/FetchProducts";
import { useBulkListingActionsStore } from "../../stores/Listing/bulkListingActionsStore";
import { toast } from "react-hot-toast";
import CommonLoader from "@/app/components/common/CommonLoader";
import CommonModal from "@/app/components/common/CommonModal";

interface PreviewModalProps {
  listing: any; // backend response
  onClose: () => void;
}

export default function PreviewModal({ listing, onClose }: PreviewModalProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [displayStatus, setDisplayStatus] = useState(listing.status || "Inactive");

  const updateListingStatus = useListingsStore((state) => state.updateListingStatus);
  const {
    performBulkAction,
    actionLoading,
    setSelection,
    clearSelection
  } = useBulkListingActionsStore();

  // Map backend blocked_dates to string array
  useEffect(() => {
    if (listing.blocked_dates) {
      const dates = listing.blocked_dates.flatMap((d: any) => {
        // Convert start_date and end_date to YYYY-MM-DD
        const start = new Date(d.start_date);
        const end = new Date(d.end_date);
        const arr: string[] = [];
        for (let dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
          arr.push(new Date(dt).toISOString().split('T')[0]);
        }
        return arr;
      });
      setBlockedDates(dates);
    }
  }, [listing.blocked_dates]);

  const handleDateToggle = (date: string) => {
    setBlockedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  // Map backend properties
  const displayTitle = listing.name || listing.title;
  const displayPrice = listing.rentalPrice ?? listing.price ?? 0;
  const displayImage = listing.cover_image || listing.images?.[0] || '';
  const displaySize = Array.isArray(listing.size) ? listing.size.join(', ') : listing.size;
  const displayCategory = listing.category?.name || listing.category || 'Unknown';
  const displayBrand = listing.brand || '';
  const listingId = listing.id || listing._id;

  useEffect(() => {
    setDisplayStatus(listing.status || "Inactive");
  }, [listing.status]);

  const handleStatusToggle = async () => {
    if (!listingId) {
      toast.error("Listing ID not found.");
      return;
    }
    const nextStatus = (displayStatus || "").toLowerCase() === "active" ? "Inactive" : "Active";
    try {
      setStatusUpdating(true);
      await updateListingStatus(listingId, nextStatus);
      setDisplayStatus(nextStatus);
      toast.success(`Listing marked as ${nextStatus}.`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // ✅ Open calendar and select the current listing
  const handleOpenCalendar = () => {
    if (listingId) {
      // Select only this listing for calendar operations
      setSelection([listingId]);
      setShowCalendar(true);
    } else {
      toast.error("Listing ID not found.");
    }
  };

  // ✅ Handle calendar date submission for single product
  const handleCalendarSubmit = async () => {
    if (!listingId) {
      toast.error('No listing selected.');
      return;
    }

    try {
      setCalendarLoading(true);

      const formatDateForPayload = (date: string) => {
        const [year, month, day] = date.split('-');
        if (!year || !month || !day) return date;
        return `${day}-${month}-${year}`;
      };

      const blockedDatesPayload = blockedDates.map((date) => {
        const formatted = formatDateForPayload(date);
        return { start: formatted, end: formatted };
      });

      await performBulkAction(
        'addBlockDates',
        { blockedDates: blockedDatesPayload },
        () => {
          toast.success('Dates blocked successfully.');
          setShowCalendar(false);
        },
        (error: string) => {
          toast.error(error);
        }
      );

    } catch (error: any) {
      console.error('Calendar update failed', error);
      toast.error(error?.response?.data?.message || 'Failed to update calendar.');
    } finally {
      setCalendarLoading(false);
    }
  };

  // ✅ Close calendar and clear selection
  const handleCloseCalendar = () => {
    setShowCalendar(false);
    // Clear selection when closing calendar
    clearSelection();
  };

  return (
    <>
      <CommonModal
        isOpen={true}
        onClose={onClose}
        title="Listing Preview"
        size="lg"
        loading={statusUpdating}
      >
        <div className="space-y-4 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Image */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img
                  src={listing.cover_image || listing.images?.[0] || 'https://via.placeholder.com/300x400'}
                  alt={displayTitle}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {(listing.images || []).map((img: string, index: number) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={img}
                      alt={`${displayTitle} view ${index + 1}`}
                      className="w-full h-full object-cover object-top opacity-60"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-poppins font-bold text-gray-900 mb-2">{displayTitle}</h1>
                <p className="text-lg text-gray-600 font-playfair">{displayBrand}</p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 sm:p-5">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900">Rs.{displayPrice}</span>
                  <span className="text-gray-500 font-playfair font-medium">/day</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-playfair italic">Free delivery & pickup included</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1 font-poppins">Category</h3>
                  <p className="text-gray-900 font-playfair">{displayCategory}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1 font-poppins">Size</h3>
                  <p className="text-gray-900 font-playfair">{displaySize}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-poppins font-bold text-gray-900">Description</h3>
                <p className="text-gray-600 leading-relaxed font-playfair text-sm sm:text-base">
                  This stunning {displayTitle.toLowerCase()} from {displayBrand} is perfect for special occasions.
                  Made from premium materials with exquisite attention to detail, available in size {displaySize}.
                </p>
              </div>

              {/* Status Toggle */}
              {(displayStatus === 'rejected' || displayStatus === 'pending') && (
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${(displayStatus || "").toLowerCase() === "active"
                      ? "bg-[#F3D6DC] text-green-700"
                      : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {displayStatus || "Inactive"}
                  </span>
                  <button
                    onClick={handleStatusToggle}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg font-poppins text-sm disabled:opacity-50"
                    disabled={statusUpdating}
                  >
                    {statusUpdating
                      ? "Updating..."
                      : (displayStatus || "").toLowerCase() === "active"
                        ? "Set Inactive"
                        : "Set Active"}
                  </button>
                </div>
              )}

              {/* Calendar Button */}
              <div>
                <button
                  onClick={handleOpenCalendar}
                  className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors rounded-lg font-poppins"
                >
                  Manage Availability Dates
                </button>
              </div>
            </div>
            {/* Calendar Modal */}
            <CommonModal
              isOpen={showCalendar}
              onClose={handleCloseCalendar}
              title="Product Availability Calendar"
              size="lg"
              loading={calendarLoading}
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-600 font-playfair">Managing dates for: {displayTitle}</p>

                <AvailabilityCalendar
                  blockedDates={blockedDates}
                  bookedDates={listing.bookedDates || []}
                  onDateToggle={handleDateToggle}
                />

                <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleCloseCalendar}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded transition-colors"
                    disabled={calendarLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCalendarSubmit}
                    disabled={calendarLoading || actionLoading}
                    className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 text-sm"
                  >
                    {calendarLoading ? 'Updating...' : 'Submit Dates'}
                  </button>
                </div>
              </div>
            </CommonModal>
          </div>
        </div>

        {/* Footer info can be placed inside the main modal content if needed, 
            but standard CommonModal doesn't have a footer slot. 
            We can add a bottom section here. */}
        {/* <div className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
          <div className="text-xs sm:text-sm text-gray-400 font-playfair italic text-center sm:text-left">
            This is how your listing appears to renters
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 bg-gray-900 text-white hover:bg-black transition-all rounded-lg font-poppins text-sm font-medium shadow-lg hover:shadow-xl active:scale-95"
          >
            Close Preview
          </button>
        </div> */}
      </CommonModal>
    </>
  );
}

