'use client';

import { useState } from 'react';

interface ReportResultsProps {
  category: string;
  data: any;
  onExport: () => void;
}

export default function ReportResults({ category, data, onExport }: ReportResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 10;

  const sampleData = {
    bookings: [
      {
        id: 'ORD-1256',
        borrower: 'Anna K.',
        lender: 'Zara L.',
        items: 'Chanel Dress, Gucci Bag',
        amount: 'Rs.210',
        status: 'Completed',
        date: '2025-01-15'
      },
      {
        id: 'ORD-1257',
        borrower: 'Sophie M.',
        lender: 'Carla R.',
        items: 'Valentino Heels',
        amount: 'Rs.85',
        status: 'Active',
        date: '2025-01-14'
      },
      {
        id: 'ORD-1258',
        borrower: 'Emily R.',
        lender: 'Mia P.',
        items: 'Hermès Scarf',
        amount: 'Rs.45',
        status: 'Pending',
        date: '2025-01-13'
      }
    ],
    transactions: [
      {
        id: 'TXN-4501',
        type: 'Payment',
        amount: 'Rs.210',
        status: 'Success',
        date: '2025-01-15',
        orderId: 'ORD-1256'
      },
      {
        id: 'TXN-4502',
        type: 'Deposit Hold',
        amount: 'Rs.80',
        status: 'Success',
        date: '2025-01-15',
        orderId: 'ORD-1256'
      },
      {
        id: 'TXN-4503',
        type: 'Refund',
        amount: 'Rs.150',
        status: 'Pending',
        date: '2025-01-14',
        orderId: 'ORD-1260'
      }
    ],
    payouts: [
      {
        id: 'P-3001',
        lender: 'Carla R.',
        orderId: 'ORD-1255',
        netAmount: 'Rs.298',
        status: 'Completed',
        date: '2025-01-15'
      },
      {
        id: 'P-3002',
        lender: 'Zara L.',
        orderId: 'ORD-1256',
        netAmount: 'Rs.178',
        status: 'Processing',
        date: '2025-01-14'
      }
    ],
    disputes: [
      {
        id: 'DSP-1012',
        orderId: 'ORD-1260',
        reason: 'Late Return',
        status: 'Resolved',
        date: '2025-01-13',
        resolution: 'Partial refund issued'
      },
      {
        id: 'DSP-1013',
        orderId: 'ORD-1261',
        reason: 'Item Damage',
        status: 'Open',
        date: '2025-01-12',
        resolution: 'Under investigation'
      }
    ],
    reviews: [
      {
        id: 'R-7001',
        orderId: 'ORD-1256',
        reviewer: 'Anna K. (Borrower)',
        recipient: 'Zara L.',
        rating: 4,
        status: 'Approved',
        date: '2025-01-15'
      },
      {
        id: 'R-7002',
        orderId: 'ORD-1260',
        reviewer: 'Sophie M. (Borrower)',
        recipient: 'Carla R.',
        rating: 2,
        status: 'Flagged',
        date: '2025-01-14'
      }
    ],
    users: [
      {
        id: 'U-2001',
        name: 'Anna K.',
        email: 'anna***@mail.com',
        role: 'Both',
        status: 'Active',
        joinDate: '2024-12-15',
        totalBookings: 12
      },
      {
        id: 'U-2002',
        name: 'Sophie M.',
        email: 'sophie***@mail.com',
        role: 'Borrower',
        status: 'Active',
        joinDate: '2024-11-20',
        totalBookings: 8
      }
    ]
  };

  const currentData = sampleData[category as keyof typeof sampleData] || [];
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Completed': 'bg-[#F3D6DC] text-green-800',
      'Active': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Success': 'bg-[#F3D6DC] text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Resolved': 'bg-[#F3D6DC] text-green-800',
      'Open': 'bg-red-100 text-red-800',
      'Approved': 'bg-[#F3D6DC] text-green-800',
      'Flagged': 'bg-yellow-100 text-yellow-800',
      'Removed': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="w-4 h-4 flex items-center justify-center">
            <i className={`ri-star-${star <= rating ? 'fill' : 'line'} text-yellow-400`}></i>
          </div>
        ))}
      </div>
    );
  };

  const renderTableHeaders = () => {
    const headers = {
      bookings: ['Order ID', 'Borrower', 'Lender', 'Items', 'Amount', 'Status', 'Date'],
      transactions: ['Transaction ID', 'Type', 'Amount', 'Status', 'Date', 'Order ID'],
      payouts: ['Payout ID', 'Lender', 'Order ID', 'Net Amount', 'Status', 'Date'],
      disputes: ['Dispute ID', 'Order ID', 'Reason', 'Status', 'Resolution', 'Date'],
      reviews: ['Review ID', 'Order ID', 'Reviewer', 'Recipient', 'Rating', 'Status', 'Date'],
      users: ['User ID', 'Name', 'Email', 'Role', 'Status', 'Join Date', 'Bookings']
    };

    return headers[category as keyof typeof headers] || [];
  };

  const renderTableRow = (item: any, index: number) => {
    switch (category) {
      case 'bookings':
        return (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.borrower}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lender}</td>
            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.items}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.amount}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
          </tr>
        );
      case 'transactions':
        return (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.amount}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.orderId}</td>
          </tr>
        );
      case 'payouts':
        return (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lender}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.orderId}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.netAmount}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
          </tr>
        );
      case 'disputes':
        return (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.orderId}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.reason}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.resolution}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
          </tr>
        );
      case 'reviews':
        return (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.orderId}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.reviewer}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.recipient}</td>
            <td className="px-6 py-4 whitespace-nowrap">{renderStars(item.rating)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
          </tr>
        );
      case 'users':
        return (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.role}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.joinDate}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalBookings}</td>
          </tr>
        );
      default:
        return null;
    }
  };

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
              <i className="ri-file-chart-line"></i>
            </div>
          </div>
          <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">No Report Generated</h3>
          <p className="text-gray-600 mb-6">Configure your filters and generate a report to view results</p>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-yellow-600 text-white  text-sm font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap"
          >
            Generate Sample Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-semibold text-gray-900 capitalize">
              {category} Report
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentData.length} records found
            </p>
          </div>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-yellow-600 text-white  text-sm font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-download-line"></i>
              </div>
              <span>Export</span>
            </div>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-word-wrap">
          <thead className="bg-gray-50">
            <tr>
              {renderTableHeaders().map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>{header}</span>
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-arrow-up-down-line"></i>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => renderTableRow(item, index))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, currentData.length)} of {currentData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === page
                      ? 'bg-yellow-600 text-white border-yellow-600'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}