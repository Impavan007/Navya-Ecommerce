'use client';

import { useState, useEffect, MouseEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PreviewModal from './PreviewModal';
import AvailabilityCalendar from './AvailabilityCalendar';
import useDeleteListingStore from '../../stores/Listing/deleteListingStore';
import { useListingsStore } from '../../stores/Listing/FetchProducts';
import { useBulkListingActionsStore } from '../../stores/Listing/bulkListingActionsStore';
import { toast } from 'react-hot-toast';

interface ListingCardProps {
  listing: any; // backend response
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

export default function ListingCard({ listing, isSelected, onSelect }: ListingCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState(listing.status || 'Inactive');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const router = useRouter();
  const updateListingStatus = useListingsStore((state) => state.updateListingStatus);

  const {
    performBulkAction,
    actionLoading
  } = useBulkListingActionsStore();

  const normalizedStatus = (currentStatus || '').toLowerCase();
  const isPendingOrRejected = normalizedStatus === 'pending' || normalizedStatus === 'rejected';
  const isActive = normalizedStatus === 'active';

  // ✅ Map backend blocked_dates to string array
  useEffect(() => {
    if (listing.blocked_dates) {
      const dates = listing.blocked_dates.map((d: any) =>
        new Date(d.start_date).toISOString().split('T')[0]
      );
      setBlockedDates(dates);
    }
  }, [listing.blocked_dates]);

  useEffect(() => {
    setCurrentStatus(listing.status || 'Inactive');
  }, [listing.status]);

  // ✅ Toggle blocked date
  const handleDateToggle = (date: string) => {
    setBlockedDates(prev => {
      if (prev.includes(date)) return prev.filter(d => d !== date);
      else return [...prev, date];
    });
  };

  // ✅ Status badges
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    const badges: Record<string, string> = {
      active: 'bg-[#F3D6DC] text-green-800 border border-green-200',
      pending: 'bg-blue-100 text-blue-800 border border-blue-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      unavailable: 'bg-gray-100 text-gray-800 border border-gray-200',
      drafted: 'bg-gray-100 text-gray-800 border border-gray-200',
      inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    const labels: Record<string, string> = {
      active: 'Active',
      pending: 'Pending',
      rejected: 'Rejected',
      unavailable: 'Unavailable',
      drafted: 'Drafted',
      inactive: 'Inactive',
    };
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${badges[s] || 'bg-gray-100 text-gray-700'}`}
      >
        {labels[s] || status}
      </span>
    );
  };

  // ✅ Status icons
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

  // ✅ Extract display data
  const displayTitle = listing.name || listing.title;
  const displayPrice = listing.rentalPrice ?? listing.price ?? 0;
  const displayImage = listing.cover_image || listing.images?.[0] || '/no-image.png';
  const displaySize = Array.isArray(listing.size) ? listing.size.join(', ') : listing.size;
  const displayCategory = listing.category?.name || listing.category || 'Unknown';
  const displayBrand = listing.brand || '';

  // ✅ Toggle status function
  const handleStatusToggle = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!listing.id || statusUpdating || isPendingOrRejected) return;

    const nextStatus = isActive ? 'Inactive' : 'Active';

    try {
      setStatusUpdating(true);
      const response = await updateListingStatus(listing.id, nextStatus);
      setCurrentStatus(nextStatus);
      toast.success(response?.message || `Listing ${nextStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update status.';
      toast.error(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  // ✅ Handle calendar date submission for single product
  const handleCalendarSubmit = async () => {
    if (!listing.id) {
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

  // ✅ Open calendar for single product
  const handleOpenCalendar = () => {
    if (isPendingOrRejected) return;

    // Select only this listing for calendar operations
    onSelect(listing.id, true);
    setShowCalendar(true);
  };

  // ✅ Close calendar and clear selection
  const handleCloseCalendar = () => {
    setShowCalendar(false);
    // Optionally clear selection when closing single product calendar
    onSelect(listing.id, false);
  };

  return (
    <>
      {/* ✅ Responsive Card */}
      <div
        className={`bg-[#F3D6DC] border border-[#F3D6DC] transition-all duration-200 hover:shadow-md group cursor-pointer 
        ${isSelected ? 'border-gray-400 ring-2 ring-gray-100' : 'border-gray-200 hover:border-gray-300'}
        w-full sm:max-w-sm md:max-w-md`}
        onClick={() => setShowPreview(true)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />

          {/* Status Icon */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <i className={`${getStatusIcon(currentStatus)} w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center drop-shadow-sm`}></i>
          </div>

          {/* Checkbox */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(listing.id, e.target.checked)}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-800 bg-white/80 backdrop-blur-sm relative z-20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Quick Actions */}
          {/* {showActions && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
              <div className="flex space-x-2 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(true);
                  }}
                  className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-white transition-colors"
                >
                  <i className="ri-eye-line mr-1"></i> Preview
                </button>

                <button
                  disabled={isPendingOrRejected}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/lender/listings/update/${listing.id}`);
                  }}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${isPendingOrRejected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                >
                  <i className="ri-edit-line mr-1"></i> Edit
                </button>
              </div>
            </div>
          )} */}
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4">
          <div className="flex items-start justify-between mb-1 sm:mb-2 gap-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate leading-tight">{displayTitle}</h3>
              <p className="text-[10px] sm:text-sm text-gray-600 truncate">{displayBrand}</p>
            </div>
            {getStatusBadge(currentStatus)}
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-sm text-gray-600 mb-2 sm:mb-3">
            <span>{displayCategory}</span>
            <span>Size {displaySize}</span>
          </div>

          <div className="mb-2 sm:mb-4">
            <span className="text-base sm:text-2xl font-bold text-gray-900">Rs.{displayPrice}</span>
            <span className="text-[10px] sm:text-sm text-gray-600 ml-0.5 sm:ml-1">/day</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between space-x-2 relative">
            <div className="flex space-x-2 flex-1">
              <button
                disabled={isPendingOrRejected}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/lender/listings/update/${listing.id}`);
                }}
                className={`flex-1 px-2 p-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-sm font-medium transition-colors text-center border box-border ${isPendingOrRejected
                  ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                  : 'bg-black text-white border-black hover:bg-gray-800'
                  }`}
              >
                <span className="hidden sm:inline"><i className="ri-edit-line mr-2"></i> Edit</span>
                <span className="sm:hidden">Edit</span>
              </button>

              <button
                disabled={isPendingOrRejected}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCalendar();
                }}
                className={`px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-sm font-medium transition-colors border box-border ${isPendingOrRejected
                  ? 'bg-transparent text-black border-black cursor-not-allowed'
                  : 'bg-transparent text-gray-700 border-black hover:bg-gray-50'
                  }`}
              >
                <i className="ri-calendar-line text-base sm:text-lg"></i>
              </button>

              {/* Kebab Menu Button */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className={`px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-sm font-medium transition-colors border h-full flex items-center justify-center ${showMenu
                    ? 'bg-[#F3D6DC] text-[#3D1126] border-[#4b4a4a]'
                    : 'bg-[#F3D6DC] text-[#3D1126] border-[#4b4a4a] hover:opacity-90'
                    }`}
                >
                  <i className="ri-more-2-line text-base sm:text-lg"></i>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-40 bg-[#F3D6DC] shadow-lg z-50 overflow-hidden border border-[#E1DAC8]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        useDeleteListingStore.getState().open(listing.id, displayTitle);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#FFE5E5] transition-colors flex items-center border-b border-[#E1DAC8] last:border-0"
                    >
                      <i className="ri-delete-bin-line mr-2 text-gray-500"></i> Delete
                    </button>

                    <button
                      onClick={(e) => {
                        // Reuse the existing handleStatusToggle logic but adapt for menu
                        // We need to pass a synthetic event or just call the logic
                        e.stopPropagation();
                        setShowMenu(false);
                        // Logic from handleStatusToggle manually invoked
                        if (!listing.id || statusUpdating || isPendingOrRejected) return;
                        const nextStatus = isActive ? 'Inactive' : 'Active';
                        setStatusUpdating(true);
                        updateListingStatus(listing.id, nextStatus)
                          .then((response) => {
                            setCurrentStatus(nextStatus);
                            toast.success(response?.message || `Listing ${nextStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`);
                          })
                          .catch((error) => {
                            const message = error?.response?.data?.message || 'Failed to update status.';
                            toast.error(message);
                          })
                          .finally(() => {
                            setStatusUpdating(false);
                          });
                      }}
                      disabled={isPendingOrRejected || statusUpdating}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center border-b border-[#E1DAC8] last:border-0 ${isPendingOrRejected ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-[#FFE5E5] transition-colors'
                        }`}
                    >
                      <i className={`${isActive ? 'ri-eye-off-line' : 'ri-eye-line'} mr-2 text-gray-500`}></i> {isActive ? 'Inactive' : 'Active'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        // Copy link logic
                        const link = `${window.location.origin}/listings/${listing.id}`;
                        navigator.clipboard.writeText(link);
                        toast.success('Link copied to clipboard');
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#FFE5E5] transition-colors flex items-center border-b border-gray-100 last:border-0"
                    >
                      <i className="ri-link-m mr-2 text-gray-500"></i> Copy link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Status Label (optional, based on design it might be separate, but let's keep it clean as requested) 
               The screenshot showed "Active" status block next to it, but our card has status at top. 
               The request said "update the delete button", so I focus on the actions block.
           */}

          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && <PreviewModal listing={listing} onClose={() => setShowPreview(false)} />}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#F3D6DC] shadow-lg w-[95%] sm:w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto relative p-4">
            <button
              onClick={handleCloseCalendar}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              <i className="ri-close-line"></i>
            </button>
            <h2 className="text-lg font-semibold mb-4">Product Availability Calendar</h2>
            <p className="text-sm text-gray-600 mb-4">Managing dates for: {displayTitle}</p>

            <AvailabilityCalendar
              blockedDates={blockedDates}
              bookedDates={listing.block_dates || []}
              onDateToggle={handleDateToggle}
              className="bg-[#F3D6DC] "
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleCloseCalendar}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded"
                disabled={calendarLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCalendarSubmit}
                disabled={calendarLoading || actionLoading}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors font-medium disabled:opacity-50"
              >
                {calendarLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Updating...
                  </>
                ) : (
                  'Submit Dates'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}