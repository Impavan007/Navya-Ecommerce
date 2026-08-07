'use client';

import { useState } from 'react';
import CommonModal from '../../../components/common/CommonModal';
import { Transaction, TransactionDetail } from '../../store/transactionStore/Transaction';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const getInitials = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'NA';
};

const AvatarCircle = ({
  name,
  image,
  size = 'w-10 h-10',
  textSize = 'text-sm',
  withBorder = false,
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

interface TransactionDetailPanelProps {
  transaction: Transaction;
  transactionDetail: TransactionDetail | null;
  detailLoading: boolean;
  onClose: () => void;
  onTransactionAction: (action: string, transaction: any) => void;
}

export default function TransactionDetailPanel({
  transaction,
  transactionDetail,
  detailLoading,
  onClose,
  onTransactionAction
}: TransactionDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [downloadLoading, setDownloadLoading] = useState(false);

  const getTypeLabel = (type: string) => {
    const labels = {
      'payment': 'Payment',
      'deposit-hold': 'Deposit Hold',
      'deposit-release': 'Deposit Release',
      'refund': 'Refund',
      'late-fee': 'Late Fee',
      'platform-fee': 'Platform Fee',
      'payout': 'Payout',
      'Payment': 'Payment',
      'completed': 'Payment'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-gray-50 text-green-700 border border-green-300',
      pending: 'bg-blue-100 text-blue-700 border border-blue-300',
      failed: 'bg-red-100 text-red-700 border border-red-300',
      completed: 'bg-gray-50 text-green-700 border border-green-300',
      cancelled: 'bg-red-100 text-red-700 border border-red-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border border-gray-300'} font-poppins`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      'payment': 'bg-gray-100 text-gray-700 border border-gray-300',
      'deposit-hold': 'bg-gray-100 text-gray-700 border border-gray-300',
      'deposit-release': 'bg-gray-50 text-green-700 border border-green-300',
      'refund': 'bg-orange-100 text-orange-700 border border-orange-300',
      'late-fee': 'bg-gray-100 text-gray-700 border border-gray-300',
      'platform-fee': 'bg-purple-100 text-purple-700 border border-purple-300',
      'payout': 'bg-blue-100 text-blue-700 border border-blue-300',
      'Payment': 'bg-gray-100 text-gray-700 border border-gray-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-700 border border-gray-300'} font-poppins`}>
        {getTypeLabel(type)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadReceipt = async () => {
    if (!transaction) return;
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
      pdf.save(`receipt_${transaction.transaction_slug_id || transaction.id}.pdf`);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Transaction Details"
      size="xl"
      loading={detailLoading}
    >
      <div className="flex flex-col lg:flex-row -mx-6 -my-6">
        {/* Left Side - Transaction Summary */}
        <div className="w-full lg:w-1/3 bg-gray-50 p-6 border-r border-gray-200">
          {/* Transaction ID & Status */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-lg font-bold text-gray-800 font-poppins">
                {transactionDetail?.transaction_id || transaction.transaction_slug_id}
              </span>
              {getStatusBadge(transactionDetail?.status || transaction.status)}
            </div>
            <div className="space-y-2">
              {getTypeBadge(transactionDetail?.type || transaction.type)}
              <p className="text-sm text-gray-500 font-playfair">
                Created: {formatDate(transactionDetail?.created_at || transaction.date)}
              </p>
              <p className="text-xs text-gray-400 font-mono font-playfair">
                Stripe ID: {transactionDetail?.stripeDetails?.transactionInformation?.stripeTransactionId || transaction.stripeId}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 font-poppins">Amount</h3>
            <div className="text-center">
              <p className="text-3xl font-poppins font-bold text-gray-900">
                Rs.{((transactionDetail?.amount || transaction.amount)).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-playfair">
                {getTypeLabel(transactionDetail?.type || transaction.type)}
              </p>
            </div>
          </div>

          {/* Related Order */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 font-poppins">Related Order</h3>
            <div className="text-center">
              <p className="font-mono text-lg font-semibold text-gray-800 hover:text-gray-900 cursor-pointer font-poppins">
                {transactionDetail?.relatedOrder?.orderNumber || transaction.orderId}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-playfair">
                Status: {transactionDetail?.relatedOrder?.status || 'N/A'}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 font-poppins">Participants</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-poppins font-semibold">BORROWER</p>
                <div className="flex items-center space-x-3">
                  <AvatarCircle
                    name={transactionDetail?.participants?.renter?.name || transaction.borrower.name}
                    image={transaction.borrower.avatar}
                    size="w-10 h-10"
                    textSize="text-sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-poppins">
                      {transactionDetail?.participants?.renter?.name || transaction.borrower.name}
                    </p>
                    <p className="text-xs text-gray-500 font-playfair">
                      {transactionDetail?.participants?.renter?.email || 'Payer'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-poppins font-semibold">LENDER</p>
                <div className="flex items-center space-x-3">
                  <AvatarCircle
                    name={transactionDetail?.participants?.lender?.name || transaction.lender.name}
                    image={transaction.lender.avatar}
                    size="w-10 h-10"
                    textSize="text-sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-poppins">
                      {transactionDetail?.participants?.lender?.name || transaction.lender.name}
                    </p>
                    <p className="text-xs text-gray-500 font-playfair">
                      {transactionDetail?.participants?.lender?.email || 'Recipient'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Detailed Information */}
        <div className="w-full lg:w-2/3 p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'breakdown', label: 'Financial Breakdown' },
                { id: 'stripe', label: 'Stripe Details' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors font-poppins ${activeTab === tab.id
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && transactionDetail && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-4">Transaction Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-poppins font-semibold">Transaction Type</p>
                        <p className="font-semibold text-gray-900 font-poppins">
                          {transactionDetail.overview?.transactionType || getTypeLabel(transaction.type)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-poppins font-semibold">Status</p>
                        {getStatusBadge(transactionDetail.overview?.status || transaction.status)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-poppins font-semibold">Amount</p>
                        <p className="text-xl font-poppins font-semibold text-gray-900">
                          Rs.{(transactionDetail.overview?.amount || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1 font-poppins font-semibold">Processing Time</p>
                        <p className="font-semibold text-gray-900 font-poppins">
                          {transactionDetail.overview?.processingTime || 'Instant'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    {transactionDetail.overview?.paymentMethod ? (
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold font-poppins">
                            {transactionDetail.overview.paymentMethod.brand?.toUpperCase() || 'CARD'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 font-poppins">
                            •••• •••• •••• {transactionDetail.overview.paymentMethod.last4}
                          </p>
                          <p className="text-sm text-gray-500 font-playfair">
                            Expires {transactionDetail.overview.paymentMethod.expiryMonth}/{transactionDetail.overview.paymentMethod.expiryYear}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 font-playfair">Payment method information not available</p>
                    )}
                  </div>
                </div>

                {transactionDetail.timeline && transactionDetail.timeline.length > 0 && (
                  <div>
                    <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-4">Timeline</h3>
                    <div className="space-y-3">
                      {transactionDetail.timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-check-line text-green-600 text-sm"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-semibold text-gray-900 font-poppins">{event.event}</p>
                              <span className="text-sm text-gray-500 font-playfair">{formatDate(event.date)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 font-playfair">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'breakdown' && transactionDetail && (
              <div className="space-y-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900">Financial Breakdown</h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* Card 1: Payment Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 font-poppins">Payment Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-poppins">Rental Amount</span>
                        <span className="font-poppins font-semibold text-gray-900">
                          Rs.{transactionDetail.financialBreakdown?.paymentBreakdown?.components?.rentalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-poppins">Cleaning Fee</span>
                        <span className="font-poppins font-semibold text-gray-900">
                          Rs.{transactionDetail.financialBreakdown?.paymentBreakdown?.components?.cleaningFee?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-poppins">Platform Fee</span>
                        <span className="font-poppins font-semibold text-gray-900">
                          Rs.{transactionDetail.financialBreakdown?.paymentBreakdown?.components?.platformFee?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-poppins">Security Deposit</span>
                        <span className="font-poppins font-semibold text-gray-900">
                          Rs.{transactionDetail.financialBreakdown?.paymentBreakdown?.components?.securityDeposit?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <hr className="border-gray-200 my-4" />
                      <div className="flex justify-between items-center font-semibold bg-white p-3 rounded-lg border">
                        <span className="text-gray-900 font-poppins">Total Paid by Renter</span>
                        <span className="font-poppins text-gray-900 text-lg">
                          Rs.{transactionDetail.financialBreakdown?.paymentBreakdown?.totalPaidByRenter?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Platform Revenue */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 font-poppins">Platform Revenue</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-poppins">Gross Platform Revenue</span>
                        <span className="font-poppins font-semibold text-gray-900">
                          Rs.{transactionDetail.financialBreakdown?.distribution?.toadmin?.amount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-red-600">
                        <span className="font-poppins">Stripe Processing Fee</span>
                        <span className="font-poppins font-semibold">
                          -Rs.{transactionDetail.financialBreakdown?.processingFees?.stripeProcessingFee?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <hr className="border-gray-200 my-4" />
                      <div className="flex justify-between items-center font-semibold bg-white p-3 rounded-lg border">
                        <span className="text-gray-900 font-poppins">Net Platform Earnings</span>
                        <span className="font-poppins text-gray-900 text-lg">
                          Rs.{(
                            (transactionDetail.financialBreakdown?.distribution?.toadmin?.amount || 0) -
                            (transactionDetail.financialBreakdown?.processingFees?.stripeProcessingFee || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Lender Payout */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2 font-poppins">Lender Payout</h4>
                    <p className="text-lg font-bold text-green-700 font-poppins mb-1">
                      Rs.{transactionDetail.financialBreakdown?.distribution?.toLender?.amount?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500 font-playfair">
                      {transactionDetail.financialBreakdown?.distribution?.toLender?.description || 'Rental fees + Cleaning fees paid to lender'}
                    </p>
                  </div>

                  {/* Security Deposit Status */}
                  {transactionDetail.financialBreakdown?.distribution?.heldInEscrow && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-semibold text-gray-900 mb-2 font-poppins">Security Deposit</h4>
                      <p className="text-lg font-bold text-yellow-700 font-poppins mb-1">
                        Rs.{transactionDetail.financialBreakdown.distribution.heldInEscrow.amount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500 font-playfair">
                        Status: <span className="font-semibold capitalize">{transactionDetail.financialBreakdown.distribution.heldInEscrow.status}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'stripe' && transactionDetail && (
              <div className="space-y-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900">Stripe Integration Details</h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 font-poppins underline">Transaction Information</h4>
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-poppins font-semibold">STRIPE TRANSACTION ID</span>
                      <span className="text-gray-800 break-all">
                        {transactionDetail.stripeDetails?.transactionInformation?.stripeTransactionId || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-poppins font-semibold">PAYMENT INTENT ID</span>
                      <span className="text-gray-800 break-all">
                        {transactionDetail.stripeDetails?.transactionInformation?.paymentIntentId || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-poppins font-semibold">CUSTOMER ID</span>
                      <span className="text-gray-800 break-all">
                        {transactionDetail.stripeDetails?.transactionInformation?.customerId || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-gray-500 font-poppins font-semibold">PAYMENT METHOD ID</span>
                      <span className="text-gray-800 break-all">
                        {transactionDetail.stripeDetails?.transactionInformation?.paymentMethodId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => window.open(`https://dashboard.stripe.com/payments/${transactionDetail?.stripeDetails?.transactionInformation?.stripeTransactionId || transaction.stripeId}`, '_blank')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#635BFF] text-white rounded-lg font-medium hover:bg-[#5851E0] transition-colors font-poppins shadow-md"
                  >
                    <i className="ri-external-link-line"></i>
                    <span>View in Stripe Dashboard</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-poppins font-medium"
        >
          Close
        </button>
        <button
          onClick={handleDownloadReceipt}
          disabled={downloadLoading}
          className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors font-poppins shadow-md disabled:opacity-50"
        >
          {downloadLoading ? (
            <i className="ri-loader-4-line animate-spin"></i>
          ) : (
            <i className="ri-download-line"></i>
          )}
          <span>{downloadLoading ? 'Generating...' : 'Download Receipt'}</span>
        </button>
      </div>

      {/* Hidden Receipt Template */}
      <div
        id="receipt-template"
        style={{ display: 'none', width: '800px', padding: '40px', background: 'white' }}
        className="font-poppins"
      >
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">NAVYAA</h1>
            <p className="text-gray-500 italic">Official Transaction Receipt</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-1">Receipt ID</p>
            <p className="text-gray-800 font-mono">{transactionDetail?.transaction_id || transaction.transaction_slug_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Transaction Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold text-gray-900">{getTypeLabel(transactionDetail?.type || transaction.type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-gray-900 capitalize">{transactionDetail?.status || transaction.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-900">{formatDate(transactionDetail?.created_at || transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Gateway</span>
                <span className="font-semibold text-gray-900">Stripe ({transactionDetail?.stripeDetails?.transactionInformation?.stripeTransactionId || transaction.stripeId})</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Related Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Reference</span>
                <span className="font-semibold text-gray-900 font-mono">{transactionDetail?.relatedOrder?.orderNumber || transaction.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Currency</span>
                <span className="font-semibold text-gray-900">EUR (Rs.)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 mb-12 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Transaction Amount</p>
              <p className="text-sm text-gray-500 italic">Processed on {formatDate(transactionDetail?.created_at || transaction.date)}</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-gray-900">
                Rs.{((transactionDetail?.amount || transaction.amount)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 mt-12 text-center">
          <p className="text-gray-600 font-medium mb-1">Thank you for using Navyaa</p>
          <p className="text-gray-400 text-xs">For any support queries, please mention Receipt ID: {transactionDetail?.transaction_id || transaction.transaction_slug_id}</p>
          <p className="text-gray-300 text-[10px] mt-8 uppercase tracking-[0.2em]">© {new Date().getFullYear()} Navyaa Global. All rights reserved.</p>
        </div>
      </div>
    </CommonModal>
  );
}
