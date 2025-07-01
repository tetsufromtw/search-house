'use client';

import { useCallback } from 'react';
import { IntersectionArea, pointInIntersection } from '../utils/intersectionUtils';
import { CircleData } from '../context/SearchContext';
import { intersectionHighlightManager } from '../utils/intersectionHighlightManager';

export interface ClickPosition {
  lat: number;
  lng: number;
}

export interface UseIntersectionClickOptions {
  onIntersectionClick?: (intersection: IntersectionArea) => void;
  onEmptyClick?: () => void;
}

/**
 * 處理交集區域點擊的自定義Hook
 * 遵循單一職責原則，專門處理交集點擊邏輯
 */
export function useIntersectionClick(
  intersections: IntersectionArea[],
  circles: CircleData[],
  options: UseIntersectionClickOptions = {}
) {
  const { onIntersectionClick, onEmptyClick } = options;

  /**
   * 檢測點擊位置並處理交集高亮
   * 使用 useCallback 優化性能，避免不必要的重新渲染
   */
  const handleMapClick = useCallback((position: ClickPosition) => {
    // 找到第一個包含點擊位置的交集
    const clickedIntersection = intersections.find(intersection => 
      pointInIntersection(position, intersection, circles)
    );

    if (clickedIntersection) {
      // 切換交集高亮狀態
      const newHighlightState = intersectionHighlightManager.toggleHighlight(clickedIntersection.id);
      
      // 觸發回調
      onIntersectionClick?.({
        ...clickedIntersection,
        isHighlighted: newHighlightState
      });
    } else {
      // 點擊空白區域，清除所有高亮
      intersectionHighlightManager.clearAllHighlights();
      onEmptyClick?.();
    }
  }, [intersections, circles, onIntersectionClick, onEmptyClick]);

  /**
   * 獲取應用高亮狀態後的交集數組
   */
  const getHighlightedIntersections = useCallback((): IntersectionArea[] => {
    return intersectionHighlightManager.applyHighlights(intersections);
  }, [intersections]);

  /**
   * 檢查特定交集是否被高亮
   */
  const isIntersectionHighlighted = useCallback((intersectionId: string): boolean => {
    return intersectionHighlightManager.isHighlighted(intersectionId);
  }, []);

  /**
   * 手動設置交集高亮狀態
   */
  const setIntersectionHighlight = useCallback((intersectionId: string, highlighted: boolean) => {
    intersectionHighlightManager.setHighlight(intersectionId, highlighted);
  }, []);

  /**
   * 清除所有交集高亮
   */
  const clearAllHighlights = useCallback(() => {
    intersectionHighlightManager.clearAllHighlights();
  }, []);

  return {
    handleMapClick,
    getHighlightedIntersections,
    isIntersectionHighlighted,
    setIntersectionHighlight,
    clearAllHighlights,
    highlightedIds: intersectionHighlightManager.getHighlightedIds()
  };
}