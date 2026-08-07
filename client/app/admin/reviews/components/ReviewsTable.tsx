'use client';

import Link from 'next/link';
import { Review } from '../../store/Reviews/Reviews';
import { useReviewStore } from '../../store/Reviews/Reviews';
import { useState } from 'react';
import ExpandableText from '@/shared/components/ExpandableText';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import CommonModal from '../../../components/common/CommonModal';

interface ReviewsTableProps {
  reviews: Review[];
  selectedReviews: string[];
  onSelectReview: (reviewId: string) => void;
  onSelectAll: (ids: string[]) => void;
  onReviewClick: (review: Review) => void;
}

export default function ReviewsTable({
  reviews,
  selectedReviews,
  onSelectReview,
  onSelectAll,
  onReviewClick
}: ReviewsTableProps) {
  const { updateReviewStatus } = useReviewStore();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700 border border-gray-200',
      approved: 'bg-green-50 text-green-700 border border-green-200',
      removed: 'bg-red-50 text-red-700 border border-red-200'
    };

    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      removed: 'Rejected'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]} font-poppins whitespace-nowrap`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getReviewerTypeBadge = (type: string) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full font-poppins whitespace-nowrap ${type === 'borrower'
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}>
        {type === 'borrower' ? 'Renter' : 'Lender'}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i key={star} className={`ri-star-${star <= rating ? 'fill' : 'line'} ${star <= rating ? 'text-gray-600' : 'text-gray-300'
            }`}></i>
        ))}
        <span className="text-sm text-gray-600 ml-1 font-poppins">({rating})</span>
      </div>
    );
  };

  const renderUserAvatar = (user: { avatar?: string; name: string }) => {
    const firstLetter = user.name.charAt(0).toUpperCase();

    if (user.avatar && user.avatar.trim() !== '') {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
        />
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 border border-gray-200 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-gray-700 font-poppins">{firstLetter}</span>
      </div>
    );
  };

  const handleApprove = async (id: string) => {
    await updateReviewStatus(id, 'approved');
  };

  const handleRejectClick = (id: string) => {
    setSelectedReviewId(id);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (selectedReviewId) {
      await updateReviewStatus(selectedReviewId, 'removed', rejectReason);
      setRejectReason('');
      setSelectedReviewId(null);
      setIsRejectModalOpen(false);
    }
  };

  const columns: Column<Review>[] = [
    {
      header: 'Review ID',
      key: 'reviewId',
      render: (val, review) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 font-poppins">{val}</span>
          <Link
            href={`/admin/orders?search=${review.orderId}`}
            className="text-xs text-gray-500 hover:text-gray-700 font-poppins mt-1 underline"
            onClick={(e) => e.stopPropagation()}
          >
            {review.orderId}
          </Link>
        </div>
      )
    },
    {
      header: 'Reviewer',
      key: 'reviewer',
      render: (reviewer) => (
        <div className="flex items-center space-x-2">
          {renderUserAvatar(reviewer)}
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 font-poppins truncate">{reviewer.name}</div>
            {getReviewerTypeBadge(reviewer.type)}
          </div>
        </div>
      )
    },
    {
      header: 'Recipient',
      key: 'recipient',
      render: (recipient) => (
        <div className="flex items-center space-x-2">
          {renderUserAvatar(recipient)}
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 font-poppins truncate">{recipient.name}</div>
            {getReviewerTypeBadge(recipient.type)}
          </div>
        </div>
      )
    },
    {
      header: 'Rating',
      key: 'rating',
      render: (val) => renderStars(val)
    },
    {
      header: 'Review Text',
      key: 'reviewText',
      className: 'w-[300px] min-w-[300px]',
      render: (text) => (
        <ExpandableText
          text={text}
          lines={2}
          textClassName="text-sm text-gray-900 font-poppins break-words whitespace-normal"
          buttonClassName="text-gray-700 text-xs mt-1"
        />
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Date',
      key: 'datePosted',
      render: (val) => (
        <span className="text-sm text-gray-600 font-poppins">
          {new Date(val).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, review) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {review.status === 'pending' ? (
            <>
              <button
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                onClick={() => handleApprove(review.id)}
                title="Approve"
              >
                <i className="ri-check-line"></i>
              </button>
              <button
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                onClick={() => handleRejectClick(review.id)}
                title="Reject"
              >
                <i className="ri-close-line"></i>
              </button>
            </>
          ) : (
            <button
              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              onClick={() => onReviewClick(review)}
              title="View"
            >
              <i className="ri-eye-line"></i>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <ReusableTable
        columns={columns}
        data={reviews}
        onRowClick={onReviewClick}
        selectable
        selectedIds={selectedReviews}
        onSelectRow={onSelectReview}
        onSelectAll={onSelectAll}
        emptyMessage="No reviews found"
      />

      <CommonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Review"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-poppins">
            Please provide a reason for rejecting this review:
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-gray-500 focus:border-gray-500 font-poppins"
            rows={4}
            placeholder="Enter rejection reason..."
          ></textarea>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-poppins"
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 font-poppins"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
}