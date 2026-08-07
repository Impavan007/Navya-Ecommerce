'use client';

import { useState } from 'react';
import EarningsOverview from './EarningsOverview';
import EarningsPayouts from './EarningsPayouts';
import EarningsTransactions from './EarningsTransactions';

export default function EarningsHeader() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    // { id: 'payouts', label: 'Payouts', count: 2 },
    { id: 'transactions', label: 'Transactions', count: null }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <EarningsOverview />;
      // case 'payouts':
      //   return <EarningsPayouts />;
      case 'transactions':
        return <EarningsTransactions />;
      default:
        return <EarningsOverview />;
    }
  };

  return (
    <div className="space-y-6 font-playfair">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-canela font-bold text-[#3D1126]">Earnings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your rental income, payouts, and transaction history
          </p>
        </div>

        {/* Optional: Add a mobile dropdown for tabs */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-playfair focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="hidden sm:block border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer font-poppins transition-colors ${activeTab === tab.id
                ? 'border-gray-600 text-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
              {tab.count && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-poppins border ${activeTab === tab.id
                  ? 'bg-gray-100 text-gray-800 border-gray-200'
                  : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
