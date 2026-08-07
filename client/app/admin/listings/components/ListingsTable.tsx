'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useListingsStore } from '../../store/Listing/ListingStore';
import CommonLoader from '../../../components/common/CommonLoader';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

const AvatarCircle = ({
  name,
  image,
  size = 'w-8 h-8',
  textSize = 'text-xs',
  withBorder = true,
  className = '',
}: {
  name?: string;
  image?: string | null;
  size?: string;
  textSize?: string;
  withBorder?: boolean;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${withBorder ? 'border border-gray-200' : ''} ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${withBorder ? 'border border-gray-200' : ''} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

interface ListingsTableProps {
  activeTab: string;
  searchQuery: string;
  filters: any;
  selectedListings: string[];
  onSelectionChange: (selected: string[]) => void;
  onListingClick: (listing: any) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onModerationAction?: (action: 'approve' | 'reject', listing?: any) => Promise<void> | void;
}

export default function ListingsTable({
  activeTab,
  searchQuery,
  filters,
  selectedListings,
  onSelectionChange,
  onListingClick,
  onModerationAction,
}: ListingsTableProps) {
  const { listings, loading, fetchListings, updateListing, statusCount } = useListingsStore();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentListing, setCurrentListing] = useState<any>(null);
  const [updatingListingId, setUpdatingListingId] = useState<string | null>(null);


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(listings?.map((listing) => listing.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedListings, listingId]);
    } else {
      onSelectionChange(selectedListings.filter((id) => id !== listingId));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      approved: 'bg-green-50 text-green-700 border border-green-200',
      rejected: 'bg-red-50 text-red-700 border border-red-200',
      active: 'bg-blue-50 text-blue-700 border border-blue-200',
      inactive: 'bg-gray-100 text-gray-700 border border-gray-200'
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status.toLowerCase() as keyof typeof styles] || 'bg-gray-50 text-gray-700'
          } font-poppins`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const handleApprove = async (listing: any) => {
    setUpdatingListingId(listing.id);
    try {
      await updateListing(listing.id, { status: 'Active' });
      // toast.success('Listing approved successfully');
      // Refresh the listings to get updated data
      await fetchListings({
        status: activeTab,
        searched: searchQuery,
        ...filters,
      });
    } catch (err) {
      console.error('Error approving listing:', err);
      toast.error('Failed to approve listing');
    } finally {
      setUpdatingListingId(null);
    }
  };

  const handleRejectClick = (listing: any) => {
    setCurrentListing(listing);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }

    setUpdatingListingId(currentListing.id);
    try {
      await updateListing(currentListing.id, {
        status: 'Rejected',
        rejection_reason: rejectionReason.trim(),
      });
      setShowRejectModal(false);
      setCurrentListing(null);

      // Refresh the listings to get updated data
      await fetchListings({
        status: activeTab,
        searched: searchQuery,
        ...filters,
      });
    } catch (err) {
      console.error('Error rejecting listing:', err);
      toast.error('Failed to reject listing');
    } finally {
      setUpdatingListingId(null);
    }
  };

  const handleFeature = async (listing: any) => {
    setUpdatingListingId(listing.id);
    try {
      await updateListing(listing.id, { is_featured: true });
      // Refresh the listings to get updated data
      await fetchListings({
        status: activeTab,
        searched: searchQuery,
        ...filters,
      });
    } catch (err) {
      console.error('Error featuring listing:', err);
      toast.error('Failed to feature listing');
    } finally {
      setUpdatingListingId(null);
    }
  };

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-poppins">
        <CommonLoader size="md" color="#3D1126" />
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-poppins p-4 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <i className="ri-file-list-line text-gray-400 text-xl"></i>
        </div>
        <p className="text-sm">No listings found</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  const isAllSelected = selectedListings.length === listings.length;
  const isIndeterminate = selectedListings.length > 0 && selectedListings.length < listings.length;

  return (
    <div className={`bg-white border border-gray-200 overflow-hidden font-poppins transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-word-wrap min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-3 py-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500"
                />
              </th>
              <th className="text-left px-3 py-3 text-sm font-semibold text-gray-900 font-poppins">
                Product
              </th>
              <th className="text-left px-3 py-3 text-sm font-semibold text-gray-900 font-poppins">
                Lender
              </th>
              <th className="text-left px-3 py-3 text-sm font-semibold text-gray-900 font-poppins">
                Submitted
              </th>
              <th className="text-left px-3 py-3 text-sm font-semibold text-gray-900 font-poppins">
                Rental/Day
              </th>
              <th className="text-left px-3 py-3 text-sm font-semibold text-gray-900 font-poppins">
                Status
              </th>
              <th className="text-left px-3 py-3 text-sm font-semibold text-gray-900 font-poppins">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings?.map((listing) => (
              <tr
                key={listing.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onListingClick(listing)}
              >
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedListings.includes(listing.id)}
                    onChange={(e) => handleSelectListing(listing.id, e.target.checked)}
                    className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500 relative z-10"
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={listing.coverageImage || '/assets/girl.jpg'}
                      alt={listing.title}
                      className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm font-poppins flex items-center space-x-2 truncate">
                        <span className="truncate">{listing.title}</span>
                        {listing.is_featured && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap flex-shrink-0">
                            Featured
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 font-poppins truncate">{listing.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center space-x-2 min-w-0">
                    <AvatarCircle name={listing.lender.name} image={listing.lender.avatar} />
                    <span className="text-sm font-medium text-gray-900 font-poppins truncate">
                      {listing.lender.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-600 font-poppins whitespace-nowrap">
                  {new Date(listing.submitted).toLocaleDateString()}
                </td>
                <td className="px-3 py-4 text-sm font-semibold text-gray-900 font-poppins whitespace-nowrap">
                  Rs.{listing.rentalPrice}
                </td>
                <td className="px-3 py-4">
                  {getStatusBadge(listing.status ? listing.status : 'unknown')}
                </td>
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  {/* Pending Actions */}
                  {listing.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleApprove(listing)}
                        disabled={updatingListingId === listing.id}
                        className="px-3 py-2 text-sm border border-gray-500 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-poppins rounded whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {updatingListingId === listing.id ? (
                          <>
                            <CommonLoader size="sm" color="white" className="mr-2" />
                            Approving...
                          </>
                        ) : (
                          'Approve'
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectClick(listing)}
                        disabled={updatingListingId === listing.id}
                        className="px-3 py-2 text-sm border bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-poppins rounded whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Feature Button */}
                  {listing.status === 'active' && !listing.is_featured && (
                    <button
                      onClick={() => handleFeature(listing)}
                      disabled={updatingListingId === listing.id}
                      className="px-3 py-2 text-sm border bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors font-poppins rounded whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {updatingListingId === listing.id ? (
                        <>
                          <CommonLoader size="sm" color="currentColor" className="mr-2" />
                          Featuring...
                        </>
                      ) : (
                        'Feature'
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {listings?.map((listing) => (
          <div
            key={listing.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onListingClick(listing)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedListings.includes(listing.id)}
                  onChange={(e) => handleSelectListing(listing.id, e.target.checked)}
                  className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500 flex-shrink-0 mt-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <img
                    src={listing.coverageImage || '/assets/girl.jpg'}
                    alt={listing.title}
                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm font-poppins truncate">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-poppins truncate">{listing.brand}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(listing.status ? listing.status : 'unknown')}
                      {listing.is_featured && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div className="space-y-1">
                <p className="text-gray-500">Lender</p>
                <div className="flex items-center space-x-2">
                  <AvatarCircle name={listing.lender.name} image={listing.lender.avatar} size="w-6 h-6" textSize="text-xs" />
                  <span className="font-medium text-gray-900 truncate">
                    {listing.lender.name}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Submitted</p>
                <p className="font-medium text-gray-900">
                  {new Date(listing.submitted).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="space-y-1">
                <p className="text-gray-500">Rental/Day</p>
                <p className="font-semibold text-gray-900">Rs.{listing.rentalPrice}</p>
              </div>

              {/* Actions for Mobile */}
              <div onClick={(e) => e.stopPropagation()}>
                {listing.status === 'pending' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(listing)}
                      disabled={updatingListingId === listing.id}
                      className="px-3 py-2 text-sm border border-gray-500 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-poppins rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {updatingListingId === listing.id ? (
                        <>
                          <CommonLoader size="sm" color="white" className="mr-2" />
                          Approving...
                        </>
                      ) : (
                        'Approve'
                      )}
                    </button>
                    <button
                      onClick={() => handleRejectClick(listing)}
                      disabled={updatingListingId === listing.id}
                      className="px-3 py-2 text-sm border bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-poppins rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {listing.status === 'active' && !listing.is_featured && (
                  <button
                    onClick={() => handleFeature(listing)}
                    disabled={updatingListingId === listing.id}
                    className="px-3 py-2 text-sm border bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors font-poppins rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {updatingListingId === listing.id ? (
                      <>
                        <CommonLoader size="sm" color="gray" className="mr-2" />
                        Featuring...
                      </>
                    ) : (
                      'Feature'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">Reject Listing</h3>
              <p className="text-sm text-gray-600 mb-4 font-poppins">
                Provide a reason for rejecting this listing so the lender knows what to fix.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full border border-gray-300 rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={updatingListingId === currentListing?.id}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-poppins disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={updatingListingId === currentListing?.id}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-red-700 transition-colors font-poppins disabled:opacity-50 flex items-center justify-center"
                >
                  {updatingListingId === currentListing?.id ? (
                    <>
                      <CommonLoader size="sm" color="white" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}