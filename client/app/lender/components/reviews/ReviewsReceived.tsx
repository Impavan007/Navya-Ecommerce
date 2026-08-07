'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReviewStore } from '../../stores/Review/ReviewStore';
import ReviewDetailModal from './ReviewDetailModal';
import ExpandableText from '@/shared/components/ExpandableText';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import CommonLoader from '@/app/components/common/CommonLoader';

interface ReviewsReceivedProps {
  searchQuery: string;
  ratingFilter: string;
  dateRange: string;
  itemFilter: string;
}

export default function ReviewsReceived({
  searchQuery,
  ratingFilter,
  dateRange,
  itemFilter,
}: ReviewsReceivedProps) {
  const { reviews, loading, fetchReviews } = useReviewStore();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const searchParams = useSearchParams();
  const reviewIdParam = searchParams.get('reviewId');

  // Handle auto-opening review modal from query param
  useEffect(() => {
    if (reviewIdParam && !loading && reviews.length > 0) {
      const review = reviews.find(r => r.id === reviewIdParam);
      if (review) {
        setSelectedReview(review);
      }
    }
  }, [reviewIdParam, loading, reviews]);

  // Automatically switch to grid view on mobile
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? 'grid' : 'table');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch reviews on filter change
  useEffect(() => {
    fetchReviews({
      search: searchQuery,
      rating: ratingFilter,
      period: dateRange,
      page: 1,
    });
  }, [searchQuery, ratingFilter, dateRange, fetchReviews]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`ri-star-${i < rating ? 'fill' : 'line'} text-sm ${i < rating ? 'text-black' : 'text-gray-300'
          }`}
      ></i>
    ));

  const columns: Column<any>[] = [
    {
      header: 'Review ID',
      key: 'review_slug_id',
      render: (val) => <span className="text-sm font-semibold text-gray-900 font-poppins">{val}</span>
    },
    {
      header: 'Borrower',
      key: 'borrowerName',
      render: (name, review) => (
        <div className="flex items-center gap-2">
          <img
            src={review.borrowerAvatar}
            alt={name}
            className="w-6 h-6 rounded-full object-cover border border-gray-100"
          />
          <span className="text-sm font-medium text-gray-900 font-poppins">{name}</span>
        </div>
      )
    },
    {
      header: 'Order',
      key: 'orderId',
      render: (val) => <span className="text-sm text-gray-800 font-poppins">{val}</span>
    },
    {
      header: 'Item',
      key: 'itemName',
      render: (name, review) => (
        <div className="flex items-center gap-2">
          <img
            src={review.itemImage}
            alt={name}
            className="w-8 h-8 rounded object-cover border border-gray-100"
          />
          <span className="text-sm font-medium text-gray-900 font-poppins">{name}</span>
        </div>
      )
    },
    {
      header: 'Review',
      key: 'reviewText',
      render: (text) => (
        <div className="max-w-xs overflow-hidden">
          <ExpandableText
            text={text}
            lines={2}
            textClassName="text-sm text-gray-700 font-poppins"
            buttonClassName="text-gray-900 font-semibold"
          />
        </div>
      )
    },
    {
      header: 'Rating',
      key: 'rating',
      render: (rating) => (
        <div className="flex items-center gap-0.5">
          {renderStars(rating)}
        </div>
      )
    },
    {
      header: 'Date',
      key: 'datePosted',
      render: (val) => <span className="text-sm text-gray-500 font-poppins">{val}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, review) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReview(review);
          }}
          className="text-gray-900 hover:text-black font-semibold text-sm font-poppins underline"
        >
          Details
        </button>
      )
    }
  ];

  return (
    <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
      {loading && reviews.length === 0 && (
        <CommonLoader pageCenter text="Loading reviews..." />
      )}

      {reviews.length === 0 && !loading && (
        <div className="p-12 text-center text-gray-600 font-poppins">
          No reviews found
        </div>
      )}

      {reviews.length > 0 && (
        <>

      <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-poppins font-bold text-gray-900">
              Reviews Received
            </h2>
            <p className="text-gray-500 text-sm mt-1 font-poppins">
              {reviews.length} reviews found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 p-1 rounded border border-gray-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <i className="ri-list-unordered text-lg"></i>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <i className="ri-grid-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <ReusableTable
            columns={columns}
            data={reviews}
            onRowClick={setSelectedReview}
            emptyMessage="No reviews found"
            idKey="id"
          />
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                onClick={() => setSelectedReview(review)}
                className="bg-white border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.borrowerAvatar}
                      alt={review.borrowerName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 font-poppins text-sm">
                        {review.borrowerName}
                      </h3>
                      <p className="text-xs text-gray-500 font-poppins">
                        {review.datePosted}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded">
                  <img
                    src={review.itemImage}
                    alt={review.itemName}
                    className="w-12 h-14 object-cover rounded border border-gray-200"
                  />
                  <div>
                    <p className="font-medium text-gray-900 font-poppins text-sm">
                      {review.itemName}
                    </p>
                    <p className="text-xs text-gray-500 font-poppins">
                      {review.orderId}
                    </p>
                  </div>
                </div>

                <ExpandableText
                  text={review.reviewText}
                  lines={2}
                  textClassName="text-sm text-gray-600 font-poppins leading-relaxed"
                  buttonClassName="text-gray-900 font-semibold"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ReviewDetailModal
        review={selectedReview}
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
      />
        </>
      )}
    </div>
  );
}
