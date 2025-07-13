/**
 * 交集計算服務 - 處理多個圓形區域的交集計算
 */

import { IIntersectionService, IntersectionArea, SearchRequirement, LatLng } from '../types';
import { CONFIG } from '../config';

export class IntersectionService implements IIntersectionService {
  private cache = new Map<string, { data: IntersectionArea[]; timestamp: number }>();

  async calculateIntersections(requirements: SearchRequirement[]): Promise<IntersectionArea[]> {
    // 過濾啟用的需求
    const enabledRequirements = requirements.filter(req => req.enabled && req.locations.length > 0);
    
    if (enabledRequirements.length < 2) {
      return [];
    }

    // 快取檢查
    const cacheKey = this.generateCacheKey(enabledRequirements);
    if (CONFIG.SEARCH.enableCaching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      const intersections = await this.computeIntersections(enabledRequirements);
      
      if (CONFIG.SEARCH.enableCaching) {
        this.setCachedResult(cacheKey, intersections);
      }
      
      return intersections;
    } catch (error) {
      console.error('計算交集失敗:', error);
      throw new Error('無法計算交集區域');
    }
  }

  private async computeIntersections(requirements: SearchRequirement[]): Promise<IntersectionArea[]> {
    const intersections: IntersectionArea[] = [];
    
    // 為每個需求建立圓形區域
    const circles = requirements.map(req => ({
      requirement: req,
      circles: req.locations.map(loc => ({
        center: loc.coordinates,
        radius: CONFIG.SEARCH.searchRadius,
        locationId: loc.id,
        locationName: loc.name,
      })),
    }));

    // 計算所有可能的交集組合
    const combinations = this.generateCombinations(circles);
    
    for (const combination of combinations) {
      const intersection = this.calculateCircleIntersection(combination);
      if (intersection) {
        intersections.push(intersection);
      }
    }

    // 排序並篩選最佳交集
    return this.rankAndFilterIntersections(intersections);
  }

  private generateCombinations(circles: any[]): any[] {
    const combinations: any[] = [];
    
    // 生成所有 2-n 個需求的組合
    for (let i = 2; i <= circles.length; i++) {
      const reqCombinations = this.getCombinations(circles, i);
      
      for (const reqCombo of reqCombinations) {
        // 對每個需求組合，生成所有地點的組合
        const locationCombinations = this.generateLocationCombinations(reqCombo);
        combinations.push(...locationCombinations);
      }
    }
    
    return combinations;
  }

  private getCombinations<T>(array: T[], size: number): T[][] {
    if (size === 1) return array.map(item => [item]);
    
    const combinations: T[][] = [];
    for (let i = 0; i <= array.length - size; i++) {
      const head = array[i];
      const tailCombinations = this.getCombinations(array.slice(i + 1), size - 1);
      for (const tailCombo of tailCombinations) {
        combinations.push([head, ...tailCombo]);
      }
    }
    
    return combinations;
  }

  private generateLocationCombinations(reqCombination: any[]): any[] {
    const combinations: any[] = [];
    
    // 生成笛卡爾積 - 每個需求選一個地點
    const generate = (index: number, current: any[]) => {
      if (index === reqCombination.length) {
        combinations.push([...current]);
        return;
      }
      
      const req = reqCombination[index];
      for (const circle of req.circles) {
        current.push({ ...circle, requirementId: req.requirement.id });
        generate(index + 1, current);
        current.pop();
      }
    };
    
    generate(0, []);
    return combinations;
  }

  private calculateCircleIntersection(circlesCombination: any[]): IntersectionArea | null {
    if (circlesCombination.length < 2) return null;

    // 計算所有圓的交集
    const intersectionResult = this.findCirclesIntersection(circlesCombination);
    
    if (!intersectionResult) return null;

    // 計算交集品質分數
    const score = this.calculateIntersectionScore(circlesCombination, intersectionResult);
    
    if (score < CONFIG.SEARCH.minIntersectionScore) return null;

    return {
      id: `intersection-${Date.now()}-${Math.random()}`,
      center: intersectionResult.center,
      radius: intersectionResult.radius,
      requirements: [...new Set(circlesCombination.map(c => c.requirementId))],
      score,
      bounds: this.calculateBounds(intersectionResult.center, intersectionResult.radius),
    };
  }

  private findCirclesIntersection(circles: any[]): { center: LatLng; radius: number } | null {
    if (circles.length < 2) return null;

    // 簡化版本：找到所有圓的重疊區域中心
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    // 計算所有圓的邊界
    for (const circle of circles) {
      const radiusInDegrees = circle.radius / 111320; // 粗略轉換為度
      minLat = Math.min(minLat, circle.center.lat - radiusInDegrees);
      maxLat = Math.max(maxLat, circle.center.lat + radiusInDegrees);
      minLng = Math.min(minLng, circle.center.lng - radiusInDegrees);
      maxLng = Math.max(maxLng, circle.center.lng + radiusInDegrees);
    }

    // 檢查是否有重疊
    if (minLat > maxLat || minLng > maxLng) return null;

    // 計算重疊區域中心
    const center: LatLng = {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };

    // 計算有效半徑
    const radius = this.calculateEffectiveRadius(center, circles);
    
    return { center, radius };
  }

  private calculateEffectiveRadius(center: LatLng, circles: any[]): number {
    let minDistance = Infinity;
    
    for (const circle of circles) {
      const distance = this.calculateDistance(center, circle.center);
      const effectiveRadius = Math.max(0, circle.radius - distance);
      minDistance = Math.min(minDistance, effectiveRadius);
    }
    
    return Math.max(100, minDistance); // 最小半徑 100m
  }

  private calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371e3; // 地球半徑（米）
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private calculateIntersectionScore(circles: any[], intersection: { center: LatLng; radius: number }): number {
    let score = 0;
    
    // 基礎分數：需求數量
    score += circles.length * 0.3;
    
    // 距離分數：交集中心到各個圓心的距離
    const avgDistance = circles.reduce((sum, circle) => {
      return sum + this.calculateDistance(intersection.center, circle.center);
    }, 0) / circles.length;
    
    const distanceScore = Math.max(0, 1 - avgDistance / 2000); // 2km 內滿分
    score += distanceScore * 0.4;
    
    // 半徑分數：交集半徑越大越好
    const radiusScore = Math.min(1, intersection.radius / 500); // 500m 內滿分
    score += radiusScore * 0.3;
    
    return Math.min(1, score);
  }

  private calculateBounds(center: LatLng, radius: number) {
    const radiusInDegrees = radius / 111320;
    return {
      north: center.lat + radiusInDegrees,
      south: center.lat - radiusInDegrees,
      east: center.lng + radiusInDegrees,
      west: center.lng - radiusInDegrees,
    };
  }

  private rankAndFilterIntersections(intersections: IntersectionArea[]): IntersectionArea[] {
    // 按分數排序
    const sorted = intersections.sort((a, b) => b.score - a.score);
    
    // 去除重疊的交集
    const filtered = this.removeOverlappingIntersections(sorted);
    
    // 限制數量
    return filtered.slice(0, 10);
  }

  private removeOverlappingIntersections(intersections: IntersectionArea[]): IntersectionArea[] {
    const result: IntersectionArea[] = [];
    
    for (const intersection of intersections) {
      const isOverlapping = result.some(existing => {
        const distance = this.calculateDistance(intersection.center, existing.center);
        return distance < (intersection.radius + existing.radius) / 2;
      });
      
      if (!isOverlapping) {
        result.push(intersection);
      }
    }
    
    return result;
  }

  private generateCacheKey(requirements: SearchRequirement[]): string {
    const key = requirements
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(req => `${req.id}:${req.locations.length}`)
      .join('|');
    return key;
  }

  private getCachedResult(key: string): IntersectionArea[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CONFIG.CACHE.INTERSECTION_CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedResult(key: string, data: IntersectionArea[]): void {
    if (this.cache.size >= CONFIG.CACHE.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}