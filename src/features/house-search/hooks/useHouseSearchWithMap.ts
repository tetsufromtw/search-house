/**
 * 房屋搜尋與地圖操作組合 Hook
 * 整合搜尋業務邏輯和地圖操作
 */

import { useEffect, useCallback } from 'react';
import { useHouseSearch } from './useHouseSearch';
import { useMapOperations } from './useMapOperations';

export const useHouseSearchWithMap = () => {
  const houseSearch = useHouseSearch();
  const mapOperations = useMapOperations();

  // 完全移除自動地圖更新，改為手動控制

  // 增強的搜尋功能 - 搜尋完成後手動更新地圖
  const performSearchWithMapUpdate = useCallback(async () => {
    try {
      await houseSearch.performSearch();
      
      // 搜尋完成後手動更新地圖
      if (mapOperations.isMapReady) {
        setTimeout(() => {
          // 清除現有內容
          mapOperations.clearMap();
          
          // 添加需求圓圈
          const enabledRequirements = houseSearch.requirements
            .map(req => req.requirement)
            .filter(req => req.enabled && req.locations.length > 0);
          
          if (enabledRequirements.length > 0) {
            mapOperations.addRequirementCircles(enabledRequirements);
          }
          
          // 添加交集區域
          if (houseSearch.intersectionAreas.length > 0) {
            mapOperations.addIntersectionAreas(houseSearch.intersectionAreas);
          }
          
          // 添加房源標記
          if (houseSearch.properties.length > 0) {
            mapOperations.addPropertyMarkers(houseSearch.properties);
          }
          
          // 適應視野
          if (houseSearch.intersectionAreas.length > 0) {
            mapOperations.fitAllContent(
              enabledRequirements,
              houseSearch.intersectionAreas,
              houseSearch.properties
            );
          }
        }, 500); // 給一點時間讓狀態更新
      }
    } catch (error) {
      console.error('搜尋失敗:', error);
    }
  }, [houseSearch.performSearch, mapOperations, houseSearch.requirements, houseSearch.intersectionAreas, houseSearch.properties]);

  // 增強的清除功能
  const clearSearchWithMapUpdate = useCallback(() => {
    houseSearch.clearSearch();
    mapOperations.clearMap();
  }, [houseSearch.clearSearch, mapOperations.clearMap]);

  // 地圖中心變化時更新搜尋狀態
  const handleMapCenterChange = useCallback((center: any, zoom?: number) => {
    const latLng = {
      lat: center.lat || center[0],
      lng: center.lng || center[1],
    };
    
    houseSearch.setMapCenter(latLng, zoom);
  }, [houseSearch.setMapCenter]);

  // 截圖功能
  const captureMapScreenshot = useCallback(async () => {
    try {
      const screenshot = await mapOperations.captureMap();
      return screenshot;
    } catch (error) {
      console.error('截圖失敗:', error);
      return null;
    }
  }, [mapOperations.captureMap]);

  return {
    // 房屋搜尋相關
    ...houseSearch,
    
    // 地圖操作相關
    ...mapOperations,
    
    // 組合功能
    performSearch: performSearchWithMapUpdate,
    clearSearch: clearSearchWithMapUpdate,
    handleMapCenterChange,
    captureMapScreenshot,
    
    // 狀態
    isReady: mapOperations.isMapReady,
  };
};