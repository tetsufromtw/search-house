interface LatLng {
  lat: number;
  lng: number;
}

interface CircleData {
  id: string;
  center: LatLng;
  radius: number;
  color: string;
  colorIndex: number;
}

export interface IntersectionArea {
  center: LatLng;
  radius: number;
  circles: string[];
  marker?: google.maps.Marker;
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
      center: smallerCircle.center,
      radius: smallerCircle.radius,
      circles: [circle1.id, circle2.id]
    };
  }

  // 計算交集區域的中心點（兩圓心連線的中點）
  const centerLat = (circle1.center.lat + circle2.center.lat) / 2;
  const centerLng = (circle1.center.lng + circle2.center.lng) / 2;
  
  // 計算交集區域的半徑（簡化計算）
  const intersectionRadius = Math.min(circle1.radius, circle2.radius) * 0.6;

  return {
    center: { lat: centerLat, lng: centerLng },
    radius: intersectionRadius,
    circles: [circle1.id, circle2.id]
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
  // 點必須在交集涉及的所有圓圈內
  const relevantCircles = allCircles.filter(circle => intersection.circles.includes(circle.id));
  return relevantCircles.every(circle => pointInCircle(point, circle));
};