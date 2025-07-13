/**
 * 房屋搜尋主頁面組件
 * 整合所有子組件，實現完整的房屋搜尋功能
 */

'use client';

import React, { useRef } from 'react';
import { RequirementSection } from './RequirementSection';
import { FilterPanel } from './FilterPanel';
import { MapContainer } from './MapContainer';
import { SearchResultList } from './SearchResultList';
import { useHouseSearchWithMap } from '../hooks';

interface HouseSearchPageProps {
  className?: string;
}

export const HouseSearchPage: React.FC<HouseSearchPageProps> = ({ className = '' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    // 狀態
    requirements,
    intersectionAreas,
    properties,
    ui,
    isSearching,
    canSearch,
    
    // 需求相關
    updateRequirement,
    searchLocations,
    
    // 搜尋相關
    performSearch,
    clearSearch,
    
    // UI 相關
    selectProperty,
    setMapCenter,
    
    // 地圖相關
    initializeMap,
    handleMapCenterChange,
  } = useHouseSearchWithMap();

  // 處理需求更新 - 只更新文字，不觸發搜尋
  const handleUpdateRequirement = (id: string, query: string) => {
    updateRequirement(id, { query });
  };

  // 處理需求開關
  const handleToggleRequirement = (id: string) => {
    toggleRequirement(id);
  };

  // 處理房源點擊
  const handlePropertyClick = (property: any) => {
    selectProperty(property);
    
    if (property.url) {
      console.log('🔗 開啟房源頁面:', property.url);
      window.open(property.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* 上方需求輸入區域 - 居中顯示 */}
      <div className="container mx-auto px-4 py-6">
        <RequirementSection
          requirements={requirements}
          isSearching={isSearching}
          canSearch={canSearch}
          onUpdateRequirement={handleUpdateRequirement}
          onToggleRequirement={handleToggleRequirement}
          onPerformSearch={performSearch}
          onClearSearch={clearSearch}
        />
      </div>

      {/* 主要內容區域 - 全寬度 1:2:5:2:1 布局 */}
      <div className="w-full px-4">
        <div className="grid grid-cols-11 gap-4 h-[600px]">
          {/* 左側廣告區 - 1/11 */}
          <div className="col-span-1 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg shadow-md flex items-center justify-center">
            <div className="text-gray-400 text-xs text-center transform -rotate-90 whitespace-nowrap">
              廣告位置
            </div>
          </div>

          {/* 篩選條件區 - 2/11 */}
          <div className="col-span-2">
            <FilterPanel
              intersectionAreas={intersectionAreas}
              onSelectIntersection={(area) => {
                setMapCenter(area.center);
                console.log('選中交集區域:', area);
              }}
              className="h-full"
            />
          </div>

          {/* 地圖區域 - 5/11 */}
          <div className="col-span-5">
            <MapContainer
              ref={mapContainerRef}
              center={ui.mapCenter}
              zoom={ui.mapZoom}
              onMapReady={initializeMap}
              onCenterChange={handleMapCenterChange}
              className="h-full rounded-lg shadow-md overflow-hidden"
            />
          </div>

          {/* 搜尋結果區 - 2/11 */}
          <div className="col-span-2">
            <SearchResultList
              properties={properties}
              isSearching={isSearching}
              selectedProperty={ui.selectedProperty}
              onSelectProperty={selectProperty}
              onOpenProperty={handlePropertyClick}
              className="h-full"
            />
          </div>

          {/* 右側廣告區 - 1/11 */}
          <div className="col-span-1 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg shadow-md flex items-center justify-center">
            <div className="text-gray-400 text-xs text-center transform -rotate-90 whitespace-nowrap">
              廣告位置
            </div>
          </div>
        </div>
      </div>

      {/* 底部資訊區域 */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>搜尋結果: {properties.length} 個物件</span>
              <span>交集區域: {intersectionAreas.length} 個</span>
              <span>啟用需求: {requirements.filter(r => r.requirement.enabled).length}/3</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Powered by</span>
              <span className="font-medium text-blue-600">Search House</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};