'use client';

import { useState } from 'react';
import useProfileStore from '../../stores/Profile/profileStore';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import CommonLoader from '@/app/components/common/CommonLoader';

export default function PaymentSettings() {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [defaultMethod, setDefaultMethod] = useState('stripe');
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const { createStripeAccountLink, stripeOnboardingLoading } = useProfileStore();
  const { stripeAccount, stripeAccountLoading, fetchStripeAccountDetails } = useProfileStore();

  const [bankDetails, setBankDetails] = useState({
    bankName: 'Barclays Bank',
    accountNumber: '****6819',
    iban: 'GB29NWBK60161331926819',
    swiftCode: 'BARCGB22'
  });

  const handleSavePayment = () => {
    setShowBankForm(false);
    toast.success('Payment settings updated successfully!');
  };

  const handleDisconnectStripe = () => {
    setStripeConnected(false);
    setShowDisconnectModal(false);
    if (defaultMethod === 'stripe') {
      setDefaultMethod('bank');
    }
  };

  const handleConnectStripe = () => {
    // Start local optimistic connect when user already has a connected account
    setStripeConnected(true);
    setDefaultMethod('stripe');
  };

  const handleConnectStripeClick = async () => {
    try {
      const url = await createStripeAccountLink();
      if (url) {
        // Redirect user to Stripe onboarding/setup URL returned from backend
        window.location.href = url;
      } else {
        toast.error('Unable to create Stripe account link. Please try again.');
      }
    } catch (err: any) {
      console.error('Stripe onboarding error', err);
      toast.error(err?.message || 'Failed to start Stripe onboarding');
    }
  };

  useEffect(() => {
    // Fetch stripe account details when component mounts
    fetchStripeAccountDetails();
  }, []);

  return (
    <div className="space-y-6 font-playfair">
      {/* Stripe Connect */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-poppins text-xl font-semibold text-gray-900">Stripe</h3>
            <p className="text-gray-600 mt-1">Connect your Stripe account to receive payouts directly.</p>
          </div>
          <div>
            {stripeConnected ? (
              <button
                onClick={() => setShowDisconnectModal(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer rounded font-poppins"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectStripeClick}
                disabled={stripeOnboardingLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors cursor-pointer  font-poppins"
              >
                {stripeOnboardingLoading ? 'Connecting...' : 'Connect Your Payment Details'}
              </button>
            )}
          </div>
        </div>
        {/* Stripe Account Summary */}
        <div className="mt-4">
          {stripeAccountLoading ? (
            <CommonLoader />
          ) : stripeAccount ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 font-poppins">Account ID</p>
                <p className="text-gray-900 mt-1 font-poppins">{stripeAccount.accountId}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 font-poppins">Charges Enabled</p>
                <p className="text-gray-900 mt-1 font-poppins">{stripeAccount.chargesEnabled ? 'Yes' : 'No'}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 font-poppins">Payouts Enabled</p>
                <p className="text-gray-900 mt-1 font-poppins">{stripeAccount.payoutsEnabled ? 'Yes' : 'No'}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 font-poppins">Details Submitted</p>
                <p className="text-gray-900 mt-1 font-poppins">{stripeAccount.detailsSubmitted ? 'Yes' : 'No'}</p>
              </div>

              <div className="p-4 bg-white border border-gray-200 md:col-span-2">
                <p className="text-sm font-medium text-gray-700 font-poppins">Requirements Due ({stripeAccount.requirementsDue.length})</p>
                {stripeAccount.requirementsDue.length === 0 ? (
                  <p className="text-gray-500 mt-1 font-poppins">None</p>
                ) : (
                  <ul className="mt-2 list-disc list-inside text-sm text-red-600 font-poppins space-y-1">
                    {stripeAccount.requirementsDue.map((r) => (
                      <li key={r} className="text-sm text-red-600">{r}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-white border border-gray-200 md:col-span-2">
                <p className="text-sm font-medium text-gray-700 font-poppins">Requirements Errors ({stripeAccount.requirementsErrors.length})</p>
                {stripeAccount.requirementsErrors.length === 0 ? (
                  <p className="text-gray-500 mt-1 font-poppins">None</p>
                ) : (
                  <ul className="mt-2 list-disc list-inside text-sm text-red-600 font-poppins space-y-1">
                    {stripeAccount.requirementsErrors.map((r) => (
                      <li key={r} className="text-sm">{r}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3">
                <button
                  onClick={fetchStripeAccountDetails}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer rounded font-poppins"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 font-poppins">No Stripe account connected.</p>
          )}
        </div>
      </div>


      {/* Bank Transfer Details */}
      {/* <div className="bg-white  shadow-sm border border-gray-200 p-6">
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
      </div> */}


    </div>
  );
}