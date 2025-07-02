/**
 * 聚合相關配置
 * 定義聚合演算法的參數和預設值
 */

import { ClusteringConfig } from '../types';

// ============================================================================
// 聚合配置常數
// ============================================================================

/**
 * 預設聚合配置
 */
export const DEFAULT_CLUSTERING_CONFIG: ClusteringConfig = {
  enabled: true,
  minZoom: 14,           // 縮放等級小於 14 時啟用聚合
  maxZoom: 21,           // 最大縮放等級
  clusterDistance: 800,   // 800 公尺內的地點會被聚合
  minClusterSize: 2,     // 至少 2 個地點才聚合
  maxClusterRadius: 1200 // 最大聚合半徑 1200 公尺
};

/**
 * 不同縮放等級的聚合配置
 */
export const ZOOM_BASED_CLUSTERING_CONFIGS: Record<string, Partial<ClusteringConfig>> = {
  // 遠距離視圖 (zoom < 10)
  'far': {
    clusterDistance: 2000,
    minClusterSize: 3,
    maxClusterRadius: 3000
  },
  
  // 中距離視圖 (zoom 10-13)
  'medium': {
    clusterDistance: 1200,
    minClusterSize: 2,
    maxClusterRadius: 2000
  },
  
  // 近距離視圖 (zoom 14+)
  'close': {
    clusterDistance: 500,
    minClusterSize: 2,
    maxClusterRadius: 800
  }
};

/**
 * 根據地點密度調整的聚合配置
 */
export const DENSITY_BASED_CLUSTERING_CONFIGS: Record<string, Partial<ClusteringConfig>> = {
  // 低密度區域（< 10 個地點）
  'low': {
    clusterDistance: 1500,
    minClusterSize: 2,
    maxClusterRadius: 2000
  },
  
  // 中密度區域（10-50 個地點）
  'medium': {
    clusterDistance: 1000,
    minClusterSize: 3,
    maxClusterRadius: 1500
  },
  
  // 高密度區域（> 50 個地點）
  'high': {
    clusterDistance: 600,
    minClusterSize: 4,
    maxClusterRadius: 1000
  }
};

// ============================================================================
// 聚合策略配置
// ============================================================================

/**
 * 聚合策略類型
 */
export type ClusteringStrategy = 'distance' | 'grid' | 'density' | 'adaptive';

/**
 * 聚合策略配置
 */
export interface ClusteringStrategyConfig {
  strategy: ClusteringStrategy;
  parameters: Record<string, unknown>;
}

/**
 * 預設聚合策略配置
 */
export const CLUSTERING_STRATEGIES: Record<ClusteringStrategy, ClusteringStrategyConfig> = {
  // 基於距離的聚合
  distance: {
    strategy: 'distance',
    parameters: {
      maxDistance: 800,
      minPoints: 2,
      algorithm: 'haversine'
    }
  },
  
  // 基於網格的聚合
  grid: {
    strategy: 'grid',
    parameters: {
      gridSize: 1000,  // 1km 網格
      minPointsPerGrid: 2,
      snapToGrid: true
    }
  },
  
  // 基於密度的聚合
  density: {
    strategy: 'density',
    parameters: {
      eps: 800,        // DBSCAN epsilon
      minPts: 3,       // DBSCAN minPts
      algorithm: 'dbscan'
    }
  },
  
  // 自適應聚合
  adaptive: {
    strategy: 'adaptive',
    parameters: {
      baseDistance: 800,
      zoomFactor: 0.5,
      densityFactor: 0.3,
      minDistance: 200,
      maxDistance: 2000
    }
  }
};

// ============================================================================
// 聚合參數函數
// ============================================================================

/**
 * 根據縮放等級取得聚合配置
 * @param zoom 縮放等級
 * @param baseConfig 基礎配置
 * @returns 調整後的聚合配置
 */
export const getClusteringConfigForZoom = (
  zoom: number,
  baseConfig: ClusteringConfig = DEFAULT_CLUSTERING_CONFIG
): ClusteringConfig => {
  let adjustments: Partial<ClusteringConfig> = {};
  
  if (zoom < 10) {
    adjustments = ZOOM_BASED_CLUSTERING_CONFIGS.far;
  } else if (zoom < 14) {
    adjustments = ZOOM_BASED_CLUSTERING_CONFIGS.medium;
  } else {
    adjustments = ZOOM_BASED_CLUSTERING_CONFIGS.close;
  }
  
  return {
    ...baseConfig,
    ...adjustments
  };
};

/**
 * 根據地點密度取得聚合配置
 * @param locationCount 地點數量
 * @param baseConfig 基礎配置
 * @returns 調整後的聚合配置
 */
export const getClusteringConfigForDensity = (
  locationCount: number,
  baseConfig: ClusteringConfig = DEFAULT_CLUSTERING_CONFIG
): ClusteringConfig => {
  let adjustments: Partial<ClusteringConfig> = {};
  
  if (locationCount < 10) {
    adjustments = DENSITY_BASED_CLUSTERING_CONFIGS.low;
  } else if (locationCount < 50) {
    adjustments = DENSITY_BASED_CLUSTERING_CONFIGS.medium;
  } else {
    adjustments = DENSITY_BASED_CLUSTERING_CONFIGS.high;
  }
  
  return {
    ...baseConfig,
    ...adjustments
  };
};

/**
 * 自適應聚合配置計算
 * @param zoom 縮放等級
 * @param locationCount 地點數量
 * @param viewportArea 視窗面積（平方公尺）
 * @returns 自適應的聚合配置
 */
export const getAdaptiveClusteringConfig = (
  zoom: number,
  locationCount: number,
  viewportArea: number = 1000000 // 預設 1 平方公里
): ClusteringConfig => {
  const baseConfig = DEFAULT_CLUSTERING_CONFIG;
  
  // 縮放因子：縮放等級越高，聚合距離越小
  const zoomFactor = Math.max(0.1, (21 - zoom) / 21);
  
  // 密度因子：地點越多，聚合距離越小
  const densityFactor = Math.max(0.1, 1 - (locationCount / 100));
  
  // 面積因子：視窗面積越大，聚合距離可以越大
  const areaFactor = Math.min(2, Math.sqrt(viewportArea / 1000000));
  
  const adjustedDistance = baseConfig.clusterDistance * 
    zoomFactor * densityFactor * areaFactor;
  
  const adjustedMinSize = Math.max(2, 
    Math.ceil(baseConfig.minClusterSize * (1 + locationCount / 50))
  );
  
  return {
    ...baseConfig,
    clusterDistance: Math.max(200, Math.min(2000, adjustedDistance)),
    minClusterSize: Math.min(10, adjustedMinSize),
    maxClusterRadius: adjustedDistance * 1.5
  };
};

// ============================================================================
// 聚合啟用邏輯
// ============================================================================

/**
 * 判斷是否應該啟用聚合
 * @param zoom 縮放等級
 * @param locationCount 地點數量
 * @param config 聚合配置
 * @returns 是否啟用聚合
 */
export const shouldEnableClustering = (
  zoom: number,
  locationCount: number,
  config: ClusteringConfig = DEFAULT_CLUSTERING_CONFIG
): boolean => {
  // 基本條件檢查
  if (!config.enabled) return false;
  if (zoom >= config.minZoom) return false;
  if (locationCount < config.minClusterSize) return false;
  
  // 動態啟用邏輯
  const minLocationThreshold = Math.max(
    config.minClusterSize,
    Math.ceil(10 * (config.minZoom - zoom) / config.minZoom)
  );
  
  return locationCount >= minLocationThreshold;
};

/**
 * 計算聚合等級
 * @param zoom 縮放等級
 * @param locationCount 地點數量
 * @returns 聚合等級 (0-5，0為無聚合，5為最高聚合)
 */
export const getClusteringLevel = (
  zoom: number,
  locationCount: number
): number => {
  if (zoom >= 14) return 0; // 不聚合
  if (zoom >= 12) return locationCount > 20 ? 1 : 0; // 輕度聚合
  if (zoom >= 10) return locationCount > 10 ? 2 : 1; // 中度聚合
  if (zoom >= 8) return locationCount > 5 ? 3 : 2;   // 高度聚合
  if (zoom >= 6) return 4; // 很高聚合
  return 5; // 最高聚合
};

// ============================================================================
// 效能優化配置
// ============================================================================

/**
 * 聚合效能配置
 */
export interface ClusteringPerformanceConfig {
  maxLocationsForClustering: number;  // 超過此數量直接使用簡化聚合
  batchSize: number;                  // 批次處理大小
  debounceDelay: number;              // 防抖延遲（毫秒）
  enableWebWorker: boolean;           // 是否使用 Web Worker
  cacheClusterResults: boolean;       // 是否快取聚合結果
  maxCacheSize: number;               // 最大快取大小
}

/**
 * 預設效能配置
 */
export const DEFAULT_PERFORMANCE_CONFIG: ClusteringPerformanceConfig = {
  maxLocationsForClustering: 1000,
  batchSize: 100,
  debounceDelay: 300,
  enableWebWorker: false, // 預設關閉，避免複雜度
  cacheClusterResults: true,
  maxCacheSize: 50
};

/**
 * 根據設備效能調整配置
 * @param devicePerformance 設備效能等級 ('low' | 'medium' | 'high')
 * @returns 調整後的效能配置
 */
export const getPerformanceConfigForDevice = (
  devicePerformance: 'low' | 'medium' | 'high' = 'medium'
): ClusteringPerformanceConfig => {
  const baseConfig = DEFAULT_PERFORMANCE_CONFIG;
  
  switch (devicePerformance) {
    case 'low':
      return {
        ...baseConfig,
        maxLocationsForClustering: 300,
        batchSize: 50,
        debounceDelay: 500,
        enableWebWorker: false,
        maxCacheSize: 20
      };
      
    case 'high':
      return {
        ...baseConfig,
        maxLocationsForClustering: 2000,
        batchSize: 200,
        debounceDelay: 150,
        enableWebWorker: true,
        maxCacheSize: 100
      };
      
    default:
      return baseConfig;
  }
};