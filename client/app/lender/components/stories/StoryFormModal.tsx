"use client";

import React, { useState, useEffect } from 'react';
import useStoryManagementStore from '../../stores/Story/storyManagementStore';
import { toast } from 'react-hot-toast';
import CommonModal from '../../../components/common/CommonModal';

type Story = any;

export default function StoryFormModal({ story, onClose, onSaved }: { story: Story | null; onClose: () => void; onSaved?: (updated: any) => void }) {
  const [title, setTitle] = useState(story?.title ?? '');
  const [description, setDescription] = useState(story?.description ?? '');
  const [status, setStatus] = useState(story?.status ?? 'Active');
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setTitle(story?.title ?? '');
    setDescription(story?.description ?? '');
    setStatus(story?.status ?? 'Active');
    setNewCoverFile(null);
    setPreviewUrl(null);
  }, [story]);

  const updateStory = useStoryManagementStore((s: any) => s.updateStory);
  const updateLoading = useStoryManagementStore((s: any) => s.updateLoading);
  const updateError = useStoryManagementStore((s: any) => s.updateError);

  const handleSave = async () => {
    if (!story) return;
    try {
      // Extract only product IDs from items
      const itemIds = (story.items ?? []).map((it: any) => it?.product?._id || it?._id).filter(Boolean);

      let payload: any;

      if (newCoverFile) {
        const fd = new FormData();
        fd.append('title', title);
        fd.append('description', description);

        fd.append('items', JSON.stringify(itemIds)); // ✅ only send product IDs
        fd.append('storyImage', newCoverFile as Blob);
        payload = fd;
      } else {
        payload = {
          title,
          description,
          status,
          items: itemIds // ✅ only IDs now
        };
      }

      const res = await updateStory(story._id || story.id, payload);
      if (res.status === 201) {
        if (onSaved) onSaved(res);
        toast.success('Story updated successfully');
        onClose();
      } else {
        toast.error(res.message);
        onClose();
      }

    } catch (err) {
      console.error('Failed to update story', err);
      toast.error('Failed to update story');
    }
  };

  if (!story) return null;

  return (
    <CommonModal
      isOpen={!!story}
      onClose={onClose}
      title="Edit Story"
      size="md"
    >
      <div className="font-poppins">
        <div className="space-y-4">
          {/* cover image preview + upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div className="flex items-start space-x-4">
              <div className="w-1/2">
                <div className="w-full bg-gray-100  overflow-hidden">
                  <img src={previewUrl ?? story.cover_image ?? ''} alt={story.title || 'cover'} className="w-full h-40 object-cover" />
                </div>
              </div>
              <div className="w-1/2">
                <p className="text-sm text-gray-600">Upload a new cover image to replace the existing one.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setNewCoverFile(f);
                    if (f) setPreviewUrl(URL.createObjectURL(f));
                  }}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* items thumbnails */}
          {story.items && story.items.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
              <div className="flex space-x-3 overflow-x-auto">
                {story.items.map((it: any, idx: number) => (
                  <div key={idx} className="w-24">
                    <div className="h-20 w-24 bg-gray-100  overflow-hidden">
                      <img src={it?.product?.cover_image || it?.product?.images?.[0] || ''} alt={it?.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-gray-700 mt-1 truncate">{it?.product?.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full border px-3 py-2" />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            
          </div> */}

          {updateError && (
            <div className="text-sm text-red-600">{updateError}</div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-white border rounded">Cancel</button>
          <button onClick={handleSave} disabled={updateLoading} className="px-4 py-2 bg-gray-600 text-white rounded flex items-center space-x-2">
            {updateLoading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            )}
            <span>{updateLoading ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </CommonModal>
  );
}