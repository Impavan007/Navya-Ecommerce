'use client';

import { useState } from 'react';

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      newBooking: true,
      rentalReminders: true,
      payoutProcessed: true,
      reviewReceived: false,
      supportTickets: true,
      marketingUpdates: false,
      weeklyDigest: true
    },
    sms: {
      newBooking: true,
      rentalReminders: false,
      payoutProcessed: true,
      reviewReceived: false,
      supportTickets: false,
      marketingUpdates: false,
      weeklyDigest: false
    },
    push: {
      newBooking: true,
      rentalReminders: true,
      payoutProcessed: true,
      reviewReceived: true,
      supportTickets: true,
      marketingUpdates: false,
      weeklyDigest: false
    }
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggle = (type: 'email' | 'sms' | 'push', setting: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [setting]: !prev[type][setting as keyof typeof prev[typeof type]]
      }
    }));
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const notificationTypes = [
    {
      id: 'newBooking',
      title: 'New Booking Received',
      description: 'When someone books one of your items'
    },
    {
      id: 'rentalReminders',
      title: 'Rental Reminders',
      description: 'Pickup and return date reminders'
    },
    {
      id: 'payoutProcessed',
      title: 'Payout Processed',
      description: 'When your earnings are transferred'
    },
    {
      id: 'reviewReceived',
      title: 'Review Received',
      description: 'When borrowers leave feedback'
    },
    {
      id: 'supportTickets',
      title: 'Support Ticket Updates',
      description: 'Updates on your support requests'
    },
    {
      id: 'marketingUpdates',
      title: 'Marketing Updates',
      description: 'Platform news and promotional content'
    },
    {
      id: 'weeklyDigest',
      title: 'Weekly Digest',
      description: 'Summary of your activity and earnings'
    }
  ];

  return (
    <div className="space-y-6 font-playfair">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200  p-4">
          <div className="flex items-center">
            <i className="ri-check-circle-line w-5 h-5 flex items-center justify-center text-green-600 mr-3"></i>
            <p className="text-green-800 font-poppins">Notification preferences updated successfully!</p>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="font-poppins text-xl font-semibold text-gray-900">Notification Preferences</h3>
          <p className="text-gray-600 mt-1">Choose how you'd like to receive updates about your account</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto table-word-wrap">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 pr-4">
                  <span className="font-medium text-gray-900 font-poppins break-words whitespace-normal">Notification Type</span>
                </th>
                {["Email", "SMS", "Push"].map((header, idx) => (
                  <th
                    key={idx}
                    className="text-center py-3 px-4 min-w-[100px] break-words whitespace-normal"
                  >
                    <div className="flex flex-col items-center">
                      <i className={`ri-${header.toLowerCase()}-line w-5 h-5 flex items-center justify-center text-gray-600 mb-1`}></i>
                      <span className="text-sm font-medium text-gray-900 font-poppins">{header}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {notificationTypes.map((type, index) => (
                <tr
                  key={type.id}
                  className={index !== notificationTypes.length - 1 ? 'border-b border-gray-100' : ''}
                >
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-medium text-gray-900 font-poppins">{type.title}</p>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email[type.id as keyof typeof notifications.email]}
                        onChange={() => handleToggle('email', type.id)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email[type.id as keyof typeof notifications.email] 
                          ? 'bg-gray-800' 
                          : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email[type.id as keyof typeof notifications.email] 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`} />
                      </div>
                    </label>
                  </td>
                  <td className="text-center py-4 px-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms[type.id as keyof typeof notifications.sms]}
                        onChange={() => handleToggle('sms', type.id)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.sms[type.id as keyof typeof notifications.sms] 
                          ? 'bg-gray-800' 
                          : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.sms[type.id as keyof typeof notifications.sms] 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`} />
                      </div>
                    </label>
                  </td>
                  <td className="text-center py-4 pl-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push[type.id as keyof typeof notifications.push]}
                        onChange={() => handleToggle('push', type.id)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push[type.id as keyof typeof notifications.push] 
                          ? 'bg-gray-800' 
                          : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push[type.id as keyof typeof notifications.push] 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`} />
                      </div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800  hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-6">Quick Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50  border border-gray-200">
            <div>
              <p className="font-medium text-gray-900 font-poppins">Do Not Disturb</p>
              <p className="text-sm text-gray-600">Pause all non-urgent notifications</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" />
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50  border border-gray-200">
            <div>
              <p className="font-medium text-gray-900 font-poppins">Quiet Hours</p>
              <p className="text-sm text-gray-600">No notifications between 10 PM - 8 AM</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only" />
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-800 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white  shadow-sm border border-gray-200 p-6">
        <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value="jane.doe@example.com"
                disabled
                className="w-full px-3 py-2 pr-10 border border-gray-300  bg-gray-50 text-gray-500 font-playfair"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <i className="ri-check-circle-fill w-5 h-5 flex items-center justify-center text-green-500"></i>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value="+44 7700 900123"
                className="w-full px-3 py-2 pr-10 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 font-playfair"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <i className="ri-check-circle-fill w-5 h-5 flex items-center justify-center text-green-500"></i>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          We'll use these contact details to send you notifications. Make sure they're up to date.
        </p>
      </div>
    </div>
  );
}