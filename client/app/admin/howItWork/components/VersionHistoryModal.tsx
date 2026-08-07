'use client';

import React, { useEffect } from 'react';
import CommonModal from '../../../components/common/CommonModal';
import { RiEyeLine, RiRestartLine } from 'react-icons/ri';
import useHowItWorksStore from '../../store/HowItWorks/HowItWorksStore';
import CommonLoader from '../../../components/common/CommonLoader';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewVersion: (version: any) => void;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  onViewVersion
}: VersionHistoryModalProps) {
  const { versions, isVersionsLoading, fetchVersions, restoreVersion } = useHowItWorksStore();

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, fetchVersions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Version History"
      size="lg"
    >
      <div className="-m-6 bg-gray-50 p-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
        <p className="text-[#6B7280] mb-8 font-poppins text-sm">
          All published versions are saved and can be restored if needed
        </p>

        {isVersionsLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <CommonLoader size="lg" color="gray" />
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((v, index) => {
              const isCurrent = v.is_current; 
              return (
                <div
                  key={v._id}
                  className={`p-6 rounded-2xl border ${isCurrent ? 'bg-[#FDF2F2] border-[#E3B8BF]' : 'bg-[#FFFFFFCC] border-[#E5E7EB]'} shadow-sm`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      {/* Version Circle */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold font-poppins text-sm ${isCurrent ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#FFFBEB] text-[#D97706]'}`}>
                        v{v.version}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 font-poppins">Version {v.version}</h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-gray-50 text-green-700 text-[10px] font-bold rounded-full uppercase">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] font-poppins">
                          {v.published_by?.email?.split('@')[0]} • {formatDate(v.published_at || v.created_at)}
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 ${v.status?.toLowerCase() === 'draft' || v.status?.toLowerCase() === 'drafted' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-green-700'} text-[10px] font-bold rounded-full uppercase`}>
                      {v.status || 'Published'}
                    </span>
                  </div>

                  <p className="text-sm text-[#4B5563] mb-6 font-poppins italic">
                    {v.headline?.trim() || "Manual published version update"}
                  </p>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => onViewVersion(v)}
                      className="flex items-center gap-2 px-6 py-2 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <RiEyeLine className="text-lg" />
                      View
                    </button>
                    {!isCurrent && (
                      <button
                        onClick={() => restoreVersion(v._id)}
                        className="flex items-center gap-2 px-6 py-2 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] rounded-lg text-sm font-medium hover:bg-[#FEF3C7] transition-colors"
                      >
                        <RiRestartLine className="text-lg" />
                        {(v.status?.toLowerCase() === 'draft' || v.status?.toLowerCase() === 'drafted') ? 'Publish' : 'Restore'}
                      </button>
                    )}
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
