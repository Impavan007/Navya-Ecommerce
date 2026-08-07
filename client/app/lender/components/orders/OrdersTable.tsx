'use client';

import { useState, useEffect } from 'react';
import { useLenderOrderStore, Order } from '../../stores/orders/orderStrore';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import Pagination from '../Pagination';
import CommonLoader from '@/app/components/common/CommonLoader';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

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

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'profile'}
        className={`${size} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

interface OrdersTableProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  pagination?: any;
  onPageChange?: (page: number) => void;
}

export default function OrdersTable({ orders, onOrderSelect, pagination, onPageChange }: OrdersTableProps) {
  const { loading } = useLenderOrderStore();

  const getStatusBadge = (status: string) => {
    status = status.toLowerCase();
    const styles: Record<string, string> = {
      // Old statuses (keeping for backwards compatibility)
      requested: 'bg-gray-50 text-gray-800 border border-gray-200',
      accepted: 'bg-blue-50 text-blue-800 border border-blue-200',
      orderplaced: 'bg-gray-100 text-gray-800 border border-gray-300',
      placed: 'bg-gray-100 text-gray-800 border border-gray-300',

      // New payment flow statuses
      'awaiting lender acceptance': 'bg-yellow-50 text-yellow-800 border border-yellow-200',
      'lender rejected': 'bg-red-50 text-red-800 border border-red-200',
      'payment pending': 'bg-orange-50 text-orange-800 border border-orange-200',

      'preparing shipment': 'bg-indigo-50 text-indigo-800 border border-indigo-200',
      shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
      'in transit': 'bg-cyan-50 text-cyan-800 border border-cyan-200',
      delivered: 'bg-teal-50 text-teal-800 border border-teal-200',

      // Delivery SLA statuses
      'late delivery - lender fault': 'bg-red-50 text-red-800 border border-red-200',
      'late delivery - carrier fault': 'bg-orange-50 text-orange-800 border border-orange-200',
      'awaiting renter decision': 'bg-purple-50 text-purple-800 border border-purple-200',

      // Rental statuses
      active: 'bg-green-50 text-green-800 border border-green-200',
      return: 'bg-orange-50 text-orange-800 border border-orange-200',
      completed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',

      // Terminal statuses
      cancelled: 'bg-red-50 text-red-800 border border-red-200',
      refunded: 'bg-gray-50 text-gray-800 border border-gray-300',
      disputed: 'bg-red-50 text-red-800 border border-red-200',
    };

    const labels: Record<string, string> = {
      // Old definitions (backwards-compat)
      requested: 'Requested',
      orderplaced: 'Placed',
      placed: 'Placed',

      // New definitions explicitly mapping to their human-readable equivalents
      'awaiting lender acceptance': 'Pending',
      'lender rejected': 'Rejected',
      'payment pending': 'Unpaid',

      accepted: 'Accepted', // Updated to just check Accepted
      'preparing shipment': 'Preparing',
      shipped: 'Shipped',
      'in transit': 'Transit',
      delivered: 'Delivered',

      'late delivery - lender fault': 'Delayed(Lender)',
      'late delivery - carrier fault': 'Delayed(Carrier)',
      'awaiting renter decision': 'Decision(Renter)',

      active: 'Active',
      return: 'Return',
      completed: 'Completed',

      cancelled: 'Cancelled',
      refunded: 'Refunded',
      disputed: 'Disputed',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[status] || 'bg-gray-50 text-gray-800 border border-gray-200'
          }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const normalizeStatus = (status: string) => {
    switch (status) {
      case 'requested':
        return 'requested';
      case 'upcoming':
        return 'orderplaced';
      case 'confirmed':
      case 'accepted':
        return 'accepted';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = (start: string, end: string) =>
    `${formatDate(start)} → ${formatDate(end)}`;

  const columns: Column<Order>[] = [
    {
      header: 'Order',
      key: 'orderNumber',
      render: (_, order) => (
        <div>
          <div className="text-sm font-medium text-gray-900 font-poppins">
            {order.orderNumber}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </div>
        </div>
      )
    },
    {
      header: 'Item',
      key: 'item',
      render: (_, order) => (
        <div className="flex items-start">
          <img
            src={order.items[0]?.image || ''}
            alt={order.items[0]?.title}
            className="h-12 w-12 object-cover rounded mr-3 flex-shrink-0"
          />
          <div>
            <div className="text-sm font-medium text-gray-900 font-poppins">
              {order.items[0]?.title}
            </div>
            <div className="text-sm text-gray-500">
              Size {order.items[0]?.size} • {order.items[0]?.category}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Borrower',
      key: 'borrower',
      render: (_, order) => (
        <div className="flex items-start">
          <AvatarCircle
            name={order.borrower.name}
            src={order.borrower.profileImage || order.borrower.avatar}
            className="mr-3"
          />
          <div>
            <div className="text-sm font-medium text-gray-900 font-poppins">
              {order.borrower.name}
            </div>
            <div className="text-sm text-gray-500">
              {order.borrower.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Rental Dates',
      key: 'startDate',
      render: (_, order) => (
        <span className="font-poppins text-sm text-gray-900">
          {formatDateRange(order.startDate, order.endDate)}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(normalizeStatus(status))
    },
    {
      header: 'Total',
      key: 'totalPrice',
      render: (price) => (
        <span className="text-sm font-medium text-gray-900 font-poppins">
          Rs.{price}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, order) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOrderSelect(order);
          }}
          className="text-gray-800 hover:text-gray-900 focus:ring-2 focus:ring-gray-800 rounded font-poppins text-sm font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  const limit = pagination?.limit || 10;
  const startIndex = pagination ? (pagination.currentPage - 1) * limit + 1 : 1;
  const endIndex = pagination ? Math.min(pagination.currentPage * limit, pagination.totalItems) : orders.length;

  return (
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <ReusableTable
          columns={columns}
          data={orders}
          loading={loading}
          onRowClick={onOrderSelect}
          emptyMessage="No orders found match your current filters."
          idKey="id"
        />
      </div>

      {/* Mobile Grid View */}
      <div className={`md:hidden p-4 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <CommonLoader />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-poppins">No orders found match your current filters.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => onOrderSelect(order)}
                className="bg-white border text-left border-gray-200 p-3 rounded-lg shadow-sm cursor-pointer hover:border-black transition-colors flex flex-col h-full"
              >
                <div className="flex-1 flex flex-col">
                  {/* Image & Title */}
                  <div className="mb-2 w-full aspect-square bg-gray-100 rounded overflow-hidden">
                    <img
                      src={order.items[0]?.image || ''}
                      alt={order.items[0]?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 font-poppins line-clamp-1 mb-1">
                    {order.items[0]?.title}
                  </div>

                  {/* Order & Status */}
                  <div className="flex flex-col mb-2 items-start mt-auto">
                    <span className="text-xs text-gray-500 font-poppins mb-1">#{order.orderNumber}</span>
                    <span className="scale-75 origin-left">{getStatusBadge(normalizeStatus(order.status))}</span>
                  </div>

                  {/* Dates */}
                  <div className="text-[10px] text-gray-500 font-poppins mb-2">
                    <div className="flex flex-col">
                      <span>{formatDate(order.startDate)} - {formatDate(order.endDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-2 border-t border-gray-100 mt-2 flex flex-col items-start gap-1">
                  <span className="text-xs text-gray-500 font-poppins">Total amount</span>
                  <span className="text-sm font-semibold text-gray-900 font-poppins">Rs.{order.totalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* {!loading && orders.length > 0 && pagination && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600 font-poppins">
              Showing {startIndex} to {endIndex} of {pagination.totalItems} orders
            </div>
            {!loading && pagination.totalPages > 1 && onPageChange && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}
