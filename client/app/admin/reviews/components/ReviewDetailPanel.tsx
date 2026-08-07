'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Review, useReviewStore } from '../../store/Reviews/Reviews';
import AdminNotesModal from './AdminNotesModal';

interface ReviewDetailPanelProps {
  review: Review;
  onClose: () => void;
}

export default function ReviewDetailPanel({ review, onClose }: ReviewDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const { updateReviewStatus } = useReviewStore();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, []);

  if (!mounted) return null;

  const handleApprove = async (id: string) => {
    await updateReviewStatus(id, 'approved');
  };

  const handleRejectSubmit = async () => {
    if (selectedReviewId) {
      await updateReviewStatus(selectedReviewId, 'removed', rejectReason);
      setRejectReason('');
      setSelectedReviewId(null);
      setIsRejectModalOpen(false);
    }
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectReason('');
    setSelectedReviewId(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700 border border-gray-300',
      approved: 'bg-gray-50 text-green-700 border border-green-300',
      removed: 'bg-red-100 text-red-700 border border-red-300',
      flagged: 'bg-yellow-100 text-yellow-700 border border-yellow-300'
    };

    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      removed: 'Removed',
      flagged: 'Flagged'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-poppins ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getReviewerTypeBadge = (type: string) => {
    return (
      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border font-poppins ${type === 'borrower'
        ? 'bg-blue-50 text-blue-600 border-blue-200'
        : 'bg-purple-50 text-purple-600 border-purple-200'
        }`}>
        {type === 'borrower' ? 'Renter' : 'Lender'}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i key={star} className={`ri-star-${star <= rating ? 'fill' : 'line'} ${star <= rating ? 'text-gray-800' : 'text-gray-300'
            } text-lg`}></i>
        ))}
        <span className="text-sm font-medium text-gray-900 ml-2 font-poppins">({rating})</span>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-file-text-line' },
    { id: 'audit', label: 'Audit Trail', icon: 'ri-time-line' }
  ];

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 z-[200] transition-opacity duration-300" onClick={onClose} />

      <div className="fixed right-0 inset-y-0 w-full max-w-xl bg-white shadow-2xl z-[201] flex flex-col transform transition-transform duration-300 animate-slide-in-right overflow-hidden font-poppins text-[#3D1126]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-canela uppercase tracking-tight">Review Details</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-medium text-gray-500 font-poppins uppercase tracking-wider opacity-75">{review.reviewId}</span>

              {getStatusBadge(review.status)}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded transition-colors">
            <i className="ri-close-line text-gray-500 text-lg"></i>
          </button>
        </div>

        {/* Tabs */}
        {/* <div className="flex border-b border-gray-200 flex-shrink-0 bg-gray-50 sticky top-0 z-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors font-poppins ${activeTab === tab.id
                  ? 'border-gray-800 text-gray-800 bg-[#E3C9C3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <i className={`${tab.icon} text-base`}></i>
              {tab.label}
            </button>
          ))}
        </div> */}

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Rating Card */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 font-poppins">Review Performance</h3>
                <div className="bg-white rounded border border-gray-200 shadow-sm p-4 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rating Score</p>
                    {renderStars(review.rating)}
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Review Comment</p>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-800 leading-relaxed italic">"{review.reviewText}"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Order */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 font-poppins">Related Order</h3>
                <div className="bg-white rounded border border-gray-200 shadow-sm p-4">

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center">
                      <i className="ri-shopping-bag-line text-[#904C5A]"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:underline">Order {review.orderId}</p>
                      <p className="text-xs text-gray-500">View order details</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 font-poppins">Parties Involved</h3>
                <div className="space-y-3">
                  {/* Author */}
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={review.reviewer.avatar} alt={review.reviewer.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.reviewer.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-mono uppercase">{review.reviewer.id}</span>
                          {getReviewerTypeBadge(review.reviewer.type)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Author</span>
                  </div>

                  {/* Recipient */}
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={review.recipient.avatar} alt={review.recipient.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.recipient.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-mono uppercase">{review.recipient.id}</span>
                          {getReviewerTypeBadge(review.recipient.type)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Subject</span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white rounded border border-gray-200 shadow-sm p-4 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</span>
                <span className="text-sm font-bold text-gray-900">{new Date(review.datePosted).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>

              {/* admin Notes */}
              {review.adminNotes && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 font-poppins">admin Notes</h3>
                    <button onClick={() => setShowNotesModal(true)} className="text-xs font-bold text-gray-600 hover:underline px-2 py-1">EDIT</button>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-[#904C5A] font-medium leading-relaxed italic">"{review.adminNotes}"</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-gray-900 font-poppins">Activity Timeline</h3>
              <div className="space-y-4">
                {review.auditTrail?.map((entry: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      {index < (review.auditTrail?.length || 0) - 1 && <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>}
                    </div>
                    <div className="flex-1 bg-white p-3 rounded border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                        <span className="text-[10px] text-gray-500 font-mono">{entry.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600">By: {entry.user}</p>
                      {entry.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded italic">"{entry.notes}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex flex-col gap-3">
            {review.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(review.id)}
                  className="flex-1 py-3 bg-gray-900 text-white hover:bg-black transition-all text-sm font-bold uppercase tracking-widest rounded-lg shadow-sm flex items-center justify-center font-poppins"
                >
                  <i className="ri-check-line mr-2"></i>
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedReviewId(review.id);
                    setIsRejectModalOpen(true);
                  }}
                  className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 transition-all text-sm font-bold uppercase tracking-widest rounded-lg shadow-sm flex items-center justify-center font-poppins"
                >
                  <i className="ri-close-line mr-2"></i>
                  Reject
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowNotesModal(true)}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-gray-900 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <i className="ri-edit-line mr-1 text-gray-400"></i>
                Internal Note
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 text-right"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="bg-white p-8 shadow-2xl w-full max-w-md rounded-2xl animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Reject Review</h2>
            <p className="text-sm text-gray-500 mb-6 font-poppins">
              Please provide a clear reason for rejecting this review. This decision should follow our community guidelines.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 focus:ring-2 focus:ring-gray-800 outline-none transition-all h-32 font-poppins"
              placeholder="Enter rejection reason..."
            ></textarea>
            <div className="mt-6 flex gap-4">
              <button
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-poppins"
                onClick={handleCloseRejectModal}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 shadow-md transition-colors font-poppins"
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim()}
              >
                Reject & Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotesModal && (
        <AdminNotesModal
          review={review}
          onClose={() => setShowNotesModal(false)}
          onSave={() => setShowNotesModal(false)}
        />
      )}
    </>,
    document.body
  );
}
