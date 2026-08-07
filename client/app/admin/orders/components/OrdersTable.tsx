'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useLenderOrderTableStore, OrderTableItem } from '../../store/order/AdminOrderstore';
import CommonModal from '../../../components/common/CommonModal';
import CommonLoader from '../../../components/common/CommonLoader';

export interface Column<T> {
  header: string;
  key: string;
  render?: (value: any, item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

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

interface OrdersTableProps {
  activeTab: string;
  searchQuery: string;
  filters: any;
  selectedOrders: string[];
  onSelectionChange: (selected: string[]) => void;
  onOrderClick: (order: any) => void;
  onOrderAction: (action: string, order: any) => void;
}

export default function OrdersTable({
  activeTab,
  searchQuery,
  filters,
  selectedOrders,
  onSelectionChange,
  onOrderClick,
  onOrderAction,
}: OrdersTableProps) {

  const { orders, loading, fetchOrders, updateOrderStatus } = useLenderOrderTableStore();

  useEffect(() => {
    fetchOrders({ activeTab, searchQuery, filters });
  }, [activeTab, searchQuery, filters, fetchOrders]);

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: string | null;
    order: OrderTableItem | null;
  }>({ open: false, action: null, order: null });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();

    const styles: Record<string, string> = {
      // Old statuses (keeping for backwards compatibility)
      requested: 'bg-gray-50 text-gray-800 border border-gray-200',
      confirmed: 'bg-blue-50 text-blue-800 border border-blue-200',
      orderplaced: 'bg-gray-100 text-gray-800 border border-gray-300',

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
      late: 'bg-red-50 text-red-800 border border-red-200',
    };

    const labels: Record<string, string> = {
      // Old definitions (backwards-compat)
      requested: 'Requested',
      orderplaced: 'Placed',

      // New definitions explicitly mapping to their human-readable equivalents
      'awaiting lender acceptance': 'Pending',
      'lender rejected': 'Rejected',
      'payment pending': 'Unpaid',

      confirmed: 'Confirmed',
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
      late: 'Late',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border ${styles[s] || 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
      >
        {labels[s] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const openConfirmModal = (action: string, order: OrderTableItem) => {
    setConfirmModal({ open: true, action, order });
    setNote('');
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, action: null, order: null });
    setNote('');
  };

  const confirmAction = async () => {
    if (confirmModal.action && confirmModal.order) {
      try {
        setUpdatingOrderId(confirmModal.order.id);
        if (confirmModal.action === 'mark-disputed') {
          await updateOrderStatus(confirmModal.order.id, 'Disputed', note);
          onOrderAction('mark-disputed', { ...confirmModal.order, note });
        } else {
          onOrderAction(confirmModal.action, confirmModal.order);
        }
      } catch (error) {
        console.error('Error performing action:', error);
      } finally {
        setUpdatingOrderId(null);
        closeConfirmModal();
      }
    }
  };

  const TooltipButton = ({
    label,
    tooltip,
    colorClasses,
    onClick,
    disabled = false,
  }: {
    label: string;
    tooltip: string;
    colorClasses: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${colorClasses}`}
      >
        {disabled ? 'Updating...' : label}
      </button>

      {!disabled && (
        <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-1 py-1 bg-gray-800 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
          {tooltip}
        </span>
      )}
    </div>
  );

  const getActionButtons = (order: OrderTableItem) => {
    const isUpdating = updatingOrderId === order.id;

    switch (order.status.toLowerCase()) {
      case 'active':
        return (
          <div className="flex items-center space-x-1">
            <TooltipButton
              label="Cancel"
              tooltip="Cancel this active booking and refund if applicable."
              colorClasses="bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => openConfirmModal('cancel', order)}
              disabled={isUpdating}
            />
          </div>
        );

      case 'return':
        return (
          <TooltipButton
            label="Mark Disputed"
            tooltip="Mark this order as disputed and initiate resolution process."
            colorClasses="border border-gray-500 bg-gray-900 text-white hover:border-gray-200"
            onClick={() => openConfirmModal('mark-disputed', order)}
            disabled={isUpdating}
          />
        );

      default:
        return (
          <TooltipButton
            label="View Details"
            tooltip="View the full details and timeline of this order."
            colorClasses="border border-gray-500 bg-gray-900 text-white hover:border-gray-200"
            onClick={() => onOrderClick(order)}
            disabled={isUpdating}
          />
        );
    }
  };

  const columns: Column<OrderTableItem>[] = [
    {
      header: 'Order ID',
      key: 'orderNumber',
      render: (val) => <span className="font-mono text-sm font-semibold text-gray-800">{val}</span>
    },
    {
      header: 'Buyer',
      key: 'borrower',
      render: (_, order) => (
        <div className="flex flex-col items-center text-center space-y-1">
          <AvatarCircle name={order.borrower.name} image={order.borrower.avatar} />
          <span className="text-xs font-bold text-gray-900">{order.borrower.name}</span>
        </div>
      )
    },
    {
      header: 'Seller',
      key: 'lender',
      render: (_, order) => (
        <div className="flex flex-col items-center text-center space-y-1">
          <AvatarCircle name={order.lender.name} image={order.lender.avatar} />
          <span className="text-sm font-medium text-gray-900">{order.lender.name}</span>
        </div>
      )
    },
    {
      header: 'Item(s)',
      key: 'items',
      render: (items: any[]) => (
        <div className="flex flex-col items-center space-y-1">
          <div className="flex -space-x-2">
            {items.slice(0, 2).map((item, index) => (
              <img
                key={index}
                src={item.image || ''}
                alt={item.name}
                className="w-10 h-12 object-cover rounded border-2 border-white shadow-sm"
              />
            ))}
            {items.length > 2 && (
              <div className="w-10 h-12 bg-gray-50 rounded border-2 border-white flex items-center justify-center shadow-sm">
                <span className="text-xs font-medium text-gray-600">
                  +{items.length - 2}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{items[0].name}</p>
            {items.length > 1 && (
              <p className="text-xs text-gray-500">+{items.length - 1} more</p>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Amount',
      key: 'totalAmount',
      render: (val) => <span className="text-sm font-semibold text-gray-900">Rs.{val}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, order) => (
        <div onClick={(e) => e.stopPropagation()}>
          {getActionButtons(order)}
        </div>
      )
    }
  ];

  const idKey = 'id';
  const emptyMessage = "No orders found.";
  const headerClassName = "bg-gray-50";

  const renderTable = () => {
    if (loading && orders.length === 0) {
      return (
        <div className="flex items-center justify-center py-16">
          <CommonLoader size="md" />
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <i className="ri-inbox-line text-3xl text-gray-300"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{emptyMessage}</h3>
          </div>
        </div>
      );
    }

    return (
      <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
        
        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-4 bg-gray-50">
          {orders.map((item, rowIdx) => {
            const id = String(item.id);
            const isSelected = selectedOrders.includes(id);
            
            return (
              <div 
                key={id || rowIdx} 
                className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-md`}
                onClick={() => onOrderClick && onOrderClick(item)}
              >
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-canela">Select Order</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      const newSelected = selectedOrders.includes(id)
                        ? selectedOrders.filter(sid => sid !== id)
                        : [...selectedOrders, id];
                      onSelectionChange(newSelected);
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                </div>
                <div className="p-4 space-y-3">
                  {columns.map((column, colIdx) => (
                    <div key={colIdx} className="flex justify-between items-center text-sm font-roboto border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-canela">{column.header}</span>
                      <div className="text-gray-900 flex-1 flex justify-end text-right pl-4">
                        {column.render
                          ? column.render((item as any)[column.key], item)
                          : String((item as any)[column.key])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full divide-y divide-gray-200">
            <thead className={headerClassName}>
              <tr>
                <th className="w-12 px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onChange={() => {
                      if (selectedOrders.length === orders.length) {
                        onSelectionChange([]);
                      } else {
                        onSelectionChange(orders.map(item => String(item.id)));
                      }
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                </th>
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className={`px-6 py-4 text-left text-xs text-black font-semibold uppercase tracking-wider font-canela whitespace-nowrap ${column.className || ''}`}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <i className="ri-arrow-up-down-line text-gray-400"></i>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((item, rowIdx) => {
                const id = String(item.id);
                const isSelected = selectedOrders.includes(id);

                return (
                  <tr
                    key={id || rowIdx}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer`}
                    onClick={() => onOrderClick && onOrderClick(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newSelected = selectedOrders.includes(id)
                            ? selectedOrders.filter(sid => sid !== id)
                            : [...selectedOrders, id];
                          onSelectionChange(newSelected);
                        }}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                      />
                    </td>
                    {columns.map((column, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 text-sm text-gray-700 font-roboto whitespace-nowrap ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render((item as any)[column.key], item)
                          : String((item as any)[column.key])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderTable()}

      <CommonModal
        isOpen={confirmModal.open}
        onClose={closeConfirmModal}
        title={confirmModal.action === 'mark-disputed' ? 'Mark as Disputed' : 'Confirm Action'}
        loading={updatingOrderId !== null}
      >
        <div className="space-y-4">
          <p className="text-gray-600 font-poppins">
            Are you sure you want to mark order <strong>{confirmModal.order?.orderNumber || confirmModal.order?.id}</strong> as disputed?
          </p>

          {confirmModal.action === 'mark-disputed' && (
            <div>
              <label htmlFor="dispute-note" className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                Add Note (Optional)
              </label>
              <textarea
                id="dispute-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter reason for marking as disputed..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-roboto"
              />
              <p className="text-xs text-gray-500 mt-1 font-roboto">
                This note will be recorded with the status change.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={closeConfirmModal}
              disabled={updatingOrderId !== null}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors font-roboto"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              disabled={updatingOrderId !== null}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors font-roboto"
            >
              {updatingOrderId ? 'Updating...' : 'Mark as Disputed'}
            </button>
          </div>
        </div>
      </CommonModal>
    </>
  );
}
