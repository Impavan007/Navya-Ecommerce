'use client';

import { useState } from 'react';
import DisputesHeader from '../components/disputes/DisputesHeader';
import DisputesTable from '../components/disputes/DisputesTable';
import DisputeDetailModal from '../components/disputes/DisputeDetailModal';
import ExportModal from '../components/disputes/ExportModal';

export interface Dispute {
  id: string;
  orderId: string;
  item: {
    id: string;
    title: string;
    image: string;
    category: string;
  };
  borrower: {
    name: string;
    avatar: string;
    email: string;
  };
  reason: string;
  status: 'open' | 'in-review' | 'resolved';
  dateOpened: string;
  description: string;
  evidence: {
    vendor: Array<{
      type: 'image' | 'document';
      url: string;
      name: string;
      uploadedAt: string;
    }>;
    borrower: Array<{
      type: 'image' | 'document';
      url: string;
      name: string;
      uploadedAt: string;
    }>;
  };
  financialImpact: {
    rentalPrice: number;
    depositHeld: number;
    refundAmount: number;
    payoutAdjustment: number;
  };
  timeline: Array<{
    stage: string;
    date: string;
    description: string;
    actor: string;
  }>;
  adminNotes?: string;
}

const mockDisputes: Dispute[] = [
  {
    id: 'DSP-1012',
    orderId: 'ORD-1256',
    item: {
      id: '1',
      title: 'Red Silk Dress',
      image: 'https://readdy.ai/api/search-image?query=elegant%20red%20silk%20dress%20on%20white%20background%2C%20luxury%20fashion%20photography%2C%20minimalist%20styling%2C%20professional%20product%20shot&width=400&height=500&seq=1&orientation=portrait',
      category: 'Dress'
    },
    borrower: {
      name: 'Anna K.',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20headshot%2C%20blonde%20hair%2C%20friendly%20smile%2C%20business%20portrait%20style&width=100&height=100&seq=2&orientation=squarish',
      email: 'anna.k@email.com'
    },
    reason: 'Late Return',
    status: 'open',
    dateOpened: '2024-10-03',
    description: 'Item was returned 3 days after the agreed return date without prior communication.',
    evidence: {
      vendor: [],
      borrower: [
        {
          type: 'image',
          url: 'https://readdy.ai/api/search-image?query=smartphone%20screenshot%20showing%20text%20message%20conversation%2C%20mobile%20interface%2C%20communication%20evidence&width=300&height=400&seq=3&orientation=portrait',
          name: 'text_conversation.jpg',
          uploadedAt: '2024-10-03'
        }
      ]
    },
    financialImpact: {
      rentalPrice: 45,
      depositHeld: 35,
      refundAmount: 0,
      payoutAdjustment: -15
    },
    timeline: [
      {
        stage: 'Dispute Opened',
        date: '2024-10-03',
        description: 'Dispute raised for late return',
        actor: 'System'
      },
      {
        stage: 'Evidence Submitted',
        date: '2024-10-03',
        description: 'Borrower submitted text conversation',
        actor: 'Anna K.'
      }
    ]
  },
  {
    id: 'DSP-1013',
    orderId: 'ORD-1260',
    item: {
      id: '2',
      title: 'Sequin Jacket',
      image: 'https://readdy.ai/api/search-image?query=gold%20sequin%20blazer%20jacket%20on%20white%20background%2C%20luxury%20fashion%20photography%2C%20sparkling%20texture%2C%20editorial%20style%20product%20shot&width=400&height=500&seq=4&orientation=portrait',
      category: 'Jacket'
    },
    borrower: {
      name: 'Sophie M.',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20headshot%2C%20brunette%20hair%2C%20confident%20expression%2C%20modern%20portrait%20style&width=100&height=100&seq=5&orientation=squarish',
      email: 'sophie.m@email.com'
    },
    reason: 'Damaged Item',
    status: 'in-review',
    dateOpened: '2024-10-01',
    description: 'Jacket returned with visible stain on the front panel and missing sequins.',
    evidence: {
      vendor: [
        {
          type: 'image',
          url: 'https://readdy.ai/api/search-image?query=damaged%20sequin%20jacket%20with%20stain%2C%20close%20up%20photo%20showing%20fabric%20damage%2C%20evidence%20photography&width=400&height=300&seq=6&orientation=landscape',
          name: 'damage_photo_1.jpg',
          uploadedAt: '2024-10-02'
        },
        {
          type: 'document',
          url: '#',
          name: 'cleaning_receipt.pdf',
          uploadedAt: '2024-10-02'
        }
      ],
      borrower: [
        {
          type: 'image',
          url: 'https://readdy.ai/api/search-image?query=sequin%20jacket%20in%20good%20condition%2C%20before%20rental%20photo%2C%20clean%20garment%20documentation&width=400&height=300&seq=7&orientation=landscape',
          name: 'before_rental.jpg',
          uploadedAt: '2024-10-01'
        }
      ]
    },
    financialImpact: {
      rentalPrice: 55,
      depositHeld: 45,
      refundAmount: 0,
      payoutAdjustment: -50
    },
    timeline: [
      {
        stage: 'Dispute Opened',
        date: '2024-10-01',
        description: 'Dispute raised for damaged item',
        actor: 'System'
      },
      {
        stage: 'Evidence Submitted',
        date: '2024-10-01',
        description: 'Borrower submitted before photos',
        actor: 'Sophie M.'
      },
      {
        stage: 'Vendor Response',
        date: '2024-10-02',
        description: 'Vendor submitted damage photos and cleaning receipt',
        actor: 'Vendor'
      },
      {
        stage: 'Under Review',
        date: '2024-10-02',
        description: 'Case assigned to moderation team',
        actor: 'admin'
      }
    ],
    adminNotes: 'Reviewing evidence from both parties. Damage appears significant and cleaning costs are documented.'
  },
  {
    id: 'DSP-1014',
    orderId: 'ORD-1262',
    item: {
      id: '3',
      title: 'Chanel Bag',
      image: 'https://readdy.ai/api/search-image?query=black%20Chanel%20quilted%20handbag%20on%20white%20background%2C%20luxury%20designer%20bag%2C%20classic%20chain%20strap%2C%20professional%20product%20photography&width=400&height=500&seq=8&orientation=portrait',
      category: 'Bag'
    },
    borrower: {
      name: 'Mia P.',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20headshot%2C%20dark%20hair%2C%20elegant%20style%2C%20sophisticated%20portrait&width=100&height=100&seq=9&orientation=squarish',
      email: 'mia.p@email.com'
    },
    reason: 'Non-Payment',
    status: 'resolved',
    dateOpened: '2024-09-25',
    description: 'Payment failed for rental and borrower became unresponsive to payment requests.',
    evidence: {
      vendor: [
        {
          type: 'document',
          url: '#',
          name: 'payment_failure_notice.pdf',
          uploadedAt: '2024-09-25'
        },
        {
          type: 'image',
          url: 'https://readdy.ai/api/search-image?query=email%20conversation%20screenshots%2C%20payment%20reminder%20messages%2C%20communication%20evidence&width=400&height=600&seq=10&orientation=portrait',
          name: 'email_reminders.jpg',
          uploadedAt: '2024-09-26'
        }
      ],
      borrower: []
    },
    financialImpact: {
      rentalPrice: 90,
      depositHeld: 150,
      refundAmount: 60,
      payoutAdjustment: 0
    },
    timeline: [
      {
        stage: 'Dispute Opened',
        date: '2024-09-25',
        description: 'Dispute raised for non-payment',
        actor: 'System'
      },
      {
        stage: 'Evidence Submitted',
        date: '2024-09-25',
        description: 'Vendor submitted payment failure notice',
        actor: 'Vendor'
      },
      {
        stage: 'Additional Evidence',
        date: '2024-09-26',
        description: 'Vendor submitted email communication history',
        actor: 'Vendor'
      },
      {
        stage: 'Resolution',
        date: '2024-09-28',
        description: 'Dispute resolved in favor of vendor. Deposit used to cover rental fee.',
        actor: 'admin'
      }
    ],
    adminNotes: 'Clear evidence of payment failure and lack of borrower response. Deposit covers rental amount with partial refund to borrower.'
  },
  {
    id: 'DSP-1015',
    orderId: 'ORD-1248',
    item: {
      id: '4',
      title: 'Black Evening Gown',
      image: 'https://readdy.ai/api/search-image?query=elegant%20black%20evening%20gown%20on%20white%20background%2C%20formal%20dress%2C%20luxury%20fashion%20photography%2C%20sophisticated%20styling&width=400&height=500&seq=11&orientation=portrait',
      category: 'Dress'
    },
    borrower: {
      name: 'Carla R.',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20headshot%2C%20red%20hair%2C%20friendly%20expression%2C%20business%20portrait%20style&width=100&height=100&seq=12&orientation=squarish',
      email: 'carla.r@email.com'
    },
    reason: 'Item Not as Described',
    status: 'resolved',
    dateOpened: '2024-09-20',
    description: 'Borrower claims dress size was incorrect and did not fit as expected.',
    evidence: {
      vendor: [
        {
          type: 'image',
          url: 'https://readdy.ai/api/search-image?query=dress%20size%20label%20close%20up%2C%20garment%20tag%20showing%20size%20information%2C%20product%20documentation&width=300&height=200&seq=13&orientation=landscape',
          name: 'size_label.jpg',
          uploadedAt: '2024-09-20'
        }
      ],
      borrower: [
        {
          type: 'image',
          url: 'https://readdy.ai/api/search-image?query=dress%20fitting%20issue%2C%20garment%20not%20fitting%20properly%2C%20size%20comparison%20photo&width=300&height=400&seq=14&orientation=portrait',
          name: 'fitting_issue.jpg',
          uploadedAt: '2024-09-20'
        }
      ]
    },
    financialImpact: {
      rentalPrice: 65,
      depositHeld: 55,
      refundAmount: 55,
      payoutAdjustment: -65
    },
    timeline: [
      {
        stage: 'Dispute Opened',
        date: '2024-09-20',
        description: 'Dispute raised for incorrect item description',
        actor: 'System'
      },
      {
        stage: 'Evidence Exchange',
        date: '2024-09-20',
        description: 'Both parties submitted evidence',
        actor: 'Both'
      },
      {
        stage: 'Resolution',
        date: '2024-09-22',
        description: 'Dispute resolved in favor of borrower. Full refund issued.',
        actor: 'admin'
      }
    ],
    adminNotes: 'Size discrepancy confirmed. Vendor listing was inaccurate. Full refund issued to borrower.'
  }
];

export default function DisputesPage() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredDisputes = mockDisputes.filter(dispute => {
    const matchesTab = selectedTab === 'all' || dispute.status === selectedTab;
    const matchesSearch = searchQuery === '' ||
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.borrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;

    return matchesTab && matchesSearch && matchesStatus;
  });

  const getTabCount = (status: string) => {
    if (status === 'all') return mockDisputes.length;
    return mockDisputes.filter(dispute => dispute.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisputesHeader
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          getTabCount={getTabCount}
          onExport={() => setShowExportModal(true)}
        />

        <DisputesTable
          disputes={filteredDisputes}
          onDisputeSelect={setSelectedDispute}
        />

        <DisputeDetailModal
          dispute={selectedDispute!}
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
        />

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={filteredDisputes}
          type="disputes"
        />
      </div>
    </div>
  );
}