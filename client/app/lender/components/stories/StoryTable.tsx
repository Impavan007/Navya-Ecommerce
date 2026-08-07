"use client";

import React, { useState, useEffect } from 'react';
import { useStoryStore } from '../../stores/Story/storyStore';
import StoryCard from './StoryCard';
import StoryFormModal from './StoryFormModal';
import useStoryManagementStore from '../../stores/Story/storyManagementStore';
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ExpandableText from '@/shared/components/ExpandableText';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import CommonModal from '../../../components/common/CommonModal';
import { toast } from 'react-hot-toast';

export default function StoryTable() {
  const { stories, loading, fetchStories, deleteStory } = useStoryStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const setViewStory = useStoryManagementStore((s: any) => s.setViewStory);
  const setEditStory = useStoryManagementStore((s: any) => s.setEditStory);
  const viewStory = useStoryManagementStore((s: any) => s.viewStory);
  const editStory = useStoryManagementStore((s: any) => s.editStory);

  // Fetch stories only once when component mounts
  useEffect(() => {
    if (!hasFetched) {
      fetchStories();
      setHasFetched(true);
    }
  }, [hasFetched, fetchStories]);

  const handleView = (story: any) => {
    setViewStory(story);
  };

  const handleEdit = (story: any) => {
    setEditStory(story);
  };

  const handleDeleteClick = (story: any) => {
    setStoryToDelete(story);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storyToDelete) return;

    setDeleteLoading(true);
    try {
      const storyId = storyToDelete._id || storyToDelete.id;
      await deleteStory(storyId);
      toast.success('Story deleted successfully');
      setDeleteModalOpen(false);
      setStoryToDelete(null);
      fetchStories();
    } catch (error: any) {
      console.error('Failed to delete story:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete story';
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Title',
      key: 'title',
      render: (val) => <span className="text-sm font-semibold text-gray-900 font-poppins">{val}</span>
    },
    {
      header: 'Description',
      key: 'description',
      render: (text) => (
        <div className="max-w-xs overflow-hidden">
          <ExpandableText
            text={text || ''}
            lines={2}
            textClassName="text-sm text-gray-700 font-poppins"
            buttonClassName="text-gray-900 font-semibold"
          />
        </div>
      )
    },
    {
      header: 'Items',
      key: 'items',
      render: (items) => <span className="text-sm text-gray-500 font-poppins">{(items || []).length}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-poppins ${status?.toLowerCase() === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
          {status}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, story) => (
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleView(story)} className="text-gray-600 hover:text-gray-900 transition-colors">
            <FaEye />
          </button>
          <button onClick={() => handleEdit(story)} className="text-gray-600 hover:text-gray-900 transition-colors">
            <FaEdit />
          </button>
          <button onClick={() => handleDeleteClick(story)} className="text-gray-600 hover:text-red-600 transition-colors">
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="mx-auto space-y-6">
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <ReusableTable
          columns={columns}
          data={stories || []}
          onRowClick={handleView}
          loading={loading}
          emptyMessage="No stories found. Get started by creating your first story."
          idKey="_id"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <CommonModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Story"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 border border-red-100 rounded">
            <p className="text-sm text-red-800 font-poppins">
              Are you sure you want to delete <span className="font-bold">"{storyToDelete?.title}"</span>? This action cannot be undone and will remove the story from public view.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-poppins text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-poppins text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              {deleteLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <FaTrash className="text-xs" />
              )}
              Delete Story
            </button>
          </div>
        </div>
      </CommonModal>

      {/* View Modal */}
      <CommonModal
        isOpen={!!viewStory}
        onClose={() => setViewStory(null)}
        title="Story Preview"
      >
        {viewStory && (
          <div className="space-y-4">
            <StoryCard
              title={viewStory.title}
              description={viewStory.description}
              status={viewStory.status}
              storyImage={viewStory.cover_image}
              items={viewStory.items}
            />
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setViewStory(null)}
                className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-black transition-colors font-poppins text-sm font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* Edit Modal */}
      {editStory && (
        <StoryFormModal
          story={editStory}
          onClose={() => setEditStory(null)}
          onSaved={() => {
            setEditStory(null);
            fetchStories();
          }}
        />
      )}
    </div>
  );
}