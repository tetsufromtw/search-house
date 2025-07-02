/**
 * 地圖相關工具函數
 * 提供地圖操作、圓圈管理、標記創建等功能
 */

import { 
  GeoLocation, 
  RequirementType,
  MapBounds,
  CircleStyle,
  MarkerIcon,
  ClusteringConfig,
  LocationResult
} from '../types';
import { calculateDistance, calculateBoundingBox } from './geometry.utils';

// ============================================================================
// 地圖邊界工具
// ============================================================================

/**
 * 從 Google Maps LatLngBounds 轉換為 MapBounds
 * @param googleBounds Google Maps LatLngBounds 物件
 * @param zoom 縮放等級
 * @returns MapBounds 物件
 */
export const convertGoogleBoundsToMapBounds = (
  googleBounds: google.maps.LatLngBounds,
  zoom: number
): MapBounds => {
  const ne = googleBounds.getNorthEast();
  const sw = googleBounds.getSouthWest();
  const center = googleBounds.getCenter();

  return {
    northEast: { lat: ne.lat(), lng: ne.lng() },
    southWest: { lat: sw.lat(), lng: sw.lng() },
    center: { lat: center.lat(), lng: center.lng() },
    zoom
  };
};

/**
 * 檢查位置是否在地圖邊界內
 * @param location 位置
 * @param bounds 地圖邊界
 * @returns 是否在邊界內
 */
export const isLocationInBounds = (
  location: GeoLocation,
  bounds: MapBounds
): boolean => {
  return location.lat >= bounds.southWest.lat &&
    location.lat <= bounds.northEast.lat &&
    location.lng >= bounds.southWest.lng &&
    location.lng <= bounds.northEast.lng;
};

/**
 * 根據位置陣列計算適合的縮放等級和中心點
 * @param locations 位置陣列
 * @param padding 邊距比例 (0-1)
 * @returns 縮放等級和中心點
 */
export const calculateOptimalViewport = (
  locations: GeoLocation[],
  padding: number = 0.1
) => {
  if (locations.length === 0) {
    return {
      center: { lat: 35.6762, lng: 139.6503 }, // 東京預設
      zoom: 15
    };
  }

  if (locations.length === 1) {
    return {
      center: locations[0],
      zoom: 16
    };
  }

  const bounds = calculateBoundingBox(locations);
  const center = {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2
  };

  // 計算邊界的對角線距離
  const diagonalDistance = calculateDistance(
    { lat: bounds.north, lng: bounds.west },
    { lat: bounds.south, lng: bounds.east }
  );

  // 根據距離估算縮放等級
  let zoom = 15;
  if (diagonalDistance > 50000) zoom = 10;
  else if (diagonalDistance > 20000) zoom = 12;
  else if (diagonalDistance > 10000) zoom = 13;
  else if (diagonalDistance > 5000) zoom = 14;
  else if (diagonalDistance > 2000) zoom = 15;
  else if (diagonalDistance > 1000) zoom = 16;
  else zoom = 17;

  // 套用邊距調整
  zoom = Math.max(10, zoom - Math.ceil(padding * 3));

  return { center, zoom };
};

// ============================================================================
// 圓圈樣式工具
// ============================================================================

/**
 * 根據需求類型取得圓圈樣式
 * @param requirementType 需求類型
 * @param opacity 透明度覆寫
 * @returns 圓圈樣式
 */
export const getCircleStyleForRequirement = (
  requirementType: RequirementType,
  opacity?: { fill?: number; stroke?: number }
): CircleStyle => {
  const styles: Record<RequirementType, CircleStyle> = {
    starbucks: {
      fillColor: '#93C5FD', // blue-300
      fillOpacity: opacity?.fill ?? 0.2,
      strokeColor: '#60A5FA', // blue-400
      strokeOpacity: opacity?.stroke ?? 0.8,
      strokeWeight: 2
    },
    gym: {
      fillColor: '#FCA5A5', // red-300
      fillOpacity: opacity?.fill ?? 0.2,
      strokeColor: '#F87171', // red-400
      strokeOpacity: opacity?.stroke ?? 0.8,
      strokeWeight: 2
    },
    convenience: {
      fillColor: '#86EFAC', // green-300
      fillOpacity: opacity?.fill ?? 0.2,
      strokeColor: '#4ADE80', // green-400
      strokeOpacity: opacity?.stroke ?? 0.8,
      strokeWeight: 2
    }
  };

  return styles[requirementType];
};

/**
 * 建立聚合圓圈的樣式
 * @param baseStyle 基礎樣式
 * @param clusterSize 聚合數量
 * @returns 聚合圓圈樣式
 */
export const createClusterCircleStyle = (
  baseStyle: CircleStyle,
  clusterSize: number
): CircleStyle => {
  const intensityFactor = Math.min(clusterSize / 10, 1);
  
  return {
    ...baseStyle,
    fillOpacity: Math.max(baseStyle.fillOpacity * (1 + intensityFactor), 0.1),
    strokeOpacity: Math.max(baseStyle.strokeOpacity * (1 + intensityFactor * 0.5), 0.5),
    strokeWeight: Math.min(baseStyle.strokeWeight + Math.floor(intensityFactor * 2), 5)
  };
};

// ============================================================================
// 標記圖示工具
// ============================================================================

/**
 * 建立需求類型的標記圖示
 * @param requirementType 需求類型
 * @param size 圖示大小
 * @param color 顏色覆寫
 * @returns 標記圖示
 */
export const createRequirementMarkerIcon = (
  requirementType: RequirementType,
  size: number = 24,
  color?: string
): MarkerIcon => {
  const icons: Record<RequirementType, string> = {
    starbucks: '☕',
    gym: '💪',
    convenience: '🏪'
  };

  const colors: Record<RequirementType, string> = {
    starbucks: '#93C5FD',
    gym: '#FCA5A5',
    convenience: '#86EFAC'
  };

  const icon = icons[requirementType];
  const fillColor = color || colors[requirementType];

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle 
        cx="${size / 2}" 
        cy="${size / 2}" 
        r="${size / 2 - 2}" 
        fill="${fillColor}" 
        stroke="#ffffff" 
        stroke-width="2"
        opacity="0.9"
      />
      <text 
        x="${size / 2}" 
        y="${size / 2 + 4}" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="12" 
        font-weight="bold"
      >${icon}</text>
    </svg>
  `;

  const svgDataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  return {
    url: svgDataUrl,
    size: { width: size, height: size },
    anchor: { x: size / 2, y: size / 2 }
  };
};

/**
 * 建立聚合標記圖示
 * @param count 聚合數量
 * @param requirementType 需求類型
 * @param size 圖示大小（可選）
 * @returns 聚合標記圖示
 */
export const createClusterMarkerIcon = (
  count: number,
  requirementType: RequirementType,
  size?: number
): MarkerIcon => {
  const calculatedSize = size || Math.min(Math.max(30, count * 3), 60);
  const style = getCircleStyleForRequirement(requirementType);
  
  const svg = `
    <svg width="${calculatedSize}" height="${calculatedSize}" viewBox="0 0 ${calculatedSize} ${calculatedSize}" xmlns="http://www.w3.org/2000/svg">
      <circle 
        cx="${calculatedSize / 2}" 
        cy="${calculatedSize / 2}" 
        r="${calculatedSize / 2 - 2}" 
        fill="${style.fillColor}" 
        stroke="${style.strokeColor}" 
        stroke-width="2"
        opacity="0.9"
      />
      <text 
        x="${calculatedSize / 2}" 
        y="${calculatedSize / 2 + 4}" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="${Math.max(10, calculatedSize / 4)}" 
        font-weight="bold" 
        fill="white"
      >${count}</text>
    </svg>
  `;

  const svgDataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  return {
    url: svgDataUrl,
    size: { width: calculatedSize, height: calculatedSize },
    anchor: { x: calculatedSize / 2, y: calculatedSize / 2 }
  };
};

// ============================================================================
// 聚合相關工具
// ============================================================================

/**
 * 檢查是否應該啟用聚合
 * @param zoom 縮放等級
 * @param locationCount 位置數量
 * @param config 聚合配置
 * @returns 是否啟用聚合
 */
export const shouldEnableClustering = (
  zoom: number,
  locationCount: number,
  config: ClusteringConfig
): boolean => {
  return config.enabled &&
    zoom < config.minZoom &&
    locationCount >= config.minClusterSize;
};

/**
 * 根據聚合大小計算最佳縮放等級
 * @param clusterSize 聚合大小
 * @param currentZoom 當前縮放等級
 * @returns 最佳縮放等級
 */
export const calculateOptimalZoomForCluster = (
  clusterSize: number,
  currentZoom: number
): number => {
  if (clusterSize <= 2) return currentZoom + 2;
  if (clusterSize <= 5) return currentZoom + 3;
  if (clusterSize <= 10) return currentZoom + 4;
  return currentZoom + 5;
};

// ============================================================================
// 地圖互動工具
// ============================================================================

/**
 * 建立 InfoWindow 內容
 * @param location 位置資料
 * @param requirementType 需求類型
 * @returns HTML 內容字串
 */
export const createInfoWindowContent = (
  location: LocationResult,
  requirementType: RequirementType
): string => {
  const style = getCircleStyleForRequirement(requirementType);
  const icons: Record<RequirementType, string> = {
    starbucks: '☕',
    gym: '💪',
    convenience: '🏪'
  };

  return `
    <div style="padding: 12px; max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="
          width: 20px; 
          height: 20px; 
          background-color: ${style.fillColor}; 
          border-radius: 50%; 
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        ">${icons[requirementType]}</div>
        <span style="font-weight: bold; color: #1f2937; font-size: 14px;">
          ${location.name}
        </span>
      </div>
      <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px; line-height: 1.4;">
        ${location.address || '地址未提供'}
      </p>
      ${location.rating ? `
        <p style="margin: 0; color: #f59e0b; font-size: 13px;">
          ⭐ ${location.rating.toFixed(1)}
        </p>
      ` : ''}
      ${location.priceLevel ? `
        <p style="margin: 0; color: #10b981; font-size: 13px;">
          💰 價格等級: ${location.priceLevel}
        </p>
      ` : ''}
    </div>
  `;
};

/**
 * 建立聚合 InfoWindow 內容
 * @param clusterSize 聚合大小
 * @param requirementType 需求類型
 * @param locations 聚合內的位置
 * @returns HTML 內容字串
 */
export const createClusterInfoWindowContent = (
  clusterSize: number,
  requirementType: RequirementType,
  locations: LocationResult[]
): string => {
  const style = getCircleStyleForRequirement(requirementType);
  const icons: Record<RequirementType, string> = {
    starbucks: '☕',
    gym: '💪',
    convenience: '🏪'
  };

  const displayNames: Record<RequirementType, string> = {
    starbucks: 'Starbucks',
    gym: '健身房',
    convenience: '便利商店'
  };

  const locationList = locations.slice(0, 5).map(loc => 
    `<li style="margin: 4px 0; font-size: 12px; color: #6b7280;">${loc.name}</li>`
  ).join('');

  return `
    <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="
          width: 24px; 
          height: 24px; 
          background-color: ${style.fillColor}; 
          border-radius: 50%; 
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        ">${icons[requirementType]}</div>
        <span style="font-weight: bold; color: #1f2937; font-size: 16px;">
          ${displayNames[requirementType]} 聚合點
        </span>
      </div>
      <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
        共 ${clusterSize} 個地點
      </p>
      ${locations.length > 0 ? `
        <div style="margin-top: 8px;">
          <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #4b5563;">
            包含地點：
          </p>
          <ul style="margin: 0; padding-left: 16px;">
            ${locationList}
            ${locations.length > 5 ? `
              <li style="margin: 4px 0; font-size: 12px; color: #9ca3af;">
                ...還有 ${locations.length - 5} 個地點
              </li>
            ` : ''}
          </ul>
        </div>
      ` : ''}
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
        點擊放大查看詳細資訊
      </p>
    </div>
  `;
};

// ============================================================================
// 地圖實用工具
// ============================================================================

/**
 * 生成唯一的 ID
 * @param prefix 前綴
 * @returns 唯一 ID
 */
export const generateMapElementId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 深度複製地理位置物件
 * @param location 位置物件
 * @returns 複製的位置物件
 */
export const cloneGeoLocation = (location: GeoLocation): GeoLocation => {
  return {
    lat: location.lat,
    lng: location.lng
  };
};

/**
 * 比較兩個地理位置是否相等（在誤差範圍內）
 * @param loc1 位置1
 * @param loc2 位置2
 * @param tolerance 容差（度數，預設 0.0001）
 * @returns 是否相等
 */
export const areLocationsEqual = (
  loc1: GeoLocation,
  loc2: GeoLocation,
  tolerance: number = 0.0001
): boolean => {
  return Math.abs(loc1.lat - loc2.lat) < tolerance &&
    Math.abs(loc1.lng - loc2.lng) < tolerance;
};