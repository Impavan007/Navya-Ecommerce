/**
 * Settings Hooks for User Section
 * Provides React hooks for settings operations
 */

import { useEffect, useCallback, useRef } from 'react';
import { settingsApiService } from '../services/api/settings';
import { useApi } from './useApi';
import type { SettingsData } from '../types/api';

export function useSettings() {
  const {
    data: settings,
    loading,
    error,
    success,
    execute,
  } = useApi<SettingsData>();

  // Use ref to track if we've already initiated a fetch to prevent multiple requests
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchSettings = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    try {
      const result = await execute(() => settingsApiService.getSettings());
      hasFetchedRef.current = true;
      return result;
    } catch (error) {
      throw error;
    } finally {
      isFetchingRef.current = false;
    }
  }, [execute]);

  useEffect(() => {
    // Only fetch once on mount if we don't have data
    if (!hasFetchedRef.current && !settings && !loading) {
      fetchSettings();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    settings: settings || null,
    loading,
    error,
    success,
    refetch: useCallback(async () => {
      hasFetchedRef.current = false;
      return fetchSettings();
    }, [fetchSettings]),
  };
}

