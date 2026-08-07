"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { userApiService } from '../services/api/user';
import type { Notification, NotificationsApiResponse } from '../types/api';
import { toast } from 'react-hot-toast';
import { useSocketEvent, useSocketClient } from '../../hooks/useSocket';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const { emit, isConnected } = useSocketClient();


  const fetchNotifications = useCallback(async (params?: { page?: number; limit?: number }, append: boolean = false) => {
    if (isFetchingRef.current && !append) return;

    try {
      isFetchingRef.current = true;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const page = params?.page || 1;
      const limit = params?.limit || 10;

      
      const response = await userApiService.getNotifications({ page, limit });

      if (response.success && response.data) {
        if (append) {
          // Append new notifications to existing ones
          setNotifications(prev => [...prev, ...(response.data.notifications || [])]);
        } else {
          // Replace notifications
          setNotifications(response.data.notifications || []);
          setCurrentPage(1);
        }
        setUnreadCount(response.data.unreadCount || 0);
        setCurrentPage(page);
        setHasMore(response.data.pagination?.hasNextPage || false);
        hasFetchedRef.current = true;
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  // Socket Event Handlers
  const handleNewNotification = useCallback((data: any) => {
    
    const newNotification = (data.data || data) as Notification;
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    toast.success(newNotification.title || "New notification received", {
      icon: '🔔',
    });
  }, []);

  const handleNotificationRead = useCallback((data: any) => {
    
    const notificationId = data.notificationId || data.id || data;
    setNotifications(prev => prev.map(n =>
      n._id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const handleAllNotificationsRead = useCallback(() => {
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const handleNotificationStats = useCallback((data: any) => {
    
    // Handle both { count: N }, { unreadCount: N } and { unread: N } or direct number N
    const unread = data?.count ?? data?.unreadCount ?? data?.unread ?? (typeof data === 'number' ? data : 0);
    
    setUnreadCount(unread);

    // Fallback: If stats payload includes notifications, sync them
    if (data?.notifications && Array.isArray(data.notifications)) {
      setNotifications(data.notifications);
    }
  }, []);



  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    const nextPage = currentPage + 1;
    await fetchNotifications({ page: nextPage, limit: 10 }, true);
  }, [currentPage, hasMore, loadingMore, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n =>
      n._id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      // Keep REST API call as requested
      const response = await userApiService.markNotificationRead(notificationId);

      // Trigger socket event
      emit("markNotificationRead", { notificationId });

      if (!response.success) {
        // Rollback on failure if needed (omitted for simplicity as socket might have worked)
        // toast.error(response.message || 'Failed to mark notification as read');
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  }, [emit]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      // Keep REST API call
      const response = await userApiService.markAllNotificationsRead();

      // Trigger socket event
      emit("markAllNotificationsRead", {});

      if (response.success) {
        toast.success('All notifications marked as read');
      } else {
        toast.error(response.message || 'Failed to mark all notifications as read');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  }, [emit]);

  // Register Socket Listeners
  useSocketEvent("notification", handleNewNotification);
  useSocketEvent("notificationRead", handleNotificationRead);
  useSocketEvent("allNotificationsRead", handleAllNotificationsRead);
  useSocketEvent("notificationStats", handleNotificationStats);
  useSocketEvent("unreadNotifications", handleNotificationStats);

  // Fetch initial stats via socket when connected
  useEffect(() => {
    
    if (isConnected) {
      
      emit("getNotificationStats", {});
    }
  }, [isConnected, emit]);


  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    error,
    hasMore,
    currentPage,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    refetch: () => fetchNotifications({ page: 1, limit: 10 }, false),
  };
}

