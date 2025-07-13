/**
 * 地圖操作 Hook
 * 處理地圖相關的所有操作和狀態
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { IMapService, SearchRequirement, IntersectionArea, Property, LatLng } from '../types';
import { CONFIG } from '../config';

// 地圖服務介面實現
class LeafletMapService implements IMapService {
  private map: any = null;
  private circles = new Map<string, any>();
  private markers = new Map<string, any>();

  setMap(map: any) {
    this.map = map;
  }

  async addCircle(center: LatLng, radius: number, color: string, id?: string): Promise<string> {
    if (!this.map) throw new Error('地圖未初始化');
    
    try {
      const L = (await import('leaflet')).default;
      const circleId = id || `circle-${Date.now()}-${Math.random()}`;
      
      const circle = L.circle([center.lat, center.lng], {
        radius,
        fillColor: color,
        fillOpacity: CONFIG.MAP.CIRCLE_OPACITY,
        color: color,
        weight: CONFIG.MAP.CIRCLE_STROKE_WIDTH,
        opacity: CONFIG.MAP.CIRCLE_STROKE_OPACITY,
      }).addTo(this.map);
      
      this.circles.set(circleId, circle);
      return circleId;
    } catch (error) {
      console.error('添加圓圈失敗:', error);
      throw error;
    }
  }

  removeCircle(id: string): void {
    const circle = this.circles.get(id);
    if (circle && this.map) {
      this.map.removeLayer(circle);
      this.circles.delete(id);
    }
  }

  async addMarker(center: LatLng, content: string, id?: string): Promise<string> {
    if (!this.map) throw new Error('地圖未初始化');
    
    try {
      const L = (await import('leaflet')).default;
      const markerId = id || `marker-${Date.now()}-${Math.random()}`;
      
      const marker = L.marker([center.lat, center.lng]).addTo(this.map);
      marker.bindPopup(content);
      
      this.markers.set(markerId, marker);
      return markerId;
    } catch (error) {
      console.error('添加標記失敗:', error);
      throw error;
    }
  }

  removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker && this.map) {
      this.map.removeLayer(marker);
      this.markers.delete(id);
    }
  }

  fitBounds(bounds: { north: number; south: number; east: number; west: number }): void {
    if (!this.map) return;
    
    const L = (window as any).L;
    if (L) {
      const leafletBounds = L.latLngBounds(
        [bounds.south, bounds.west],
        [bounds.north, bounds.east]
      );
      this.map.fitBounds(leafletBounds, { padding: [20, 20] });
    }
  }

  setCenter(center: LatLng, zoom?: number): void {
    if (!this.map) return;
    
    if (zoom !== undefined) {
      this.map.setView([center.lat, center.lng], zoom);
    } else {
      this.map.setView([center.lat, center.lng]);
    }
  }

  clearMap(): void {
    // 清除所有圓形
    this.circles.forEach(circle => {
      if (this.map) {
        this.map.removeLayer(circle);
      }
    });
    this.circles.clear();
    
    // 清除所有標記
    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });
    this.markers.clear();
  }

  getAllCircles(): Map<string, any> {
    return new Map(this.circles);
  }

  getAllMarkers(): Map<string, any> {
    return new Map(this.markers);
  }
}

// 地圖操作 Hook
export const useMapOperations = () => {
  const mapServiceRef = useRef<LeafletMapService>(new LeafletMapService());
  const [isMapReady, setIsMapReady] = useState(false);

  // 地圖初始化
  const initializeMap = useCallback((map: any) => {
    mapServiceRef.current.setMap(map);
    setIsMapReady(true);
    console.log('🗺️ 地圖初始化完成');
  }, []);

  // 添加需求圓圈
  const addRequirementCircles = useCallback(async (requirements: SearchRequirement[]) => {
    if (!isMapReady) {
      console.log('地圖尚未準備好，跳過添加圓圈');
      return;
    }

    try {
      for (const requirement of requirements) {
        if (!requirement.enabled || requirement.locations.length === 0) continue;

        // 為每個地點添加圓圈
        for (const location of requirement.locations) {
          const circleId = `req-${requirement.id}-${location.id}`;
          try {
            await mapServiceRef.current.addCircle(
              location.coordinates,
              CONFIG.SEARCH.searchRadius,
              requirement.color,
              circleId
            );
          } catch (error) {
            console.error('添加需求圓圈失敗:', error);
          }
        }

        // 添加需求標記
        for (const location of requirement.locations) {
          const markerId = `marker-${requirement.id}-${location.id}`;
          const popupContent = `
            <div>
              <h4>${location.name}</h4>
              <p>需求: ${requirement.query}</p>
              <p>地址: ${location.address}</p>
            </div>
          `;
          try {
            await mapServiceRef.current.addMarker(
              location.coordinates,
              popupContent,
              markerId
            );
          } catch (error) {
            console.error('添加需求標記失敗:', error);
          }
        }
      }
    } catch (error) {
      console.error('添加需求圓圈過程中發生錯誤:', error);
    }
  }, [isMapReady]);

  // 添加交集區域
  const addIntersectionAreas = useCallback(async (intersectionAreas: IntersectionArea[]) => {
    if (!isMapReady) return;

    for (const area of intersectionAreas) {
      const circleId = `intersection-${area.id}`;
      try {
        await mapServiceRef.current.addCircle(
          area.center,
          area.radius,
          CONFIG.COLOR.INTERSECTION_COLOR,
          circleId
        );
      } catch (error) {
        console.error('添加交集區域失敗:', error);
      }

      // 添加交集標記
      const markerId = `intersection-marker-${area.id}`;
      const popupContent = `
        <div>
          <h4>🎯 交集區域</h4>
          <p><strong>需求:</strong> ${area.requirements.join(', ')}</p>
          <p><strong>半徑:</strong> ${area.radius}m</p>
          <p><strong>分數:</strong> ${area.score.toFixed(2)}</p>
        </div>
      `;
      try {
        await mapServiceRef.current.addMarker(
          area.center,
          popupContent,
          markerId
        );
      } catch (error) {
        console.error('添加交集標記失敗:', error);
      }
    }
  }, [isMapReady]);

  // 添加房源標記
  const addPropertyMarkers = useCallback(async (properties: Property[]) => {
    if (!isMapReady) return;

    for (const property of properties) {
      if (!property.coordinates) continue;

      const markerId = `property-${property.id}`;
      const popupContent = `
        <div>
          <h4>${property.title}</h4>
          <p><strong>價格:</strong> ${property.price}</p>
          <p><strong>地點:</strong> ${property.location}</p>
          ${property.size ? `<p><strong>大小:</strong> ${property.size}</p>` : ''}
          ${property.url ? `<a href="${property.url}" target="_blank">查看詳情</a>` : ''}
        </div>
      `;
      try {
        await mapServiceRef.current.addMarker(
          property.coordinates,
          popupContent,
          markerId
        );
      } catch (error) {
        console.error('添加房源標記失敗:', error);
      }
    }
  }, [isMapReady]);

  // 設置地圖中心
  const setMapCenter = useCallback((center: LatLng, zoom?: number) => {
    if (!isMapReady) return;
    mapServiceRef.current.setCenter(center, zoom);
  }, [isMapReady]);

  // 適應邊界
  const fitBounds = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    if (!isMapReady) return;
    mapServiceRef.current.fitBounds(bounds);
  }, [isMapReady]);

  // 適應所有內容
  const fitAllContent = useCallback((
    requirements: SearchRequirement[],
    intersectionAreas: IntersectionArea[],
    properties: Property[]
  ) => {
    if (!isMapReady) return;

    const allPoints: LatLng[] = [];

    // 收集所有需求地點
    requirements.forEach(req => {
      if (req.enabled) {
        req.locations.forEach(loc => allPoints.push(loc.coordinates));
      }
    });

    // 收集所有交集中心
    intersectionAreas.forEach(area => allPoints.push(area.center));

    // 收集所有房源位置
    properties.forEach(property => {
      if (property.coordinates) {
        allPoints.push(property.coordinates);
      }
    });

    if (allPoints.length > 0) {
      const bounds = calculateBounds(allPoints);
      fitBounds(bounds);
    }
  }, [isMapReady, fitBounds]);

  // 清除地圖
  const clearMap = useCallback(() => {
    if (!isMapReady) return;
    mapServiceRef.current.clearMap();
  }, [isMapReady]);

  // 截圖功能
  const captureMap = useCallback(async (): Promise<string | null> => {
    if (!isMapReady) return null;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const mapElement = document.querySelector('.leaflet-container') as HTMLElement;
      
      if (!mapElement) return null;

      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 1,
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('截圖失敗:', error);
      return null;
    }
  }, [isMapReady]);

  return {
    // 狀態
    isMapReady,
    
    // 初始化
    initializeMap,
    
    // 添加元素
    addRequirementCircles,
    addIntersectionAreas,
    addPropertyMarkers,
    
    // 地圖操作
    setMapCenter,
    fitBounds,
    fitAllContent,
    clearMap,
    
    // 其他功能
    captureMap,
    
    // 直接服務訪問
    mapService: mapServiceRef.current,
  };
};

// 輔助函數
function calculateBounds(points: LatLng[]): { north: number; south: number; east: number; west: number } {
  if (points.length === 0) {
    return {
      north: CONFIG.MAP.DEFAULT_CENTER.lat + 0.01,
      south: CONFIG.MAP.DEFAULT_CENTER.lat - 0.01,
      east: CONFIG.MAP.DEFAULT_CENTER.lng + 0.01,
      west: CONFIG.MAP.DEFAULT_CENTER.lng - 0.01,
    };
  }

  let north = points[0].lat;
  let south = points[0].lat;
  let east = points[0].lng;
  let west = points[0].lng;

  points.forEach(point => {
    north = Math.max(north, point.lat);
    south = Math.min(south, point.lat);
    east = Math.max(east, point.lng);
    west = Math.min(west, point.lng);
  });

  // 添加一些邊距
  const padding = 0.01;
  return {
    north: north + padding,
    south: south - padding,
    east: east + padding,
    west: west - padding,
  };
}