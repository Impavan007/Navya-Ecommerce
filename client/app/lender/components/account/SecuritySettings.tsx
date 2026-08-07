"use client";

import { useState, useEffect } from 'react';
import useChangePasswordStore from '../../stores/account/changePasswordStore';
import { toast } from 'react-hot-toast';

export default function SecuritySettings() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const { changePassword, loading: changingPassword, error, successMessage } = useChangePasswordStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setShowPasswordForm(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    }
  }, [successMessage]);

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

  const handlePasswordChange = async () => {
    // basic client-side validation
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New password and confirmation do not match');
      return;
    }

    // call store action
    await changePassword({ oldPassword: passwordData.current, newPassword: passwordData.new, confirmPassword: passwordData.confirm });
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
    toast.success('Two-factor authentication enabled successfully!');
  };

  const handleLogoutAllSessions = () => {
    setShowLogoutModal(false);
    toast.success('Logged out of all other sessions successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-poppins text-xl font-semibold text-gray-900">Change Password</h3>
            <p className="text-gray-600 mt-1 font-['Playfair_Display']">Update your password to keep your account secure</p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-poppins font-medium text-gray-800 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <i className={`${showPasswordForm ? 'ri-close-line' : 'ri-edit-line'} w-4 h-4 flex items-center justify-center`}></i>
            <span>{showPasswordForm ? 'Cancel' : 'Change Password'}</span>
          </button>
        </div>

        {!showPasswordForm ? (
          <div className="flex items-center space-x-4 p-4 bg-gray-50  border border-gray-200">
            <i className="ri-lock-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
            <div>
              <p className="font-poppins font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-600 font-['Playfair_Display']">Last changed 3 months ago</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-poppins font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors font-['Playfair_Display']"
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-poppins font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors font-['Playfair_Display']"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label className="block text-sm font-poppins font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors font-['Playfair_Display']"
                placeholder="Confirm your new password"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 text-sm font-poppins font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className={`px-4 py-2 text-sm font-poppins font-medium text-white bg-gray-800  hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap ${changingPassword ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      {/* <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-poppins text-xl font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-gray-600 mt-1 font-['Playfair_Display']">Add an extra layer of security to your account</p>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-poppins font-medium border ${
            twoFactorEnabled 
              ? 'bg-[#F3D6DC] text-green-800 border-green-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50  border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12  flex items-center justify-center border ${
              twoFactorEnabled ? 'bg-[#F3D6DC] border-green-200' : 'bg-gray-100 border-gray-200'
            }`}>
              <i className={`ri-shield-check-line w-6 h-6 flex items-center justify-center ${
                twoFactorEnabled ? 'text-green-600' : 'text-gray-600'
              }`}></i>
            </div>
            <div>
              <h4 className="font-poppins font-medium text-gray-900">Authenticator App</h4>
              <p className="text-sm text-gray-600 font-['Playfair_Display']">
                {twoFactorEnabled 
                  ? 'Using Google Authenticator' 
                  : 'Use an authenticator app to generate codes'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleTwoFactor}
            className={`px-4 py-2 text-sm font-poppins font-medium  transition-colors cursor-pointer whitespace-nowrap ${
              twoFactorEnabled
                ? 'text-red-600 bg-white border border-red-300 hover:bg-red-50'
                : 'text-white bg-gray-800 hover:bg-gray-900'
            }`}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-blue-50  border border-blue-200">
            <div className="flex items-start space-x-3">
              <i className="ri-information-line w-5 h-5 flex items-center justify-center text-blue-600 mt-0.5"></i>
              <div>
                <p className="text-sm text-blue-800 font-poppins font-medium">Two-Factor Authentication Active</p>
                <p className="text-sm text-blue-700 font-['Playfair_Display'] mt-1">
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
            <h3 className="font-poppins text-xl font-semibold text-gray-900">Active Sessions</h3>
            <p className="text-gray-600 mt-1 font-['Playfair_Display']">Manage devices that are currently signed in to your account</p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2 text-sm font-poppins font-medium text-red-600 bg-white border border-red-300  hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Log Out All Others
          </button>
        </div>

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 ">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10  flex items-center justify-center border ${
                  session.current ? 'bg-[#F3D6DC] border-green-200' : 'bg-gray-100 border-gray-200'
                }`}>
                  <i className={`ri-computer-line w-5 h-5 flex items-center justify-center ${
                    session.current ? 'text-green-600' : 'text-gray-600'
                  }`}></i>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-poppins font-medium text-gray-900">{session.device}</p>
                    {session.current && (
                      <span className="text-xs bg-[#F3D6DC] text-green-800 px-2 py-1 rounded-full border border-green-200 font-poppins">Current</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-['Playfair_Display']">{session.location} • {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button className="px-3 py-1 text-sm font-poppins font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div> */}

      {/* Security Recommendations */}
      {/* <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-6">Security Recommendations</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50  border border-green-200">
            <i className="ri-check-circle-fill w-5 h-5 flex items-center justify-center text-green-600 mt-0.5"></i>
            <div>
              <p className="font-poppins font-medium text-green-900">Strong Password</p>
              <p className="text-sm text-green-700 font-['Playfair_Display']">Your password meets our security requirements</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-green-50  border border-green-200">
            <i className="ri-check-circle-fill w-5 h-5 flex items-center justify-center text-green-600 mt-0.5"></i>
            <div>
              <p className="font-poppins font-medium text-green-900">Two-Factor Authentication</p>
              <p className="text-sm text-green-700 font-['Playfair_Display']">Your account is protected with 2FA</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-gray-50  border border-gray-200">
            <i className="ri-information-line w-5 h-5 flex items-center justify-center text-gray-600 mt-0.5"></i>
            <div>
              <p className="font-poppins font-medium text-gray-900">Regular Security Checkups</p>
              <p className="text-sm text-gray-700 font-['Playfair_Display']">Review your security settings monthly for optimal protection</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Two-Factor Setup Modal */}
      {/* {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <i className="ri-shield-check-line w-6 h-6 flex items-center justify-center text-gray-800"></i>
              <h3 className="font-poppins text-lg font-semibold text-gray-900">Enable Two-Factor Authentication</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 font-['Playfair_Display']">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.) to set up two-factor authentication.
              </p>
              <div className="flex justify-center p-4 bg-gray-50  border border-gray-200">
                <div className="w-32 h-32 bg-gray-200  flex items-center justify-center">
                  <i className="ri-qr-code-line w-16 h-16 flex items-center justify-center text-gray-400"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-poppins font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors font-['Playfair_Display']"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTwoFactorModal(false)}
                className="px-4 py-2 text-sm font-poppins font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSetupTwoFactor}
                className="px-4 py-2 text-sm font-poppins font-medium text-white bg-gray-800  hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap"
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
              <h3 className="font-poppins text-lg font-semibold text-gray-900">Log Out All Other Sessions</h3>
            </div>
            <p className="text-gray-600 mb-6 font-['Playfair_Display']">
              This will sign you out of all other devices and browsers. You'll need to sign in again on those devices.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-poppins font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutAllSessions}
                className="px-4 py-2 text-sm font-poppins font-medium text-white bg-red-600  hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
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