'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import ScreenshotButton from '@/components/ScreenshotButton';
import { LeafletCircleManager } from '@/components/leaflet/LeafletMap';
import { searchNearbyPlaces } from '@/services/placesService';

// 動態載入 Leaflet 組件避免 SSR 問題
const LeafletMap = dynamic(() => import('@/components/leaflet/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-gray-600 font-medium">載入地圖中...</div>
    </div>
  )
});

export default function ShadcnPage() {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [bottomPanelMinimized, setBottomPanelMinimized] = useState(false);
  const circleManagerRef = useRef<LeafletCircleManager | null>(null);
  
  // 希望スポット卡片狀態
  const [spotA, setSpotA] = useState({ radius: 1000, color: 'blue', searchText: '', searching: false, locations: [] });
  const [spotB, setSpotB] = useState({ radius: 800, color: 'green', searchText: '', searching: false, locations: [] });
  const [spotC, setSpotC] = useState({ radius: 1200, color: 'purple', searchText: '', searching: false, locations: [] });

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  const toggleRightPanel = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  const toggleBottomPanel = () => {
    setBottomPanelMinimized(!bottomPanelMinimized);
  };

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId) 
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  // 地圖實例準備回調
  const handleMapReady = (map: any) => {
    console.log('🗺️ 地圖實例已準備');
    setMapInstance(map);
    circleManagerRef.current = new LeafletCircleManager(map);
  };

  // 請求使用者定位
  const requestLocation = async () => {
    if (!mapInstance) {
      alert('地圖尚未載入完成，請稍後再試');
      return;
    }

    setIsLocating(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('您的瀏覽器不支援地理定位功能');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('📍 取得使用者位置:', latitude, longitude);

      // 移動地圖到使用者位置
      mapInstance.setView([latitude, longitude], 16);

      // 可選：添加標記
      const L = (await import('leaflet')).default;
      L.marker([latitude, longitude])
        .addTo(mapInstance)
        .bindPopup('您的位置')
        .openPopup();

    } catch (error: any) {
      console.error('❌ 定位失敗:', error);
      
      let errorMessage = '定位失敗，請檢查您的位置權限設定';
      
      if (error.code === 1) {
        errorMessage = '請允許網站存取您的位置資訊';
      } else if (error.code === 2) {
        errorMessage = '無法取得位置資訊，請檢查網路連線';
      } else if (error.code === 3) {
        errorMessage = '定位請求逾時，請重試';
      }
      
      alert(errorMessage);
    } finally {
      setIsLocating(false);
    }
  };

  // 搜尋地點
  const searchLocation = async () => {
    if (!mapInstance || !searchQuery.trim()) {
      return;
    }

    setIsSearching(true);

    try {
      // 使用 Nominatim OpenStreetMap API 進行地址搜尋
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&countrycodes=jp&limit=5&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('搜尋服務暫時無法使用');
      }

      const results = await response.json();
      console.log('🔍 搜尋結果:', results);

      if (results.length === 0) {
        alert('找不到相關地點，請嘗試其他關鍵字');
        return;
      }

      // 使用第一個結果
      const firstResult = results[0];
      const lat = parseFloat(firstResult.lat);
      const lon = parseFloat(firstResult.lon);

      console.log('📍 移動到搜尋結果:', lat, lon, firstResult.display_name);

      // 移動地圖到搜尋結果
      mapInstance.setView([lat, lon], 15);

      // 添加標記
      const L = (await import('leaflet')).default;
      L.marker([lat, lon])
        .addTo(mapInstance)
        .bindPopup(firstResult.display_name)
        .openPopup();

    } catch (error) {
      console.error('❌ 搜尋失敗:', error);
      alert('搜尋失敗，請檢查網路連線或嘗試其他關鍵字');
    } finally {
      setIsSearching(false);
    }
  };

  // Enter 鍵搜尋 - 只針對主搜尋框
  const handleMainSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      searchLocation();
    }
  };

  // 希望スポット搜尋功能
  const searchSpotLocations = async (spotId: 'A' | 'B' | 'C', searchText: string, radius: number, color: string) => {
    if (!mapInstance || !circleManagerRef.current || !searchText.trim()) {
      console.warn('⚠️ 地圖未準備好或搜尋文字為空');
      return;
    }

    // 更新搜尋狀態
    const setSpotState = spotId === 'A' ? setSpotA : spotId === 'B' ? setSpotB : setSpotC;
    setSpotState(prev => ({ ...prev, searching: true }));

    try {
      // 獲取地圖中心
      const center = mapInstance.getCenter();
      console.log(`🔍 搜尋希望スポット${spotId}: ${searchText}`, { center: { lat: center.lat, lng: center.lng }, radius });

      // 使用 placesService 搜尋
      const searchResult = await searchNearbyPlaces([searchText], { lat: center.lat, lng: center.lng }, 2000);
      
      const locations = searchResult.results[searchText]?.locations || [];
      console.log(`✅ 找到 ${locations.length} 個 ${searchText} 地點`);

      if (locations.length > 0) {
        // 清除該 spot 之前的圓圈
        circleManagerRef.current.removeCircle(`spot${spotId}`);

        // 為每個地點畫圓圈
        for (const [index, location] of locations.entries()) {
          const circleId = `spot${spotId}_${index}`;
          await circleManagerRef.current.addRequirementCircle(
            circleId,
            [location.lat, location.lng],
            radius,
            getColorHex(color),
            searchText,
            [{ lat: location.lat, lng: location.lng, name: location.name }]
          );
        }

        // 更新狀態
        setSpotState(prev => ({ 
          ...prev, 
          searching: false, 
          locations: locations.map(loc => ({
            id: loc.id,
            name: loc.name,
            lat: loc.lat,
            lng: loc.lng,
            address: loc.address
          }))
        }));
      } else {
        console.warn(`⚠️ 沒有找到 ${searchText} 相關地點`);
        setSpotState(prev => ({ ...prev, searching: false, locations: [] }));
      }
    } catch (error) {
      console.error(`❌ 搜尋 ${searchText} 失敗:`, error);
      setSpotState(prev => ({ ...prev, searching: false, locations: [] }));
    }
  };

  // 取得顏色的 hex 值
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      blue: '#60a5fa',
      green: '#4ade80', 
      purple: '#a78bfa',
      pink: '#f472b6',
      orange: '#fb923c'
    };
    return colorMap[colorName] || '#60a5fa';
  };

  // 希望スポット元件
  const SpotCard = ({ 
    spotName, 
    spotId,
    radius, 
    selectedColor, 
    searchText,
    placeholder,
    searching,
    onRadiusChange, 
    onColorChange,
    onSearchChange
  }: {
    spotName: string;
    spotId: 'A' | 'B' | 'C';
    radius: number;
    selectedColor: string;
    searchText: string;
    placeholder: string;
    searching: boolean;
    onRadiusChange: (value: number) => void;
    onColorChange: (color: string) => void;
    onSearchChange: (text: string) => void;
  }) => {
    const colors = [
      { name: 'blue', class: 'bg-blue-400', hex: '#60a5fa', selected: selectedColor === 'blue' },
      { name: 'green', class: 'bg-green-400', hex: '#4ade80', selected: selectedColor === 'green' },
      { name: 'purple', class: 'bg-purple-400', hex: '#a78bfa', selected: selectedColor === 'purple' },
      { name: 'pink', class: 'bg-pink-400', hex: '#f472b6', selected: selectedColor === 'pink' },
      { name: 'orange', class: 'bg-orange-400', hex: '#fb923c', selected: selectedColor === 'orange' }
    ];

    const isColorUsed = (colorName: string) => {
      if (colorName === selectedColor) return false;
      return [spotA.color, spotB.color, spotC.color].includes(colorName);
    };

    const currentColor = colors.find(color => color.name === selectedColor);
    const sliderColor = currentColor?.hex || '#3b82f6';

    return (
      <div className="flex-1 h-full bg-white/80 backdrop-blur-sm border border-gray-200/40 rounded-xl shadow-sm flex flex-col p-3">
        {/* 標題 */}
        <div className="text-black text-xs font-semibold tracking-tight text-center mb-2">
          {spotName}
        </div>
        
        {/* 搜尋欄 */}
        <div className="mb-2 relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-2 pr-7 py-1 text-xs bg-gray-50/80 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 placeholder:text-gray-400"
            style={{ 
              color: '#000000',
              backgroundColor: '#f9fafb',
              colorScheme: 'light'
            }}
          />
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              searchSpotLocations(spotId, searchText, radius, selectedColor);
            }}
            disabled={searching || !searchText.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 rounded transition-colors duration-200 ${
              searching || !searchText.trim() 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-200/50'
            }`}
          >
            {searching ? (
              <svg className="w-3 h-3 animate-spin text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg 
                className="w-3 h-3 text-gray-500 hover:text-gray-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* 滑桿區域 */}
        <div className="flex-1 flex flex-col justify-center mb-2">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="500"
              max="2000"
              step="100"
              value={radius}
              onChange={(e) => onRadiusChange(parseInt(e.target.value))}
              className={`flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-${spotId}`}
              style={{
                background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${((radius-500)/(2000-500))*100}%, #e5e7eb ${((radius-500)/(2000-500))*100}%, #e5e7eb 100%)`,
                // 自定義滑塊樣式
                WebkitAppearance: 'none',
              }}
            />
            <div className="text-xs text-gray-600 min-w-[2.5rem] text-right">
              {radius >= 1000 ? `${(radius/1000).toFixed(1)}km` : `${radius}m`}
            </div>
          </div>
        </div>
        
        {/* 色塊選擇 */}
        <div className="flex justify-center gap-1">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => !isColorUsed(color.name) && onColorChange(color.name)}
              disabled={isColorUsed(color.name)}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                color.class
              } ${
                color.selected 
                  ? 'border-gray-800 scale-110' 
                  : isColorUsed(color.name)
                    ? 'border-gray-300 opacity-30 cursor-not-allowed'
                    : 'border-gray-300 hover:border-gray-500 hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50">
      {/* 上容器 - 10% */}
      <div className="flex-[1] bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl m-4 flex items-center justify-center relative shadow-sm">
        {/* Apple 風格搜尋框 */}
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-md overflow-hidden min-w-[480px] max-w-[600px]">
          <div className="flex items-center p-4">
            {/* 定位按鈕 */}
            <button 
              onClick={requestLocation}
              disabled={isLocating}
              className={`flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-200 ${
                isLocating 
                  ? 'bg-blue-400 text-white animate-pulse' 
                  : 'bg-gray-100/50 text-gray-600 hover:bg-blue-400 hover:text-white hover:scale-105 active:scale-95'
              }`}
            >
              {isLocating ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            
            {/* 搜尋輸入框 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleMainSearchKeyDown}
              placeholder="東京都渋谷区、新宿駅..."
              className="flex h-10 w-full bg-white px-4 py-2 text-base text-black placeholder:text-gray-500 focus:outline-none border-0 font-medium tracking-tight"
              style={{ 
                color: '#000000',
                backgroundColor: '#ffffff',
                colorScheme: 'light'
              }}
              disabled={isSearching}
            />
            
            {/* 搜尋按鈕 */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                searchLocation();
              }}
              disabled={isSearching || !searchQuery.trim()}
              className={`inline-flex items-center justify-center transition-all duration-200 rounded-xl h-10 w-10 shadow-sm ${
                isSearching || !searchQuery.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-400 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'
              }`}
            >
              {isSearching ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 截圖按鈕 - 放在右側 */}
        <div className="absolute right-6">
          <ScreenshotButton 
            className="h-12 w-12"
            targetElementId="map-container"
            leftPanelCollapsed={leftPanelCollapsed}
            rightPanelCollapsed={rightPanelCollapsed}
          />
        </div>
      </div>

      {/* 中容器 - 80% */}
      <div id="map-container" className="flex-[8] relative mx-4 mb-2">
        {/* Leaflet OSM 地圖區域 - 完全獨立，不受狀態影響 */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
          <LeafletMap
            center={[35.6762, 139.6503]} // 東京車站
            zoom={13}
            tileStyle="cartodb-positron"
            className="w-full h-full"
            onMapReady={handleMapReady}
          />
        </div>


        {/* 中間區塊下方的長方形元件區 */}
        <div 
          className={`absolute bottom-4 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm z-20 transition-all duration-700 ease-out ${
            bottomPanelMinimized 
              ? `h-12 w-12 flex items-center justify-center ${rightPanelCollapsed ? 'right-20' : 'right-[calc(20%+2rem)]'}` 
              : 'left-1/2 transform -translate-x-1/2 flex items-center justify-center'
          }`}
          style={bottomPanelMinimized ? {} : { height: '23%', width: 'calc(23% * 2)' }}
          onClick={bottomPanelMinimized ? toggleBottomPanel : undefined}
        >
          
          {/* 內容 - 只在展開時顯示 */}
          <div className={`w-full h-full flex transition-all duration-300 ${
            bottomPanelMinimized ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}>
            {/* 左側區域 - 70% */}
            <div className="flex-[7] h-full bg-gray-50/50 rounded-l-2xl flex items-center justify-center gap-3 p-3">
              <SpotCard
                spotName="希望スポットA"
                spotId="A"
                radius={spotA.radius}
                selectedColor={spotA.color}
                searchText={spotA.searchText}
                placeholder="エニタイム"
                searching={spotA.searching}
                onRadiusChange={(value) => setSpotA(prev => ({ ...prev, radius: value }))}
                onColorChange={(color) => setSpotA(prev => ({ ...prev, color }))}
                onSearchChange={(text) => setSpotA(prev => ({ ...prev, searchText: text }))}
              />
              
              <SpotCard
                spotName="希望スポットB"
                spotId="B"
                radius={spotB.radius}
                selectedColor={spotB.color}
                searchText={spotB.searchText}
                placeholder="公園"
                searching={spotB.searching}
                onRadiusChange={(value) => setSpotB(prev => ({ ...prev, radius: value }))}
                onColorChange={(color) => setSpotB(prev => ({ ...prev, color }))}
                onSearchChange={(text) => setSpotB(prev => ({ ...prev, searchText: text }))}
              />
              
              <SpotCard
                spotName="希望スポットC"
                spotId="C"
                radius={spotC.radius}
                selectedColor={spotC.color}
                searchText={spotC.searchText}
                placeholder="スターバックス"
                searching={spotC.searching}
                onRadiusChange={(value) => setSpotC(prev => ({ ...prev, radius: value }))}
                onColorChange={(color) => setSpotC(prev => ({ ...prev, color }))}
                onSearchChange={(text) => setSpotC(prev => ({ ...prev, searchText: text }))}
              />
            </div>
            
            {/* 右側區域 - 30% */}
            <div className="flex-[3] h-full bg-gray-100/50 rounded-r-2xl flex items-center justify-center">
              <div className="text-black text-sm font-semibold tracking-tight">
                右側區域
              </div>
            </div>
          </div>

          {/* 縮小按鈕 - 右上角 */}
          {!bottomPanelMinimized && (
            <button 
              onClick={toggleBottomPanel}
              className="absolute top-2 right-2 bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 hover:text-gray-800 rounded-lg h-6 w-6 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* 展開圖標 - 縮小時顯示，使用絕對定位居中 */}
          {bottomPanelMinimized && (
            <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </div>

        {/* 左區域 - Apple風格 */}
        <div className={`absolute top-0 left-0 h-full bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl z-10 transition-all duration-500 ease-out shadow-sm ${
          leftPanelCollapsed ? 'w-16' : 'w-[20%]'
        }`}>
          {/* 左區域內容容器 */}
          <div className={`h-full w-full flex flex-col p-4 transition-all duration-500 ${
            leftPanelCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            {!leftPanelCollapsed && (
              <div className="h-full bg-gray-50/50 rounded-xl border border-gray-200/30 p-4 overflow-y-auto">
                {/* こだわり条件タイトル */}
                <div className="text-black text-lg font-semibold tracking-tight mb-4 text-center border-b border-gray-200/50 pb-3">
                  こだわり条件
                  {selectedConditions.length > 0 && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      {selectedConditions.length}
                    </span>
                  )}
                </div>

                {/* こだわり条件選項 */}
                <div className="space-y-2">
                  {/* 家賃・初期費用 */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 tracking-tight">家賃・初期費用</div>
                    
                    {[
                      { id: 'rent-low', title: '家賃5万円以下', desc: '低価格物件' },
                      { id: 'rent-mid', title: '家賃10万円以下', desc: '中価格帯物件' },
                      { id: 'no-reikin', title: '礼金なし', desc: '初期費用削減' },
                      { id: 'no-shikikin', title: '敷金なし', desc: '初期費用削減' },
                      { id: 'no-tesuuryou', title: '仲介手数料なし', desc: '手数料無料' }
                    ].map(condition => (
                      <div 
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          selectedConditions.includes(condition.id) 
                            ? 'bg-blue-500 border-blue-600 text-white' 
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/30 hover:bg-white/80'
                        }`}
                      >
                        <div className={`text-sm font-semibold tracking-tight ${
                          selectedConditions.includes(condition.id) ? 'text-white' : 'text-black'
                        }`}>
                          {condition.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          selectedConditions.includes(condition.id) ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {condition.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 建物・設備 */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 tracking-tight">建物・設備</div>
                    
                    {[
                      { id: 'new-building', title: '新築', desc: '築1年未満' },
                      { id: '築5年以内', title: '築5年以内', desc: '比較的新しい' },
                      { id: 'bath-toilet-sep', title: 'バス・トイレ別', desc: '独立洗面台' },
                      { id: 'aircon', title: 'エアコン付き', desc: '設備充実' },
                      { id: 'auto-lock', title: 'オートロック', desc: 'セキュリティ重視' },
                      { id: 'elevator', title: 'エレベーター', desc: '3階以上推奨' },
                      { id: 'delivery-box', title: '宅配ボックス', desc: '受取便利' },
                      { id: 'intercom', title: 'TVインターホン', desc: '来客確認' },
                      { id: 'flooring', title: 'フローリング', desc: '洋室タイプ' },
                      { id: 'system-kitchen', title: 'システムキッチン', desc: '料理環境良好' }
                    ].map(condition => (
                      <div 
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer mb-2 ${
                          selectedConditions.includes(condition.id) 
                            ? 'bg-blue-500 border-blue-600 text-white' 
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/30 hover:bg-white/80'
                        }`}
                      >
                        <div className={`text-sm font-semibold tracking-tight ${
                          selectedConditions.includes(condition.id) ? 'text-white' : 'text-black'
                        }`}>
                          {condition.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          selectedConditions.includes(condition.id) ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {condition.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 立地・環境 */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 tracking-tight">立地・環境</div>
                    
                    {[
                      { id: 'station-5min', title: '駅徒歩5分以内', desc: '駅近物件' },
                      { id: 'station-10min', title: '駅徒歩10分以内', desc: '通勤便利' },
                      { id: 'south-facing', title: '南向き', desc: '日当たり良好' },
                      { id: 'corner-room', title: '角部屋', desc: '採光・通風良好' },
                      { id: 'top-floor', title: '最上階', desc: '上階音なし' },
                      { id: 'balcony', title: 'バルコニー', desc: '洗濯・収納' },
                      { id: 'parking', title: '駐車場あり', desc: '車所有者向け' },
                      { id: 'convenience-store', title: 'コンビニ近い', desc: '生活便利' }
                    ].map(condition => (
                      <div 
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer mb-2 ${
                          selectedConditions.includes(condition.id) 
                            ? 'bg-blue-500 border-blue-600 text-white' 
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/30 hover:bg-white/80'
                        }`}
                      >
                        <div className={`text-sm font-semibold tracking-tight ${
                          selectedConditions.includes(condition.id) ? 'text-white' : 'text-black'
                        }`}>
                          {condition.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          selectedConditions.includes(condition.id) ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {condition.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ライフスタイル */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 tracking-tight">ライフスタイル</div>
                    
                    {[
                      { id: 'pet-ok', title: 'ペット可', desc: '犬・猫相談' },
                      { id: 'instrument-ok', title: '楽器可', desc: '防音対策' },
                      { id: 'designer', title: 'デザイナーズ', desc: 'おしゃれ物件' },
                      { id: 'furnished', title: '家具付き', desc: '即入居可能' },
                      { id: 'women-only', title: '女性限定', desc: 'レディース物件' },
                      { id: 'student-ok', title: '学生可', desc: '学生歓迎' },
                      { id: 'foreigners-ok', title: '外国人可', desc: '国際対応' },
                      { id: 'share-house', title: 'シェアハウス', desc: '共同生活' }
                    ].map(condition => (
                      <div 
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer mb-2 ${
                          selectedConditions.includes(condition.id) 
                            ? 'bg-blue-500 border-blue-600 text-white' 
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/30 hover:bg-white/80'
                        }`}
                      >
                        <div className={`text-sm font-semibold tracking-tight ${
                          selectedConditions.includes(condition.id) ? 'text-white' : 'text-black'
                        }`}>
                          {condition.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          selectedConditions.includes(condition.id) ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {condition.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 收縮/展開按鈕 */}
          <button
            onClick={toggleLeftPanel}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 inline-flex items-center justify-center transition-all duration-300 focus:outline-none bg-white/90 backdrop-blur-md border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 h-10 w-10 rounded-full shadow-md hover:border-gray-300/70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              {leftPanelCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* 右區域 - Apple風格 */}
        <div className={`absolute top-0 right-0 h-full bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 ease-out shadow-sm ${
          rightPanelCollapsed ? 'w-16' : 'w-[20%]'
        }`}>
          {/* 右區域內容 */}
          <div className={`text-black text-sm font-semibold tracking-tight transition-all duration-500 ${
            rightPanelCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            {!rightPanelCollapsed && '右側面板'}
          </div>

          {/* 收縮/展開按鈕 */}
          <button
            onClick={toggleRightPanel}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 inline-flex items-center justify-center transition-all duration-300 focus:outline-none bg-white/90 backdrop-blur-md border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 h-10 w-10 rounded-full shadow-md hover:border-gray-300/70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              {rightPanelCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 下容器 - 10% */}
      <div className="flex-[1] bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl mx-4 mb-4 flex items-center justify-center shadow-sm">
        <div className="text-black text-lg font-semibold tracking-tight">
          底部狀態列
        </div>
      </div>
    </div>
  );
}