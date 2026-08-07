'use client';

interface BulkActionsBarProps {
  selectedCount: number;
  onApproveSelected: () => void;
  onExportSelected: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onApproveSelected,
  onExportSelected,
  onClearSelection
}: BulkActionsBarProps) {
  return (
    <div className="bg-white border border-gray-200  p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center border border-gray-300">
              <div className="w-3 h-3 text-gray-700 flex items-center justify-center">
                <i className="ri-check-line"></i>
              </div>
            </div>
            <span className="font-medium text-gray-900 font-poppins">
              {selectedCount} payout{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium font-poppins"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onApproveSelected}
            className="px-4 py-2 bg-gray-800 text-white  text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-check-line"></i>
              </div>
              <span>Approve Selected</span>
            </div>
          </button>
          
          <button
            onClick={onExportSelected}
            className="px-4 py-2 border border-gray-300 text-gray-700  text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap font-poppins"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-download-line"></i>
              </div>
              <span>Export</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}