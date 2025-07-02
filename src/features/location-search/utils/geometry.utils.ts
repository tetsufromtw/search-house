/**
 * 幾何計算工具函數
 * 提供地理位置計算、距離計算、交集檢測等功能
 */

import { GeoLocation } from '../types';

// ============================================================================
// 常數定義
// ============================================================================

/** 地球半徑（公尺） */
export const EARTH_RADIUS_METERS = 6371000;

/** 度數轉弧度的轉換係數 */
export const DEG_TO_RAD = Math.PI / 180;

/** 弧度轉度數的轉換係數 */
export const RAD_TO_DEG = 180 / Math.PI;

/** 一度緯度的距離（公尺，約略值） */
export const METERS_PER_DEGREE_LAT = 111320;

// ============================================================================
// 距離計算
// ============================================================================

/**
 * 使用 Haversine 公式計算兩點間的距離
 * @param point1 第一個座標點
 * @param point2 第二個座標點
 * @returns 距離（公尺）
 */
export const calculateDistance = (
  point1: GeoLocation,
  point2: GeoLocation
): number => {
  const lat1Rad = point1.lat * DEG_TO_RAD;
  const lat2Rad = point2.lat * DEG_TO_RAD;
  const deltaLat = (point2.lat - point1.lat) * DEG_TO_RAD;
  const deltaLng = (point2.lng - point1.lng) * DEG_TO_RAD;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

/**
 * 快速距離計算（使用平面幾何近似，適用於小範圍）
 * @param point1 第一個座標點
 * @param point2 第二個座標點
 * @returns 距離（公尺，近似值）
 */
export const calculateDistanceFast = (
  point1: GeoLocation,
  point2: GeoLocation
): number => {
  const deltaLat = point2.lat - point1.lat;
  const deltaLng = point2.lng - point1.lng;
  
  // 使用平面幾何近似
  const latDistance = deltaLat * METERS_PER_DEGREE_LAT;
  const lngDistance = deltaLng * METERS_PER_DEGREE_LAT * Math.cos(point1.lat * DEG_TO_RAD);
  
  return Math.sqrt(latDistance * latDistance + lngDistance * lngDistance);
};

// ============================================================================
// 方位和方向計算
// ============================================================================

/**
 * 計算從點 A 到點 B 的方位角
 * @param from 起點
 * @param to 終點
 * @returns 方位角（度數，0-360）
 */
export const calculateBearing = (
  from: GeoLocation,
  to: GeoLocation
): number => {
  const lat1Rad = from.lat * DEG_TO_RAD;
  const lat2Rad = to.lat * DEG_TO_RAD;
  const deltaLng = (to.lng - from.lng) * DEG_TO_RAD;

  const y = Math.sin(deltaLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng);

  const bearing = Math.atan2(y, x) * RAD_TO_DEG;
  return (bearing + 360) % 360;
};

/**
 * 根據起點、距離和方位角計算終點
 * @param start 起點
 * @param distance 距離（公尺）
 * @param bearing 方位角（度數）
 * @returns 終點座標
 */
export const calculateDestination = (
  start: GeoLocation,
  distance: number,
  bearing: number
): GeoLocation => {
  const bearingRad = bearing * DEG_TO_RAD;
  const lat1Rad = start.lat * DEG_TO_RAD;
  const lng1Rad = start.lng * DEG_TO_RAD;
  const angularDistance = distance / EARTH_RADIUS_METERS;

  const lat2Rad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(angularDistance) +
    Math.cos(lat1Rad) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const lng2Rad = lng1Rad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1Rad),
    Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
  );

  return {
    lat: lat2Rad * RAD_TO_DEG,
    lng: lng2Rad * RAD_TO_DEG
  };
};

// ============================================================================
// 圓圈和邊界計算
// ============================================================================

/**
 * 計算圓圈的邊界框
 * @param center 圓心
 * @param radius 半徑（公尺）
 * @returns 邊界框 { north, south, east, west }
 */
export const calculateCircleBounds = (
  center: GeoLocation,
  radius: number
) => {
  const north = calculateDestination(center, radius, 0);
  const south = calculateDestination(center, radius, 180);
  const east = calculateDestination(center, radius, 90);
  const west = calculateDestination(center, radius, 270);

  return {
    north: north.lat,
    south: south.lat,
    east: east.lng,
    west: west.lng
  };
};

/**
 * 檢查點是否在圓圈內
 * @param point 要檢查的點
 * @param center 圓心
 * @param radius 半徑（公尺）
 * @returns 是否在圓圈內
 */
export const isPointInCircle = (
  point: GeoLocation,
  center: GeoLocation,
  radius: number
): boolean => {
  const distance = calculateDistance(point, center);
  return distance <= radius;
};

/**
 * 檢查兩個圓圈是否相交
 * @param circle1 第一個圓圈 { center, radius }
 * @param circle2 第二個圓圈 { center, radius }
 * @returns 是否相交
 */
export const checkCircleIntersection = (
  circle1: { center: GeoLocation; radius: number },
  circle2: { center: GeoLocation; radius: number }
): boolean => {
  const distance = calculateDistance(circle1.center, circle2.center);
  const radiusSum = circle1.radius + circle2.radius;
  return distance <= radiusSum;
};

/**
 * 計算兩個圓圈的重疊面積
 * @param circle1 第一個圓圈
 * @param circle2 第二個圓圈
 * @returns 重疊面積（平方公尺）
 */
export const calculateCircleOverlapArea = (
  circle1: { center: GeoLocation; radius: number },
  circle2: { center: GeoLocation; radius: number }
): number => {
  const distance = calculateDistance(circle1.center, circle2.center);
  const r1 = circle1.radius;
  const r2 = circle2.radius;

  // 沒有重疊
  if (distance >= r1 + r2) return 0;

  // 一個圓完全包含另一個
  if (distance <= Math.abs(r1 - r2)) {
    const smallerRadius = Math.min(r1, r2);
    return Math.PI * smallerRadius * smallerRadius;
  }

  // 部分重疊
  const a = r1 * r1;
  const b = r2 * r2;
  const c = distance * distance;

  const area1 = a * Math.acos((c + a - b) / (2 * Math.sqrt(c * a)));
  const area2 = b * Math.acos((c + b - a) / (2 * Math.sqrt(c * b)));
  const area3 = 0.5 * Math.sqrt((-distance + r1 + r2) * (distance + r1 - r2) * (distance - r1 + r2) * (distance + r1 + r2));

  return area1 + area2 - area3;
};

// ============================================================================
// 邊界和範圍計算
// ============================================================================

/**
 * 計算多個點的邊界框
 * @param points 座標點陣列
 * @returns 邊界框
 */
export const calculateBoundingBox = (points: GeoLocation[]) => {
  if (points.length === 0) {
    throw new Error('Points array cannot be empty');
  }

  let north = points[0].lat;
  let south = points[0].lat;
  let east = points[0].lng;
  let west = points[0].lng;

  for (const point of points) {
    north = Math.max(north, point.lat);
    south = Math.min(south, point.lat);
    east = Math.max(east, point.lng);
    west = Math.min(west, point.lng);
  }

  return { north, south, east, west };
};

/**
 * 計算邊界框的中心點
 * @param bounds 邊界框
 * @returns 中心點
 */
export const calculateBoundsCenter = (bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}): GeoLocation => {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2
  };
};

/**
 * 檢查點是否在邊界框內
 * @param point 要檢查的點
 * @param bounds 邊界框
 * @returns 是否在邊界內
 */
export const isPointInBounds = (
  point: GeoLocation,
  bounds: { north: number; south: number; east: number; west: number }
): boolean => {
  return point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east;
};

// ============================================================================
// 聚合相關計算
// ============================================================================

/**
 * 計算點集合的中心點（重心）
 * @param points 座標點陣列
 * @returns 中心點
 */
export const calculateCentroid = (points: GeoLocation[]): GeoLocation => {
  if (points.length === 0) {
    throw new Error('Points array cannot be empty');
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length
  };
};

/**
 * 計算包含所有點的最小圓圈半徑
 * @param points 座標點陣列
 * @param center 圓心（可選，預設為重心）
 * @returns 最小半徑（公尺）
 */
export const calculateMinimumEnclosingRadius = (
  points: GeoLocation[],
  center?: GeoLocation
): number => {
  if (points.length === 0) return 0;

  const circleCenter = center || calculateCentroid(points);
  let maxDistance = 0;

  for (const point of points) {
    const distance = calculateDistance(circleCenter, point);
    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance;
};

// ============================================================================
// 工具函數
// ============================================================================

/**
 * 正規化經度值到 -180 到 180 範圍
 * @param lng 經度值
 * @returns 正規化後的經度值
 */
export const normalizeLongitude = (lng: number): number => {
  return ((lng + 180) % 360) - 180;
};

/**
 * 正規化緯度值到 -90 到 90 範圍
 * @param lat 緯度值
 * @returns 正規化後的緯度值
 */
export const normalizeLatitude = (lat: number): number => {
  return Math.max(-90, Math.min(90, lat));
};

/**
 * 驗證地理座標是否有效
 * @param location 座標點
 * @returns 是否有效
 */
export const isValidGeoLocation = (location: unknown): location is GeoLocation => {
  if (typeof location !== 'object' || location === null) return false;
  
  const loc = location as Record<string, unknown>;
  return typeof loc.lat === 'number' &&
    typeof loc.lng === 'number' &&
    loc.lat >= -90 &&
    loc.lat <= 90 &&
    loc.lng >= -180 &&
    loc.lng <= 180 &&
    !isNaN(loc.lat) &&
    !isNaN(loc.lng);
};