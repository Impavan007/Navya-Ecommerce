"use client";

import { useState } from "react";
import MessagingHeader from "./components/MessagingHeader";
import ConversationList from "./components/ConversationList";
import ConversationView from "./components/ConversationView";
import FlagModal from "./components/FlagModal";
import EscalateModal from "./components/EscalateModal";
import AdminNotesModal from "./components/AdminNotesModal";

export default function MessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('C-1001');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState('all');

  const conversations = [
    {
      id: 'C-1001',
      borrower: { name: 'Anna K.', avatar: 'https://readdy.ai/api/search-image?query=young%20professional%20woman%20portrait%20headshot%20clean%20background%20modern%20lighting%20confident%20smile%20business%20casual&width=40&height=40&seq=anna-k&orientation=squarish' },
      lender: { name: 'Zara L.', avatar: 'https://readdy.ai/api/search-image?query=elegant%20woman%20portrait%20headshot%20clean%20background%20modern%20lighting%20warm%20smile%20professional%20attire&width=40&height=40&seq=zara-l&orientation=squarish' },
      orderId: 'ORD-1256',
      lastMessage: 'I\'ll ship tomorrow morning.',
      timestamp: '10:42 AM',
      status: 'active',
      flagged: false,
      unread: false
    },
    {
      id: 'C-1002',
      borrower: { name: 'Sophie M.', avatar: 'https://readdy.ai/api/search-image?query=young%20woman%20portrait%20headshot%20clean%20background%20modern%20lighting%20friendly%20smile%20casual%20attire&width=40&height=40&seq=sophie-m&orientation=squarish' },
      lender: { name: 'Carla R.', avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20headshot%20clean%20background%20modern%20lighting%20confident%20expression%20business%20attire&width=40&height=40&seq=carla-r&orientation=squarish' },
      orderId: 'ORD-1260',
      lastMessage: 'I didn\'t receive the item yet.',
      timestamp: '9:15 AM',
      status: 'flagged',
      flagged: true,
      unread: true
    },
    {
      id: 'C-1003',
      borrower: { name: 'Mia P.', avatar: 'https://readdy.ai/api/search-image?query=young%20woman%20portrait%20headshot%20clean%20background%20modern%20lighting%20bright%20smile%20casual%20professional&width=40&height=40&seq=mia-p&orientation=squarish' },
      lender: { name: 'Emily R.', avatar: 'https://readdy.ai/api/search-image?query=elegant%20woman%20portrait%20headshot%20clean%20background%20modern%20lighting%20warm%20expression%20professional%20attire&width=40&height=40&seq=emily-r&orientation=squarish' },
      orderId: 'ORD-1265',
      lastMessage: 'Thank you for the quick response!',
      timestamp: 'Yesterday',
      status: 'active',
      flagged: false,
      unread: false
    },
    {
      id: 'C-1004',
      borrower: { name: 'Luna S.', avatar: 'https://readdy.ai/api/search-image?query=young%20professional%20woman%20portrait%20headshot%20clean%20background%20modern%20lighting%20confident%20smile%20business%20casual&width=40&height=40&seq=luna-s&orientation=squarish' },
      lender: { name: 'Aria M.', avatar: 'https://readdy.ai/api/search-image?query=elegant%20woman%20portrait%20headshot%20clean%20background%20modern%20lighting%20warm%20smile%20professional%20attire&width=40&height=40&seq=aria-m&orientation=squarish' },
      orderId: 'ORD-1270',
      lastMessage: 'The dress fits perfectly!',
      timestamp: '2 days ago',
      status: 'active',
      flagged: false,
      unread: true
    }
  ];

  const messages = {
    'C-1001': [
      {
        id: 1,
        sender: 'system',
        content: 'Booking created for Gucci Silk Dress',
        timestamp: '2 days ago',
        type: 'system'
      },
      {
        id: 2,
        sender: 'borrower',
        content: 'Hi! I\'m so excited about this dress. When can you ship it?',
        timestamp: '2 days ago',
        type: 'message'
      },
      {
        id: 3,
        sender: 'lender',
        content: 'Hello Anna! I can ship it today. I\'ll send you the tracking number once it\'s picked up.',
        timestamp: '2 days ago',
        type: 'message'
      },
      {
        id: 4,
        sender: 'system',
        content: 'Deposit of Rs.80 held successfully',
        timestamp: '2 days ago',
        type: 'system'
      },
      {
        id: 5,
        sender: 'borrower',
        content: 'Perfect! Thank you so much.',
        timestamp: '1 day ago',
        type: 'message'
      },
      {
        id: 6,
        sender: 'lender',
        content: 'I\'ll ship tomorrow morning.',
        timestamp: '10:42 AM',
        type: 'message'
      }
    ],
    'C-1002': [
      {
        id: 1,
        sender: 'system',
        content: 'Booking created for Prada Mini Dress',
        timestamp: '5 days ago',
        type: 'system'
      },
      {
        id: 2,
        sender: 'borrower',
        content: 'Hi! Looking forward to receiving the dress.',
        timestamp: '5 days ago',
        type: 'message'
      },
      {
        id: 3,
        sender: 'lender',
        content: 'I shipped it yesterday. You should receive it today.',
        timestamp: '3 days ago',
        type: 'message'
      },
      {
        id: 4,
        sender: 'borrower',
        content: 'I didn\'t receive the item yet.',
        timestamp: '9:15 AM',
        type: 'message'
      }
    ]
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' ||
      conv.borrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'flagged' && conv.flagged) ||
      (activeFilter === 'recent' && ['10:42 AM', '9:15 AM'].includes(conv.timestamp)) ||
      (activeFilter === 'unread' && conv.unread);

    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;

    return matchesSearch && matchesFilter && matchesStatus;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <MessagingHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        dateRange={dateRange}
        setDateRange={setDateRange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <div className="flex-1 flex overflow-hidden">
        <ConversationList
          conversations={filteredConversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        <ConversationView
          conversation={conversations.find(c => c.id === selectedConversation)}
          messages={selectedConversation ? messages[selectedConversation] || [] : []}
          onFlag={() => setShowFlagModal(true)}
          onEscalate={() => setShowEscalateModal(true)}
          onAddNotes={() => setShowNotesModal(true)}
        />
      </div>

      {showFlagModal && (
        <FlagModal
          conversation={conversations.find(c => c.id === selectedConversation)}
          onClose={() => setShowFlagModal(false)}
        />
      )}

      {showEscalateModal && (
        <EscalateModal
          conversation={conversations.find(c => c.id === selectedConversation)}
          onClose={() => setShowEscalateModal(false)}
        />
      )}

      {showNotesModal && (
        <AdminNotesModal
          conversation={conversations.find(c => c.id === selectedConversation)}
          onClose={() => setShowNotesModal(false)}
        />
      )}
    </div>
  );
}