/**
 * 地圖圓圈管理 Hook
 * 整合 CircleManager 和 YamanoteCircleService 到 React 組件中
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { CircleManager } from '@/services/map/CircleManager';
import { YamanoteCircleService, YamanoteCircleOptions } from '@/services/map/YamanoteCircleService';

interface UseMapCirclesOptions {
  autoInitialize?: boolean;
  defaultRadius?: number;
  showYamanoteOnLoad?: boolean;
  yamanoteOptions?: YamanoteCircleOptions;
}

interface UseMapCirclesReturn {
  // 狀態
  isInitialized: boolean;
  visibleStationCount: number;
  
  // 山手線車站控制
  showYamanoteStations: (options?: YamanoteCircleOptions) => void;
  hideYamanoteStations: () => void;
  showStation: (stationId: string, radius?: number) => boolean;
  hideStation: (stationId: string) => void;
  toggleStation: (stationId: string, radius?: number) => boolean;
  
  // 圓圈管理
  clearAllCircles: () => void;
  updateRadius: (radius: number) => void;
  
  // 查詢方法
  isStationVisible: (stationId: string) => boolean;
  getCircleCount: () => number;
  
  // 服務實例（進階使用）
  circleManager: CircleManager | null;
  yamanoteService: YamanoteCircleService | null;
}

export function useMapCircles(options: UseMapCirclesOptions = {}): UseMapCirclesReturn {
  const {
    autoInitialize = true,
    defaultRadius = 500,
    showYamanoteOnLoad = false,
    yamanoteOptions = {}
  } = options;

  // 狀態
  const [isInitialized, setIsInitialized] = useState(false);
  const [visibleStationCount, setVisibleStationCount] = useState(0);

  // Refs
  const map = useMap();
  const circleManagerRef = useRef<CircleManager | null>(null);
  const yamanoteServiceRef = useRef<YamanoteCircleService | null>(null);
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // 初始化服務
  const initializeServices = useCallback(() => {
    if (!map || isInitialized) return;

    try {
      // 創建 CircleManager
      circleManagerRef.current = new CircleManager();
      circleManagerRef.current.setMap(map);

      // 創建 YamanoteCircleService
      yamanoteServiceRef.current = new YamanoteCircleService(circleManagerRef.current);

      // 監聽地圖縮放變化
      zoomListenerRef.current = map.addListener('zoom_changed', () => {
        const zoom = map.getZoom() || 13;
        yamanoteServiceRef.current?.handleZoomChange(zoom);
      });

      setIsInitialized(true);
      console.log('🗺️ MapCircles 服務初始化完成');

      // 自動顯示山手線車站
      if (showYamanoteOnLoad) {
        setTimeout(() => {
          showYamanoteStations({ radius: defaultRadius, ...yamanoteOptions });
        }, 100);
      }

    } catch (error) {
      console.error('MapCircles 初始化失敗:', error);
    }
  }, [map, isInitialized, showYamanoteOnLoad, defaultRadius, yamanoteOptions]);

  // 山手線車站控制方法
  const showYamanoteStations = useCallback((options?: YamanoteCircleOptions) => {
    if (!yamanoteServiceRef.current) {
      console.warn('YamanoteCircleService 未初始化');
      return;
    }

    yamanoteServiceRef.current.showYamanoteStations(options);
    setVisibleStationCount(yamanoteServiceRef.current.getVisibleStationCount());
  }, []);

  const hideYamanoteStations = useCallback(() => {
    if (!yamanoteServiceRef.current) return;

    yamanoteServiceRef.current.hideAllStations();
    setVisibleStationCount(0);
  }, []);

  const showStation = useCallback((stationId: string, radius = defaultRadius): boolean => {
    if (!yamanoteServiceRef.current) return false;

    const result = yamanoteServiceRef.current.showStation(stationId, radius);
    if (result) {
      setVisibleStationCount(yamanoteServiceRef.current.getVisibleStationCount());
    }
    return result;
  }, [defaultRadius]);

  const hideStation = useCallback((stationId: string) => {
    if (!yamanoteServiceRef.current) return;

    yamanoteServiceRef.current.hideStation(stationId);
    setVisibleStationCount(yamanoteServiceRef.current.getVisibleStationCount());
  }, []);

  const toggleStation = useCallback((stationId: string, radius = defaultRadius): boolean => {
    if (!yamanoteServiceRef.current) return false;

    const result = yamanoteServiceRef.current.toggleStation(stationId, radius);
    setVisibleStationCount(yamanoteServiceRef.current.getVisibleStationCount());
    return result;
  }, [defaultRadius]);

  // 圓圈管理方法
  const clearAllCircles = useCallback(() => {
    if (!circleManagerRef.current) return;

    circleManagerRef.current.clearAll();
    setVisibleStationCount(0);
  }, []);

  const updateRadius = useCallback((radius: number) => {
    if (!yamanoteServiceRef.current) return;

    yamanoteServiceRef.current.updateRadius(radius);
  }, []);

  // 查詢方法
  const isStationVisible = useCallback((stationId: string): boolean => {
    return yamanoteServiceRef.current?.isStationVisible(stationId) || false;
  }, []);

  const getCircleCount = useCallback((): number => {
    return circleManagerRef.current?.getCircleCount() || 0;
  }, []);

  // 自動初始化 Effect
  useEffect(() => {
    if (autoInitialize && map && !isInitialized) {
      initializeServices();
    }
  }, [autoInitialize, map, isInitialized, initializeServices]);

  // 清理 Effect
  useEffect(() => {
    return () => {
      // 清理地圖監聽器
      if (zoomListenerRef.current) {
        google.maps.event.removeListener(zoomListenerRef.current);
      }

      // 清理所有圓圈
      if (circleManagerRef.current) {
        circleManagerRef.current.clearAll();
      }
    };
  }, []);

  return {
    // 狀態
    isInitialized,
    visibleStationCount,
    
    // 山手線車站控制
    showYamanoteStations,
    hideYamanoteStations,
    showStation,
    hideStation,
    toggleStation,
    
    // 圓圈管理
    clearAllCircles,
    updateRadius,
    
    // 查詢方法
    isStationVisible,
    getCircleCount,
    
    // 服務實例
    circleManager: circleManagerRef.current,
    yamanoteService: yamanoteServiceRef.current
  };
}

/**
 * 快速預設 Hook
 * 用於常見的山手線圓圈配置
 */
export function useYamanoteStations() {
  return useMapCircles({
    autoInitialize: true,
    showYamanoteOnLoad: true,
    yamanoteOptions: {
      showOnlyMajorStations: true, // 只顯示主要車站
      radius: 500
    }
  });
}