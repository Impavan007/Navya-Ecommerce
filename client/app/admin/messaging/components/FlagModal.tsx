'use client';

import { useState } from 'react';
import CommonLoader from '../../../components/common/CommonLoader';
import CommonModal from '../../../components/common/CommonModal';

interface Conversation {
  id: string;
  borrower: { name: string; avatar: string };
  lender: { name: string; avatar: string };
  orderId: string;
  flagged: boolean;
}

interface FlagModalProps {
  conversation: Conversation | undefined;
  onClose: () => void;
}

export default function FlagModal({ conversation, onClose }: FlagModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!conversation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    onClose();
  };

  const flagReasons = [
    'Inappropriate language', 'Harassment or abuse', 'Spam or promotional content',
    'Fraudulent activity', 'Violation of terms', 'Other'
  ];

  return (
    <CommonModal isOpen={true} onClose={onClose} title={conversation.flagged ? 'Unflag Conversation' : 'Flag Conversation'} size="sm" loading={isSubmitting}>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-50">
            <div className="flex -space-x-2">
              <img src={conversation.borrower.avatar} alt={conversation.borrower.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              <img src={conversation.lender.avatar} alt={conversation.lender.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{conversation.borrower.name} ↔ {conversation.lender.name}</p>
              <p className="text-sm text-gray-500">Order {conversation.orderId}</p>
            </div>
          </div>
        </div>

        {!conversation.flagged && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for flagging</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} required className="w-full px-3 py-2 pr-8 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent">
                <option value="">Select a reason</option>
                {flagReasons.map((flagReason) => (<option key={flagReason} value={flagReason}>{flagReason}</option>))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Provide additional context or details..." className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent resize-none" />
            </div>
          </>
        )}

        {conversation.flagged && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Are you sure you want to remove the flag from this conversation? This will mark it as resolved.</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">Cancel</button>
          <button type="submit" disabled={isSubmitting || (!conversation.flagged && !reason)} className={`flex-1 px-4 py-2 transition-colors whitespace-nowrap ${conversation.flagged ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400' : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'}`}>
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2"><CommonLoader size="sm" color="white" /><span>Processing...</span></div>
            ) : (conversation.flagged ? 'Remove Flag' : 'Flag Conversation')}
          </button>
        </div>
      </form>
    </CommonModal>
  );
}