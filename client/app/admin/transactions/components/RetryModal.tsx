'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';

interface RetryModalProps {
  transaction: any;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RetryModal({ transaction, onClose, onConfirm }: RetryModalProps) {
  const [retryMethod, setRetryMethod] = useState('same-card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRetry = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onConfirm();
  };

  return (
    <CommonModal isOpen={true} onClose={onClose} title="Retry Transaction" size="sm" loading={isProcessing}>
      {/* Transaction Info */}
      <div className="bg-gray-50 p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-sm font-semibold text-gray-800 font-poppins">{transaction?.id}</span>
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-300 font-poppins">Failed</span>
        </div>
        <div className="text-sm text-gray-600 font-playfair">
          <p>Amount: <span className="font-poppins font-semibold text-gray-900">Rs.{transaction?.amount.toFixed(2)}</span></p>
          <p>Reason: Card declined - insufficient funds</p>
        </div>
      </div>

      {/* Retry Options */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 font-poppins">Retry Method</h3>
        <div className="space-y-3">
          {[
            { value: 'same-card', label: 'Retry with same payment method', desc: '•••• •••• •••• 4242' },
            { value: 'new-card', label: 'Request new payment method', desc: 'Send email to customer for new card' },
            { value: 'manual', label: 'Manual processing', desc: 'Process payment manually via admin panel' }
          ].map(opt => (
            <label key={opt.value} className="flex items-center space-x-3 cursor-pointer">
              <input type="radio" name="retryMethod" value={opt.value} checked={retryMethod === opt.value} onChange={(e) => setRetryMethod(e.target.value)} className="text-gray-800 focus:ring-gray-800" />
              <div>
                <p className="font-medium text-gray-900 font-poppins">{opt.label}</p>
                <p className="text-sm text-gray-500 font-playfair">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="bg-gray-100 border border-gray-300 p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 flex items-center justify-center"><i className="ri-alert-line text-gray-700"></i></div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 font-poppins">Important</p>
            <p className="text-gray-700 mt-1 font-playfair">
              {retryMethod === 'same-card' && 'The same payment method that failed will be charged again. Ensure the issue has been resolved.'}
              {retryMethod === 'new-card' && 'An email will be sent to the customer requesting a new payment method.'}
              {retryMethod === 'manual' && 'This will mark the transaction as manually processed. Ensure payment has been received through alternative means.'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap font-poppins">Cancel</button>
        <button onClick={handleRetry} disabled={isProcessing} className="flex-1 bg-red-600 text-white px-4 py-3 font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-poppins">
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Processing...</span></div>
          ) : ('Retry Transaction')}
        </button>
      </div>
    </CommonModal>
  );
}