'use client';

import { useEffect, useMemo, useState } from 'react';
import StoriesHeader from './components/StoriesHeader';
import StoriesFilters from './components/StoriesFilters';
import StoriesTable from './components/StoriesTable';
import StoryItemsModal from './components/StoryItemsModal';
import { useStoriesStore, Story } from '../store/Stories/StoriesStore';
import Pagination from '@/app/lender/components/Pagination';

export default function adminStoriesPage() {
  const { stories, fetchStories, loading, pagination, statusCounts } = useStoriesStore();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetchStories({
      status: activeTab !== 'all' ? activeTab : undefined,
      search: searchQuery || undefined,
      page,
      period: period === 'all' ? undefined : period,
    });
  }, [activeTab, searchQuery, page, period, fetchStories]);

  const counts = useMemo(() => ({
    all: statusCounts?.all ?? stories.length,
    pending: statusCounts?.pending ?? stories.filter((s) => s.status.toLowerCase() === 'pending').length,
    active: statusCounts?.active ?? stories.filter((s) => s.status.toLowerCase() === 'active').length,
    rejected: statusCounts?.rejected ?? stories.filter((s) => s.status.toLowerCase() === 'rejected').length,
  }), [stories, statusCounts]);

  const filteredStories = useMemo(() => {
    const tabFiltered = activeTab === 'all' ? stories : stories.filter(s => s.status.toLowerCase() === activeTab);
    if (!searchQuery) return tabFiltered;
    const q = searchQuery.toLowerCase();
    return tabFiltered.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.lender.name.toLowerCase().includes(q) ||
      s.lender.email.toLowerCase().includes(q)
    );
  }, [stories, activeTab, searchQuery]);

  const handleSearchClick = () => setSearchQuery(localSearch.trim());

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      <StoriesHeader
        searchQuery={localSearch}
        onSearchChange={setLocalSearch}
        onSearchSubmit={handleSearchClick}
        loading={loading}
        period={period}
        onPeriodChange={setPeriod}
      />

      <div className="px-8 py-8">
        <StoriesFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        <StoriesTable
          stories={filteredStories}
          loading={loading}
          onOpenStory={(story) => setSelectedStory(story)}
        />
        {!loading && (
          <Pagination
            currentPage={pagination?.currentPage || page}
            totalPages={pagination?.totalPages || 1}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {selectedStory && (
        <StoryItemsModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}
