'use client';

import CommonModal from '../../../components/common/CommonModal';

interface EvidenceModalProps {
  evidence: {
    type: 'photo' | 'receipt';
    url: string;
    description: string;
    uploadedAt: string;
  };
  onClose: () => void;
}

export default function EvidenceModal({ evidence, onClose }: EvidenceModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Evidence Details" size="md">
      <p className="text-sm text-gray-500 font-playfair -mt-2 mb-4">Uploaded {formatDate(evidence.uploadedAt)}</p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2 font-poppins">Description</h4>
        <p className="text-sm text-gray-600 font-playfair">{evidence.description}</p>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2 font-poppins">Type</h4>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-poppins ${evidence.type === 'photo'
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
          <i className={`${evidence.type === 'photo' ? 'ri-image-line' : 'ri-file-text-line'} w-3 h-3 flex items-center justify-center mr-1`}></i>
          {evidence.type === 'photo' ? 'Photo' : 'Receipt'}
        </span>
      </div>

      {/* Evidence Preview */}
      <div className="bg-gray-50 p-8 text-center border border-gray-200 mb-4">
        {evidence.type === 'photo' ? (
          <div>
            <div className="w-16 h-16 bg-gray-200 mx-auto mb-4 flex items-center justify-center">
              <i className="ri-image-line w-8 h-8 flex items-center justify-center text-gray-400"></i>
            </div>
            <p className="text-sm text-gray-500 mb-4 font-playfair">Photo evidence preview</p>
            <button className="px-4 py-2 bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors font-poppins">
              <i className="ri-external-link-line w-4 h-4 flex items-center justify-center mr-2 inline-block"></i>
              View Full Size
            </button>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-gray-200 mx-auto mb-4 flex items-center justify-center">
              <i className="ri-file-text-line w-8 h-8 flex items-center justify-center text-gray-400"></i>
            </div>
            <p className="text-sm text-gray-500 mb-4 font-playfair">Receipt document</p>
            <button className="px-4 py-2 bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors font-poppins">
              <i className="ri-download-line w-4 h-4 flex items-center justify-center mr-2 inline-block"></i>
              Download Receipt
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors font-poppins"
        >
          Close
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 transition-colors font-poppins">
          <i className="ri-flag-line w-4 h-4 flex items-center justify-center mr-2 inline-block"></i>
          Flag as Important
        </button>
      </div>
    </CommonModal>
  );
}