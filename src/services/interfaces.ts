/**
 * 服務層接口定義
 * 遵循 Interface Segregation Principle (ISP)
 * 每個接口只關注單一職責，便於測試和替換實現
 */

import {
  PlaceSearchRequest,
  PlaceSearchResponse,
  GeocodingRequest,
  GeocodingResponse,
  ServiceResponse,
  LatLng,
  BoundingBox
} from './types';

// ===== Places 服務接口 =====
export interface IPlacesService {
  /**
   * 文字搜尋地點
   */
  searchPlaces(request: PlaceSearchRequest): Promise<ServiceResponse<PlaceSearchResponse>>;
  
  /**
   * 附近地點搜尋
   */
  searchNearby(location: LatLng, radius: number, type?: string): Promise<ServiceResponse<PlaceSearchResponse>>;
  
  /**
   * 獲取地點詳細資訊
   */
  getPlaceDetails(placeId: string): Promise<ServiceResponse<any>>;
}

// ===== 地理編碼服務接口 =====
export interface IGeocodingService {
  /**
   * 地址轉座標
   */
  geocode(request: GeocodingRequest): Promise<ServiceResponse<GeocodingResponse>>;
  
  /**
   * 座標轉地址
   */
  reverseGeocode(location: LatLng): Promise<ServiceResponse<GeocodingResponse>>;
}

// ===== 距離服務接口 =====
export interface IDistanceService {
  /**
   * 計算兩點距離
   */
  calculateDistance(origin: LatLng, destination: LatLng): number;
  
  /**
   * 計算路徑距離和時間
   */
  getDistanceMatrix(origins: LatLng[], destinations: LatLng[]): Promise<ServiceResponse<any>>;
}

// ===== 快取服務接口 =====
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ===== 監控服務接口 =====
export interface IMetricsService {
  recordApiCall(service: string, endpoint: string, duration: number, success: boolean): void;
  recordError(service: string, error: Error): void;
  incrementCounter(metric: string, tags?: Record<string, string>): void;
}

// ===== 服務工廠接口 (Factory Pattern) =====
export interface IServiceFactory {
  createPlacesService(): IPlacesService;
  createGeocodingService(): IGeocodingService;
  createDistanceService(): IDistanceService;
  createCacheService(): ICacheService;
  createMetricsService(): IMetricsService;
}