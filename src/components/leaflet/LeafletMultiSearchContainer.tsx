'use client';

/**
 * Leaflet 多重需求搜尋容器
 * 完全免費的 Google Maps 替代方案
 */

import React, { useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import LeafletMap, { LeafletCircleManager, leafletBoundsToMapBounds } from './LeafletMap';
import { searchNearbyPlaces } from '@/services/placesService';
import { searchPropertiesWithRequirements } from '@/services/suumoIntegration';
import { LeafletIntersectionCalculator, createRequirementCircle } from '@/utils/leafletIntersection';

// 型別定義
interface IntersectionArea {
  id: string;
  center: { lat: number; lng: number };
  radius: number;
  requirements: string[];
  score: number;
}

interface PropertyResult {
  id: string;
  title: string;
  price: string;
  location: string;
}

// 預設需求配置
const DEFAULT_REQUIREMENTS = [
  {
    id: 'starbucks',
    displayName: '星巴克',
    color: '#00704A',
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'gym',
    displayName: '健身房',
    color: '#FF6B35',
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'convenience',
    displayName: '便利商店',
    color: '#4ECDC4',
    enabled: false,
    defaultEnabled: false
  }
];

interface RequirementState {
  id: string;
  displayName: string;
  color: string;
  enabled: boolean;
  loading: boolean;
  error: string | null;
  locations: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
  }>;
}

interface SearchStats {
  totalLocations: number;
  totalRequirements: number;
  enabledRequirements: number;
  intersectionAreas: number;
  totalApiCost: number;
  searchRadius: number;
}

export default function LeafletMultiSearchContainer() {
  const mapRef = useRef<L.Map | null>(null);
  const circleManagerRef = useRef<LeafletCircleManager | null>(null);
  
  const [requirements, setRequirements] = useState<RequirementState[]>(
    DEFAULT_REQUIREMENTS.map(req => ({
      ...req,
      loading: false,
      error: null,
      locations: []
    }))
  );

  const [searchStats, setSearchStats] = useState<SearchStats>({
    totalLocations: 0,
    totalRequirements: DEFAULT_REQUIREMENTS.length,
    enabledRequirements: DEFAULT_REQUIREMENTS.filter(r => r.enabled).length,
    intersectionAreas: 0,
    totalApiCost: 0,
    searchRadius: 1000
  });

  const [intersectionAreas, setIntersectionAreas] = useState<IntersectionArea[]>([]);
  const [properties, setProperties] = useState<PropertyResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter] = useState<[number, number]>([35.6762, 139.6503]);

  /**
   * 地圖準備就緒回調
   */
  const handleMapReady = useCallback((map: L.Map) => {
    console.log('🗺️ Leaflet 地圖準備就緒');
    mapRef.current = map;
    circleManagerRef.current = new LeafletCircleManager(map);

    // 設定全域函數供彈窗使用
    (window as typeof window & { searchPropertiesInArea?: (lat: number, lng: number, radius: number) => void }).searchPropertiesInArea = (lat: number, lng: number, radius: number) => {
      console.log('🏠 從地圖彈窗觸發租屋搜尋:', { lat, lng, radius });
      handleSearchProperties([{ center: { lat, lng }, radius, requirements: [] }]);
    };
  }, []);

  /**
   * 地圖邊界變化回調
   */
  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    const mapBounds = leafletBoundsToMapBounds(bounds);
    console.log('🗺️ 地圖邊界變化:', mapBounds);
    
    // 可以在這裡實作自動搜尋
    // if (autoUpdate && enabledRequirements.length > 0) {
    //   handleSearch();
    // }
  }, []);

  /**
   * 切換需求啟用狀態
   */
  const toggleRequirement = useCallback((requirementId: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === requirementId 
        ? { ...req, enabled: !req.enabled }
        : req
    ));

    console.log(`🔄 切換需求: ${requirementId}`);
  }, []);

  /**
   * 執行搜尋
   */
  const handleSearch = useCallback(async () => {
    if (!mapRef.current || !circleManagerRef.current) {
      console.warn('⚠️ 地圖或圓圈管理器未準備好');
      return;
    }

    setIsSearching(true);
    console.log('🔍 開始 Leaflet 多重搜尋');

    try {
      // 清除現有圓圈
      circleManagerRef.current.clearAll();

      // 獲取啟用的需求
      const enabledRequirements = requirements.filter(req => req.enabled);
      
      if (enabledRequirements.length === 0) {
        console.warn('⚠️ 沒有啟用的需求');
        return;
      }

      // 獲取地圖中心
      const center = mapRef.current.getCenter();
      console.log('📍 搜尋中心:', { lat: center.lat, lng: center.lng });

      // 更新需求狀態為載入中
      setRequirements(prev => prev.map(req => 
        enabledRequirements.some(enabled => enabled.id === req.id)
          ? { ...req, loading: true, error: null }
          : req
      ));

      // 使用 OSM 搜尋店鋪
      const searchResult = await searchNearbyPlaces(
        enabledRequirements.map(req => req.id),
        { lat: center.lat, lng: center.lng },
        searchStats.searchRadius
      );

      console.log('🗺️ OSM 搜尋結果:', searchResult);

      // 更新需求資料和圓圈
      const updatedRequirements: RequirementState[] = [];
      const requirementCircles: ReturnType<typeof createRequirementCircle>[] = [];

      for (const req of enabledRequirements) {
        const searchData = searchResult.results[req.id];
        
        if (searchData && searchData.locations.length > 0) {
          const locations = searchData.locations.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            lat: loc.lat,
            lng: loc.lng,
            address: loc.address || ''
          }));

          // 建立需求圓圈
          try {
            const circle = createRequirementCircle(
              req.id,
              req.displayName,
              req.color,
              locations,
              500 // 500m 半徑
            );
            requirementCircles.push(circle);

            // 在地圖上顯示圓圈
            circleManagerRef.current!.addRequirementCircle(
              req.id,
              [circle.center.lat, circle.center.lng],
              circle.radius,
              req.color,
              req.displayName,
              locations
            );

            updatedRequirements.push({
              ...req,
              loading: false,
              error: null,
              locations
            });

            console.log(`✅ 需求 ${req.displayName} 完成: ${locations.length} 個地點`);
          } catch (error) {
            console.error(`❌ 需求 ${req.displayName} 建立圓圈失敗:`, error);
            updatedRequirements.push({
              ...req,
              loading: false,
              error: error instanceof Error ? error.message : '建立圓圈失敗',
              locations: []
            });
          }
        } else {
          console.warn(`⚠️ 需求 ${req.displayName} 沒有找到地點`);
          updatedRequirements.push({
            ...req,
            loading: false,
            error: '沒有找到地點',
            locations: []
          });
        }
      }

      // 計算交集
      if (requirementCircles.length >= 2) {
        console.log('🧮 計算交集區域');
        const intersections = LeafletIntersectionCalculator.calculateIntersections(
          requirementCircles,
          300, // 最小交集半徑
          800  // 最大交集半徑
        );

        console.log(`🎯 找到 ${intersections.length} 個交集區域`);

        // 在地圖上顯示交集
        intersections.forEach((intersection, index) => {
          circleManagerRef.current!.addIntersectionArea(
            `${index}`,
            [intersection.center.lat, intersection.center.lng],
            intersection.radius,
            intersection.requirements
          );
        });

        setIntersectionAreas(intersections);

        // 搜尋交集區域的租屋
        if (intersections.length > 0) {
          await handleSearchProperties(intersections.slice(0, 3)); // 最多搜尋 3 個區域
        }
      } else {
        setIntersectionAreas([]);
        setProperties([]);
      }

      // 更新需求狀態
      setRequirements(prev => prev.map(req => {
        const updated = updatedRequirements.find(u => u.id === req.id);
        return updated || { ...req, loading: false };
      }));

      // 更新統計
      const totalLocations = updatedRequirements.reduce((sum, req) => sum + req.locations.length, 0);
      setSearchStats(prev => ({
        ...prev,
        totalLocations,
        enabledRequirements: enabledRequirements.length,
        intersectionAreas: intersectionAreas.length,
        totalApiCost: searchResult.total_cost
      }));

      // 適應地圖視角
      if (requirementCircles.length > 0) {
        circleManagerRef.current.fitAllCircles();
      }

      console.log('✅ Leaflet 多重搜尋完成');

    } catch (error) {
      console.error('❌ 搜尋失敗:', error);
      
      // 清除載入狀態
      setRequirements(prev => prev.map(req => ({
        ...req,
        loading: false,
        error: error instanceof Error ? error.message : '搜尋失敗'
      })));
    } finally {
      setIsSearching(false);
    }
  }, [requirements, searchStats.searchRadius]);

  /**
   * 搜尋交集區域的租屋
   */
  const handleSearchProperties = useCallback(async (intersections: IntersectionArea[]) => {
    console.log('🏠 搜尋交集區域租屋:', intersections.length);

    try {
      const allProperties: PropertyResult[] = [];

      for (const intersection of intersections) {
        const result = await searchPropertiesWithRequirements(
          intersection.requirements || ['starbucks', 'gym'],
          intersection.center,
          800, // 搜尋半徑
          intersection.radius // 交集半徑
        );

        if (result.property_results.length > 0) {
          const properties = result.property_results.flatMap(pr => pr.properties.map(prop => ({
            id: prop.id || Math.random().toString(),
            title: prop.title || '未知標題',
            price: prop.price || '價格未提供',
            location: prop.location || '位置未提供'
          })));
          allProperties.push(...properties);
        }
      }

      setProperties(allProperties);
      console.log(`🏠 找到 ${allProperties.length} 個租屋物件`);

    } catch (error) {
      console.error('❌ 租屋搜尋失敗:', error);
    }
  }, []);

  /**
   * 清除所有圓圈
   */
  const handleClearAll = useCallback(() => {
    if (circleManagerRef.current) {
      circleManagerRef.current.clearAll();
    }
    
    setRequirements(prev => prev.map(req => ({
      ...req,
      enabled: req.defaultEnabled,
      loading: false,
      error: null,
      locations: []
    })));

    setIntersectionAreas([]);
    setProperties([]);
    
    console.log('🧹 清除所有搜尋結果');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 標題 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗺️ 免費多重需求搜尋
          </h1>
          <p className="text-gray-600">
            Leaflet + OpenStreetMap • 完全零成本
          </p>
        </div>

        <div className="flex gap-6">
          {/* 控制面板 */}
          <div className="w-80 space-y-4">
            {/* 搜尋控制 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-lg mb-3">搜尋控制</h3>
              
              <div className="space-y-3 mb-4">
                {requirements.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: req.color }}
                      />
                      <span className="font-medium">{req.displayName}</span>
                      {req.loading && <span className="text-sm text-blue-600">🔄</span>}
                    </div>
                    
                    <button
                      onClick={() => toggleRequirement(req.id)}
                      disabled={req.loading}
                      className={`px-3 py-1 rounded text-sm ${
                        req.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {req.enabled ? '✓ 啟用' : '✕ 停用'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={isSearching || requirements.filter(r => r.enabled).length === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSearching ? '🔍 搜尋中...' : '🚀 開始搜尋'}
                </button>
                
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  🧹 清除
                </button>
              </div>
            </div>

            {/* 統計資訊 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-lg mb-3">搜尋統計</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>總地點數:</span>
                  <span className="font-medium">{searchStats.totalLocations}</span>
                </div>
                <div className="flex justify-between">
                  <span>啟用需求:</span>
                  <span className="font-medium">{searchStats.enabledRequirements}/{searchStats.totalRequirements}</span>
                </div>
                <div className="flex justify-between">
                  <span>交集區域:</span>
                  <span className="font-medium">{intersectionAreas.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>租屋物件:</span>
                  <span className="font-medium">{properties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>API 費用:</span>
                  <span className="font-medium text-green-600">${searchStats.totalApiCost.toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* 交集區域資訊 */}
            {intersectionAreas.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-lg mb-3">🎯 交集區域</h3>
                <div className="space-y-2">
                  {intersectionAreas.slice(0, 3).map((area, index) => (
                    <div key={area.id} className="p-2 bg-orange-50 rounded text-sm">
                      <div className="font-medium">區域 {index + 1}</div>
                      <div className="text-gray-600">
                        需求: {area.requirements.join(', ')}
                      </div>
                      <div className="text-gray-600">
                        半徑: {area.radius}m • 分數: {area.score.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 租屋物件 */}
            {properties.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-lg mb-3">🏠 租屋物件</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {properties.slice(0, 5).map((property, index) => (
                    <div key={property.id || index} className="p-2 bg-green-50 rounded text-sm">
                      <div className="font-medium">{property.title}</div>
                      <div className="text-green-700">¥{property.price}</div>
                      <div className="text-gray-600">{property.location}</div>
                    </div>
                  ))}
                  {properties.length > 5 && (
                    <div className="text-center text-gray-500 text-sm">
                      ... 還有 {properties.length - 5} 個物件
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 地圖區域 */}
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
            <LeafletMap
              center={mapCenter}
              zoom={13}
              className="w-full h-[800px]"
              onMapReady={handleMapReady}
              onBoundsChange={handleBoundsChange}
            />
          </div>
        </div>

        {/* 說明 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使用說明</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• 🗺️ 使用 Leaflet + OpenStreetMap，完全免費</li>
            <li>• 📍 選擇需求，點擊「開始搜尋」查找店鋪</li>
            <li>• ⭐ 橘色虛線圓圈是交集區域，點擊查看詳情</li>
            <li>• 🏠 自動在交集區域搜尋 SUUMO 租屋資訊</li>
            <li>• 💰 零 Google API 費用，完全使用免費資源</li>
          </ul>
        </div>
      </div>
    </div>
  );
}