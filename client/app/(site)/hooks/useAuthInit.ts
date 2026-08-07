"use client";

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to initialize authentication state on app start
 * This should be called once in the root layout or main app component
 */
export function useAuthInit() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state (check for existing tokens, etc.)
    initialize();
  }, [initialize]);
}
