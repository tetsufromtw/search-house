'use client';

import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MapBounds } from '../../utils/placesApi';
import { useMapCircles } from '../../hooks/useMapCircles';

interface MapHandlerProps {
  onMapBoundsChanged?: (bounds: MapBounds) => void;
  showYamanoteStations?: boolean;
}

export default function MapHandler({
  onMapBoundsChanged,
  showYamanoteStations = true
}: MapHandlerProps) {
  const map = useMap();

  // 初始化山手線車站圓圈
  const { 
    isInitialized, 
    visibleStationCount,
    showYamanoteStations: showStations
  } = useMapCircles({
    autoInitialize: true,
    showYamanoteOnLoad: false, // 手動控制顯示時機
    yamanoteOptions: {
      showOnlyMajorStations: true, // 只顯示主要車站
      radius: 500
    }
  });

  // 當地圖準備好且需要顯示車站時
  useEffect(() => {
    if (isInitialized && showYamanoteStations && visibleStationCount === 0) {
      console.log('🚉 顯示山手線主要車站圓圈');
      showStations({
        showOnlyMajorStations: true,
        radius: 500
      });
    }
  }, [isInitialized, showYamanoteStations, visibleStationCount, showStations]);


  // 監聽地圖邊界變化
  useEffect(() => {
    if (!map || !onMapBoundsChanged) return;

    let debounceTimer: NodeJS.Timeout;

    const handleBoundsChanged = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const bounds = map.getBounds();
        if (bounds) {
          const northeast = bounds.getNorthEast();
          const southwest = bounds.getSouthWest();

          const mapBounds: MapBounds = {
            north: northeast.lat(),
            south: southwest.lat(),
            east: northeast.lng(),
            west: southwest.lng()
          };
          onMapBoundsChanged(mapBounds);
        } else {
          console.warn('⚠️ 無法獲取地圖邊界');
        }
      }, 100);
    };

    const listener = map.addListener('bounds_changed', handleBoundsChanged);

    return () => {
      google.maps.event.removeListener(listener);
      clearTimeout(debounceTimer);
    };
  }, [map, onMapBoundsChanged]);

  return null;
}