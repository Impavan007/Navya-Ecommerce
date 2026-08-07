'use client';

import { useState } from 'react';
import CommonLoader from '../../../components/common/CommonLoader';
import CommonModal from '../../../components/common/CommonModal';

interface Conversation {
  id: string;
  borrower: { name: string; avatar: string };
  lender: { name: string; avatar: string };
  orderId: string;
}

interface AdminNotesModalProps {
  conversation: Conversation | undefined;
  onClose: () => void;
}

interface adminNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  type: 'note' | 'warning' | 'action';
}

export default function AdminNotesModal({ conversation, onClose }: AdminNotesModalProps) {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'warning' | 'action'>('note');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<adminNote[]>([
    {
      id: '1',
      content: 'User reported communication issues. Monitoring conversation for resolution.',
      author: 'Emma Wilson',
      timestamp: '2 hours ago',
      type: 'note'
    },
    {
      id: '2',
      content: 'Previous late return history for this borrower. Watch for similar patterns.',
      author: 'James Chen',
      timestamp: '1 day ago',
      type: 'warning'
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const note: adminNote = {
      id: Date.now().toString(),
      content: newNote,
      author: 'Emma Wilson',
      timestamp: 'Just now',
      type: noteType
    };
    setNotes([note, ...notes]);
    setNewNote('');
    setIsSubmitting(false);
  };

  const noteTypeConfig = {
    note: { icon: 'ri-sticky-note-line', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    warning: { icon: 'ri-alert-line', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    action: { icon: 'ri-flag-line', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  };

  if (!conversation) return null;

  return (
    <CommonModal isOpen={true} onClose={onClose} title="admin Notes" size="md">
      <div className="flex items-center space-x-3 p-3 bg-gray-50 mb-6">
        <div className="flex -space-x-2">
          <img src={conversation.borrower.avatar} alt={conversation.borrower.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
          <img src={conversation.lender.avatar} alt={conversation.lender.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{conversation.borrower.name} ↔ {conversation.lender.name}</p>
          <p className="text-sm text-gray-500">Order {conversation.orderId} • Conversation {conversation.id}</p>
        </div>
      </div>

      {/* Add New Note */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Note type</label>
            <div className="flex space-x-4">
              {Object.entries(noteTypeConfig).map(([type, config]) => (
                <label key={type} className="flex items-center">
                  <input type="radio" value={type} checked={noteType === type} onChange={(e) => setNoteType(e.target.value as any)} className="mr-2" />
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 flex items-center justify-center ${config.color}`}><i className={config.icon}></i></div>
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add note</label>
            <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={3} placeholder="Add your admin note here..." className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent resize-none" />
          </div>
          <button type="submit" disabled={isSubmitting || !newNote.trim()} className="px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors whitespace-nowrap">
            {isSubmitting ? (
              <div className="flex items-center space-x-2"><CommonLoader size="sm" color="white" /><span>Adding...</span></div>
            ) : ('Add Note')}
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Notes</h3>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-sticky-note-line text-gray-400"></i>
            </div>
            <p className="text-gray-500">No admin notes yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const config = noteTypeConfig[note.type];
              return (
                <div key={note.id} className={`p-4 border ${config.bg} ${config.border}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-5 h-5 flex items-center justify-center mt-0.5 ${config.color}`}><i className={config.icon}></i></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 leading-relaxed">{note.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600">{note.author}</span>
                        <span className="text-xs text-gray-500">{note.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CommonModal>
  );
}