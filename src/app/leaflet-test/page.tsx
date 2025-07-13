'use client';

import React, { useState, useRef, useCallback } from 'react';
import LeafletMap, { LeafletCircleManager } from '@/components/leaflet/LeafletMap';
import { searchNearbyPlaces } from '@/services/placesService';

interface SearchLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export default function LeafletTestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [locations, setLocations] = useState<SearchLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<any>(null);
  const circleManagerRef = useRef<LeafletCircleManager | null>(null);

  // 地圖準備就緒
  const handleMapReady = useCallback((map: any) => {
    console.log('🗺️ 地圖準備就緒');
    mapRef.current = map;
    circleManagerRef.current = new LeafletCircleManager(map);
  }, []);

  // 執行搜尋
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapRef.current || !circleManagerRef.current) return;

    setIsSearching(true);
    setError(null);
    
    try {
      // 清除現有圓圈
      circleManagerRef.current.clearAll();

      console.log('🔍 搜尋:', searchQuery);
      
      // 取得地圖當前可見範圍
      const bounds = mapRef.current.getBounds();
      const center = mapRef.current.getCenter();
      
      // 計算搜尋半徑 (地圖可見範圍的最大距離)
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      
      // 計算中心點到邊界的距離
      const distanceToNE = center.distanceTo(northEast);
      const distanceToSW = center.distanceTo(southWest);
      const radius = Math.max(distanceToNE, distanceToSW);
      
      console.log('🗺️ 搜尋範圍:', {
        中心: `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
        半徑: `${Math.round(radius)}m`,
        可見範圍: `${bounds.getSouth().toFixed(4)}, ${bounds.getWest().toFixed(4)} 到 ${bounds.getNorth().toFixed(4)}, ${bounds.getEast().toFixed(4)}`
      });
      
      // 搜尋地點
      const result = await searchNearbyPlaces([searchQuery], center, radius);
      console.log('📡 API 回應:', result);
      
      const searchData = result.results[searchQuery];
      console.log('🔍 搜尋資料:', searchData);
      
      if (searchData && searchData.locations.length > 0) {
        const foundLocations = searchData.locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          address: loc.address || ''
        }));
        
        console.log('📍 找到的地點:', foundLocations);
        setLocations(foundLocations);
        
        // 在地圖上繪製圓圈
        for (let i = 0; i < foundLocations.length; i++) {
          const location = foundLocations[i];
          console.log(`🎯 繪製圓圈 ${i+1}:`, location);
          
          await circleManagerRef.current!.addRequirementCircle(
            `search_${i}`,
            [location.lat, location.lng],
            300, // 半徑 300m
            '#60a5fa', // tailwind blue-400
            location.name,
            [{
              lat: location.lat,
              lng: location.lng,
              name: location.name
            }]
          );
          
          console.log(`✅ 圓圈 ${i+1} 繪製完成`);
        }
        
        console.log(`✅ 找到 ${foundLocations.length} 個地點，已全部繪製`);
      } else {
        setLocations([]);
        setError('沒有找到相關地點');
        console.warn('⚠️ 沒有找到地點');
      }
      
    } catch (err) {
      console.error('❌ 搜尋失敗:', err);
      setError('搜尋失敗，請重試');
      setLocations([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // 按 Enter 鍵搜尋
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗺️ Leaflet 搜尋測試
          </h1>
          <p className="text-gray-600">
            輸入店名或地點，在地圖上顯示搜尋結果
          </p>
        </div>

        {/* 搜尋欄位 */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="例如：anytime fitness, starbucks, 麥當勞"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isSearching ? '🔍 搜尋中...' : '🔍 搜尋'}
            </button>
          </div>
          
          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}
          
          {locations.length > 0 && (
            <p className="mt-2 text-green-600 text-sm">
              ✅ 找到 {locations.length} 個地點
            </p>
          )}
        </div>

        {/* 地圖區域 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-[600px] w-full">
            <LeafletMap
              center={[35.6762, 139.6503]} // 東京
              zoom={13}
              className="w-full h-full"
              onMapReady={handleMapReady}
            />
          </div>
        </div>

        {/* 搜尋結果清單 */}
        {locations.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📍 搜尋結果 ({locations.length} 個地點)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location, index) => (
                <div 
                  key={location.id}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    // 點擊後移動到該地點
                    mapRef.current?.setView([location.lat, location.lng], 16);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-full flex-shrink-0 mt-1"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {location.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {location.address}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        點擊查看位置
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}