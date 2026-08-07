'use client';

import { useState } from 'react';

export default function PaymentSettings() {
  const [stripeConnected, setStripeConnected] = useState(true);
  const [defaultMethod, setDefaultMethod] = useState('stripe');
  const [showBankForm, setShowBankForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const [bankDetails, setBankDetails] = useState({
    bankName: 'Barclays Bank',
    accountNumber: '****6819',
    iban: 'GB29NWBK60161331926819',
    swiftCode: 'BARCGB22'
  });

  const handleSavePayment = () => {
    setShowSuccess(true);
    setShowBankForm(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDisconnectStripe = () => {
    setStripeConnected(false);
    setShowDisconnectModal(false);
    if (defaultMethod === 'stripe') {
      setDefaultMethod('bank');
    }
  };

  const handleConnectStripe = () => {
    setStripeConnected(true);
    setDefaultMethod('stripe');
  };

  return (
    <div className="space-y-6 font-playfair">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200  p-4">
          <div className="flex items-center">
            <i className="ri-check-circle-line w-5 h-5 flex items-center justify-center text-green-600 mr-3"></i>
            <p className="text-green-800 font-poppins">Payment settings updated successfully!</p>
          </div>
        </div>
      )}

      
      {/* Bank Transfer Details */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-poppins text-xl font-semibold text-gray-900">Bank Transfer Details</h3>
            <p className="text-gray-600 mt-1">Alternative payout method for weekly transfers</p>
          </div>
          <button
            onClick={() => setShowBankForm(!showBankForm)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded font-poppins"
          >
            <i className={`${showBankForm ? 'ri-close-line' : 'ri-edit-line'} w-4 h-4 flex items-center justify-center`}></i>
            <span>{showBankForm ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {!showBankForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50  border border-gray-200">
                <p className="text-sm font-medium text-gray-700 font-poppins">Bank Name</p>
                <p className="text-gray-900 mt-1 font-poppins">{bankDetails.bankName}</p>
              </div>
              <div className="p-4 bg-gray-50  border border-gray-200">
                <p className="text-sm font-medium text-gray-700 font-poppins">Account Number</p>
                <p className="text-gray-900 mt-1 font-poppins">{bankDetails.accountNumber}</p>
              </div>
              <div className="p-4 bg-gray-50  border border-gray-200">
                <p className="text-sm font-medium text-gray-700 font-poppins">IBAN</p>
                <p className="text-gray-900 mt-1 font-poppins">{bankDetails.iban}</p>
              </div>
              <div className="p-4 bg-gray-50  border border-gray-200">
                <p className="text-sm font-medium text-gray-700 font-poppins">SWIFT Code</p>
                <p className="text-gray-900 mt-1 font-poppins">{bankDetails.swiftCode}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Bank Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors font-playfair"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors font-playfair"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">IBAN</label>
                <input
                  type="text"
                  value={bankDetails.iban}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, iban: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors font-playfair"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">SWIFT Code</label>
                <input
                  type="text"
                  value={bankDetails.swiftCode}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, swiftCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors font-playfair"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowBankForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800  hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

  
    </div>
  );
}