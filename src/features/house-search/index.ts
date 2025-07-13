/**
 * House Search Feature - 統一輸出
 * 提供完整的房屋搜尋功能模組
 */

// 主要組件
export { HouseSearchPage } from './components';

// 業務邏輯 Hooks
export { useHouseSearch, useMapOperations, useHouseSearchWithMap } from './hooks';

// 服務層
export { getHouseSearchService } from './services';

// 類型定義
export type {
  LatLng,
  Location,
  SearchRequirement,
  RequirementState,
  IntersectionArea,
  Property,
  SearchResult,
  UIState,
  SearchError,
  SearchConfig,
  HouseSearchState,
  ILocationService,
  IPropertyService,
  IIntersectionService,
  IMapService,
} from './types';

// 配置
export { CONFIG } from './config';

// 子組件（如果需要單獨使用）
export {
  RequirementSection,
  RequirementInput,
  FilterPanel,
  MapContainer,
  SearchResultList,
} from './components';