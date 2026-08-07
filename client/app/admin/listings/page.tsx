'use client';

import { useState, useEffect } from 'react';
import ListingsHeader from './components/ListingsHeader';
import ListingsFilters from './components/ListingsFilters';
import ListingsTable from './components/ListingsTable';
import ListingDetailPanel from './components/ListingDetailPanel';
import BulkActionsBar from './components/BulkActionsBar';
import ModerationModal from './components/ModerationModal';
import Pagination from '../components/pagination';
import { useListingsStore } from '../store/Listing/ListingStore';
import { API_ENDPOINTS } from '@/app/lender/LenderAPi/LenderAPiendPoints';
import axiosClient from '../adminApi/axiosClient';

export default function ListingsPage() {
  const { listings, fetchListings, totalPages, currentPage, bulkUpdateListings, updateListing, loading } = useListingsStore();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('reject');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    brand: 'All',
    dateRange: 'All',
    page: 1,
  });

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ _id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await axiosClient.get(API_ENDPOINTS.Categories);
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch listings whenever filters or activeTab change
  useEffect(() => {
    fetchListingsData();
  }, [activeTab, filters]);

  // Function to fetch listings with current filters and search
  const fetchListingsData = (searchTerm: string = searchQuery) => {
    const fetchFilters = {
      ...filters,
      status: activeTab === 'All' ? '' : activeTab,
      search: searchTerm,
    };
    fetchListings(fetchFilters);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    fetchListingsData(searchQuery);
  };

  // Handle search query change (just update state, don't fetch)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Filters will trigger useEffect automatically
  };

  const handleListingClick = (listing: any) => {
    setSelectedListing(listing);
    setShowDetailPanel(true);
  };

  const handleModerationAction = async (action: 'approve' | 'reject', listing?: any) => {
    setModerationAction(action);
    if (listing) setSelectedListing(listing);

    if (action === 'approve') {
      const res = await updateListing(listing.id, { status: 'Active' });
      // TODO: Implement approve logic
    } else {
      setShowModerationModal(true);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'feature' | 'unfeature') => {
    if (selectedListings.length === 0) return;
    if (action === 'reject') {
      setModerationAction('reject');
      setShowModerationModal(true);
      return;
    }
    if (action === 'approve') {
      await bulkUpdateListings({ productIds: selectedListings, action: 'approve' });
    } else if (action === 'feature') {
      await bulkUpdateListings({ productIds: selectedListings, action: 'feature' });
    } else if (action === 'unfeature') {
      await bulkUpdateListings({ productIds: selectedListings, action: 'unfeature' });
    }
    setSelectedListings([]);
    fetchListingsData();
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle tab change - reset to page 1 when changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters and search
  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({
      category: 'All',
      brand: 'All',
      dateRange: 'All',
      page: 1,
    });
    setActiveTab('All');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ListingsHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearAll={handleClearAll}
        showClearAll={(searchQuery !== '' || filters.category !== 'All' || filters.dateRange !== 'All') || (activeTab !== 'All' && listings.length === 0)}
      />

      <div className="px-8 py-8">
        <ListingsFilters
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {selectedListings.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedListings.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedListings([])}
          />
        )}

        <ListingsTable
          activeTab={activeTab}
          searchQuery={searchQuery}
          filters={filters}
          selectedListings={selectedListings}
          onSelectionChange={setSelectedListings}
          onListingClick={handleListingClick}
          onModerationAction={handleModerationAction}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Pagination at the bottom */}
        {totalPages > 1 && !loading && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      </div>

      {showDetailPanel && selectedListing && (
        <ListingDetailPanel
          listing={selectedListing}
          onClose={() => setShowDetailPanel(false)}
          onModerationAction={handleModerationAction}
        />
      )}

      {showModerationModal && (
        <ModerationModal
          action={moderationAction}
          listing={selectedListing}
          selectedListings={selectedListings}
          onClose={() => setShowModerationModal(false)}
          isOpen={showModerationModal}
          onConfirm={async (reason?: string) => {
            if (moderationAction === 'reject') {
              await bulkUpdateListings({ productIds: selectedListings.length ? selectedListings : selectedListing ? [selectedListing.id] : [], action: 'reject', reason });
            } else if (moderationAction === 'approve') {
              await bulkUpdateListings({ productIds: selectedListings.length ? selectedListings : selectedListing ? [selectedListing.id] : [], action: 'approve' });
            }
            setShowModerationModal(false);
            setSelectedListings([]);
            setShowDetailPanel(false);
            fetchListingsData();
          }}
        />
      )}
    </div>
  );
}
