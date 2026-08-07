import { useState } from "react";
import { Conversation } from "../../messages/page";
import { MessageSquare, SearchX } from "lucide-react";
import EmptyState from "./EmptyState";
import CommonLoader from "../../../components/common/CommonLoader";

const getInitials = (name?: string) => {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  return initials || "NA";
};

const AvatarCircle = ({
  name,
  src,
  size = "w-12 h-12",
  textSize = "text-base",
}: {
  name?: string;
  src?: string | null;
  size?: string;
  textSize?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || "profile"}
        className={`${size} rounded-full object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full bg-[#FFFFFF] text-gray-700 flex items-center justify-center font-semibold ${textSize}`}
    >
      {getInitials(name)}
    </div>
  );
};

interface MessagesInboxProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  hasActiveFilters?: boolean;
  loading?: boolean;
}

export default function MessagesInbox({
  conversations,
  selectedConversation,
  onConversationSelect,
  hasActiveFilters = false,
  loading = false,
}: MessagesInboxProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full">
        <CommonLoader size="md" color="gray" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 h-full">
        {hasActiveFilters ? (
          <EmptyState
            icon={SearchX}
            title="No matching conversations"
            description="We couldn't find any chats matching your current search or filters. Try adjusting them."
          />
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No active chats yet"
            description="When you receive a booking, messages will appear here. You'll be able to communicate with borrowers about their rentals."
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto ">
      <div className="divide-y divide-[#F3D6DC] ">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onConversationSelect(conversation)}
            className={`p-4 hover:bg-[#edf8f1] cursor-pointer transition-colors ${selectedConversation?.id === conversation.id
                ? "bg-[#DCFCE7] border-l-4 border-[#78E378]"
                : ""
              }`}
          >
            <div className="flex items-start space-x-3">
              {/* Borrower Avatar */}
              <div className="flex-shrink-0 relative">
                <AvatarCircle
                  name={conversation.otherUser.name}
                  src={conversation.otherUser.profile_image}
                  size="w-10 h-10 sm:w-12 sm:h-12"
                />
                {conversation.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border-2 border-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>

              {/* Conversation Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Borrower Name and Order Info */}
                    <div className="flex items-center flex-wrap gap-x-2 mb-1">
                      <h3
                        className={`text-sm font-medium truncate ${conversation.unreadCount > 0
                            ? "text-gray-900"
                            : "text-gray-700"
                          }`}
                      >
                        {conversation.otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        •
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {conversation.chatSlugId}
                      </span>
                      {conversation.status === "flagged" && (
                        <i className="ri-flag-line text-red-500 w-3 h-3 flex items-center justify-center flex-shrink-0"></i>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={conversation.product?.cover_image || ""}
                        alt={conversation.productName}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover flex-shrink-0"
                      />
                      <span className="text-[11px] sm:text-xs text-gray-500 truncate">
                        {conversation.productName}
                      </span>
                    </div>

                    {/* Last Message Preview */}
                    <p
                      className={`text-xs sm:text-sm line-clamp-1 ${conversation.unreadCount > 0
                          ? "font-medium text-gray-900"
                          : "text-gray-600"
                        }`}
                    >
                      {conversation.subject}
                    </p>
                  </div>

                  {/* Right Side - Timestamp and Indicators */}
                  <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                      {formatTimestamp(conversation.lastMessageAt)}
                    </span>

                    <div className="flex items-center space-x-1">
                      {conversation.status === "flagged" && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
