'use client';

import { useState } from 'react';
import { Story, useStoriesStore } from '../../store/Stories/StoriesStore';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';

interface StoriesTableProps {
  stories: Story[];
  loading?: boolean;
  onOpenStory: (s: Story) => void;
}

export default function StoriesTable({ stories, loading, onOpenStory }: StoriesTableProps) {
  const { updateStoryStatus } = useStoriesStore();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    const styles: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700 border border-gray-200',
      active: 'bg-green-50 text-green-700 border border-green-200',
      rejected: 'bg-red-50 text-red-700 border border-red-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[s] || 'bg-gray-50 text-gray-700'} font-poppins`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleAction = async (story: Story, action: 'Approved' | 'Rejected') => {
    try {
      setActionLoadingId(story.id);
      await updateStoryStatus(story.id, action);
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns: Column<Story>[] = [
    {
      header: 'Story',
      key: 'title',
      render: (_, story) => (
        <div className="flex items-center space-x-4">
          <img src={story.coverImage} alt={story.title} className="w-16 h-16 object-cover border border-gray-200 rounded-full" />
          <div className="max-w-[250px]">
            <h3 className="font-semibold text-gray-900 text-sm font-playfair truncate">{story.title}</h3>
            <p className="text-xs text-gray-500 font-poppins line-clamp-2">{story.description}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Lender',
      key: 'lender',
      render: (lender) => (
        <div className="flex items-center space-x-3">
          {lender.profile_image ? (
            <img
              src={lender.profile_image}
              alt={lender.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold border border-gray-200">
              {lender.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="text-sm text-gray-900 font-poppins">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{lender.name}</span>
              {lender.is_top_lender && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Top</span>
              )}
            </div>
            <div className="text-xs text-gray-500">{lender.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Submitted',
      key: 'submitted',
      render: (val, story) => (
        <span className="text-sm text-gray-600 font-poppins">
          {val || new Date(story.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, story) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {story.status.toLowerCase() === 'pending' ? (
            <>
              <button
                disabled={actionLoadingId === story.id}
                onClick={() => handleAction(story, 'Approved')}
                className="px-3 py-1.5 text-xs bg-gray-900 text-white hover:bg-gray-800 transition-colors font-poppins disabled:opacity-60"
              >
                {actionLoadingId === story.id ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : 'Approve'}
              </button>
              <button
                disabled={actionLoadingId === story.id}
                onClick={() => handleAction(story, 'Rejected')}
                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-poppins disabled:opacity-60"
              >
                {actionLoadingId === story.id ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : 'Reject'}
              </button>
            </>
          ) : (
            <button
              className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-poppins"
              onClick={() => onOpenStory(story)}
            >
              View
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <ReusableTable
        columns={columns}
        data={stories}
        loading={loading}
        onRowClick={onOpenStory}
        emptyMessage="No stories found."
        idKey="id"
      />
    </div>
  );
}