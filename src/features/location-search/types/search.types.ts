/**
 * 搜尋相關類型定義
 * 核心領域模型，定義搜尋功能的基本資料結構
 */

// ============================================================================
// 基礎類型
// ============================================================================

/**
 * 地理位置
 */
export interface GeoLocation {
  readonly lat: number;
  readonly lng: number;
}

/**
 * 搜尋需求類型
 */
export type RequirementType = 'starbucks' | 'gym' | 'convenience';

/**
 * 搜尋狀態
 */
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// 搜尋需求
// ============================================================================

/**
 * 搜尋需求配置
 */
export interface SearchRequirementConfig {
  readonly id: RequirementType;
  readonly query: string;
  readonly displayName: string;
  readonly color: {
    readonly primary: string;
    readonly secondary: string;
    readonly fill: string;
    readonly stroke: string;
  };
  readonly icon: string;
  readonly defaultEnabled: boolean;
}

/**
 * 搜尋需求狀態
 */
export interface SearchRequirement {
  readonly id: RequirementType;
  readonly config: SearchRequirementConfig;
  readonly enabled: boolean;
  readonly visible: boolean;
  readonly status: SearchStatus;
  readonly error: string | null;
  readonly lastSearchTime: Date | null;
  readonly locations: LocationResult[];
}

// ============================================================================
// 搜尋結果
// ============================================================================

/**
 * 位置搜尋結果
 */
export interface LocationResult {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly location: GeoLocation;
  readonly rating?: number;
  readonly priceLevel?: number;
  readonly types: string[];
  readonly requirementType: RequirementType;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 搜尋選項
 */
export interface SearchOptions {
  readonly radius: number;
  readonly maxResults: number;
  readonly types?: string[];
  readonly language?: string;
  readonly region?: string;
}

/**
 * 搜尋結果統計
 */
export interface SearchStatistics {
  readonly totalRequests: number;
  readonly totalResults: number;
  readonly resultsByRequirement: Record<RequirementType, number>;
  readonly visibleByRequirement: Record<RequirementType, number>;
  readonly averageResponseTime: number;
  readonly errorCount: number;
  readonly lastUpdateTime: Date | null;
}

// ============================================================================
// 搜尋動作
// ============================================================================

/**
 * 搜尋動作類型
 */
export type SearchActionType = 
  | 'SEARCH_START'
  | 'SEARCH_SUCCESS' 
  | 'SEARCH_ERROR'
  | 'TOGGLE_REQUIREMENT'
  | 'TOGGLE_VISIBILITY'
  | 'CLEAR_RESULTS'
  | 'UPDATE_OPTIONS';

/**
 * 搜尋動作
 */
export interface SearchAction {
  readonly type: SearchActionType;
  readonly payload?: {
    requirementType?: RequirementType;
    results?: LocationResult[];
    error?: string;
    options?: Partial<SearchOptions>;
  };
}

// ============================================================================
// 搜尋狀態
// ============================================================================

/**
 * 完整搜尋狀態
 */
export interface SearchState {
  readonly requirements: Record<RequirementType, SearchRequirement>;
  readonly options: SearchOptions;
  readonly statistics: SearchStatistics;
  readonly isAnyLoading: boolean;
  readonly hasErrors: boolean;
}

// ============================================================================
// 搜尋服務介面
// ============================================================================

/**
 * 搜尋服務介面
 */
export interface ILocationSearchService {
  /**
   * 搜尋指定需求的位置
   */
  searchLocations(
    requirement: RequirementType,
    center: GeoLocation,
    options: SearchOptions
  ): Promise<LocationResult[]>;

  /**
   * 取消搜尋
   */
  cancelSearch(requirement: RequirementType): void;

  /**
   * 清除快取
   */
  clearCache(): void;

  /**
   * 取得快取統計
   */
  getCacheStats(): Record<string, unknown>;
}