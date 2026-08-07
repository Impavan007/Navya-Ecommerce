'use client';

import { Payout } from '../../store/payout/payoutStore';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';

interface PayoutsTableProps {
  payouts: Payout[];
  loading?: boolean;
  selectedPayouts: string[];
  onPayoutSelect: (payoutId: string) => void;
  onSelectAll: () => void;
  onPayoutClick: (payout: Payout) => void;
  onApprove: (payout: Payout) => void;
  onHold: (payout: Payout) => void;
  onMarkPaid: (payout: Payout) => void;
  onRetry: (payout: Payout) => void;
}

export default function PayoutsTable({
  payouts,
  loading,
  selectedPayouts,
  onPayoutSelect,
  onSelectAll,
  onPayoutClick,
  onApprove,
  onHold,
  onMarkPaid,
  onRetry
}: PayoutsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-700 border border-gray-300', icon: 'ri-time-line' },
      approved: { color: 'bg-blue-100 text-blue-700 border border-blue-300', icon: 'ri-check-line' },
      completed: { color: 'bg-[#F3D6DC] text-green-700 border border-green-300', icon: 'ri-check-double-line' },
      held: { color: 'bg-red-100 text-red-700 border border-red-300', icon: 'ri-pause-line' },
      failed: { color: 'bg-red-100 text-red-700 border border-red-300', icon: 'ri-close-line' }
    };

    const config = statusConfig[statusLower as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} font-poppins`}>
        <div className="w-3 h-3 flex items-center justify-center">
          <i className={config.icon}></i>
        </div>
        <span className="capitalize">{statusLower}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getActionButton = (payout: Payout) => {
    const status = payout.status.toLowerCase();
    switch (status) {
      case 'pending':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApprove(payout);
            }}
            className="px-3 py-1.5 bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap font-poppins"
          >
            Approve
          </button>
        );
      case 'approved':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid(payout);
            }}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap font-poppins"
          >
            Mark Paid
          </button>
        );
      case 'held':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApprove(payout);
            }}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap font-poppins"
          >
            Review
          </button>
        );
      case 'failed':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetry(payout);
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap font-poppins"
          >
            Retry
          </button>
        );
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPayoutClick(payout);
            }}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap font-poppins"
          >
            View
          </button>
        );
    }
  };

  const columns: Column<Payout>[] = [
    {
      header: 'Payout ID',
      key: 'payout_slug_id',
      render: (val) => <span className="text-sm text-gray-900 font-poppins">{val || 'N/A'}</span>
    },
    {
      header: 'Lender',
      key: 'lender',
      render: (lender: any) => (
        <div className="flex items-center space-x-3">
          <img
            src={lender?.profile_image ? (lender.profile_image.startsWith('http') ? lender.profile_image : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${lender.profile_image}`) : '/placeholder-avatar.png'}
            alt={lender?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium text-gray-900 font-poppins">{lender?.name || 'Unknown'}</span>
        </div>
      )
    },
    {
      header: 'Order',
      key: 'order',
      render: (order: any) => (
        <div>
          <span className="text-sm text-gray-900 font-poppins">{order?.order_slug_id || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Amount',
      key: 'gross_amount',
      render: (val) => <span className="font-semibold text-gray-900 font-poppins">Rs.{Number(val || 0).toFixed(2)}</span>
    },
    {
      header: 'Fees',
      key: 'platform_fee',
      render: (val, payout) => (
        <div>
          <span className="text-gray-600 font-playfair">Rs.{Number(val || 0).toFixed(2)}</span>
          {(payout.late_fee_deduction !== 0 || payout.refund_deduction !== 0 || payout.discount_deduction !== 0) && (
            <p className="text-xs font-playfair text-red-600">
               -Rs.{(payout.late_fee_deduction + payout.refund_deduction + payout.discount_deduction).toFixed(2)}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Net Payout',
      key: 'net_amount',
      render: (val) => <span className="font-bold text-gray-900 font-poppins">Rs.{Number(val || 0).toFixed(2)}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Date',
      key: 'created_at',
      render: (val) => <span className="text-sm text-gray-600 font-playfair">{formatDate(val)}</span>
    },
    {
      header: 'Actions',
      key: '_id',
      render: (_, payout) => getActionButton(payout)
    }
  ];

  return (
    <div className="bg-white border border-[#F3D6DC] overflow-hidden rounded-lg">
      <ReusableTable
        columns={columns}
        data={payouts}
        loading={loading}
        onRowClick={onPayoutClick}
        selectable
        selectedIds={selectedPayouts}
        onSelectRow={onPayoutSelect}
        onSelectAll={onSelectAll}
        emptyMessage="No payouts found"
        idKey="_id"
        isRowSelectable={(item) => item.status.toLowerCase() !== 'completed'}
      />
    </div>
  );
}