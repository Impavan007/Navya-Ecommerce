"use client";

import { useAuthInit } from '../hooks/useAuthInit';

/**
 * Component to initialize authentication state
 * This runs once when the app starts to check for existing auth tokens
 */
export default function AuthInitializer() {
  useAuthInit();
  return null; // This component doesn't render anything
}
