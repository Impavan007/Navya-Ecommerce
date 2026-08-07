'use client';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({ selectedCount, onBulkAction, onClearSelection }: BulkActionsBarProps) {
  return (
    <div className="bg-gray-100 border border-gray-300  p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold font-poppins">{selectedCount}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 font-poppins">
              {selectedCount} transaction{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-600 hover:text-gray-800 underline font-poppins"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onBulkAction('export')}
            className="px-4 py-2 bg-gray-800 text-white  font-medium hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
          >
            Export Selected
          </button>
          <button
            onClick={() => onBulkAction('reconcile')}
            className="px-4 py-2 border border-gray-600 text-black font-medium hover:text-white hover:bg-black transition-colors whitespace-nowrap font-poppins"
          >
            Mark as Reconciled
          </button>
          <button
            onClick={() => onBulkAction('retry')}
            className="px-4 py-2 border border-red-600 text-red-600  font-medium hover:bg-red-50 transition-colors whitespace-nowrap font-poppins"
          >
            Retry Failed
          </button>
        </div>
      </div>
    </div>
  );
}