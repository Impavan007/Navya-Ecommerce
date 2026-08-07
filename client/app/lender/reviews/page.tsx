'use client';

import { useState, useEffect } from 'react';
import ReviewsReceived from '../components/reviews/ReviewsReceived';
import RatingsAnalytics from '../components/reviews/RatingsAnalytics';
import ReviewsHeader from '../components/reviews/ReviewsHeader';
import Pagination from '../components/Pagination';
import { useReviewStore } from '../stores/Review/ReviewStore';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [itemFilter, setItemFilter] = useState('all');

  const {
    total,
    page,
    totalPages,
    fetchReviews,
    setPage,
    loading
  } = useReviewStore();

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Fetch reviews when filters change or on initial load
  useEffect(() => {
    fetchReviews({
      search: searchQuery,
      rating: ratingFilter,
      period: dateRange,
      itemId: itemFilter,
      page: 1, // Always start from page 1 when filters change
      limit: 10
    });
  }, [searchQuery, ratingFilter, dateRange, itemFilter, fetchReviews]);

  // Handle search and filter changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRatingFilterChange = (rating: string) => {
    setRatingFilter(rating);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleItemFilterChange = (item: string) => {
    setItemFilter(item);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8">
        <ReviewsHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          ratingFilter={ratingFilter}
          setRatingFilter={handleRatingFilterChange}
          dateRange={dateRange}
          setDateRange={handleDateRangeChange}
          itemFilter={itemFilter}
          setItemFilter={handleItemFilterChange}
        />

        <div className="mt-8">
          {activeTab === 'reviews' ? (
            <ReviewsReceived
              searchQuery={searchQuery}
              ratingFilter={ratingFilter}
              dateRange={dateRange}
              itemFilter={itemFilter}
            />
          ) : (
            <RatingsAnalytics />
          )}
        </div>

        {/* Show pagination only for reviews tab and when there are multiple pages */}

        {activeTab === 'reviews' && totalPages > 1 && total > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

    </div>

  );
}