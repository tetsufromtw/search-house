/**
 * Location Search Feature - Main Entry Point
 * 統一匯出整個 Location Search 功能模組
 */

// ============================================================================
// 類型定義
// ============================================================================
export * from './types';

// ============================================================================
// 工具函數
// ============================================================================
export * from './utils';

// ============================================================================
// 配置檔案
// ============================================================================
export * from './config';

// ============================================================================
// 主要匯出項目 (當其他模組完成後會新增)
// ============================================================================

// TODO: 當完成這些模組後，將會在此匯出：
// export * from './services';
// export * from './hooks';
// export * from './components';
// export * from './providers';

// ============================================================================
// 便利的重新匯出（最常用的項目）
// ============================================================================

// 類型
export type {
  // 核心搜尋類型
  GeoLocation,
  RequirementType,
  SearchStatus,
  SearchRequirement,
  LocationResult,
  SearchOptions,
  SearchState,
  
  // 地圖類型
  MapBounds,
  MapCircle,
  MapMarker,
  CircleStyle,
  MarkerIcon,
  ClusteringConfig,
  LocationCluster,
  
  // 交集類型
  IntersectionArea,
  IntersectionOptions,
  IntersectionFilterStrategy,
  IntersectionFilterConfig,
  
  // UI 類型
  ControlPanelConfig,
  RequirementToggleConfig,
  StatisticsDisplayConfig,
  UITheme,
  ComponentSize,
  
  // 服務介面（當實作完成後）
  ILocationSearchService,
  IMapRenderer,
  IIntersectionService
} from './types';

// 工具函數
export {
  // 幾何計算
  calculateDistance,
  calculateBearing,
  isPointInCircle,
  checkCircleIntersection,
  calculateCentroid,
  isValidGeoLocation,
  
  // 地圖工具
  calculateOptimalViewport,
  getCircleStyleForRequirement,
  createRequirementMarkerIcon,
  createClusterMarkerIcon,
  createInfoWindowContent,
  
  // 顏色工具
  getRequirementColors,
  adjustOpacity,
  blendColors,
  getContrastTextColor,
  
  // 驗證工具
  isValidRequirementType,
  validateSearchOptions,
  isValidLocationResult,
  validateClusteringConfig
} from './utils';

// 配置
export {
  // 需求配置
  SEARCH_REQUIREMENTS,
  getAllRequirementTypes,
  getRequirementConfig,
  REQUIREMENT_TYPES,
  REQUIREMENT_DISPLAY_NAMES,
  REQUIREMENT_ICONS,
  
  // 預設配置
  DEFAULT_SEARCH_OPTIONS,
  DEFAULT_MAP_CONFIG,
  DEFAULT_CLUSTERING_CONFIG,
  DEFAULT_INTERSECTION_OPTIONS,
  SEARCH_CONSTANTS,
  MAP_STYLE_CONSTANTS,
  
  // 配置建立函數
  createSearchConfig,
  createResponsiveConfig,
  createPerformanceOptimizedConfig,
  createAdaptiveConfig,
  getDefaultConfig
} from './config';

// ============================================================================
// 版本資訊
// ============================================================================

/**
 * Location Search Feature 版本資訊
 */
export const LOCATION_SEARCH_VERSION = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  features: [
    'Multi-requirement location search',
    'Real-time intersection detection', 
    'Adaptive clustering',
    'Responsive UI components',
    'Performance optimization',
    'Type-safe APIs',
    'Modular architecture'
  ],
  compatibility: {
    react: '>=18.0.0',
    typescript: '>=5.0.0',
    googleMaps: '>=3.50.0'
  }
} as const;

// ============================================================================
// 便利函數（高階 API）
// ============================================================================

/**
 * 快速建立位置搜尋配置
 * @param requirements 需要的需求類型
 * @param center 搜尋中心點
 * @param radius 搜尋半徑
 * @returns 搜尋配置
 */
export const createQuickSearchConfig = (
  requirements: RequirementType[],
  center: GeoLocation,
  radius: number = 1000
) => {
  return createSearchConfig({
    search: {
      radius,
      maxResults: 20
    },
    map: {
      defaultCenter: center,
      defaultZoom: radius < 500 ? 16 : radius < 1000 ? 15 : 14
    }
  });
};

/**
 * 建立行動裝置優化配置
 * @param center 地圖中心點
 * @returns 行動裝置優化配置
 */
export const createMobileOptimizedConfig = (center?: GeoLocation) => {
  return createAdaptiveConfig({
    screenWidth: 375, // iPhone 標準寬度
    deviceLevel: 'medium',
    userPreferences: {
      map: center ? { defaultCenter: center } : undefined,
      ui: {
        controlPanel: {
          position: 'bottom',
          defaultCollapsed: true
        }
      }
    }
  });
};

/**
 * 建立桌面版完整功能配置
 * @param center 地圖中心點
 * @returns 桌面版配置
 */
export const createDesktopConfig = (center?: GeoLocation) => {
  return createAdaptiveConfig({
    screenWidth: 1920,
    deviceLevel: 'high',
    userPreferences: {
      map: center ? { defaultCenter: center } : undefined,
      ui: {
        controlPanel: {
          position: 'left',
          showStatistics: true,
          showScreenshot: true
        }
      },
      intersection: {
        overlay: {
          enabled: true,
          enableAnimation: true
        }
      }
    }
  });
};

// ============================================================================
// 常用常數匯出
// ============================================================================

/**
 * 常用的地理位置常數
 */
export const COMMON_LOCATIONS = {
  TOKYO_STATION: { lat: 35.6762, lng: 139.6503 },
  SHIBUYA: { lat: 35.6598, lng: 139.7006 },
  SHINJUKU: { lat: 35.6938, lng: 139.7034 },
  HARAJUKU: { lat: 35.6702, lng: 139.7016 },
  AKIHABARA: { lat: 35.7022, lng: 139.7740 }
} as const;

/**
 * 常用的搜尋半徑預設值
 */
export const COMMON_RADIUS = {
  WALKING_5MIN: 400,    // 5分鐘步行距離
  WALKING_10MIN: 800,   // 10分鐘步行距離
  WALKING_15MIN: 1200,  // 15分鐘步行距離
  CYCLING_10MIN: 2000,  // 10分鐘自行車距離
  CYCLING_20MIN: 4000,  // 20分鐘自行車距離
  TRANSIT_30MIN: 10000  // 30分鐘大眾運輸距離
} as const;

// ============================================================================
// 開發工具（僅在開發環境）
// ============================================================================

/**
 * 開發環境工具（僅在開發時使用）
 */
export const DEV_TOOLS = process.env.NODE_ENV === 'development' ? {
  /**
   * 記錄配置資訊到控制台
   */
  logConfig: (config: any) => {
    console.group('🔧 Location Search Config');
    console.table(config);
    console.groupEnd();
  },
  
  /**
   * 驗證配置完整性
   */
  validateConfig: (config: any) => {
    const requiredKeys = ['search', 'map', 'clustering', 'ui'];
    const missingKeys = requiredKeys.filter(key => !(key in config));
    
    if (missingKeys.length > 0) {
      console.warn('⚠️ Missing config keys:', missingKeys);
    } else {
      console.log('✅ Config validation passed');
    }
    
    return missingKeys.length === 0;
  },
  
  /**
   * 效能監控工具
   */
  performanceMonitor: {
    start: (label: string) => console.time(label),
    end: (label: string) => console.timeEnd(label),
    mark: (label: string) => console.log(`📊 ${label}: ${Date.now()}ms`)
  }
} : undefined;

// ============================================================================
// 錯誤類別（用於統一錯誤處理）
// ============================================================================

/**
 * Location Search 相關錯誤基底類別
 */
export class LocationSearchError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LocationSearchError';
  }
}

/**
 * 搜尋相關錯誤
 */
export class SearchError extends LocationSearchError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SEARCH_ERROR', context);
    this.name = 'SearchError';
  }
}

/**
 * 地圖相關錯誤
 */
export class MapError extends LocationSearchError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'MAP_ERROR', context);
    this.name = 'MapError';
  }
}

/**
 * 配置相關錯誤
 */
export class ConfigError extends LocationSearchError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigError';
  }
}