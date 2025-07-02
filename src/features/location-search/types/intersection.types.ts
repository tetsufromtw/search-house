/**
 * 交集相關類型定義
 * 處理不同需求間的地理交集計算和視覺化
 */

import { GeoLocation, RequirementType, LocationResult } from './search.types';
import { MapCircle, MapBounds } from './map.types';

// ============================================================================
// 交集計算
// ============================================================================

/**
 * 交集區域
 */
export interface IntersectionArea {
  readonly id: string;
  readonly center: GeoLocation;
  readonly radius: number;
  readonly involvedRequirements: RequirementType[];
  readonly involvedLocations: LocationResult[];
  readonly overlappingCircles: string[]; // circle IDs
  readonly intersectionType: 'two_way' | 'three_way' | 'multi_way';
}

/**
 * 交集計算選項
 */
export interface IntersectionOptions {
  readonly enabled: boolean;
  readonly minIntersectionDistance: number;
  readonly maxIntersectionRadius: number;
  readonly requireDifferentTypes: boolean;
  readonly minOverlapPercentage: number;
}

/**
 * 交集計算結果
 */
export interface IntersectionResult {
  readonly intersections: IntersectionArea[];
  readonly totalIntersections: number;
  readonly intersectionsByType: Record<string, number>;
  readonly calculationTime: number;
  readonly lastCalculation: Date;
}

// ============================================================================
// 交集篩選
// ============================================================================

/**
 * 交集篩選策略
 */
export type IntersectionFilterStrategy = 
  | 'show_all'           // 顯示所有位置
  | 'intersections_only' // 只顯示有交集的位置
  | 'single_requirement' // 單一需求時顯示全部，多需求時顯示交集
  | 'custom';            // 自訂邏輯

/**
 * 交集篩選配置
 */
export interface IntersectionFilterConfig {
  readonly strategy: IntersectionFilterStrategy;
  readonly customFilter?: (
    location: LocationResult,
    allLocations: LocationResult[],
    requirements: RequirementType[]
  ) => boolean;
  readonly minIntersectionCount: number;
  readonly requirementTypes: RequirementType[];
}

/**
 * 交集篩選結果
 */
export interface IntersectionFilterResult {
  readonly filteredLocations: Record<RequirementType, LocationResult[]>;
  readonly totalFiltered: number;
  readonly filteredByRequirement: Record<RequirementType, number>;
  readonly filteringRules: string[];
  readonly processingTime: number;
}

// ============================================================================
// 交集視覺化
// ============================================================================

/**
 * 交集視覺樣式
 */
export interface IntersectionVisualStyle {
  readonly strokeColor: string;
  readonly strokeOpacity: number;
  readonly strokeWeight: number;
  readonly fillColor: string;
  readonly fillOpacity: number;
  readonly highlightColor: string;
  readonly animationDuration: number;
}

/**
 * 交集視覺元素
 */
export interface IntersectionVisualElement {
  readonly id: string;
  readonly intersection: IntersectionArea;
  readonly style: IntersectionVisualStyle;
  readonly visible: boolean;
  readonly interactive: boolean;
  readonly zIndex: number;
}

/**
 * 交集覆蓋層配置
 */
export interface IntersectionOverlayConfig {
  readonly enabled: boolean;
  readonly renderMethod: 'canvas' | 'svg' | 'webgl';
  readonly updateStrategy: 'immediate' | 'debounced' | 'manual';
  readonly debounceDelay: number;
  readonly maxRenderElements: number;
  readonly enableAnimation: boolean;
}

// ============================================================================
// 交集服務介面
// ============================================================================

/**
 * 交集服務介面
 */
export interface IIntersectionService {
  /**
   * 計算位置間的交集
   */
  calculateIntersections(
    circles: MapCircle[],
    options: IntersectionOptions
  ): Promise<IntersectionResult>;

  /**
   * 篩選位置基於交集邏輯
   */
  filterLocationsByIntersection(
    locations: Record<RequirementType, LocationResult[]>,
    config: IntersectionFilterConfig
  ): IntersectionFilterResult;

  /**
   * 檢查兩個圓圈是否相交
   */
  checkCircleIntersection(
    circle1: { center: GeoLocation; radius: number },
    circle2: { center: GeoLocation; radius: number }
  ): boolean;

  /**
   * 計算兩點間距離
   */
  calculateDistance(point1: GeoLocation, point2: GeoLocation): number;

  /**
   * 取得交集區域的最佳縮放等級
   */
  getOptimalZoomLevel(intersections: IntersectionArea[]): number;
}

// ============================================================================
// 交集事件
// ============================================================================

/**
 * 交集事件類型
 */
export type IntersectionEventType =
  | 'intersection_found'
  | 'intersection_lost'
  | 'intersection_click'
  | 'intersection_hover'
  | 'intersection_updated';

/**
 * 交集事件資料
 */
export interface IntersectionEventData {
  readonly type: IntersectionEventType;
  readonly intersection: IntersectionArea;
  readonly position?: GeoLocation;
  readonly timestamp: Date;
}

/**
 * 交集事件處理器
 */
export type IntersectionEventHandler = (event: IntersectionEventData) => void;

// ============================================================================
// 交集狀態
// ============================================================================

/**
 * 交集狀態
 */
export interface IntersectionState {
  readonly enabled: boolean;
  readonly strategy: IntersectionFilterStrategy;
  readonly intersections: IntersectionArea[];
  readonly visibleIntersections: IntersectionVisualElement[];
  readonly filterConfig: IntersectionFilterConfig;
  readonly overlayConfig: IntersectionOverlayConfig;
  readonly lastUpdate: Date | null;
  readonly isCalculating: boolean;
  readonly calculationError: string | null;
}