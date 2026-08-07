"use client";

import { useState } from "react";
import AccountHeader from "./account/AccountHeader";
import ProfileSettings from "./account/ProfileSettings";
import SecuritySettings from "./account/SecuritySettings";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'ri-user-line' },
    // { id: 'payment', label: 'Payment', icon: 'ri-bank-card-line' },
    // { id: 'notifications', label: 'Notifications', icon: 'ri-notification-line' },
    { id: 'security', label: 'Security', icon: 'ri-shield-check-line' },
    // { id: 'gdpr', label: 'GDPR Tools', icon: 'ri-file-shield-line' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      // case 'payment':
      //   return <PaymentSettings />;
      // case 'notifications':
      //   return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      // case 'gdpr':
      //   return <GDPRTools />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountHeader />

      <div className=" mx-auto px-[40px] sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white shadow-sm border border-gray-200  p-6">
              <h3 className="font-poppins text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm transition-all duration-200 cursor-pointer whitespace-nowrap  ${activeTab === tab.id
                      ? 'bg-gray-100 text-gray-800 border-r-2 border-gray-800'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <i className={`${tab.icon} w-5 h-5 flex items-center justify-center ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-500'
                      }`}></i>
                    <span className="font-poppins font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <div className="flex space-x-1 bg-gray-100 p-1  overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-poppins font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${activeTab === tab.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  <i className={`${tab.icon} w-4 h-4 flex items-center justify-center`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}