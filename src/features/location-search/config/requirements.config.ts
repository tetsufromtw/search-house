/**
 * 搜尋需求配置
 * 定義預設的搜尋類型、顏色、圖示和關鍵字
 */

import { SearchRequirementConfig, RequirementType } from '../types';
import { REQUIREMENT_COLORS } from '../utils';

// ============================================================================
// 需求配置定義
// ============================================================================

/**
 * 預定義的搜尋需求配置
 */
export const SEARCH_REQUIREMENTS: Record<RequirementType, SearchRequirementConfig> = {
  starbucks: {
    id: 'starbucks',
    query: 'スターバックス',
    displayName: 'Starbucks',
    color: {
      primary: REQUIREMENT_COLORS.starbucks.primary,
      secondary: REQUIREMENT_COLORS.starbucks.secondary,
      fill: REQUIREMENT_COLORS.starbucks.fill,
      stroke: REQUIREMENT_COLORS.starbucks.stroke
    },
    icon: '☕',
    defaultEnabled: true
  },
  
  gym: {
    id: 'gym',
    query: 'ジム',
    displayName: '健身房',
    color: {
      primary: REQUIREMENT_COLORS.gym.primary,
      secondary: REQUIREMENT_COLORS.gym.secondary,
      fill: REQUIREMENT_COLORS.gym.fill,
      stroke: REQUIREMENT_COLORS.gym.stroke
    },
    icon: '💪',
    defaultEnabled: true
  },
  
  convenience: {
    id: 'convenience',
    query: 'コンビニ',
    displayName: '便利商店',
    color: {
      primary: REQUIREMENT_COLORS.convenience.primary,
      secondary: REQUIREMENT_COLORS.convenience.secondary,
      fill: REQUIREMENT_COLORS.convenience.fill,
      stroke: REQUIREMENT_COLORS.convenience.stroke
    },
    icon: '🏪',
    defaultEnabled: true
  }
};

// ============================================================================
// 需求管理函數
// ============================================================================

/**
 * 取得所有需求類型
 * @returns 需求類型陣列
 */
export const getAllRequirementTypes = (): RequirementType[] => {
  return Object.keys(SEARCH_REQUIREMENTS) as RequirementType[];
};

/**
 * 取得需求配置
 * @param type 需求類型
 * @returns 需求配置
 */
export const getRequirementConfig = (type: RequirementType): SearchRequirementConfig => {
  const config = SEARCH_REQUIREMENTS[type];
  if (!config) {
    throw new Error(`Unknown requirement type: ${type}`);
  }
  return config;
};

/**
 * 檢查需求類型是否存在
 * @param type 需求類型
 * @returns 是否存在
 */
export const isValidRequirementType = (type: string): type is RequirementType => {
  return type in SEARCH_REQUIREMENTS;
};

/**
 * 取得啟用的需求配置
 * @returns 預設啟用的需求配置陣列
 */
export const getEnabledRequirementConfigs = (): SearchRequirementConfig[] => {
  return Object.values(SEARCH_REQUIREMENTS).filter(config => config.defaultEnabled);
};

/**
 * 根據查詢字串取得需求配置
 * @param query 查詢字串
 * @returns 匹配的需求配置（如果有的話）
 */
export const getRequirementByQuery = (query: string): SearchRequirementConfig | null => {
  const config = Object.values(SEARCH_REQUIREMENTS).find(
    config => config.query.toLowerCase() === query.toLowerCase()
  );
  return config || null;
};

/**
 * 根據顯示名稱取得需求配置
 * @param displayName 顯示名稱
 * @returns 匹配的需求配置（如果有的話）
 */
export const getRequirementByDisplayName = (displayName: string): SearchRequirementConfig | null => {
  const config = Object.values(SEARCH_REQUIREMENTS).find(
    config => config.displayName.toLowerCase() === displayName.toLowerCase()
  );
  return config || null;
};

// ============================================================================
// 擴展配置
// ============================================================================

/**
 * 建立自訂需求配置
 * @param customConfig 自訂配置（部分）
 * @returns 完整的需求配置
 */
export const createCustomRequirementConfig = (
  customConfig: Partial<SearchRequirementConfig> & { 
    id: RequirementType; 
    query: string; 
    displayName: string; 
  }
): SearchRequirementConfig => {
  const defaultColors = REQUIREMENT_COLORS[customConfig.id] || REQUIREMENT_COLORS.starbucks;
  
  return {
    color: {
      primary: defaultColors.primary,
      secondary: defaultColors.secondary,
      fill: defaultColors.fill,
      stroke: defaultColors.stroke
    },
    icon: '📍',
    defaultEnabled: false,
    ...customConfig
  };
};

/**
 * 合併多個需求配置
 * @param configs 需求配置陣列
 * @returns 合併後的配置物件
 */
export const mergeRequirementConfigs = (
  configs: SearchRequirementConfig[]
): Record<string, SearchRequirementConfig> => {
  return configs.reduce((acc, config) => {
    acc[config.id] = config;
    return acc;
  }, {} as Record<string, SearchRequirementConfig>);
};

// ============================================================================
// 配置驗證
// ============================================================================

/**
 * 驗證需求配置是否完整
 * @param config 需求配置
 * @returns 驗證結果
 */
export const validateRequirementConfig = (config: unknown): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (typeof config !== 'object' || config === null) {
    errors.push('配置必須是物件');
    return { isValid: false, errors };
  }
  
  const cfg = config as Record<string, unknown>;
  
  // 驗證必要欄位
  if (typeof cfg.id !== 'string' || cfg.id.length === 0) {
    errors.push('id 必須是非空字串');
  }
  
  if (typeof cfg.query !== 'string' || cfg.query.length === 0) {
    errors.push('query 必須是非空字串');
  }
  
  if (typeof cfg.displayName !== 'string' || cfg.displayName.length === 0) {
    errors.push('displayName 必須是非空字串');
  }
  
  if (typeof cfg.icon !== 'string' || cfg.icon.length === 0) {
    errors.push('icon 必須是非空字串');
  }
  
  if (typeof cfg.defaultEnabled !== 'boolean') {
    errors.push('defaultEnabled 必須是布林值');
  }
  
  // 驗證顏色配置
  if (typeof cfg.color !== 'object' || cfg.color === null) {
    errors.push('color 必須是物件');
  } else {
    const color = cfg.color as Record<string, unknown>;
    const requiredColorFields = ['primary', 'secondary', 'fill', 'stroke'];
    
    for (const field of requiredColorFields) {
      if (typeof color[field] !== 'string' || color[field].length === 0) {
        errors.push(`color.${field} 必須是非空字串`);
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * 驗證多個需求配置
 * @param configs 配置陣列
 * @returns 驗證結果
 */
export const validateRequirementConfigs = (configs: unknown[]): {
  validConfigs: SearchRequirementConfig[];
  invalidConfigs: { index: number; config: unknown; errors: string[] }[];
} => {
  const validConfigs: SearchRequirementConfig[] = [];
  const invalidConfigs: { index: number; config: unknown; errors: string[] }[] = [];
  
  configs.forEach((config, index) => {
    const validation = validateRequirementConfig(config);
    
    if (validation.isValid) {
      validConfigs.push(config as SearchRequirementConfig);
    } else {
      invalidConfigs.push({
        index,
        config,
        errors: validation.errors
      });
    }
  });
  
  return { validConfigs, invalidConfigs };
};

// ============================================================================
// 匯出常數
// ============================================================================

/**
 * 需求類型常數陣列
 */
export const REQUIREMENT_TYPES = Object.keys(SEARCH_REQUIREMENTS) as RequirementType[];

/**
 * 預設啟用的需求類型
 */
export const DEFAULT_ENABLED_REQUIREMENTS = REQUIREMENT_TYPES.filter(
  type => SEARCH_REQUIREMENTS[type].defaultEnabled
);

/**
 * 需求顯示名稱對應表
 */
export const REQUIREMENT_DISPLAY_NAMES = Object.entries(SEARCH_REQUIREMENTS).reduce(
  (acc, [key, config]) => {
    acc[key as RequirementType] = config.displayName;
    return acc;
  },
  {} as Record<RequirementType, string>
);

/**
 * 需求圖示對應表
 */
export const REQUIREMENT_ICONS = Object.entries(SEARCH_REQUIREMENTS).reduce(
  (acc, [key, config]) => {
    acc[key as RequirementType] = config.icon;
    return acc;
  },
  {} as Record<RequirementType, string>
);