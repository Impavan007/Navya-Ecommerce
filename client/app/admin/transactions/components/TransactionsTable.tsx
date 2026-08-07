'use client';

import { useState } from 'react';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

const AvatarCircle = ({
  name,
  image,
  size = 'w-8 h-8',
  textSize = 'text-xs',
  withBorder = true,
  className = '',
}: {
  name?: string;
  image?: string | null;
  size?: string;
  textSize?: string;
  withBorder?: boolean;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${withBorder ? 'border border-gray-200' : ''} ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${withBorder ? 'border border-gray-200' : ''} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

interface TransactionsTableProps {
  searchQuery: string;
  filters: any;
  selectedTransactions: string[];
  onSelectionChange: (selected: string[]) => void;
  onTransactionClick: (transaction: any) => void;
  onTransactionAction: (action: string, transaction: any) => void;
  transactions: any[];
  loading?: boolean;
}

export default function TransactionsTable({
  searchQuery,
  filters,
  selectedTransactions,
  onSelectionChange,
  onTransactionClick,
  onTransactionAction,
  transactions,
  loading
}: TransactionsTableProps) {
  const getTypeLabel = (type: string) => {
    const labels = {
      'completed': 'Payment',
      'deposit-hold': 'Deposit Hold',
      'deposit-release': 'Deposit Release',
      'refund': 'Refund',
      'late-fee': 'Late Fee',
      'platform-fee': 'Platform Fee',
      'payout': 'Payout'
    };
    return labels[type as keyof typeof labels] || type;
  };

  

  const getTypeBadge = (type: string) => {
    return (
      <span className="font-bold text-gray-900 font-poppins">
        {getTypeLabel(type).toLowerCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className="font-bold text-gray-900 font-poppins">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns: Column<any>[] = [
    {
      header: 'Transaction ID',
      key: 'transaction_slug_id',
      className: 'whitespace-nowrap',
      render: (val, transaction) => (
        <div className="min-w-[150px]">
          <p className="text-sm font-bold text-gray-900 font-poppins">{val}</p>
          <p className="text-[11px] text-gray-400 font-playfair">{transaction.stripeId}</p>
        </div>
      )
    },
    {
      header: 'Order ID',
      key: 'order_slug_id',
      className: 'whitespace-nowrap',
      render: (val) => <span className="text-sm font-bold text-gray-900 font-poppins">{val}</span>
    },
    {
      header: 'Borrower/Lender',
      key: 'users',
      render: (_, transaction) => (
        <div className="flex items-center space-x-3 min-w-[250px]">
          <div className="flex -space-x-2">
            <AvatarCircle name={transaction.borrower.name} image={transaction.borrower.avatar} size="w-8 h-8" />
            <AvatarCircle name={transaction.lender.name} image={transaction.lender.avatar} size="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <p className="text-gray-900 font-bold font-poppins text-xs">{transaction.borrower.name}</p>
            <p className="text-gray-400 font-playfair text-xs italic">→ {transaction.lender.name}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'type',
      render: (type) => (
        <span className="font-bold text-gray-900 font-poppins text-sm lowercase whitespace-nowrap">
          {getTypeLabel(type).toLowerCase()}
        </span>
      )
    },
    {
      header: 'Created',
      key: 'created',
      className: 'whitespace-nowrap',
      render: (_, transaction) => (
        <span className="text-sm text-gray-700 font-roboto font-normal">
          {new Date(transaction.RentalStartDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Paid',
      key: 'paid',
      className: 'whitespace-nowrap',
      render: (_, transaction) => (
        <span className="text-sm text-gray-700 font-roboto font-normal">
          {new Date(transaction.RentalEndDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Amount',
      key: 'amount',
      className: 'whitespace-nowrap',
      render: (val) => <span className="text-lg font-bold text-gray-900 font-poppins">Rs.{val.toFixed(2)}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => (
        <span className="font-bold text-gray-900 font-poppins text-sm whitespace-nowrap">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      header: 'Updated At',
      key: 'date',
      render: (val) => (
        <div className="text-sm font-roboto font-normal leading-tight min-w-[120px] whitespace-nowrap">
          <p className="text-gray-700">{new Date(val).toLocaleDateString()}</p>
          <p className="text-gray-500">
            {new Date(val).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
          </p>
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right min-w-[100px]',
      render: (_, transaction) => (
        <div className="flex items-center justify-end space-x-3 pr-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onTransactionClick(transaction)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="View Details"
          >
            <i className="ri-eye-line text-[20px]"></i>
          </button>
          {/* <button
            onClick={() => onTransactionAction('export', transaction)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Export Receipt"
          >
            <i className="ri-download-line text-[20px]"></i>
          </button> */}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg">
      <ReusableTable
        columns={columns}
        data={transactions}
        onRowClick={() => { }}
        emptyMessage="No transactions found"
        idKey="id"
        headerClassName="bg-white"
        loading={loading}
      />
    </div>
  );
}
