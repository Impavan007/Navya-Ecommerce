'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MappedDispute } from '../../store/DisputeStore/Disputestore';
import EvidenceModal from './EvidenceModal';
import useDisputeStore from '../../store/DisputeStore/Disputestore';
import DisputeChatPanel from './DisputeChatPanel';
import CommonLoader from '../../../components/common/CommonLoader';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

const AvatarCircle = ({
  name,
  image,
  size = 'w-8 h-8',
  textSize = 'text-xs',
  withBorder = true,
}: {
  name?: string;
  image?: string | null;
  size?: string;
  textSize?: string;
  withBorder?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${withBorder ? 'border border-gray-200' : ''}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${withBorder ? 'border border-gray-200' : ''}`}>
      {getInitials(name)}
    </div>
  );
};

interface DisputeDetailPanelProps {
  dispute: MappedDispute | null;
  onClose: () => void;
  onResolve: (dispute: MappedDispute) => void;
  loading?: boolean;
}

export default function DisputeDetailPanel({ dispute, onClose, onResolve, loading }: DisputeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const { markUnderReview } = useDisputeStore();
  // keep a local status so UI updates immediately
  const [currentStatus, setCurrentStatus] = useState(dispute?.status || 'open');
  const [updating, setUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (dispute?.status) {
      setCurrentStatus(dispute.status);
    }
  }, [dispute?.status]);

  if (!mounted) return null;

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-gray-100 text-gray-800 border border-gray-300',
      progress: 'bg-blue-100 text-blue-800 border border-blue-300',
      resolved: 'bg-[#F3D6DC] text-green-800 border border-green-300',
      escalated: 'bg-red-100 text-red-800 border border-red-300',
      rejected: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      closed: 'bg-purple-100 text-purple-800 border border-purple-300'
    };

    const labels = {
      open: 'Open',
      progress: 'Under Review',
      resolved: 'Resolved',
      escalated: 'Escalated',
      rejected: 'Rejected',
      closed: 'Closed'
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-poppins ${styles[status as keyof typeof styles]
          }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      damage: 'Damage',
      late_return: 'Late Return',
      not_returned: 'Not Returned',
      payment_issue: 'Payment Issue',
      other: 'Other',
      missing_parts: 'Missing Parts',
      wrong_item_delivered: 'Wrong Item Delivered'
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-file-text-line' },
    { id: 'messages', label: 'Messages', icon: 'ri-message-2-line' },
    { id: 'evidence', label: 'Evidence', icon: 'ri-image-line' },
    { id: 'timeline', label: 'Timeline', icon: 'ri-time-line' },
  ];
  
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[200] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed right-0 inset-y-0 w-full max-w-xl bg-white shadow-2xl z-[201] flex flex-col transform transition-transform duration-300 animate-slide-in-right overflow-hidden font-poppins">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#F3D6DC] flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-canela">{dispute?.support_slug_id}</h2>
            {dispute?.orderId && <p className="text-sm text-gray-500 font-poppins opacity-75">Order: {dispute.orderNumber}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded transition-colors"
          >
            <i className="ri-close-line text-gray-500 text-lg"></i>
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200 flex-shrink-0 bg-[#F3D6DC] sticky top-0 z-10">
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
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto bg-[#F3D6DC] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <CommonLoader size="lg" />
            </div>
          ) : !dispute ? (
            <div className="p-8 text-center text-gray-500">
              No dispute data available.
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6 p-6">
                  {/* Action buttons (Make Decision / Resolve) */}
                  {(() => {
                    const isActionable = currentStatus === 'open' || currentStatus === 'progress' || currentStatus === 'under_review';
                    if (!isActionable) return null;

                    return (
                      <div className="flex items-center justify-between">
                        {getStatusBadge(currentStatus)}
                        <button
                          onClick={() => onResolve(dispute)}
                          className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors font-poppins"
                        >
                          Make Decision
                        </button>
                      </div>
                    );
                  })()}

                  {/* If not actionable, still show the badge but no buttons */}
                  {!(currentStatus === 'open' || currentStatus === 'progress' || currentStatus === 'under_review') && (
                    <div className="flex items-center justify-between">
                      {getStatusBadge(currentStatus)}
                    </div>
                  )}

                  {/* Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 font-poppins">Dispute Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500 font-poppins">Reason:</span>
                        <span className="text-sm text-gray-900 ml-2 font-poppins">{getReasonLabel(dispute.reason)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 font-poppins">Date Opened:</span>
                        <span className="text-sm text-gray-900 ml-2 font-playfair">{formatDate(dispute.dateOpened)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 font-poppins">Description:</span>
                        <p className="text-sm text-gray-900 mt-1 font-playfair">{dispute.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Item Info */}
                  {dispute.orderId && dispute.item && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3 font-poppins">Item Details</h3>
                      <div className="flex items-center p-3 bg-white rounded border border-gray-200 shadow-sm">
                        <img
                          src={Array.isArray(dispute.item) ? dispute.item[0]?.image : (dispute.item as any)?.image}
                          alt={Array.isArray(dispute.item) ? dispute.item[0]?.name : (dispute.item as any)?.name}
                          className="w-16 h-16 rounded object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900 font-poppins">
                            {Array.isArray(dispute.item) ? dispute.item[0]?.name : (dispute.item as any)?.name}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 font-poppins">
                              Value: <span className="font-poppins font-semibold">Rs.{dispute.orderValue}</span>
                            </span>
                            <span className="text-sm text-gray-600 font-poppins">
                              Deposit: <span className="font-poppins font-semibold">Rs.{dispute.depositAmount}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Parties Involved */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 font-poppins">Parties Involved</h3>
                    <div className="space-y-3">
                      {dispute.borrower.name !== 'N/A' &&
                        <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                          <div className="flex items-center">
                            <AvatarCircle
                              name={dispute.borrower.name}
                              image={dispute.borrower.avatar}
                              size="w-8 h-8"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 font-poppins">{dispute.borrower.name}</p>
                              <p className="text-xs text-gray-500 font-playfair">Renter</p>
                            </div>
                          </div>
                        </div>}
                      {dispute.lender.name !== 'N/A' && <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                        <div className="flex items-center">
                          <AvatarCircle
                            name={dispute.lender.name}
                            image={dispute.lender.avatar}
                            size="w-8 h-8"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 font-poppins">{dispute.lender.name}</p>
                            <p className="text-xs text-gray-500 font-playfair">Lender</p>
                          </div>
                        </div>
                      </div>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="space-y-6 p-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 font-poppins">Renter Evidence</h3>
                    {dispute.evidence.borrower && dispute.evidence.borrower.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {dispute.evidence.borrower.map((evidence: any, index: number) => (
                          <div
                            key={index}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedEvidence(evidence)}
                          >
                            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                              {evidence.type === 'photo' ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="ri-image-line text-2xl text-gray-400"></i>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="ri-file-text-line text-2xl text-gray-400"></i>
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                              <i className="ri-zoom-in-line text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded border border-gray-200">
                        <i className="ri-inbox-line text-3xl text-gray-300 mb-2"></i>
                        <p className="text-sm text-gray-500 font-playfair">No evidence submitted by renter</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 font-poppins">Lender Evidence</h3>
                    {dispute.evidence.lender && dispute.evidence.lender.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {dispute.evidence.lender.map((evidence: any, index: number) => (
                          <div
                            key={index}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedEvidence(evidence)}
                          >
                            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                              {evidence.type === 'photo' ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="ri-image-line text-2xl text-gray-400"></i>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="ri-file-text-line text-2xl text-gray-400"></i>
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                              <i className="ri-zoom-in-line text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded border border-gray-200">
                        <i className="ri-inbox-line text-3xl text-gray-300 mb-2"></i>
                        <p className="text-sm text-gray-500 font-playfair">No evidence submitted by lender</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6 p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 font-poppins">Audit Trail</h3>
                  {dispute.auditTrail && dispute.auditTrail.length > 0 ? (
                    <div className="space-y-4">
                      {dispute.auditTrail.map((entry: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                            {index < dispute.auditTrail.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 font-poppins">{entry.action}</p>
                                <span className="text-xs text-gray-500 font-playfair">
                                  {formatDate(entry.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 font-playfair">By: {entry.user}</p>
                              {(entry.notes || entry.details) && (
                                <p className="text-sm text-gray-600 mt-2 font-playfair">{entry.notes || entry.details}</p>
                              )}

                              {(() => {
                                const proofUrl = typeof entry.proof === 'string' ? entry.proof : entry.proof && (entry.proof.url || entry.proof);
                                const proofTitle = entry.proof && typeof entry.proof === 'object' ? entry.proof.title || entry.action : undefined;
                                const proofUploadedBy = entry.proof && typeof entry.proof === 'object' ? entry.proof.uploadedBy || entry.proof.uploaded_by : undefined;
                                const proofUploadedAt = entry.proof && typeof entry.proof === 'object' ? entry.proof.uploadedAt || entry.proof.uploaded_at : undefined;

                                if (!proofUrl) return null;

                                return (
                                  <div className="mt-3 border rounded-md overflow-hidden w-full max-w-sm">
                                    <img
                                      src={proofUrl}
                                      alt={proofTitle || entry.action || 'proof image'}
                                      className="w-full h-auto object-cover"
                                      onError={(e) => { (e.currentTarget as any).style.display = 'none'; }}
                                    />
                                    <div className="p-2 bg-white">
                                      {proofTitle && <div className="text-xs font-medium text-gray-900">{proofTitle}</div>}
                                      {(proofUploadedBy || proofUploadedAt) && (
                                        <div className="text-xs text-gray-500">
                                          {proofUploadedBy && <span>{proofUploadedBy}</span>}
                                          {proofUploadedBy && proofUploadedAt && <span className="mx-1">•</span>}
                                          {proofUploadedAt && <span>{formatDate(proofUploadedAt)}</span>}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded border border-gray-200">
                      <i className="ri-time-line text-3xl text-gray-300 mb-2"></i>
                      <p className="text-sm text-gray-500 font-playfair">No timeline events available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <DisputeChatPanel dispute={dispute} />
              )}
            </>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {(() => {
          const isActionable = currentStatus === 'open' || currentStatus === 'progress' || currentStatus === 'under_review';
          if (!isActionable || !dispute) return null;

          return (
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex gap-3">
                {currentStatus === 'open' && (
                  <button
                    onClick={async () => {
                      if (updating || !dispute) return;
                      setUpdating(true);
                      try {
                        await markUnderReview(dispute.id);
                        setCurrentStatus('under_review');
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors font-poppins disabled:opacity-50"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Mark In-Progress'}
                  </button>
                )}
                <button
                  onClick={() => onResolve(dispute)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors font-poppins"
                >
                  Resolve Dispute
                </button>
              </div>
            </div>
          );
        })()}
      </div>

    </>,
    document.body
  );
}
