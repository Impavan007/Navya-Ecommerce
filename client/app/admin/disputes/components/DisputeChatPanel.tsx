'use client';

import { LuMessageSquare } from "react-icons/lu";
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSocketClient, useSocketEvent } from "../../../hooks/useSocket";
import { format } from "date-fns";
import axiosClient from "../../adminApi/axiosClient";
import { API_ENDPOINTS } from "../../adminApi/apiEndpoints";
import useDisputeStore from "../../store/DisputeStore/Disputestore";
import CommonLoader from "../../../components/common/CommonLoader";
import { toast } from "react-hot-toast";
import { messagesApiService } from "../../../(site)/services/api/messages";

interface ChatProps {
  dispute: any;
}

interface User {
  name: string;
  role: 'Renter' | 'Lender' | 'admin';
  avatar?: string | null;
}

interface Message {
  id: string | number;
  sender: User;
  text: string;
  attachments?: any[];
  time: string;
  role: string;
}

export default function DisputeChatPanel({ dispute }: ChatProps) {
  const { emit, isConnected } = useSocketClient();
  const { historyMessages, isFetchingHistory, fetchOrderChatHistory } = useDisputeStore();
  const [activeView, setActiveView] =
    useState<'renter' | 'lender' | 'history'>((dispute?.creator_role?.toLowerCase() === 'lender' && dispute?.lender?.chatId) ? 'lender' : 'renter');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync activeView if dispute changes or loads
  useEffect(() => {
    if (dispute?.creator_role?.toLowerCase() === 'lender' && dispute?.lender?.chatId) {
      setActiveView('lender');
    } else if (dispute?.creator_role?.toLowerCase() === 'renter' && dispute?.borrower?.chatId) {
      setActiveView('renter');
    }
  }, [dispute?.id, dispute?.creator_role, dispute?.borrower?.chatId, dispute?.lender?.chatId]);

  /* ================= USERS ================= */

  const renter: User = {
    name: dispute?.borrower?.name || 'Renter',
    role: 'Renter',
    avatar: dispute?.borrower?.avatar,
  };

  const lender: User = {
    name: dispute?.lender?.name || 'Lender',
    role: 'Lender',
    avatar: dispute?.lender?.avatar,
  };

  const admin: User = {
    name: 'admin',
    role: 'admin',
    avatar: null,
  };

  /* ================= SOCKETS ================= */

  useSocketEvent("receiveSupportMessage", (data: any) => {


    const targetChatId = activeView === 'lender' ? dispute?.lender?.chatId : (activeView === 'renter' ? dispute?.borrower?.chatId : null);
    const targetSupportId = dispute?.id;

    // Capture message if it matches either the current chat segment OR the overall support ticket ID
    if (String(data.chatId) === String(targetChatId) || String(data.supportId) === String(targetSupportId)) {
      const senderId = String(data.sender);
      let resolvedSender = renter;
      let resolvedRole = 'Renter';

      // Identify the sender
      if (data.senderRole === 'admin' || data.role === 'admin') {
        resolvedSender = admin;
        resolvedRole = 'admin';
      } else if (activeView === 'lender') {
        resolvedSender = lender;
        resolvedRole = 'Lender';
      } else {
        resolvedSender = renter;
        resolvedRole = 'Renter';
      }

      const receivedContent = (data.content || data.message || "").trim();
      const receivedTempId = data.tempId;

      setChatMessages(prev => {
        // Avoid duplicates: Check if we already have this message (by server ID or optimistic content match)
        const exists = prev.some(m =>
          (data._id && String(m.id) === String(data._id)) ||
          (receivedTempId && String(m.id) === String(receivedTempId)) ||
          (resolvedRole === 'admin' && m.role === 'admin' && m.text.trim() === receivedContent && String(m.id).length > 10) // Simple optimistic match
        );

        if (exists) {
          // If it exists but is currently optimistic/sending, update it with server ID and final attachments
          return prev.map(m =>
            (receivedTempId && String(m.id) === String(receivedTempId)) ||
              (resolvedRole === 'admin' && m.role === 'admin' && m.text.trim() === receivedContent && String(m.id).length > 10)
              ? {
                ...m,
                id: data._id || m.id,
                attachments: data.attachments?.length > 0 ? data.attachments : m.attachments,
              }
              : m
          );
        }

        const newMessage: Message = {
          id: data._id || data.id || Date.now(),
          sender: resolvedSender,
          text: receivedContent,
          attachments: data.attachments || [],
          time: format(new Date(data.created_at || Date.now()), "p"),
          role: resolvedRole
        };
        return [...prev, newMessage];
      });
    }
  });

  const handleSendMessage = useCallback(async () => {
    const isClosed = ['closed', 'rejected'].includes(dispute?.status?.toLowerCase());
    if ((!message.trim() && selectedFiles.length === 0) || !isConnected || !dispute?.id || isClosed) return;

    const targetUserId = activeView === 'lender' ? dispute.lender?.id : dispute.borrower?.id;
    const targetChatId = activeView === 'lender' ? dispute.lender?.chatId : dispute.borrower?.chatId;
    const currentFiles = [...selectedFiles];
    const tempId = Date.now().toString();

    // Add optimistically for admin
    const newMessage: Message = {
      id: tempId,
      sender: admin,
      text: message.trim(),
      attachments: currentFiles.map(f => ({
        type: f.type,
        url: URL.createObjectURL(f),
        name: f.name,
        isOptimistic: true,
      })),
      time: format(new Date(), "p"),
      role: 'admin'
    };
    setChatMessages(prev => [...prev, newMessage]);
    setMessage('');
    setSelectedFiles([]);

    let uploadedAttachments: any[] = [];
    if (currentFiles.length > 0) {
      try {
        setUploading(true);
        const uploadResp = await messagesApiService.uploadAttachments(currentFiles);
        if (uploadResp.success && uploadResp.data?.attachments) {
          uploadedAttachments = uploadResp.data.attachments.map((att: any) => ({
            type: att.type,
            url: att.url,
            name: att.name,
          }));
        } else {
          throw new Error(uploadResp.message || "Upload failed");
        }
      } catch (error: any) {
        console.error("DEBUG: Upload error:", error);
        toast.error("Failed to upload attachments. Message not sent.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    const payload = {
      supportId: dispute.id,
      userId: targetUserId,
      content: message.trim(),
      attachments: uploadedAttachments,
    };


    if (!isConnected) {
      toast.error("Socket not connected. Please wait a moment or refresh if it persists.");
      return;
    }

    emit("sendSupportMessage", payload);
  }, [message, isConnected, dispute, emit, activeView, selectedFiles, admin]);

  // Fetch messages when tab changes
  useEffect(() => {
    if (activeView === 'history') {
      if (dispute?.id) fetchOrderChatHistory(dispute.id);
      return;
    }

    const fetchChatHistory = async () => {
      const targetChatId = activeView === 'lender' ? dispute?.lender?.chatId : (activeView === 'renter' ? dispute?.borrower?.chatId : null);

      if (!targetChatId) {
        setChatMessages([]);
        return;
      }

      setIsLoading(true);
      try {

        const res = await axiosClient.get(`${API_ENDPOINTS.CHATS}/${targetChatId}/messages`);
        const data = res.data?.data || res.data;
        const apiMessages = data?.messages || [];
        const participants = data?.participants || {};

        // Map API messages to local Message format
        const mappedMessages: Message[] = apiMessages.map((m: any) => {
          const senderId = String(m.sender);
          let resolvedSender = renter; // default
          let resolvedRole = 'Renter';

          // Check against participants
          if (participants.admin && String(participants.admin._id) === senderId) {
            resolvedSender = admin;
            resolvedRole = 'admin';
          } else if (participants.lender && String(participants.lender._id) === senderId) {
            resolvedSender = lender;
            resolvedRole = 'Lender';
          } else if (participants.renter && String(participants.renter._id) === senderId) {
            resolvedSender = renter;
            resolvedRole = 'Renter';
          } else {
            // Fallback logic
            const isFromadmin = m.senderType?.toLowerCase() === 'support' || m.senderType?.toLowerCase() === 'admin' || m.role?.toLowerCase() === 'admin';
            if (isFromadmin) {
              resolvedSender = admin;
              resolvedRole = 'admin';
            } else if (activeView === 'lender') {
              resolvedSender = lender;
              resolvedRole = 'Lender';
            } else {
              resolvedSender = renter;
              resolvedRole = 'Renter';
            }
          }

          return {
            id: m._id || m.id,
            sender: resolvedSender,
            text: m.content || m.message || "",
            attachments: m.attachments || [],
            time: format(new Date(m.created_at || Date.now()), "p"),
            role: resolvedRole
          };
        });

        setChatMessages(mappedMessages);
      } catch (err) {
        console.error("DEBUG: Failed to fetch chat history:", err);
        setChatMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [activeView, dispute?.id, dispute?.borrower?.chatId, dispute?.lender?.chatId, fetchOrderChatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= HELPERS ================= */

  const getInitial = (name: string) =>
    name.charAt(0).toUpperCase();

  const Avatar = ({ user }: { user: User }) => {
    if (user.avatar && !user.avatar.includes('placeholder')) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-semibold">
        {getInitial(user.name)}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#F3D6DC]">

      {/* ================= CONVERSATION VIEW ================= */}

      <div className="px-4 py-3 border-b border-[#E5C8CE] bg-[#F3D6DC]">
        <h3 className="text-sm font-semibold text-[#3D1126] mb-4 font-poppins flex items-center gap-2">
          <LuMessageSquare className="text-lg" />
          Conversation View
        </h3>

        <div className="flex gap-4">

          {/* Renter - Only show if role is Renter and chatId exists */}
          {(dispute?.creator_role?.toLowerCase() === 'renter' || dispute?.borrower?.chatId) && (
            <button
              onClick={() => setActiveView('renter')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${activeView === 'renter'
                ? 'bg-[#1A1A1A] text-[#FFFFFF] border-[#D1D5DB]'
                : 'bg-white text-[#3D1126] border-[#D1D5DB]'
                }`}
            >
              <i className="ri-user-line"></i>
              Renter
            </button>
          )}

          {/* Lender - Only show if role is Lender and chatId exists */}
          {(dispute?.creator_role?.toLowerCase() === 'lender' || dispute?.lender?.chatId) && (
            <button
              onClick={() => setActiveView('lender')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${activeView === 'lender'
                ? 'bg-[#1A1A1A] text-[#FFFFFF] border-[#D1D5DB]'
                : 'bg-white text-[#3D1126] border-[#D1D5DB]'
                }`}
            >
              <i className="ri-user-3-line"></i>
              Lender
            </button>
          )}

          {/* History - Only show if it's an order-linked dispute */}
          {dispute.isOrder && (
            <button
              onClick={() => setActiveView('history')}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium border transition ${activeView === 'history'
                ? 'bg-[#1A1A1A] text-white border-[#3D1126]'
                : 'bg-white text-[#3D1126] border-[#D5D5D5]'
                }`}
            >
              <i className="ri-eye-line"></i>
              View Chat History
            </button>
          )}

        </div>
      </div>

      {/* ================= PARTICIPANTS HEADER ================= */}
      <div className="px-6 py-4 flex items-center border-b border-[#E5C8CE] bg-[#F3D6DC]/30 gap-4">
        {/* Overlapping Avatars */}
        <div className="flex -space-x-4 rtl:space-x-reverse relative z-0">
          {!(dispute?.creator_role?.toLowerCase() === 'lender' || dispute?.lender?.chatId) ? (<><Avatar user={lender} /> <Avatar user={renter} /></>) : (<>{dispute?.creator_role?.toLowerCase() === 'renter' ? <Avatar user={renter} /> : <Avatar user={lender} />}</>)}
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center">
          <h4 className="text-[17px] font-bold text-[#3D1126] leading-tight mb-0.5">
            {activeView === 'lender' ? lender.name : activeView === 'renter' ? renter.name : `${lender.name} & ${renter.name}`}
          </h4>
          <span className="text-[13px] text-[#6D6D6D] font-normal font-roboto">
            Private conversation • Live Support
          </span>
        </div>
      </div>

      {/* ================= CHAT CONTENT ================= */}

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6" ref={scrollRef}>
        {(activeView === 'history') ? (
          <>
            {isFetchingHistory && (
              <div className="flex justify-center items-center py-10">
                <CommonLoader size="sm" color="gray" />
              </div>
            )}
            {!isFetchingHistory && historyMessages.length === 0 && (
              <div className="text-center py-20 text-gray-500 font-playfair">
                No historical order messages found.
              </div>
            )}
            {!isFetchingHistory && historyMessages.map((msg: any) => {
              const isFromLender = msg.sender_id === dispute?.lender?.id;
              const msgSender = isFromLender ? lender : renter;
              const msgRole = isFromLender ? 'Lender' : 'Renter';

              return (
                <div
                  key={msg.id || msg._id}
                  className="flex items-end gap-3 justify-start"
                >
                  <Avatar user={msgSender} />

                  <div className="max-w-[75%] px-5 py-4 rounded-2xl text-sm shadow-sm bg-white border border-[#E5C8CE] text-[#3D1126] rounded-bl-md">
                    <p className="text-[10px] font-bold mb-1 opacity-60 uppercase">{msgSender.name} ({msgRole})</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-col gap-2 mb-2">
                        {msg.attachments.map((att: any, idx: number) => (
                          <img
                            key={idx}
                            src={att.url.startsWith('http') || att.url.startsWith('blob:') ? att.url : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${att.url}`}
                            alt={att.name}
                            className="max-w-full rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '200px', width: 'auto' }}
                            onClick={() => window.open(att.url.startsWith('http') ? att.url : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${att.url}`, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    <p className="break-all">{msg.content}</p>
                    <p className="text-xs text-[#6D6D6D] mt-2">
                      {format(new Date(msg.created_at || Date.now()), "p")}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <CommonLoader size="sm" color="gray" />
              </div>
            )}
            {!isLoading && chatMessages.length === 0 && (
              <div className="text-center py-20 text-gray-500 font-playfair">
                No active messages. Start the conversation below.
              </div>
            )}
            {!isLoading && chatMessages.map((msg: Message) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.role === 'admin'
                  ? 'justify-end'
                  : 'justify-start'
                  }`}
              >
                {msg.role !== 'admin' && (
                  <Avatar user={msg.sender} />
                )}

                <div
                  className={`max-w-[75%] px-5 py-4 rounded-2xl text-sm shadow-sm ${msg.role === 'admin'
                    ? 'bg-[#EED0D6] text-[#3D1126] rounded-br-md'
                    : 'bg-[#DCFCE7] border border-[#E5C8CE] text-[#3D1126] rounded-bl-md'
                    }`}
                >
                  <p className="text-[10px] font-bold mb-1 opacity-60 uppercase">{msg.sender.name} ({msg.sender.role})</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {msg.attachments.map((att: any, idx: number) => (
                        <img
                          key={idx}
                          src={att.url.startsWith('http') || att.url.startsWith('blob:') ? att.url : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${att.url}`}
                          alt={att.name}
                          className="max-w-full rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ maxHeight: '200px', width: 'auto' }}
                          onClick={() => window.open(att.url.startsWith('http') ? att.url : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${att.url}`, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  {msg.text && <p className="break-all">{msg.text}</p>}
                  <p className="text-xs text-[#6D6D6D] mt-2">
                    {msg.time}
                  </p>
                </div>

                {msg.role === 'admin' && (
                  <Avatar user={msg.sender} />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* ================= INPUT SECTION / READ-ONLY FOOTER ================= */}
      {activeView === 'history' || ['closed', 'rejected'].includes(dispute?.status?.toLowerCase()) ? (
        <div className="px-3 py-3 border-t border-[#E5C8CE] bg-[#F3D6DC]/50 flex items-center justify-center gap-3 text-[#64748B]">
          <i className="ri-lock-line text-lg"></i>
          <p className="text-[15px] font-medium font-roboto">
            {dispute?.status?.toLowerCase() === 'closed'
              ? "This dispute is closed. You can no longer send messages."
              : dispute?.status?.toLowerCase() === 'rejected'
                ? "This dispute is rejected. You can no longer send messages."
                : "This is a read-only view of the private conversation"}
          </p>
        </div>
      ) : (
        <div className="px-6 py-5 border-t border-[#E5C8CE] bg-[#EED0D6]">
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 bg-white/30 p-2 rounded-lg">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-12 h-12 object-cover rounded-md border border-white/50"
                  />
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-opacity"
                  >
                    <i className="ri-close-line text-[10px]"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
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
              disabled={uploading}
              className="text-[#3D1126] hover:text-[#3D1126] transition-colors flex-shrink-0 cursor-pointer p-1"
            >
              <i className="ri-attachment-line text-lg"></i>
            </button>
            <input
              type="text"
              placeholder={uploading ? "Uploading files..." : "Send a message"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent border-b border-[#3D1126] outline-none text-sm text-[#3D1126] placeholder:text-[#6D6D6D]"
              disabled={uploading}
            />
            <i className="ri-emotion-line text-[#3D1126] text-lg cursor-pointer"></i>
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && selectedFiles.length === 0) || uploading}
              className="bg-[#1A1A1A] text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#1A1A1A] transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Send"}
              {!uploading && <i className="ri-send-plane-fill text-white text-sm"></i>}
              {uploading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            </button>
          </div>
          <p className="text-xs text-[#6D6D6D] mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      )}

    </div>
  );
}
