/**
 * 預設配置值
 * 定義整個 Location Search 功能的預設參數
 */

import { 
  SearchOptions, 
  MapConfig, 
  IntersectionOptions,
  IntersectionFilterConfig,
  IntersectionOverlayConfig,
  ControlPanelConfig,
  StatisticsDisplayConfig,
  MapControlsConfig,
  AccessibilityConfig,
  ResponsiveConfig
} from '../types';
import { DEFAULT_CLUSTERING_CONFIG } from './clustering.config';

// ============================================================================
// 搜尋相關預設值
// ============================================================================

/**
 * 預設搜尋選項
 */
export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  radius: 5000,        // 搜尋半徑 5 公里
  maxResults: 20,      // 最多 20 個結果
  types: undefined,    // 不限制類型
  language: 'ja',      // 日文
  region: 'jp'         // 日本地區
};

/**
 * 搜尋相關常數
 */
export const SEARCH_CONSTANTS = {
  MIN_RADIUS: 100,           // 最小搜尋半徑（公尺）
  MAX_RADIUS: 50000,         // 最大搜尋半徑（公尺）
  MIN_RESULTS: 1,            // 最小結果數
  MAX_RESULTS: 100,          // 最大結果數
  DEFAULT_CIRCLE_RADIUS: 500, // 預設圓圈半徑（公尺）
  SEARCH_TIMEOUT: 30000,     // 搜尋逾時（毫秒）
  RETRY_ATTEMPTS: 3,         // 重試次數
  RETRY_DELAY: 1000          // 重試延遲（毫秒）
} as const;

// ============================================================================
// 地圖相關預設值
// ============================================================================

/**
 * 預設地圖配置
 */
export const DEFAULT_MAP_CONFIG: MapConfig = {
  defaultCenter: { lat: 35.6762, lng: 139.6503 }, // 東京車站
  defaultZoom: 15,
  minZoom: 1,
  maxZoom: 21,
  gestureHandling: 'greedy',
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true
};

/**
 * 地圖樣式相關常數
 */
export const MAP_STYLE_CONSTANTS = {
  CIRCLE_OPACITY: {
    FILL: 0.2,
    STROKE: 0.8
  },
  CIRCLE_STROKE_WEIGHT: 2,
  MARKER_SIZE: {
    SMALL: 20,
    MEDIUM: 24,
    LARGE: 32
  },
  Z_INDEX: {
    CIRCLES: 100,
    MARKERS: 200,
    CLUSTERS: 300,
    INTERSECTIONS: 50
  }
} as const;

// ============================================================================
// 交集相關預設值
// ============================================================================

/**
 * 預設交集選項
 */
export const DEFAULT_INTERSECTION_OPTIONS: IntersectionOptions = {
  enabled: true,
  minIntersectionDistance: 100,    // 最小交集距離
  maxIntersectionRadius: 2000,     // 最大交集半徑
  requireDifferentTypes: true,     // 需要不同類型才算交集
  minOverlapPercentage: 0.1        // 最小重疊百分比
};

/**
 * 預設交集篩選配置
 */
export const DEFAULT_INTERSECTION_FILTER_CONFIG: IntersectionFilterConfig = {
  strategy: 'single_requirement',   // 單一需求顯示全部，多需求顯示交集
  minIntersectionCount: 1,
  requirementTypes: ['starbucks', 'gym', 'convenience']
};

/**
 * 預設交集覆蓋層配置
 */
export const DEFAULT_INTERSECTION_OVERLAY_CONFIG: IntersectionOverlayConfig = {
  enabled: false,                   // 預設關閉複雜的視覺效果
  renderMethod: 'canvas',
  updateStrategy: 'debounced',
  debounceDelay: 300,
  maxRenderElements: 100,
  enableAnimation: false
};

// ============================================================================
// UI 相關預設值
// ============================================================================

/**
 * 預設控制面板配置
 */
export const DEFAULT_CONTROL_PANEL_CONFIG: ControlPanelConfig = {
  position: 'left',
  collapsible: true,
  defaultCollapsed: false,
  width: 320,
  height: 'auto',
  theme: 'light',
  showStatistics: true,
  showScreenshot: true,
  showHelp: true
};

/**
 * 預設統計顯示配置
 */
export const DEFAULT_STATISTICS_CONFIG: StatisticsDisplayConfig = {
  showTotalRequests: true,
  showTotalResults: true,
  showResultsByRequirement: true,
  showVisibleLocations: true,
  showResponseTime: true,
  showErrorCount: true,
  showCacheInfo: false,           // 預設隱藏快取資訊
  updateInterval: 1000,           // 1 秒更新一次
  animateChanges: true
};

/**
 * 預設地圖控制配置
 */
export const DEFAULT_MAP_CONTROLS_CONFIG: MapControlsConfig = {
  showZoomControls: true,
  showMapTypeControls: false,
  showFullscreenControl: true,
  showMyLocationControl: false,    // 需要權限，預設關閉
  showLayerControls: true,
  position: 'top-right',
  style: 'default'
};

/**
 * 預設無障礙配置
 */
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  enableHighContrast: false,
  enableFocusVisible: true,
  announceChanges: true,
  skipLinks: true
};

/**
 * 預設響應式配置
 */
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoint: 'lg',
  panelPosition: 'left',
  panelWidth: 320,
  showStatistics: true,
  compactMode: false,
  hideLabels: false
};

// ============================================================================
// 效能相關預設值
// ============================================================================

/**
 * 效能優化常數
 */
export const PERFORMANCE_CONSTANTS = {
  DEBOUNCE_DELAYS: {
    SEARCH: 300,              // 搜尋防抖延遲
    MAP_UPDATE: 150,          // 地圖更新防抖延遲
    INTERSECTION: 500,        // 交集計算防抖延遲
    RESIZE: 250               // 視窗大小調整防抖延遲
  },
  BATCH_SIZES: {
    LOCATION_PROCESSING: 50,  // 位置處理批次大小
    CIRCLE_CREATION: 20,      // 圓圈建立批次大小
    MARKER_CREATION: 30       // 標記建立批次大小
  },
  CACHE_SETTINGS: {
    MAX_SEARCH_CACHE: 100,    // 最大搜尋快取數
    MAX_LOCATION_CACHE: 500,  // 最大位置快取數
    CACHE_TTL: 300000         // 快取存活時間（5分鐘）
  }
} as const;

// ============================================================================
// 動畫和轉場效果
// ============================================================================

/**
 * 動畫相關常數
 */
export const ANIMATION_CONSTANTS = {
  DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  MAP_TRANSITIONS: {
    PAN_DURATION: 1000,
    ZOOM_DURATION: 500,
    MARKER_DROP_DURATION: 300
  }
} as const;

// ============================================================================
// 錯誤處理和重試
// ============================================================================

/**
 * 錯誤處理相關常數
 */
export const ERROR_HANDLING_CONSTANTS = {
  RETRY_STRATEGIES: {
    EXPONENTIAL_BACKOFF: 'exponential',
    FIXED_DELAY: 'fixed',
    IMMEDIATE: 'immediate'
  },
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    API_LIMIT_EXCEEDED: 'API_LIMIT_EXCEEDED',
    INVALID_REQUEST: 'INVALID_REQUEST',
    GEOLOCATION_ERROR: 'GEOLOCATION_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR'
  },
  DEFAULT_ERROR_MESSAGES: {
    NETWORK_ERROR: '網路連線錯誤，請檢查網路狀態',
    API_LIMIT_EXCEEDED: 'API 請求限制已達上限，請稍後再試',
    INVALID_REQUEST: '請求參數無效',
    GEOLOCATION_ERROR: '無法取得位置資訊',
    TIMEOUT_ERROR: '請求逾時，請重新嘗試'
  }
} as const;

// ============================================================================
// 國際化和本地化
// ============================================================================

/**
 * 語言相關常數
 */
export const LOCALIZATION_CONSTANTS = {
  SUPPORTED_LANGUAGES: ['zh-TW', 'zh-CN', 'ja', 'en'] as const,
  DEFAULT_LANGUAGE: 'zh-TW',
  FALLBACK_LANGUAGE: 'en',
  DATE_FORMATS: {
    'zh-TW': 'YYYY/MM/DD HH:mm:ss',
    'zh-CN': 'YYYY-MM-DD HH:mm:ss',
    'ja': 'YYYY年MM月DD日 HH:mm:ss',
    'en': 'MM/DD/YYYY HH:mm:ss'
  },
  NUMBER_FORMATS: {
    'zh-TW': { decimal: '.', thousands: ',' },
    'zh-CN': { decimal: '.', thousands: ',' },
    'ja': { decimal: '.', thousands: ',' },
    'en': { decimal: '.', thousands: ',' }
  }
} as const;

// ============================================================================
// 匯出綜合配置
// ============================================================================

/**
 * 完整的預設配置物件
 */
export const DEFAULT_LOCATION_SEARCH_CONFIG = {
  search: DEFAULT_SEARCH_OPTIONS,
  map: DEFAULT_MAP_CONFIG,
  clustering: DEFAULT_CLUSTERING_CONFIG,
  intersection: {
    options: DEFAULT_INTERSECTION_OPTIONS,
    filter: DEFAULT_INTERSECTION_FILTER_CONFIG,
    overlay: DEFAULT_INTERSECTION_OVERLAY_CONFIG
  },
  ui: {
    controlPanel: DEFAULT_CONTROL_PANEL_CONFIG,
    statistics: DEFAULT_STATISTICS_CONFIG,
    mapControls: DEFAULT_MAP_CONTROLS_CONFIG,
    accessibility: DEFAULT_ACCESSIBILITY_CONFIG,
    responsive: DEFAULT_RESPONSIVE_CONFIG
  },
  performance: PERFORMANCE_CONSTANTS,
  animation: ANIMATION_CONSTANTS,
  errorHandling: ERROR_HANDLING_CONSTANTS,
  localization: LOCALIZATION_CONSTANTS
} as const;

/**
 * 取得預設配置的深拷貝
 * @returns 預設配置的深拷貝
 */
export const getDefaultConfig = () => {
  return JSON.parse(JSON.stringify(DEFAULT_LOCATION_SEARCH_CONFIG));
};