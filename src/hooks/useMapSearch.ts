'use client';

import { useState, useCallback } from 'react';
import { createRequirementCirclesAsync, RequirementCircle, DEFAULT_REQUIREMENTS, MapBounds } from '../utils/placesApi';
import { CircleData } from '../context/SearchContext';

export function useMapSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const performSearch = useCallback(async (
    bounds?: MapBounds,
    onCircleReady?: (circles: CircleData[]) => void,
    onRequirementReady?: (requirement: RequirementCircle) => void
  ) => {
    setIsLoading(true);
    console.log('🚀 開始搜尋需求圓圈', bounds ? '(使用地圖範圍)' : '(使用預設範圍)');
    
    try {
      // 等待 Google Maps API 完全載入
      const waitForGoogleMaps = () => {
        return new Promise<void>((resolve) => {
          const checkGoogleMaps = () => {
            if (window.google && window.google.maps) {
              console.log('✅ Google Maps API 已準備就緒');
              resolve();
            } else {
              console.log('⏳ 等待 Google Maps API 載入...');
              setTimeout(checkGoogleMaps, 500);
            }
          };
          checkGoogleMaps();
        });
      };

      await waitForGoogleMaps();
      
      // 使用即時回調版本
      await createRequirementCirclesAsync(DEFAULT_REQUIREMENTS, (reqCircle) => {
        console.log(`🎯 需求「${reqCircle.requirement}」圓圈準備就緒`);
        
        // 將此需求的所有地點轉換為圓圈資料
        const newCircles: CircleData[] = reqCircle.places.map(place => ({
          id: `${reqCircle.id}-${place.place_id}`,
          center: place.location,
          radius: 1000, // 1公里
          color: reqCircle.color,
          colorIndex: reqCircle.colorIndex,
          requirementId: reqCircle.id,
          placeName: place.name,
          address: place.address,
          rating: place.rating,
          requirement: reqCircle.requirement
        }));
        
        // 即時回調
        if (onCircleReady) {
          onCircleReady(newCircles);
        }
        
        if (onRequirementReady) {
          onRequirementReady(reqCircle);
        }
        
        console.log(`✨ 新增 ${newCircles.length} 個圓圈到地圖`);
      }, bounds);
        
      console.log('🎉 所有需求搜尋完成');
    } catch (error) {
      console.error('❌ 搜尋時發生錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMapBoundsChanged = useCallback((
    bounds: MapBounds,
    onCircleReady?: (circles: CircleData[]) => void,
    onRequirementReady?: (requirement: RequirementCircle) => void
  ) => {
    console.log('📍 地圖邊界變化:', bounds);
    if (!isInitialized) {
      console.log('🎯 首次獲取地圖邊界，開始初始搜尋...');
      setIsInitialized(true);
      performSearch(bounds, onCircleReady, onRequirementReady);
    } else {
      console.log('🔄 地圖範圍變化，重新搜尋...');
      performSearch(bounds, onCircleReady, onRequirementReady);
    }
  }, [isInitialized, performSearch]);

  const initializeSearch = useCallback((
    onCircleReady?: (circles: CircleData[]) => void,
    onRequirementReady?: (requirement: RequirementCircle) => void
  ) => {
    if (!isInitialized) {
      console.log('⏰ 備用初始化觸發 - 使用預設範圍');
      performSearch(undefined, onCircleReady, onRequirementReady);
      setIsInitialized(true);
    }
  }, [isInitialized, performSearch]);

  return {
    isLoading,
    isInitialized,
    performSearch,
    handleMapBoundsChanged,
    initializeSearch
  };
}