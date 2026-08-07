'use client';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  type: 'message' | 'system';
}

interface Conversation {
  id: string;
  borrower: { name: string; avatar: string };
  lender: { name: string; avatar: string };
  orderId: string;
  flagged: boolean;
}

interface ConversationViewProps {
  conversation: Conversation | undefined;
  messages: Message[];
  onFlag: () => void;
  onEscalate: () => void;
  onAddNotes: () => void;
}

export default function ConversationView({
  conversation,
  messages,
  onFlag,
  onEscalate,
  onAddNotes
}: ConversationViewProps) {
  const handleExportTranscript = () => {
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="ri-message-line text-gray-400 text-xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a conversation from the list to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Conversation Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              <img
                src={conversation.borrower.avatar}
                alt={conversation.borrower.name}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <img
                src={conversation.lender.avatar}
                alt={conversation.lender.name}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {conversation.borrower.name} ↔ {conversation.lender.name}
              </h2>
              <p className="text-sm text-gray-500">Order {conversation.orderId}</p>
            </div>
            {conversation.flagged && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Flagged
              </span>
            )}
          </div>

          {/* <div className="flex items-center space-x-2">
            <button
              onClick={onFlag}
              className={`px-3 py-2  text-sm font-medium transition-colors whitespace-nowrap ${
                conversation.flagged
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={conversation.flagged ? 'ri-flag-fill' : 'ri-flag-line'}></i>
                </div>
                <span>{conversation.flagged ? 'Unflag' : 'Flag'}</span>
              </div>
            </button>

            <button
              onClick={onAddNotes}
              className="px-3 py-2 bg-gray-100 text-gray-700  hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-sticky-note-line"></i>
                </div>
                <span>Notes</span>
              </div>
            </button>

            <button
              onClick={onEscalate}
              className="px-3 py-2 bg-yellow-600 text-white  hover:bg-yellow-700 transition-colors whitespace-nowrap"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-alert-line"></i>
                </div>
                <span>Escalate</span>
              </div>
            </button>

            <button
              onClick={handleExportTranscript}
              className="px-3 py-2 bg-gray-100 text-gray-700  hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-download-line"></i>
                </div>
                <span>Export</span>
              </div>
            </button>
          </div> */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages in this conversation yet.</p>
          </div>
        ) : (
          messages.map((message) => {
            if (message.type === 'system') {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-gray-100 px-4 py-2 rounded-full">
                    <p className="text-sm text-gray-600 italic">{message.content}</p>
                    <p className="text-xs text-gray-500 text-center mt-1">{message.timestamp}</p>
                  </div>
                </div>
              );
            }

            const isLender = message.sender === 'lender';
            
            return (
              <div key={message.id} className={`flex ${isLender ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3  ${
                  isLender 
                    ? 'bg-yellow-100 text-gray-900' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {isLender ? conversation.lender.name : conversation.borrower.name}
                    </span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}