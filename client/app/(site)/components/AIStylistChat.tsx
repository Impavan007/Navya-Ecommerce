"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Sparkles, X, Send, Mic, MicOff, ArrowRight, ShoppingBag, Loader2 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { aiApiService, StylistChatMessage } from "../services/api/ai";
import { products as productsApi, bookings as bookingsApi } from "../services/api";
import { API_CONFIG, ENDPOINTS } from "../services/api/config";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import { MessageIcon } from "../icons/icons";

// ----------------------------------------------------------------------
// Glowing Soundwave animation for Voice Mode
// ----------------------------------------------------------------------
function Waveform({ activeState }: { activeState: "idle" | "listening" | "thinking" | "speaking" }) {
  const bars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <div className="flex items-center justify-center gap-1.5 h-16 my-4 w-full">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          animate={
            activeState === "listening"
              ? { scaleY: [1, 2.8, 1], transition: { repeat: Infinity, duration: 0.9 + (i % 3) * 0.12, ease: "easeInOut" } }
              : activeState === "speaking"
              ? { scaleY: [1, 3.8, 1], transition: { repeat: Infinity, duration: 0.7 + (i % 4) * 0.10, ease: "easeInOut" } }
              : activeState === "thinking"
              ? { scaleY: [1.2, 2.0, 1.2], transition: { repeat: Infinity, duration: 1.0, ease: "easeInOut", delay: i * 0.08 } }
              : { scaleY: 1 } // idle
          }
          className="w-1.5 h-6 bg-gradient-to-t from-[#A88C52] to-[#BFA15F] rounded-full origin-center shadow-[0_0_10px_rgba(212,175,55,0.4)]"
        />
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// Mini Product Card component to render recommended products inside Chat
// ----------------------------------------------------------------------
function ProductReferenceCard({ productId }: { productId: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchProduct = async () => {
      try {
        const response = await productsApi.getProductById(productId);
        if (active && response.success && response.data) {
          setProduct(response.data);
          setImageError(false);
        }
      } catch (err) {
        console.error("Failed to load product details in chat card:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-[#2E2C2A] rounded-xl border border-[#423F3C] w-full animate-pulse my-2">
        <div className="w-[50px] h-[65px] bg-[#3E3C3A] rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[#3E3C3A] rounded w-1/3" />
          <div className="h-4 bg-[#3E3C3A] rounded w-3/4" />
          <div className="h-3 bg-[#3E3C3A] rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const currentImageSrc = imageError 
    ? "/Images/premium_b2b_textiles.png" 
    : (product.cover_image || product.images?.[0] || "/assets/girl.jpg");

  const formattedPrice = typeof product.price === 'number' 
    ? `$${product.price}` 
    : product.price || "$0";

  // Build the matching URL convention
  const productUrl = `/product/${product._id || product.id}?image=${encodeURIComponent(currentImageSrc)}&productName=${encodeURIComponent(product.name)}&brand=${encodeURIComponent(product.brand)}&price=${encodeURIComponent(formattedPrice)}&sizes=${encodeURIComponent(product.size?.join(',') || 'M')}`;

  return (
    <Link href={productUrl}>
      <div className="flex items-center gap-3 p-3 bg-[#2E2C2A] hover:bg-[#3E3C3A] rounded-xl border border-[#423F3C] transition-all duration-300 w-full cursor-pointer shadow-sm hover:shadow-md my-2 group">
        <div className="relative w-[50px] h-[65px] rounded-md overflow-hidden bg-[#222120]">
          <Image
            src={currentImageSrc}
            alt={product.name}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            unoptimized
            onError={() => setImageError(true)}
          />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[10px] uppercase tracking-wider text-[#A88C52] font-semibold truncate">
            {product.brand}
          </p>
          <h4 className="text-[13px] font-medium text-white truncate group-hover:text-[#A88C52] transition-colors">
            {product.name}
          </h4>
          <p className="text-[12px] text-[#A88C52] font-medium mt-0.5">
            {formattedPrice}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#1E1C1A] group-hover:bg-[#A88C52] flex items-center justify-center transition-colors duration-300">
          <ArrowRight className="w-4 h-4 text-[#8C8680] group-hover:text-white transition-colors" />
        </div>
      </div>
    </Link>
  );
}

function OptionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 text-[13px] font-medium text-[#2E2C2A] bg-white hover:bg-[#F3D6DC] border border-[#EBE8E2] hover:border-[#A88C52] rounded-xl transition-all duration-300 shadow-sm hover:shadow active:scale-98 text-left w-full cursor-pointer flex items-center justify-between group"
    >
      <span>{children}</span>
      <span className="text-[#A88C52] transition-transform group-hover:translate-x-1 duration-300">→</span>
    </button>
  );
}

// ----------------------------------------------------------------------
// Main AI Stylist Chat component with Dual Mode (Text Chat vs Voice Agent)
// ----------------------------------------------------------------------
export default function AIStylistChat() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"chat" | "voice">("chat");
  const [currentFlow, setCurrentFlow] = useState<"menu" | "sourcing" | "tracking" | "fabric">("menu");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [messages, setMessages] = useState<StylistChatMessage[]>([
    {
      sender: "ai",
      text: "Welcome! How can I help you today? Please select one of the options below to get started:"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voiceSuggestions, setVoiceSuggestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleMenuOption = async (option: "track" | "fabric" | "sourcing" | "return" | "support") => {
    if (option === "track") {
      setMessages(prev => [...prev, { sender: "user", text: "Track my order" }]);
      if (!isAuthenticated) {
        setMessages(prev => [...prev, {
          sender: "ai",
          text: "Please sign in to track your active orders."
        }]);
        setCurrentFlow("tracking");
        return;
      }
      
      setCurrentFlow("tracking");
      setLoadingOrders(true);
      try {
        const response = await bookingsApi.getRenterBookings();
        if (response.success && response.data && response.data.bookings) {
          const undelivered = response.data.bookings.filter((b: any) => 
            b.status !== "delivered" && 
            b.status !== "completed" && 
            b.status !== "cancelled" && 
            b.status !== "returned"
          );
          setOrders(undelivered);
          if (undelivered.length === 0) {
            setMessages(prev => [...prev, {
              sender: "ai",
              text: "You don't have any active undelivered orders at the moment."
            }]);
          } else {
            setMessages(prev => [...prev, {
              sender: "ai",
              text: "Here are your active undelivered orders. Please select one to track its delivery status:"
            }]);
          }
        } else {
          setMessages(prev => [...prev, {
            sender: "ai",
            text: "I couldn't retrieve your orders at the moment. Please try again later."
          }]);
        }
      } catch (err) {
        console.error("Error fetching bookings for chat:", err);
        setMessages(prev => [...prev, {
          sender: "ai",
          text: "An error occurred while fetching your orders. Please check your network connection."
        }]);
      } finally {
        setLoadingOrders(false);
      }
    } else if (option === "fabric") {
      setMessages(prev => [...prev, { sender: "user", text: "Find fabric" }]);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "We offer garments in a variety of exquisite fabrics. Please select a fabric below to view all available products:"
      }]);
      setCurrentFlow("fabric");
    } else if (option === "sourcing") {
      setMessages(prev => [...prev, { sender: "user", text: "Fabric Sourcing" }]);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "I've activated your AI Fabric Sourcing Assistant. Tell me what type of textile project or garment you're planning, and I will recommend the perfect fabrics for you!"
      }]);
      setCurrentFlow("sourcing");
    } else if (option === "return") {
      setMessages(prev => [...prev, { sender: "user", text: "What is your return policy?" }]);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "You can return your purchased items within 14 days of delivery if they are in their original condition with all tags attached. Simply place the items back in the packaging, print the return shipping label from your account profile, and drop it off at any shipping courier location."
      }]);
      setCurrentFlow("tracking");
    } else if (option === "support") {
      setMessages(prev => [...prev, { sender: "user", text: "How do I contact support?" }]);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "You can reach our customer support team via email at support@navyaa.com or call us at 1-800-NAVYAA. We are available Monday to Friday from 9 AM to 6 PM EST to assist you with any questions!"
      }]);
      setCurrentFlow("tracking");
    }
  };

  const handleFabricSelect = (fabric: string) => {
    setMessages(prev => [...prev, { sender: "user", text: `I want to find products made of ${fabric}` }]);
    setMessages(prev => [...prev, {
      sender: "ai",
      text: `Excellent choice! ${fabric} is one of our premium fabrics. I am redirecting you to see all available products with ${fabric}.`
    }]);
    router.push(`/search?q=${encodeURIComponent(fabric.toLowerCase())}`);
  };

  const handleOrderSelect = (order: any) => {
    const friendlyOrderId = order.orderId ? (order.orderId.length > 8 ? order.orderId.slice(-8).toUpperCase() : order.orderId.toUpperCase()) : "N/A";
    setMessages(prev => [...prev, { sender: "user", text: `Track Order #${friendlyOrderId}` }]);
    
    let statusDescription = "";
    const status = String(order.status || "").toLowerCase();
    const productName = order.productName || "item";
    
    if (status === "pending") {
      statusDescription = `Your order #${friendlyOrderId} for "${productName}" is currently Pending. We are waiting for payment verification or seller confirmation. It will be prepared shortly!`;
    } else if (status === "confirmed") {
      statusDescription = `Good news! Your order #${friendlyOrderId} for "${productName}" is Confirmed. Our stylists are preparing your luxury purchase so it arrives ready to wear.`;
    } else if (status === "shipped") {
      const carrier = order.shippingProvider || "Standard Courier";
      const trackingNum = order.trackingNumber || "N/A";
      statusDescription = `Your order #${friendlyOrderId} for "${productName}" has been Shipped! 🚚 It is in transit to your delivery address.\n\n• Carrier: ${carrier}\n• Tracking Number: ${trackingNum}`;
    } else if (status === "delivered") {
      statusDescription = `Your order #${friendlyOrderId} for "${productName}" has been Delivered. We hope you are enjoying your luxury purchase!`;
    } else if (status === "cancelled") {
      statusDescription = `Your order #${friendlyOrderId} for "${productName}" has been Cancelled.`;
    } else if (status === "returned") {
      statusDescription = `Your order #${friendlyOrderId} for "${productName}" has been Returned.`;
    } else {
      statusDescription = `Your order #${friendlyOrderId} for "${productName}" status is currently "${order.status || 'UNKNOWN'}".`;
    }

    setMessages(prev => [...prev, {
      sender: "ai",
      text: statusDescription
    }]);
  };

  const resetToMainMenu = () => {
    setMessages([
      {
        sender: "ai",
        text: "Welcome! How can I help you today? Please select one of the options below to get started:"
      }
    ]);
    setCurrentFlow("menu");
  };

  // Text-To-Speech (TTS) audio playback queue refs
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false; // Auto stop when user stops speaking in voice mode
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setVoiceState("listening");
      };

      rec.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          if (activeMode === "voice") {
            // In Voice mode, trigger submission directly in background
            await handleSendVoiceText(transcript);
          } else {
            // In Chat mode, populate input box
            setInputValue(transcript);
          }
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        if (err.error !== 'no-speech') {
          toast.error(`Voice recognition error: ${err.error}`);
        }
        setIsListening(false);
        setVoiceState("idle");
      };

      rec.onend = () => {
        setIsListening(false);
        if (voiceState === "listening") {
          setVoiceState("idle");
        }
      };

      recognitionRef.current = rec;
    }
  }, [activeMode, voiceState]);

  // Clean up any active speech playback on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  // Auto-scroll to bottom of messages in Chat mode
  useEffect(() => {
    if (messagesEndRef.current && activeMode === "chat") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, activeMode]);

  // Audio queue sentence playback controller
  const playNextSentence = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      if (activeMode === "voice") {
        setVoiceState("idle");
      }
      return;
    }

    isPlayingRef.current = true;
    if (activeMode === "voice") {
      setVoiceState("speaking");
    }

    const sentence = audioQueueRef.current.shift();
    if (!sentence) {
      playNextSentence();
      return;
    }

    // Strip bracket tags (e.g. [[PRODUCT_ID: 12345]]) from synthesis text
    const cleanSentence = sentence.replace(/\[\[PRODUCT_ID:\s*[^\]]+\]\]/g, "").trim();
    if (!cleanSentence) {
      playNextSentence();
      return;
    }

    // Call backend TTS proxy endpoint
    const ttsUrl = `${API_CONFIG.baseURL}${ENDPOINTS.AI.STYLIST_CHAT.replace('/chat', '')}/tts?text=${encodeURIComponent(cleanSentence)}`;
    const audio = new Audio(ttsUrl);
    currentAudioRef.current = audio;

    audio.onended = () => {
      playNextSentence();
    };
    audio.onerror = () => {
      console.error("Audio playback error for sentence:", cleanSentence);
      playNextSentence();
    };

    audio.play().catch((err) => {
      console.warn("Audio play blocked or aborted:", err);
      playNextSentence();
    });
  };

  const queueSentenceForPlayback = (sentence: string) => {
    if (activeMode !== "voice") return;
    
    audioQueueRef.current.push(sentence);
    if (!isPlayingRef.current) {
      playNextSentence();
    }
  };

  // Helper to handle and parse incoming SSE chunks, queue TTS sentences, and filter product IDs
  const processStreamResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let accumulatedReply = "";
    let sentenceBuffer = "";

    // Reset playback status
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (sentenceBuffer.trim()) {
          queueSentenceForPlayback(sentenceBuffer.trim());
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.replace("data: ", "").trim();
          if (dataStr === "[DONE]") {
            if (sentenceBuffer.trim()) {
              queueSentenceForPlayback(sentenceBuffer.trim());
              sentenceBuffer = "";
            }
            break;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              const cleanedText = parsed.text.replace(/[\*]/g, '');
              accumulatedReply += cleanedText;
              sentenceBuffer += cleanedText;

              // Render text in UI real-time (for chat mode history)
              setMessages((prev) => {
                const updated = [...prev];
                if (updated.length > 0) {
                  updated[updated.length - 1] = {
                    sender: "ai",
                    text: accumulatedReply
                  };
                }
                return updated;
              });

              // In Voice mode, extract product recommendations dynamically
              if (activeMode === "voice") {
                const regex = /\[\[PRODUCT_ID:\s*([^\]]+)\]\]/g;
                let match;
                const detectedIds: string[] = [];
                while ((match = regex.exec(accumulatedReply)) !== null) {
                  const id = match[1].trim();
                  if (!detectedIds.includes(id)) {
                    detectedIds.push(id);
                  }
                }
                if (detectedIds.length > 0) {
                  setVoiceSuggestions(prev => {
                    const merged = [...prev];
                    detectedIds.forEach(id => {
                      if (!merged.includes(id)) merged.push(id);
                    });
                    return merged;
                  });
                }
              }

              // Extract completed sentences for synthesis queue
              const sentenceMatch = sentenceBuffer.match(/[^.!?]+[.!?]/g);
              if (sentenceMatch) {
                for (const sentence of sentenceMatch) {
                  queueSentenceForPlayback(sentence.trim());
                  sentenceBuffer = sentenceBuffer.replace(sentence, "");
                }
              }
            } else if (parsed.error) {
              toast.error(`AI Error: ${parsed.error}`);
            }
          } catch (err) {
            // Fragmented line, await next chunk
          }
        }
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported or permission denied in this browser.");
      return;
    }

    // Clear active audio playback when starting a new command
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setVoiceState("idle");

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputValue("");
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start SpeechRecognition:", err);
      }
    }
  };

  // Submit background Voice prompt
  const handleSendVoiceText = async (transcript: string) => {
    if (!transcript.trim()) return;

    setVoiceSuggestions([]); // Clear recommendations for the new search
    setVoiceState("thinking");
    setIsLoading(true);
    setCurrentFlow("sourcing");

    const userMsg: StylistChatMessage = { sender: "user", text: transcript };
    setMessages((prev) => [...prev, userMsg, { sender: "ai", text: "" }]);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.AI.STYLIST_CHAT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: transcript,
          chatHistory: messages,
          type: "voiceprompt"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body reader unavailable");

      await processStreamResponse(reader);
    } catch (error: any) {
      console.error("Voice Agent API error:", error);
      toast.error("Failed to fetch voice response from stylist.");
      setVoiceState("idle");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit classic Text Chat prompt
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = inputValue.trim();
    if (!cleanInput || isLoading) return;

    const userMsg: StylistChatMessage = { sender: "user", text: cleanInput };
    setMessages((prev) => [...prev, userMsg, { sender: "ai", text: "" }]);
    setInputValue("");
    setIsLoading(true);
    setCurrentFlow("sourcing");

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.AI.STYLIST_CHAT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: cleanInput,
          chatHistory: messages,
          type: "textprompt"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body reader unavailable");

      await processStreamResponse(reader);
    } catch (error) {
      console.error("AI text chat submission error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            sender: "ai",
            text: "I apologize, but I encountered a network connectivity error. Please try again."
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract [[PRODUCT_ID: id]] from string and render cards inline
  const parseMessageText = (text: string) => {
    const regex = /\[\[PRODUCT_ID:\s*([^\]]+)\]\]/g;
    const components: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        components.push(<span key={`txt-${lastIndex}`}>{text.substring(lastIndex, matchIndex)}</span>);
      }
      const productId = match[1].trim();
      components.push(<ProductReferenceCard key={`prod-${productId}-${matchIndex}`} productId={productId} />);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      components.push(<span key={`txt-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return components.length > 0 ? components : [text];
  };

  const renderOptionPanel = () => {
    // Only show options if the last message is from the AI and we're not loading
    if (messages.length === 0) return null;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender !== "ai" || isLoading) return null;

    if (currentFlow === "menu") {
      return (
        <div className="flex flex-col gap-2 my-2 max-w-[85%] ml-0 mr-auto w-full shrink-0">
          <OptionButton onClick={() => handleMenuOption("track")}>Track my order</OptionButton>
          <OptionButton onClick={() => handleMenuOption("fabric")}>Find fabric</OptionButton>
          <OptionButton onClick={() => handleMenuOption("sourcing")}>Fabric Sourcing Assistant</OptionButton>
          <OptionButton onClick={() => handleMenuOption("return")}>Return Policy</OptionButton>
        </div>
      );
    }

    if (currentFlow === "fabric") {
      const fabrics = ["Silk", "Linen", "Cotton", "Velvet", "Tweed", "Satin", "Wool", "Denim", "Leather", "Lace"];
      return (
        <div className="flex flex-col gap-2 my-2 max-w-[85%] ml-0 mr-auto w-full shrink-0">
          <div className="grid grid-cols-2 gap-2 w-full">
            {fabrics.map((fabric) => (
              <button
                key={fabric}
                type="button"
                onClick={() => handleFabricSelect(fabric)}
                className="px-3 py-2 text-[12px] text-center font-medium text-[#1A1A1A] bg-white hover:bg-[#FAF6F3] border border-[#EBE8E2] hover:border-[#A88C52] rounded-xl transition-all duration-300 shadow-sm cursor-pointer hover:shadow"
              >
                {fabric}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={resetToMainMenu}
            className="mt-2 px-4 py-2 text-[12px] font-semibold text-[#8C8680] hover:text-[#1A1A1A] bg-[#F3D6DC] hover:bg-[#EBE8E2] rounded-full transition-colors cursor-pointer w-full text-center"
          >
            ← Back to Main Menu
          </button>
        </div>
      );
    }

    if (currentFlow === "tracking") {
      if (loadingOrders) {
        return (
          <div className="flex items-center gap-2 max-w-[85%] ml-0 mr-auto my-2 text-[12px] text-[#8C8680] shrink-0">
            <Loader2 className="w-4 h-4 animate-spin text-[#A88C52]" />
            Loading active orders...
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-2 my-2 max-w-[95%] ml-0 mr-auto w-full shrink-0">
          {orders.length > 0 ? (
            <div className="flex flex-col gap-2.5 w-full max-h-[220px] overflow-y-auto pr-1">
              {orders.map((order) => {
                const friendlyOrderId = order.orderId ? (order.orderId.length > 8 ? order.orderId.slice(-8).toUpperCase() : order.orderId.toUpperCase()) : "N/A";
                return (
                  <button
                    key={order.orderId || order.productId}
                    type="button"
                    onClick={() => handleOrderSelect(order)}
                    className="flex items-center gap-3 p-2.5 text-[12px] text-left font-medium text-[#1A1A1A] bg-white hover:bg-[#FAF6F3] border border-[#EBE8E2] hover:border-[#A88C52] rounded-xl transition-all duration-300 shadow-sm cursor-pointer w-full hover:shadow group"
                  >
                    {order.productImage && (
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-[#EBE8E2]">
                        <img 
                          src={order.productImage} 
                          alt={order.productName || "Product"} 
                          className="object-cover w-full h-full object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-semibold text-gray-900 truncate">Order #{friendlyOrderId}</span>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#FAF6F3] border border-[#EBE8E2] text-[#A88C52] uppercase shrink-0">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium truncate mb-1">{order.productName || "Product"}</p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
                        <span>₹{order.price || order.totalAmount}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>Size {order.size}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            orders.length === 0 && isAuthenticated && (
              <div className="text-[12px] text-[#8C8680] my-1">
                No active orders to track.
              </div>
            )
          )}
          <button
            type="button"
            onClick={resetToMainMenu}
            className="mt-2 px-4 py-2 text-[12px] font-semibold text-[#8C8680] hover:text-[#1A1A1A] bg-[#F3D6DC] hover:bg-[#EBE8E2] rounded-full transition-colors cursor-pointer w-full text-center"
          >
            ← Back to Main Menu
          </button>
        </div>
      );
    }

    // Fallback for custom policy flows that need a back button
    if (currentFlow !== "sourcing") {
      return (
        <div className="flex flex-col gap-2 my-2 max-w-[85%] ml-0 mr-auto w-full shrink-0">
          <button
            type="button"
            onClick={resetToMainMenu}
            className="px-4 py-2 text-[12px] font-semibold text-[#8C8680] hover:text-[#1A1A1A] bg-[#F3D6DC] hover:bg-[#EBE8E2] rounded-full transition-colors cursor-pointer w-full text-center"
          >
            ← Back to Main Menu
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen 
              ? "bg-[#1A1A1A] text-white" 
              : "bg-[#1A1A1A] hover:bg-[#BFA15F] text-white"
          }`}
          aria-label="Toggle AI Stylist"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageIcon size={26} color="white" />}
        </motion.button>
      </div>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-32px)] h-[500px] max-h-[calc(100vh-120px)] bg-[#FAF6F3] rounded-2xl shadow-2xl border border-[#EBE8E2] flex flex-col overflow-hidden z-[9998]"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-[#EBE8E2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#2E2C2A] flex items-center gap-1.5">
                    Navyaa AI Stylist
                  </h3>
                  <span className="text-[11px] text-[#6DA06D] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6DA06D] inline-block animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#8C8680] hover:text-[#2E2C2A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Splitter */}
            {activeMode === "chat" ? (
              <>
                {/* Text Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {messages.map((msg, index) => {
                    const isAi = msg.sender === "ai";
                    return (
                      <div
                        key={index}
                        className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                            isAi
                              ? "bg-white text-[#2E2C2A] border border-[#EBE8E2] rounded-tl-none"
                              : "bg-[#1A1A1A] text-white rounded-tr-none"
                          }`}
                        >
                          {isAi ? parseMessageText(msg.text) : msg.text}
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 bg-white text-[#2E2C2A] border border-[#EBE8E2] flex items-center gap-2 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-[#A88C52]" />
                        <span className="text-[12px] text-[#8C8680]">Styling your lookup...</span>
                      </div>
                    </div>
                  )}
                  {renderOptionPanel()}
                  <div ref={messagesEndRef} />
                </div>

                {currentFlow === "styling" && (
                  <div className="px-6 py-2 bg-[#FAF6F3] border-t border-[#EBE8E2] flex items-center justify-between text-[12px] shrink-0">
                    <span className="text-[#8C8680] font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#A88C52]" /> AI Stylist Active
                    </span>
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="text-[#A88C52] hover:text-[#1A1A1A] font-semibold transition-colors cursor-pointer"
                    >
                      Exit Styling Mode →
                    </button>
                  </div>
                )}

                {/* Text Form Input */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 bg-white border-t border-[#EBE8E2] flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("voice");
                      // Switch and trigger recording immediately
                      setTimeout(() => {
                        toggleListening();
                      }, 200);
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-[#EBE8E2] bg-[#FAF6F3] text-[#8C8680] hover:text-[#A88C52] hover:bg-[#F3D6DC] transition-all duration-300"
                    title="Switch to Voice Agent"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask your personal stylist..."
                    className="flex-1 bg-[#FAF6F3] border border-[#EBE8E2] rounded-full px-4 py-2 text-[14px] text-[#2E2C2A] focus:outline-none focus:border-[#A88C52] transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-10 h-10 rounded-full bg-[#1A1A1A] hover:bg-[#A88C52] disabled:bg-[#F3D6DC] text-white disabled:text-[#8C8680] flex items-center justify-center transition-colors duration-300"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              // Dedicated Voice Agent Layout View (Dark Glassmorphic Theme)
              <div className="flex-1 flex flex-col justify-between p-6 bg-[#1A1817] text-white">
                {/* Voice Mode Header */}
                <div className="flex items-center justify-between border-b border-[#2E2B2A] pb-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#A88C52] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A88C52] inline-block animate-pulse" />
                    Voice Agent Mode
                  </span>
                  <button
                    onClick={() => {
                      if (isListening && recognitionRef.current) {
                        recognitionRef.current.stop();
                      }
                      if (currentAudioRef.current) {
                        currentAudioRef.current.pause();
                        currentAudioRef.current = null;
                      }
                      audioQueueRef.current = [];
                      isPlayingRef.current = false;
                      setVoiceState("idle");
                      setActiveMode("chat");
                    }}
                    className="text-[11px] bg-[#2E2C2A] hover:bg-[#A88C52] text-[#EBE8E2] hover:text-white px-3 py-1 rounded-full transition-all duration-300 border border-[#423F3D]"
                  >
                    Text Mode
                  </button>
                </div>

                {/* Animated Waveform Interaction Area */}
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div 
                    onClick={toggleListening}
                    className="relative cursor-pointer group flex flex-col items-center p-6 border border-[#2E2B2A] hover:border-[#A88C52] rounded-2xl bg-[#22201F] transition-all duration-300 w-full max-w-[260px] text-center"
                  >
                    {/* Pulsing backglow animation */}
                    <div className="absolute inset-0 bg-[#A88C52] opacity-[0.03] blur-lg rounded-full scale-125 group-hover:scale-150 transition-all duration-500 animate-pulse" />
                    
                    <Waveform activeState={voiceState} />
                    
                    <p className="text-[12px] text-[#A88C52] font-medium tracking-wide uppercase mt-3">
                      {voiceState === "listening" && "Listening..."}
                      {voiceState === "thinking" && "Thinking..."}
                      {voiceState === "speaking" && "Speaking..."}
                      {voiceState === "idle" && "Tap to Speak"}
                    </p>
                  </div>
                </div>

                {/* Suggestions Pane */}
                <div className="w-full space-y-2 text-left pt-2 border-t border-[#2E2B2A]">
                  <h4 className="text-[11px] uppercase tracking-wider text-[#A88C52] font-semibold flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Stylist Recommendations
                  </h4>
                  <div className="h-[150px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#2E2C2A]">
                    {voiceSuggestions.length > 0 ? (
                      voiceSuggestions.map((prodId, idx) => (
                        <ProductReferenceCard key={`${prodId}-${idx}`} productId={prodId} />
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center border border-[#2E2B2A] border-dashed rounded-xl px-4 text-center">
                        <p className="text-[11px] text-[#8C8680] leading-relaxed">
                          {voiceState === "listening" 
                            ? "I am listening... Ask for outfits, brands, or colors."
                            : "Recommendations will appear here dynamically as the AI speaks."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
