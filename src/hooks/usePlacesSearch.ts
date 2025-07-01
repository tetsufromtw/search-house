/**
 * Places 搜尋 Hook
 * 整合新的服務層到 React 組件中
 * 提供統一的搜尋介面和狀態管理
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { placesRepository } from '@/services/client/PlacesRepository';
import {
  PlaceSearchRequest,
  PlaceSearchResponse,
  ServiceError,
  LatLng
} from '@/services/types';

interface UsePlacesSearchState {
  data: PlaceSearchResponse | null;
  loading: boolean;
  error: ServiceError | null;
}

interface UsePlacesSearchOptions {
  autoSearch?: boolean;
  debounceMs?: number;
  retryAttempts?: number;
}

interface UsePlacesSearchReturn extends UsePlacesSearchState {
  // 搜尋方法
  searchPlaces: (request: PlaceSearchRequest) => Promise<void>;
  searchByText: (query: string, location?: LatLng) => Promise<void>;
  searchNearby: (location: LatLng, radius: number, type?: string) => Promise<void>;
  
  // 控制方法
  clearResults: () => void;
  retry: () => Promise<void>;
  
  // 狀態標記
  hasResults: boolean;
  canRetry: boolean;
}

export function usePlacesSearch(options: UsePlacesSearchOptions = {}): UsePlacesSearchReturn {
  const {
    autoSearch = false,
    debounceMs = 300,
    retryAttempts = 3
  } = options;

  // 狀態管理
  const [state, setState] = useState<UsePlacesSearchState>({
    data: null,
    loading: false,
    error: null
  });

  // Refs for cleanup and retries
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<PlaceSearchRequest | null>(null);
  const retryCountRef = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 搜尋地點
  const searchPlaces = useCallback(async (request: PlaceSearchRequest) => {
    // 取消之前的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 儲存請求以供重試使用
    lastRequestRef.current = request;
    retryCountRef.current = 0;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await placesRepository.searchPlaces(request);

      if (result.error) {
        setState({
          data: null,
          loading: false,
          error: result.error
        });
      } else {
        setState({
          data: result.data || null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: error,
          retryable: false
        }
      });
    }
  }, []);

  // 文字搜尋 (with debounce)
  const searchByText = useCallback((query: string, location?: LatLng) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    return new Promise<void>((resolve) => {
      debounceTimeoutRef.current = setTimeout(() => {
        searchPlaces({ query, location }).then(resolve);
      }, debounceMs);
    });
  }, [searchPlaces, debounceMs]);

  // 附近搜尋
  const searchNearby = useCallback((location: LatLng, radius: number, type?: string) => {
    return searchPlaces({ location, radius, type });
  }, [searchPlaces]);

  // 清除結果
  const clearResults = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setState({
      data: null,
      loading: false,
      error: null
    });

    lastRequestRef.current = null;
    retryCountRef.current = 0;
  }, []);

  // 重試
  const retry = useCallback(async () => {
    if (!lastRequestRef.current || retryCountRef.current >= retryAttempts) {
      return;
    }

    retryCountRef.current += 1;
    await searchPlaces(lastRequestRef.current);
  }, [searchPlaces, retryAttempts]);

  // 清理 effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // 計算衍生狀態
  const hasResults = Boolean(state.data?.places.length);
  const canRetry = Boolean(
    state.error?.retryable && 
    lastRequestRef.current && 
    retryCountRef.current < retryAttempts
  );

  return {
    // 狀態
    ...state,
    
    // 方法
    searchPlaces,
    searchByText,
    searchNearby,
    clearResults,
    retry,
    
    // 衍生狀態
    hasResults,
    canRetry
  };
}

/**
 * 多類型搜尋 Hook
 * 用於同時搜尋多種地點類型（如餐廳、商店、車站等）
 */
export function useMultiTypePlacesSearch() {
  const [state, setState] = useState<{
    data: Record<string, PlaceSearchResponse> | null;
    loading: boolean;
    error: ServiceError | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const searchMultipleTypes = useCallback(async (
    location: LatLng,
    radius: number,
    types: string[]
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await placesRepository.searchMultipleTypes(location, radius, types);

      if (result.error) {
        setState({
          data: null,
          loading: false,
          error: result.error
        });
      } else {
        setState({
          data: result.data || null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: error,
          retryable: false
        }
      });
    }
  }, []);

  return {
    ...state,
    searchMultipleTypes
  };
}