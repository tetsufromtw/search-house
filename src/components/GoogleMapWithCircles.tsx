'use client';

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { calculateAllIntersections, IntersectionArea } from '../utils/intersectionUtils';
import { searchPropertiesInIntersection, SuumoProperty } from '../utils/suumoApi';
import { createRequirementCirclesAsync, RequirementCircle, DEFAULT_REQUIREMENTS, REQUIREMENT_MARKER_COLORS, MapBounds } from '../utils/placesApi';

interface CircleData {
  id: string;
  center: { lat: number; lng: number };
  radius: number;
  color: string;
  colorIndex: number;
  circle?: google.maps.Circle;
  marker?: google.maps.Marker;
  requirementId?: string;
  placeName?: string;
  address?: string;
  rating?: number;
  requirement?: string;
}

const MapHandler: React.FC<{
  circles: CircleData[];
  onCirclesUpdate: (circles: CircleData[]) => void;
  intersections: IntersectionArea[];
  onIntersectionsUpdate: (intersections: IntersectionArea[]) => void;
  onMapBoundsChanged?: (bounds: MapBounds) => void;
}> = ({ circles, onCirclesUpdate, intersections, onIntersectionsUpdate, onMapBoundsChanged }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // 只處理還沒有 circle 實例的新圓圈
    const newCircles = circles.filter(circleData => !circleData.circle);

    if (newCircles.length > 0) {
      const updatedCircles = circles.map(circleData => {
        if (!circleData.circle) {
          // 建立圓圈
          const circle = new google.maps.Circle({
            center: circleData.center,
            radius: circleData.radius,
            fillColor: circleData.color,
            fillOpacity: 0.2,
            strokeColor: circleData.color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map: map
          });

          // 建立中心點標記
          const marker = new google.maps.Marker({
            position: circleData.center,
            map: map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: REQUIREMENT_MARKER_COLORS[circleData.colorIndex],
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            },
            title: circleData.placeName || '地點'
          });

          // 添加點擊事件顯示店家資訊
          const infoWindow = new google.maps.InfoWindow();
          marker.addListener('click', () => {
            const content = `
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${circleData.placeName || '地點'}</h3>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">
                  <strong>地址:</strong> ${circleData.address || '無地址資訊'}
                </p>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">
                  <strong>評分:</strong> ${circleData.rating ? `${circleData.rating} ⭐` : '無評分'}
                </p>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">
                  <strong>類型:</strong> ${circleData.requirement || '無類型'}
                </p>
              </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });

          return { ...circleData, circle, marker };
        }
        return circleData;
      });

      onCirclesUpdate(updatedCircles);
    }

    // 計算並顯示交集區域
    if (circles.length >= 2) {
      const newIntersections = calculateAllIntersections(circles);

      // 清除舊的交集標記
      intersections.forEach(intersection => {
        if (intersection.marker) {
          intersection.marker.setMap(null);
        }
      });

      // 不創建交集標記，只返回交集資料
      const updatedIntersections = newIntersections;

      onIntersectionsUpdate(updatedIntersections);
    } else {
      // 清除所有交集標記
      intersections.forEach(intersection => {
        if (intersection.marker) {
          intersection.marker.setMap(null);
        }
      });
      onIntersectionsUpdate([]);
    }
  }, [map, circles, onCirclesUpdate]);

  // 監聽地圖邊界變化
  useEffect(() => {
    if (!map || !onMapBoundsChanged) return;

    let debounceTimer: NodeJS.Timeout;

    const handleBoundsChanged = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const bounds = map.getBounds();
        if (bounds) {
          const northeast = bounds.getNorthEast();
          const southwest = bounds.getSouthWest();

          const mapBounds: MapBounds = {
            north: northeast.lat(),
            south: southwest.lat(),
            east: northeast.lng(),
            west: southwest.lng()
          };

          console.log('🔍 邊界檢查:', {
            north: mapBounds.north,
            south: mapBounds.south,
            east: mapBounds.east,
            west: mapBounds.west,
            isValidBounds: mapBounds.north > mapBounds.south && mapBounds.east > mapBounds.west
          });
          onMapBoundsChanged(mapBounds);
        } else {
          console.warn('⚠️ 無法獲取地圖邊界');
        }
      }, 100); // 減少防抖時間到100ms
    };

    const listener = map.addListener('bounds_changed', handleBoundsChanged);

    return () => {
      google.maps.event.removeListener(listener);
      clearTimeout(debounceTimer);
    };
  }, [map, onMapBoundsChanged]);

  return null;
};

const GoogleMapWithCircles: React.FC<{ onPropertiesUpdate?: (properties: SuumoProperty[]) => void }> = ({ onPropertiesUpdate }) => {
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [intersections, setIntersections] = useState<IntersectionArea[]>([]);
  const [properties, setProperties] = useState<SuumoProperty[]>([]);
  const [requirementCircles, setRequirementCircles] = useState<RequirementCircle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 獲取當前地圖邊界
  const getCurrentMapBounds = (): MapBounds | null => {
    const mapInstance = document.querySelector('.gm-style')?.parentElement as any;
    if (!mapInstance || !window.google) return null;

    try {
      // 尋找地圖實例
      const map: google.maps.Map | null = null;
      if (mapInstance._reactInternalFiber) {
        // React 內部查找地圖實例的方式可能需要調整
        // 暫時使用全域變量或其他方式
      }

      // 暫時回退到固定的東京範圍
      return {
        north: 35.8,
        south: 35.5,
        east: 140.0,
        west: 139.4
      };
    } catch (error) {
      console.error('❌ 無法獲取地圖邊界:', error);
      return null;
    }
  };

  // 執行搜尋（支援動態範圍）
  const performSearch = async (bounds?: MapBounds) => {
    setIsLoading(true);
    console.log('🚀 開始搜尋需求圓圈', bounds ? '(使用地圖範圍)' : '(使用預設範圍)');
    console.log('🗺️ 傳入的 bounds:', bounds);

    try {
      // 清空現有圓圈
      setCircles([]);
      setRequirementCircles([]);

      // 等待 Google Maps API 完全載入
      const waitForGoogleMaps = () => {
        return new Promise<void>((resolve) => {
          const checkGoogleMaps = () => {
            if (window.google && window.google.maps) {
              console.log('✅ Google Maps API 已準備就緒');
              resolve();
            } else {
              console.log('⏳ 等待 Google Maps API 載入...');
              setTimeout(checkGoogleMaps, 500);
            }
          };
          checkGoogleMaps();
        });
      };

      await waitForGoogleMaps();

      // 使用即時回調版本，每當有圓圈準備好就立即添加到地圖
      await createRequirementCirclesAsync(DEFAULT_REQUIREMENTS, (reqCircle) => {
        console.log(`🎯 需求「${reqCircle.requirement}」圓圈準備就緒，立即添加到地圖`);

        // 將此需求的所有地點轉換為圓圈資料
        const newCircles: CircleData[] = [];
        reqCircle.places.forEach(place => {
          newCircles.push({
            id: `${reqCircle.id}-${place.place_id}`,
            center: place.location,
            radius: 1000, // 1公里
            color: reqCircle.color,
            colorIndex: reqCircle.colorIndex,
            requirementId: reqCircle.id,
            placeName: place.name,
            address: place.address,
            rating: place.rating,
            requirement: reqCircle.requirement
          });
        });

        // 即時更新圓圈狀態
        setCircles(prevCircles => [...prevCircles, ...newCircles]);

        // 更新需求圓圈狀態
        setRequirementCircles(prevReqCircles => {
          const exists = prevReqCircles.some(rc => rc.id === reqCircle.id);
          if (!exists) {
            return [...prevReqCircles, reqCircle];
          }
          return prevReqCircles;
        });

        console.log(`✨ 新增 ${newCircles.length} 個圓圈到地圖`);
      }, bounds);

      console.log('🎉 所有需求搜尋完成');
    } catch (error) {
      console.error('❌ 初始化需求時發生錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 處理地圖邊界變化
  const handleMapBoundsChanged = (bounds: MapBounds) => {
    console.log('📍 handleMapBoundsChanged 被調用，bounds:', bounds);
    if (!isInitialized) {
      console.log('🎯 首次獲取地圖邊界，開始初始搜尋...');
      setIsInitialized(true);
      performSearch(bounds);
    } else {
      console.log('🔄 地圖範圍變化，重新搜尋...');
      performSearch(bounds);
    }
  };

  // 記錄是否已初始化
  const [isInitialized, setIsInitialized] = useState(false);

  // 備用初始化（如果地圖邊界變化沒觸發）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isInitialized) {
        console.log('⏰ 備用初始化觸發 - 使用預設範圍');
        performSearch(); // 使用預設範圍（不傳 bounds）
        setIsInitialized(true);
      }
    }, 5000); // 延長到5秒，減少觸發

    return () => clearTimeout(timer);
  }, [isInitialized]);

  // 當交集變更時，搜尋SUUMO資料
  useEffect(() => {
    if (intersections.length > 0) {
      setIsLoading(true);

      // 選擇第一個交集區域進行搜尋
      const firstIntersection = intersections[0];

      searchPropertiesInIntersection(
        firstIntersection.center,
        firstIntersection.radius
      ).then(newProperties => {
        setProperties(newProperties);
        if (onPropertiesUpdate) {
          onPropertiesUpdate(newProperties);
        }
        setIsLoading(false);
      }).catch(error => {
        console.error('Error searching properties:', error);
        setIsLoading(false);
      });
    } else {
      setProperties([]);
      if (onPropertiesUpdate) {
        onPropertiesUpdate([]);
      }
    }
  }, [intersections, onPropertiesUpdate]);

  const clearAllCircles = () => {
    circles.forEach(circleData => {
      if (circleData.circle) {
        circleData.circle.setMap(null);
      }
      if (circleData.marker) {
        circleData.marker.setMap(null);
      }
    });
    intersections.forEach(intersection => {
      if (intersection.marker) {
        intersection.marker.setMap(null);
      }
    });
    setCircles([]);
    setIntersections([]);
    setProperties([]);
    setRequirementCircles([]);
  };

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
      libraries={['places']}
    >
      <div className="w-full h-full relative">
        <Map
          defaultZoom={13}
          defaultCenter={{ lat: 35.6762, lng: 139.6503 }} // 東京市中心
          className="w-full h-full"
          mapId="search-house-map"
        >
          <MapHandler
            circles={circles}
            onCirclesUpdate={setCircles}
            intersections={intersections}
            onIntersectionsUpdate={setIntersections}
            onMapBoundsChanged={handleMapBoundsChanged}
          />
        </Map>

        {/* 控制面板 */}
        <div className="absolute top-4 left-4 bg-white p-4 rounded-none shadow-sm border border-[#e5e5e5]">
          <div className="text-sm text-[#111111] font-light mb-4">
            需求搜尋結果
          </div>

          {requirementCircles.map((reqCircle) => (
            <div key={reqCircle.id} className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: reqCircle.color }}
                ></span>
                <span className="text-xs text-[#111111] font-medium">
                  {reqCircle.requirement}
                </span>
              </div>
              <div className="text-xs text-[#999999] font-light ml-5">
                {reqCircle.places.length} 個地點
              </div>
            </div>
          ))}

          <div className="border-t border-[#e5e5e5] pt-3 mt-4">
            <div className="text-xs text-[#999999] font-light mb-2">
              總圓圈數: {circles.length}
            </div>
            <div className="text-xs text-[#999999] font-light mb-2">
              交集區域: {intersections.length}
            </div>
            <div className="text-xs text-[#999999] font-light mb-4">
              找到物件: {properties.length}
              {isLoading && <span className="ml-2">載入中...</span>}
            </div>
          </div>

          <button
            onClick={clearAllCircles}
            className="px-4 py-2 bg-[#111111] text-white rounded-none text-xs hover:opacity-80 transition-opacity font-light"
          >
            重新載入
          </button>
        </div>
      </div>
    </APIProvider>
  );
};

export default GoogleMapWithCircles;