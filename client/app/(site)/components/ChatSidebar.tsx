"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { messagesApiService, ChatMessage, ChatParticipant, ChatData, Attachment } from "../services/api/messages";
import { useSocketEvent, useSocketClient } from "../../hooks/useSocket";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import { ChatSendFileIcon, ChatSendMessageIcon } from "../icons/icons";
import { X, Paperclip } from "lucide-react";
import CommonLoader from "../../components/common/CommonLoader";

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    lenderId?: string;
    productId?: string;
    lenderName?: string;
    lenderImage?: string;
    productName?: string;
    productImage?: string;
    orderId?: string;
    chatId?: string;
}

type MessageWithStatus = ChatMessage & {
    status?: 'sending' | 'sent' | 'error';
    errorText?: string;
    isOptimistic?: boolean;
};

export default function ChatSidebar({
    isOpen,
    onClose,
    lenderId,
    productId: initialProductId,
    orderId,
    chatId: initialChatId,
}: ChatSidebarProps) {
    const router = useRouter();
    const productId = initialProductId;

    const { user: currentUser } = useAuthStore();
    const [message, setMessage] = useState("");
    const [chatData, setChatData] = useState<ChatData | null>(null);
    const [messages, setMessages] = useState<MessageWithStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [show, setShow] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const { socket, isConnected, emit } = useSocketClient();

    const fetchChatHistory = useCallback(async (pageNum: number, isInitial = false) => {
        if (!productId && !initialChatId) return;

        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const response = initialChatId 
                ? await messagesApiService.getChatMessages(initialChatId, pageNum)
                : await messagesApiService.getProductMessages(productId!, pageNum);

            if (response.success && response.data) {
                // Sort messages: oldest first (top), newest last (bottom)
                const newMessagesSorted = [...response.data.messages].sort((a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

                if (isInitial) {
                    setChatData(response.data);
                    setMessages(newMessagesSorted);
                } else {
                    setMessages(prev => {
                        const combined = [...newMessagesSorted, ...prev];
                        // Final sort to handle any edge cases (like overlaps)
                        return combined.sort((a, b) =>
                            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );
                    });
                }

                setHasMore(response.data.pagination.page < response.data.pagination.pages);
                setPage(response.data.pagination.page);
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
            if (isInitial) toast.error("Failed to load chat history");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [productId]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Small delay to trigger entry animation
            const timer = setTimeout(() => setShow(true), 10);
            fetchChatHistory(1, true);
            document.body.style.overflow = "hidden";
            return () => clearTimeout(timer);
        } else {
            setShow(false);
            // Delay unmounting to allow exit animation
            const timer = setTimeout(() => {
                setShouldRender(false);
                setMessages([]);
                setPage(1);
                setChatData(null);
            }, 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen, fetchChatHistory]);

    // Listen for real-time messages
    const handleIncomingMessage = (data: any) => {
        

        // Handle both single message and response-style objects
        const incomingMsg = (data.data || data) as ChatMessage;
        

        if (incomingMsg && incomingMsg.content) {
            setMessages(prev => {
                const incomingContent = incomingMsg.content?.trim();

                // Check if this is a real message replacing a temporary one
                const existingTempIndex = prev.findIndex(m =>
                    m.status === 'sending' &&
                    m.content?.trim() === incomingContent
                );

                if (existingTempIndex !== -1) {
                    const newMessages = [...prev];
                    newMessages[existingTempIndex] = {
                        ...incomingMsg,
                        status: 'sent'
                    };
                    return newMessages;
                }

                // Check if message already exists by ID (including real IDs)
                const isDuplicate = prev.some(m => m._id === incomingMsg._id);
                if (isDuplicate) return prev;

                // Also check if there's a temp message with same content that might be pending
                // This prevents adding a duplicate when socket fires after API response
                const hasPendingTemp = prev.some(m =>
                    m.status === 'sending' &&
                    m.content?.trim() === incomingContent
                );

                if (hasPendingTemp) return prev;

                return [...prev, { ...incomingMsg, status: 'sent' } as MessageWithStatus]
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            });

            // Small delay to ensure render then scroll
            setTimeout(() => {
                virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth' });
            }, 100);
        }
    };

    useSocketEvent("getMessages", handleIncomingMessage);
    useSocketEvent("receiveMessage", handleIncomingMessage);

    // Handle message delivery status
    useSocketEvent("messageDelivered", (payload: any) => {
        const { messageId, deliveredAt } = payload;
        setMessages(prev => prev.map(msg => 
            msg._id === messageId ? { ...msg, delivered: true, delivered_at: deliveredAt } : msg
        ));
    });

    // Handle message read status
    useSocketEvent("messageRead", (payload: any) => {
        const { messageId, readAt } = payload;
        setMessages(prev => prev.map(msg => 
            msg._id === messageId ? { ...msg, read: true, read_at: readAt } : msg
        ));
    });

    const handleSend = async (textToSubmit?: string) => {
        const text = textToSubmit || message;
        if (!text.trim() && selectedFiles.length === 0) return;
        if (!productId && !initialChatId) return;

        if (!textToSubmit) {
            setMessage(""); // Clear input
        }

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

        const optimisticMsg: MessageWithStatus = {
            _id: tempId,
            sender: currentUserId,
            receiver: lenderId || '',
            content: text,
            attachments: localAttachments,
            delivered: false,
            delivered_at: null,
            read: false,
            read_at: null,
            created_at: new Date().toISOString(),
            status: 'sending',
            isOptimistic: true
        };

        // Add to messages immediately
        setMessages(prev => [...prev, optimisticMsg]);
        const filesToUpload = [...selectedFiles];
        setSelectedFiles([]); // Clear input field

        // Scroll to bottom
        setTimeout(() => {
            virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth' });
        }, 100);

        let finalAttachments: Attachment[] = [];
        if (filesToUpload.length > 0) {
            setUploading(true);
            try {
                const uploadRes = await messagesApiService.uploadAttachments(filesToUpload);
                if (uploadRes.success && uploadRes.data) {
                    // Map strictly to { type, url, name } as requested, using relative url
                    finalAttachments = uploadRes.data.attachments.map(att => ({
                        type: att.type,
                        url: att.url, // relative path
                        name: att.name
                    }));
                    
                    // Update optimistic message with real attachments for rendering
                    setMessages(prev => prev.map(m => 
                        m._id === tempId ? { 
                            ...m, 
                            attachments: uploadRes.data!.attachments // use full objects for rendering (contains full_url)
                        } : m
                    ));
                } else {
                    throw new Error(uploadRes.message || "Upload failed");
                }
            } catch (err) {
                console.error("Upload error:", err);
                setMessages(prev => prev.map(m => 
                    m._id === tempId ? { ...m, status: 'error', errorText: "Failed to upload images" } : m
                ));
                setUploading(false);
                return;
            } finally {
                setUploading(false);
            }
        }

        try {
            // New chat handling
            if (!initialChatId && !chatData?.chatId && isConnected) {
                const payload = {
                    receiverId: lenderId,
                    productId: productId,
                    orderId: orderId,
                    subject: "Order discussion",
                    message: {
                        content: text,
                        attachments: finalAttachments
                    }
                };
                
                emit("createChat", payload, (ack: any) => {
                    if (ack.success) {
                        setChatData(prev => ({ ...prev, chatId: ack.chat.id } as any));
                        setMessages(prev => prev.map(m =>
                            m._id === tempId ? {
                                ...m,
                                ...ack.message,
                                _id: ack.message.id,
                                status: 'sent',
                                isOptimistic: false
                            } : m
                        ));
                    } else {
                        setMessages(prev => prev.map(m =>
                            m._id === tempId ? { ...m, status: 'error', errorText: ack.message || 'Unable to create chat' } : m
                        ));
                    }
                });
                return;
            }

            // Existing chat handling
            if (isConnected) {
                const targetChatId = initialChatId || chatData?.chatId;
                const payload = {
                    chatId: targetChatId,
                    receiverId: lenderId,
                    content: text,
                    attachments: finalAttachments
                };
                
                emit("sendMessage", payload, (ack: any) => {
                    if (ack.success) {
                        setMessages(prev => prev.map(m =>
                            m._id === tempId ? {
                                ...m,
                                _id: ack.messageId,
                                status: 'sent',
                                isOptimistic: false
                            } : m
                        ));
                    } else {
                        setMessages(prev => prev.map(m =>
                            m._id === tempId ? { ...m, status: 'error', errorText: ack.message || 'Unable to send' } : m
                        ));
                    }
                });
            } else {
                // HTTP Fallback
                const response = await messagesApiService.sendMessage(productId!, text, orderId, finalAttachments);
                if (response.success && response.data) {
                    setMessages(prev => prev.map(m =>
                        m._id === tempId ? {
                            ...m,
                            ...response.data!,
                            status: 'sent',
                            isOptimistic: false
                        } : m
                    ));
                } else {
                    setMessages(prev => prev.map(m =>
                        m._id === tempId ? { ...m, status: 'error', errorText: 'Socket not connected' } : m
                    ));
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.map(m =>
                m._id === tempId ? { ...m, status: 'error', errorText: 'Unable to send' } : m
            ));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => file.type.startsWith('image/'));
            if (validFiles.length !== files.length) {
                toast.error("Only images are allowed");
            }
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleResend = (msg: MessageWithStatus) => {
        if (msg.status === 'error') {
            // Remove the failed message
            setMessages(prev => prev.filter(m => m._id !== msg._id));
            // Send again
            handleSend(msg.content);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`relative w-full sm:max-w-[500px] md:max-w-[600px] h-full bg-[#FAF6F3] shadow-xl flex flex-col font-poppins transition-transform duration-300 ease-in-out ${show ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="bg-[#F6E3E6] px-4 py-4 flex items-center justify-between shrink-0 border-b border-[#F3D6DC]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#3D1126" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-sm font-medium">
                                {chatData?.participants && Object.values(chatData.participants).find(p => p.role === 'Lender')?.profile_image ? (
                                    <img
                                        src={Object.values(chatData.participants).find(p => p.role === 'Lender')?.profile_image}
                                        alt="Lender"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span>{Object.values(chatData?.participants || {}).find(p => p.role === 'Lender')?.name?.substring(0, 2).toUpperCase() || "SM"}</span>
                                )}
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            <h3 className="font-bold text-[#3D1126] text-lg leading-tight truncate">
                                Chat with {(Object.values(chatData?.participants || {}) as ChatParticipant[]).find(p => p.role === 'Lender')?.name || "Lender"}
                            </h3>
                            <p className="text-[#3D1126] text-xs truncate">{chatData?.product?.name || "Product Inquiry"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 px-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className="text-[#3D1126] text-sm whitespace-nowrap font-medium">
                                Booking active
                            </span>
                        </div>
                        {/* <button className="text-[#3D1126]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button> */}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-[#FAF6F3] relative overflow-hidden">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-t-[#F2D4D9] border-gray-200 rounded-full animate-spin"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#FAF6F3]">
                            <div className="w-16 h-16 bg-[#F6E3E6] rounded-full flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#3D1126" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h4 className="text-[#3D1126] font-medium mb-2">No messages yet</h4>
                            <p className="text-[#3D1126] text-sm max-w-[280px]">
                                Your conversation with the Lender will appear here.
                            </p>
                        </div>
                    ) : (
                        <Virtuoso
                            ref={virtuosoRef}
                            data={messages}
                            followOutput="smooth"
                            initialTopMostItemIndex={messages.length - 1}
                            startReached={() => {
                                if (hasMore && !loadingMore) {
                                    fetchChatHistory(page + 1);
                                }
                            }}
                            components={{
                                Header: () => (
                                    <div className="p-4 bg-[#F2F2F2] mb-8 mx-auto w-full sm:max-w-[90%] rounded-2xl text-center mt-6">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-[#888888]">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span className="text-sm font-medium">Booking Chat</span>
                                        </div>
                                        <p className="text-[#3D1126] text-xs leading-relaxed max-w-[500px] mx-auto">
                                            Use this space to coordinate delivery, returns, extensions, or order-related questions. For safety and support, conversations may be reviewed by the Navyaa team.
                                        </p>
                                        {loadingMore && <div className="text-[10px] text-gray-400 mt-2">Loading older messages...</div>}
                                    </div>
                                )
                            }}
                            itemContent={(index: number, msg: MessageWithStatus) => {
                                const currentUserId = (currentUser as any)?._id || currentUser?.id;
                                const senderId = typeof msg.sender === 'object' ? (msg.sender as any)._id : msg.sender;
                                const isUser = senderId === currentUserId || senderId === 'me';

                                // Resolve sender name and image from message or participants
                                const participantsArray = chatData?.participants
                                    ? (Object.values(chatData.participants) as ChatParticipant[])
                                    : [] as ChatParticipant[];
                                
                                const participant = participantsArray.find(p => p._id === senderId);
                                
                                // Priority order for name:
                                // 1. Custom 'You' if it's current user
                                // 2. Name from sender object if provided in msg
                                // 3. Name from participants list
                                // 4. Fallback 'User'
                                let senderName = isUser ? 'You' : 'User';
                                if (!isUser) {
                                  if (typeof msg.sender === 'object' && (msg.sender as any).name) {
                                    senderName = (msg.sender as any).name;
                                  } else if (participant?.name) {
                                    senderName = participant.name;
                                  } else {
                                    // Default lender name if possible
                                    const lender = participantsArray.find(p => p.role === 'Lender');
                                    senderName = lender?.name || 'Lender';
                                  }
                                }

                                return (
                                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} px-6 py-3 w-full`}>
                                        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
                                            {/* Sender Name */}
                                            <span className="text-[12px] text-[#3D1126] mb-2 font-medium px-1">
                                                {senderName}
                                            </span>

                                            {/* Message Bubble */}
                                            <div className={`px-5 py-3 rounded-[2px] text-[14px] leading-relaxed shadow-sm transition-all ${isUser ? 'bg-[#F6DDE2] text-[#3D1126]' : 'bg-[#1A1A1A] text-white'} ${msg.status === 'error' ? 'border border-red-300 bg-red-50' : ''} ${msg.status === 'sending' ? 'opacity-70' : ''}`}>
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="flex flex-col gap-2 mb-2">
                                                        {msg.attachments.map((att: Attachment, idx: number) => (
                                                            <img
                                                                key={idx}
                                                                src={att.full_url || (att.url.startsWith('http') || att.url.startsWith('blob:') ? att.url : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${att.url}`)}
                                                                alt={att.name}
                                                                className="max-w-full rounded-md object-cover cursor-pointer"
                                                                style={{ maxHeight: '250px', width: 'auto' }}
                                                                onClick={() => window.open(att.full_url || att.url, '_blank')}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                {msg.content && (
                                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                                )}
                                            </div>

                                            {/* Status/Error */}
                                            {msg.status === 'error' && (
                                                <div className="flex items-center gap-2 mt-1 px-1">
                                                    <span className="text-[10px] text-red-500 font-medium">
                                                        {msg.errorText || "Unable to send please try again"}
                                                    </span>
                                                    <button
                                                        onClick={() => handleResend(msg)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Click to retry"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M23 4V10H17M1 20V14H7M3.51 9C4.91712 6.15433 7.33236 3.96344 10.2662 2.8711C13.2 1.77875 16.4175 1.87413 19.26 3.138L23 5M1 19L4.74 20.862C7.58251 22.1259 10.8 22.2213 13.7338 21.1289C16.6676 20.0366 19.0829 17.8457 20.49 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                            {msg.status === 'sending' && (
                                                <div className="flex items-center gap-1 mt-1 px-1">
                                                    <span className="text-[9px] text-gray-400">Sending...</span>
                                                    <div className="w-2 h-2 border-2 border-t-gray-400 border-gray-200 rounded-full animate-spin"></div>
                                                </div>
                                            )}

                                            {/* Time */}
                                            <span className="text-[11px] text-[#A8A8A8] mt-2 font-medium px-1">
                                                {msg.created_at ? (
                                                    (() => {
                                                        try {
                                                            return format(new Date(msg.created_at), 'h:mm a');
                                                        } catch (e) {
                                                            return '';
                                                        }
                                                    })()
                                                ) : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    )}
                </div>

                {/* Input Area */}
                <div className="px-6 py-4 bg-[#FAF6F3] shrink-0 border-t border-gray-100">
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            {selectedFiles.map((file, idx) => (
                                <div key={idx} className="relative w-16 h-16">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        className="w-full h-full object-cover rounded-md border border-gray-200"
                                    />
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative flex items-center gap-4">
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
                            className="text-[#3D1126] shrink-0 hover:text-[#3D1126] transition-colors disabled:opacity-50"
                            disabled={uploading}
                        >
                            <ChatSendFileIcon />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message here..."
                                className="w-full bg-transparent text-[#3D1126] py-2 border-b border-[#A8A8A8] focus:outline-none focus:border-[#3D1126] placeholder:text-[#888888] text-base"
                                disabled={uploading}
                            />
                        </div>
                        <button
                            onClick={() => handleSend()}
                            disabled={(!message.trim() && selectedFiles.length === 0) || uploading}
                            className={`shrink-0 transition-all ${((message.trim() || selectedFiles.length > 0) && !uploading) ? "text-[#3D1126] hover:text-[#3D1126] hover:scale-110" : "text-gray-300 pointer-events-none"}`}
                        >
                            {uploading ? <CommonLoader size="sm" color="gray" /> : <ChatSendMessageIcon />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
