'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export interface NavbarProps {
  user: any;
  notifications: any[];
  unreadCount: number;
  isLoadingNotifications: boolean;
  onNotificationClick: (notification: any) => void;
  onMarkAllAsRead: () => void;
  onLoadMoreNotifications: () => void;
  onSignOut: () => void;
  onSwitchAccount?: () => Promise<void>;
  isSwitchingAccount?: boolean;
  hasNextPage?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  showSearch?: boolean;
  roleLabel?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export default function CommonNavbar({
  user,
  notifications,
  unreadCount,
  isLoadingNotifications,
  onNotificationClick,
  onMarkAllAsRead,
  onLoadMoreNotifications,
  onSignOut,
  onSwitchAccount,
  isSwitchingAccount = false,
  hasNextPage = false,
  searchPlaceholder = "Search...",
  onSearch,
  logoSrc = "/Images/Logo2.png",
  logoWidth = 100,
  logoHeight = 50,
  showSearch = true,
  roleLabel = "",
  pageTitle = "",
  pageSubtitle = "",
  onToggleSidebar,
  sidebarCollapsed = false
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Handle Search
  const handleSearch = () => {
    if (onSearch) onSearch(searchQuery.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showNotifications && !target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
      if (showProfile && !target.closest('.profile-dropdown')) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfile]);

  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.firstName || '';
    const last = user.lastName || '';
    if (first || last) return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
    if (user.name) {
      const parts = user.name.split(' ');
      return `${parts[0][0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'OrderCancelled': return 'ri-close-circle-line text-red-500';
      case 'OrderConfirmed': return 'ri-checkbox-circle-line text-green-500';
      case 'OrderShipped': return 'ri-truck-line text-blue-500';
      default: return 'ri-notification-line text-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <>
      {isSwitchingAccount && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center font-roboto">
          <div className="bg-white px-6 py-4 rounded shadow flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3D1126]" />
          </div>
        </div>
      )}

      <header className="bg-white border-b border-[#F0E6D2] fixed top-0 left-0 right-0 z-40 h-16 transition-all font-roboto shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">

            {/* Left Section - Sidebar Toggle & Logo */}
            <div className="flex items-center p-3 gap-10">
              {/* Logo */}
              <Link href="/">
                <span className="font-serif tracking-[0.2em] text-2xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
                  NAVYAA
                </span>
              </Link>
              <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-[#FAF4E8] rounded-md transition-colors duration-200"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <i className={`ri-menu-${sidebarCollapsed ? 'unfold' : 'fold'}-line text-[#BFA15F] text-xl`}></i>
              </button>
            </div>

            {/* Right Side */}
            <div className="flex items-center justify-end flex-none gap-2 ml-auto">

              {/* Notifications */}
              <div className="relative notifications-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <i className="ri-notification-3-line text-xl text-[#BFA15F]"></i>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-[#BFA15F] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="fixed left-2 right-2 top-16 z-50 max-h-[70vh] overflow-hidden bg-white rounded-xl shadow-lg border border-[#F0E6D2] py-0 flex flex-col sm:absolute sm:right-0 sm:left-auto sm:mt-2 sm:w-80 lg:w-96">
                    <div className="px-6 py-4 border-b border-[#F0E6D2] bg-[#FAF4E8] rounded-t-xl">
                      <div className="flex justify-between items-center">
                        <h3 className="font-serif font-bold text-[#1A1A1A] text-base">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={onMarkAllAsRead}
                            className="text-xs text-[#BFA15F] hover:text-[#9E7D3B] font-semibold transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-96">
                      {isLoadingNotifications && notifications.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#BFA15F]"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                          <i className="ri-notification-off-line text-3xl mb-2 text-[#BFA15F]/40"></i>
                          <p className="text-sm font-poppins">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => onNotificationClick(notification)}
                            className={`px-6 py-4 hover:bg-[#FAF8F5] cursor-pointer border-b border-[#F5EFE6] last:border-b-0 transition-colors ${!notification.read ? 'bg-[#FAF4E8]/50' : ''}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-0.5">
                                <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{notification.title}</p>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityColor(notification.metadata?.priority)}`}>
                                    {notification.metadata?.priority}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed mb-2">{notification.message}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400">{formatTimeAgo(notification.created_at)}</span>
                                  {!notification.read && <span className="w-2 h-2 bg-[#BFA15F] rounded-full"></span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {hasNextPage && (
                      <div className="border-t border-[#F0E6D2] bg-[#FAF4E8]">
                        <button
                          onClick={onLoadMoreNotifications}
                          disabled={isLoadingNotifications}
                          className="w-full px-6 py-3 text-xs font-semibold text-[#BFA15F] hover:text-[#9E7D3B] transition-colors flex items-center justify-center gap-2"
                        >
                          {isLoadingNotifications ? 'Loading...' : 'View More'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-3 p-1 hover:bg-[#FAF4E8] rounded-full transition-colors"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden shadow-xs border border-[#E5C9A4] bg-[#FAF4E8]">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center bg-[#FAF4E8] text-[#BFA15F] text-xs font-bold">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-[#1A1A1A]">
                    {user?.firstName || user?.name || 'User'}
                  </span>
                  <i className="ri-arrow-down-s-line text-[#BFA15F]"></i>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                      <p className="text-sm font-medium text-black truncate">
                        {user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : (user?.name || 'User')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      {roleLabel && <p className="text-xs text-gray-400 mt-1">{roleLabel}</p>}
                    </div>

                    <button
                      onClick={() => { router.push(`/${roleLabel === 'admin' ? 'admin' : 'lender'}/account`); setShowProfile(false); }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <i className="ri-settings-3-line"></i>
                      <span>Settings</span>
                    </button>

                    {onSwitchAccount && user?.switch_account && (
                      <button
                        onClick={onSwitchAccount}
                        disabled={isSwitchingAccount}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <i className="ri-refresh-line"></i>
                        <span>{isSwitchingAccount ? 'Switching...' : (user?.isSwitched ? 'Switch Back' : 'Switch Account')}</span>
                      </button>
                    )}

                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <i className="ri-logout-box-line"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>
    </>
  );
}
