"use client";

import { useEffect, useState } from 'react';
import useEarningsStore from '../../stores/earnings/earningsStore';
import Pagination from '../Pagination';
import ReusableTable, { Column } from '../../../components/common/ReusableTable';
import CommonModal from '../../../components/common/CommonModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import Skeleton from '../../../components/common/Skeleton';

export default function EarningsTransactions() {
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLimit, setExportLimit] = useState<number>(100);
  const [exportLoading, setExportLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    transactions,
    transactionsLoading,
    transactionFilters,
    pagination,
    transactionCards,
    fetchTransactions,
  } = useEarningsStore();

  useEffect(() => {
    if (transactionFilters?.currentType) setSelectedType(transactionFilters.currentType);
    if (transactionFilters?.currentStatus) setSelectedStatus(transactionFilters.currentStatus);
    fetchTransactions({
      type: transactionFilters?.currentType || undefined,
      status: transactionFilters?.currentStatus || undefined,
      page: 1
    });
  }, []);

  useEffect(() => {
    fetchTransactions({
      type: selectedType === 'all' ? undefined : selectedType,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      page: currentPage
    });
  }, [selectedType, selectedStatus, currentPage, fetchTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedStatus]);

  const normalizeTypeKey = (type: string) =>
    String(type || '')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

  const getTypeLabel = (type: string) => {
    const key = normalizeTypeKey(type);
    const labels: Record<string, string> = {
      payment: 'Payment',
      deposit_hold: 'Deposit Hold',
      deposit_release: 'Deposit Release',
      refund: 'Refund',
      platform_fee: 'Platform Fee',
      late_fee: 'Late Fee',
      extension_payment: 'Extension Payment',
    };
    return labels[key] || type;
  };

  const getTypeIcon = (type: string) => {
    const key = normalizeTypeKey(type);
    const icons: Record<string, string> = {
      payment: 'ri-money-euro-circle-line',
      deposit_hold: 'ri-lock-line',
      deposit_release: 'ri-unlock-line',
      refund: 'ri-refund-line',
      platform_fee: 'ri-subtract-line',
      late_fee: 'ri-time-line',
      extension_payment: 'ri-repeat-line',
    };
    return icons[key] || 'ri-file-line';
  };

  const getTypeColor = (type: string) => {
    const key = normalizeTypeKey(type);
    const colors: Record<string, string> = {
      payment: 'text-green-600 bg-green-50 border border-green-200',
      deposit_hold: 'text-blue-600 bg-blue-50 border border-blue-200',
      deposit_release: 'text-blue-600 bg-blue-50 border border-blue-200',
      refund: 'text-red-600 bg-red-50 border border-red-200',
      platform_fee: 'text-gray-600 bg-gray-50 border border-gray-200',
      late_fee: 'text-gray-800 bg-gray-100 border border-gray-300',
      extension_payment: 'text-green-600 bg-green-50 border border-green-200',
    };
    return colors[key] || 'text-gray-600 bg-gray-50 border border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    const s = String(status || '').toLowerCase();
    const styles: Record<string, string> = {
      success: 'bg-green-50 text-green-800 border border-green-200',
      pending: 'bg-gray-100 text-gray-800 border border-gray-300',
      failed: 'bg-red-50 text-red-800 border border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border border-gray-300',
      refunded: 'bg-purple-50 text-purple-800 border border-purple-200',
    };
    const labels: Record<string, string> = { success: 'Success', pending: 'Pending', failed: 'Failed', cancelled: 'Cancelled', refunded: 'Refunded' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[s] || styles.pending}`}>
        {labels[s] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: any) => {
    if (typeof amount === 'string') return amount;
    const num = Number(amount || 0);
    const sign = num >= 0 ? '+' : '';
    return `${sign}Rs.${Math.abs(num)}`;
  };

  const handleDownloadReceipt = async (t: any) => {
    if (!t) return;
    setDownloadLoading(true);
    try {
      const element = document.getElementById('receipt-template');
      if (!element) throw new Error('Template not found');

      element.style.display = 'block';
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt_${t.transaction_slug_id || t.id}.pdf`);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns: Column<any>[] = [
    {
      header: 'Transaction',
      key: 'transaction_slug_id',
      render: (id, t) => (
        <div>
          <div className="text-sm font-medium text-gray-900 font-poppins">{id}</div>
          <div className="text-xs text-gray-500 font-poppins">{t.description}</div>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'type',
      render: (type) => (
        <div className="flex items-center">
          <div className={`p-1.5 mr-2 rounded ${getTypeColor(type)}`}>
            <i className={`${getTypeIcon(type)} w-4 h-4 flex items-center justify-center`}></i>
          </div>
          <span className="text-sm text-gray-900 font-poppins">{getTypeLabel(type)}</span>
        </div>
      )
    },
    {
      header: 'Order ID',
      key: 'orderId',
      render: (val) => <span className="text-sm text-gray-900 font-poppins">{val}</span>
    },
    {
      header: 'Amount',
      key: 'amount',
      render: (val) => (
        <span className={`text-sm font-medium font-poppins ${val >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
          {formatAmount(val)}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: 'Date',
      key: 'date',
      render: (val) => <span className="text-sm text-gray-900 font-poppins">{formatDate(val)}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTransaction(t);
          }}
          className="text-gray-800 hover:text-gray-900 font-medium text-sm font-poppins underline"
        >
          Details
        </button>
      )
    }
  ];

  const startIndex = (currentPage - 1) * (pagination?.limit || 10) + 1;
  const endIndex = Math.min(currentPage * (pagination?.limit || 10), pagination?.totalItems || 0);
  
  return (
    <div className="space-y-6 p-3 sm:p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Income', val: transactionCards?.totalIncome?.amount !== undefined ? `Rs.${transactionCards.totalIncome.amount}` : null, icon: 'ri-arrow-down-line', color: 'bg-green-50 text-green-600' },
          { label: 'Total Fees', val: transactionCards?.totalFees?.amount !== undefined ? `Rs.${transactionCards.totalFees.amount}` : null, icon: 'ri-arrow-up-line', color: 'bg-red-50 text-red-600' },
          { label: 'Transactions', val: transactionCards?.transactions.count !== undefined ? String(transactionCards.transactions.count) : null, icon: 'ri-exchange-line', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending', val: transactionCards?.pending?.count !== undefined ? String(transactionCards.pending.count) : null, icon: 'ri-time-line', color: 'bg-gray-100 text-gray-800' },
        ].map((card, i) => (
          <div key={i} className="bg-white shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className={`${card.color} p-3 rounded`}>
              <i className={`${card.icon} text-xl w-6 h-6 flex items-center justify-center`}></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">{card.label}</p>
              {transactionsLoading || card.val === null ? (
                <Skeleton width="100px" height="28px" className="mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 font-poppins">{card.val}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-poppins font-bold text-gray-900">Transaction History</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-2">
              {/* <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-200 text-sm font-poppins focus:ring-1 focus:ring-gray-800 outline-none"
              >
                <option value="all">All Types</option>
                {['Payment', 'Deposit Hold', 'Deposit Release', 'Refund', 'Platform Fee', 'Late fee'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select> */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 text-sm font-poppins focus:ring-1 focus:ring-gray-800 outline-none"
              >
                <option value="all">All Status</option>
                {['Success', 'Pending', 'Failed'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-sm font-poppins flex items-center gap-2 rounded transition-colors"
            >
              <i className="ri-download-line font-normal"></i> Export
            </button>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <ReusableTable
            columns={columns}
            data={transactions}
            loading={transactionsLoading}
            onRowClick={(t) => setSelectedTransaction(t)}
            emptyMessage="No transactions found"
          />
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          {transactionsLoading ? (
            <div className="text-center py-8 text-gray-500 font-poppins">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-poppins">No transactions found</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {transactions.map((t: any) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTransaction(t)}
                  className="bg-white border text-left border-gray-200 p-3 rounded-lg shadow-sm cursor-pointer hover:border-black transition-colors flex flex-col h-full"
                >
                  <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col items-start mb-2 mt-auto">
                      <span className="text-xs text-gray-500 font-poppins mb-1">{t.transaction_slug_id}</span>
                      <div className="scale-75 origin-left">{getStatusBadge(t.status)}</div>
                    </div>

                    {/* Details */}
                    <div className="text-[10px] text-gray-600 font-poppins mb-2 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 text-gray-700">
                        <i className={`text-xs ${getTypeIcon(t.type)}`}></i>
                        <span className="font-medium line-clamp-1">{getTypeLabel(t.type)}</span>
                      </div>
                      <div className="text-gray-500 mt-2">
                        {formatDate(t.date)}
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-2 border-t border-gray-100 mt-2 flex flex-col items-start gap-1">
                    <span className="text-xs text-gray-500 font-poppins">Amount</span>
                    <span className={`text-sm font-semibold font-poppins ${t.amount >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                      {formatAmount(t.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!transactionsLoading && transactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600 font-poppins">
                Showing {startIndex} to {endIndex} of {pagination?.totalItems || 0} transactions
              </div>
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <CommonModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 border border-gray-200 rounded">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-3 mr-3 rounded ${getTypeColor(selectedTransaction.type)}`}>
                    <i className={`${getTypeIcon(selectedTransaction.type)} text-lg w-5 h-5 flex items-center justify-center`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 font-poppins">{getTypeLabel(selectedTransaction.type)}</h4>
                    <p className="text-sm text-gray-600">{selectedTransaction.transaction_slug_id}</p>
                  </div>
                </div>
                {getStatusBadge(selectedTransaction.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm font-poppins">
                <div>
                  <span className="text-gray-500">Amount</span>
                  <p className={`font-semibold ${selectedTransaction.amount >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                    {formatAmount(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Date</span>
                  <p className="font-medium text-gray-900">{formatDate(selectedTransaction.date)}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 font-poppins">Related Order</h4>
              <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                <i className="ri-shopping-bag-line text-gray-500 mr-3 text-lg"></i>
                <div className="font-poppins">
                  <span className="text-sm font-medium text-gray-900">{selectedTransaction.orderId}</span>
                  <p className="text-xs text-gray-600">{selectedTransaction.description}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 font-poppins">Additional Info</h4>
              <div className="space-y-2 text-sm font-poppins">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-900 font-medium">{getTypeLabel(selectedTransaction.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Processed</span>
                  <span className="text-gray-900 font-medium">{formatDate(selectedTransaction.date)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-poppins text-sm"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadReceipt(selectedTransaction)}
                disabled={downloadLoading}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors font-poppins text-sm disabled:opacity-50"
              >
                {downloadLoading ? 'Generating...' : 'Download Receipt'}
              </button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* Export Modal */}
      <CommonModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Transactions"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-poppins">
            Enter the maximum number of transactions to include in the CSV export.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={exportLimit}
              onChange={(e) => setExportLimit(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-800 outline-none font-poppins"
            />
            <span className="text-sm text-gray-500 font-poppins">rows</span>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-poppins text-sm"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setExportLoading(true);
                try {
                  const typeParam = selectedType === 'all' ? undefined : selectedType;
                  const statusParam = selectedStatus === 'all' ? undefined : selectedStatus;
                  const exported = await fetchTransactions({ type: typeParam, status: statusParam, page: 1, limit: exportLimit });
                  const rows = exported && exported.length ? exported : [];

                  if (rows.length > 0) {
                    const headersSet = new Set<string>();
                    rows.forEach((r: any) => Object.keys(r || {}).forEach((k) => headersSet.add(k)));
                    const headers = Array.from(headersSet);

                    const csvLines = [headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',')];
                    rows.forEach((r: any) => {
                      csvLines.push(headers.map((h) => {
                        const v = r?.[h];
                        if (v === null || v === undefined) return '""';
                        if (typeof v === 'object') return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
                        return `"${String(v).replace(/"/g, '""')}"`;
                      }).join(','));
                    });

                    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `transactions_${Date.now()}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }
                  setShowExportModal(false);
                } catch (err) {
                  console.error('Export failed', err);
                } finally {
                  setExportLoading(false);
                }
              }}
              disabled={exportLoading}
              className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors text-sm font-medium disabled:opacity-50 font-poppins"
            >
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </CommonModal>
      {/* Hidden Receipt Template */}
      <div
        id="receipt-template"
        style={{ display: 'none', width: '800px', padding: '40px', background: 'white' }}
        className="font-poppins"
      >
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">NAVYAA</h1>
            <p className="text-gray-500">Transaction Receipt</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">Receipt ID:</p>
            <p className="text-gray-600">{selectedTransaction?.transaction_slug_id || selectedTransaction?.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Transaction Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900">{selectedTransaction ? getTypeLabel(selectedTransaction.type) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-gray-900">{selectedTransaction?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{selectedTransaction ? formatDate(selectedTransaction.date) : ''}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Related Order</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-medium text-gray-900">{selectedTransaction?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Description</span>
                <span className="font-medium text-gray-900 text-right max-w-[200px]">{selectedTransaction?.description}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-600">Total Amount</span>
            <span className={`text-3xl font-bold ${selectedTransaction?.amount >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
              {selectedTransaction ? formatAmount(selectedTransaction.amount) : ''}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 mt-12 text-center text-gray-400 text-sm">
          <p>Thank you for using Navyaa. For any questions regarding this transaction, please contact support.</p>
          <p className="mt-2">© {new Date().getFullYear()} Navyaa. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}