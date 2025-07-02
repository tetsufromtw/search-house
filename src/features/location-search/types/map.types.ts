/**
 * 地圖相關類型定義
 * 地圖渲染、圓圈管理、聚合等功能的類型
 */

import { GeoLocation, RequirementType, LocationResult } from './search.types';

// ============================================================================
// 地圖基礎類型
// ============================================================================

/**
 * 地圖邊界
 */
export interface MapBounds {
  readonly northEast: GeoLocation;
  readonly southWest: GeoLocation;
  readonly center: GeoLocation;
  readonly zoom: number;
}

/**
 * 地圖視窗大小
 */
export interface MapViewport {
  readonly width: number;
  readonly height: number;
}

// ============================================================================
// 圓圈相關類型
// ============================================================================

/**
 * 圓圈樣式
 */
export interface CircleStyle {
  readonly fillColor: string;
  readonly fillOpacity: number;
  readonly strokeColor: string;
  readonly strokeOpacity: number;
  readonly strokeWeight: number;
}

/**
 * 地圖圓圈
 */
export interface MapCircle {
  readonly id: string;
  readonly center: GeoLocation;
  readonly radius: number;
  readonly style: CircleStyle;
  readonly requirementType: RequirementType;
  readonly location: LocationResult;
  readonly visible: boolean;
}

/**
 * 圓圈選項
 */
export interface CircleOptions {
  readonly radius: number;
  readonly style: CircleStyle;
  readonly clickable: boolean;
  readonly draggable: boolean;
  readonly editable: boolean;
  readonly zIndex: number;
}

// ============================================================================
// 標記相關類型  
// ============================================================================

/**
 * 標記圖示
 */
export interface MarkerIcon {
  readonly url: string;
  readonly size: { width: number; height: number };
  readonly anchor: { x: number; y: number };
  readonly scaledSize?: { width: number; height: number };
}

/**
 * 地圖標記
 */
export interface MapMarker {
  readonly id: string;
  readonly position: GeoLocation;
  readonly icon: MarkerIcon;
  readonly title: string;
  readonly requirementType: RequirementType;
  readonly location: LocationResult;
  readonly visible: boolean;
  readonly zIndex: number;
}

/**
 * 標記選項
 */
export interface MarkerOptions {
  readonly icon: MarkerIcon;
  readonly title: string;
  readonly clickable: boolean;
  readonly draggable: boolean;
  readonly zIndex: number;
  readonly animation?: 'bounce' | 'drop';
}

// ============================================================================
// 聚合相關類型
// ============================================================================

/**
 * 聚合設定
 */
export interface ClusteringConfig {
  readonly enabled: boolean;
  readonly minZoom: number;
  readonly maxZoom: number;
  readonly clusterDistance: number;
  readonly minClusterSize: number;
  readonly maxClusterRadius: number;
}

/**
 * 位置聚合
 */
export interface LocationCluster {
  readonly id: string;
  readonly center: GeoLocation;
  readonly radius: number;
  readonly count: number;
  readonly requirementType: RequirementType;
  readonly locations: LocationResult[];
  readonly bounds: MapBounds;
}

/**
 * 聚合標記
 */
export interface ClusterMarker {
  readonly id: string;
  readonly cluster: LocationCluster;
  readonly icon: MarkerIcon;
  readonly position: GeoLocation;
  readonly visible: boolean;
}

// ============================================================================
// 地圖渲染器介面
// ============================================================================

/**
 * 地圖渲染器介面
 */
export interface IMapRenderer {
  /**
   * 渲染圓圈
   */
  renderCircles(circles: MapCircle[]): void;

  /**
   * 渲染標記
   */
  renderMarkers(markers: MapMarker[]): void;

  /**
   * 渲染聚合標記
   */
  renderClusters(clusters: ClusterMarker[]): void;

  /**
   * 清除指定需求的所有元素
   */
  clearRequirement(requirementType: RequirementType): void;

  /**
   * 清除所有元素
   */
  clearAll(): void;

  /**
   * 更新元素可見性
   */
  updateVisibility(requirementType: RequirementType, visible: boolean): void;

  /**
   * 取得當前地圖邊界
   */
  getCurrentBounds(): MapBounds | null;

  /**
   * 設定地圖中心和縮放
   */
  setCenter(center: GeoLocation, zoom?: number): void;
}

// ============================================================================
// 地圖事件
// ============================================================================

/**
 * 地圖事件類型
 */
export type MapEventType = 
  | 'bounds_changed'
  | 'zoom_changed'
  | 'center_changed'
  | 'click'
  | 'circle_click'
  | 'marker_click'
  | 'cluster_click';

/**
 * 地圖事件資料
 */
export interface MapEventData {
  readonly type: MapEventType;
  readonly bounds?: MapBounds;
  readonly center?: GeoLocation;
  readonly zoom?: number;
  readonly clickPosition?: GeoLocation;
  readonly circleId?: string;
  readonly markerId?: string;
  readonly clusterId?: string;
}

/**
 * 地圖事件處理器
 */
export type MapEventHandler = (event: MapEventData) => void;

// ============================================================================
// 地圖配置
// ============================================================================

/**
 * 地圖配置
 */
export interface MapConfig {
  readonly defaultCenter: GeoLocation;
  readonly defaultZoom: number;
  readonly minZoom: number;
  readonly maxZoom: number;
  readonly gestureHandling: 'auto' | 'cooperative' | 'greedy' | 'none';
  readonly disableDefaultUI: boolean;
  readonly zoomControl: boolean;
  readonly mapTypeControl: boolean;
  readonly scaleControl: boolean;
  readonly streetViewControl: boolean;
  readonly rotateControl: boolean;
  readonly fullscreenControl: boolean;
}