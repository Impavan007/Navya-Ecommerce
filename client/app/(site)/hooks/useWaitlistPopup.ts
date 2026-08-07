"use client";

import { useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../stores/uiStore';

export function useWaitlistPopup() {
  const { isWaitlistModalOpen, setWaitlistModalOpen } = useUIStore();
  const pathname = usePathname();

  // Close popup when navigating to any auth page
  useEffect(() => {
    if (pathname.startsWith('/auth/')) {
      setWaitlistModalOpen(false);
    }
  }, [pathname, setWaitlistModalOpen]);

  // Stable references — these must NOT be recreated on every render,
  // otherwise effects that list them as dependencies will loop infinitely.
  const openPopup = useCallback(() => {
    setWaitlistModalOpen(true);
  }, [setWaitlistModalOpen]);

  const closePopup = useCallback(() => {
    setWaitlistModalOpen(false);
  }, [setWaitlistModalOpen]);

  const resetPopup = useCallback(() => {
    localStorage.removeItem('hasSeenWaitlistPopup');
  }, []);

  return {
    isOpen: isWaitlistModalOpen,
    openPopup,
    closePopup,
    resetPopup,
  };
}
