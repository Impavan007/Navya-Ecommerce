'use client';

import React from 'react';
import ItemUploadCriteria from './ListingUploadCriteria';
import CommonModal from '@/app/components/common/CommonModal';

interface InfoModalProps {
  onClose: () => void;
  content: React.ReactNode;
}

export default function InfoModal({ onClose, content }: InfoModalProps) {
  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Listing Information"
      size="md"
    >
      <div className="relative">
        {content}
      </div>
    </CommonModal>
  );
}
