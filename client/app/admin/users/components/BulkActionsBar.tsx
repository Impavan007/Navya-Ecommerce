'use client';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkExport: () => void;
  onBulkActivate: () => void;
  onBulkReject: () => void;
  onBulkMakeTopLender: () => void;
  onBulkRemoveTopLender: () => void;
}

export default function BulkActionsBar({ 
  selectedCount, 
  onClearSelection, 
  onBulkExport, 
  onBulkActivate,
  onBulkReject,
  onBulkMakeTopLender,
  onBulkRemoveTopLender,
}: BulkActionsBarProps) {
  return (
    <div className="bg-gray-50 border border-gray-200  p-4 font-poppins">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-gray-700"></i>
            </div>
            <span className="font-medium text-gray-800 font-poppins">
              {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-poppins"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* <button
            onClick={onBulkExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700  text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-download-line"></i>
              </div>
              <span>Export Data</span>
            </div>
          </button> */}
          <button
            onClick={onBulkActivate}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700  text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-check-line"></i>
              </div>
              <span>Activate</span>
            </div>
          </button>
          <button
            onClick={onBulkReject}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700  text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-close-line"></i>
              </div>
              <span>Reject</span>
            </div>
          </button>
          <button
            onClick={onBulkMakeTopLender}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700  text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-star-smile-line"></i>
              </div>
              <span>Make Top Seller</span>
            </div>
          </button>
          <button
            onClick={onBulkRemoveTopLender}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700  text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-star-line"></i>
              </div>
              <span>Remove Top Seller</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
