'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function GDPRTools() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [exportRequested, setExportRequested] = useState(false);

  const pendingRequests = [
    {
      id: 'EXP-2025-001',
      type: 'Data Export',
      requestDate: 'Sept 28, 2025',
      status: 'Processing',
      estimatedCompletion: 'Oct 5, 2025'
    }
  ];

  const handleDataExport = () => {
    setExportRequested(true);
    setShowExportModal(false);
    toast.success('Data export request submitted successfully!');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE') {
      setShowDeleteModal(false);
      toast.success('Account deletion request submitted. This will take 30 days to process.');
    }
  };

  return (
    <div className="space-y-6 font-playfair">

      {/* Data Export */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-poppins text-xl font-semibold text-gray-900">Data Export</h3>
            <p className="text-gray-600 mt-1">Download a copy of all your personal data and activity</p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800  hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
          >
            Request Export
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50  border border-blue-200">
            <div className="flex items-start space-x-3">
              <i className="ri-information-line w-5 h-5 flex items-center justify-center text-blue-600 mt-0.5"></i>
              <div>
                <p className="text-sm text-blue-800 font-medium font-poppins">What's included in your data export:</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Profile information and account settings</li>
                  <li>• Listing details and photos</li>
                  <li>• Order history and transaction records</li>
                  <li>• Messages and communication history</li>
                  <li>• Reviews and ratings received</li>
                  <li>• Support tickets and correspondence</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 ">
              <div className="flex items-center space-x-3">
                <i className="ri-file-text-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
                <div>
                  <p className="font-medium text-gray-900 font-poppins">JSON Format</p>
                  <p className="text-sm text-gray-600">Machine-readable data</p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 ">
              <div className="flex items-center space-x-3">
                <i className="ri-time-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
                <div>
                  <p className="font-medium text-gray-900 font-poppins">7-14 Days</p>
                  <p className="text-sm text-gray-600">Processing time</p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 ">
              <div className="flex items-center space-x-3">
                <i className="ri-mail-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
                <div>
                  <p className="font-medium text-gray-900 font-poppins">Email Delivery</p>
                  <p className="text-sm text-gray-600">Secure download link</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white  shadow-sm border border-gray-200 p-6">
          <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-6">Pending Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 ">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100  flex items-center justify-center">
                    <i className="ri-download-line w-5 h-5 flex items-center justify-center text-gray-800"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 font-poppins">{request.type}</p>
                    <p className="text-sm text-gray-600">
                      Requested {request.requestDate} • ID: {request.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 font-poppins">
                    {request.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">Est. {request.estimatedCompletion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Portability */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-6">Data Portability</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            Under GDPR, you have the right to receive your personal data in a structured, commonly used format. 
            You can also request to transfer this data to another service.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 ">
              <h4 className="font-medium text-gray-900 mb-2 font-poppins">Your Rights Include:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Access to your personal data</li>
                <li>• Data portability and transfer</li>
                <li>• Correction of inaccurate data</li>
                <li>• Deletion of personal data</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 ">
              <h4 className="font-medium text-gray-900 mb-2 font-poppins">Processing Time:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Data export: 7-14 business days</li>
                <li>• Data correction: 1-3 business days</li>
                <li>• Account deletion: 30 days</li>
                <li>• Urgent requests: 72 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white  shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <i className="ri-error-warning-line w-6 h-6 flex items-center justify-center text-red-600"></i>
          <h3 className="font-poppins text-xl font-semibold text-red-900">Danger Zone</h3>
        </div>
        
        <div className="p-4 bg-red-50  border border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-red-900 font-poppins">Delete My Account</h4>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="mt-3">
                <p className="text-sm text-red-700 font-medium font-poppins">This will delete:</p>
                <ul className="text-sm text-red-700 mt-1 space-y-1">
                  <li>• Your profile and all personal information</li>
                  <li>• All listings and photos</li>
                  <li>• Order history and transaction records</li>
                  <li>• Messages and reviews</li>
                  <li>• Any pending payouts (will be processed first)</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600  hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 font-poppins"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Data Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-playfair">
          <div className="bg-white  max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <i className="ri-download-line w-6 h-6 flex items-center justify-center text-gray-800"></i>
              <h3 className="font-poppins text-lg font-semibold text-gray-900">Request Data Export</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                We'll prepare a complete export of your personal data and send you a secure download link via email within 7-14 business days.
              </p>
              <div className="p-3 bg-gray-50  border border-gray-200">
                <p className="text-sm text-gray-700 font-poppins">
                  <strong>Email:</strong> jane.doe@example.com
                </p>
              </div>
              <div className="p-3 bg-blue-50  border border-blue-200">
                <p className="text-sm text-blue-800">
                  The download link will be valid for 30 days and can only be accessed once for security.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
              >
                Cancel
              </button>
              <button
                onClick={handleDataExport}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800  hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
              >
                Request Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-playfair">
          <div className="bg-white  max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <i className="ri-error-warning-line w-6 h-6 flex items-center justify-center text-red-600"></i>
              <h3 className="font-poppins text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 ">
                <p className="text-sm text-red-800 font-medium font-poppins">⚠️ This action is irreversible</p>
                <p className="text-sm text-red-700 mt-1">
                  All your data will be permanently deleted and cannot be recovered.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors font-playfair"
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE'}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600  hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 font-poppins"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}