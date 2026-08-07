'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingsHeader from '../components/listings/ListingsHeader';
import ListingsGrid from '../components/listings/ListingsGrid';
import ListingsTable from '../components/listings/ListingsTable';
import ListingsFilters from '../components/listings/ListingsFilters';
import Pagination from '../components/Pagination';
import { useListingsStore } from '../stores/Listing/FetchProducts';
import DeleteListingModal from '../components/listings/DeleteListingModal';
import PreviewModal from '../components/listings/PreviewModal';
export default function ListingsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchListings, pagination, loading } = useListingsStore();

  const [pageSize, setPageSize] = useState(12);
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get('productId');

  useEffect(() => {
    if (productIdParam && !loading) {
      setPreviewProductId(productIdParam);
    }
  }, [productIdParam, loading]);

  const previewListing = useMemo(() => {
    if (!previewProductId) return null;
    return useListingsStore.getState().listings[previewProductId] || null;
  }, [previewProductId, loading]);

  const calculatePageSize = () => {
    const width = window.innerWidth;
    if (width >= 1536) return 25; // 2xl: 5x5
    if (width >= 1280) return 20; // xl: 4x5
    if (width >= 1024) return 15; // lg: 3x5
    if (width >= 768) return 12;  // md: 2x6
    return 10;                    // sm: 2x5
  };

  useEffect(() => {
    const handleResize = () => {
      const newSize = calculatePageSize();
      if (newSize !== pageSize) {
        setPageSize(newSize);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageSize]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchListings({
        status: statusFilter,
        search: searchTerm.trim(),
        sort: sortBy,
        page: pagination?.currentPage || 1,
        limit: pageSize,
      });
    }, 300); // Small debounce to catch rapid updates

    return () => clearTimeout(handler);
  }, [statusFilter, sortBy, searchTerm, pageSize, fetchListings]);

  return (
    <div className="min-h-screen bg-[515151]/1">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <ListingsHeader />

          <ListingsFilters
            viewMode={viewMode}
            setViewMode={setViewMode}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {viewMode === 'grid' ? (
            <ListingsGrid statusFilter={statusFilter} />
          ) : (
            <ListingsTable statusFilter={statusFilter} />
          )}
          {pagination && pagination.totalPages > 1 && pagination.totalItems > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => {
                fetchListings({ status: statusFilter, page, limit: pageSize });
              }}
            />
          )}

        </div>
        {/* Global modal for delete confirmation */}
        <DeleteListingModal />
        
        {/* Preview Modal for auto-opening via notification */}
        {previewListing && (
          <PreviewModal 
            listing={previewListing} 
            onClose={() => setPreviewProductId(null)} 
          />
        )}
      </div>
    </div>
  );
}
