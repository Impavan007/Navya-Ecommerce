'use client';

import { Dispute } from '@/app/lender/disputes/page';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import { useState } from 'react';

const AvatarCircle = ({
  name,
  src,
  size = 'h-8 w-8',
  textSize = 'text-xs',
  className = '',
}: {
  name?: string;
  src?: string | null;
  size?: string;
  textSize?: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n?: string) => {
    if (!n) return 'NA';
    const parts = n.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('') || 'NA';
  };

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${className} border border-gray-100 flex-shrink-0`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${className} flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
};

interface DisputesTableProps {
  disputes: Dispute[];
  onDisputeSelect: (dispute: Dispute) => void;
}

export default function DisputesTable({ disputes, onDisputeSelect }: DisputesTableProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      'open': 'bg-red-50 text-red-700 border border-red-200',
      'in-review': 'bg-amber-50 text-amber-700 border border-amber-200',
      'resolved': 'bg-green-50 text-green-700 border border-green-200'
    };

    const labels = {
      'open': 'Open',
      'in-review': 'In Review',
      'resolved': 'Resolved'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges] || badges.open} font-poppins`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const columns: Column<Dispute>[] = [
    {
      header: 'Dispute',
      key: 'id',
      render: (id, dispute) => (
        <div>
          <div className="text-sm font-semibold text-gray-900 font-poppins">{id}</div>
          <div className="text-xs text-gray-500 font-poppins">#{dispute.orderId}</div>
        </div>
      )
    },
    {
      header: 'Order & Item',
      key: 'item',
      render: (item) => (
        <div className="flex items-center">
          <img
            className="h-10 w-10 object-cover rounded border border-gray-100"
            src={item.image}
            alt={item.title}
          />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 font-poppins truncate max-w-[120px]">{item.title}</div>
            <div className="text-xs text-gray-500 font-poppins">{item.category}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Borrower',
      key: 'borrower',
      render: (borrower) => (
        <div className="flex items-center">
          <AvatarCircle name={borrower.name} src={borrower.avatar} />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 font-poppins">{borrower.name}</div>
            <div className="text-xs text-gray-500 font-poppins">{borrower.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Reason',
      key: 'reason',
      render: (val) => <span className="text-sm text-gray-900 font-poppins">{val}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Date Opened',
      key: 'dateOpened',
      render: (val) => <span className="text-sm text-gray-500 font-poppins">{formatDate(val)}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, dispute) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDisputeSelect(dispute);
          }}
          className="text-yellow-600 hover:text-yellow-900 font-semibold text-sm font-poppins underline"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="bg-white border border-[#F3D6DC] rounded-lg overflow-hidden">
      <ReusableTable
        columns={columns}
        data={disputes}
        onRowClick={onDisputeSelect}
        emptyMessage="No disputes raised"
        idKey="id"
      />
    </div>
  );
}
