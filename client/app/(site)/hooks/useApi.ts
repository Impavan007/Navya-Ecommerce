/**
 * Generic API Hook for User Section
 * Provides common loading, error, and data states for API calls
 */

import { useState, useCallback } from 'react';
import { ApiError } from '../services/api/base';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  initialData?: any;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<UseApiState<T>>({
    data: options.initialData || null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async <P extends any[] = []>(
    apiCall: (...args: any[]) => Promise<any>
  ) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const result = await apiCall();

      setState({
        data: result.data,
        loading: false,
        error: null,
        success: true,
      });

      if (options.onSuccess) {
        options.onSuccess(result.data);
      }

      return result;
    } catch (error) {
      let errorMessage = 'An error occurred';

      if (error instanceof ApiError) {
        errorMessage = error.message;
        if (options.onError) {
          options.onError(error);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });

      throw error;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      data: options.initialData || null,
      loading: false,
      error: null,
      success: false,
    });
  }, [options.initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for handling paginated API calls
 */
export function usePaginatedApi<T = any>(options: UseApiOptions = {}) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    success,
    execute,
    reset,
  } = useApi<T[]>(options);

  const loadMore = useCallback(async <P extends any[]>(
    apiCall: (...args: P) => Promise<{ data: any[]; meta?: any }>
  ) => {
    if (loading || !hasMore) return;

    try {
      const result = await execute(apiCall);

      if (result?.meta) {
        setHasMore(result.meta.hasNextPage || false);
        setPage(prev => prev + 1);
      }

      return result;
    } catch (error) {
      // Error handling is already done in execute
      throw error;
    }
  }, [loading, hasMore, execute]);

  const refresh = useCallback(async <P extends any[]>(
    apiCall: (...args: P) => Promise<any>
  ) => {
    setPage(1);
    setHasMore(true);
    reset();
    return execute(apiCall);
  }, [execute, reset]);

  return {
    data,
    loading,
    error,
    success,
    page,
    hasMore,
    loadMore,
    refresh,
    reset,
    setPage,
  };
}

/**
 * Hook for handling form submissions with API calls
 */
export function useFormApi<T = any>(options: UseApiOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data,
    loading,
    error,
    success,
    execute,
    reset,
  } = useApi<T>(options);

  const submitForm = useCallback(async <P extends any[]>(
    apiCall: (...args: P) => Promise<any>,
    formData?: any
  ) => {
    setIsSubmitting(true);

    try {
      const result = await execute(apiCall);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [execute]);

  return {
    data,
    loading,
    error,
    success,
    isSubmitting: isSubmitting || loading,
    submitForm,
    reset,
  };
}
