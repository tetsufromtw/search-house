/**
 * 搜尋需求配置
 * 定義預設的搜尋類型、顏色和關鍵字
 */

import { RequirementConfig, RequirementType, RequirementColor } from '../types/multiLocationSearch';

/**
 * Tailwind CSS 顏色對應的 hex 值
 * 用於 Google Maps 圓圈顯示
 */
const TAILWIND_COLORS = {
  'blue-300': '#93C5FD',
  'blue-400': '#60A5FA',
  'red-300': '#FCA5A5', 
  'red-400': '#F87171',
  'green-300': '#86EFAC',
  'green-400': '#4ADE80',
  'purple-300': '#C4B5FD',
  'purple-400': '#A78BFA',
  'yellow-300': '#FDE047',
  'yellow-400': '#FACC15',
  'pink-300': '#F9A8D4',
  'pink-400': '#F472B6',
} as const;

/**
 * 建立顏色配置
 */
function createColor(base: string, fill: keyof typeof TAILWIND_COLORS, stroke: keyof typeof TAILWIND_COLORS): RequirementColor {
  return {
    base,
    fill,
    stroke,
    hex: {
      fill: TAILWIND_COLORS[fill],
      stroke: TAILWIND_COLORS[stroke]
    }
  };
}

/**
 * 預定義的搜尋需求配置
 */
export const SEARCH_REQUIREMENTS: Record<RequirementType, RequirementConfig> = {
  starbucks: {
    id: 'starbucks',
    query: 'スターバックス',
    displayName: 'Starbucks',
    color: createColor('blue', 'blue-300', 'blue-400'),
    defaultEnabled: true
  },
  
  gym: {
    id: 'gym', 
    query: 'ジム',
    displayName: '健身房',
    color: createColor('red', 'red-300', 'red-400'),
    defaultEnabled: true
  },
  
  convenience: {
    id: 'convenience',
    query: 'コンビニ',
    displayName: '便利商店',
    color: createColor('green', 'green-300', 'green-400'),
    defaultEnabled: true
  }
};

/**
 * 取得所有需求類型
 */
export const getAllRequirementTypes = (): RequirementType[] => {
  return Object.keys(SEARCH_REQUIREMENTS) as RequirementType[];
};

/**
 * 取得需求配置
 */
export const getRequirementConfig = (type: RequirementType): RequirementConfig => {
  return SEARCH_REQUIREMENTS[type];
};

/**
 * 建立預設的搜尋需求狀態
 */
export const createDefaultRequirement = (config: RequirementConfig) => {
  return {
    id: config.id,
    query: config.query,
    displayName: config.displayName,
    color: config.color,
    enabled: config.defaultEnabled,
    visible: true,
    locations: [],
    loading: false,
    error: null,
    lastSearchTime: null
  };
};

/**
 * 顏色工具函數
 */
export const ColorUtils = {
  /**
   * 取得需求的圓圈樣式
   */
  getCircleStyle: (requirementType: RequirementType) => {
    const config = SEARCH_REQUIREMENTS[requirementType];
    return {
      strokeColor: config.color.hex.stroke,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: config.color.hex.fill,
      fillOpacity: 0.2
    };
  },

  /**
   * 取得需求的 CSS 類名
   */
  getTailwindClasses: (requirementType: RequirementType) => {
    const config = SEARCH_REQUIREMENTS[requirementType];
    return {
      fill: config.color.fill,
      stroke: config.color.stroke,
      base: config.color.base
    };
  },

  /**
   * 取得可用的顏色列表
   */
  getAvailableColors: () => {
    return Object.keys(TAILWIND_COLORS);
  }
};

/**
 * 預設的聚合配置
 */
export const DEFAULT_CLUSTERING_OPTIONS = {
  clusterMinZoom: 14,      // 縮放等級小於 14 時啟用聚合
  clusterDistance: 800,    // 800 公尺內的地點會被聚合
  minClusterSize: 2,       // 至少 2 個地點才聚合
  maxClusterRadius: 1200   // 最大聚合半徑 1200 公尺
} as const;

/**
 * 預設的搜尋選項
 */
export const DEFAULT_SEARCH_OPTIONS = {
  maxPages: 3,
  radius: 5000,
  circleRadius: 500,
  autoUpdate: true,
  boundsExpansion: 0.1,
  debounceDelay: 300,
  parallelSearch: true,
  clustering: DEFAULT_CLUSTERING_OPTIONS
} as const;