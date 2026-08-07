'use client';

interface Conversation {
  id: string;
  borrower: { name: string; avatar: string };
  lender: { name: string; avatar: string };
  orderId: string;
  lastMessage: string;
  timestamp: string;
  status: string;
  flagged: boolean;
  unread: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  setSelectedConversation,
  activeFilter,
  setActiveFilter
}: ConversationListProps) {
  const filters = [
    { id: 'all', label: 'All', count: conversations.length },
    { id: 'flagged', label: 'Flagged', count: conversations.filter(c => c.flagged).length },
    { id: 'recent', label: 'Recent', count: conversations.filter(c => ['10:42 AM', '9:15 AM'].includes(c.timestamp)).length },
    { id: 'unread', label: 'Unread', count: conversations.filter(c => c.unread).length }
  ];

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-2  text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === filter.id
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-message-line text-gray-400 text-xl"></i>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
            <p className="text-gray-500">No conversations match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'bg-yellow-50 border-r-2 border-yellow-600' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatars */}
                  <div className="flex -space-x-2">
                    <img
                      src={conversation.borrower.avatar}
                      alt={conversation.borrower.name}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src={conversation.lender.avatar}
                      alt={conversation.lender.name}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Names and Order */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${conversation.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                          {conversation.borrower.name} ↔ {conversation.lender.name}
                        </span>
                        {conversation.flagged && (
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-flag-fill text-red-500"></i>
                          </div>
                        )}
                      </div>
                      {conversation.unread && (
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      Order {conversation.orderId}
                    </div>

                    {/* Last Message */}
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conversation.unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {conversation.lastMessage}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {conversation.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}