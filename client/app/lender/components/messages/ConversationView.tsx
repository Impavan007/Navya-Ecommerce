"use client";

import { useState, useEffect, useRef } from "react";
import { Conversation } from "../../messages/page";
import { useSocketClient, useSocketEvent } from "../../../hooks/useSocket";
import { ChatMessage } from "../../../(site)/services/api/messages";
import { format } from "date-fns";
import { useAuthStore } from "../../../(site)/stores/authStore";
import { toast } from "react-hot-toast";
import CommonLoader from "../../../components/common/CommonLoader";
import { messagesApiService, Attachment } from "../../../(site)/services/api/messages";
import { X, Image as ImageIcon, Paperclip } from "lucide-react";

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
  size = "w-10 h-10",
  textSize = "text-base",
  className = "",
}: {
  name?: string;
  src?: string | null;
  size?: string;
  textSize?: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || "profile"}
        className={`${size} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ${textSize} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

interface ConversationViewProps {
  conversation: Conversation;
  onBack?: () => void;
  onSendMessage?: (
    message: ChatMessage & { status?: string; errorText?: string },
  ) => void;
  isMobile?: boolean;
}

export default function ConversationView({
  conversation,
  onBack,
  onSendMessage,
  isMobile = false,
}: ConversationViewProps) {
  const { user: currentUser } = useAuthStore();
  const { emit, isConnected } = useSocketClient();
  const [newMessage, setNewMessage] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} → ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const handleSendMessage = async (textToSubmit?: string) => {
    const text = textToSubmit || newMessage.trim();
    if (!text && selectedFiles.length === 0) return;

    if (!textToSubmit) setNewMessage("");

    const currentUserId = (currentUser as any)?._id || currentUser?.id;
    const tempId = `temp-${Date.now()}`;

    // Create local previews for optimistic UI
    const localAttachments: Attachment[] = selectedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // Local blob URL for immediate rendering
      full_url: URL.createObjectURL(file)
    }));

    const optimisticMsg: any = {
      _id: tempId,
      chatId: conversation.id,
      content: text,
      attachments: localAttachments,
      sender: currentUserId,
      receiver: conversation.otherUser?._id,
      created_at: new Date().toISOString(),
      delivered: false,
      delivered_at: null,
      read: false,
      read_at: null,
      status: "sending",
      isOptimistic: true
    };

    // notify parent for optimistic UI immediately
    onSendMessage?.(optimisticMsg);
    const filesToUpload = [...selectedFiles];
    setSelectedFiles([]); // Clear input

    

    let finalAttachments: Attachment[] = [];
    if (filesToUpload.length > 0) {
      setUploading(true);
      try {
        const uploadRes = await messagesApiService.uploadAttachments(filesToUpload);
        if (uploadRes.success && uploadRes.data) {
          // Map strictly to { type, url, name } for socket payload
          finalAttachments = uploadRes.data.attachments.map(att => ({
            type: att.type,
            url: att.url,
            name: att.name
          }));

          // Update optimistic message with real URLs for rendering (includes full_url)
          onSendMessage?.({
            ...optimisticMsg,
            attachments: uploadRes.data.attachments
          });
        } else {
          throw new Error(uploadRes.message || "Upload failed");
        }
      } catch (err) {
        console.error("Upload error:", err);
        onSendMessage?.({
          ...optimisticMsg,
          status: "error",
          errorText: "Failed to upload attachments"
        });
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    

    if (conversation.id === "new") {
      // New chat creation via socket
      if (isConnected) {
        const payload = {
          receiverId: conversation.otherUser?._id,
          productId: (conversation as any).product?._id || (conversation as any).productId,
          orderId: (conversation as any).orderId,
          subject: (conversation as any).subject || "Product Query",
          message: {
            content: text,
            attachments: finalAttachments
          }
        };
        
        emit("createChat", payload, (ack: any) => {
          if (ack.success) {
            const finalMsg = {
              ...optimisticMsg,
              _id: ack.message.id,
              chatId: ack.chat.id,
              status: "sent",
            };
            onSendMessage?.(finalMsg);
          } else {
            onSendMessage?.({
              ...optimisticMsg,
              status: "error",
              errorText: ack.message || "Failed to create chat.",
            });
          }
        });
      } else {
        onSendMessage?.({
          ...optimisticMsg,
          status: "error",
          errorText: "Chat not connected. Please refresh.",
        });
      }
    } else if (isConnected) {
      const payload = {
        chatId: conversation.id,
        receiverId: conversation.otherUser?._id,
        content: text,
        attachments: finalAttachments
      };
      
      emit(
        "sendMessage",
        payload,
        (response: any) => {
          if (response.success) {
            const finalMsg = {
              ...optimisticMsg,
              _id: response.messageId,
              status: "sent",
              isOptimistic: false
            };
            onSendMessage?.(finalMsg);
          } else {
            onSendMessage?.({
              ...optimisticMsg,
              status: "error",
              errorText: response.message || "Failed to send message.",
            });
          }
        },
      );
    } else {
      onSendMessage?.({
        ...optimisticMsg,
        status: "error",
        errorText: "Chat not connected. Please refresh.",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.type.startsWith('image/'));
      if (validFiles.length !== files.length) {
        toast.error("Only image files are allowed.");
      }
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleResend = (msg: ChatMessage & { status?: string }) => {
    if (msg.status === "error") {
      // Remove the failed message first or just re-trigger
      // To keep it simple, we'll just try sending again
      handleSendMessage(msg.content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFlag = () => {
    if (flagReason.trim()) {
      setShowFlagModal(false);
      setFlagReason("");
    }
  };

  const handleExport = (format: "pdf" | "csv") => {
    setShowExportModal(false);
  };

  const handleAttachment = () => {
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#F3D6DC] border border-[#F3D6DC] p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobile && onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100  transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line text-[#4B5563] w-5 h-5 flex items-center justify-center"></i>
              </button>
            )}

            <div className="flex items-center space-x-3">
              <AvatarCircle
                name={conversation.otherUser.name}
                src={conversation.otherUser.profile_image}
                size="w-8 h-8 sm:w-10 sm:h-10"
              />
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {conversation.otherUser.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {conversation.chatSlugId}
                </p>
              </div>
            </div>

            <div className="hidden md:block w-[1px] h-10 bg-[#F3D6DC] mx-4"></div>

            <div className="hidden md:flex items-center space-x-3 bg-[#F9FAFB] p-2 rounded-md max-w-[200px] lg:max-w-xs">
              <img
                src={conversation.product?.cover_image || ""}
                alt={conversation.productName}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                  {conversation.productName}
                </p>
                <p className="text-[10px] lg:text-xs text-gray-500 truncate">
                  {conversation.status}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100  transition-colors cursor-pointer"
              >
                <i className="ri-more-line text-gray-600 w-5 h-5 flex items-center justify-center"></i>
              </button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white  shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowFlagModal(true);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-flag-line mr-3 w-4 h-4 inline-flex items-center justify-center"></i>
                      Flag Conversation
                    </button>
                    <button
                      onClick={() => {
                        setShowExportModal(true);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-download-line mr-3 w-4 h-4 inline-flex items-center justify-center"></i>
                      Export Conversation
                    </button>
                    <button
                      onClick={() => {
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-archive-line mr-3 w-4 h-4 inline-flex items-center justify-center"></i>
                      Archive Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* Mobile Item Info */}
        <div className="md:hidden mt-3 pt-3 border-t border-[#F3D6DC]">
          <div className="flex items-center space-x-3 bg-[#F9FAFB] p-2 rounded-md">
            <img
              src={conversation.product?.cover_image || ""}
              alt={conversation.productName}
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {conversation.productName}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {conversation.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF6F3]">
        {conversation.messages.map((message: any) => {
          const senderId =
            typeof message.sender === "object"
              ? message.sender?._id
              : message.sender;
          const isLender =
            senderId === ((currentUser as any)?._id || currentUser?.id);
          const hasError = message.status === "error";

          // Extract sender details if it's an object (for Renter)
          const senderName = (!isLender && typeof message.sender === 'object')
            ? message.sender.name
            : (isLender ? 'You' : conversation.otherUser.name);

          const senderImage = (!isLender && typeof message.sender === 'object')
            ? message.sender.profile_image
            : (isLender ? null : conversation.otherUser.profile_image);

          return (
            <div key={message._id}>
              <div
                className={`flex flex-col ${isLender ? "items-end" : "items-start"}`}
              >
                <div
                  className={`flex ${isLender ? "justify-end" : "justify-start items-end gap-2"}`}
                >
                  {!isLender && (
                    <AvatarCircle
                      name={senderName}
                      src={senderImage}
                      size="w-8 h-8"
                      className="flex-shrink-0 mb-1"
                    />
                  )}
                  <div
                    className={`relative group max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${isLender
                      ? "bg-[#F3D6DC] text-[#3D1126]"
                      : "bg-[#FFFFFF] text-[#3D1126]"
                      } ${hasError ? "opacity-70 border border-red-200" : ""}`}
                  >
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-col gap-2 mb-2">
                        {message.attachments.map((att: Attachment, idx: number) => (
                          <img
                            key={idx}
                            src={att.full_url || (att.url.startsWith('http') || att.url.startsWith('blob:') ? att.url : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${att.url}`)}
                            alt={att.name}
                            className="max-w-full rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '250px', width: 'auto' }}
                            onClick={() => window.open(att.full_url || att.url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    {message.content && (
                      <p className="text-[13px] sm:text-[14px] font-poppins">
                        {message.content}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] sm:text-[11px] text-[#8A8A8A]">
                        {message.created_at
                          ? (() => {
                            try {
                              return format(
                                new Date(message.created_at),
                                "h:mm a",
                              );
                            } catch (e) {
                              return "";
                            }
                          })()
                          : ""}
                      </p>
                      {isLender && message.status === "sending" && (
                        <CommonLoader size="sm" color="gray" />
                      )}
                      {isLender && hasError && (
                        <button
                          onClick={() => handleResend(message)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Click to resend"
                        >
                          <i className="ri-refresh-line text-xs font-bold"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {isLender && hasError && (
                  <span className="text-[9px] text-red-500 mt-1 px-1">
                    {message.errorText ||
                      "unable to send the message please try again"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[#F3D6DC] border-t border-[#F3D6DC] p-3 sm:p-4 flex-shrink-0">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2 bg-[#F3D6DC] flex flex-wrap gap-2 border-b border-[#F3D6DC]">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-md border border-[#F3D6DC]"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-2 sm:space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#323232] hover:text-pink-500 transition-colors cursor-pointer flex-shrink-0"
            disabled={uploading}
          >
            <i className="ri-attachment-line text-xl flex items-center justify-center"></i>
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a message"
              rows={1}
              className="w-full px-3 py-2 pr-10
                   border-0 border-b border-[#393636] 
                   resize-none 
                   bg-transparent
                   focus:outline-none focus:ring-0
                   text-sm sm:text-base"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
            {/* <button className="absolute right-2 bottom-2 sm:bottom-3 text-[#323232] hover:text-[#3D1126]">
              <i className="ri-emotion-line text-lg sm:text-xl"></i>
            </button> */}
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || uploading}
            className="p-1.5 sm:p-2
                 bg-[#1A1A1A] text-[#FAF6F3] 
                 transition-colors cursor-pointer 
                 rounded-lg font-medium
                 whitespace-nowrap flex-shrink-0 flex items-center gap-1 sm:gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <CommonLoader size="sm" color="white" />
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <i className="ri-send-plane-fill text-lg"></i>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Click outside to close actions dropdown */}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActions(false)}
        ></div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-gray-900">
                Flag Conversation
              </h3>
              <button
                onClick={() => setShowFlagModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please provide a reason for flagging this conversation. This
                will help our support team review the issue.
              </p>

              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFlagModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlag}
                  disabled={!flagReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white  hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  Flag Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-gray-900">
                Export Conversation
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose the format to export this conversation for your records.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full flex items-center justify-between p-3 border border-gray-200  hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <i className="ri-file-pdf-line text-red-500 w-5 h-5 flex items-center justify-center"></i>
                    <div>
                      <p className="font-medium text-gray-900">PDF Document</p>
                      <p className="text-sm text-gray-500">
                        Formatted conversation with timestamps
                      </p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                </button>

                <button
                  onClick={() => handleExport("csv")}
                  className="w-full flex items-center justify-between p-3 border border-gray-200  hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <i className="ri-file-excel-line text-green-500 w-5 h-5 flex items-center justify-center"></i>
                    <div>
                      <p className="font-medium text-gray-900">CSV File</p>
                      <p className="text-sm text-gray-500">
                        Spreadsheet format for data analysis
                      </p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                </button>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
