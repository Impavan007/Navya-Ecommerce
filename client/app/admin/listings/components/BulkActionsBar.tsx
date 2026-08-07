'use client';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: 'approve' | 'reject' | 'feature' | 'unfeature') => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({ selectedCount, onBulkAction, onClearSelection }: BulkActionsBarProps) {
  return (
    <div className="bg-gray-50 border border-gray-200  p-4 mb-6 flex items-center justify-between font-playfair">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-checkbox-circle-fill text-gray-800"></i>
          </div>
          <span className="font-medium text-gray-800 font-poppins">
            {selectedCount} listing{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onBulkAction('approve')}
            className="px-4 py-2 bg-gray-800 text-white  text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
          >
            Approve All
          </button>
          <button
            onClick={() => onBulkAction('reject')}
            className="px-4 py-2 bg-gray-200 text-gray-800  text-sm font-medium hover:bg-gray-300 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
          >
            Reject All
          </button>
          <button
            onClick={() => onBulkAction('feature')}
            className="px-4 py-2 bg-yellow-100 text-yellow-800  text-sm font-medium hover:bg-yellow-200 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 font-poppins"
          >
            Feature All
          </button>
          <button
            onClick={() => onBulkAction('unfeature')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-800  text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
          >
            Remove Feature
          </button>
        </div>
      </div>
      
      <button
        onClick={onClearSelection}
        className="text-gray-700 hover:text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded font-poppins"
      >
        Clear Selection
      </button>
    </div>
  );
}
