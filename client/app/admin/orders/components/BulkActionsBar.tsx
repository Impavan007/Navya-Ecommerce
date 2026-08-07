'use client';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({ selectedCount, onBulkAction, onClearSelection }: BulkActionsBarProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-checkbox-circle-fill text-gray-600"></i>
          </div>
          <span className="font-medium font-poppins text-gray-600">
            {selectedCount} order{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onBulkAction('mark-returned')}
            className="px-4  font-poppins py-2 border border-gray-400 text-black hover:text-white  text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            Mark as Returned
          </button>
          <button
            onClick={() => onBulkAction('refund')}
            className="px-4 font-poppins py-2 border border-gray-400 text-black hover:text-white text-sm font-medium hover:bg-orange-700 transition-colors whitespace-nowrap"
          >
            Process Refunds
          </button>
          <button
            onClick={() => onBulkAction('cancel')}
            className="px-4 font-poppins py-2 border border-gray-400 text-black hover:text-white text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            Cancel Orders
          </button>
          <button
            onClick={() => onBulkAction('export')}
            className="px-4 font-poppins py-2 border border-gray-400 text-black hover:text-white  text-sm font-medium hover:bg-black transition-colors whitespace-nowrap"
          >
            Export Selected
          </button>
        </div>
      </div>
      
      <button
        onClick={onClearSelection}
        className="text-gray-600 font-poppins hover:text-yellow-800 text-sm font-medium"
      >
        Clear Selection
      </button>
    </div>
  );
}