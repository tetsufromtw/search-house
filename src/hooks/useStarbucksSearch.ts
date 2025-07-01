/**
 * Starbucks 專用搜尋 Hook (修復版)
 * 使用穩定的邊界監聽，避免無限重渲染
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Place } from '../services/types';
import { MapBounds, filterLocationsByBounds } from './useMapBoundsListener';

export interface StarbucksLocation extends Place {
  circleId?: string;
}

export interface StarbucksSearchOptions {
  maxPages?: number;
  radius?: number;
  circleRadius?: number;
  autoUpdate?: boolean;
  boundsExpansion?: number;
}

export interface StarbucksSearchState {
  locations: StarbucksLocation[];
  loading: boolean;
  error: string | null;
  searchCount: number;
}

/**
 * Starbucks 搜尋 Hook (修復版)
 */
export function useStarbucksSearch(
  map: google.maps.Map | null,
  bounds: MapBounds | null,
  options: StarbucksSearchOptions = {}
) {
  const {
    maxPages = 3,
    radius = 5000,
    circleRadius = 500,
    autoUpdate = true,
    boundsExpansion = 0.1
  } = options;

  const [state, setState] = useState<StarbucksSearchState>({
    locations: [],
    loading: false,
    error: null,
    searchCount: 0
  });

  // Refs 避免依賴變化
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const lastSearchBoundsRef = useRef<string | null>(null);

  // 生成邊界識別符
  const getBoundsKey = useCallback((bounds: MapBounds): string => {
    return `${Math.round(bounds.center.lat * 1000)}_${Math.round(bounds.center.lng * 1000)}_${bounds.zoom}`;
  }, []);

  // 清理所有圓圈
  const clearCircles = useCallback(() => {
    circlesRef.current.forEach(circle => {
      circle.setMap(null);
    });
    circlesRef.current = [];
  }, []);

  // 創建 Starbucks 圓圈
  const createStarbucksCircle = useCallback((location: StarbucksLocation): google.maps.Circle | null => {
    if (!map) {
      console.log('❌ 地圖未初始化，無法創建圓圈');
      return null;
    }

    if (!location.location || typeof location.location.lat !== 'number' || typeof location.location.lng !== 'number') {
      console.error('❌ 無效的位置資料，無法創建圓圈:', {
        name: location.name,
        location: location.location
      });
      return null;
    }

    console.log(`🔵 創建圓圈 for ${location.name}:`, {
      center: location.location,
      radius: circleRadius
    });

    const circle = new google.maps.Circle({
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.2,
      map,
      center: { lat: location.location.lat, lng: location.location.lng },
      radius: circleRadius
    });

    circle.addListener('click', () => {
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
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
  }, [map, circleRadius]);

  // 更新圓圈顯示
  const updateCircles = useCallback((locations: StarbucksLocation[], currentBounds: MapBounds | null) => {
    console.log('🔄 開始更新圓圈顯示:', {
      總地點數: locations.length,
      有邊界: !!currentBounds,
      有地圖: !!map
    });

    if (!map) {
      console.log('❌ 地圖未初始化，跳過圓圈更新');
      return;
    }

    clearCircles();

    // 將 StarbucksLocation 格式轉換為 filterLocationsByBounds 期望的格式
    const locationsForFiltering = locations.map(loc => ({
      ...loc,
      lat: loc.location?.lat || 0,
      lng: loc.location?.lng || 0
    }));
    
    const visibleLocationsFiltered = currentBounds ? filterLocationsByBounds(locationsForFiltering, currentBounds) : locationsForFiltering;
    
    // 轉換回原始格式
    let visibleLocations = visibleLocationsFiltered.map(filtered => 
      locations.find(original => original.name === filtered.name && 
                                 original.location?.lat === filtered.lat && 
                                 original.location?.lng === filtered.lng)
    ).filter(Boolean) as StarbucksLocation[];
    
    console.log(`📍 篩選後可見地點: ${visibleLocations.length} / ${locations.length}`);
    
    // 如果篩選後沒有可見地點，檢查原因
    if (currentBounds && locations.length > 0 && visibleLocations.length === 0) {
      console.warn('⚠️ 篩選異常：搜尋到地點但都不在可見範圍內');
      console.log('🗺️ 當前地圖邊界:', {
        north: currentBounds.north,
        south: currentBounds.south,
        east: currentBounds.east,
        west: currentBounds.west,
        center: currentBounds.center
      });
      
      console.log('📍 前3個地點位置:', locations.slice(0, 3).map(loc => ({
        name: loc.name,
        lat: loc.location?.lat,
        lng: loc.location?.lng,
        在邊界內: currentBounds ? (
          loc.location?.lat >= currentBounds.south &&
          loc.location?.lat <= currentBounds.north &&
          loc.location?.lng >= currentBounds.west &&
          loc.location?.lng <= currentBounds.east
        ) : false
      })));
      
      // 暫時跳過篩選，顯示所有地點來測試
      console.log('🔧 暫時跳過邊界篩選，顯示所有地點');
      visibleLocations = locations; // 直接使用所有地點
    }

    let successCount = 0;
    visibleLocations.forEach((location, index) => {
      console.log(`🏪 處理第 ${index + 1} 個地點: ${location.name}`);
      const circle = createStarbucksCircle(location);
      if (circle) {
        circlesRef.current.push(circle);
        successCount++;
      }
    });

    console.log(`🔵 成功顯示 ${successCount} / ${visibleLocations.length} 個 Starbucks 圓圈`);
  }, [map, clearCircles, createStarbucksCircle]);

  // 搜尋 Starbucks
  const searchStarbucks = useCallback(async (searchBounds: MapBounds) => {
    if (!searchBounds) return;

    const boundsKey = getBoundsKey(searchBounds);
    
    // 檢查是否需要搜尋
    if (lastSearchBoundsRef.current === boundsKey) {
      return;
    }

    // 取消現有搜尋
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    searchAbortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 使用 Next.js API 代理而不是直接呼叫 Google API
      const params = new URLSearchParams({
        query: 'スターバックス',
        lat: searchBounds.center.lat.toString(),
        lng: searchBounds.center.lng.toString(),
        radius: radius.toString(),
        paging: 'true',
        maxPages: maxPages.toString()
      });

      const fullUrl = `/api/google/places/search?${params.toString()}`;
      
      console.log('🚀 Starbucks 搜尋請求:');
      console.log('📍 URL:', fullUrl);
      console.log('📋 查詢參數:', {
        query: 'スターバックス',
        lat: searchBounds.center.lat,
        lng: searchBounds.center.lng,
        radius: radius,
        paging: 'true',
        maxPages: maxPages,
        boundsKey: getBoundsKey(searchBounds)
      });
      console.log('🌐 完整 URL:', window.location.origin + fullUrl);

      const response = await fetch(fullUrl);
      
      console.log('📥 API 回應狀態:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 錯誤回應:', errorText);
        throw new Error(`API 請求失敗: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📄 API 回應資料:', result);
      
      // 詳細檢查資料結構
      if (result.success && result.data) {
        console.log('🔍 詳細資料結構分析:');
        console.log('- result.data:', Object.keys(result.data));
        console.log('- result.data.places 類型:', Array.isArray(result.data.places) ? 'Array' : typeof result.data.places);
        console.log('- result.data.places 長度:', result.data.places?.length);
        
        if (result.data.places && result.data.places.length > 0) {
          console.log('- 第一個地點結構:', Object.keys(result.data.places[0]));
          console.log('- 第一個地點完整資料:', result.data.places[0]);
          
          // 檢查位置資料
          const firstPlace = result.data.places[0];
          console.log('- 位置資料檢查:');
          console.log('  - location:', firstPlace.location);
          console.log('  - geometry:', firstPlace.geometry);
          console.log('  - lat/lng:', firstPlace.lat, firstPlace.lng);
        }
      }

      if (searchAbortControllerRef.current?.signal.aborted) {
        return;
      }

      if (!result.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error?.message || '搜尋失敗'
        }));
        return;
      }

      const starbucksLocations: StarbucksLocation[] = result.data?.places?.map((place: any, index: number) => {
        console.log(`🏪 處理第 ${index + 1} 個地點:`, {
          原始資料: place,
          id: place.id,
          name: place.name,
          location: place.location,
          geometry: place.geometry
        });

        // 確保 location 格式正確
        let location = place.location;
        if (!location && place.geometry?.location) {
          // 舊版 API 格式
          location = {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          };
          console.log(`🔄 轉換舊版格式位置:`, location);
        } else if (!location) {
          console.error(`❌ 地點 ${place.name} 沒有有效的位置資料`);
          return null;
        }

        const converted = {
          ...place,
          location: location,
          circleId: `starbucks-${place.id || index}`
        };

        console.log(`✅ 轉換後的地點:`, converted);
        return converted;
      }).filter(Boolean) || [];

      console.log(`🎯 總共轉換了 ${starbucksLocations.length} 個有效地點`);

      setState(prev => ({
        ...prev,
        locations: starbucksLocations,
        loading: false,
        searchCount: prev.searchCount + 1
      }));

      lastSearchBoundsRef.current = boundsKey;
      console.log(`☕ 找到 ${starbucksLocations.length} 個 Starbucks 位置`);

      // 立即更新圓圈
      updateCircles(starbucksLocations, searchBounds);

    } catch (error) {
      if (!searchAbortControllerRef.current?.signal.aborted) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '搜尋發生未知錯誤'
        }));
        console.error('Starbucks 搜尋錯誤:', error);
      }
    }
  }, [getBoundsKey, radius, maxPages, updateCircles]);

  // 監聽邊界變化的穩定版本
  useEffect(() => {
    if (!bounds || !autoUpdate) return;

    const boundsKey = getBoundsKey(bounds);
    
    // 防抖動
    const timeoutId = setTimeout(() => {
      searchStarbucks(bounds);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [bounds ? getBoundsKey(bounds) : null, autoUpdate, searchStarbucks]);

  // 當位置資料變化時，更新圓圈 (不依賴 bounds，避免循環)
  useEffect(() => {
    if (state.locations.length > 0 && bounds) {
      updateCircles(state.locations, bounds);
    }
  }, [state.locations.length, bounds ? getBoundsKey(bounds) : null, updateCircles]);

  // 清理函數
  useEffect(() => {
    return () => {
      clearCircles();
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, [clearCircles]);

  // 手動搜尋
  const manualSearch = useCallback(() => {
    if (bounds) {
      lastSearchBoundsRef.current = null; // 強制重新搜尋
      searchStarbucks(bounds);
    }
  }, [bounds, searchStarbucks]);

  // 切換圓圈顯示
  const toggleCircles = useCallback((show: boolean) => {
    circlesRef.current.forEach(circle => {
      circle.setVisible(show);
    });
  }, []);

  // 取得可見的 Starbucks 數量
  const getVisibleCount = useCallback((): number => {
    if (!bounds) return state.locations.length;
    
    // 將 StarbucksLocation 格式轉換為 filterLocationsByBounds 期望的格式
    const locationsForFiltering = state.locations.map(loc => ({
      ...loc,
      lat: loc.location?.lat || 0,
      lng: loc.location?.lng || 0
    }));
    
    return filterLocationsByBounds(locationsForFiltering, bounds).length;
  }, [state.locations, bounds ? getBoundsKey(bounds) : null]);

  return {
    // 狀態
    locations: state.locations,
    loading: state.loading,
    error: state.error,
    searchCount: state.searchCount,
    
    // 計算屬性
    visibleCount: getVisibleCount(),
    totalCount: state.locations.length,
    
    // 操作函數
    manualSearch,
    toggleCircles,
    clearResults: () => {
      setState(prev => ({ ...prev, locations: [], error: null }));
      clearCircles();
    },
    
    // 圓圈管理
    circles: circlesRef.current
  };
}

/**
 * Starbucks 搜尋的輔助工具
 */
export const StarbucksSearchUtils = {
  sortByDistance: (locations: StarbucksLocation[], center: { lat: number; lng: number }): StarbucksLocation[] => {
    return [...locations].sort((a, b) => {
      const distA = getDistance(center, a.location);
      const distB = getDistance(center, b.location);
      return distA - distB;
    });
  },

  filterByRadius: (locations: StarbucksLocation[], center: { lat: number; lng: number }, radiusKm: number): StarbucksLocation[] => {
    return locations.filter(location => {
      const distance = getDistance(center, location.location);
      return distance <= radiusKm;
    });
  }
};

function getDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}