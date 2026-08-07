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

interface EscalateModalProps {
  conversation: Conversation | undefined;
  onClose: () => void;
}

export default function EscalateModal({ conversation, onClose }: EscalateModalProps) {
  const [disputeReason, setDisputeReason] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!conversation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    onClose();
  };

  const disputeReasons = [
    'Item not returned', 'Item damaged', 'Late return', 'Payment dispute',
    'Communication breakdown', 'Terms violation', 'Other'
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Escalate to Dispute" size="md" loading={isSubmitting}>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50">
            <div className="flex -space-x-2">
              <img src={conversation.borrower.avatar} alt={conversation.borrower.name} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src={conversation.lender.avatar} alt={conversation.lender.name} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{conversation.borrower.name} ↔ {conversation.lender.name}</p>
              <p className="text-sm text-gray-500">Order {conversation.orderId}</p>
              <p className="text-xs text-gray-400 mt-1">Conversation {conversation.id}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dispute reason</label>
          <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} required className="w-full px-3 py-2 pr-8 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent">
            <option value="">Select a reason</option>
            {disputeReasons.map((reason) => (<option key={reason} value={reason}>{reason}</option>))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority level</label>
          <div className="flex space-x-3">
            {priorityLevels.map((level) => (
              <label key={level.value} className="flex items-center">
                <input type="radio" value={level.value} checked={priority === level.value} onChange={(e) => setPriority(e.target.value)} className="mr-2" />
                <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required placeholder="Provide details about the issue that requires escalation..." className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent resize-none" />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 flex items-center justify-center mt-0.5">
              <i className="ri-information-line text-yellow-600"></i>
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Escalation Process</h4>
              <p className="text-sm text-yellow-700">This will create a new dispute case and notify both parties. The conversation will be flagged and moved to the disputes management system.</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">Cancel</button>
          <button type="submit" disabled={isSubmitting || !disputeReason || !description} className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 transition-colors whitespace-nowrap">
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2"><CommonLoader size="sm" color="white" /><span>Creating Dispute...</span></div>
            ) : ('Create Dispute')}
          </button>
        </div>
      </form>
    </CommonModal>
  );
}