/**
 * Location Search Feature - Utils Index
 * 統一匯出所有工具函數
 */

// 幾何計算工具
export * from './geometry.utils';

// 地圖相關工具
export * from './map.utils';

// 顏色處理工具
export * from './color.utils';

// 驗證工具
export * from './validation.utils';

// 重新匯出常用函數組合
export {
  calculateDistance,
  calculateBearing,
  calculateDestination,
  isPointInCircle,
  checkCircleIntersection,
  calculateCircleOverlapArea,
  calculateBoundingBox,
  calculateCentroid,
  isValidGeoLocation
} from './geometry.utils';

export {
  convertGoogleBoundsToMapBounds,
  isLocationInBounds,
  calculateOptimalViewport,
  getCircleStyleForRequirement,
  createRequirementMarkerIcon,
  createClusterMarkerIcon,
  shouldEnableClustering,
  createInfoWindowContent,
  generateMapElementId
} from './map.utils';

export {
  TAILWIND_COLORS,
  REQUIREMENT_COLORS,
  hexToRgb,
  rgbToHex,
  adjustOpacity,
  adjustBrightness,
  blendColors,
  blendMultipleColors,
  getRequirementColors,
  generateGradientColors,
  getHeatmapColor,
  isValidHexColor,
  calculateContrast,
  getContrastTextColor
} from './color.utils';

export {
  isNotNullish,
  isValidNumber,
  isValidString,
  isNonEmptyArray,
  isValidRequirementType,
  validateSearchOptions,
  isValidLocationResult,
  validateClusteringConfig,
  validateLocationResults,
  isValidSearchRequirement,
  isInRange,
  isValidZoomLevel,
  isValidRadius,
  createValidationError,
  formatValidationErrors
} from './validation.utils';