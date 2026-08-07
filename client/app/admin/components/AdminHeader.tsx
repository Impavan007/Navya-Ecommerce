'use client';

import Image from 'next/image';
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/(site)/hooks/useAuth';
import { useAuthStore } from '@/app/(site)/stores/authStore';
import { useNotificationStore, Notification } from '../store/AdminHeaderStor/NotificationStore';
import { useSocketEvent, useSocketClient } from '@/app/hooks/useSocket';
import { toast } from 'react-hot-toast';
import CommonNavbar from '../../components/common/Navbar';
import usePageSettingsStore from '../store/Pagesettings/PageSettingsstore';
import useProfileStore from '../store/Profile/profileStore';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function AdminHeader({ onToggleSidebar, sidebarCollapsed }: AdminHeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { signOut } = useAuth();
  const authUser = useAuthStore((state) => state.user);

  // Notification store with stable selectors
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const error = useNotificationStore((state) => state.error);
  const pagination = useNotificationStore((state) => state.pagination);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const loadMoreNotifications = useNotificationStore((state) => state.loadMoreNotifications);
  const handleNewNotification = useNotificationStore((state) => state.handleNewNotification);
  const clearError = useNotificationStore((state) => state.clearError);

  // Page settings store
  const { settings, fetchSettings } = usePageSettingsStore();

  // Socket connection for debugging
  const { socket, isConnected } = useSocketClient();

  // 🔍 DEBUG: Monitor socket connection status in admin
  useEffect(() => {


    if (!socket) {
      console.warn("⚠️ [adminHeader] Socket instance is null — not connected yet");
      return;
    }

    const onConnect = () => {

    };

    const onDisconnect = (reason: string, details?: any) => {
      console.warn(`❌ [adminHeader] Socket DISCONNECTED at ${new Date().toLocaleTimeString()} | Reason: "${reason}"`, details || '');
    };

    const onConnectError = (err: any) => {
      console.error(`⚠️ [adminHeader] Socket CONNECT ERROR:`, err.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [socket, isConnected]);

  // Stable listener for adminNotification
  const onadminNotification = useCallback((data: any) => {

    handleNewNotification(data);
  }, [handleNewNotification]);

  // Listen for 'adminNotification'
  useSocketEvent("adminNotification", onadminNotification);

  // Listen for 'notification' (fallback/debug)
  useSocketEvent("notification", useCallback((data: any) => {

    handleNewNotification(data);
  }, [handleNewNotification]));








  // Fetch notifications and settings on component mount
  useEffect(() => {
    fetchNotifications(1, 10);
    fetchSettings();
  }, [fetchNotifications, fetchSettings]);
  const [userdata, setUserdata] = useState<any>(null);
  // Fetch notifications when notifications popup opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications(1, 10);
    }
  }, [showNotifications, fetchNotifications]);
  useEffect(() => {
    if (authUser) {
      setUserdata(authUser);
      return;
    }

    // Fallback: read from persisted navyaa-auth state if store not yet hydrated
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('navyaa-auth');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserdata(parsed?.state?.user || null);
        }
      } catch (error) {
        console.error('Error parsing navyaa-auth from localStorage:', error);
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'navyaa-auth') {
        try {
          const parsed = event.newValue ? JSON.parse(event.newValue) : null;
          setUserdata(parsed?.state?.user || null);
        } catch {
          setUserdata(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [authUser]);

  const { profile, fetchProfile: fetchadminProfile } = useProfileStore();

  useEffect(() => {
    fetchadminProfile();
  }, [fetchadminProfile]);

  useEffect(() => {
    if (profile && profile.profileImage && profile.profileImage !== '/api/placeholder/150/150') {
      setUserdata((prev: any) => ({
        ...prev,
        profile_image: profile.profileImage
      }));
    }
  }, [profile]);
  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification._id);
    }

    let actionUrl = notification.metadata?.actionUrl;

    if (actionUrl) {
      const metadata = notification.metadata as any;
      const separator = actionUrl.includes("?") ? "&" : "?";

      // Append specific IDs based on notification type/metadata for admin
      if (metadata.chatId) {
        actionUrl = `${actionUrl}${separator}chatId=${metadata.chatId}`;
      } else if (metadata.disputeId) {
        actionUrl = `${actionUrl}${separator}disputeId=${metadata.disputeId}`;
      } else if (metadata.orderId?._id) {
        actionUrl = `${actionUrl}${separator}orderId=${metadata.orderId._id}`;
      }

      router.push(actionUrl);
    } else if (notification.metadata.orderId) {
      router.push(`/admin/orders/${notification.metadata.orderId._id}`);
    }

    setShowNotifications(false);
  }, [markAsRead, router]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage && !isLoading) {
      loadMoreNotifications();
    }
  }, [pagination.hasNextPage, isLoading, loadMoreNotifications]);

  // Format time ago
  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  }, []);


  // Get priority color
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'OrderCancelled':
        return 'ri-close-circle-line text-red-500';
      case 'OrderConfirmed':
        return 'ri-checkbox-circle-line text-green-500';
      case 'OrderShipped':
        return 'ri-truck-line text-blue-500';
      default:
        return 'ri-notification-line text-gray-500';
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Close notifications dropdown
      if (showNotifications && !target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }

      // Close profile dropdown
      if (showProfileDropdown && !target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileDropdown]);

  const pathname = usePathname();

  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Dashboard';
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  };

  const pageTitle = getPageTitle();

  return (
    <CommonNavbar
      user={userdata}
      notifications={notifications}
      unreadCount={unreadCount}
      isLoadingNotifications={isLoading}
      onNotificationClick={handleNotificationClick}
      onMarkAllAsRead={handleMarkAllAsRead}
      onLoadMoreNotifications={handleLoadMore}
      onSignOut={signOut}
      hasNextPage={pagination.hasNextPage}
      searchPlaceholder="Search users, bookings..."
      onSearch={(q) => setSearchQuery(q)}
      roleLabel="admin"
      pageTitle={pageTitle}
      pageSubtitle="Welcome back to Navyaa admin Portal"
      onToggleSidebar={onToggleSidebar}
      sidebarCollapsed={sidebarCollapsed}
      logoSrc={(typeof settings?.logo === 'string' ? settings.logo : undefined) || "/Images/Logo2.png"}
    />
  );
}
