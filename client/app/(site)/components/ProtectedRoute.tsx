"use client";

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWaitlistPopup } from '../hooks/useWaitlistPopup';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean; // New prop to control if auth is required
}

/**
 * Higher-order component to protect routes
 * Shows waitlist popup for non-authenticated users
 * Always shows popup when user is not authenticated, regardless of previous popup state
 */
export default function ProtectedRoute({ children, fallback, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const { openPopup } = useWaitlistPopup();

  useEffect(() => {
    if (!isAuthenticated && requireAuth) {
      // Always show waitlist popup for non-authenticated users accessing protected routes
      // Reset the popup state to ensure it shows every time
      openPopup();
    }
  }, [isAuthenticated, openPopup, requireAuth]);

  return (
    <div className="relative">
      {/* Blurred background content wrapper */}
      <div className={`${!isAuthenticated && requireAuth ? "filter blur-sm pointer-events-none" : ""}`}>
        {children}
      </div>

      {/* Fallback content overlay */}
      {!isAuthenticated && requireAuth && fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
          {fallback}
        </div>
      )}
    </div>
  );
}
