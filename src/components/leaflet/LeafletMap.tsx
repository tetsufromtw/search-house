'use client';

/**
 * Leaflet + OpenStreetMap 地圖元件
 * 完全免費替代 Google Maps
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修復 Leaflet 圖示問題 (Next.js)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMapReady?: (map: L.Map) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  children?: React.ReactNode;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export default function LeafletMap({
  center = [35.6762, 139.6503], // 東京車站
  zoom = 13,
  className = "w-full h-full",
  onMapReady,
  onBoundsChange,
  children
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    console.log('🗺️ 初始化 Leaflet 地圖');

    // 建立地圖實例
    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true
    });

    // 新增 OpenStreetMap 圖層
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 3
    }).addTo(map);

    mapInstanceRef.current = map;

    // 通知父元件地圖已準備好
    if (onMapReady) {
      onMapReady(map);
    }

    // 邊界變化監聽器
    if (onBoundsChange) {
      const handleMoveEnd = () => {
        const bounds = map.getBounds();
        onBoundsChange(bounds);
      };

      map.on('moveend', handleMoveEnd);
      map.on('zoomend', handleMoveEnd);
      
      // 初始邊界
      handleMoveEnd();
    }

    // 清理函數
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, center, zoom, onMapReady, onBoundsChange]);

  // 服務端渲染時顯示佔位符
  if (!isClient) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <div className="text-gray-500">🗺️ 載入地圖中...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full" />
      {children}
    </div>
  );
}

/**
 * 圓圈管理器 - 處理需求圓圈的顯示
 */
export class LeafletCircleManager {
  private map: L.Map;
  private circles: Map<string, L.Circle> = new Map();
  private markers: Map<string, L.Marker> = new Map();

  constructor(map: L.Map) {
    this.map = map;
  }

  /**
   * 新增需求圓圈
   */
  addRequirementCircle(
    id: string,
    center: [number, number],
    radius: number,
    color: string,
    displayName: string,
    locations: Array<{ lat: number; lng: number; name: string }>
  ) {
    console.log(`🎯 新增需求圓圈: ${displayName}`, { center, radius, color, locationCount: locations.length });

    // 移除現有圓圈
    this.removeCircle(id);

    // 建立圓圈
    const circle = L.circle(center, {
      radius,
      fillColor: color,
      fillOpacity: 0.2,
      color: color,
      weight: 2,
      opacity: 0.8
    }).addTo(this.map);

    // 新增標記 (圓圈中心)
    const marker = L.marker(center, {
      icon: L.divIcon({
        html: this.getRequirementIcon(displayName, locations.length),
        className: 'requirement-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })
    }).addTo(this.map);

    // 新增地點標記
    locations.forEach((location, index) => {
      const locationMarker = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">${index + 1}</div>`,
          className: 'location-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 20]
        })
      }).addTo(this.map);

      locationMarker.bindPopup(`
        <div>
          <h4>${location.name}</h4>
          <p>需求: ${displayName}</p>
          <p>座標: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
        </div>
      `);

      this.markers.set(`${id}_location_${index}`, locationMarker);
    });

    // 圓圈點擊事件
    circle.on('click', () => {
      console.log(`🖱️ 點擊需求圓圈: ${displayName}`);
    });

    this.circles.set(id, circle);
    this.markers.set(id, marker);

    console.log(`✅ 需求圓圈 ${displayName} 建立完成`);
  }

  /**
   * 新增交集區域
   */
  addIntersectionArea(
    id: string,
    center: [number, number],
    radius: number,
    requirements: string[]
  ) {
    console.log(`🎯 新增交集區域:`, { center, radius, requirements });

    // 移除現有交集
    this.removeCircle(`intersection_${id}`);

    // 建立交集圓圈 (不同樣式)
    const intersectionCircle = L.circle(center, {
      radius,
      fillColor: '#ff6b6b',
      fillOpacity: 0.3,
      color: '#ff6b6b',
      weight: 3,
      opacity: 1,
      dashArray: '10, 5' // 虛線邊框
    }).addTo(this.map);

    // 交集中心標記
    const intersectionMarker = L.marker(center, {
      icon: L.divIcon({
        html: `
          <div style="
            background: linear-gradient(45deg, #ff6b6b, #ff8e53);
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ⭐
          </div>
        `,
        className: 'intersection-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
    }).addTo(this.map);

    // 交集資訊彈窗
    intersectionMarker.bindPopup(`
      <div>
        <h4>🎯 交集區域</h4>
        <p><strong>需求:</strong> ${requirements.join(', ')}</p>
        <p><strong>半徑:</strong> ${radius}m</p>
        <p><strong>中心:</strong> ${center[0].toFixed(4)}, ${center[1].toFixed(4)}</p>
        <button onclick="window.searchPropertiesInArea && window.searchPropertiesInArea(${center[0]}, ${center[1]}, ${radius})" 
                style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-top: 5px;">
          🏠 搜尋租屋
        </button>
      </div>
    `);

    this.circles.set(`intersection_${id}`, intersectionCircle);
    this.markers.set(`intersection_${id}`, intersectionMarker);

    console.log(`✅ 交集區域建立完成`);
  }

  /**
   * 移除圓圈
   */
  removeCircle(id: string) {
    const circle = this.circles.get(id);
    const marker = this.markers.get(id);

    if (circle) {
      this.map.removeLayer(circle);
      this.circles.delete(id);
    }

    if (marker) {
      this.map.removeLayer(marker);
      this.markers.delete(id);
    }

    // 移除相關的地點標記
    Array.from(this.markers.keys())
      .filter(key => key.startsWith(`${id}_location_`))
      .forEach(key => {
        const locationMarker = this.markers.get(key);
        if (locationMarker) {
          this.map.removeLayer(locationMarker);
          this.markers.delete(key);
        }
      });
  }

  /**
   * 清除所有圓圈
   */
  clearAll() {
    this.circles.forEach(circle => this.map.removeLayer(circle));
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.circles.clear();
    this.markers.clear();
    console.log('🧹 清除所有圓圈和標記');
  }

  /**
   * 生成需求圖示
   */
  private getRequirementIcon(displayName: string, count: number): string {
    const emoji = this.getRequirementEmoji(displayName);
    
    return `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 5px 8px;
        border: 2px solid #333;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 3px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">
        ${emoji} ${count}
      </div>
    `;
  }

  private getRequirementEmoji(displayName: string): string {
    if (displayName.includes('星巴克') || displayName.includes('Starbucks')) return '☕';
    if (displayName.includes('健身房') || displayName.includes('gym')) return '💪';
    if (displayName.includes('便利商店') || displayName.includes('convenience')) return '🏪';
    return '📍';
  }

  /**
   * 獲取所有圓圈
   */
  getAllCircles(): Map<string, L.Circle> {
    return new Map(this.circles);
  }

  /**
   * 適應所有圓圈的邊界
   */
  fitAllCircles() {
    if (this.circles.size === 0) return;

    const group = L.featureGroup(Array.from(this.circles.values()));
    this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
  }
}

/**
 * 輔助函數：Leaflet 邊界轉換為標準格式
 */
export function leafletBoundsToMapBounds(bounds: L.LatLngBounds): MapBounds {
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest()
  };
}