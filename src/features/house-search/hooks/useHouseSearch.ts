/**
 * 房屋搜尋主要業務邏輯 Hook
 * 管理完整的搜尋流程和狀態
 */

import { useReducer, useCallback, useEffect, useRef } from 'react';
import { 
  HouseSearchState, 
  SearchAction, 
  SearchRequirement, 
  RequirementState,
  IntersectionArea,
  Property,
  UIState,
  SearchError,
  LatLng
} from '../types';
import { CONFIG } from '../config';
import { SimpleHouseSearchService } from '../services/SimpleHouseSearchService';

// 初始狀態
const initialState: HouseSearchState = {
  requirements: CONFIG.DEFAULT_REQUIREMENTS.map(req => ({
    requirement: req,
    loading: false,
    error: null,
  })),
  intersectionAreas: [],
  properties: [],
  ui: {
    isSearching: false,
    isLoading: false,
    showFilters: false,
    selectedProperty: null,
    mapCenter: CONFIG.MAP.DEFAULT_CENTER,
    mapZoom: CONFIG.MAP.DEFAULT_ZOOM,
  },
  errors: {},
  config: CONFIG.SEARCH,
};

// 狀態 Reducer
function houseSearchReducer(state: HouseSearchState, action: SearchAction): HouseSearchState {
  switch (action.type) {
    case 'SET_REQUIREMENTS':
      return { ...state, requirements: action.payload };
    
    case 'UPDATE_REQUIREMENT':
      return {
        ...state,
        requirements: state.requirements.map(req =>
          req.requirement.id === action.payload.id
            ? { ...req, requirement: { ...req.requirement, ...action.payload.requirement } }
            : req
        ),
      };
    
    case 'SET_REQUIREMENT_LOADING':
      return {
        ...state,
        requirements: state.requirements.map(req =>
          req.requirement.id === action.payload.id
            ? { ...req, loading: action.payload.loading }
            : req
        ),
      };
    
    case 'SET_REQUIREMENT_ERROR':
      return {
        ...state,
        requirements: state.requirements.map(req =>
          req.requirement.id === action.payload.id
            ? { ...req, error: action.payload.error }
            : req
        ),
      };
    
    case 'SET_INTERSECTION_AREAS':
      return { ...state, intersectionAreas: action.payload };
    
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    
    case 'SET_UI_STATE':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.payload.key]: action.payload.error } };
    
    case 'CLEAR_ERROR':
      const { [action.payload.key]: _, ...remainingErrors } = state.errors;
      return { ...state, errors: remainingErrors };
    
    case 'RESET_SEARCH':
      return {
        ...state,
        intersectionAreas: [],
        properties: [],
        ui: { ...state.ui, isSearching: false },
        errors: {},
      };
    
    case 'SET_SEARCHING':
      return { ...state, ui: { ...state.ui, isSearching: action.payload } };
    
    default:
      return state;
  }
}

// 主要 Hook
export const useHouseSearch = () => {
  const [state, dispatch] = useReducer(houseSearchReducer, initialState);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const houseSearchServiceRef = useRef<SimpleHouseSearchService>(new SimpleHouseSearchService());

  // 更新需求
  const updateRequirement = useCallback((id: string, updates: Partial<SearchRequirement>) => {
    dispatch({
      type: 'UPDATE_REQUIREMENT',
      payload: { id, requirement: updates },
    });
  }, []);

  // 切換需求啟用狀態
  const toggleRequirement = useCallback((id: string) => {
    const requirement = state.requirements.find(req => req.requirement.id === id);
    if (requirement) {
      updateRequirement(id, { enabled: !requirement.requirement.enabled });
    }
  }, [state.requirements, updateRequirement]);

  // 搜尋地點
  const searchLocations = useCallback(async (requirementId: string, query: string) => {
    if (!query || query.length < CONFIG.VALIDATION.MIN_QUERY_LENGTH) {
      return;
    }

    dispatch({ type: 'SET_REQUIREMENT_LOADING', payload: { id: requirementId, loading: true } });
    dispatch({ type: 'SET_REQUIREMENT_ERROR', payload: { id: requirementId, error: null } });

    try {
      const locations = await houseSearchServiceRef.current.searchLocations(
        query,
        state.ui.mapCenter,
        CONFIG.SEARCH.searchRadius
      );

      updateRequirement(requirementId, { locations });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '搜尋失敗';
      dispatch({ 
        type: 'SET_REQUIREMENT_ERROR', 
        payload: { id: requirementId, error: errorMessage } 
      });
    } finally {
      dispatch({ type: 'SET_REQUIREMENT_LOADING', payload: { id: requirementId, loading: false } });
    }
  }, [state.ui.mapCenter, updateRequirement]);

  // 防抖搜尋
  const debouncedSearchLocations = useCallback((requirementId: string, query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchLocations(requirementId, query);
    }, CONFIG.SEARCH.debounceMs);
  }, [searchLocations]);

  // 完整搜尋
  const performSearch = useCallback(async () => {

    const enabledRequirements = state.requirements
      .filter(req => req.requirement.enabled && req.requirement.locations.length > 0)
      .map(req => req.requirement);

    if (enabledRequirements.length < CONFIG.VALIDATION.MIN_REQUIREMENTS) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          key: 'search',
          error: {
            code: 'INSUFFICIENT_REQUIREMENTS',
            message: `至少需要 ${CONFIG.VALIDATION.MIN_REQUIREMENTS} 個需求`,
          },
        },
      });
      return;
    }

    dispatch({ type: 'SET_SEARCHING', payload: true });
    dispatch({ type: 'CLEAR_ERROR', payload: { key: 'search' } });

    try {
      const result = await houseSearchServiceRef.current.searchComplete(enabledRequirements);
      
      dispatch({ type: 'SET_INTERSECTION_AREAS', payload: result.intersectionAreas });
      dispatch({ type: 'SET_PROPERTIES', payload: result.properties });
      
      // 更新地圖中心
      if (result.metadata.queryCenter) {
        dispatch({
          type: 'SET_UI_STATE',
          payload: { mapCenter: result.metadata.queryCenter },
        });
      }
      
      console.log('🎉 搜尋完成:', {
        intersections: result.intersectionAreas.length,
        properties: result.properties.length,
        searchTime: result.metadata.searchTime,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '搜尋失敗';
      dispatch({
        type: 'SET_ERROR',
        payload: {
          key: 'search',
          error: {
            code: 'SEARCH_FAILED',
            message: errorMessage,
          },
        },
      });
    } finally {
      dispatch({ type: 'SET_SEARCHING', payload: false });
    }
  }, [state.requirements]);

  // 清除搜尋
  const clearSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
    
    // 重置需求
    dispatch({
      type: 'SET_REQUIREMENTS',
      payload: CONFIG.DEFAULT_REQUIREMENTS.map(req => ({
        requirement: req,
        loading: false,
        error: null,
      })),
    });
    
    console.log('🧹 清除搜尋結果');
  }, []);

  // 設置 UI 狀態
  const setUIState = useCallback((updates: Partial<UIState>) => {
    dispatch({ type: 'SET_UI_STATE', payload: updates });
  }, []);

  // 選擇房源
  const selectProperty = useCallback((property: Property | null) => {
    dispatch({
      type: 'SET_UI_STATE',
      payload: { selectedProperty: property },
    });
  }, []);

  // 設置地圖中心
  const setMapCenter = useCallback((center: LatLng, zoom?: number) => {
    dispatch({
      type: 'SET_UI_STATE',
      payload: { 
        mapCenter: center,
        ...(zoom !== undefined && { mapZoom: zoom })
      },
    });
  }, []);

  // 錯誤處理
  const clearError = useCallback((key: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: { key } });
  }, []);

  // 自動搜尋效果
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 驗證函數
  const canSearch = useCallback(() => {
    const enabledRequirements = state.requirements.filter(
      req => req.requirement.enabled && req.requirement.locations.length > 0
    );
    return enabledRequirements.length >= CONFIG.VALIDATION.MIN_REQUIREMENTS;
  }, [state.requirements]);

  return {
    // 狀態
    state,
    
    // 需求相關
    updateRequirement,
    toggleRequirement,
    searchLocations, // 直接版本，不防抖
    debouncedSearchLocations, // 防抖版本（如果需要的話）
    
    // 搜尋相關
    performSearch,
    clearSearch,
    canSearch: canSearch(),
    
    // UI 相關
    setUIState,
    selectProperty,
    setMapCenter,
    
    // 錯誤處理
    clearError,
    
    // 便捷訪問
    requirements: state.requirements,
    intersectionAreas: state.intersectionAreas,
    properties: state.properties,
    ui: state.ui,
    errors: state.errors,
    isSearching: state.ui.isSearching,
  };
};