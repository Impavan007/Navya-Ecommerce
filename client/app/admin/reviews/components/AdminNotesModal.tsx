'use client';

import { useState } from 'react';
import { Review } from '../../store/Reviews/Reviews';
import CommonModal from '../../../components/common/CommonModal';

interface AdminNotesModalProps {
  review: Review;
  onClose: () => void;
  onSave: () => void;
}

export default function AdminNotesModal({ review, onClose, onSave }: AdminNotesModalProps) {
  const [notes, setNotes] = useState(review.adminNotes || '');
  const [noteType, setNoteType] = useState('note');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  const noteTypes = [
    { value: 'note', label: 'General Note', icon: 'ri-sticky-note-line' },
    { value: 'warning', label: 'Warning', icon: 'ri-alert-line' },
    { value: 'action', label: 'Action Taken', icon: 'ri-check-line' }
  ];

  return (
    <CommonModal isOpen={true} onClose={onClose} title="admin Notes" size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-900 mb-1">Review ID: {review.id}</div>
            <div className="text-sm text-gray-600">By {review.reviewer.name} for {review.recipient.name}</div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
          <div className="grid grid-cols-1 gap-2">
            {noteTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-3 p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="noteType" value={type.value} checked={noteType === type.value} onChange={(e) => setNoteType(e.target.value)} className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500" />
                <div className="w-5 h-5 flex items-center justify-center"><i className={`${type.icon} text-gray-600`}></i></div>
                <span className="text-sm font-medium text-gray-900">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes *</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes about this review..." rows={6} className="w-full px-3 py-2 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent resize-none" required />
          <div className="text-xs text-gray-500 mt-1">These notes are internal and will not be visible to users.</div>
        </div>

        <div className="flex space-x-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 transition-colors">Save Notes</button>
        </div>
      </form>
    </CommonModal>
  );
}