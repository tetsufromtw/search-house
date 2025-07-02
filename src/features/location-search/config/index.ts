/**
 * Location Search Feature - Config Index
 * 統一匯出所有配置檔案
 */

// 需求配置
export * from './requirements.config';

// 聚合配置
export * from './clustering.config';

// 預設配置
export * from './defaults.config';

// 重新匯出重要配置物件
export {
  SEARCH_REQUIREMENTS,
  getAllRequirementTypes,
  getRequirementConfig,
  isValidRequirementType as isValidRequirementTypeFromConfig,
  getEnabledRequirementConfigs,
  REQUIREMENT_TYPES,
  DEFAULT_ENABLED_REQUIREMENTS,
  REQUIREMENT_DISPLAY_NAMES,
  REQUIREMENT_ICONS
} from './requirements.config';

export {
  DEFAULT_CLUSTERING_CONFIG,
  ZOOM_BASED_CLUSTERING_CONFIGS,
  DENSITY_BASED_CLUSTERING_CONFIGS,
  CLUSTERING_STRATEGIES,
  getClusteringConfigForZoom,
  getClusteringConfigForDensity,
  getAdaptiveClusteringConfig,
  shouldEnableClustering as shouldEnableClusteringFromConfig,
  getClusteringLevel,
  DEFAULT_PERFORMANCE_CONFIG,
  getPerformanceConfigForDevice
} from './clustering.config';

export {
  DEFAULT_SEARCH_OPTIONS,
  SEARCH_CONSTANTS,
  DEFAULT_MAP_CONFIG,
  MAP_STYLE_CONSTANTS,
  DEFAULT_INTERSECTION_OPTIONS,
  DEFAULT_INTERSECTION_FILTER_CONFIG,
  DEFAULT_INTERSECTION_OVERLAY_CONFIG,
  DEFAULT_CONTROL_PANEL_CONFIG,
  DEFAULT_STATISTICS_CONFIG,
  DEFAULT_MAP_CONTROLS_CONFIG,
  DEFAULT_ACCESSIBILITY_CONFIG,
  DEFAULT_RESPONSIVE_CONFIG,
  PERFORMANCE_CONSTANTS,
  ANIMATION_CONSTANTS,
  ERROR_HANDLING_CONSTANTS,
  LOCALIZATION_CONSTANTS,
  DEFAULT_LOCATION_SEARCH_CONFIG,
  getDefaultConfig
} from './defaults.config';

// 組合配置建立函數
import { DEFAULT_LOCATION_SEARCH_CONFIG } from './defaults.config';
import { getAdaptiveClusteringConfig } from './clustering.config';
import type { ClusteringConfig, SearchOptions, MapConfig } from '../types';

/**
 * 建立自訂搜尋配置
 * @param overrides 覆寫配置
 * @returns 合併後的配置
 */
export const createSearchConfig = (overrides: {
  search?: Partial<SearchOptions>;
  map?: Partial<MapConfig>;
  clustering?: Partial<ClusteringConfig>;
  [key: string]: any;
} = {}) => {
  const baseConfig = getDefaultConfig();
  
  return {
    ...baseConfig,
    search: { ...baseConfig.search, ...overrides.search },
    map: { ...baseConfig.map, ...overrides.map },
    clustering: { ...baseConfig.clustering, ...overrides.clustering },
    ...overrides
  };
};

/**
 * 建立響應式配置（根據螢幕大小調整）
 * @param screenWidth 螢幕寬度
 * @returns 響應式配置
 */
export const createResponsiveConfig = (screenWidth: number) => {
  const baseConfig = getDefaultConfig();
  
  if (screenWidth < 640) { // mobile
    return createSearchConfig({
      ui: {
        ...baseConfig.ui,
        controlPanel: {
          ...baseConfig.ui.controlPanel,
          position: 'bottom',
          width: '100%',
          defaultCollapsed: true
        },
        responsive: {
          ...baseConfig.ui.responsive,
          breakpoint: 'sm',
          compactMode: true,
          hideLabels: true
        }
      }
    });
  } else if (screenWidth < 1024) { // tablet
    return createSearchConfig({
      ui: {
        ...baseConfig.ui,
        controlPanel: {
          ...baseConfig.ui.controlPanel,
          position: 'right',
          width: 280
        },
        responsive: {
          ...baseConfig.ui.responsive,
          breakpoint: 'md',
          compactMode: false,
          hideLabels: false
        }
      }
    });
  } else { // desktop
    return baseConfig;
  }
};

/**
 * 建立效能優化配置（根據設備效能調整）
 * @param deviceLevel 設備效能等級
 * @returns 效能優化配置
 */
export const createPerformanceOptimizedConfig = (
  deviceLevel: 'low' | 'medium' | 'high' = 'medium'
) => {
  const baseConfig = getDefaultConfig();
  
  const performanceAdjustments = {
    low: {
      search: { maxResults: 10 },
      clustering: { maxLocationsForClustering: 300 },
      ui: { statistics: { updateInterval: 2000, animateChanges: false } },
      intersection: { 
        overlay: { enabled: false, maxRenderElements: 20 } 
      }
    },
    medium: {
      search: { maxResults: 20 },
      clustering: { maxLocationsForClustering: 600 },
      ui: { statistics: { updateInterval: 1000, animateChanges: true } },
      intersection: { 
        overlay: { enabled: false, maxRenderElements: 50 } 
      }
    },
    high: {
      search: { maxResults: 50 },
      clustering: { maxLocationsForClustering: 1200 },
      ui: { statistics: { updateInterval: 500, animateChanges: true } },
      intersection: { 
        overlay: { enabled: true, maxRenderElements: 100 } 
      }
    }
  };
  
  const adjustments = performanceAdjustments[deviceLevel];
  
  return createSearchConfig(adjustments);
};

/**
 * 建立自適應配置（結合響應式和效能優化）
 * @param context 環境上下文
 * @returns 自適應配置
 */
export const createAdaptiveConfig = (context: {
  screenWidth: number;
  deviceLevel?: 'low' | 'medium' | 'high';
  userPreferences?: Record<string, any>;
} = { screenWidth: 1024 }) => {
  const { screenWidth, deviceLevel = 'medium', userPreferences = {} } = context;
  
  // 先建立響應式配置
  let config = createResponsiveConfig(screenWidth);
  
  // 套用效能優化
  const performanceConfig = createPerformanceOptimizedConfig(deviceLevel);
  config = {
    ...config,
    search: { ...config.search, ...performanceConfig.search },
    clustering: { ...config.clustering, ...performanceConfig.clustering },
    ui: {
      ...config.ui,
      statistics: { ...config.ui.statistics, ...performanceConfig.ui.statistics }
    },
    intersection: {
      ...config.intersection,
      overlay: { ...config.intersection.overlay, ...performanceConfig.intersection.overlay }
    }
  };
  
  // 套用使用者偏好
  if (userPreferences) {
    config = {
      ...config,
      ...userPreferences
    };
  }
  
  return config;
};