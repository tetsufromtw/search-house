/**
 * 簡化重構版首頁 - 直接複製原本邏輯
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import LeafletMap, { LeafletCircleManager } from '../leaflet/LeafletMap';
import { searchNearbyPlaces } from '@/services/placesService';
import { searchSuumoProperties } from '@/utils/suumoIntegration';
import { LeafletIntersectionCalculator, createRequirementCircle } from '@/utils/leafletIntersection';

// 型別定義 - 完全複製原本的
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

export default function SimpleRefactoredHomepage() {
  const mapRef = useRef<any>(null);
  const circleManagerRef = useRef<LeafletCircleManager | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // 完全複製原本的狀態
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

  // 完全複製原本的函數
  const handleMapReady = useCallback((map: any) => {
    console.log('🗺️ Leaflet 地圖準備就緒');
    mapRef.current = map;
    circleManagerRef.current = new LeafletCircleManager(map);
  }, []);

  const updateRequirement = useCallback((id: string, query: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === id ? { ...req, query } : req
    ));
  }, []);

  const toggleRequirement = useCallback((id: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === id ? { ...req, enabled: !req.enabled } : req
    ));
  }, []);

  // 完全複製原本的搜尋邏輯
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

      // 為每個需求搜尋地點並繪製圓圈
      const requirementCircles: ReturnType<typeof createRequirementCircle>[] = [];
      const updatedRequirements = [...requirements];
      
      for (let i = 0; i < enabledRequirements.length; i++) {
        const req = enabledRequirements[i];
        const reqIndex = requirements.findIndex(r => r.id === req.id);
        
        if (reqIndex === -1) continue;

        // 設置載入狀態
        updatedRequirements[reqIndex] = { ...req, loading: true, error: null };
        setRequirements([...updatedRequirements]);

        try {
          console.log(`🔍 搜尋需求 ${i + 1}: ${req.query}`);
          
          // 使用原本的 API
          const searchResult = await searchNearbyPlaces([req.query], { lat: center.lat, lng: center.lng }, 1000);
          
          console.log('🔍 搜尋結果:', searchResult);
          
          const searchData = searchResult.results[req.query];
          
          if (searchData && searchData.locations.length > 0) {
            // 轉換資料格式 - 按照原本的邏輯
            const locations = searchData.locations.map((loc: any) => ({
              id: loc.id,
              name: loc.name,
              lat: loc.lat,
              lng: loc.lng,
              address: loc.address || ''
            }));

            // 更新需求資料
            updatedRequirements[reqIndex] = {
              ...req,
              loading: false,
              error: null,
              locations
            };

            console.log(`✅ 需求 ${i + 1} 找到 ${locations.length} 個地點`);

            // 建立需求圓圈 - 按照原本的邏輯
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

          } else {
            updatedRequirements[reqIndex] = {
              ...req,
              loading: false,
              error: '未找到相關地點',
              locations: []
            };
            console.warn(`⚠️ 需求 ${i + 1} 未找到地點`);
          }

        } catch (error) {
          console.error(`❌ 需求 ${i + 1} 搜尋失敗:`, error);
          updatedRequirements[reqIndex] = {
            ...req,
            loading: false,
            error: '搜尋失敗',
            locations: []
          };
        }

        // 更新狀態
        setRequirements([...updatedRequirements]);
      }

      // 計算交集 - 使用已建立的圓圈
      if (requirementCircles.length >= 2) {
        console.log('🎯 計算交集區域');
        
        const intersections = LeafletIntersectionCalculator.calculateIntersections(requirementCircles);
        console.log(`✅ 找到 ${intersections.length} 個交集區域`);

        // 繪製交集區域
        for (const intersection of intersections.slice(0, 5)) {
          await circleManagerRef.current!.addIntersectionArea(
            intersection.id,
            [intersection.center.lat, intersection.center.lng],
            intersection.radius,
            intersection.requirements
          );
        }

        setIntersectionAreas(intersections);

        // 搜尋房源
        if (intersections.length > 0) {
          console.log('🏠 搜尋租屋物件');
          const propertyPromises = intersections.slice(0, 3).map(area =>
            searchSuumoProperties(area.center, area.radius).catch(error => {
              console.error('房源搜尋失敗:', error);
              return [];
            })
          );

          const propertyResults = await Promise.allSettled(propertyPromises);
          const allProperties: PropertyResult[] = [];
          
          propertyResults.forEach(result => {
            if (result.status === 'fulfilled' && result.value.success) {
              const properties = result.value.properties.map((prop: any) => ({
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
          });

          const uniqueProperties = allProperties.filter((prop, index, self) => 
            index === self.findIndex(p => p.id === prop.id)
          ).slice(0, 5);
          
          setProperties(uniqueProperties);
          console.log(`🎉 找到 ${uniqueProperties.length} 個租屋物件`);
        }

        // 適應地圖邊界
        await circleManagerRef.current!.fitAllCircles();
      }

    } catch (error) {
      console.error('❌ 搜尋過程發生錯誤:', error);
    } finally {
      setIsSearching(false);
      console.log('✅ 搜尋完成');
    }
  }, [requirements]);

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
        {/* 上方需求輸入區域 - 完全複製原本的 */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏠 租屋交集搜尋 (重構版)
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 bg-white"
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
      </div>

      {/* 主要內容區域 - 完全複製原本的布局 */}
      <div className="w-full px-4">
        <div className="grid grid-cols-11 gap-4 h-[600px]">
          {/* 左側廣告區 - 1/11 */}
          <div className="col-span-1 bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
            <div className="text-gray-400 text-xs text-center transform -rotate-90 whitespace-nowrap">
              廣告位置
            </div>
          </div>

          {/* 篩選條件區 - 2/11 */}
          <div className="col-span-2 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">🔧 篩選條件</h3>
            
            {/* 交集區域資訊 */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">🎯 交集區域</h4>
              {intersectionAreas.length > 0 ? (
                <div className="space-y-2">
                  {intersectionAreas.slice(0, 3).map((area, index) => (
                    <div key={area.id} className="p-2 bg-orange-50 rounded text-xs">
                      <div className="font-medium">區域 {index + 1}</div>
                      <div className="text-gray-600">半徑: {area.radius}m</div>
                      <div className="text-gray-600">分數: {area.score.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded text-xs text-gray-500">
                  尚無交集區域
                </div>
              )}
            </div>

            {/* 搜尋說明 */}
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2 text-sm">💡 使用說明</h4>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• 輸入至少2個需求</li>
                <li>• 系統會計算交集區域</li>
                <li>• 橘色虛線是交集範圍</li>
                <li>• 自動搜尋附近租屋</li>
                <li>• 點擊物件可查看詳情</li>
              </ul>
            </div>
          </div>

          {/* 地圖區域 - 5/11 */}
          <div ref={mapContainerRef} className="col-span-5 bg-white rounded-lg shadow-md overflow-hidden">
            <LeafletMap
              center={mapCenter}
              zoom={13}
              className="w-full h-full"
              onMapReady={handleMapReady}
            />
          </div>

          {/* 顯示結果區 - 2/11 */}
          <div className="col-span-2 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">🏠 搜尋結果</h3>
            
            {properties.length > 0 ? (
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
                    <div className="font-medium text-green-800 text-xs mb-1">{property.title}</div>
                    <div className="text-green-700 font-semibold text-sm">{property.price}</div>
                    <div className="text-gray-600 text-xs">{property.location}</div>
                    {property.size && (
                      <div className="text-gray-500 text-xs">面積: {property.size}</div>
                    )}
                    {property.url && (
                      <div className="text-blue-600 text-xs mt-1">點擊查看詳情 →</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                {isSearching ? '🔍 搜尋中...' : '尚無搜尋結果'}
              </div>
            )}
          </div>

          {/* 右側廣告區 - 1/11 */}
          <div className="col-span-1 bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
            <div className="text-gray-400 text-xs text-center transform -rotate-90 whitespace-nowrap">
              廣告位置
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}