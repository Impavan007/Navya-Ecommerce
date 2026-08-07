'use client';

import { useState } from 'react';
import { Dispute } from '@/app/lender/disputes/page';
import CommonModal from '@/app/components/common/CommonModal';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

const AvatarCircle = ({
  name,
  src,
  size = 'h-12 w-12',
  textSize = 'text-base',
  className = '',
}: {
  name?: string;
  src?: string | null;
  size?: string;
  textSize?: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

interface DisputeDetailModalProps {
  dispute: Dispute | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DisputeDetailModal({ dispute, isOpen, onClose }: DisputeDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newEvidence, setNewEvidence] = useState<File[]>([]);
  const [vendorResponse, setVendorResponse] = useState('');
  const [showUploadZone, setShowUploadZone] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges = {
      'open': 'bg-red-100 text-red-800',
      'in-review': 'bg-amber-100 text-amber-800',
      'resolved': 'bg-[#F3D6DC] text-green-800'
    };

    const labels = {
      'open': 'Open',
      'in-review': 'In Review',
      'resolved': 'Resolved'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setNewEvidence(Array.from(files));
    }
  };

  const submitEvidence = () => {
    setNewEvidence([]);
    setVendorResponse('');
    setShowUploadZone(false);
  };

  const escalateDispute = () => {
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-file-text-line' },
    { id: 'evidence', label: 'Evidence', icon: 'ri-folder-line' },
    { id: 'timeline', label: 'Timeline', icon: 'ri-time-line' },
    { id: 'financial', label: 'Financial', icon: 'ri-money-euro-circle-line' }
  ];

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispute Details"
      size="lg"
    >
      {!dispute ? null : (
        <div className="space-y-6">
          {/* Header-like Info */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{dispute.id}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-600">Order #{dispute.orderId}</span>
            <span className="text-sm text-gray-400">•</span>
            {getStatusBadge(dispute.status)}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${activeTab === tab.id
                      ? 'border-yellow-600 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <i className={`${tab.icon} w-4 h-4 flex items-center justify-center`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Dispute Summary */}
                <div className="bg-gray-50 p-4">
                  <h3 className="font-serif text-lg text-gray-900 mb-3">Dispute Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Reason</div>
                      <div className="font-medium text-gray-900">{dispute.reason}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Date Opened</div>
                      <div className="font-medium text-gray-900">{formatDate(dispute.dateOpened)}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600">Description</div>
                    <div className="text-gray-900 mt-1">{dispute.description}</div>
                  </div>
                </div>

                {/* Item & Borrower Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Rental Item</h4>
                    <div className="flex items-center space-x-3">
                      <img
                        className="h-16 w-16 object-cover object-top"
                        src={dispute.item.image}
                        alt={dispute.item.title}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{dispute.item.title}</div>
                        <div className="text-sm text-gray-600">{dispute.item.category}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Borrower</h4>
                    <div className="flex items-center space-x-3">
                      <AvatarCircle
                        name={dispute.borrower.name}
                        src={dispute.borrower.avatar}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{dispute.borrower.name}</div>
                        <div className="text-sm text-gray-600">{dispute.borrower.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* admin Notes */}
                {dispute.adminNotes && (
                  <div className="bg-blue-50 border border-blue-200 p-4">
                    <h4 className="font-medium text-blue-900 mb-2">admin Notes</h4>
                    <p className="text-blue-800">{dispute.adminNotes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="space-y-6">
                {/* Vendor Evidence */}
                <div>
                  <h3 className="font-serif text-lg text-gray-900 mb-4">Your Evidence</h3>
                  {dispute.evidence.vendor.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {dispute.evidence.vendor.map((item, index) => (
                        <div key={index} className="border border-gray-200 p-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {item.type === 'image' ? (
                                <i className="ri-image-line text-blue-600 w-8 h-8 flex items-center justify-center"></i>
                              ) : (
                                <i className="ri-file-text-line text-red-600 w-8 h-8 flex items-center justify-center"></i>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                              <div className="text-sm text-gray-500">Uploaded {formatDate(item.uploadedAt)}</div>
                            </div>
                            <button className="text-yellow-600 hover:text-yellow-700 cursor-pointer whitespace-nowrap">
                              <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300">
                      <i className="ri-folder-open-line text-gray-400 text-3xl w-12 h-12 flex items-center justify-center mx-auto mb-2"></i>
                      <p className="text-gray-600">No evidence uploaded yet</p>
                    </div>
                  )}

                  {/* Upload New Evidence */}
                  {dispute.status !== 'resolved' && (
                    <div>
                      {!showUploadZone ? (
                        <button
                          onClick={() => setShowUploadZone(true)}
                          className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-upload-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                          Upload Evidence
                        </button>
                      ) : (
                        <div className="border border-gray-300 p-4 space-y-4">
                          <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                            <input
                              type="file"
                              multiple
                              accept="image/*,.pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload(e.target.files)}
                              className="hidden"
                              id="evidence-upload"
                            />
                            <label htmlFor="evidence-upload" className="cursor-pointer">
                              <i className="ri-upload-cloud-line text-gray-400 text-3xl w-12 h-12 flex items-center justify-center mx-auto mb-2"></i>
                              <p className="text-gray-600">Click to upload or drag and drop</p>
                              <p className="text-sm text-gray-500">Images, PDFs, or documents</p>
                            </label>
                          </div>

                          <textarea
                            value={vendorResponse}
                            onChange={(e) => setVendorResponse(e.target.value)}
                            placeholder="Add your response or explanation..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />

                          <div className="flex space-x-3">
                            <button
                              onClick={submitEvidence}
                              className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 cursor-pointer whitespace-nowrap"
                            >
                              Submit Evidence
                            </button>
                            <button
                              onClick={() => setShowUploadZone(false)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Borrower Evidence */}
                <div>
                  <h3 className="font-serif text-lg text-gray-900 mb-4">Borrower Evidence</h3>
                  {dispute.evidence.borrower.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dispute.evidence.borrower.map((item, index) => (
                        <div key={index} className="border border-gray-200 p-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {item.type === 'image' ? (
                                <i className="ri-image-line text-blue-600 w-8 h-8 flex items-center justify-center"></i>
                              ) : (
                                <i className="ri-file-text-line text-red-600 w-8 h-8 flex items-center justify-center"></i>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                              <div className="text-sm text-gray-500">Uploaded {formatDate(item.uploadedAt)}</div>
                            </div>
                            <button className="text-yellow-600 hover:text-yellow-700 cursor-pointer whitespace-nowrap">
                              <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300">
                      <i className="ri-folder-open-line text-gray-400 text-3xl w-12 h-12 flex items-center justify-center mx-auto mb-2"></i>
                      <p className="text-gray-600">No evidence submitted by borrower</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg text-gray-900 mb-6">Dispute Timeline</h3>
                <div className="space-y-6">
                  {dispute.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{event.stage}</h4>
                          <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <p className="text-xs text-gray-500 mt-1">by {event.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg text-gray-900 mb-4">Financial Impact</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Original Amounts</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rental Price</span>
                        <span className="font-medium">Rs.{dispute.financialImpact.rentalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deposit Held</span>
                        <span className="font-medium">Rs.{dispute.financialImpact.depositHeld}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Resolution Impact</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund to Borrower</span>
                        <span className="font-medium">Rs.{dispute.financialImpact.refundAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payout Adjustment</span>
                        <span className={`font-medium ${dispute.financialImpact.payoutAdjustment < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {dispute.financialImpact.payoutAdjustment < 0 ? '-' : '+'}Rs.{Math.abs(dispute.financialImpact.payoutAdjustment)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Final Outcome</h4>
                  <p className="text-yellow-800">
                    {dispute.status === 'resolved'
                      ? `This dispute has been resolved. Your payout was adjusted by Rs.${Math.abs(dispute.financialImpact.payoutAdjustment)}.`
                      : 'This dispute is still being reviewed. Final financial impact will be determined upon resolution.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {dispute.status !== 'resolved' && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex space-x-3">
                  <button
                    onClick={escalateDispute}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-alert-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                    Escalate Dispute
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </CommonModal>
  );
}
