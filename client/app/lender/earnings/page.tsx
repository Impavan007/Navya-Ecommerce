'use client';

import EarningsOverview from '../components/earnings/EarningsOverview';
import EarningsPayouts from '../components/earnings/EarningsPayouts';
import EarningsTransactions from '../components/earnings/EarningsTransactions';
import EarningsHeader from '../components/earnings/EarningsHeader';

export default function EarningsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EarningsHeader />
      </div>
    </div>
  );
}