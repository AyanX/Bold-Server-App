/**
 * useApi Hook
 *
 * Custom hook for handling API requests with loading, error, and data states.
 * Provides consistent error handling and loading states across the application.
 *
 * @module hooks/useApi
 */

import { useState, useCallback } from 'react';

/**
 * API request state
 */
interface ApiState<T> {
  /** Response data */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Whether request was successful */
  isSuccess: boolean;
}

/**
 * API hook return type
 */
interface UseApiReturn<T, P extends unknown[]> {
  /** Current state */
  state: ApiState<T>;
  /** Execute the API request */
  execute: (...args: P) => Promise<T | null>;
  /** Reset state to initial values */
  reset: () => void;
  /** Set data manually */
  setData: (data: T | null) => void;
}

/**
 * Initial state for API requests
 */
const initialState = <T>(): ApiState<T> => ({
  data: null,
  isLoading: false,
  error: null,
  isSuccess: false,
});

/**
 * Custom hook for API request management
 *
 * @template T - Response data type
 * @template P - Request parameters type
 * @param apiFunction - Async function that makes the API request
 * @returns Object with state and control functions
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { state, execute } = useApi(api.articles.getAll);
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 *
 * if (state.isLoading) return <Spinner />;
 * if (state.error) return <Error message={state.error} />;
 * return <ArticleList articles={state.data} />;
 *
 * // With parameters
 * const { state, execute } = useApi(api.articles.get);
 * execute(articleId);
 *
 * // Manual data setting
 * const { state, setData } = useApi(fetchUser);
 * setData(cachedUser); // Skip API call if cached
 * ```
 */
function useApi<T, P extends unknown[] = []>(
  apiFunction: (...args: P) => Promise<{ data: T }>
): UseApiReturn<T, P> {
  const [state, setState] = useState<ApiState<T>>(initialState);

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
      }));

      try {
        const response = await apiFunction(...args);
        const data = response.data;

        setState({
          data,
          isLoading: false,
          error: null,
          isSuccess: true,
        });

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';

        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
          isSuccess: false,
        });

        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
      isSuccess: data !== null,
    }));
  }, []);

  return { state, execute, reset, setData };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 * Similar to useApi but optimized for mutation operations
 */
export function useMutation<T, P extends unknown[] = []>(
  mutationFunction: (...args: P) => Promise<{ data: T }>
): UseApiReturn<T, P> & { mutate: (...args: P) => Promise<T | null> } {
  const api = useApi<T, P>(mutationFunction);

  return {
    ...api,
    mutate: api.execute,
  };
}

export default useApi;
