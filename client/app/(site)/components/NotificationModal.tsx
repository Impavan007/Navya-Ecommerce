"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Notification } from "../types/api";
import { BaseModal, ModalHeader, ModalBody } from "./Modal";
import CommonLoader from "../../components/common/CommonLoader";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    loadMore: () => Promise<void>;
    onSwitchAccount?: () => void;
}

export default function NotificationModal({
    isOpen,
    onClose,
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    onSwitchAccount,
}: NotificationModalProps) {
    const router = useRouter();

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).replace(",", " at");
    };

    // Helper to determine if an item should be green (using "confirmed" in title or unread as proxy)
    const isGreenItem = (notification: Notification) => {
        return notification.title.toLowerCase().includes("confirmed") || !notification.read;
    };

    const getActionLabel = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("booking")) return "View Booking Details";
        if (t.includes("approved")) return "Start Listing";
        if (t.includes("return")) return "Return Now";
        if (t.includes("added")) return "Browse new arrivals";
        if (t.includes("deposit")) return "View rental Details";
        if (t.includes("review")) return "Write a review";
        return "View Details";
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification._id);
        let actionUrl = notification.metadata?.actionUrl;

        // Custom handling for ChatMessages to open the chat UI on the target page
        if (notification.type === "ChatMessage" || actionUrl?.includes("/chats/")) {
            const orderId = notification.metadata?.orderId?._id;
            const productId = notification.metadata?.productId?._id;

            if (orderId) {
                actionUrl = `/bookings/${orderId}?openChat=true`;
            } else if (productId) {
                actionUrl = `/product/${productId}?openChat=true`;
            } else if (actionUrl) {
                // If we only have the chat URL, still append the parameter 
                // in case a global redirector or catch-all handles it later
                const separator = actionUrl.includes("?") ? "&" : "?";
                actionUrl = `${actionUrl}${separator}openChat=true`;
            }
        }

        if (notification.metadata?.role === "Both" && actionUrl === "/Become-lender") {
            if (onSwitchAccount) {
                onSwitchAccount();
                onClose();
                return;
            }
        }

        if (actionUrl) {
            router.push(actionUrl);
            onClose();
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className="!bg-[#E3E3E3] max-h-[80vh] overflow-hidden rounded-none"
        >
            <ModalHeader
                title="Notifications"
                onClose={onClose}
                className="border-b border-[#F3D6DC]/50"
            />

            <ModalBody className="p-4 hide-scrollbar">
                {loading && notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                        <CommonLoader pageCenter />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                        <h3 className="font-poppins text-lg font-semibold text-[#3D1126]">No notifications</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => {
                            const green = isGreenItem(notification);
                            return (
                                <div
                                    key={notification._id}
                                    className="relative p-2 border-b border-[#F3D6DC]/30 group hover:bg-[#F3D6DC] transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="inline-block px-3 py-1.5 rounded-[4px] font-bold text-sm transition-colors group-hover:bg-[#F3D6DC] text-[#3D1126]"
                                        >
                                            {notification.title}
                                        </div>
                                        <span className="text-sm font-poppins text-[#3D1126]">
                                            {formatDate(notification.created_at)}
                                        </span>
                                    </div>

                                    <p className="font-poppins text-[15px] leading-relaxed text-[#3D1126] mb-5">
                                        {notification.message}
                                    </p>

                                    <button
                                        onClick={() => handleNotificationClick(notification)}
                                        className="font-poppins text-[15px] font-bold text-[#3D1126] underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity"
                                    >
                                        {getActionLabel(notification.title)}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ModalBody>

            {hasMore && notifications.length > 0 && (
                <div className="p-6 text-center border-t border-[#F3D6DC]/30">
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="font-poppins text-[15px] font-bold text-[#3D1126] hover:underline"
                    >
                        {loadingMore ? "Loading more..." : "See older notifications"}
                    </button>
                </div>
            )}
        </BaseModal>
    );
}
