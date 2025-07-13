/**
 * House Search Feature - 統一類型定義
 * 遵循 FAANG 級別的類型安全標準
 */

// 基礎地理位置類型
export interface LatLng {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: LatLng;
  placeId?: string;
  rating?: number;
  businessStatus?: string;
}

// 搜尋需求類型
export interface SearchRequirement {
  id: string;
  query: string;
  color: string;
  enabled: boolean;
  locations: Location[];
}

// 搜尋需求狀態
export interface RequirementState {
  requirement: SearchRequirement;
  loading: boolean;
  error: string | null;
}

// 交集區域類型
export interface IntersectionArea {
  id: string;
  center: LatLng;
  radius: number;
  requirements: string[];
  score: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// 房源類型
export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  coordinates?: LatLng;
  size?: string;
  layout?: string;
  url?: string;
  images?: string[];
  tags?: string[];
  distance?: number;
  rating?: number;
}

// 搜尋結果類型
export interface SearchResult {
  properties: Property[];
  intersectionAreas: IntersectionArea[];
  metadata: {
    totalFound: number;
    searchTime: number;
    queryCenter: LatLng;
    queryRadius: number;
  };
}

// UI 狀態類型
export interface UIState {
  isSearching: boolean;
  isLoading: boolean;
  showFilters: boolean;
  selectedProperty: Property | null;
  mapCenter: LatLng;
  mapZoom: number;
}

// 錯誤類型
export interface SearchError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 搜尋配置類型
export interface SearchConfig {
  maxResults: number;
  searchRadius: number;
  minIntersectionScore: number;
  debounceMs: number;
  enableCaching: boolean;
}

// 完整的搜尋狀態
export interface HouseSearchState {
  requirements: RequirementState[];
  intersectionAreas: IntersectionArea[];
  properties: Property[];
  ui: UIState;
  errors: Record<string, SearchError>;
  config: SearchConfig;
}

// 搜尋動作類型
export type SearchAction =
  | { type: 'SET_REQUIREMENTS'; payload: RequirementState[] }
  | { type: 'UPDATE_REQUIREMENT'; payload: { id: string; requirement: Partial<SearchRequirement> } }
  | { type: 'SET_REQUIREMENT_LOADING'; payload: { id: string; loading: boolean } }
  | { type: 'SET_REQUIREMENT_ERROR'; payload: { id: string; error: string | null } }
  | { type: 'SET_INTERSECTION_AREAS'; payload: IntersectionArea[] }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'SET_UI_STATE'; payload: Partial<UIState> }
  | { type: 'SET_ERROR'; payload: { key: string; error: SearchError } }
  | { type: 'CLEAR_ERROR'; payload: { key: string } }
  | { type: 'RESET_SEARCH' }
  | { type: 'SET_SEARCHING'; payload: boolean };

// 服務介面類型
export interface ILocationService {
  searchPlaces(query: string, center: LatLng, radius: number): Promise<Location[]>;
}

export interface IPropertyService {
  searchProperties(area: IntersectionArea): Promise<Property[]>;
}

export interface IIntersectionService {
  calculateIntersections(requirements: SearchRequirement[]): Promise<IntersectionArea[]>;
}

export interface IMapService {
  addCircle(center: LatLng, radius: number, color: string): void;
  removeCircle(id: string): void;
  fitBounds(bounds: { north: number; south: number; east: number; west: number }): void;
  clearMap(): void;
}

// 配置常數
export const DEFAULT_CONFIG: SearchConfig = {
  maxResults: 50,
  searchRadius: 1000,
  minIntersectionScore: 0.5,
  debounceMs: 300,
  enableCaching: true,
};

// 預設顏色
export const DEFAULT_COLORS = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
];

// 預設地圖中心 (東京車站)
export const DEFAULT_MAP_CENTER: LatLng = {
  lat: 35.6762,
  lng: 139.6503,
};

export const DEFAULT_MAP_ZOOM = 13;