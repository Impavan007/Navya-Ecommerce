
'use client';

import { useState } from 'react';
import AvailabilityCalendar from '../../components/listings/AvailabilityCalendar';

export default function CalendarPage() {
  const [selectedListing, setSelectedListing] = useState('all');
  const [blockedDates, setBlockedDates] = useState<string[]>([
    '2025-10-10',
    '2025-10-11',
    '2025-10-12',
    '2025-10-25',
    '2025-10-26'
  ]);

  const bookedDates = [
    '2025-10-03',
    '2025-10-04',
    '2025-10-05',
    '2025-10-06',
    '2025-10-15',
    '2025-10-16'
  ];

  const listings = [
    { id: 'all', title: 'All Listings' },
    { id: '1', title: 'Red Silk Evening Dress' },
    { id: '2', title: 'Sequin Cocktail Jacket' },
    { id: '3', title: 'Classic Chanel Quilted Bag' },
    { id: '4', title: 'Floral Midi Dress' },
    { id: '5', title: 'Black Leather Boots' }
  ];

  const handleDateToggle = (date: string) => {
    if (blockedDates.includes(date)) {
      setBlockedDates(blockedDates.filter(d => d !== date));
    } else {
      setBlockedDates([...blockedDates, date]);
    }
  };

  const upcomingBookings = [
    {
      id: 'ORD-1256',
      item: 'Red Silk Evening Dress',
      renter: 'Anna K.',
      dates: 'Oct 3-6, 2025',
      status: 'confirmed'
    },
    {
      id: 'ORD-1258',
      item: 'Floral Midi Dress',
      renter: 'Sophie M.',
      dates: 'Oct 15-16, 2025',
      status: 'confirmed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Availability Calendar</h1>
            <p className="text-gray-600 mt-1">Manage your listings' availability and view upcoming bookings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Listing Filter */}
              <div className="bg-white  shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">View calendar for:</label>
                  <select
                    value={selectedListing}
                    onChange={(e) => setSelectedListing(e.target.value)}
                    className="px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm pr-8"
                  >
                    {listings.map(listing => (
                      <option key={listing.id} value={listing.id}>
                        {listing.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-[#F3D6DC]  shadow-sm border border-gray-200 p-6">
                <AvailabilityCalendar
                  blockedDates={blockedDates}
                  bookedDates={bookedDates}
                  onDateToggle={handleDateToggle}
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white  shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                    Block Next Weekend
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                    Clear All Blocks
                  </button>
                  <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors cursor-pointer whitespace-nowrap">
                    Sync with Google Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Bookings */}
              <div className="bg-white  shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Upcoming Bookings</h3>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200  p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{booking.item}</h4>
                        <span className="text-xs bg-[#F3D6DC] text-green-800 px-2 py-1 rounded-full">
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Renter: {booking.renter}</p>
                      <p className="text-sm text-gray-600 mb-3">{booking.dates}</p>
                      <button className="text-xs text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer whitespace-nowrap">
                        View Order Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Stats */}
              <div className="bg-white  shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Booked Days</span>
                    <span className="text-sm font-medium text-gray-900">{bookedDates.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Blocked Days</span>
                    <span className="text-sm font-medium text-gray-900">{blockedDates.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available Days</span>
                    <span className="text-sm font-medium text-green-600">
                      {31 - bookedDates.length - blockedDates.length}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Occupancy Rate</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {Math.round((bookedDates.length / (31 - blockedDates.length)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Sync */}
              <div className="bg-blue-50 border border-blue-200  p-4">
                <div className="flex items-start">
                  <i className="ri-calendar-line text-blue-600 mt-0.5 mr-3 w-5 h-5 flex items-center justify-center"></i>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Calendar Sync</h4>
                    <p className="text-xs text-blue-700 mb-3">
                      Connect your Google Calendar to automatically block dates when you're unavailable.
                    </p>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap">
                      Set Up Sync
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
