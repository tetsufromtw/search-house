'use client';

/**
 * 多需求搜尋容器組件
 * 整合地圖、控制面板和統計資訊
 */

import React, { useState, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { useMapBoundsListener } from '@/hooks/useMapBoundsListener';
import { useMultiLocationSearch } from '@/hooks/useMultiLocationSearch';
import { RequirementType } from '@/types/multiLocationSearch';
import { SEARCH_REQUIREMENTS } from '@/config/searchRequirements';
import { MapScreenshotButton } from './MapScreenshotButton';

// 預設地圖中心（東京車站）
const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 };
const DEFAULT_ZOOM = 15;

/**
 * 控制面板組件
 */
interface ControlPanelProps {
  state: any;
  stats: any;
  requirements: any;
  toggleRequirement: (id: RequirementType) => void;
  manualSearch: () => void;
  clearAll: () => void;
  bounds: any;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
}

function ControlPanel({
  state,
  stats,
  requirements,
  toggleRequirement,
  manualSearch,
  clearAll,
  bounds,
  mapContainerRef
}: ControlPanelProps) {
  return (
    <div className="w-80 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">搜尋控制</h2>
      
      {/* 需求切換器 */}
      <div className="space-y-4 mb-6">
        {Object.entries(requirements).map(([key, requirement]) => {
          const requirementId = key as RequirementType;
          const config = SEARCH_REQUIREMENTS[requirementId];
          
          return (
            <div key={requirementId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      backgroundColor: config.color.hex.fill,
                      borderColor: config.color.hex.stroke
                    }}
                  />
                  <span className="font-medium text-gray-900">
                    {requirement.displayName}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {/* 啟用/停用 */}
                  <button
                    onClick={() => toggleRequirement(requirementId)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      requirement.enabled
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {requirement.enabled ? '✓ 啟用' : '✕ 停用'}
                  </button>
                </div>
              </div>
              
              {/* 狀態資訊 */}
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>地點數量:</span>
                  <span className="font-medium">
                    {stats.visibleByRequirement[requirementId]} / {stats.locationsByRequirement[requirementId]}
                  </span>
                </div>
                
                {requirement.loading && (
                  <div className="text-blue-600">🔄 搜尋中...</div>
                )}
                
                {requirement.error && (
                  <div className="text-red-600 text-xs">
                    ❌ {requirement.error}
                  </div>
                )}
                
                {requirement.lastSearchTime && (
                  <div className="text-gray-500 text-xs">
                    最後搜尋: {new Date(requirement.lastSearchTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 操作按鈕 */}
      <div className="space-y-3">
        <button
          onClick={manualSearch}
          disabled={state.isAnyLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.isAnyLoading ? '搜尋中...' : '手動搜尋'}
        </button>
        
        <button
          onClick={clearAll}
          className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          清除全部
        </button>
        
        {/* 截圖按鈕 */}
        <div className="pt-3 border-t border-gray-200">
          <MapScreenshotButton
            mapContainerRef={mapContainerRef}
            className="w-full"
            defaultOptions={{
              filename: 'search-house-map',
              quality: 0.9,
              includeTimestamp: true
            }}
            onSuccess={() => {
              console.log('✅ 地圖截圖下載成功');
            }}
            onError={(error) => {
              console.error('❌ 地圖截圖失敗:', error);
            }}
          />
        </div>
      </div>
      
      {/* 統計資訊 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">統計資訊</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">總搜尋次數:</span>
            <span className="font-medium">{state.totalSearchCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">總地點數:</span>
            <span className="font-medium">{stats.totalLocations}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">可見地點:</span>
            <span className="font-medium">{stats.visibleLocations}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">錯誤數量:</span>
            <span className={`font-medium ${state.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {state.errorCount}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">載入狀態:</span>
            <span className={`font-medium ${state.isAnyLoading ? 'text-blue-600' : 'text-green-600'}`}>
              {state.isAnyLoading ? '載入中' : '閒置'}
            </span>
          </div>
        </div>
      </div>
      
      {/* 聚合資訊 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">聚合模式</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">聚合狀態:</span>
            <span className={`font-medium px-2 py-1 rounded text-xs ${bounds && bounds.zoom < 14 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
              {bounds && bounds.zoom < 14 ? '啟用' : '停用'}
            </span>
          </div>
          
          {bounds && (
            <div className="flex justify-between">
              <span className="text-gray-600">縮放等級:</span>
              <span className="font-medium">{bounds.zoom.toFixed(1)}</span>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded space-y-1">
            <div>💡 縮放等級 &lt; 14 時自動啟用聚合模式</div>
            <div>🎯 多個需求時只顯示與其他需求有交集的圓圈</div>
            <div>📍 單一需求時顯示該需求的所有圓圈</div>
          </div>
        </div>
      </div>
      
      {/* 邊界資訊 */}
      {bounds && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">地圖邊界</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>中心: {bounds.center.lat.toFixed(4)}, {bounds.center.lng.toFixed(4)}</div>
            <div>縮放: {bounds.zoom}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 地圖內部組件（處理 hook 邏輯）
 */
function MapSearchLogic({ onStateChange }: { onStateChange: (data: any) => void }) {
  const map = useMap();
  
  // 地圖邊界監聽
  const { bounds } = useMapBoundsListener(map);
  
  // 多需求搜尋
  const searchResult = useMultiLocationSearch(map, bounds, {
    parallelSearch: true,
    autoUpdate: true,
    debounceDelay: 500
  });

  // 穩定狀態傳遞
  const stableSearchResult = React.useMemo(() => searchResult, [
    searchResult.state.totalSearchCount,
    searchResult.state.isAnyLoading,
    searchResult.state.errorCount,
    searchResult.stats.totalLocations,
    searchResult.stats.visibleLocations
  ]);

  // 將狀態傳遞給父組件
  React.useEffect(() => {
    onStateChange({ ...stableSearchResult, bounds });
  }, [stableSearchResult, bounds, onStateChange]);

  // 這個組件只處理邏輯，不渲染任何 UI
  return null;
}

/**
 * 主容器組件
 */
export function MultiSearchContainer() {
  const [searchData, setSearchData] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleStateChange = React.useCallback((data: any) => {
    setSearchData(data);
  }, []);

  return (
    <div className="flex gap-6">
      {/* 控制面板 */}
      {searchData && (
        <ControlPanel
          state={searchData.state}
          stats={searchData.stats}
          requirements={searchData.requirements}
          toggleRequirement={searchData.toggleRequirement}
          manualSearch={searchData.manualSearch}
          clearAll={searchData.clearAll}
          bounds={searchData.bounds}
          mapContainerRef={mapContainerRef}
        />
      )}
      
      {/* 地圖區域 */}
      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
        <div 
          ref={mapContainerRef}
          style={{ width: '100%', height: '700px', position: 'relative' }}
          className="map-screenshot-container"
        >
          <Map
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
            className="w-full h-full"
            mapId="multi-search-map"
          >
            <MapSearchLogic onStateChange={handleStateChange} />
          </Map>
        </div>
      </div>
    </div>
  );
}