"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWaitlistPopup } from '../hooks/useWaitlistPopup';
import { usePathname } from 'next/navigation';

/**
 * Global route protection component
 * Redirects / shows auth modal for unauthenticated users on protected pages.
 * Waits for Zustand persisted state to hydrate before evaluating auth status
 * to avoid showing the modal on refresh for already-authenticated users.
 */
export default function GlobalRouteProtection({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { openPopup } = useWaitlistPopup();
  const pathname = usePathname();
  // Hydration guard: don't run auth check until after the client has mounted
  // and Zustand has rehydrated its persisted state from localStorage.
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Pages that require authentication
  const protectedPages = [
    '/cart',
    '/account',
    '/bookings',
    '/wishlists',
    '/checkout',
    '/LenderPage',
    '/stories'
  ];

  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));
  const isAuthPage = pathname.startsWith('/auth/');

  useEffect(() => {
    // Only evaluate after hydration to avoid false-negatives on refresh
    if (!isHydrated) return;
    if (!isAuthenticated && isProtectedPage && !isAuthPage) {
      openPopup();
    }
  }, [isHydrated, isAuthenticated, isProtectedPage, isAuthPage, openPopup]);

  return <>{children}</>;
}
