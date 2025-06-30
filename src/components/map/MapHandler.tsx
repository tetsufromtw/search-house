'use client';

import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { CircleData } from '../../context/SearchContext';
import { IntersectionArea } from '../../utils/intersectionUtils';
import { REQUIREMENT_MARKER_COLORS, MapBounds } from '../../utils/placesApi';

interface MapHandlerProps {
  circles: CircleData[];
  onCirclesUpdate: (circles: CircleData[]) => void;
  intersections: IntersectionArea[];
  onIntersectionsUpdate: (intersections: IntersectionArea[]) => void;
  onMapBoundsChanged?: (bounds: MapBounds) => void;
}

export default function MapHandler({
  circles,
  onCirclesUpdate,
  intersections,
  onIntersectionsUpdate,
  onMapBoundsChanged
}: MapHandlerProps) {
  const map = useMap();

  // 處理圓圈渲染
  useEffect(() => {
    if (!map) return;

    // 只處理還沒有 circle 實例的新圓圈
    const newCircles = circles.filter(circleData => !circleData.circle);

    if (newCircles.length > 0) {
      const updatedCircles = circles.map(circleData => {
        if (!circleData.circle) {
          // 建立圓圈
          const circle = new google.maps.Circle({
            center: circleData.center,
            radius: circleData.radius,
            fillColor: circleData.color,
            fillOpacity: 0.2,
            strokeColor: circleData.color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map: map
          });

          // 建立中心點標記
          const marker = new google.maps.Marker({
            position: circleData.center,
            map: map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: REQUIREMENT_MARKER_COLORS[circleData.colorIndex],
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            },
            title: circleData.placeName || '地點'
          });

          // 添加點擊事件顯示店家資訊
          const infoWindow = new google.maps.InfoWindow();
          marker.addListener('click', () => {
            const content = `
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${circleData.placeName || '地點'}</h3>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">
                  <strong>地址:</strong> ${circleData.address || '無地址資訊'}
                </p>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">
                  <strong>評分:</strong> ${circleData.rating ? `${circleData.rating} ⭐` : '無評分'}
                </p>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">
                  <strong>類型:</strong> ${circleData.requirement || '無類型'}
                </p>
              </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });

          return { ...circleData, circle, marker };
        }
        return circleData;
      });

      onCirclesUpdate(updatedCircles);
    }
  }, [map, circles, onCirclesUpdate]);

  // 處理交集區域清理
  useEffect(() => {
    if (!map) return;

    // 清除舊的交集標記
    intersections.forEach(intersection => {
      if (intersection.marker) {
        intersection.marker.setMap(null);
      }
    });

    // 不創建交集標記，只返回交集資料
    const updatedIntersections = intersections.map(intersection => ({
      ...intersection,
      marker: undefined
    }));

    onIntersectionsUpdate(updatedIntersections);
  }, [map, intersections, onIntersectionsUpdate]);

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