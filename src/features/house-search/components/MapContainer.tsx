/**
 * 地圖容器組件
 * 整合 Leaflet 地圖與業務邏輯
 */

'use client';

import React, { useRef, useEffect, forwardRef } from 'react';
import dynamic from 'next/dynamic';

// 動態載入 LeafletMap 避免 SSR 問題
const LeafletMap = dynamic(() => import('@/components/leaflet/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <div className="text-gray-500">🗺️ 載入地圖中...</div>
    </div>
  ),
});
import { LatLng } from '../types';
import { CONFIG } from '../config';

interface MapContainerProps {
  center: LatLng;
  zoom: number;
  onMapReady?: (map: any) => void;
  onCenterChange?: (center: LatLng, zoom: number) => void;
  className?: string;
}

export const MapContainer = forwardRef<HTMLDivElement, MapContainerProps>(
  ({ center, zoom, onMapReady, onCenterChange, className = '' }, ref) => {
    const mapInstanceRef = useRef<any>(null);

    // 地圖就緒處理
    const handleMapReady = (map: any) => {
      mapInstanceRef.current = map;
      onMapReady?.(map);

      // 設置地圖事件監聽器
      if (onCenterChange) {
        map.on('moveend', () => {
          const center = map.getCenter();
          const zoom = map.getZoom();
          onCenterChange(
            { lat: center.lat, lng: center.lng },
            zoom
          );
        });
      }
    };

    // 邊界變化處理
    const handleBoundsChange = (bounds: any) => {
      // 可以在這裡處理邊界變化邏輯
      console.log('🗺️ 地圖邊界變化:', bounds);
    };

    return (
      <div ref={ref} className={`relative ${className}`}>
        <LeafletMap
          center={[center.lat, center.lng]}
          zoom={zoom}
          className="w-full h-full"
          onMapReady={handleMapReady}
          onBoundsChange={handleBoundsChange}
        />
        
        {/* 地圖控制面板 */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <MapControls />
        </div>
        
        {/* 地圖資訊面板 */}
        <div className="absolute bottom-4 left-4 z-10">
          <MapInfo center={center} zoom={zoom} />
        </div>
      </div>
    );
  }
);

MapContainer.displayName = 'MapContainer';

// 地圖控制按鈕
const MapControls: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-2 space-y-2">
      <button
        className="w-full px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
        onClick={() => console.log('重置地圖視野')}
      >
        🎯 重置視野
      </button>
      <button
        className="w-full px-3 py-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors"
        onClick={() => console.log('適應所有標記')}
      >
        📍 適應標記
      </button>
      <button
        className="w-full px-3 py-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition-colors"
        onClick={() => console.log('截圖地圖')}
      >
        📸 截圖
      </button>
    </div>
  );
};

// 地圖資訊面板
const MapInfo: React.FC<{ center: LatLng; zoom: number }> = ({ center, zoom }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span>📍</span>
          <span>{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🔍</span>
          <span>縮放: {zoom}</span>
        </div>
      </div>
    </div>
  );
};