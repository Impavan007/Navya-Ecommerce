'use client';

import { useState } from 'react';
import { Story, useStoriesStore } from '../../store/Stories/StoriesStore';
import CommonModal from '../../../components/common/CommonModal';

interface StoryItemsModalProps {
  story: Story;
  onClose: () => void;
}

export default function StoryItemsModal({ story, onClose }: StoryItemsModalProps) {
  const { updateStoryStatus } = useStoriesStore();
  const [loading, setLoading] = useState<'Approved' | 'Rejected' | null>(null);

  const handleAction = async (action: 'Approved' | 'Rejected') => {
    try {
      setLoading(action);
      await updateStoryStatus(story.id, action);
      onClose();
    } finally {
      setLoading(null);
    }
  };

  return (
    <CommonModal isOpen={true} onClose={onClose} title={story.title} size="lg">
      <div className="space-y-6">
        {/* STORY INFO */}
        <div className="flex items-start space-x-4">
          <img src={story.coverImage} alt={story.title} className="w-32 h-32 object-cover border border-gray-200" />
          <div className="w-full">
            <div className="flex items-center space-x-3">
              <img src={story.lender.profile_image} alt={story.lender.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
              <div className="font-poppins text-sm text-gray-900 break-words w-full">
                <div className="font-medium break-words">{story.lender.name}</div>
                <div className="text-xs text-gray-500 break-words">{story.lender.email}</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-700 font-poppins whitespace-pre-line break-words w-96">{story.description}</p>
          </div>
        </div>

        {/* ITEMS SECTION */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 font-playfair break-words w-full">Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {story.items.map((it, idx) => (
              <div key={idx} className="flex items-center space-x-4 border border-gray-200 p-3">
                <img src={it.product.cover_image} alt={it.product.name} className="w-20 h-20 object-cover" />
                <div className="font-poppins w-full">
                  <div className="text-sm font-medium text-gray-900 break-all w-full">{it.product.name}</div>
                  <div className="text-xs text-gray-500 break-words w-full">{it.product.brand}</div>
                  <div className="text-xs text-gray-700 break-words w-full">Rs.{it.product.rental_price_per_day} / day</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* APPROVE / REJECT BUTTONS */}
        {story.status.toLowerCase() === 'pending' && (
          <div className="flex items-center justify-end space-x-3">
            <button disabled={loading !== null} onClick={() => handleAction('Rejected')} className="px-4 py-2 text-sm border bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-poppins disabled:opacity-60">
              {loading === 'Rejected' ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : 'Reject'}
            </button>
            <button disabled={loading !== null} onClick={() => handleAction('Approved')} className="px-4 py-2 text-sm border border-gray-700 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-poppins disabled:opacity-60">
              {loading === 'Approved' ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : 'Approve'}
            </button>
          </div>
        )}
      </div>
    </CommonModal>
  );
}