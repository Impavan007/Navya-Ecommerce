'use client';

import { useState } from 'react';
import { MappedDispute } from '../../store/DisputeStore/Disputestore';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';

const AvatarCircle = ({
  name,
  image,
  size = 'w-6 h-6',
  textSize = 'text-xs',
  withBorder = true,
}: {
  name?: string;
  image?: string | null;
  size?: string;
  textSize?: string;
  withBorder?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n?: string) => {
    if (!n) return 'NA';
    const parts = n.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('') || 'NA';
  };

  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${withBorder ? 'border border-gray-200' : ''} flex-shrink-0`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${withBorder ? 'border border-gray-200' : ''} flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
};

interface DisputesTableProps {
  disputes: MappedDispute[];
  selectedDisputes: string[];
  onSelectDispute: (disputeId: string) => void;
  onSelectAll: () => void;
  onDisputeClick: (dispute: MappedDispute) => void;
  onResolve?: (dispute: MappedDispute) => void;
}

export default function DisputesTable({
  disputes,
  selectedDisputes,
  onSelectDispute,
  onSelectAll,
  onDisputeClick,
  onResolve
}: DisputesTableProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-gray-100 text-gray-800 border border-gray-200',
      progress: 'bg-blue-50 text-blue-700 border border-blue-200',
      resolved: 'bg-green-50 text-green-700 border border-green-200',
      escalated: 'bg-red-50 text-red-700 border border-red-200',
      rejected: 'bg-yellow-50 text-yellow-700 border border-yellow-200'
    };

    const labels = {
      open: 'Open',
      progress: 'Under Review',
      resolved: 'Resolved',
      escalated: 'Escalated',
      rejected: 'Rejected'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.open} font-poppins`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      damage: 'Damage',
      late_return: 'Late Return',
      not_returned: 'Not Returned',
      payment_issue: 'Payment Issue',
      other: 'Other'
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const columns: Column<MappedDispute>[] = [
    {
      header: 'Dispute',
      key: 'support_slug_id',
      render: (val, dispute) => (
        <div>
          <div className="text-sm font-semibold text-gray-900 font-poppins">{val}</div>
          {dispute.orderNumber && <div className="text-xs text-gray-500 font-poppins">Order: {dispute.orderNumber}</div>}
        </div>
      )
    },
    {
      header: 'Parties (Renter & Lender)',
      key: 'borrower',
      render: (_, dispute) => (
        <div className="space-y-1">
          {dispute?.borrower?.name && dispute.borrower.name !== 'N/A' && (
            <div className="flex items-center">
              <AvatarCircle name={dispute.borrower.name} image={dispute.borrower.avatar} />
              <span className="text-xs text-gray-900 font-medium ml-2 font-poppins">{dispute.borrower.name}</span>
              <span className="text-[10px] text-gray-400 ml-1 font-poppins">(Renter)</span>
            </div>
          )}
          {dispute?.lender?.name && dispute.lender.name !== 'N/A' && (
            <div className="flex items-center">
              <AvatarCircle name={dispute.lender.name} image={dispute.lender.avatar} />
              <span className="text-xs text-gray-900 font-medium ml-2 font-poppins">{dispute.lender.name}</span>
              <span className="text-[10px] text-gray-400 ml-1 font-poppins">(Lender)</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Reason',
      key: 'reason',
      render: (val) => <span className="text-sm text-gray-900 font-poppins">{getReasonLabel(val)}</span>
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
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onDisputeClick(dispute)}
            className="text-gray-900 hover:text-black font-semibold text-sm font-poppins underline"
          >
            Details
          </button>
          {(() => {
            const isActionable = !dispute.isOrder && (dispute.status === 'open' || dispute.status === 'progress' || dispute.status === 'under_review');
            if (!isActionable || !onResolve) return null;

            return (
              <button
                onClick={() => onResolve(dispute)}
                className="text-green-600 hover:text-green-800 font-semibold text-sm font-poppins underline"
              >
                Resolve
              </button>
            );
          })()}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <ReusableTable
        columns={columns}
        data={disputes}
        onRowClick={onDisputeClick}
        selectable
        selectedIds={selectedDisputes}
        onSelectRow={onSelectDispute}
        onSelectAll={onSelectAll}
        emptyMessage="No disputes to resolve"
        idKey="id"
      />
    </div>
  );
}
