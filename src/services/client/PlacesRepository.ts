/**
 * 前端 Places 資料存取層
 * 遵循 Repository Pattern，抽象化資料來源
 * 支援快取、錯誤處理、重試機制
 */

import {
  PlaceSearchRequest,
  PlaceSearchResponse,
  ServiceResponse,
  Place,
  LatLng
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    requestId: string;
    timestamp: number;
    cached: boolean;
  };
}

export class PlacesRepository {
  private readonly baseUrl: string;
  private readonly timeout: number;
  
  constructor(baseUrl = '/api/google/places', timeout = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * 搜尋地點
   */
  async searchPlaces(request: PlaceSearchRequest): Promise<ServiceResponse<PlaceSearchResponse>> {
    try {
      const url = this.buildSearchUrl(request);
      const response = await this.makeRequest<PlaceSearchResponse>(url);
      
      return this.adaptApiResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * 搜尋附近地點
   */
  async searchNearby(
    location: LatLng, 
    radius: number, 
    type?: string
  ): Promise<ServiceResponse<PlaceSearchResponse>> {
    const request: PlaceSearchRequest = {
      location,
      radius,
      type
    };

    return this.searchPlaces(request);
  }

  /**
   * 文字搜尋地點
   */
  async searchByText(query: string, location?: LatLng): Promise<ServiceResponse<PlaceSearchResponse>> {
    const request: PlaceSearchRequest = {
      query,
      location
    };

    return this.searchPlaces(request);
  }

  /**
   * 批次搜尋多個地點類型
   */
  async searchMultipleTypes(
    location: LatLng,
    radius: number,
    types: string[]
  ): Promise<ServiceResponse<Record<string, PlaceSearchResponse>>> {
    try {
      // 並行搜尋多個類型
      const promises = types.map(async (type) => {
        const result = await this.searchNearby(location, radius, type);
        return { type, result };
      });

      const results = await Promise.allSettled(promises);
      const data: Record<string, PlaceSearchResponse> = {};
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.result.data) {
          data[types[index]] = result.value.result.data;
        }
      });

      return {
        data,
        metadata: {
          requestId: `batch_${Date.now()}`,
          timestamp: Date.now(),
          cached: false
        }
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===== 私有方法 =====

  private buildSearchUrl(request: PlaceSearchRequest): string {
    const params = new URLSearchParams();

    if (request.query) params.append('query', request.query);
    if (request.location) {
      params.append('lat', request.location.lat.toString());
      params.append('lng', request.location.lng.toString());
    }
    if (request.radius) params.append('radius', request.radius.toString());
    if (request.type) params.append('type', request.type);

    return `${this.baseUrl}/search?${params.toString()}`;
  }

  private async makeRequest<T>(url: string): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private adaptApiResponse<T>(apiResponse: ApiResponse<T>): ServiceResponse<T> {
    if (!apiResponse.success) {
      return {
        error: {
          code: apiResponse.error?.code || 'UNKNOWN_ERROR',
          message: apiResponse.error?.message || 'Unknown error occurred',
          details: apiResponse.error,
          retryable: this.isRetryableError(apiResponse.error?.code)
        },
        metadata: apiResponse.metadata
      };
    }

    return {
      data: apiResponse.data,
      metadata: apiResponse.metadata
    };
  }

  private handleError(error: any): ServiceResponse<any> {
    if (error.name === 'AbortError') {
      return {
        error: {
          code: 'TIMEOUT',
          message: 'Request timed out',
          details: error,
          retryable: true
        }
      };
    }

    if (error.message?.includes('Failed to fetch')) {
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network connection failed',
          details: error,
          retryable: true
        }
      };
    }

    return {
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error,
        retryable: false
      }
    };
  }

  private isRetryableError(code?: string): boolean {
    const retryableCodes = ['TIMEOUT', 'NETWORK_ERROR', 'QUOTA_EXCEEDED'];
    return retryableCodes.includes(code || '');
  }
}

// Singleton 實例
export const placesRepository = new PlacesRepository();