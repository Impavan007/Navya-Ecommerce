'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Skeleton from '../../components/common/Skeleton';
import CommonModal from '../../components/common/CommonModal';

export default function UpcomingOrders({ upcomingOrders, loading }: any) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // const upcomingOrders = [
  //   {
  //     id: 'ORD-1256',
  //     item: 'Red Evening Dress',
  //     borrower: 'Anna K.',
  //     startDate: 'Oct 3',
  //     endDate: 'Oct 6',
  //     status: 'confirmed',
  //     amount: 'Rs.120.00'
  //   },
  //   {
  //     id: 'ORD-1258',
  //     item: 'Sequin Jacket',
  //     borrower: 'Sophie M.',
  //     startDate: 'Oct 7',
  //     endDate: 'Oct 10',
  //     status: 'confirmed',
  //     amount: 'Rs.85.00'
  //   },
  //   {
  //     id: 'ORD-1260',
  //     item: 'Designer Handbag',
  //     borrower: 'Emma L.',
  //     startDate: 'Oct 12',
  //     endDate: 'Oct 15',
  //     status: 'pending',
  //     amount: 'Rs.60.00'
  //   }
  // ];

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };
  const router = useRouter()
  return (
    <>
      <div className="bg-white rounded-xl border border-[#F0E6D2] overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#E5C9A4] bg-[#FAF4E8]" >
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-serif font-bold text-[#1A1A1A]">Upcoming Orders</h2>
            <button className="text-[14px] font-poppins text-[#BFA15F] hover:text-[#9E7D3B] underline font-semibold cursor-pointer whitespace-nowrap" onClick={() => router.push('/lender/orders')}>
              View All
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#F5EFE6]">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center flex-1">
                      <Skeleton variant="text" width={80} height={16} />
                      <Skeleton variant="rect" width={60} height={20} className="rounded-full" />
                    </div>
                    <Skeleton variant="text" width={60} height={20} />
                  </div>
                  <Skeleton variant="text" width="70%" height={14} />
                  <div className="flex justify-between">
                     <Skeleton variant="text" width="40%" height={12} />
                     <Skeleton variant="circle" width={16} height={16} />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingOrders?.map((order: any) => (
            <div key={order.id} className="p-4 hover:bg-[#FAF8F5] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1 min-w-0">
                    <span className="text-sm font-semibold text-[#1A1A1A] font-poppins truncate min-w-0 flex-1">{order.orderId}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border font-poppins shrink-0 ${order.status === 'confirmed'
                      ? 'bg-[#FAF4E8] text-[#BFA15F] border-[#E5C9A4]'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[14px] text-gray-700 truncate font-poppins">{order.productName}</p>
                  <p className="text-[12px] text-gray-500 font-poppins">{order.renterName} • {order.dates?.start}–{order.dates?.end}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:space-x-3 w-full sm:w-auto">
                  <span className="text-[14px] text-[#1A1A1A] font-poppins font-bold">{order.amount}</span>
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="text-[#BFA15F] hover:text-[#9E7D3B] cursor-pointer"
                  >
                    <i className="ri-arrow-right-line text-sm w-4 h-4 flex items-center justify-center"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
            {/* Order Details Modal */}
      <CommonModal
        isOpen={showOrderModal && !!selectedOrder}
        onClose={() => setShowOrderModal(false)}
        title="Order Details"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-poppins">Order ID:</span>
                  <p className="font-medium text-gray-900 font-poppins">{selectedOrder.orderId || selectedOrder.id}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-poppins">Status:</span>
                  <p className={`font-medium capitalize font-poppins ${selectedOrder.status === 'confirmed' ? 'text-green-600' : 'text-gray-700'
                    }`}>
                    {selectedOrder.status}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 font-poppins">Borrower:</span>
                  <p className="font-medium text-gray-900 font-poppins">{selectedOrder.renterName || selectedOrder.borrower}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-poppins">Product:</span>
                  <p className="font-medium text-gray-900 font-poppins">{selectedOrder.productName || selectedOrder.item}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-poppins">Rental Period:</span>
                  <p className="font-medium text-gray-900 font-poppins">
                    {selectedOrder.dates?.start || selectedOrder.startDate} – {selectedOrder.dates?.end || selectedOrder.endDate}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 font-poppins">Total:</span>
                  <p className="font-medium text-gray-900 font-poppins">{selectedOrder.amount}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap font-poppins rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  router.push('/lender/orders');
                }}
                className="flex-1 px-4 py-2 bg-[#1A1A1A] text-white hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap font-poppins rounded-lg"
              >
                Manage Order
              </button>
            </div>
          </div>
        )}
      </CommonModal>
    </>
  );
}