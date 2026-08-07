'use client';

import { useState, useEffect } from 'react';
import { useReviewStore, Review } from '../store/Reviews/Reviews';
import ReviewsHeader from './components/ReviewsHeader';
import ReviewsFilters from './components/ReviewsFilters';
import BulkActionsBar from './components/BulkActionsBar';
import ReviewsTable from './components/ReviewsTable';
import Pagination from '../components/pagination';
import ReviewDetailPanel from './components/ReviewDetailPanel';
import CommonLoader from '../../components/common/CommonLoader';

export default function ReviewsPage() {
  const {
    reviews,
    loading,
    pagination,
    statusCounts,
    fetchReviews,
    bulkUpdateReviews
  } = useReviewStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'flagged' | 'removed'>('all');
  const [filters, setFilters] = useState({
    rating: '',
    reviewerType: '',
    dateRange: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);

  useEffect(() => {
    fetchReviews({
      status: activeTab,
      searchQuery,
      rating: filters.rating ? parseInt(filters.rating) : undefined,
      reviewerType: filters.reviewerType,
      period: filters.dateRange,
      page: currentPage,
      limit: 10
    });
  }, [activeTab, searchQuery, filters, currentPage, fetchReviews]);

  const handleSelectReview = (id: string) => {
    setSelectedReviews(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedReviews(ids);
  };

  const filteredReviews = reviews; // Logic is handled server-side via fetchReviews
  const reviewCounts = statusCounts;

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300`}>
        <ReviewsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
        />

        <div className="px-8 py-8 h-full flex flex-col overflow-hidden">
          <ReviewsFilters
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab as any);
              setCurrentPage(1);
            }}
            counts={reviewCounts}
          />

          {selectedReviews.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedReviews.length}
              onClearSelection={() => setSelectedReviews([])}
              onBulkApprove={async () => {
                const ids = selectedReviews;
                if (ids.length === 0) return;
                await bulkUpdateReviews({ reviewIds: ids, action: 'Approve' });
                setSelectedReviews([]);
              }}
              onBulkReject={async (reason: string) => {
                const ids = selectedReviews;
                if (ids.length === 0) return;
                await bulkUpdateReviews({ reviewIds: ids, action: 'Reject', reason });
                setSelectedReviews([]);
              }}
            />
          )}

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-500 font-poppins">
                <CommonLoader size="md" color="#3D1126" />
              </div>
            ) : (
              <ReviewsTable
                reviews={filteredReviews}
                selectedReviews={selectedReviews}
                onSelectReview={handleSelectReview}
                onSelectAll={handleSelectAll}
                onReviewClick={setSelectedReview}
              />
            )}
          </div>

          {!loading && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination?.totalPages ?? 1}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {selectedReview && (
        <ReviewDetailPanel
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}
