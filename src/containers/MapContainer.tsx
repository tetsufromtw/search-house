'use client';

import React, { useEffect } from 'react';
import Map from '../components/map/Map';
import MapHandler from '../components/map/MapHandler';
import MapControlPanel from '../components/map/MapControlPanel';
import { useSearch } from '../context/SearchContext';
import { useMapSearch } from '../hooks/useMapSearch';
import { useCircleIntersections } from '../hooks/useCircleIntersections';
import { MapBounds } from '../utils/placesApi';

interface MapContainerProps {
  className?: string;
}

export default function MapContainer({ className = "" }: MapContainerProps) {
  const { state, actions } = useSearch();
  const { 
    isLoading, 
    handleMapBoundsChanged, 
    initializeSearch 
  } = useMapSearch();

  // 處理圓圈交集計算
  useCircleIntersections(state.circles, actions.setIntersections);

  // 處理地圖邊界變化
  const handleBoundsChanged = (bounds: MapBounds) => {
    console.log('🌍 MapContainer 地圖邊界變化:', bounds);
    handleMapBoundsChanged(
      bounds,
      (circles) => {
        console.log('📍 MapContainer 邊界變化接收到圓圈:', circles.length);
        actions.addCircles(circles);
      },
      (requirement) => {
        console.log('🎯 MapContainer 邊界變化接收到需求:', requirement.requirement);
        actions.addRequirement(requirement);
      }
    );
  };

  // 備用初始化 - 移除 actions 依賴
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ MapContainer 備用初始化檢查，isLoading:', isLoading);
      initializeSearch(
        (circles) => {
          console.log('📍 MapContainer 接收到圓圈:', circles.length);
          actions.addCircles(circles);
        },
        (requirement) => {
          console.log('🎯 MapContainer 接收到需求:', requirement.requirement);
          actions.addRequirement(requirement);
        }
      );
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [initializeSearch]); // 移除 actions 依賴

  // 清除所有圓圈
  const handleClearAll = () => {
    // 清除地圖上的實際圓圈和標記
    state.circles.forEach(circleData => {
      if (circleData.circle) {
        circleData.circle.setMap(null);
      }
      if (circleData.marker) {
        circleData.marker.setMap(null);
      }
    });
    
    state.intersections.forEach(intersection => {
      if (intersection.marker) {
        intersection.marker.setMap(null);
      }
    });

    // 清除狀態
    actions.clearAll();
  };

  return (
    <div className={`flex-1 bg-white border border-[#e5e5e5] shadow-sm relative ${className}`}>
      <div className="h-96 xl:h-[600px]">
        <Map>
          <MapHandler 
            circles={state.circles}
            onCirclesUpdate={actions.setCircles}
            intersections={state.intersections}
            onIntersectionsUpdate={actions.setIntersections}
            onMapBoundsChanged={handleBoundsChanged}
          />
        </Map>
      </div>

      <MapControlPanel
        requirements={state.requirements}
        circles={state.circles}
        intersections={state.intersections}
        properties={state.properties}
        loading={isLoading || state.loading}
        onClearAll={handleClearAll}
      />
    </div>
  );
}