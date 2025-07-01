'use client';

import React from 'react';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

interface MapProps {
  children?: React.ReactNode;
  defaultZoom?: number;
  defaultCenter?: { lat: number; lng: number };
  className?: string;
  mapId?: string;
}

// 從環境變數讀取地圖配置，沒有設定就用 Google Maps 預設值
function getMapOptions() {
  const options: Record<string, unknown> = {};

  // UI 控制項
  if (process.env.NEXT_PUBLIC_MAP_ZOOM_CONTROL !== undefined) {
    options.zoomControl = process.env.NEXT_PUBLIC_MAP_ZOOM_CONTROL === 'true';
  }
  if (process.env.NEXT_PUBLIC_MAP_TYPE_CONTROL !== undefined) {
    options.mapTypeControl = process.env.NEXT_PUBLIC_MAP_TYPE_CONTROL === 'true';
  }
  if (process.env.NEXT_PUBLIC_MAP_SCALE_CONTROL !== undefined) {
    options.scaleControl = process.env.NEXT_PUBLIC_MAP_SCALE_CONTROL === 'true';
  }
  if (process.env.NEXT_PUBLIC_MAP_STREET_VIEW_CONTROL !== undefined) {
    options.streetViewControl = process.env.NEXT_PUBLIC_MAP_STREET_VIEW_CONTROL === 'true';
  }
  if (process.env.NEXT_PUBLIC_MAP_ROTATE_CONTROL !== undefined) {
    options.rotateControl = process.env.NEXT_PUBLIC_MAP_ROTATE_CONTROL === 'true';
  }
  if (process.env.NEXT_PUBLIC_MAP_FULLSCREEN_CONTROL !== undefined) {
    options.fullscreenControl = process.env.NEXT_PUBLIC_MAP_FULLSCREEN_CONTROL === 'true';
  }

  // 互動功能
  if (process.env.NEXT_PUBLIC_MAP_GESTURE_HANDLING) {
    options.gestureHandling = process.env.NEXT_PUBLIC_MAP_GESTURE_HANDLING;
  }
  if (process.env.NEXT_PUBLIC_MAP_DISABLE_DOUBLE_CLICK_ZOOM !== undefined) {
    options.disableDoubleClickZoom = process.env.NEXT_PUBLIC_MAP_DISABLE_DOUBLE_CLICK_ZOOM === 'true';
  }
  if (process.env.NEXT_PUBLIC_MAP_SCROLLWHEEL !== undefined) {
    options.scrollwheel = process.env.NEXT_PUBLIC_MAP_SCROLLWHEEL === 'true';
  }
  if (process.env.NEXT_PUBLIC_MAP_KEYBOARD_SHORTCUTS !== undefined) {
    options.keyboardShortcuts = process.env.NEXT_PUBLIC_MAP_KEYBOARD_SHORTCUTS === 'true';
  }

  // 地點資訊
  if (process.env.NEXT_PUBLIC_MAP_CLICKABLE_ICONS !== undefined) {
    options.clickableIcons = process.env.NEXT_PUBLIC_MAP_CLICKABLE_ICONS === 'true';
  }

  // 其他
  if (process.env.NEXT_PUBLIC_MAP_BACKGROUND_COLOR) {
    options.backgroundColor = process.env.NEXT_PUBLIC_MAP_BACKGROUND_COLOR;
  }
  if (process.env.NEXT_PUBLIC_MAP_TYPE_ID) {
    options.mapTypeId = process.env.NEXT_PUBLIC_MAP_TYPE_ID;
  }

  // 自訂樣式 (JSON 格式)
  if (process.env.NEXT_PUBLIC_MAP_CUSTOM_STYLES) {
    try {
      options.styles = JSON.parse(process.env.NEXT_PUBLIC_MAP_CUSTOM_STYLES);
    } catch {
      console.warn('Invalid MAP_CUSTOM_STYLES JSON format, using default styles');
    }
  }

  return options;
}

export default function Map({
  children,
  defaultZoom = 13,
  defaultCenter = { lat: 35.6762, lng: 139.6503 }, // 東京市中心
  className = "w-full h-full",
  mapId = "search-house-map"
}: MapProps) {
  const mapOptions = getMapOptions();

  return (
    <APIProvider 
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
      libraries={['places']}
    >
      <div className={className}>
        <GoogleMap
          defaultZoom={defaultZoom}
          defaultCenter={defaultCenter}
          className="w-full h-full"
          mapId={mapId}
          options={Object.keys(mapOptions).length > 0 ? mapOptions : undefined}
        >
          {children}
        </GoogleMap>
      </div>
    </APIProvider>
  );
}