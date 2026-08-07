'use client';

import { useState } from 'react';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import CommonModal from '../../../components/common/CommonModal';

interface Payout {
  id: string;
  dateRequested: string;
  orders: string[];
  grossAmount: number;
  fees: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'completed' | 'failed';
  dateCompleted?: string;
  bankAccount: string;
}

export default function EarningsPayouts() {
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const payouts: Payout[] = [
    {
      id: 'P-3001',
      dateRequested: '2024-10-05',
      orders: ['#ORD-1256', '#ORD-1257'],
      grossAmount: 350,
      fees: 52,
      netAmount: 298,
      status: 'completed',
      dateCompleted: '2024-10-07',
      bankAccount: '**** 1234'
    },
    {
      id: 'P-3002',
      dateRequested: '2024-10-10',
      orders: ['#ORD-1260'],
      grossAmount: 210,
      fees: 31,
      netAmount: 179,
      status: 'pending',
      bankAccount: '**** 1234'
    },
    {
      id: 'P-3003',
      dateRequested: '2024-09-28',
      orders: ['#ORD-1250', '#ORD-1251', '#ORD-1252'],
      grossAmount: 520,
      fees: 78,
      netAmount: 442,
      status: 'completed',
      dateCompleted: '2024-09-30',
      bankAccount: '**** 5678'
    },
    {
      id: 'P-3004',
      dateRequested: '2024-09-15',
      orders: ['#ORD-1248'],
      grossAmount: 180,
      fees: 27,
      netAmount: 153,
      status: 'failed',
      bankAccount: '**** 1234'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800 border border-gray-200',
      approved: 'bg-blue-50 text-blue-800 border border-blue-200',
      completed: 'bg-green-50 text-green-800 border border-green-200',
      failed: 'bg-red-50 text-red-800 border border-red-200'
    };

    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      completed: 'Completed',
      failed: 'Failed'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const columns: Column<Payout>[] = [
    {
      header: 'Payout ID',
      key: 'id',
      render: (val) => <span className="text-sm font-medium text-gray-900 font-poppins">{val}</span>
    },
    {
      header: 'Date Requested',
      key: 'dateRequested',
      render: (val) => <span className="text-sm text-gray-900 font-poppins">{formatDate(val)}</span>
    },
    {
      header: 'Orders',
      key: 'orders',
      render: (orders) => (
        <div className="text-sm text-gray-900 font-poppins max-w-[150px] truncate">
          {orders.slice(0, 2).join(', ')}
          {orders.length > 2 && <span className="text-gray-500"> +{orders.length - 2} more</span>}
        </div>
      )
    },
    {
      header: 'Gross Amount',
      key: 'grossAmount',
      render: (val) => <span className="text-sm text-gray-900 font-poppins">Rs.{val}</span>
    },
    {
      header: 'Fees',
      key: 'fees',
      render: (val) => <span className="text-sm text-gray-900 font-poppins">Rs.{val}</span>
    },
    {
      header: 'Net Payout',
      key: 'netAmount',
      render: (val) => <span className="text-sm font-semibold text-gray-900 font-poppins">Rs.{val}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, payout) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayout(payout);
          }}
          className="text-gray-800 hover:text-gray-900 font-medium text-sm font-poppins underline"
        >
          Details
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Paid Out', val: 'Rs.893', sub: '2 completed payouts', icon: 'ri-check-circle-line', color: 'bg-green-50 text-green-600' },
          { label: 'Pending', val: 'Rs.179', sub: '1 pending payout', icon: 'ri-time-line', color: 'bg-gray-100 text-gray-800' },
          {
            label: 'Available',
            val: 'Rs.520',
            action: <button onClick={() => setShowRequestModal(true)} className="text-sm text-gray-700 hover:text-black font-semibold underline mt-1 font-poppins">Request Payout</button>,
            icon: 'ri-money-euro-circle-line',
            color: 'bg-blue-50 text-blue-600'
          },
        ].map((card, i) => (
          <div key={i} className="bg-white shadow-sm border border-gray-200 p-6 flex items-center">
            <div className={`${card.color} p-3 rounded`}>
              <i className={`${card.icon} text-xl w-6 h-6 flex items-center justify-center`}></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-poppins">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 font-poppins">{card.val}</p>
              {card.sub && <p className="text-xs text-gray-500 font-poppins mt-1">{card.sub}</p>}
              {card.action}
            </div>
          </div>
        ))}
      </div>

      {/* Payout History */}
      <div className="bg-white shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-poppins font-bold text-gray-900">Payout History</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-black transition-colors text-sm font-medium font-poppins flex items-center gap-2 rounded shadow-sm"
            >
              <i className="ri-add-line"></i> Request Payout
            </button>
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <i className="ri-list-check text-lg"></i>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <i className="ri-grid-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <ReusableTable
            columns={columns}
            data={payouts}
            onRowClick={(p) => setSelectedPayout(p)}
            emptyMessage="No payout history found"
          />
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                onClick={() => setSelectedPayout(payout)}
                className="bg-white border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-start mb-4">
                  <span className="text-sm font-bold text-gray-900 font-poppins mb-1">{payout.id}</span>
                  <div className="scale-90 origin-left">{getStatusBadge(payout.status)}</div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-poppins">
                    <span className="text-gray-500">Requested</span>
                    <span className="text-gray-900 font-medium">{formatDate(payout.dateRequested)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-poppins">
                    <span className="text-gray-500">Orders</span>
                    <span className="text-gray-900 font-medium">{payout.orders.length}</span>
                  </div>
                  <div className="flex flex-col items-start text-sm font-poppins pt-2 border-t border-gray-50 gap-1">
                    <span className="text-xs text-gray-500">Net Amount</span>
                    <span className="font-bold text-gray-900">Rs.{payout.netAmount}</span>
                  </div>
                </div>
                <button className="w-full text-center text-xs font-bold text-gray-700 group-hover:text-black uppercase tracking-wider font-poppins">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Detail Modal */}
      <CommonModal
        isOpen={!!selectedPayout}
        onClose={() => setSelectedPayout(null)}
        title={`Payout Details - ${selectedPayout?.id}`}
      >
        {selectedPayout && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 border border-gray-200 rounded">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 font-poppins">Status</h4>
                {getStatusBadge(selectedPayout.status)}
              </div>
              <div className="space-y-3 font-poppins">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Requested on {formatDate(selectedPayout.dateRequested)}</span>
                </div>
                {selectedPayout.status !== 'pending' && (
                  <div className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-3 ${selectedPayout.status === 'completed' ? 'bg-green-500' :
                      selectedPayout.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                    <span className="text-gray-600">
                      {selectedPayout.status === 'completed' && selectedPayout.dateCompleted &&
                        `Completed on ${formatDate(selectedPayout.dateCompleted)}`}
                      {selectedPayout.status === 'failed' && 'Failed - Please contact support'}
                      {selectedPayout.status === 'approved' && 'Approved - Funds are being processed'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 font-poppins">Payment Information</h4>
              <div className="bg-gray-50 p-4 space-y-3 border border-gray-100 rounded">
                {[
                  { label: 'Gross Amount', val: `Rs.${selectedPayout.grossAmount}` },
                  { label: 'Platform Fees', val: `-Rs.${selectedPayout.fees}`, className: 'text-red-500' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-sm font-poppins">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={`font-medium ${row.className || 'text-gray-900'}`}>{row.val}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 font-poppins">
                  <span>Net Payout</span>
                  <span>Rs.{selectedPayout.netAmount}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 font-poppins">Included Orders</h4>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                {selectedPayout.orders.map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                    <span className="text-sm font-medium text-gray-900 font-poppins">{order}</span>
                    <span className="text-xs text-gray-500 font-poppins">Allocated Share</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 font-poppins">Destination</h4>
              <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                <i className="ri-bank-card-line text-gray-500 mr-3 text-lg"></i>
                <span className="text-sm text-gray-900 font-poppins">Account ending in {selectedPayout.bankAccount}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setSelectedPayout(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-poppins text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* Request Payout Modal */}
      <CommonModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Payout"
      >
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded shadow-lg text-white">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-poppins">Available to Payout</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-poppins">Rs.520.00</span>
              <span className="text-xs text-gray-400 font-poppins">From 3 completed orders</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 font-poppins">Payout Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-poppins">Rs.</span>
                <input
                  type="number"
                  defaultValue="520.00"
                  max="520"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 outline-none text-sm font-poppins"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 font-poppins">Payout Method</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 outline-none text-sm font-poppins bg-white appearance-none">
                <option>**** **** **** 1234 (Primary)</option>
                <option>**** **** **** 5678 (Secondary)</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 space-y-2 rounded border border-gray-100">
            {[
              { label: 'Subtotal', val: 'Rs.520.00' },
              { label: 'Processing Fee (2.5%)', val: '-Rs.13.00', className: 'text-red-500' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between text-sm font-poppins">
                <span className="text-gray-500">{row.label}</span>
                <span className={row.className || 'text-gray-900'}>{row.val}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 font-poppins">
              <span>Final Payout</span>
              <span>Rs.507.00</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowRequestModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-poppins text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowRequestModal(false)}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-black transition-colors font-poppins text-sm font-bold shadow-md"
            >
              Confirm Request
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
}