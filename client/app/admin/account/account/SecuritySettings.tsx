
'use client';

import { useState } from 'react';

export default function SecuritySettings() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on MacBook Pro',
      location: 'London, UK',
      lastActive: 'Active now',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'London, UK',
      lastActive: '2 hours ago',
      current: false
    },
    {
      id: 3,
      device: 'Chrome on Windows',
      location: 'Manchester, UK',
      lastActive: '1 day ago',
      current: false
    }
  ];

  const handlePasswordChange = () => {
    setShowPasswordForm(false);
    setShowSuccess(true);
    setPasswordData({ current: '', new: '', confirm: '' });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleToggleTwoFactor = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
    } else {
      setShowTwoFactorModal(true);
    }
  };

  const handleSetupTwoFactor = () => {
    setTwoFactorEnabled(true);
    setShowTwoFactorModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogoutAllSessions = () => {
    setShowLogoutModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200  p-4">
          <div className="flex items-center">
            <i className="ri-check-circle-line w-5 h-5 flex items-center justify-center text-green-600 mr-3"></i>
            <p className="text-green-800">Security settings updated successfully!</p>
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl font-semibold text-gray-900">Change Password</h3>
            <p className="text-gray-600 mt-1">Update your password to keep your account secure</p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-black hover:opacity-80 transition-opacity cursor-pointer"
          >
            <i className={`${showPasswordForm ? 'ri-close-line' : 'ri-edit-line'} w-4 h-4 flex items-center justify-center`}></i>
            <span>{showPasswordForm ? 'Cancel' : 'Change Password'}</span>
          </button>
        </div>

        {!showPasswordForm ? (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 ">
            <i className="ri-lock-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
            <div>
              <p className="font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-600">Last changed 3 months ago</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                placeholder="Confirm your new password"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-50  hover:bg-[#ebbdc5] transition-colors cursor-pointer whitespace-nowrap"
              >
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      {/* <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-gray-600 mt-1">Add an extra layer of security to your account</p>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            twoFactorEnabled 
              ? 'bg-gray-50 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 ">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12  flex items-center justify-center ${
              twoFactorEnabled ? 'bg-gray-50' : 'bg-gray-100'
            }`}>
              <i className={`ri-shield-check-line w-6 h-6 flex items-center justify-center ${
                twoFactorEnabled ? 'text-green-600' : 'text-gray-600'
              }`}></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Authenticator App</h4>
              <p className="text-sm text-gray-600">
                {twoFactorEnabled 
                  ? 'Using Google Authenticator' 
                  : 'Use an authenticator app to generate codes'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleTwoFactor}
            className={`px-4 py-2 text-sm font-medium  transition-colors cursor-pointer whitespace-nowrap ${
              twoFactorEnabled
                ? 'text-red-600 bg-white border border-red-300 hover:bg-red-50'
                : 'text-white bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-blue-50 ">
            <div className="flex items-start space-x-3">
              <i className="ri-information-line w-5 h-5 flex items-center justify-center text-blue-600 mt-0.5"></i>
              <div>
                <p className="text-sm text-blue-800 font-medium">Two-Factor Authentication Active</p>
                <p className="text-sm text-blue-700 mt-1">
                  You'll need to enter a code from your authenticator app when signing in from a new device.
                </p>
              </div>
            </div>
          </div>
        )}
      </div> */}

      {/* Active Sessions */}
      {/* <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl font-semibold text-gray-900">Active Sessions</h3>
            <p className="text-gray-600 mt-1">Manage devices that are currently signed in to your account</p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300  hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Log Out All Others
          </button>
        </div>

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 ">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10  flex items-center justify-center ${
                  session.current ? 'bg-gray-50' : 'bg-gray-100'
                }`}>
                  <i className={`ri-computer-line w-5 h-5 flex items-center justify-center ${
                    session.current ? 'text-green-600' : 'text-gray-600'
                  }`}></i>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{session.device}</p>
                    {session.current && (
                      <span className="text-xs bg-gray-50 text-green-800 px-2 py-1 rounded-full">Current</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{session.location} • {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div> */}

      {/* Security Recommendations */}
      {/* <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-6">Security Recommendations</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50 ">
            <i className="ri-check-circle-fill w-5 h-5 flex items-center justify-center text-green-600 mt-0.5"></i>
            <div>
              <p className="font-medium text-green-900">Strong Password</p>
              <p className="text-sm text-green-700">Your password meets our security requirements</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-green-50 ">
            <i className="ri-check-circle-fill w-5 h-5 flex items-center justify-center text-green-600 mt-0.5"></i>
            <div>
              <p className="font-medium text-green-900">Two-Factor Authentication</p>
              <p className="text-sm text-green-700">Your account is protected with 2FA</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 ">
            <i className="ri-information-line w-5 h-5 flex items-center justify-center text-yellow-600 mt-0.5"></i>
            <div>
              <p className="font-medium text-yellow-900">Regular Security Checkups</p>
              <p className="text-sm text-yellow-700">Review your security settings monthly for optimal protection</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Two-Factor Setup Modal */}
      {/* {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <i className="ri-shield-check-line w-6 h-6 flex items-center justify-center text-yellow-600"></i>
              <h3 className="font-serif text-lg font-semibold text-gray-900">Enable Two-Factor Authentication</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.) to set up two-factor authentication.
              </p>
              <div className="flex justify-center p-4 bg-gray-50 ">
                <div className="w-32 h-32 bg-gray-200  flex items-center justify-center">
                  <i className="ri-qr-code-line w-16 h-16 flex items-center justify-center text-gray-400"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTwoFactorModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSetupTwoFactor}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600  hover:bg-yellow-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Logout All Sessions Modal */}
      {/* {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <i className="ri-logout-box-line w-6 h-6 flex items-center justify-center text-red-600"></i>
              <h3 className="font-serif text-lg font-semibold text-gray-900">Log Out All Other Sessions</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will sign you out of all other devices and browsers. You'll need to sign in again on those devices.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutAllSessions}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600  hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Log Out All Others
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
