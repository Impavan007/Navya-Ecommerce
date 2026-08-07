'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from '@/app/(site)/hooks/useAuth';
import { useAuthStore } from '@/app/(site)/stores/authStore';
import { authApiService } from '@/app/(site)/services/api/auth';
import { useMessageStore } from '../stores/MessageStore';
import { useNotificationStore, Notification } from '../stores/AdminHeaderStor/NotificationStore';
import { toast } from 'react-hot-toast';
import CommonNavbar from '../../components/common/Navbar';
import { useSocketEvent, useSocketClient } from '@/app/hooks/useSocket';
import { useSettings } from '@/app/(site)/hooks/useSettings';
import useProfileStore from '../stores/Profile/profileStore';

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export default function DashboardHeader({ onToggleSidebar, sidebarCollapsed }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();
  const storeSignIn = useAuthStore((state) => state.signIn);

  const { fetchUnreadCount, incrementUnreadCount, unreadCount: unreadMessageCount } = useMessageStore();

  // Notification store
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications,
    handleNewNotification,
    handleNotificationRead,
    handleAllNotificationsRead,
    handleNotificationStats,
    clearError,
  } = useNotificationStore();

  const { settings } = useSettings();

  const { emit, isConnected } = useSocketClient();

  // Register Socket Listeners
  useSocketEvent("notification", handleNewNotification);
  useSocketEvent("notificationRead", handleNotificationRead);
  useSocketEvent("allNotificationsRead", handleAllNotificationsRead);
  useSocketEvent("notificationStats", handleNotificationStats);
  useSocketEvent("unreadNotifications", handleNotificationStats);

  // Message Socket Listeners
  const handleReceiveMessage = useCallback((data: any) => {

    // Increment if it's an incoming message (data might vary, but usually has sender)
    // For now, let's just refetch to be safe or increment
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useSocketEvent("receiveMessage", handleReceiveMessage);

  // Fetch initial stats via socket
  useEffect(() => {
    if (isConnected) {

      emit("getNotificationStats", {});
    }
  }, [isConnected, emit]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchNotifications(1, 10);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);


  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications(1, 10);
  }, [fetchNotifications]);

  const [userdata, setUserdata] = useState<any>(null);
  const [isLocalStorageUser, setIsLocalStorageUser] = useState(false);

  // Fetch notifications when notifications popup opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications(1, 10);
    }
  }, [showNotifications, fetchNotifications]);

  // Keep user data in sync with auth store (reacts to switch-account updates)
  const authUser = useAuthStore((state) => state.user);

  // Debug useEffect
  useEffect(() => {

  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      setUserdata(authUser);
      setIsLocalStorageUser(false);
      return;
    }

    // If authUser is null, fetch data from localStorage
    if (typeof window !== 'undefined') {
      try {
        // Try to get data from navyaa-auth first
        const saved = localStorage.getItem('navyaa-auth');
        if (saved) {
          const parsed = JSON.parse(saved);
          const userFromNavyaaAuth = parsed?.state?.user || null;
          if (userFromNavyaaAuth) {
            setUserdata(userFromNavyaaAuth);
            setIsLocalStorageUser(false); // This is from Zustand persistence
            return;
          }
        }

        // If navyaa-auth doesn't exist or has no user, fetch individual fields from localStorage
        const name = localStorage.getItem('user_name') || '';
        const email = localStorage.getItem('user_email') || '';
        const role = localStorage.getItem('role') || 'user';
        const switchAccount = localStorage.getItem('switch_account') === 'true';
        const isSwitched = localStorage.getItem('isSwitched') === 'true';

        // Only create userdata if we have basic info
        if (name || email) {
          // Parse name into first and last name
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const userFromLocalStorage = {
            id: '', // Not available in localStorage
            email,
            firstName,
            lastName,
            name,
            role: role.toLowerCase() as 'buyer' | 'seller' | 'admin',
            switch_account: switchAccount,
            isSwitched,
            is_switched: isSwitched,
            preferences: {
              currency: 'INR',
              language: 'en',
              notifications: {
                email: true,
                sms: false,
                push: true,
                marketing: false,
                bookingUpdates: true,
                reviewReminders: true,
              },
              privacy: {
                profileVisibility: 'public' as 'public' | 'friends' | 'private',
                showInSearch: true,
                allowMessages: true,
              },
            },
            isEmailVerified: true,
            isPhoneVerified: false,
            status: 'active' as 'active' | 'suspended' | 'deactivated',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setUserdata(userFromLocalStorage);
          setIsLocalStorageUser(true);

          // Also update the auth store with this data if needed
          const token = localStorage.getItem('auth_token');
          if (token && !useAuthStore.getState().user) {
            storeSignIn(userFromLocalStorage, token, role as any);
          }
        } else {
          setUserdata(null);
          setIsLocalStorageUser(false);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setUserdata(null);
        setIsLocalStorageUser(false);
      }
    }
  }, [authUser, storeSignIn]);

  const { profile, fetchProfile: fetchLenderProfile } = useProfileStore();

  useEffect(() => {
    fetchLenderProfile();
  }, [fetchLenderProfile]);

  useEffect(() => {
    if (profile && profile.profileImage && profile.profileImage !== '/api/placeholder/150/150') {
      setUserdata((prev: any) => ({
        ...prev,
        profile_image: profile.profileImage
      }));
    }
  }, [profile]);

  // Handle logout for both auth methods
  const handleLogout = () => {
    // Clear Zustand auth
    signOut();

    // Clear localStorage for localStorage users
    if (isLocalStorageUser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('role');
      localStorage.removeItem('switch_account');
      localStorage.removeItem('isSwitched');

      // Clear cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    setShowProfile(false);
    setUserdata(null);
    setIsLocalStorageUser(false);

    toast.success("Logged out successfully");
    router.push('/');
  };

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification._id);
      emit("markNotificationRead", { notificationId: notification._id });
    }

    let actionUrl = notification.metadata?.actionUrl;

    if (notification.metadata?.role === "Both" && actionUrl === "/Become-lender") {
      handleSwitchAccount();
      setShowNotifications(false);
      return;
    }

    if (actionUrl) {
      const metadata = notification.metadata as any;
      const separator = actionUrl.includes("?") ? "&" : "?";

      // Append specific IDs based on notification type/metadata
      if (metadata.chatId) {
        actionUrl = `${actionUrl}${separator}chatId=${metadata.chatId}`;
      } else if (metadata.orderId?._id) {
        actionUrl = `${actionUrl}${separator}orderId=${metadata.orderId._id}`;
      } else if (metadata.productId?._id) {
        actionUrl = `${actionUrl}${separator}productId=${metadata.productId._id}`;
      } else if (notification.type === "supportStatusUpdate") {
        // Typically supportStatusUpdate might not have a direct ticketId in metadata? 
        // Based on JSON it seems to be in a hidden field or we might need it.
        // If it's not there, the user might need to add it to API.
        // But let's assume if it exists in metadata we append it.
        if (metadata.ticketId) {
          actionUrl = `${actionUrl}${separator}ticketId=${metadata.ticketId}`;
        }
      }

      router.push(actionUrl);
    } else if (notification.metadata.orderId) {
      router.push(`/lender/orders?orderId=${notification.metadata.orderId._id}`);
    }

    setShowNotifications(false);
  }, [markAsRead, router, emit]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
    emit("markAllNotificationsRead", {});
  }, [markAllAsRead, emit]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage && !isLoading) {
      loadMoreNotifications();
    }
  }, [pagination.hasNextPage, isLoading, loadMoreNotifications]);

  // Helper function to clear all auth data
  const clearAllAuthData = () => {
    if (typeof window === 'undefined') return;

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('role');
    localStorage.removeItem('switch_account');
    localStorage.removeItem('isSwitched');

    // Clear cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const handleSwitchAccount = async () => {
    try {
      setIsSwitchingAccount(true);

      // Save current auth token before clearing
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      // Call the switch account API
      const response = await authApiService.switchAccount();



      const status = (response as any)?.status;
      if (status !== undefined && status !== 201 && status !== 200) {
        toast.error(response.message || "Failed to switch account");
        return;
      }

      if (response.success && response.data) {
        const apiUser = response.data.user;
        const roleFromApi = apiUser.role;
        const roleForCookie = roleFromApi === 'Lender' || roleFromApi === 'admin' ? roleFromApi : 'user';
        const normalizedRole = typeof roleFromApi === 'string'
          ? roleFromApi.toLowerCase()
          : 'user';

        // Get actual switch status from API
        const isSwitchedFromApi =
          typeof apiUser?.isSwitched === 'boolean'
            ? apiUser.isSwitched
            : typeof apiUser?.is_switched === 'boolean'
              ? apiUser.is_switched
              : apiUser?.isswithced || false;

        // Use actual API data instead of hardcoded values
        const userData: any = {
          id: apiUser.id || apiUser._id || '',
          email: apiUser.email || '',
          firstName: apiUser.firstName || apiUser.name?.split(' ')[0] || '',
          lastName: apiUser.lastName || apiUser.name?.split(' ').slice(1).join(' ') || '',
          name: apiUser.name || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
          preferences: apiUser.preferences || {
            currency: 'INR',
            language: 'en',
            notifications: {
              email: true,
              sms: false,
              push: true,
              marketing: false,
              bookingUpdates: true,
              reviewReminders: true,
            },
            privacy: {
              profileVisibility: 'public',
              showInSearch: true,
              allowMessages: true,
            },
          },
          isEmailVerified: apiUser.isEmailVerified || apiUser.emailVerified || true,
          isPhoneVerified: apiUser.isPhoneVerified || apiUser.phoneVerified || false,
          role: normalizedRole as 'user' | 'lender' | 'admin',
          status: apiUser.status || 'active',
          createdAt: apiUser.createdAt || new Date().toISOString(),
          updatedAt: apiUser.updatedAt || new Date().toISOString(),
          switch_account: Boolean(apiUser.switch_account),
          isSwitched: isSwitchedFromApi,
          is_switched: isSwitchedFromApi,
        };

        // Clear old auth data
        clearAllAuthData();

        // Set new localStorage data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_name', userData.name);
          localStorage.setItem('user_email', userData.email);
          localStorage.setItem('role', roleForCookie);
          localStorage.setItem('switch_account', String(userData.switch_account));
          localStorage.setItem('isSwitched', String(userData.isSwitched));

          // Use new token from response, fall back to current token if not provided
          const tokenToStore = response.data.token || currentToken;
          if (tokenToStore) {
            localStorage.setItem('auth_token', tokenToStore);
          }
        }

        // Persist token/user just like sign-in
        storeSignIn(userData, response.data.token || currentToken, roleForCookie as any);

        // Force update userdata state
        setUserdata(userData);

        // Close profile dropdown
        setShowProfile(false);

        // Redirect based on new role
        if (normalizedRole === 'lender') {
          toast.success("Switched to lender account successfully");
          router.push('/lender');
        } else {
          toast.success("Switched back to user account successfully");
          router.push('/');
        }
      } else {
        toast.error(response.message || "Failed to switch account");
      }
    } catch (error: any) {
      console.error('Switch account error:', error);
      toast.error(error?.message || "Failed to switch account");
    } finally {
      setIsSwitchingAccount(false);
    }
  };

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
      if (showProfile && !target.closest('.profile-dropdown')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfile]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userdata) return 'U';

    const firstName = userdata.firstName || '';
    const lastName = userdata.lastName || '';

    if (firstName || lastName) {
      return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
    }

    if (userdata.name) {
      const nameParts = userdata.name.split(' ');
      return `${nameParts[0][0] || ''}${nameParts[1]?.[0] || ''}`.toUpperCase();
    }

    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!userdata) return '';

    if (userdata.firstName || userdata.lastName) {
      return `${userdata.firstName || ''} ${userdata.lastName || ''}`.trim();
    }

    if (userdata.name) {
      return userdata.name;
    }

    return '';
  };

  // Better logic for determining switch button state
  const getSwitchButtonState = () => {
    if (!userdata) return { show: false, text: '' };

    const role = userdata?.role;
    const isSwitched = userdata?.isSwitched || userdata?.is_switched || false;
    const switchAccount = userdata?.switch_account === true;



    // If user doesn't have switch permission, don't show button at all
    if (!switchAccount) {
      return { show: false, text: '' };
    }

    // If user is a regular user and has switch permission, show "Switch to Lender"
    if (role === 'user' && !isSwitched) {
      return { show: true, text: 'Switch to Lender' };
    }

    // If user is a lender OR is switched, show "Switch Back to User"
    if (role === 'lender' || isSwitched) {
      return { show: true, text: 'Switch Back to Renter' };
    }

    return { show: false, text: '' };
  };

  const switchButtonState = getSwitchButtonState();
  const showSwitchButton = switchButtonState.show;
  const switchButtonText = switchButtonState.text;

  const pathname = usePathname();

  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Dashboard';
    const lastPart = parts[parts.length - 1];
    if (lastPart === 'lender') return 'Dashboard';
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  };

  const pageTitle = getPageTitle();

  return (
    <>
      <CommonNavbar
        user={userdata}
        notifications={notifications}
        unreadCount={Number(unreadCount) + Number(unreadMessageCount)}
        isLoadingNotifications={isLoading}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
        onLoadMoreNotifications={handleLoadMore}
        onSignOut={handleLogout}
        onSwitchAccount={handleSwitchAccount}
        isSwitchingAccount={isSwitchingAccount}
        hasNextPage={pagination.hasNextPage}
        roleLabel={userdata?.role === 'seller' || userdata?.role === 'lender' ? 'seller' : 'Buyer'}
        pageTitle={pageTitle}
        pageSubtitle="Manage your listings and earnings"
        onToggleSidebar={onToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
        logoSrc={settings?.logo || "/Images/Logo2.png"}
      />

    </>
  );
}