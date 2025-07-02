/**
 * Location Search Feature - Types Index
 * 統一匯出所有類型定義
 */

// 搜尋相關類型
export type {
  GeoLocation,
  RequirementType,
  SearchStatus,
  SearchRequirementConfig,
  SearchRequirement,
  LocationResult,
  SearchOptions,
  SearchStatistics,
  SearchActionType,
  SearchAction,
  SearchState,
  ILocationSearchService,
} from './search.types';

// 地圖相關類型
export type {
  MapBounds,
  MapViewport,
  CircleStyle,
  MapCircle,
  CircleOptions,
  MarkerIcon,
  MapMarker,
  MarkerOptions,
  ClusteringConfig,
  LocationCluster,
  ClusterMarker,
  IMapRenderer,
  MapEventType,
  MapEventData,
  MapEventHandler,
  MapConfig,
} from './map.types';

// 交集相關類型
export type {
  IntersectionArea,
  IntersectionOptions,
  IntersectionResult,
  IntersectionFilterStrategy,
  IntersectionFilterConfig,
  IntersectionFilterResult,
  IntersectionVisualStyle,
  IntersectionVisualElement,
  IntersectionOverlayConfig,
  IIntersectionService,
  IntersectionEventType,
  IntersectionEventData,
  IntersectionEventHandler,
  IntersectionState,
} from './intersection.types';

// UI 相關類型
export type {
  UITheme,
  ComponentSize,
  ButtonVariant,
  LoadingState,
  ControlPanelConfig,
  RequirementToggleConfig,
  ControlPanelAction,
  ControlPanelState,
  StatisticsDisplayConfig,
  StatisticCard,
  SearchInputConfig,
  SearchSuggestion,
  MapControlsConfig,
  LayerControl,
  NotificationType,
  Notification,
  NotificationAction,
  Breakpoint,
  ResponsiveConfig,
  AccessibilityConfig,
  UIState,
  UserPreferences,
} from './ui.types';

// 重新匯出常用類型的聯集
export type AnySearchAction = SearchAction;
export type AnyMapEvent = MapEventData;
export type AnyIntersectionEvent = IntersectionEventData;

// 工具類型
export type RequirementRecord<T> = Record<RequirementType, T>;
export type PartialSearchState = Partial<SearchState>;
export type LocationResultMap = RequirementRecord<LocationResult[]>;

// 類型保護函數的類型
export type TypeGuard<T> = (value: unknown) => value is T;

// 事件處理器的通用類型
export type EventHandler<T = unknown> = (event: T) => void;
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

// 配置物件的通用類型
export type ConfigObject<T = Record<string, unknown>> = Readonly<T>;

// 服務介面的通用類型
export type ServiceInterface = Record<string, (...args: any[]) => any>;

// Utility types for better type safety
export type NonEmptyArray<T> = [T, ...T[]];
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 常數類型
export const REQUIREMENT_TYPES = ['starbucks', 'gym', 'convenience'] as const;
export const SEARCH_STATUSES = ['idle', 'loading', 'success', 'error'] as const;
export const UI_THEMES = ['light', 'dark', 'auto'] as const;
export const COMPONENT_SIZES = ['small', 'medium', 'large'] as const;
export const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;