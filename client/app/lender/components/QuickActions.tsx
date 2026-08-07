'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function QuickActions() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const router = useRouter();

  const actions = [
    {
      title: "Add New Listing",
      icon: (
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0V6H12V2H34V24H30V26H36V0H10ZM0 10V36H26V10H0ZM2 12H24V34H2V12ZM12 16V22H6V24H12V30H14V24H20V22H14V16H12Z" fill="#BFA15F" />
        </svg>
      ),
      action: () => router.push('/lender/listings/new'),
    },
    {
      title: "View Orders",
      icon: (
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.09369 39.9688C1.84369 39.9688 1.59369 39.875 1.40619 39.6562C1.21869 39.4688 1.12494 39.2188 1.15619 38.9375L3.12494 8.6875C3.15619 8.1875 3.56244 7.8125 4.06244 7.8125H12.3124V7.6875C12.3124 5.625 13.1249 3.71875 14.5624 2.25C16.0312 0.84375 17.9374 0.03125 19.9999 0.03125C24.2187 0.03125 27.6874 3.46875 27.6874 7.71875C27.6874 7.75 27.6562 7.78125 27.6562 7.8125V7.84375H35.9374C36.4374 7.84375 36.8437 8.21875 36.8749 8.71875L38.8124 38.75C38.8437 38.8438 38.8437 38.9062 38.8437 39C38.8124 39.5312 38.4062 39.9688 37.8749 39.9688H2.09369ZM3.09369 38.0938H36.8749L35.0624 9.71875H27.6562V11.9688H27.6874C28.1874 12.3125 28.4687 12.8125 28.4687 13.375C28.4687 14.3438 27.6874 15.125 26.7187 15.125C25.7499 15.125 24.9687 14.3438 24.9687 13.375C24.9687 12.8125 25.2499 12.3125 25.7499 11.9688H25.7812V9.71875H14.1874V11.9688H14.2187C14.7187 12.3125 14.9999 12.8125 14.9999 13.375C14.9999 14.3438 14.2187 15.125 13.2499 15.125C12.2812 15.125 11.4999 14.3438 11.4999 13.375C11.4999 12.8125 11.7812 12.3125 12.2812 11.9688H12.3124V9.71875H4.90619L3.09369 38.0938ZM19.9999 1.9375C16.8124 1.9375 14.1874 4.53125 14.1874 7.75V7.875H25.8437L25.8124 7.8125V7.75C25.8124 4.53125 23.1874 1.9375 19.9999 1.9375Z" fill="#BFA15F" />
        </svg>
      ),
      action: () => router.push('/lender/orders'),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="bg-white border border-[#F0E6D2] hover:border-[#BFA15F] text-[#1A1A1A] p-6 rounded-xl transition-all duration-200 hover:bg-[#FAF4E8]/40 shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="p-2 rounded-lg bg-[#FAF4E8] text-[#BFA15F] group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                {action.icon}
              </span>
              <span className="text-base font-bold font-poppins text-[#1A1A1A] group-hover:text-[#BFA15F] transition-colors">{action.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Payout Modal */}
      {/* {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowPayoutModal(false)}
          ></div>

          <div className="relative bg-white  max-w-md w-full p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-poppins font-bold text-gray-900">Request Payout</h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4  border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-poppins">Available Balance</span>
                  <span className="text-lg font-poppins font-bold text-gray-900">Rs.980.00</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Payout Amount (Rs.)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm font-playfair"
                  placeholder="980.00"
                  max="980"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Bank Account</label>
                <select className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm pr-8 font-playfair">
                  <option>**** **** **** 1234 (Primary)</option>
                  <option>**** **** **** 5678 (Savings)</option>
                </select>
              </div>
              
              <p className="text-xs text-gray-500 font-playfair">
                Payouts typically arrive within 1–2 business days. A 2.5% processing fee will be deducted.
              </p>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap font-poppins"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white  hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap font-poppins"
              >
                Request Payout
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}