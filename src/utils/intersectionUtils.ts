interface LatLng {
  lat: number;
  lng: number;
}

// 使用 SearchContext 中的類型定義
import { CircleData } from '../context/SearchContext';

export interface IntersectionArea {
  id: string;
  center: LatLng;
  radius: number;
  circles: string[];
  marker?: google.maps.Marker;
  isHighlighted?: boolean;
}

// 計算兩點之間的距離（公尺）
export const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  const R = 6371000; // 地球半徑（公尺）
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// 檢查兩個圓圈是否有交集
export const circlesIntersect = (circle1: CircleData, circle2: CircleData): boolean => {
  const distance = calculateDistance(circle1.center, circle2.center);
  return distance < (circle1.radius + circle2.radius);
};

// 計算兩個圓圈的交集區域
export const calculateCircleIntersection = (circle1: CircleData, circle2: CircleData): IntersectionArea | null => {
  if (!circlesIntersect(circle1, circle2)) {
    return null;
  }

  const distance = calculateDistance(circle1.center, circle2.center);
  
  // 如果一個圓完全包含另一個圓
  if (distance + Math.min(circle1.radius, circle2.radius) <= Math.max(circle1.radius, circle2.radius)) {
    const smallerCircle = circle1.radius <= circle2.radius ? circle1 : circle2;
    return {
      id: `intersection-${circle1.id}-${circle2.id}`,
      center: smallerCircle.center,
      radius: smallerCircle.radius,
      circles: [circle1.id, circle2.id],
      isHighlighted: false
    };
  }

  // 計算交集區域的中心點（加權中心點，根據半徑大小調整）
  const r1 = circle1.radius;
  const r2 = circle2.radius;
  const totalRadius = r1 + r2;
  const weight1 = r2 / totalRadius; // 較小圓的權重較大
  const weight2 = r1 / totalRadius;
  
  const centerLat = circle1.center.lat * weight1 + circle2.center.lat * weight2;
  const centerLng = circle1.center.lng * weight1 + circle2.center.lng * weight2;
  
  // 改進交集半徑計算 - 基於實際的幾何交集
  const intersectionRadius = Math.min(r1, r2) * Math.max(0.3, 1 - distance / (r1 + r2));

  return {
    id: `intersection-${circle1.id}-${circle2.id}`,
    center: { lat: centerLat, lng: centerLng },
    radius: intersectionRadius,
    circles: [circle1.id, circle2.id],
    isHighlighted: false
  };
};

// 計算多個圓圈的所有交集區域
export const calculateAllIntersections = (circles: CircleData[]): IntersectionArea[] => {
  const intersections: IntersectionArea[] = [];

  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const intersection = calculateCircleIntersection(circles[i], circles[j]);
      if (intersection) {
        intersections.push(intersection);
      }
    }
  }

  return intersections;
};

// 檢查一個點是否在圓圈內
export const pointInCircle = (point: LatLng, circle: CircleData): boolean => {
  const distance = calculateDistance(point, circle.center);
  return distance <= circle.radius;
};

// 檢查一個點是否在交集區域內
export const pointInIntersection = (point: LatLng, intersection: IntersectionArea, allCircles: CircleData[]): boolean => {
  // 首先檢查點是否在交集圓形區域內
  const distanceFromCenter = calculateDistance(point, intersection.center);
  const isInIntersectionArea = distanceFromCenter <= intersection.radius;
  
  if (!isInIntersectionArea) {
    return false;
  }
  
  // 然後驗證點確實在所有相關圓圈的交集內
  const relevantCircles = allCircles.filter(circle => intersection.circles.includes(circle.id));
  const isInAllCircles = relevantCircles.every(circle => pointInCircle(point, circle));
  
  console.log('🎯 點擊檢測:', {
    point,
    intersectionId: intersection.id,
    distanceFromCenter,
    intersectionRadius: intersection.radius,
    isInIntersectionArea,
    relevantCirclesCount: relevantCircles.length,
    isInAllCircles,
    finalResult: isInIntersectionArea && isInAllCircles
  });
  
  return isInIntersectionArea && isInAllCircles;
};