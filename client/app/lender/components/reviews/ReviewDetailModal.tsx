'use client';

import { useState } from 'react';
import CommonModal from '@/app/components/common/CommonModal';

interface Review {
  id: string;
  review_slug_id?: string;
  borrowerName: string;
  borrowerAvatar: string;
  orderId: string;
  itemName: string;
  itemImage: string;
  rating: number;
  reviewText: string;
  datePosted: string;
  status?: 'flagged' | 'hidden';
}

interface ReviewDetailModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewDetailModal({ review, isOpen, onClose }: ReviewDetailModalProps) {
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [lenderNotes, setLenderNotes] = useState('');
  const [showNotesForm, setShowNotesForm] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`ri-star-${i < rating ? 'fill' : 'line'} w-5 h-5 flex items-center justify-center ${i < rating ? 'text-gray-700' : 'text-gray-300'
          }`}
      ></i>
    ));
  };

  const handleFlag = () => {
    if (flagReason.trim()) {
      setShowFlagModal(false);
      setFlagReason('');
      onClose();
    }
  };

  const handleSaveNotes = () => {
    setShowNotesForm(false);
  };


  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Details"
      size="md"
    >
      {!review ? null : (
        <div className="space-y-6">
          {/* Review Header */}
          <div className="flex items-start gap-4">
            <img
              src={review.borrowerAvatar}
              alt={review.borrowerName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 font-poppins">{review.borrowerName}</h3>
                  <p className="text-sm text-gray-600 font-playfair">Review ID: {review.review_slug_id}</p>
                </div>
                {review.status === 'flagged' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1 border border-red-300 font-poppins">
                    <i className="ri-flag-fill w-3 h-3 flex items-center justify-center"></i>
                    Flagged
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-600 font-playfair">{review.datePosted}</span>
              </div>
            </div>
          </div>

          {/* Order & Item Details */}
          <div className="bg-gray-50 p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 font-poppins">Order Details</h4>
            <div className="flex items-center gap-4">
              <img
                src={review.itemImage}
                alt={review.itemName}
                className="w-16 h-20 object-cover"
              />
              <div>
                <p className="font-medium text-gray-900 font-poppins">{review.itemName}</p>
                <p className="text-sm text-gray-800 hover:text-gray-900 cursor-pointer font-poppins">
                  Order {review.orderId}
                </p>
                <p className="text-sm text-gray-600 mt-1 font-playfair">
                  Rental Period: Sept 28 - Oct 2, 2025
                </p>
                <p className="text-sm text-gray-600 font-playfair">
                  Total Amount: Rs.210
                </p>
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 font-poppins">Review</h4>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 border border-gray-200 font-playfair">
              {review.reviewText}
            </p>
          </div>
        </div>
      )}
    </CommonModal>
  );
}