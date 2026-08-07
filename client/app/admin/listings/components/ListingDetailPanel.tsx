'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useListingsStore } from '../../store/Listing/ListingStore';
import CommonLoader from '../../../components/common/CommonLoader';
import CommonModal from '../../../components/common/CommonModal';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

const AvatarCircle = ({
  name,
  image,
  size = 'w-10 h-10',
  textSize = 'text-sm',
  withBorder = false,
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

interface ListingDetailPanelProps {
  listing: any;
  onClose: () => void;
  onModerationAction: (action: 'approve' | 'reject', listing: any) => void;
}

export default function ListingDetailPanel({ listing, onClose, onModerationAction }: ListingDetailPanelProps) {
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const { updateListing } = useListingsStore();

  const mockDetails = {
    description: "Stunning Prada sequin mini dress in excellent condition. Perfect for special occasions and events. Features intricate sequin detailing and a flattering silhouette. Dry clean only.",
    size: "M (UK/IN 10)",
    condition: "Excellent",
    availability: "Available for rental",
    measurements: {
      bust: "86cm",
      waist: "68cm",
      length: "85cm"
    },
    auditTrail: [
      { action: "Submitted", date: "2024-01-15 14:30", user: "Maria K." },
      { action: "Under Review", date: "2024-01-15 15:45", user: "System" },
      { action: "Photos Verified", date: "2024-01-15 16:20", user: "Emma Wilson" }
    ]
  };

  // Handle products array - convert single product to array if needed
  const products = Array.isArray(listing.products) ? listing.products :
    listing.products ? [listing.products] :
      [listing]; // Fallback to main listing if no products array

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateListing(listing.id, {
        status: 'Rejected',
        rejection_reason: rejectionReason.trim(),
      });
      setShowRejectModal(false);
      onClose();
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast.error('Failed to reject listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextProduct = () => {
    setActiveProductIndex((prev) => (prev + 1) % products.length);
    setActiveImageIndex(0);
  };

  const prevProduct = () => {
    setActiveProductIndex((prev) => (prev - 1 + products.length) % products.length);
    setActiveImageIndex(0);
  };

  const currentProduct = products[activeProductIndex];
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Listing: ${currentProduct.title || currentProduct.name}`}
      size="xl"
      showCloseButton={true}
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex font-poppins">
        {/* Left Side - Product Slider */}
        <div className="w-1/2 bg-gray-50 p-6 relative">
          {/* Main Image */}
          <div className="mb-4 relative">
            <img
              src={currentProduct.images?.[activeImageIndex] || currentProduct.coverageImage || '/assets/default-product.jpg'}
              alt={currentProduct.title || currentProduct.name}
              className="w-full h-96 object-cover rounded-lg"
            />

            {/* Navigation Arrows */}
            {products.length > 1 && (
              <>
                <button
                  onClick={prevProduct}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <i className="ri-arrow-left-line"></i>
                </button>
                <button
                  onClick={nextProduct}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <i className="ri-arrow-right-line"></i>
                </button>
              </>
            )}

            {/* Product Counter */}
            {products.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {activeProductIndex + 1} / {products.length}
              </div>
            )}
          </div>

          {/* Thumbnail Images for Current Product */}
          {currentProduct.images && currentProduct.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {currentProduct.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-16 h-20 rounded overflow-hidden border-2 transition-colors flex-shrink-0 ${activeImageIndex === index ? 'border-gray-800' : 'border-gray-200'
                    }`}
                >
                  <img
                    src={image}
                    alt={`${currentProduct.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Product Cards Slider */}
          {products.length > 1 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3 font-poppins">All Products ({products.length})</h4>
              <div className="flex space-x-3 overflow-x-auto pb-4">
                {products.map((product: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => {
                      setActiveProductIndex(index);
                      setActiveImageIndex(0);
                    }}
                    className={`flex-shrink-0 w-32 cursor-pointer transition-all ${activeProductIndex === index ? 'ring-2 ring-gray-800' : 'opacity-70 hover:opacity-100'
                      }`}
                  >
                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                      <img
                        src={product.coverageImage || product.images?.[0] || '/assets/default-product.jpg'}
                        alt={product.title || product.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <div className="text-xs font-medium text-gray-900 truncate font-poppins">
                        {product.title || product.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate font-poppins">
                        {product.brand || 'No brand'}
                      </div>
                      <div className="text-xs font-semibold text-gray-800 font-poppins">
                        Rs.{product.rentalPrice || product.rental_price_per_day || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Details */}
        <div className="w-1/2 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">
                {currentProduct.title || currentProduct.name}
              </h2>
              <p className="text-lg text-gray-600 font-poppins">{currentProduct.brand}</p>
              {products.length > 1 && (
                <p className="text-sm text-gray-500 font-poppins mt-1">
                  Product {activeProductIndex + 1} of {products.length}
                </p>
              )}
            </div>

          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-poppins">Rental Price per Day</span>
              <span className="text-lg font-semibold text-gray-800 font-poppins">
                Rs.{currentProduct.rentalPrice || currentProduct.rental_price_per_day}
              </span>
            </div>
          </div>

          {/* Lender Info */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 font-poppins">Lender Information</h3>
            <div className="flex items-center space-x-3">
              <AvatarCircle
                name={listing.lender.name}
                image={listing.lender.avatar}
                size="w-12 h-12"
                textSize="text-base"
              />
              <div>
                <p className="font-medium text-gray-900 font-poppins">{listing.lender.name}</p>
                <p className="text-sm text-gray-500 font-poppins">{listing.lender.email}</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 font-poppins">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-poppins">
                {currentProduct.description || mockDetails.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1 font-poppins">Size</h4>
                <p className="text-sm text-gray-600 font-poppins">
                  {Array.isArray(currentProduct.size) ? currentProduct.size.join(', ') : currentProduct.size || mockDetails.size}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1 font-poppins">Condition</h4>
                <p className="text-sm text-gray-600 font-poppins">{mockDetails.condition}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 font-poppins">Measurements</h4>
              <div className="grid grid-cols-3 gap-2 text-sm font-poppins">
                <div>
                  <span className="text-gray-500">Bust:</span>
                  <span className="ml-1 text-gray-900">{mockDetails.measurements.bust}</span>
                </div>
                <div>
                  <span className="text-gray-500">Waist:</span>
                  <span className="ml-1 text-gray-900">{mockDetails.measurements.waist}</span>
                </div>
                <div>
                  <span className="text-gray-500">Length:</span>
                  <span className="ml-1 text-gray-900">{mockDetails.measurements.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            {listing.status === 'pending' && (
              <>
                <button
                  onClick={() => onModerationAction('approve', listing)}
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
                >
                  Approve Listing
                </button>
                <button
                  onClick={() => {
                    setRejectionReason('');
                    setShowRejectModal(true);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors whitespace-nowrap font-poppins"
                >
                  Reject Listing
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-96 p-6 rounded-lg font-poppins">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Reject Listing</h2>
            <p className="text-sm text-gray-600 mb-4 font-playfair">
              Provide a reason for rejecting this listing so the lender knows what to fix.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="w-full border border-gray-300 rounded p-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isSubmitting}
                className="px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[80px]"
              >
                {isSubmitting ? <CommonLoader size="sm" color="white" /> : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CommonModal>
  );
}