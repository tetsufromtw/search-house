/**
 * 服務層類型定義
 * 遵循 Domain-Driven Design 原則，按業務領域劃分
 */

// ===== 通用類型 =====
export interface LatLng {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ===== 地理服務類型 =====
export interface Place {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  rating?: number;
  priceLevel?: number;
  types: string[];
  photoUrl?: string;
}

export interface PlaceSearchRequest {
  query?: string;
  location?: LatLng;
  radius?: number;
  bounds?: BoundingBox;
  type?: string;
  keyword?: string;
}

export interface PlaceSearchResponse {
  places: Place[];
  nextPageToken?: string;
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';
}

// ===== 地理編碼類型 =====
export interface GeocodingRequest {
  address?: string;
  placeId?: string;
  latlng?: LatLng;
}

export interface GeocodingResponse {
  results: {
    address: string;
    location: LatLng;
    placeId: string;
    types: string[];
  }[];
  status: string;
}

// ===== 錯誤處理類型 =====
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

export interface ServiceResponse<T> {
  data?: T;
  error?: ServiceError;
  metadata?: {
    requestId: string;
    timestamp: number;
    cached: boolean;
  };
}

// ===== 配置類型 =====
export interface ServiceConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
}