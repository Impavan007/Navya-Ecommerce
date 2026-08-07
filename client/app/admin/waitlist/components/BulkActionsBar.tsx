'use client';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({ selectedCount, onBulkAction, onClearSelection }: BulkActionsBarProps) {
  return (
    <div className="bg-[#F3D6DC] border border-[#F3D6DC] p-4 font-roboto rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <i className="ri-checkbox-multiple-line w-5 h-5 flex items-center justify-center text-gray-700 mr-2"></i>
          <span className="text-sm font-medium text-gray-800 font-roboto">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* <button
            onClick={() => onBulkAction('invite')}
            className="px-4 py-2 bg-gray-800 text-white  hover:bg-gray-900 transition-colors text-sm font-medium whitespace-nowrap font-poppins"
          >
            <i className="ri-mail-send-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
            Send Invites
          </button>
           */}
          <button
            onClick={() => onBulkAction('approve')}
            className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-black transition-colors text-sm font-medium whitespace-nowrap font-roboto rounded-lg shadow-sm"
          >
            <i className="ri-check-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
            Approve All
          </button>

          <button
            onClick={() => onBulkAction('reject')}
            className="px-4 py-2 border border-[#F3D6DC] text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap font-roboto rounded-lg shadow-sm"
          >
            <i className="ri-close-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
            Reject All
          </button>

          {/* <button
            onClick={() => onBulkAction('export')}
            className="px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap font-poppins"
          >
            <i className="ri-download-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
            Export
          </button> */}

          <button
            onClick={onClearSelection}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium whitespace-nowrap font-roboto hover:underline"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
}