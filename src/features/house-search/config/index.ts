/**
 * House Search Feature - 配置管理
 * 統一管理所有配置常數和環境變數
 */

import { SearchConfig, DEFAULT_CONFIG, DEFAULT_COLORS, DEFAULT_MAP_CENTER } from '../types';

// 環境變數配置
export const ENV_CONFIG = {
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  SUUMO_API_BASE_URL: process.env.NEXT_PUBLIC_SUUMO_API_BASE_URL || '/api/suumo',
  OSM_API_BASE_URL: process.env.NEXT_PUBLIC_OSM_API_BASE_URL || '/api/osm-search',
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const;

// 搜尋配置
export const SEARCH_CONFIG: SearchConfig = {
  ...DEFAULT_CONFIG,
  maxResults: parseInt(process.env.NEXT_PUBLIC_MAX_SEARCH_RESULTS || '50'),
  searchRadius: parseInt(process.env.NEXT_PUBLIC_SEARCH_RADIUS || '1000'),
  minIntersectionScore: parseFloat(process.env.NEXT_PUBLIC_MIN_INTERSECTION_SCORE || '0.5'),
  debounceMs: parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_MS || '300'),
  enableCaching: process.env.NEXT_PUBLIC_ENABLE_CACHING !== 'false',
};

// 地圖配置
export const MAP_CONFIG = {
  DEFAULT_CENTER: DEFAULT_MAP_CENTER,
  DEFAULT_ZOOM: 13,
  MAX_ZOOM: 18,
  MIN_ZOOM: 8,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors',
  CIRCLE_OPACITY: 0.2,
  CIRCLE_STROKE_OPACITY: 0.8,
  CIRCLE_STROKE_WIDTH: 2,
  INTERSECTION_OPACITY: 0.3,
  INTERSECTION_STROKE_WIDTH: 3,
  INTERSECTION_DASH_ARRAY: '10, 5',
} as const;

// 顏色配置
export const COLOR_CONFIG = {
  PRIMARY_COLORS: DEFAULT_COLORS,
  INTERSECTION_COLOR: '#ff6b6b',
  SUCCESS_COLOR: '#10b981',
  WARNING_COLOR: '#f59e0b',
  ERROR_COLOR: '#ef4444',
  NEUTRAL_COLOR: '#6b7280',
} as const;

// UI 配置
export const UI_CONFIG = {
  REQUIREMENTS_COUNT: 3,
  MAX_PROPERTIES_DISPLAY: 20,
  TOAST_DURATION: 3000,
  DEBOUNCE_SEARCH: 300,
  ANIMATION_DURATION: 200,
  PAGINATION_SIZE: 10,
} as const;

// API 配置
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT: {
    GOOGLE_PLACES: 10, // requests per second
    SUUMO: 5, // requests per second
    OSM: 20, // requests per second
  },
} as const;

// 驗證配置
export const VALIDATION_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  MIN_RADIUS: 100,
  MAX_RADIUS: 5000,
  MIN_REQUIREMENTS: 2,
  MAX_REQUIREMENTS: 5,
} as const;

// 快取配置
export const CACHE_CONFIG = {
  PLACES_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  PROPERTIES_CACHE_TTL: 2 * 60 * 1000, // 2 minutes
  INTERSECTION_CACHE_TTL: 10 * 60 * 1000, // 10 minutes
  MAX_CACHE_SIZE: 100,
} as const;

// 錯誤訊息配置
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '網路連線錯誤，請檢查您的網路連線',
  API_ERROR: 'API 服務暫時無法使用，請稍後再試',
  LOCATION_ERROR: '無法獲取位置資訊，請檢查定位權限',
  SEARCH_ERROR: '搜尋失敗，請重新輸入關鍵字',
  VALIDATION_ERROR: '輸入資料格式不正確',
  UNKNOWN_ERROR: '發生未知錯誤，請重新整理頁面',
} as const;

// 預設搜尋需求
export const DEFAULT_REQUIREMENTS = [
  {
    id: 'req-1',
    query: '',
    color: DEFAULT_COLORS[0],
    enabled: true,
    locations: [],
  },
  {
    id: 'req-2',
    query: '',
    color: DEFAULT_COLORS[1],
    enabled: true,
    locations: [],
  },
  {
    id: 'req-3',
    query: '',
    color: DEFAULT_COLORS[2],
    enabled: true,
    locations: [],
  },
] as const;

// 開發模式配置
export const DEBUG_CONFIG = {
  ENABLE_CONSOLE_LOGS: ENV_CONFIG.ENABLE_DEBUG,
  ENABLE_PERFORMANCE_MONITORING: ENV_CONFIG.ENABLE_DEBUG,
  ENABLE_ERROR_BOUNDARY: true,
  SHOW_GRID_OVERLAY: false,
} as const;

// 輸出配置驗證函數
export const validateConfig = (): boolean => {
  const requiredEnvVars = ['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('缺少必要的環境變數:', missing);
    return false;
  }
  
  return true;
};

// 輸出所有配置
export const CONFIG = {
  ENV: ENV_CONFIG,
  SEARCH: SEARCH_CONFIG,
  MAP: MAP_CONFIG,
  COLOR: COLOR_CONFIG,
  UI: UI_CONFIG,
  API: API_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  CACHE: CACHE_CONFIG,
  ERROR_MESSAGES,
  DEFAULT_REQUIREMENTS,
  DEBUG: DEBUG_CONFIG,
} as const;