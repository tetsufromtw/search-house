/**
 * 地圖邊界監聽器 Hook
 * 監聽地圖拖拉、縮放等變化事件，提供防抖動的邊界更新
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

export interface MapBoundsListenerOptions {
  debounceDelay?: number; // 防抖動延遲時間(ms)
  onBoundsChanged?: (bounds: MapBounds) => void;
  onZoomChanged?: (zoom: number) => void;
  onIdle?: () => void;
}

/**
 * 地圖邊界監聽器 Hook
 */
export function useMapBoundsListener(
  map: google.maps.Map | null,
  options: MapBoundsListenerOptions = {}
) {
  const {
    debounceDelay = 300,
    onBoundsChanged,
    onZoomChanged,
    onIdle
  } = options;

  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [isIdle, setIsIdle] = useState(true);
  
  // 防抖動計時器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  
  // 使用 ref 存儲回調函數，避免依賴變化
  const callbacksRef = useRef({
    onBoundsChanged,
    onZoomChanged,
    onIdle
  });

  // 更新回調函數 ref
  useEffect(() => {
    callbacksRef.current = {
      onBoundsChanged,
      onZoomChanged,
      onIdle
    };
  }, [onBoundsChanged, onZoomChanged, onIdle]);

  // 從 Google Map 提取邊界資訊
  const extractBoundsFromMap = useCallback((googleMap: google.maps.Map): MapBounds | null => {
    try {
      const mapBounds = googleMap.getBounds();
      const center = googleMap.getCenter();
      const zoom = googleMap.getZoom();

      if (!mapBounds || !center || zoom === undefined) {
        return null;
      }

      const ne = mapBounds.getNorthEast();
      const sw = mapBounds.getSouthWest();

      return {
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
        center: {
          lat: center.lat(),
          lng: center.lng()
        },
        zoom
      };
    } catch (error) {
      console.error('提取地圖邊界失敗:', error);
      return null;
    }
  }, []);

  // 防抖動邊界更新
  const debouncedBoundsUpdate = useCallback((newBounds: MapBounds) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setBounds(prevBounds => {
        // 只有在邊界真的有變化時才更新
        if (!prevBounds || 
            Math.abs(prevBounds.center.lat - newBounds.center.lat) > 0.0001 ||
            Math.abs(prevBounds.center.lng - newBounds.center.lng) > 0.0001 ||
            prevBounds.zoom !== newBounds.zoom) {
          callbacksRef.current.onBoundsChanged?.(newBounds);
          return newBounds;
        }
        return prevBounds;
      });
    }, debounceDelay);
  }, [debounceDelay]);


  // 設置地圖監聽器
  useEffect(() => {
    if (!map) return;

    // 清理現有監聽器
    listenersRef.current.forEach(listener => {
      google.maps.event.removeListener(listener);
    });
    listenersRef.current = [];

    // 邊界變化處理器 (直接定義避免依賴問題)
    const handleBoundsChangedLocal = () => {
      if (!map) return;
      const newBounds = extractBoundsFromMap(map);
      if (newBounds) {
        setIsIdle(false);
        debouncedBoundsUpdate(newBounds);
      }
    };

    // 縮放變化處理器
    const handleZoomChangedLocal = () => {
      if (!map) return;
      const zoom = map.getZoom();
      if (zoom !== undefined) {
        callbacksRef.current.onZoomChanged?.(zoom);
      }
    };

    // 地圖靜止處理器
    const handleIdleLocal = () => {
      setIsIdle(true);
      callbacksRef.current.onIdle?.();
    };

    // 添加新監聽器
    const boundsListener = map.addListener('bounds_changed', handleBoundsChangedLocal);
    const zoomListener = map.addListener('zoom_changed', handleZoomChangedLocal);
    const idleListener = map.addListener('idle', handleIdleLocal);

    listenersRef.current = [boundsListener, zoomListener, idleListener];

    // 初始化邊界
    const initialBounds = extractBoundsFromMap(map);
    if (initialBounds) {
      setBounds(initialBounds);
    }

    // 清理函數
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      listenersRef.current.forEach(listener => {
        google.maps.event.removeListener(listener);
      });
      listenersRef.current = [];
    };
  }, [map, extractBoundsFromMap, debouncedBoundsUpdate]);

  // 手動觸發邊界更新
  const forceUpdateBounds = useCallback(() => {
    if (!map) return;

    const newBounds = extractBoundsFromMap(map);
    if (newBounds) {
      setBounds(newBounds);
      onBoundsChanged?.(newBounds);
    }
  }, [map, extractBoundsFromMap, onBoundsChanged]);

  // 檢查位置是否在邊界內
  const isLocationInBounds = useCallback((lat: number, lng: number): boolean => {
    if (!bounds) return false;

    return lat >= bounds.south &&
           lat <= bounds.north &&
           lng >= bounds.west &&
           lng <= bounds.east;
  }, [bounds]);

  // 計算邊界中心與指定點的距離（公里）
  const getDistanceFromCenter = useCallback((lat: number, lng: number): number => {
    if (!bounds) return Infinity;

    const R = 6371; // 地球半徑（公里）
    const dLat = (lat - bounds.center.lat) * Math.PI / 180;
    const dLng = (lng - bounds.center.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(bounds.center.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, [bounds]);

  return {
    bounds,
    isIdle,
    forceUpdateBounds,
    isLocationInBounds,
    getDistanceFromCenter
  };
}

/**
 * 邊界內位置篩選工具函數
 */
export function filterLocationsByBounds<T extends { lat: number; lng: number }>(
  locations: T[],
  bounds: MapBounds | null
): T[] {
  if (!bounds) return locations;

  return locations.filter(location =>
    location.lat >= bounds.south &&
    location.lat <= bounds.north &&
    location.lng >= bounds.west &&
    location.lng <= bounds.east
  );
}

/**
 * 邊界擴展工具函數
 * 用於搜尋時擴展邊界範圍，確保邊緣地點不會遺漏
 */
export function expandBounds(bounds: MapBounds, expansionRatio: number = 0.1): MapBounds {
  const latExpansion = (bounds.north - bounds.south) * expansionRatio;
  const lngExpansion = (bounds.east - bounds.west) * expansionRatio;

  return {
    ...bounds,
    north: bounds.north + latExpansion,
    south: bounds.south - latExpansion,
    east: bounds.east + lngExpansion,
    west: bounds.west - lngExpansion
  };
}