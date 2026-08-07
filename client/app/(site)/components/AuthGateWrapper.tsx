'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

interface AuthGateWrapperProps {
  children: ReactNode;
  onUnauthorizedInteraction?: () => void;
}

/**
 * Wraps components and intercepts button/link clicks for unauthenticated users.
 * Shows a callback (e.g., WaitlistPopup) when an unauthenticated user clicks actionable elements.
 */
export default function AuthGateWrapper({ children, onUnauthorizedInteraction }: AuthGateWrapperProps) {
  const user = useAuthStore((state) => state.user);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || user) return; // If logged in, do nothing

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if the clicked element is a button, link, or inside one
      const clickedButton = target.closest('button, a, [role="button"]');

      // Exclude certain buttons/links (e.g., navigation, modals)
      if (clickedButton) {
        // Check if click originated from WaitlistPopup or other modals
        if (clickedButton.closest('[data-modal], [role="dialog"], .popup, .modal, [data-waitlist-popup], [data-auth-modal]')) {
          return;
        }

        // Allow form submit buttons inside popups
        if (clickedButton.closest('form') && (clickedButton as HTMLButtonElement).type === 'submit') {
          return;
        }

        const href = clickedButton.getAttribute('href');
        const ariaLabel = clickedButton.getAttribute('aria-label')?.toLowerCase() || '';
        const classList = clickedButton.className || '';

        // Allow navigation to auth pages
        if (href?.includes('/auth/') || href?.includes('/login') || href?.includes('/sign-in')) {
          return;
        }

        // Allow close/cancel buttons (check by class, text, and aria-label)
        if (
          classList.includes('close') ||
          classList.includes('cancel') ||
          classList.includes('dismiss') ||
          clickedButton.textContent?.toLowerCase().includes('close') ||
          clickedButton.textContent?.toLowerCase().includes('cancel') ||
          ariaLabel.includes('close') ||
          ariaLabel.includes('dismiss') ||
          target.closest('svg') // Allow clicking SVG close icons
        ) {
          return;
        }

        // If we reach here, it's an actionable element clicked by an unauthenticated user
        event.preventDefault();
        event.stopPropagation();

        if (onUnauthorizedInteraction) {
          onUnauthorizedInteraction();
        }
      }
    };

    // Use capture phase to intercept clicks early
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isClient, user, onUnauthorizedInteraction]);

  return <>{children}</>;
}
