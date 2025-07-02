/**
 * 驗證相關工具函數
 * 提供資料驗證、類型檢查、格式驗證等功能
 */

import { 
  GeoLocation, 
  RequirementType, 
  SearchOptions, 
  LocationResult,
  MapBounds,
  SearchRequirement,
  ClusteringConfig
} from '../types';

// ============================================================================
// 基礎類型驗證
// ============================================================================

/**
 * 檢查值是否不為 null 或 undefined
 * @param value 要檢查的值
 * @returns 是否有效
 */
export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * 檢查是否為有效的數字
 * @param value 要檢查的值
 * @param allowZero 是否允許零
 * @param allowNegative 是否允許負數
 * @returns 是否為有效數字
 */
export const isValidNumber = (
  value: unknown,
  allowZero: boolean = true,
  allowNegative: boolean = true
): value is number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return false;
  }
  
  if (!allowZero && value === 0) return false;
  if (!allowNegative && value < 0) return false;
  
  return true;
};

/**
 * 檢查是否為有效的字串
 * @param value 要檢查的值
 * @param minLength 最小長度（可選）
 * @param maxLength 最大長度（可選）
 * @returns 是否為有效字串
 */
export const isValidString = (
  value: unknown,
  minLength?: number,
  maxLength?: number
): value is string => {
  if (typeof value !== 'string') return false;
  
  if (minLength !== undefined && value.length < minLength) return false;
  if (maxLength !== undefined && value.length > maxLength) return false;
  
  return true;
};

/**
 * 檢查是否為非空陣列
 * @param value 要檢查的值
 * @param minLength 最小長度（預設為1）
 * @returns 是否為非空陣列
 */
export const isNonEmptyArray = <T>(
  value: unknown,
  minLength: number = 1
): value is T[] => {
  return Array.isArray(value) && value.length >= minLength;
};

// ============================================================================
// 地理位置驗證
// ============================================================================

/**
 * 驗證地理位置是否有效
 * @param location 地理位置物件
 * @returns 是否有效
 */
export const isValidGeoLocation = (location: unknown): location is GeoLocation => {
  if (typeof location !== 'object' || location === null) return false;
  
  const loc = location as Record<string, unknown>;
  
  return isValidNumber(loc.lat) &&
    isValidNumber(loc.lng) &&
    loc.lat >= -90 &&
    loc.lat <= 90 &&
    loc.lng >= -180 &&
    loc.lng <= 180;
};

/**
 * 驗證地圖邊界是否有效
 * @param bounds 地圖邊界物件
 * @returns 是否有效
 */
export const isValidMapBounds = (bounds: unknown): bounds is MapBounds => {
  if (typeof bounds !== 'object' || bounds === null) return false;
  
  const b = bounds as Record<string, unknown>;
  
  return isValidGeoLocation(b.northEast) &&
    isValidGeoLocation(b.southWest) &&
    isValidGeoLocation(b.center) &&
    isValidNumber(b.zoom, true, false) &&
    b.zoom >= 1 &&
    b.zoom <= 21 &&
    (b.northEast as GeoLocation).lat > (b.southWest as GeoLocation).lat &&
    (b.northEast as GeoLocation).lng > (b.southWest as GeoLocation).lng;
};

/**
 * 驗證經緯度座標格式
 * @param lat 緯度
 * @param lng 經度
 * @returns 驗證結果
 */
export const validateCoordinates = (lat: unknown, lng: unknown): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!isValidNumber(lat)) {
    errors.push('緯度必須是有效的數字');
  } else if (lat < -90 || lat > 90) {
    errors.push('緯度必須在 -90 到 90 之間');
  }
  
  if (!isValidNumber(lng)) {
    errors.push('經度必須是有效的數字');
  } else if (lng < -180 || lng > 180) {
    errors.push('經度必須在 -180 到 180 之間');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// 搜尋相關驗證
// ============================================================================

/**
 * 驗證需求類型是否有效
 * @param type 需求類型
 * @returns 是否有效
 */
export const isValidRequirementType = (type: unknown): type is RequirementType => {
  return typeof type === 'string' && 
    ['starbucks', 'gym', 'convenience'].includes(type);
};

/**
 * 驗證搜尋選項是否有效
 * @param options 搜尋選項
 * @returns 驗證結果
 */
export const validateSearchOptions = (options: unknown): {
  isValid: boolean;
  errors: string[];
  validOptions?: SearchOptions;
} => {
  const errors: string[] = [];
  
  if (typeof options !== 'object' || options === null) {
    errors.push('搜尋選項必須是物件');
    return { isValid: false, errors };
  }
  
  const opts = options as Record<string, unknown>;
  
  // 驗證半徑
  if (!isValidNumber(opts.radius, false, false)) {
    errors.push('半徑必須是正數');
  } else if (opts.radius < 100 || opts.radius > 50000) {
    errors.push('半徑必須在 100 到 50000 公尺之間');
  }
  
  // 驗證最大結果數
  if (!isValidNumber(opts.maxResults, false, false)) {
    errors.push('最大結果數必須是正整數');
  } else if (opts.maxResults < 1 || opts.maxResults > 100) {
    errors.push('最大結果數必須在 1 到 100 之間');
  }
  
  // 驗證類型陣列（可選）
  if (opts.types !== undefined) {
    if (!Array.isArray(opts.types)) {
      errors.push('類型必須是字串陣列');
    } else {
      const invalidTypes = opts.types.filter(t => typeof t !== 'string');
      if (invalidTypes.length > 0) {
        errors.push('類型陣列必須只包含字串');
      }
    }
  }
  
  // 驗證語言（可選）
  if (opts.language !== undefined && !isValidString(opts.language, 2, 5)) {
    errors.push('語言代碼必須是 2-5 個字元的字串');
  }
  
  // 驗證地區（可選）
  if (opts.region !== undefined && !isValidString(opts.region, 2, 2)) {
    errors.push('地區代碼必須是 2 個字元的字串');
  }
  
  if (errors.length === 0) {
    return {
      isValid: true,
      errors: [],
      validOptions: {
        radius: opts.radius as number,
        maxResults: opts.maxResults as number,
        types: opts.types as string[] | undefined,
        language: opts.language as string | undefined,
        region: opts.region as string | undefined
      }
    };
  }
  
  return { isValid: false, errors };
};

/**
 * 驗證位置搜尋結果是否有效
 * @param result 搜尋結果
 * @returns 是否有效
 */
export const isValidLocationResult = (result: unknown): result is LocationResult => {
  if (typeof result !== 'object' || result === null) return false;
  
  const res = result as Record<string, unknown>;
  
  return isValidString(res.id, 1) &&
    isValidString(res.name, 1) &&
    isValidString(res.address) &&
    isValidGeoLocation(res.location) &&
    isValidRequirementType(res.requirementType) &&
    Array.isArray(res.types) &&
    (res.rating === undefined || (isValidNumber(res.rating) && res.rating >= 0 && res.rating <= 5)) &&
    (res.priceLevel === undefined || (isValidNumber(res.priceLevel) && res.priceLevel >= 0 && res.priceLevel <= 4));
};

// ============================================================================
// 聚合相關驗證
// ============================================================================

/**
 * 驗證聚合配置是否有效
 * @param config 聚合配置
 * @returns 驗證結果
 */
export const validateClusteringConfig = (config: unknown): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (typeof config !== 'object' || config === null) {
    errors.push('聚合配置必須是物件');
    return { isValid: false, errors };
  }
  
  const cfg = config as Record<string, unknown>;
  
  if (typeof cfg.enabled !== 'boolean') {
    errors.push('enabled 必須是布林值');
  }
  
  if (!isValidNumber(cfg.minZoom, true, false) || cfg.minZoom < 1 || cfg.minZoom > 21) {
    errors.push('minZoom 必須是 1-21 之間的數字');
  }
  
  if (!isValidNumber(cfg.maxZoom, true, false) || cfg.maxZoom < 1 || cfg.maxZoom > 21) {
    errors.push('maxZoom 必須是 1-21 之間的數字');
  }
  
  if (isValidNumber(cfg.minZoom) && isValidNumber(cfg.maxZoom) && cfg.minZoom >= cfg.maxZoom) {
    errors.push('minZoom 必須小於 maxZoom');
  }
  
  if (!isValidNumber(cfg.clusterDistance, false, false) || cfg.clusterDistance < 50 || cfg.clusterDistance > 5000) {
    errors.push('clusterDistance 必須是 50-5000 公尺之間的數字');
  }
  
  if (!isValidNumber(cfg.minClusterSize, false, false) || cfg.minClusterSize < 2 || cfg.minClusterSize > 20) {
    errors.push('minClusterSize 必須是 2-20 之間的數字');
  }
  
  if (!isValidNumber(cfg.maxClusterRadius, false, false) || cfg.maxClusterRadius < 100 || cfg.maxClusterRadius > 10000) {
    errors.push('maxClusterRadius 必須是 100-10000 公尺之間的數字');
  }
  
  return { isValid: errors.length === 0, errors };
};

// ============================================================================
// 批量驗證
// ============================================================================

/**
 * 批量驗證位置結果陣列
 * @param results 位置結果陣列
 * @returns 驗證結果
 */
export const validateLocationResults = (results: unknown[]): {
  validResults: LocationResult[];
  invalidResults: { index: number; item: unknown; reason: string }[];
} => {
  const validResults: LocationResult[] = [];
  const invalidResults: { index: number; item: unknown; reason: string }[] = [];
  
  results.forEach((result, index) => {
    if (isValidLocationResult(result)) {
      validResults.push(result);
    } else {
      invalidResults.push({
        index,
        item: result,
        reason: '不符合 LocationResult 格式'
      });
    }
  });
  
  return { validResults, invalidResults };
};

/**
 * 驗證搜尋需求物件
 * @param requirement 搜尋需求
 * @returns 是否有效
 */
export const isValidSearchRequirement = (requirement: unknown): requirement is SearchRequirement => {
  if (typeof requirement !== 'object' || requirement === null) return false;
  
  const req = requirement as Record<string, unknown>;
  
  return isValidRequirementType(req.id) &&
    typeof req.config === 'object' &&
    req.config !== null &&
    typeof req.enabled === 'boolean' &&
    typeof req.visible === 'boolean' &&
    ['idle', 'loading', 'success', 'error'].includes(req.status as string) &&
    (req.error === null || typeof req.error === 'string') &&
    (req.lastSearchTime === null || req.lastSearchTime instanceof Date) &&
    Array.isArray(req.locations);
};

// ============================================================================
// 範圍驗證
// ============================================================================

/**
 * 檢查數值是否在指定範圍內
 * @param value 數值
 * @param min 最小值
 * @param max 最大值
 * @param inclusive 是否包含邊界值
 * @returns 是否在範圍內
 */
export const isInRange = (
  value: number,
  min: number,
  max: number,
  inclusive: boolean = true
): boolean => {
  if (inclusive) {
    return value >= min && value <= max;
  } else {
    return value > min && value < max;
  }
};

/**
 * 驗證縮放等級是否有效
 * @param zoom 縮放等級
 * @returns 是否有效
 */
export const isValidZoomLevel = (zoom: unknown): zoom is number => {
  return isValidNumber(zoom) && isInRange(zoom, 1, 21);
};

/**
 * 驗證半徑是否在合理範圍內
 * @param radius 半徑（公尺）
 * @returns 是否有效
 */
export const isValidRadius = (radius: unknown): radius is number => {
  return isValidNumber(radius, false, false) && isInRange(radius, 10, 50000);
};

// ============================================================================
// 錯誤處理
// ============================================================================

/**
 * 建立驗證錯誤物件
 * @param field 欄位名稱
 * @param value 值
 * @param message 錯誤訊息
 * @returns 錯誤物件
 */
export const createValidationError = (
  field: string,
  value: unknown,
  message: string
) => {
  return {
    field,
    value,
    message,
    timestamp: new Date().toISOString()
  };
};

/**
 * 格式化驗證錯誤訊息
 * @param errors 錯誤陣列
 * @returns 格式化的錯誤訊息
 */
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  
  return `發現 ${errors.length} 個錯誤:\n${errors.map((error, index) => `${index + 1}. ${error}`).join('\n')}`;
};