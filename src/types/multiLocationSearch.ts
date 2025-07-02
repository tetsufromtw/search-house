/**
 * 多需求地點搜尋系統類型定義
 * 支援同時搜尋多種類型的地點（如 Starbucks、健身房、便利商店等）
 */

import { Place } from '../services/types';

/**
 * 搜尋需求顏色配置
 * 使用 Tailwind CSS 色彩系統
 */
export interface RequirementColor {
  /** 主色調 (例: 'red', 'blue', 'green') */
  base: string;
  /** 圓圈填充色 (例: 'red-300') */
  fill: string;
  /** 圓圈邊框色 (例: 'red-400') */
  stroke: string;
  /** 對應的 hex 色碼 */
  hex: {
    fill: string;
    stroke: string;
  };
}

/**
 * 預定義的需求類型
 */
export type RequirementType = 'starbucks' | 'gym' | 'convenience';

/**
 * 需求配置
 */
export interface RequirementConfig {
  id: RequirementType;
  /** 搜尋關鍵字（日文） */
  query: string;
  /** 顯示名稱（中文） */
  displayName: string;
  /** 顏色配置 */
  color: RequirementColor;
  /** 預設啟用狀態 */
  defaultEnabled: boolean;
}

/**
 * 搜尋需求的地點資料
 */
export interface RequirementLocation extends Place {
  /** 圓圈 ID */
  circleId?: string;
  /** 所屬需求 ID */
  requirementId: RequirementType;
}

/**
 * 單一搜尋需求的狀態
 */
export interface SearchRequirement {
  /** 需求 ID */
  id: RequirementType;
  /** 搜尋關鍵字 */
  query: string;
  /** 顯示名稱 */
  displayName: string;
  /** 顏色配置 */
  color: RequirementColor;
  /** 是否啟用這個需求 */
  enabled: boolean;
  /** 是否顯示圓圈 */
  visible: boolean;
  /** 搜尋到的地點 */
  locations: RequirementLocation[];
  /** 載入狀態 */
  loading: boolean;
  /** 錯誤訊息 */
  error: string | null;
  /** 最後搜尋時間 */
  lastSearchTime: number | null;
}

/**
 * 多需求搜尋的整體狀態
 */
export interface MultiLocationSearchState {
  /** 所有搜尋需求 */
  requirements: Record<RequirementType, SearchRequirement>;
  /** 總搜尋次數 */
  totalSearchCount: number;
  /** 是否有任何需求正在載入 */
  isAnyLoading: boolean;
  /** 總錯誤數量 */
  errorCount: number;
}

/**
 * 多需求搜尋選項
 */
export interface MultiLocationSearchOptions {
  /** 最大分頁數 */
  maxPages?: number;
  /** 搜尋半徑 (公尺) */
  radius?: number;
  /** 圓圈半徑 (公尺) */
  circleRadius?: number;
  /** 自動更新 */
  autoUpdate?: boolean;
  /** 邊界擴展比例 */
  boundsExpansion?: number;
  /** 防抖動延遲 */
  debounceDelay?: number;
  /** 並行搜尋 */
  parallelSearch?: boolean;
  /** 聚合配置 */
  clustering?: ClusteringOptions;
}

/**
 * 搜尋結果統計
 */
export interface SearchStats {
  /** 總地點數 */
  totalLocations: number;
  /** 可見地點數 */
  visibleLocations: number;
  /** 各需求的地點數量 */
  locationsByRequirement: Record<RequirementType, number>;
  /** 各需求的可見地點數量 */
  visibleByRequirement: Record<RequirementType, number>;
}

/**
 * 地圖聚合點 (Cluster)
 */
export interface LocationCluster {
  /** 聚合點的唯一 ID */
  id: string;
  /** 聚合中心位置 */
  center: { lat: number; lng: number };
  /** 聚合內的地點列表 */
  locations: RequirementLocation[];
  /** 所屬的需求類型 */
  requirementType: RequirementType;
  /** 聚合內地點總數 */
  count: number;
  /** 聚合半徑 (公尺) */
  radius: number;
}

/**
 * 聚合配置選項
 */
export interface ClusteringOptions {
  /** 啟用聚合的最小縮放等級 (小於此等級才聚合) */
  clusterMinZoom: number;
  /** 聚合距離閾值 (公尺) */
  clusterDistance: number;
  /** 最小聚合數量 (少於此數量不聚合) */
  minClusterSize: number;
  /** 最大聚合半徑 (公尺) */
  maxClusterRadius: number;
}

/**
 * 需求操作類型
 */
export type RequirementAction = 
  | { type: 'TOGGLE_ENABLED'; requirementId: RequirementType }
  | { type: 'TOGGLE_VISIBLE'; requirementId: RequirementType }
  | { type: 'SET_LOADING'; requirementId: RequirementType; loading: boolean }
  | { type: 'SET_LOCATIONS'; requirementId: RequirementType; locations: RequirementLocation[] }
  | { type: 'SET_ERROR'; requirementId: RequirementType; error: string | null }
  | { type: 'CLEAR_ALL_LOCATIONS' }
  | { type: 'RESET_REQUIREMENT'; requirementId: RequirementType };