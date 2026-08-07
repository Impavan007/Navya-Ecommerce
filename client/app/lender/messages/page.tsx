"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import MessagesInbox from "../components/messages/MessagesInbox";
import ConversationView from "../components/messages/ConversationView";
import MessagesHeader from "../components/messages/MessagesHeader";
import {
  messagesApiService,
  LenderChatItem,
  ChatMessage,
} from "../../(site)/services/api/messages";
import { useSocketEvent, useSocketClient } from "../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../(site)/stores/authStore";
import { MessageSquare } from "lucide-react";
import EmptyState from "../components/messages/EmptyState";

export interface Message {
  id: string;
  senderId: string;
  senderType: "borrower" | "lender" | "system";
  content: string;
  timestamp: string;
  attachments?: string[];
  isRead: boolean;
}

export interface Conversation extends LenderChatItem {
  messages: ChatMessage[];
}

export default function MessagesPage() {
  const { user: currentUser } = useAuthStore();
  const { emit } = useSocketClient();
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isMobileConversationOpen, setIsMobileConversationOpen] =
    useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({
    unread: 0,
    flagged: 0,
    activeOrders: 0,
  });

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messagesApiService.getLenderChats();
      if (response.success && response.data) {
        setConversations(
          response.data.items.map((item) => ({ ...item, messages: [] })),
        );
        setUnreadCounts(response.data.filterCounts);
      }
    } catch (error) {
      console.error("Error fetching lender chats:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchParams = useSearchParams();
  const queryChatId = searchParams.get("chatId");
  const queryProductId = searchParams.get("productId");
  const queryOrderId = searchParams.get("orderId");
  const queryBuyerId = searchParams.get("buyerId");
  const queryBuyerName = searchParams.get("buyerName");
  const queryBuyerAvatar = searchParams.get("buyerAvatar");
  const queryProductName = searchParams.get("productName");
  const queryProductImage = searchParams.get("productImage");

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (loading) return;

    const queryChatId = searchParams.get("chatId");
    const queryProductId = searchParams.get("productId");
    const queryBuyerId = searchParams.get("buyerId");
    const queryBuyerName = searchParams.get("buyerName");
    const queryBuyerAvatar = searchParams.get("buyerAvatar");
    const queryProductName = searchParams.get("productName");
    const queryProductImage = searchParams.get("productImage");
    const queryOrderId = searchParams.get("orderId");

    const selectChat = async () => {
      if (queryChatId) {
        const conv = conversations.find((c) => c.id === queryChatId);
        if (conv) {
          handleConversationSelect(conv);
        } else {
          // If not in the list, fetch it specifically
          try {
            const response = await messagesApiService.getChatMessages(queryChatId);
            if (response.success && response.data) {
              const detailedChat = response.data;
              const renterInfo = detailedChat.participants.renter;
              const newConv: Conversation = {
                id: detailedChat.chatId,
                chatSlugId: detailedChat.chatId.substring(0, 8),
                productId: detailedChat.product._id,
                productName: detailedChat.product.name,
                lastMessageAt: new Date().toISOString(),
                unreadCount: 0,
                otherUser: {
                  _id: renterInfo._id,
                  name: renterInfo.name,
                  profile_image: renterInfo.profile_image,
                  role: detailedChat.participants.renter.role || 'renter'
                },
                status: "open",
                messages: detailedChat.messages,
                product: detailedChat.product,
              } as any;
              setConversations((prev) => (prev.some((c) => c.id === newConv.id) ? prev : [newConv, ...prev]));
              setSelectedConversation(newConv);
              setIsMobileConversationOpen(true);
            }
          } catch (error) {
            console.error("Error fetching specific chat:", error);
          }
        }
      } else if (queryProductId && queryBuyerId) {
        const existingConv = conversations.find(
          (c) =>
            ((c as any).productId === queryProductId || (c as any).product?._id === queryProductId) &&
            (c.otherUser?._id === queryBuyerId || (c.otherUser as any)?.id === queryBuyerId),
        );

        if (existingConv) {
          handleConversationSelect(existingConv);
        } else {
          // Create a synthetic conversation for a new chat
          const newConv: Conversation = {
            id: "new",
            chatSlugId: "New Chat",
            productId: queryProductId,
            productName: queryProductName || "Product",
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0,
            otherUser: {
              _id: queryBuyerId,
              name: queryBuyerName || "Borrower",
              profile_image: queryBuyerAvatar || null,
            },
            status: "open",
            messages: [],
            orderId: queryOrderId,
            product: {
              _id: queryProductId,
              name: queryProductName || "Product",
              cover_image: queryProductImage || "",
            },
          } as any;
          setSelectedConversation(newConv);
          setConversations((prev) => (prev.some((c) => c.id === "new") ? prev : [newConv, ...prev]));
          setIsMobileConversationOpen(true);
        }
      }
    };

    selectChat();
  }, [loading, queryChatId, queryProductId, queryBuyerId, conversations.length]);

  // Handle incoming real-time messages
  const handleIncomingMessage = (data: any) => {
    const incomingMsg = data.data || data;
    
    if (incomingMsg && incomingMsg.chatId) {
      const currentUserId = (currentUser as any)?._id || currentUser?.id;
      const senderId =
        typeof incomingMsg.sender === "object"
          ? incomingMsg.sender._id
          : incomingMsg.sender;
      const isOwnMessage = senderId === currentUserId;

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === incomingMsg.chatId) {
            // Determine preview text
            const previewText = incomingMsg.content 
              ? incomingMsg.content 
              : (incomingMsg.attachments?.length > 0 ? "📷 Photo" : conv.subject);

            // Update otherUser if sender is an object (for Renter)
            const otherUserUpdate = (!isOwnMessage && typeof incomingMsg.sender === 'object') ? {
              name: incomingMsg.sender.name || conv.otherUser.name,
              profile_image: incomingMsg.sender.profile_image || conv.otherUser.profile_image
            } : {};

            // Check if this is a real message replacing a temporary one
            const existingTempIndex = conv.messages.findIndex(
              (m) =>
                (m as any).status === "sending" &&
                m.content === incomingMsg.content,
            );

            if (existingTempIndex !== -1) {
              const newMessages = [...conv.messages];
              newMessages[existingTempIndex] = incomingMsg;
              return {
                ...conv,
                subject: previewText,
                otherUser: { ...conv.otherUser, ...otherUserUpdate },
                lastMessageAt: incomingMsg.created_at,
                messages: newMessages,
              };
            }

            // Prevent duplicates by ID
            const isDuplicate = conv.messages.some(
              (m) => m._id === incomingMsg._id,
            );
            if (isDuplicate) return conv;

            return {
              ...conv,
              subject: previewText,
              otherUser: { ...conv.otherUser, ...otherUserUpdate },
              lastMessageAt: incomingMsg.created_at,
              unreadCount: isOwnMessage
                ? conv.unreadCount
                : (conv.unreadCount || 0) + 1,
              messages: [...conv.messages, incomingMsg],
            };
          }
          return conv;
        }),
      );

      // Update selected conversation if it's the one receiving the message
      setSelectedConversation((prev) => {
        if (prev && prev.id === incomingMsg.chatId) {
          // If a new message arrives for the current chat, mark it as read via socket
          if (!isOwnMessage) {
            emit("markChatRead", { chatId: incomingMsg.chatId });
          }

          // Check for temporary message replacement
          const existingTempIndex = prev.messages.findIndex(
            (m) =>
              (m as any).status === "sending" &&
              m.content === incomingMsg.content,
          );

          if (existingTempIndex !== -1) {
            const newMessages = [...prev.messages];
            newMessages[existingTempIndex] = incomingMsg;
            return {
              ...prev,
              messages: newMessages,
              unreadCount: 0,
            };
          }

          // Prevent duplicates by ID
          const isDuplicate = prev.messages.some(
            (m) => m._id === incomingMsg._id,
          );
          if (isDuplicate) return prev;

          return {
            ...prev,
            messages: [...prev.messages, incomingMsg],
            unreadCount: 0, // Reset unread if we are currently looking at it
          };
        }
        return prev;
      });
    }
  };

  useSocketEvent("getMessages", handleIncomingMessage);
  useSocketEvent("receiveMessage", handleIncomingMessage);

  // Handle message delivery status
  useSocketEvent("messageDelivered", (payload: any) => {
    const { messageId, deliveredAt } = payload;
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        messages: conv.messages.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true, delivered_at: deliveredAt } : msg
        ),
      }))
    );
    setSelectedConversation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true, delivered_at: deliveredAt } : msg
        ),
      };
    });
  });

  // Handle message read status
  useSocketEvent("messageRead", (payload: any) => {
    const { messageId, readAt } = payload;
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        messages: conv.messages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true, read_at: readAt } : msg
        ),
      }))
    );
    setSelectedConversation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true, read_at: readAt } : msg
        ),
      };
    });
  });

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      searchQuery === "" ||
      conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.chatSlugId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && conv.unreadCount > 0) ||
      (filter === "flagged" && conv.status === "flagged") ||
      (filter === "active" && conv.status === "open");

    return matchesSearch && matchesFilter;
  });

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsMobileConversationOpen(true);

    if (conversation.id === "new") return;

    // Trigger markChatRead socket event
    emit("markChatRead", { chatId: conversation.id });

    // Update unread count locally immediately
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv,
      ),
    );

    // Fetch messages for this chat if not already loaded
    if (conversation.messages.length === 0) {
      try {
        const response = await messagesApiService.getChatMessages(
          conversation.id,
        );
        if (response.success && response.data) {
          const detailedChat = response.data;
          // In lender view, otherUser is the renter
          const renterInfo = detailedChat.participants.renter;

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversation.id
                ? {
                  ...conv,
                  messages: detailedChat.messages,
                  unreadCount: 0,
                  otherUser: {
                    ...conv.otherUser,
                    name: renterInfo.name,
                    profile_image: renterInfo.profile_image,
                  },
                }
                : conv,
            ),
          );
          setSelectedConversation((prev) =>
            prev?.id === conversation.id
              ? {
                ...prev,
                messages: detailedChat.messages,
                unreadCount: 0,
                otherUser: {
                  ...prev.otherUser,
                  name: renterInfo.name,
                  profile_image: renterInfo.profile_image,
                },
              }
              : prev,
          );
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error);
      }
    }
  };

  const handleBackToInbox = () => {
    setIsMobileConversationOpen(false);
    setSelectedConversation(null);
  };

  const totalUnreadCount = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0,
  );

  const updateMessageInState = (msg: any) => {
    const isFinalStatus = msg.status === "sent" || msg.status === "error";

    setSelectedConversation((prev) => {
      if (!prev || prev.id !== selectedConversation?.id) return prev;

      const newMessages = [...prev.messages];

      if (isFinalStatus) {
        // Find the temporary message by matching content and status 'sending'
        const tempIndex = newMessages.findIndex(
          (m) => (m as any).status === "sending" && m.content === msg.content,
        );

        if (tempIndex !== -1) {
          newMessages[tempIndex] = msg;
          return { ...prev, messages: newMessages };
        }
      }

      // If this was a new chat, we need to update the chatId of the conversation itself
      if (selectedConversation?.id === "new" && msg.chatId && msg.chatId !== "new") {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === "new" ? { ...c, id: msg.chatId } : c
          )
        );
        setSelectedConversation(prev => prev ? { ...prev, id: msg.chatId } : null);
      }

      // If not replacing a temp message, check for duplicates by ID before adding
      if (!newMessages.some((m) => m._id === msg._id)) {
        return { ...prev, messages: [...newMessages, msg] };
      }
      return prev;
    });

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConversation?.id) {
          const newMessages = [...c.messages];
          if (isFinalStatus) {
            const tempIndex = newMessages.findIndex(
              (m) =>
                (m as any).status === "sending" && m.content === msg.content,
            );
            if (tempIndex !== -1) {
              newMessages[tempIndex] = msg;
              return {
                ...c,
                messages: newMessages,
                lastMessageAt: msg.created_at,
              };
            }
          }

          if (!newMessages.some((m) => m._id === msg._id)) {
            return {
              ...c,
              messages: [...newMessages, msg],
              lastMessageAt: msg.created_at,
            };
          }
        }
        return c;
      }),
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.72rem)] lg:h-[calc(100vh-0rem)] overflow-hidden">
      {/* Main Messages Header */}
      <MessagesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        totalUnreadCount={totalUnreadCount}
      />

      {/* Content Area - Inbox and Conversation */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile: Show either inbox or conversation */}
        <div
          className={`lg:hidden w-full h-full ${isMobileConversationOpen ? "hidden" : "flex flex-col"}`}
        >
          <MessagesInbox
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
            hasActiveFilters={searchQuery !== "" || filter !== "all"}
            loading={loading}
          />
        </div>

        <div
          className={`lg:hidden w-full h-full ${isMobileConversationOpen ? "flex flex-col" : "hidden"}`}
        >
          {selectedConversation && (
            <ConversationView
              conversation={selectedConversation}
              onBack={handleBackToInbox}
              onSendMessage={updateMessageInState}
              isMobile={true}
            />
          )}
        </div>

        {/* Desktop: Show both inbox and conversation */}
        <div className="hidden lg:flex w-full h-full">
          <div className="w-1/3 border-r border-[#F3D6DC] bg-[#F3D6DC] flex flex-col h-full">
            <MessagesInbox
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              hasActiveFilters={searchQuery !== "" || filter !== "all"}
              loading={loading}
            />
          </div>

          <div className="flex-1 bg-white flex flex-col h-full">
            {selectedConversation ? (
              <ConversationView
                conversation={selectedConversation}
                onSendMessage={updateMessageInState}
                isMobile={false}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <EmptyState
                  icon={MessageSquare}
                  title="Select a conversation"
                  description="Choose a conversation from the inbox to start messaging with borrowers. You can discuss rental details, pickup times, and more."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
