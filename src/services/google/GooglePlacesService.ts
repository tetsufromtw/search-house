/**
 * Google Places API 服務實現
 * 遵循 Strategy Pattern，可輕易替換為其他地圖提供商
 * 使用 Adapter Pattern 將 Google API 回應轉換為標準格式
 */

import {
  IPlacesService,
  ICacheService,
  IMetricsService
} from '../interfaces';
import {
  PlaceSearchRequest,
  PlaceSearchResponse,
  ServiceResponse,
  ServiceError,
  LatLng,
  Place
} from '../types';

export class GooglePlacesService implements IPlacesService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private readonly cache?: ICacheService;
  private readonly metrics?: IMetricsService;

  constructor(
    apiKey: string,
    cache?: ICacheService,
    metrics?: IMetricsService
  ) {
    this.apiKey = apiKey;
    this.cache = cache;
    this.metrics = metrics;
  }

  async searchPlaces(request: PlaceSearchRequest): Promise<ServiceResponse<PlaceSearchResponse>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // 檢查快取
      const cacheKey = this.generateCacheKey('text_search', request);
      if (this.cache) {
        const cached = await this.cache.get<PlaceSearchResponse>(cacheKey);
        if (cached) {
          return {
            data: cached,
            metadata: {
              requestId,
              timestamp: Date.now(),
              cached: true
            }
          };
        }
      }

      // 呼叫 Google API
      const url = this.buildTextSearchUrl(request);
      const response = await this.makeRequest(url);
      
      // 轉換回應格式 (Adapter Pattern)
      const adaptedResponse = this.adaptTextSearchResponse(response);

      // 快取結果
      if (this.cache && adaptedResponse.status === 'OK') {
        await this.cache.set(cacheKey, adaptedResponse, 300); // 5分鐘快取
      }

      // 記錄metrics
      this.recordMetrics('searchPlaces', Date.now() - startTime, true);

      return {
        data: adaptedResponse,
        metadata: {
          requestId,
          timestamp: Date.now(),
          cached: false
        }
      };

    } catch (error) {
      this.recordMetrics('searchPlaces', Date.now() - startTime, false);
      return {
        error: this.adaptError(error),
        metadata: {
          requestId,
          timestamp: Date.now(),
          cached: false
        }
      };
    }
  }

  async searchNearby(location: LatLng, radius: number, type?: string): Promise<ServiceResponse<PlaceSearchResponse>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      const cacheKey = this.generateCacheKey('nearby_search', { location, radius, type });
      
      if (this.cache) {
        const cached = await this.cache.get<PlaceSearchResponse>(cacheKey);
        if (cached) {
          return {
            data: cached,
            metadata: { requestId, timestamp: Date.now(), cached: true }
          };
        }
      }

      const url = this.buildNearbySearchUrl(location, radius, type);
      const response = await this.makeRequest(url);
      const adaptedResponse = this.adaptNearbySearchResponse(response);

      if (this.cache && adaptedResponse.status === 'OK') {
        await this.cache.set(cacheKey, adaptedResponse, 300);
      }

      this.recordMetrics('searchNearby', Date.now() - startTime, true);

      return {
        data: adaptedResponse,
        metadata: { requestId, timestamp: Date.now(), cached: false }
      };

    } catch (error) {
      this.recordMetrics('searchNearby', Date.now() - startTime, false);
      return {
        error: this.adaptError(error),
        metadata: { requestId, timestamp: Date.now(), cached: false }
      };
    }
  }

  async getPlaceDetails(placeId: string): Promise<ServiceResponse<any>> {
    // 實現地點詳細資訊查詢
    // TODO: 實作細節
    throw new Error('Not implemented yet');
  }

  // ===== 私有方法 =====

  private buildTextSearchUrl(request: PlaceSearchRequest): string {
    const params = new URLSearchParams({
      key: this.apiKey,
      query: request.query || ''
    });

    if (request.location) {
      params.append('location', `${request.location.lat},${request.location.lng}`);
    }
    if (request.radius) {
      params.append('radius', request.radius.toString());
    }
    if (request.type) {
      params.append('type', request.type);
    }

    return `${this.baseUrl}/textsearch/json?${params.toString()}`;
  }

  private buildNearbySearchUrl(location: LatLng, radius: number, type?: string): string {
    const params = new URLSearchParams({
      key: this.apiKey,
      location: `${location.lat},${location.lng}`,
      radius: radius.toString()
    });

    if (type) {
      params.append('type', type);
    }

    return `${this.baseUrl}/nearbysearch/json?${params.toString()}`;
  }

  private async makeRequest(url: string): Promise<any> {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private adaptTextSearchResponse(googleResponse: any): PlaceSearchResponse {
    return {
      places: googleResponse.results?.map(this.adaptPlace) || [],
      nextPageToken: googleResponse.next_page_token,
      status: googleResponse.status
    };
  }

  private adaptNearbySearchResponse(googleResponse: any): PlaceSearchResponse {
    return {
      places: googleResponse.results?.map(this.adaptPlace) || [],
      nextPageToken: googleResponse.next_page_token,
      status: googleResponse.status
    };
  }

  private adaptPlace = (googlePlace: any): Place => {
    return {
      id: googlePlace.place_id,
      name: googlePlace.name,
      address: googlePlace.formatted_address || googlePlace.vicinity,
      location: {
        lat: googlePlace.geometry.location.lat,
        lng: googlePlace.geometry.location.lng
      },
      rating: googlePlace.rating,
      priceLevel: googlePlace.price_level,
      types: googlePlace.types || [],
      photoUrl: googlePlace.photos?.[0] ? 
        `${this.baseUrl}/photo?maxwidth=400&photoreference=${googlePlace.photos[0].photo_reference}&key=${this.apiKey}` 
        : undefined
    };
  };

  private adaptError(error: any): ServiceError {
    if (error.message?.includes('OVER_QUERY_LIMIT')) {
      return {
        code: 'QUOTA_EXCEEDED',
        message: 'API quota exceeded',
        details: error,
        retryable: true
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      details: error,
      retryable: false
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(operation: string, params: any): string {
    return `places:${operation}:${JSON.stringify(params)}`;
  }

  private recordMetrics(operation: string, duration: number, success: boolean): void {
    this.metrics?.recordApiCall('google_places', operation, duration, success);
  }
}