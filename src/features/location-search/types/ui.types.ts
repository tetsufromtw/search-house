/**
 * UI 相關類型定義
 * 使用者介面、控制面板、統計資訊等元件的類型
 */

import { RequirementType, SearchStatistics, SearchRequirement } from './search.types';
import { MapBounds } from './map.types';
import { IntersectionState } from './intersection.types';

// ============================================================================
// 基礎 UI 類型
// ============================================================================

/**
 * UI 主題
 */
export type UITheme = 'light' | 'dark' | 'auto';

/**
 * 元件大小
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * 按鈕變體
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * 載入狀態
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// 控制面板類型
// ============================================================================

/**
 * 控制面板配置
 */
export interface ControlPanelConfig {
  readonly position: 'left' | 'right' | 'top' | 'bottom' | 'floating';
  readonly collapsible: boolean;
  readonly defaultCollapsed: boolean;
  readonly width: number | 'auto';
  readonly height: number | 'auto';
  readonly theme: UITheme;
  readonly showStatistics: boolean;
  readonly showScreenshot: boolean;
  readonly showHelp: boolean;
}

/**
 * 需求切換器配置
 */
export interface RequirementToggleConfig {
  readonly showIcon: boolean;
  readonly showName: boolean;
  readonly showCount: boolean;
  readonly showStatus: boolean;
  readonly showLastUpdate: boolean;
  readonly enableQuickActions: boolean;
  readonly size: ComponentSize;
}

/**
 * 控制面板動作
 */
export type ControlPanelAction =
  | 'toggle_requirement'
  | 'toggle_visibility'
  | 'manual_search'
  | 'clear_all'
  | 'take_screenshot'
  | 'show_help'
  | 'collapse_panel'
  | 'reset_settings';

/**
 * 控制面板狀態
 */
export interface ControlPanelState {
  readonly collapsed: boolean;
  readonly activeTab: string | null;
  readonly showHelp: boolean;
  readonly theme: UITheme;
  readonly lastAction: ControlPanelAction | null;
  readonly lastActionTime: Date | null;
}

// ============================================================================
// 統計資訊類型
// ============================================================================

/**
 * 統計資訊顯示配置
 */
export interface StatisticsDisplayConfig {
  readonly showTotalRequests: boolean;
  readonly showTotalResults: boolean;
  readonly showResultsByRequirement: boolean;
  readonly showVisibleLocations: boolean;
  readonly showResponseTime: boolean;
  readonly showErrorCount: boolean;
  readonly showCacheInfo: boolean;
  readonly updateInterval: number;
  readonly animateChanges: boolean;
}

/**
 * 統計卡片
 */
export interface StatisticCard {
  readonly id: string;
  readonly title: string;
  readonly value: string | number;
  readonly previousValue?: string | number;
  readonly icon?: string;
  readonly color?: string;
  readonly trend?: 'up' | 'down' | 'stable';
  readonly format?: 'number' | 'percentage' | 'time' | 'text';
}

// ============================================================================
// 搜尋輸入類型
// ============================================================================

/**
 * 搜尋輸入配置
 */
export interface SearchInputConfig {
  readonly placeholder: string;
  readonly showSuggestions: boolean;
  readonly showHistory: boolean;
  readonly maxSuggestions: number;
  readonly maxHistory: number;
  readonly enableAutoComplete: boolean;
  readonly debounceDelay: number;
  readonly size: ComponentSize;
}

/**
 * 搜尋建議
 */
export interface SearchSuggestion {
  readonly id: string;
  readonly text: string;
  readonly type: 'history' | 'suggestion' | 'location';
  readonly icon?: string;
  readonly metadata?: Record<string, unknown>;
}

// ============================================================================
// 地圖控制器類型
// ============================================================================

/**
 * 地圖控制器配置
 */
export interface MapControlsConfig {
  readonly showZoomControls: boolean;
  readonly showMapTypeControls: boolean;
  readonly showFullscreenControl: boolean;
  readonly showMyLocationControl: boolean;
  readonly showLayerControls: boolean;
  readonly position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  readonly style: 'default' | 'minimal' | 'compact';
}

/**
 * 圖層控制
 */
export interface LayerControl {
  readonly id: string;
  readonly name: string;
  readonly type: 'requirement' | 'intersection' | 'clustering' | 'overlay';
  readonly enabled: boolean;
  readonly visible: boolean;
  readonly opacity: number;
  readonly zIndex: number;
}

// ============================================================================
// 通知系統類型
// ============================================================================

/**
 * 通知類型
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * 通知
 */
export interface Notification {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly duration?: number;
  readonly persistent?: boolean;
  readonly actions?: NotificationAction[];
  readonly timestamp: Date;
}

/**
 * 通知動作
 */
export interface NotificationAction {
  readonly id: string;
  readonly label: string;
  readonly variant: ButtonVariant;
  readonly handler: () => void;
}

// ============================================================================
// 響應式設計類型
// ============================================================================

/**
 * 斷點
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * 響應式配置
 */
export interface ResponsiveConfig {
  readonly breakpoint: Breakpoint;
  readonly panelPosition: ControlPanelConfig['position'];
  readonly panelWidth: number | 'auto';
  readonly showStatistics: boolean;
  readonly compactMode: boolean;
  readonly hideLabels: boolean;
}

// ============================================================================
// 無障礙設計類型
// ============================================================================

/**
 * 無障礙配置
 */
export interface AccessibilityConfig {
  readonly enableKeyboardNavigation: boolean;
  readonly enableScreenReader: boolean;
  readonly enableHighContrast: boolean;
  readonly enableFocusVisible: boolean;
  readonly announceChanges: boolean;
  readonly skipLinks: boolean;
}

// ============================================================================
// UI 狀態管理
// ============================================================================

/**
 * UI 狀態
 */
export interface UIState {
  readonly theme: UITheme;
  readonly controlPanel: ControlPanelState;
  readonly notifications: Notification[];
  readonly loading: Record<string, LoadingState>;
  readonly responsive: ResponsiveConfig;
  readonly accessibility: AccessibilityConfig;
  readonly preferences: UserPreferences;
}

/**
 * 使用者偏好設定
 */
export interface UserPreferences {
  readonly theme: UITheme;
  readonly language: string;
  readonly autoSave: boolean;
  readonly showTutorial: boolean;
  readonly defaultRequirements: RequirementType[];
  readonly mapDefaults: {
    readonly center?: { lat: number; lng: number };
    readonly zoom?: number;
    readonly mapType?: string;
  };
  readonly shortcuts: Record<string, string>;
}