/**
 * 多需求地點搜尋 Hook
 * 支援同時搜尋多種類型的地點，並在地圖上顯示不同顏色的圓圈
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapBounds, filterLocationsByBounds } from './useMapBoundsListener';
import { 
  MultiLocationSearchState, 
  MultiLocationSearchOptions, 
  SearchRequirement,
  RequirementType,
  RequirementLocation,
  SearchStats,
  RequirementAction
} from '../types/multiLocationSearch';
import { 
  SEARCH_REQUIREMENTS, 
  createDefaultRequirement, 
  DEFAULT_SEARCH_OPTIONS,
  ColorUtils
} from '../config/searchRequirements';

/**
 * 多需求地點搜尋 Hook
 */
export function useMultiLocationSearch(
  map: google.maps.Map | null,
  bounds: MapBounds | null,
  options: MultiLocationSearchOptions = {}
) {
  const {
    maxPages = DEFAULT_SEARCH_OPTIONS.maxPages,
    radius = DEFAULT_SEARCH_OPTIONS.radius,
    circleRadius = DEFAULT_SEARCH_OPTIONS.circleRadius,
    autoUpdate = DEFAULT_SEARCH_OPTIONS.autoUpdate,
    boundsExpansion = DEFAULT_SEARCH_OPTIONS.boundsExpansion,
    debounceDelay = DEFAULT_SEARCH_OPTIONS.debounceDelay,
    parallelSearch = DEFAULT_SEARCH_OPTIONS.parallelSearch
  } = options;

  // 初始化狀態
  const [state, setState] = useState<MultiLocationSearchState>(() => {
    const requirements: Record<RequirementType, SearchRequirement> = {} as any;
    
    Object.values(SEARCH_REQUIREMENTS).forEach(config => {
      requirements[config.id] = createDefaultRequirement(config);
    });

    return {
      requirements,
      totalSearchCount: 0,
      isAnyLoading: false,
      errorCount: 0
    };
  });

  // Refs 避免依賴變化
  const circlesRef = useRef<Map<string, google.maps.Circle>>(new Map());
  const searchAbortControllersRef = useRef<Map<RequirementType, AbortController>>(new Map());
  const lastSearchBoundsRef = useRef<string | null>(null);

  // 生成邊界識別符
  const getBoundsKey = useCallback((bounds: MapBounds): string => {
    return `${Math.round(bounds.center.lat * 1000)}_${Math.round(bounds.center.lng * 1000)}_${bounds.zoom}`;
  }, []);

  // 需求狀態管理
  const updateRequirement = useCallback((action: RequirementAction) => {
    setState(prev => {
      const newState = { ...prev };
      
      switch (action.type) {
        case 'TOGGLE_ENABLED':
          newState.requirements = {
            ...prev.requirements,
            [action.requirementId]: {
              ...prev.requirements[action.requirementId],
              enabled: !prev.requirements[action.requirementId].enabled
            }
          };
          break;
          
        case 'TOGGLE_VISIBLE':
          newState.requirements = {
            ...prev.requirements,
            [action.requirementId]: {
              ...prev.requirements[action.requirementId],
              visible: !prev.requirements[action.requirementId].visible
            }
          };
          break;
          
        case 'SET_LOADING':
          newState.requirements = {
            ...prev.requirements,
            [action.requirementId]: {
              ...prev.requirements[action.requirementId],
              loading: action.loading
            }
          };
          break;
          
        case 'SET_LOCATIONS':
          newState.requirements = {
            ...prev.requirements,
            [action.requirementId]: {
              ...prev.requirements[action.requirementId],
              locations: action.locations,
              loading: false,
              lastSearchTime: Date.now()
            }
          };
          break;
          
        case 'SET_ERROR':
          newState.requirements = {
            ...prev.requirements,
            [action.requirementId]: {
              ...prev.requirements[action.requirementId],
              error: action.error,
              loading: false
            }
          };
          break;
          
        case 'CLEAR_ALL_LOCATIONS':
          Object.keys(newState.requirements).forEach(key => {
            const reqKey = key as RequirementType;
            newState.requirements[reqKey] = {
              ...newState.requirements[reqKey],
              locations: [],
              error: null
            };
          });
          break;
          
        case 'RESET_REQUIREMENT':
          newState.requirements = {
            ...prev.requirements,
            [action.requirementId]: createDefaultRequirement(SEARCH_REQUIREMENTS[action.requirementId])
          };
          break;
      }

      // 更新統計資訊
      newState.isAnyLoading = Object.values(newState.requirements).some(req => req.loading);
      newState.errorCount = Object.values(newState.requirements).filter(req => req.error).length;

      return newState;
    });
  }, []);

  // 清理所有圓圈
  const clearAllCircles = useCallback(() => {
    circlesRef.current.forEach(circle => {
      circle.setMap(null);
    });
    circlesRef.current.clear();
  }, []);

  // 清理特定需求的圓圈
  const clearRequirementCircles = useCallback((requirementId: RequirementType) => {
    const circlesToRemove: string[] = [];
    
    circlesRef.current.forEach((circle, circleId) => {
      if (circleId.startsWith(`${requirementId}-`)) {
        circle.setMap(null);
        circlesToRemove.push(circleId);
      }
    });
    
    circlesToRemove.forEach(circleId => {
      circlesRef.current.delete(circleId);
    });
  }, []);

  // 創建單一需求的圓圈
  const createRequirementCircle = useCallback((
    location: RequirementLocation, 
    requirementId: RequirementType
  ): google.maps.Circle | null => {
    if (!map) {
      console.log(`❌ 地圖未初始化，無法創建 ${requirementId} 圓圈`);
      return null;
    }

    if (!location.location || typeof location.location.lat !== 'number' || typeof location.location.lng !== 'number') {
      console.error(`❌ ${requirementId} 地點 ${location.name} 無效的位置資料:`, location.location);
      return null;
    }

    const requirement = state.requirements[requirementId];
    const circleStyle = ColorUtils.getCircleStyle(requirementId);
    
    console.log(`🔵 創建 ${requirement.displayName} 圓圈: ${location.name}`);

    const circle = new google.maps.Circle({
      ...circleStyle,
      map,
      center: { lat: location.location.lat, lng: location.location.lng },
      radius: circleRadius
    });

    // 點擊事件
    circle.addListener('click', () => {
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 12px; height: 12px; background-color: ${circleStyle.fillColor}; border-radius: 50%; margin-right: 8px;"></div>
              <span style="font-weight: bold; color: #1f2937;">${requirement.displayName}</span>
            </div>
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">${location.name}</h4>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${location.address || '地址未提供'}</p>
            ${location.rating ? `<p style="margin: 0; color: #f59e0b; font-size: 14px;">⭐ ${location.rating}</p>` : ''}
          </div>
        `,
        position: { lat: location.location.lat, lng: location.location.lng }
      });
      
      infoWindow.open(map);
    });

    return circle;
  }, [map, circleRadius, state.requirements]);

  // 更新單一需求的圓圈顯示
  const updateRequirementCircles = useCallback((
    requirementId: RequirementType, 
    locations: RequirementLocation[], 
    currentBounds: MapBounds | null
  ) => {
    const requirement = state.requirements[requirementId];
    
    if (!requirement.enabled || !requirement.visible) {
      clearRequirementCircles(requirementId);
      return;
    }

    console.log(`🔄 更新 ${requirement.displayName} 圓圈:`, {
      地點數: locations.length,
      有邊界: !!currentBounds,
      有地圖: !!map
    });

    if (!map) {
      console.log(`❌ 地圖未初始化，跳過 ${requirement.displayName} 圓圈更新`);
      return;
    }

    // 清理現有圓圈
    clearRequirementCircles(requirementId);

    // 邊界篩選
    const locationsForFiltering = locations.map(loc => ({
      ...loc,
      lat: loc.location?.lat || 0,
      lng: loc.location?.lng || 0
    }));
    
    const visibleLocationsFiltered = currentBounds 
      ? filterLocationsByBounds(locationsForFiltering, currentBounds) 
      : locationsForFiltering;
    
    const visibleLocations = visibleLocationsFiltered.map(filtered => 
      locations.find(original => 
        original.name === filtered.name && 
        original.location?.lat === filtered.lat && 
        original.location?.lng === filtered.lng
      )
    ).filter(Boolean) as RequirementLocation[];

    console.log(`📍 ${requirement.displayName} 篩選後可見: ${visibleLocations.length} / ${locations.length}`);

    // 創建圓圈
    let successCount = 0;
    visibleLocations.forEach((location, index) => {
      const circleId = `${requirementId}-${location.id || index}`;
      const circle = createRequirementCircle(location, requirementId);
      
      if (circle) {
        circlesRef.current.set(circleId, circle);
        successCount++;
      }
    });

    console.log(`🔵 ${requirement.displayName} 成功顯示: ${successCount} / ${visibleLocations.length} 個圓圈`);
  }, [map, state.requirements, clearRequirementCircles, createRequirementCircle]);

  // 更新所有圓圈
  const updateAllCircles = useCallback((currentBounds: MapBounds | null) => {
    Object.entries(state.requirements).forEach(([requirementId, requirement]) => {
      updateRequirementCircles(
        requirementId as RequirementType, 
        requirement.locations, 
        currentBounds
      );
    });
  }, [state.requirements, updateRequirementCircles]);

  // 穩定的搜尋需求引用
  const requirementsRef = useRef(state.requirements);
  requirementsRef.current = state.requirements;

  // 搜尋單一需求
  const searchRequirement = useCallback(async (
    requirementId: RequirementType, 
    searchBounds: MapBounds
  ) => {
    const requirement = requirementsRef.current[requirementId];
    
    if (!requirement.enabled) {
      console.log(`⏭️ ${requirement.displayName} 已停用，跳過搜尋`);
      return;
    }

    // 取消現有搜尋
    const currentController = searchAbortControllersRef.current.get(requirementId);
    if (currentController) {
      currentController.abort();
    }
    
    const newController = new AbortController();
    searchAbortControllersRef.current.set(requirementId, newController);

    updateRequirement({ type: 'SET_LOADING', requirementId, loading: true });

    try {
      const params = new URLSearchParams({
        query: requirement.query,
        lat: searchBounds.center.lat.toString(),
        lng: searchBounds.center.lng.toString(),
        radius: radius.toString(),
        paging: 'true',
        maxPages: maxPages.toString()
      });

      const response = await fetch(`/api/google/places/search?${params.toString()}`, {
        signal: newController.signal
      });

      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`);
      }

      const result = await response.json();

      if (newController.signal.aborted) return;

      if (!result.success) {
        updateRequirement({ 
          type: 'SET_ERROR', 
          requirementId, 
          error: result.error?.message || '搜尋失敗' 
        });
        return;
      }

      const locations: RequirementLocation[] = result.data?.places?.map((place: any, index: number) => {
        let location = place.location;
        if (!location && place.geometry?.location) {
          location = {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          };
        }

        return {
          ...place,
          location,
          requirementId,
          circleId: `${requirementId}-${place.id || index}`
        };
      }).filter((loc: any) => loc.location) || [];

      updateRequirement({ type: 'SET_LOCATIONS', requirementId, locations });
      
      console.log(`☕ ${requirement.displayName} 找到 ${locations.length} 個地點`);

      // 立即更新圓圈
      updateRequirementCircles(requirementId, locations, searchBounds);

    } catch (error) {
      if (!newController.signal.aborted) {
        updateRequirement({ 
          type: 'SET_ERROR', 
          requirementId, 
          error: error instanceof Error ? error.message : '搜尋發生未知錯誤' 
        });
        console.error(`${requirement.displayName} 搜尋錯誤:`, error);
      }
    }
  }, [radius, maxPages, updateRequirement, updateRequirementCircles]);

  // 穩定的啟用需求列表
  const enabledRequirements = useMemo(() => {
    return Object.keys(state.requirements).filter(
      key => state.requirements[key as RequirementType].enabled
    ) as RequirementType[];
  }, [state.requirements]);

  // 搜尋所有啟用的需求
  const searchAllRequirements = useCallback(async (searchBounds: MapBounds) => {
    if (!searchBounds) return;

    const boundsKey = getBoundsKey(searchBounds);
    
    // 檢查是否需要搜尋
    if (lastSearchBoundsRef.current === boundsKey) {
      return;
    }

    setState(prev => ({ ...prev, totalSearchCount: prev.totalSearchCount + 1 }));

    console.log('🚀 開始多需求搜尋:', {
      邊界: boundsKey,
      啟用需求: enabledRequirements.map(id => requirementsRef.current[id].displayName),
      並行搜尋: parallelSearch
    });

    if (parallelSearch) {
      // 並行搜尋
      await Promise.allSettled(
        enabledRequirements.map(requirementId => 
          searchRequirement(requirementId, searchBounds)
        )
      );
    } else {
      // 序列搜尋
      for (const requirementId of enabledRequirements) {
        await searchRequirement(requirementId, searchBounds);
      }
    }

    lastSearchBoundsRef.current = boundsKey;
  }, [getBoundsKey, enabledRequirements, parallelSearch, searchRequirement]);

  // 穩定的邊界識別符
  const stableBoundsKey = useMemo(() => {
    return bounds ? getBoundsKey(bounds) : null;
  }, [bounds, getBoundsKey]);

  // 監聽邊界變化
  useEffect(() => {
    if (!bounds || !autoUpdate || !stableBoundsKey) return;

    const timeoutId = setTimeout(() => {
      searchAllRequirements(bounds);
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [stableBoundsKey, autoUpdate, debounceDelay, bounds, searchAllRequirements]);

  // 穩定的可見性狀態
  const visibilityState = useMemo(() => ({
    starbucks: state.requirements.starbucks.visible,
    gym: state.requirements.gym.visible,
    convenience: state.requirements.convenience.visible
  }), [state.requirements.starbucks.visible, state.requirements.gym.visible, state.requirements.convenience.visible]);

  // 當需求狀態變化時更新圓圈
  useEffect(() => {
    if (bounds) {
      updateAllCircles(bounds);
    }
  }, [
    visibilityState,
    stableBoundsKey, 
    updateAllCircles,
    bounds
  ]);

  // 清理函數
  useEffect(() => {
    return () => {
      clearAllCircles();
      searchAbortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      searchAbortControllersRef.current.clear();
    };
  }, [clearAllCircles]);

  // 計算統計資訊
  const getStats = useCallback((): SearchStats => {
    const totalLocations = Object.values(state.requirements)
      .reduce((sum, req) => sum + req.locations.length, 0);

    let visibleLocations = 0;
    const locationsByRequirement: Record<RequirementType, number> = {} as any;
    const visibleByRequirement: Record<RequirementType, number> = {} as any;

    Object.entries(state.requirements).forEach(([key, requirement]) => {
      const requirementId = key as RequirementType;
      locationsByRequirement[requirementId] = requirement.locations.length;
      
      if (bounds && requirement.enabled && requirement.visible) {
        const locationsForFiltering = requirement.locations.map(loc => ({
          ...loc,
          lat: loc.location?.lat || 0,
          lng: loc.location?.lng || 0
        }));
        
        const visible = filterLocationsByBounds(locationsForFiltering, bounds).length;
        visibleByRequirement[requirementId] = visible;
        visibleLocations += visible;
      } else {
        visibleByRequirement[requirementId] = 0;
      }
    });

    return {
      totalLocations,
      visibleLocations,
      locationsByRequirement,
      visibleByRequirement
    };
  }, [state.requirements, bounds]);

  // 公開的操作函數
  const toggleRequirement = useCallback((requirementId: RequirementType) => {
    updateRequirement({ type: 'TOGGLE_ENABLED', requirementId });
  }, [updateRequirement]);

  const toggleVisibility = useCallback((requirementId: RequirementType) => {
    updateRequirement({ type: 'TOGGLE_VISIBLE', requirementId });
  }, [updateRequirement]);

  const manualSearch = useCallback(() => {
    if (bounds) {
      lastSearchBoundsRef.current = null; // 強制重新搜尋
      searchAllRequirements(bounds);
    }
  }, [bounds, searchAllRequirements]);

  const clearAll = useCallback(() => {
    updateRequirement({ type: 'CLEAR_ALL_LOCATIONS' });
    clearAllCircles();
  }, [updateRequirement, clearAllCircles]);

  return {
    // 狀態
    state,
    stats: getStats(),
    
    // 個別需求狀態
    requirements: state.requirements,
    
    // 操作函數
    toggleRequirement,
    toggleVisibility,
    manualSearch,
    clearAll,
    
    // 圓圈管理
    circles: Array.from(circlesRef.current.values()),
    updateAllCircles: () => updateAllCircles(bounds)
  };
}