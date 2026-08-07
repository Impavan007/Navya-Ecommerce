'use client';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export default function BulkActionsBar({ selectedCount, onClearSelection }: BulkActionsBarProps) {
  const handleExportSelected = () => {
  };

  const handleBulkReview = () => {
  };

  const handleBulkEscalate = () => {
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-3 py-3 font-poppins">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-800 font-poppins">
            {selectedCount} dispute{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-poppins"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportSelected}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-transparent border border-[#3D1126] hover:bg-gray-50 transition-colors font-poppins"
          >
            <i className="ri-download-line w-4 h-4 flex items-center justify-center mr-1.5 inline-block"></i>
            Export
          </button>

          <button
            onClick={handleBulkReview}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors font-poppins"
          >
            <i className="ri-eye-line w-4 h-4 flex items-center justify-center mr-1.5 inline-block"></i>
            Bulk Review
          </button>

          <button
            onClick={handleBulkEscalate}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-800  hover:bg-gray-900 transition-colors font-poppins"
          >
            <i className="ri-arrow-up-line w-4 h-4 flex items-center justify-center mr-1.5 inline-block"></i>
            Escalate Selected
          </button>
        </div>
      </div>
    </div>
  );
}