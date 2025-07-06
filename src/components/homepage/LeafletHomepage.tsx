'use client';

/**
 * 主頁 Leaflet + SUUMO 整合元件
 * 基於 LeafletMultiSearchContainer 改造
 */

import React, { useState, useRef, useCallback } from 'react';
import LeafletMap, { LeafletCircleManager } from '../leaflet/LeafletMap';
import { searchNearbyPlaces } from '@/services/placesService';
import { searchSuumoProperties } from '@/utils/suumoIntegration';
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
  url?: string;
  coordinates?: { lat: number; lng: number };
  size?: string;
  tags?: string[];
}

interface RequirementInput {
  id: string;
  query: string;
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

// 預設需求顏色
const REQUIREMENT_COLORS = ['#00704A', '#FF6B35', '#4ECDC4'];

export default function LeafletHomepage() {
  const mapRef = useRef<any>(null);
  const circleManagerRef = useRef<LeafletCircleManager | null>(null);
  
  // 三個需求輸入
  const [requirements, setRequirements] = useState<RequirementInput[]>([
    {
      id: 'req1',
      query: '',
      color: REQUIREMENT_COLORS[0],
      enabled: true,
      loading: false,
      error: null,
      locations: []
    },
    {
      id: 'req2', 
      query: '',
      color: REQUIREMENT_COLORS[1],
      enabled: true,
      loading: false,
      error: null,
      locations: []
    },
    {
      id: 'req3',
      query: '',
      color: REQUIREMENT_COLORS[2],
      enabled: true,
      loading: false,
      error: null,
      locations: []
    }
  ]);

  const [intersectionAreas, setIntersectionAreas] = useState<IntersectionArea[]>([]);
  const [properties, setProperties] = useState<PropertyResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter] = useState<[number, number]>([35.6762, 139.6503]);

  /**
   * 地圖準備就緒回調
   */
  const handleMapReady = useCallback((map: any) => {
    console.log('🗺️ Leaflet 地圖準備就緒');
    mapRef.current = map;
    circleManagerRef.current = new LeafletCircleManager(map);
  }, []);

  /**
   * 更新需求輸入
   */
  const updateRequirement = useCallback((id: string, query: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === id ? { ...req, query } : req
    ));
  }, []);

  /**
   * 切換需求啟用狀態
   */
  const toggleRequirement = useCallback((id: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === id ? { ...req, enabled: !req.enabled } : req
    ));
  }, []);

  /**
   * 執行搜尋
   */
  const handleSearch = useCallback(async () => {
    if (!mapRef.current || !circleManagerRef.current) {
      console.warn('⚠️ 地圖未準備好');
      return;
    }

    // 檢查是否有啟用的需求
    const enabledRequirements = requirements.filter(req => req.enabled && req.query.trim());
    
    if (enabledRequirements.length < 2) {
      console.warn('⚠️ 至少需要2個需求才能計算交集');
      return;
    }

    setIsSearching(true);
    console.log('🔍 開始主頁搜尋');

    try {
      // 清除現有圓圈
      circleManagerRef.current.clearAll();

      // 獲取地圖中心
      const center = mapRef.current.getCenter();
      console.log('📍 搜尋中心:', { lat: center.lat, lng: center.lng });

      // 更新需求狀態為載入中
      setRequirements(prev => prev.map(req => 
        enabledRequirements.some(enabled => enabled.id === req.id)
          ? { ...req, loading: true, error: null }
          : req
      ));

      // 搜尋各個需求的地點
      const requirementCircles: ReturnType<typeof createRequirementCircle>[] = [];
      const updatedRequirements: RequirementInput[] = [];

      for (const req of enabledRequirements) {
        try {
          // 使用 OSM 搜尋地點
          const searchResult = await searchNearbyPlaces(
            [req.query], // 使用輸入的查詢字串
            { lat: center.lat, lng: center.lng },
            1000 // 搜尋半徑
          );

          const searchData = searchResult.results[req.query];
          
          if (searchData && searchData.locations.length > 0) {
            const locations = searchData.locations.map((loc: any) => ({
              id: loc.id,
              name: loc.name,
              lat: loc.lat,
              lng: loc.lng,
              address: loc.address || ''
            }));

            // 建立需求圓圈
            const circle = createRequirementCircle(
              req.query,
              req.query,
              req.color,
              locations,
              500 // 500m 半徑
            );
            requirementCircles.push(circle);

            // 在地圖上顯示圓圈
            await circleManagerRef.current!.addRequirementCircle(
              req.id,
              [circle.center.lat, circle.center.lng],
              circle.radius,
              req.color,
              req.query,
              locations
            );

            updatedRequirements.push({
              ...req,
              loading: false,
              error: null,
              locations
            });

            console.log(`✅ 需求 ${req.query} 完成: ${locations.length} 個地點`);
          } else {
            console.warn(`⚠️ 需求 ${req.query} 沒有找到地點`);
            updatedRequirements.push({
              ...req,
              loading: false,
              error: '沒有找到地點',
              locations: []
            });
          }
        } catch (error) {
          console.error(`❌ 需求 ${req.query} 搜尋失敗:`, error);
          updatedRequirements.push({
            ...req,
            loading: false,
            error: error instanceof Error ? error.message : '搜尋失敗',
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
        for (const [index, intersection] of intersections.entries()) {
          await circleManagerRef.current!.addIntersectionArea(
            `${index}`,
            [intersection.center.lat, intersection.center.lng],
            intersection.radius,
            intersection.requirements
          );
        }

        setIntersectionAreas(intersections);

        // 搜尋交集區域的租屋
        if (intersections.length > 0) {
          await handleSearchProperties(intersections.slice(0, 3));
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

      // 適應地圖視角
      if (requirementCircles.length > 0) {
        await circleManagerRef.current.fitAllCircles();
      }

      console.log('✅ 主頁搜尋完成');

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
  }, [requirements]);

  /**
   * 搜尋交集區域的租屋
   */
  const handleSearchProperties = useCallback(async (intersections: IntersectionArea[]) => {
    console.log('🏠 搜尋交集區域租屋:', intersections.length);

    try {
      const allProperties: PropertyResult[] = [];

      for (const intersection of intersections) {
        const result = await searchSuumoProperties(
          intersection.center,
          intersection.radius
        );

        if (result.success && result.properties.length > 0) {
          const properties = result.properties.map(prop => ({
            id: prop.id || Math.random().toString(),
            title: prop.title || '未知標題',
            price: prop.price || '價格未提供',
            location: prop.location || '位置未提供',
            url: prop.url,
            coordinates: prop.coordinates,
            size: prop.size,
            tags: prop.tags
          }));
          allProperties.push(...properties);
        }
      }

      // 去重並限制為前5個
      const uniqueProperties = allProperties.filter((prop, index, self) => 
        index === self.findIndex(p => p.id === prop.id)
      ).slice(0, 5);

      setProperties(uniqueProperties);
      console.log(`🏠 找到 ${uniqueProperties.length} 個租屋物件`);

    } catch (error) {
      console.error('❌ 租屋搜尋失敗:', error);
      setProperties([]);
    }
  }, []);

  /**
   * 清除所有內容
   */
  const handleClear = useCallback(() => {
    if (circleManagerRef.current) {
      circleManagerRef.current.clearAll();
    }
    
    setRequirements(prev => prev.map(req => ({
      ...req,
      query: '',
      loading: false,
      error: null,
      locations: []
    })));

    setIntersectionAreas([]);
    setProperties([]);
    
    console.log('🧹 清除所有內容');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 上方需求輸入區域 */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏠 租屋交集搜尋
            </h1>
            <p className="text-gray-600">
              輸入三個需求，找出最佳交集區域的租屋物件
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {requirements.map((req, index) => (
                <div key={req.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: req.color }}
                    />
                    <label className="text-sm font-medium text-gray-700">
                      需求 {index + 1}
                    </label>
                    <button
                      onClick={() => toggleRequirement(req.id)}
                      className={`px-2 py-1 rounded text-xs ${
                        req.enabled 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {req.enabled ? '✓' : '✕'}
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="例如：星巴克、健身房、便利商店"
                    value={req.query}
                    onChange={(e) => updateRequirement(req.id, e.target.value)}
                    disabled={!req.enabled || req.loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  
                  {req.error && (
                    <p className="text-xs text-red-600">{req.error}</p>
                  )}
                  
                  {req.loading && (
                    <p className="text-xs text-blue-600">🔄 搜尋中...</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleSearch}
                disabled={isSearching || requirements.filter(r => r.enabled && r.query.trim()).length < 2}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSearching ? '🔍 搜尋中...' : '🚀 開始搜尋'}
              </button>
              
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                🧹 清除
              </button>
            </div>
          </div>
        </div>

        {/* 地圖與結果區域 */}
        <div className="flex gap-6">
          {/* 地圖區域 */}
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
            <LeafletMap
              center={mapCenter}
              zoom={13}
              className="w-full h-[600px]"
              onMapReady={handleMapReady}
            />
          </div>

          {/* 右側結果區域 */}
          <div className="w-80 space-y-4">
            {/* 交集區域資訊 */}
            {intersectionAreas.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-lg mb-3">🎯 交集區域</h3>
                <div className="space-y-2">
                  {intersectionAreas.slice(0, 3).map((area, index) => (
                    <div key={area.id} className="p-3 bg-orange-50 rounded text-sm">
                      <div className="font-medium">區域 {index + 1}</div>
                      <div className="text-gray-600">
                        半徑: {area.radius}m
                      </div>
                      <div className="text-gray-600">
                        分數: {area.score.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 租屋物件 */}
            {properties.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-lg mb-3">🏠 租屋物件 (前5個)</h3>
                <div className="space-y-3">
                  {properties.map((property, index) => (
                    <div 
                      key={property.id} 
                      className="p-3 bg-green-50 rounded text-sm cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => {
                        if (property.url) {
                          console.log('🔗 開啟 SUUMO 物件頁面:', property.url);
                          window.open(property.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <div className="font-medium text-green-800">{property.title}</div>
                      <div className="text-green-700 font-semibold">{property.price}</div>
                      <div className="text-gray-600">{property.location}</div>
                      {property.size && (
                        <div className="text-gray-500 text-xs">面積: {property.size}</div>
                      )}
                      {property.url && (
                        <div className="text-blue-600 text-xs mt-1">點擊查看詳情 →</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 搜尋說明 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💡 使用說明</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• 輸入至少2個需求</li>
                <li>• 系統會計算交集區域</li>
                <li>• 橘色虛線是交集範圍</li>
                <li>• 自動搜尋附近租屋</li>
                <li>• 點擊物件可查看詳情</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}