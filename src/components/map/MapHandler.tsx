'use client';

import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MapBounds } from '../../utils/placesApi';

interface MapHandlerProps {
  onMapBoundsChanged?: (bounds: MapBounds) => void;
}

export default function MapHandler({
  onMapBoundsChanged
}: MapHandlerProps) {
  const map = useMap();


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