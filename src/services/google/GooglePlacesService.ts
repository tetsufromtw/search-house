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

  async searchPlacesWithPaging(request: PlaceSearchRequest, maxPages: number = 3): Promise<ServiceResponse<PlaceSearchResponse>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // 檢查快取
      const cacheKey = this.generateCacheKey('text_search_paged', { ...request, maxPages });
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

      // 第一頁請求
      const firstUrl = this.buildTextSearchUrl(request);
      const firstResponse = await this.makeRequest(firstUrl);
      const firstPageData = this.adaptTextSearchResponse(firstResponse);

      // 如果沒有更多頁面或只要一頁
      if (!firstPageData.nextPageToken || maxPages <= 1) {
        const result = {
          data: firstPageData,
          metadata: {
            requestId,
            timestamp: Date.now(),
            cached: false
          }
        };

        // 快取結果
        if (this.cache && firstPageData.status === 'OK') {
          await this.cache.set(cacheKey, firstPageData, 300);
        }

        this.recordMetrics('searchPlacesWithPaging', Date.now() - startTime, true);
        return result;
      }

      // 並行處理剩餘頁面
      const additionalPagePromises: Promise<any>[] = [];
      let currentToken = firstPageData.nextPageToken;

      for (let page = 2; page <= maxPages && currentToken; page++) {
        // 小延遲確保 token 有效
        const delay = (page - 2) * 500; // 0ms, 500ms, 1000ms...
        
        const pagePromise = new Promise(async (resolve) => {
          try {
            await new Promise(r => setTimeout(r, delay));
            const url = this.buildTextSearchUrl(request, currentToken);
            const response = await this.makeRequest(url);
            resolve(this.adaptTextSearchResponse(response));
          } catch (error) {
            console.warn(`第 ${page} 頁請求失敗:`, error);
            resolve(null);
          }
        });

        additionalPagePromises.push(pagePromise);
      }

      // 並行等待所有頁面
      const additionalPages = await Promise.allSettled(additionalPagePromises);
      
      // 合併所有成功的頁面結果
      const allPlaces = [...firstPageData.places];
      
      additionalPages.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          allPlaces.push(...result.value.places);
        }
      });

      const combinedResponse: PlaceSearchResponse = {
        places: allPlaces,
        status: firstPageData.status,
        nextPageToken: undefined // 並行分頁後不提供下一頁token
      };

      // 快取結果
      if (this.cache && combinedResponse.status === 'OK') {
        await this.cache.set(cacheKey, combinedResponse, 300);
      }

      this.recordMetrics('searchPlacesWithPaging', Date.now() - startTime, true);

      return {
        data: combinedResponse,
        metadata: {
          requestId,
          timestamp: Date.now(),
          cached: false
        }
      };

    } catch (error) {
      this.recordMetrics('searchPlacesWithPaging', Date.now() - startTime, false);
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

  private buildTextSearchUrl(request: PlaceSearchRequest, pageToken?: string): string {
    const params = new URLSearchParams({
      key: this.apiKey
    });

    if (pageToken) {
      params.append('pagetoken', pageToken);
    } else {
      params.append('query', request.query || '');
      
      if (request.location) {
        params.append('location', `${request.location.lat},${request.location.lng}`);
      }
      if (request.radius) {
        params.append('radius', request.radius.toString());
      }
      if (request.type) {
        params.append('type', request.type);
      }
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
    console.log('🚨 Google API 請求已停用避免費用:', url);
    
    // 🚨 緊急停用：避免高額 API 費用！
    throw new Error('Google Places API 已暫停使用避免高額費用。請使用模擬資料。');
    
    /*
    console.log('🌐 Google API 請求 URL:', url);
    
    const response = await fetch(url);
    
    console.log('📡 Google API 回應狀態:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google API HTTP 錯誤:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const jsonResult = await response.json();
    console.log('📄 Google API 原始回應:', jsonResult);
    
    if (jsonResult.status && jsonResult.status !== 'OK') {
      console.error('❌ Google API 業務錯誤:', {
        status: jsonResult.status,
        error_message: jsonResult.error_message,
        results: jsonResult.results?.length || 0
      });
    }

    return jsonResult;
    */
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
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateCacheKey(operation: string, params: any): string {
    return `places:${operation}:${JSON.stringify(params)}`;
  }

  private recordMetrics(operation: string, duration: number, success: boolean): void {
    this.metrics?.recordApiCall('google_places', operation, duration, success);
  }
}