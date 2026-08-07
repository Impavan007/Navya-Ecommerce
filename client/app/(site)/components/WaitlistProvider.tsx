"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useWaitlistPopup } from '../hooks/useWaitlistPopup';
import { useAuthStore } from '../stores/authStore';
import SignUpModal from './SignUpModal';

interface WaitlistProviderProps {
  children: React.ReactNode;
}

export default function WaitlistProvider({ children }: WaitlistProviderProps) {
  const { isOpen, closePopup, openPopup } = useWaitlistPopup();
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  // Hydration guard so we don't act before the client has mounted
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Keep a stable ref to closePopup to avoid re-triggering the navigate effect
  const closePopupRef = useRef(closePopup);
  useEffect(() => {
    closePopupRef.current = closePopup;
  });

  const isAuthPage = pathname.startsWith('/auth/');
  const isLandingPage = pathname === '/';

  // Pages considered protected — must match GlobalRouteProtection's list exactly
  // to avoid open/close conflicts between the two components.
  const protectedPages = [
    '/cart',
    '/account',
    '/bookings',
    '/wishlists',
    '/checkout'
  ];
  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));
  const isSupportPage = pathname.startsWith('/support');

  // The modal should show whenever it's opened and the user is NOT authenticated.
  // It should never show if the user is authenticated.
  const shouldShowModal = !isAuthenticated && isOpen;


  return (
    <>
      {children}
      <SignUpModal
        isOpen={shouldShowModal}
        onClose={isProtectedPage && !isAuthenticated ? undefined : closePopup}
      />
    </>
  );
}
