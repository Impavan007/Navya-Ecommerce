"use client";

import { useState, useCallback } from "react";

interface LoadingState {
  [key: string]: boolean;
}

export const useLoading = (initialState: LoadingState = {}) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialState);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFunction: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading(key);
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  return {
    loadingStates,
    setLoading,
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};

export default useLoading;
