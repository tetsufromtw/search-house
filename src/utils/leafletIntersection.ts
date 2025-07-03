/**
 * Leaflet 地圖交集計算工具
 * 移植並優化原有的圓圈交集邏輯
 */

interface LatLng {
  lat: number;
  lng: number;
}

interface RequirementLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  requirement: string;
}

interface RequirementCircle {
  id: string;
  requirement: string;
  displayName: string;
  center: LatLng;
  radius: number;
  color: string;
  locations: RequirementLocation[];
}

interface IntersectionArea {
  id: string;
  center: LatLng;
  radius: number;
  requirements: string[];
  score: number; // 交集品質分數
}

export class LeafletIntersectionCalculator {
  
  /**
   * 計算多個需求圓圈的交集區域
   */
  static calculateIntersections(
    circles: RequirementCircle[],
    minIntersectionRadius: number = 300,
    maxIntersectionRadius: number = 800
  ): IntersectionArea[] {
    console.log(`🧮 計算 ${circles.length} 個圓圈的交集`, {
      需求: circles.map(c => c.requirement),
      半徑範圍: `${minIntersectionRadius}m - ${maxIntersectionRadius}m`
    });

    if (circles.length < 2) {
      console.log('⚠️ 需要至少 2 個圓圈才能計算交集');
      return [];
    }

    const intersectionAreas: IntersectionArea[] = [];

    // 對於每個圓圈，找出與其他圓圈的交集
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const circle1 = circles[i];
        const circle2 = circles[j];

        const pairIntersections = this.calculatePairwiseIntersection(
          circle1, 
          circle2, 
          minIntersectionRadius,
          maxIntersectionRadius
        );

        intersectionAreas.push(...pairIntersections);
      }
    }

    // 尋找多重交集 (3個或以上圓圈的交集)
    if (circles.length >= 3) {
      const multiIntersections = this.calculateMultipleIntersections(
        circles,
        minIntersectionRadius,
        maxIntersectionRadius
      );
      intersectionAreas.push(...multiIntersections);
    }

    // 去重和排序
    const uniqueIntersections = this.deduplicateIntersections(intersectionAreas);
    const sortedIntersections = uniqueIntersections.sort((a, b) => b.score - a.score);

    console.log(`✅ 找到 ${sortedIntersections.length} 個交集區域`);
    return sortedIntersections.slice(0, 5); // 最多回傳 5 個最佳交集
  }

  /**
   * 計算兩個圓圈的交集
   */
  private static calculatePairwiseIntersection(
    circle1: RequirementCircle,
    circle2: RequirementCircle,
    minRadius: number,
    maxRadius: number
  ): IntersectionArea[] {
    const distance = this.calculateDistance(
      circle1.center.lat, circle1.center.lng,
      circle2.center.lat, circle2.center.lng
    );

    const totalRadius = circle1.radius + circle2.radius;

    // 檢查圓圈是否有交集
    if (distance > totalRadius) {
      return []; // 無交集
    }

    // 計算交集中心點
    const intersectionCenter = this.calculateIntersectionCenter(
      circle1.center, circle1.radius,
      circle2.center, circle2.radius
    );

    // 計算交集半徑
    const intersectionRadius = Math.min(
      maxRadius,
      Math.max(minRadius, (circle1.radius + circle2.radius - distance) / 2)
    );

    // 計算交集品質分數
    const score = this.calculateIntersectionScore(
      [circle1, circle2],
      intersectionCenter,
      intersectionRadius
    );

    return [{
      id: `intersection_${circle1.id}_${circle2.id}`,
      center: intersectionCenter,
      radius: intersectionRadius,
      requirements: [circle1.requirement, circle2.requirement],
      score
    }];
  }

  /**
   * 計算多重交集 (3個或以上圓圈)
   */
  private static calculateMultipleIntersections(
    circles: RequirementCircle[],
    minRadius: number,
    maxRadius: number
  ): IntersectionArea[] {
    const intersections: IntersectionArea[] = [];

    // 使用重心計算方法找出多重交集
    const centroid = this.calculateCentroid(circles.map(c => c.center));
    
    // 檢查重心是否在所有圓圈內
    const isValidIntersection = circles.every(circle => {
      const distance = this.calculateDistance(
        centroid.lat, centroid.lng,
        circle.center.lat, circle.center.lng
      );
      return distance <= circle.radius;
    });

    if (isValidIntersection) {
      // 計算交集半徑 (最小圓圈到重心的剩餘距離)
      const intersectionRadius = Math.min(
        maxRadius,
        Math.max(
          minRadius,
          Math.min(...circles.map(circle => {
            const distance = this.calculateDistance(
              centroid.lat, centroid.lng,
              circle.center.lat, circle.center.lng
            );
            return circle.radius - distance;
          }))
        )
      );

      if (intersectionRadius >= minRadius) {
        const score = this.calculateIntersectionScore(circles, centroid, intersectionRadius);
        
        intersections.push({
          id: `multi_intersection_${circles.map(c => c.id).join('_')}`,
          center: centroid,
          radius: intersectionRadius,
          requirements: circles.map(c => c.requirement),
          score: score + 0.5 // 多重交集額外加分
        });
      }
    }

    return intersections;
  }

  /**
   * 計算兩個圓圈的交集中心點
   */
  private static calculateIntersectionCenter(
    center1: LatLng, radius1: number,
    center2: LatLng, radius2: number
  ): LatLng {
    const distance = this.calculateDistance(
      center1.lat, center1.lng,
      center2.lat, center2.lng
    );

    if (distance === 0) return center1;

    // 基於半徑比例計算加權中心點
    const ratio = radius1 / (radius1 + radius2);
    
    const lat = center1.lat + (center2.lat - center1.lat) * ratio;
    const lng = center1.lng + (center2.lng - center1.lng) * ratio;

    return { lat, lng };
  }

  /**
   * 計算多個點的重心
   */
  private static calculateCentroid(points: LatLng[]): LatLng {
    const sumLat = points.reduce((sum, point) => sum + point.lat, 0);
    const sumLng = points.reduce((sum, point) => sum + point.lng, 0);

    return {
      lat: sumLat / points.length,
      lng: sumLng / points.length
    };
  }

  /**
   * 計算交集品質分數
   */
  private static calculateIntersectionScore(
    circles: RequirementCircle[],
    intersectionCenter: LatLng,
    intersectionRadius: number
  ): number {
    let score = 0;

    // 基礎分數：根據交集區域內的地點數量
    circles.forEach(circle => {
      const locationsInIntersection = circle.locations.filter(location => {
        const distance = this.calculateDistance(
          location.lat, location.lng,
          intersectionCenter.lat, intersectionCenter.lng
        );
        return distance <= intersectionRadius;
      });

      score += locationsInIntersection.length * 0.2;
    });

    // 需求多樣性加分
    score += circles.length * 0.3;

    // 交集半徑適中性加分
    const optimalRadius = 500; // 理想半徑
    const radiusPenalty = Math.abs(intersectionRadius - optimalRadius) / optimalRadius;
    score += (1 - radiusPenalty) * 0.5;

    return Math.max(0, score);
  }

  /**
   * 去除重複的交集區域
   */
  private static deduplicateIntersections(intersections: IntersectionArea[]): IntersectionArea[] {
    const unique: IntersectionArea[] = [];
    const threshold = 200; // 200 公尺內視為重複

    intersections.forEach(intersection => {
      const isDuplicate = unique.some(existing => {
        const distance = this.calculateDistance(
          intersection.center.lat, intersection.center.lng,
          existing.center.lat, existing.center.lng
        );
        return distance < threshold;
      });

      if (!isDuplicate) {
        unique.push(intersection);
      }
    });

    return unique;
  }

  /**
   * 計算兩點間距離 (公尺)
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // 地球半徑 (公尺)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * 檢查點是否在圓圈內
   */
  static isPointInCircle(
    point: LatLng,
    circleCenter: LatLng,
    circleRadius: number
  ): boolean {
    const distance = this.calculateDistance(
      point.lat, point.lng,
      circleCenter.lat, circleCenter.lng
    );
    return distance <= circleRadius;
  }

  /**
   * 根據交集區域篩選地點
   */
  static filterLocationsByIntersection(
    locations: RequirementLocation[],
    intersectionCenter: LatLng,
    intersectionRadius: number
  ): RequirementLocation[] {
    return locations.filter(location =>
      this.isPointInCircle(location, intersectionCenter, intersectionRadius)
    );
  }
}

/**
 * 建立需求圓圈的輔助函數
 */
export function createRequirementCircle(
  requirement: string,
  displayName: string,
  color: string,
  locations: Array<{ id: string; name: string; lat: number; lng: number }>,
  radius: number = 500
): RequirementCircle {
  if (locations.length === 0) {
    throw new Error(`需求 ${requirement} 沒有找到任何地點`);
  }

  // 計算所有地點的中心
  const center = {
    lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
    lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length
  };

  const requirementLocations: RequirementLocation[] = locations.map(loc => ({
    ...loc,
    requirement
  }));

  return {
    id: `circle_${requirement}`,
    requirement,
    displayName,
    center,
    radius,
    color,
    locations: requirementLocations
  };
}