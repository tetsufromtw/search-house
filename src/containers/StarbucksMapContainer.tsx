/**
 * Starbucks 地圖容器
 * 整合地圖顯示、邊界監聽、Starbucks 搜尋等功能
 */

'use client';

import React, { useCallback, useState } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { useMapBoundsListener } from '../hooks/useMapBoundsListener';
import { useStarbucksSearch } from '../hooks/useStarbucksSearch';

interface StarbucksMapContainerProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

function StarbucksMapContent({ 
  className = '',
  initialCenter = { lat: 35.6762, lng: 139.6503 }, // 東京中心
  initialZoom = 13
}: StarbucksMapContainerProps) {
  const map = useMap();
  const [showControls, setShowControls] = useState(true);

  // 穩定的回調函數
  const handleBoundsChanged = useCallback((newBounds: any) => {
    console.log('🗺️ 地圖邊界變化:', newBounds);
  }, []);

  const handleIdle = useCallback(() => {
    console.log('🗺️ 地圖停止移動');
  }, []);

  // 地圖邊界監聽
  const { bounds, isIdle } = useMapBoundsListener(map, {
    debounceDelay: 300,
    onBoundsChanged: handleBoundsChanged,
    onIdle: handleIdle
  });

  // Starbucks 搜尋
  const {
    locations,
    loading,
    error,
    visibleCount,
    totalCount,
    searchCount,
    manualSearch,
    toggleCircles,
    clearResults
  } = useStarbucksSearch(map, bounds, {
    maxPages: 3,
    radius: 5000,
    circleRadius: 500,
    autoUpdate: true,
    boundsExpansion: 0.1
  });

  // 手動搜尋按鈕
  const handleManualSearch = useCallback(() => {
    manualSearch();
  }, [manualSearch]);

  // 清除結果
  const handleClear = useCallback(() => {
    clearResults();
  }, [clearResults]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 地圖 */}
      <div className="w-full h-full">
        {/* 地圖本身由 Map 組件渲染，這裡不需要額外的元素 */}
      </div>

      {/* 控制面板 */}
      {showControls && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-64">
          <div className="space-y-3">
            {/* 標題 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">☕ Starbucks 搜尋</h3>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* 狀態資訊 */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">可見範圍:</span>
                <span className="font-medium text-blue-600">{visibleCount} 個</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">總計:</span>
                <span className="font-medium">{totalCount} 個</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">搜尋次數:</span>
                <span className="font-medium">{searchCount} 次</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">地圖狀態:</span>
                <span className={`font-medium ${isIdle ? 'text-green-600' : 'text-orange-600'}`}>
                  {isIdle ? '靜止' : '移動中'}
                </span>
              </div>
            </div>

            {/* 載入狀態 */}
            {loading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">搜尋中...</span>
              </div>
            )}

            {/* 錯誤訊息 */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                ❌ {error}
              </div>
            )}

            {/* 邊界資訊 */}
            {bounds && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>中心: {bounds.center.lat.toFixed(4)}, {bounds.center.lng.toFixed(4)}</div>
                <div>縮放: {bounds.zoom}</div>
              </div>
            )}

            {/* 操作按鈕 */}
            <div className="space-y-2">
              <button
                onClick={handleManualSearch}
                disabled={loading || !bounds}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 手動搜尋
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleCircles(true)}
                  className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                >
                  顯示圓圈
                </button>
                <button
                  onClick={() => toggleCircles(false)}
                  className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                >
                  隱藏圓圈
                </button>
              </div>

              <button
                onClick={handleClear}
                className="w-full px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
              >
                🗑️ 清除結果
              </button>
            </div>

            {/* 說明 */}
            <div className="text-xs text-gray-500 border-t pt-2">
              💡 拖拉或縮放地圖自動搜尋當前範圍的 Starbucks
            </div>
          </div>
        </div>
      )}

      {/* 收起的控制按鈕 */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 hover:bg-white"
        >
          ☕
        </button>
      )}

      {/* 結果計數器 (右上角) */}
      {(totalCount > 0 || loading) && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-blue-600">☕</span>
            )}
            <span className="text-sm font-medium">
              {loading ? '搜尋中...' : `${visibleCount}/${totalCount}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StarbucksMapContainer(props: StarbucksMapContainerProps) {
  const {
    initialCenter = { lat: 35.6762, lng: 139.6503 },
    initialZoom = 13,
    className = ''
  } = props;

  return (
    <div className={`w-full h-full ${className}`}>
      <Map
        defaultCenter={initialCenter}
        defaultZoom={initialZoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="starbucks-search-map"
        className="w-full h-full"
      >
        <StarbucksMapContent {...props} />
      </Map>
    </div>
  );
}