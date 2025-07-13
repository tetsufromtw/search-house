/**
 * 簡化版房屋搜尋服務
 * 避免複雜的異步載入問題
 */

import { 
  ILocationService, 
  IPropertyService, 
  IIntersectionService,
  Location,
  Property,
  IntersectionArea,
  SearchRequirement,
  LatLng,
  SearchResult
} from '../types';
import { CONFIG } from '../config';

// 簡化版地點搜尋服務
class SimpleLocationService implements ILocationService {
  async searchPlaces(query: string, center: LatLng, radius: number): Promise<Location[]> {
    try {
      // 使用現有的 OSM API
      const response = await fetch('/api/osm-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, center, radius }),
      });

      if (!response.ok) {
        throw new Error(`搜尋失敗: ${response.status}`);
      }

      const data = await response.json();
      return this.transformData(data);
    } catch (error) {
      console.error('地點搜尋失敗:', error);
      return []; // 返回空陣列而不是拋出錯誤
    }
  }

  private transformData(data: any): Location[] {
    if (!data.locations || !Array.isArray(data.locations)) {
      return [];
    }

    return data.locations.slice(0, 10).map((place: any) => ({
      id: place.place_id || `loc-${Date.now()}-${Math.random()}`,
      name: place.display_name?.split(',')[0] || '未知地點',
      address: place.display_name || '',
      coordinates: {
        lat: parseFloat(place.lat) || 0,
        lng: parseFloat(place.lon) || 0,
      },
      placeId: place.place_id,
    }));
  }
}

// 簡化版房源搜尋服務
class SimplePropertyService implements IPropertyService {
  async searchProperties(area: IntersectionArea): Promise<Property[]> {
    try {
      // 使用現有的 SUUMO API
      const response = await fetch('/api/suumo/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          center: area.center,
          radius: area.radius,
          maxResults: CONFIG.SEARCH.maxResults,
        }),
      });

      if (!response.ok) {
        throw new Error(`房源搜尋失敗: ${response.status}`);
      }

      const data = await response.json();
      return this.transformData(data);
    } catch (error) {
      console.error('房源搜尋失敗:', error);
      return []; // 返回空陣列而不是拋出錯誤
    }
  }

  private transformData(data: any): Property[] {
    if (!data.properties || !Array.isArray(data.properties)) {
      return [];
    }

    return data.properties.map((property: any) => ({
      id: property.id || `prop-${Date.now()}-${Math.random()}`,
      title: property.title || '未知物件',
      price: property.price || '價格未公開',
      location: property.location || property.address || '',
      coordinates: property.coordinates ? {
        lat: parseFloat(property.coordinates.lat),
        lng: parseFloat(property.coordinates.lng),
      } : undefined,
      size: property.size,
      layout: property.layout,
      url: property.url,
      tags: property.tags || [],
    }));
  }
}

// 簡化版交集計算服務
class SimpleIntersectionService implements IIntersectionService {
  async calculateIntersections(requirements: SearchRequirement[]): Promise<IntersectionArea[]> {
    const enabledRequirements = requirements.filter(req => req.enabled && req.locations.length > 0);
    
    if (enabledRequirements.length < 2) {
      return [];
    }

    const intersections: IntersectionArea[] = [];

    // 簡化的交集計算：取每兩個需求的第一個地點計算中點
    for (let i = 0; i < enabledRequirements.length - 1; i++) {
      for (let j = i + 1; j < enabledRequirements.length; j++) {
        const req1 = enabledRequirements[i];
        const req2 = enabledRequirements[j];
        
        if (req1.locations.length > 0 && req2.locations.length > 0) {
          const loc1 = req1.locations[0];
          const loc2 = req2.locations[0];
          
          const center = {
            lat: (loc1.coordinates.lat + loc2.coordinates.lat) / 2,
            lng: (loc1.coordinates.lng + loc2.coordinates.lng) / 2,
          };
          
          intersections.push({
            id: `intersection-${req1.id}-${req2.id}`,
            center,
            radius: 500,
            requirements: [req1.id, req2.id],
            score: 0.8,
          });
        }
      }
    }

    return intersections;
  }
}

// 簡化版主服務
export class SimpleHouseSearchService {
  private locationService = new SimpleLocationService();
  private propertyService = new SimplePropertyService();
  private intersectionService = new SimpleIntersectionService();

  async searchLocations(query: string, center: LatLng, radius: number): Promise<Location[]> {
    return await this.locationService.searchPlaces(query, center, radius);
  }

  async searchProperties(area: IntersectionArea): Promise<Property[]> {
    return await this.propertyService.searchProperties(area);
  }

  async calculateIntersections(requirements: SearchRequirement[]): Promise<IntersectionArea[]> {
    return await this.intersectionService.calculateIntersections(requirements);
  }

  async searchComplete(requirements: SearchRequirement[]): Promise<SearchResult> {
    const startTime = Date.now();
    console.log('🔍 開始搜尋，需求數量:', requirements.length);
    
    try {
      // 先為每個需求搜尋地點
      for (const requirement of requirements) {
        if (requirement.enabled && requirement.query.trim() && requirement.locations.length === 0) {
          console.log(`🔍 搜尋需求地點: ${requirement.query}`);
          const locations = await this.searchLocations(requirement.query, CONFIG.MAP.DEFAULT_CENTER, 2000);
          requirement.locations = locations;
          console.log(`✅ 找到 ${locations.length} 個地點`);
        }
      }

      // 計算交集區域
      const intersectionAreas = await this.calculateIntersections(requirements);
      console.log(`🎯 計算出 ${intersectionAreas.length} 個交集區域`);
      
      // 搜尋房源
      const propertyPromises = intersectionAreas.slice(0, 3).map(area => 
        this.searchProperties(area)
      );
      
      const propertyResults = await Promise.allSettled(propertyPromises);
      
      const allProperties = propertyResults
        .filter((result): result is PromiseFulfilledResult<Property[]> => 
          result.status === 'fulfilled'
        )
        .flatMap(result => result.value);
      
      console.log(`🏠 找到 ${allProperties.length} 個房源`);

      // 計算中心點
      const allLocations = requirements.flatMap(req => req.locations);
      const queryCenter = allLocations.length > 0 ? {
        lat: allLocations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / allLocations.length,
        lng: allLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / allLocations.length,
      } : CONFIG.MAP.DEFAULT_CENTER;

      return {
        properties: allProperties,
        intersectionAreas,
        metadata: {
          totalFound: allProperties.length,
          searchTime: Date.now() - startTime,
          queryCenter,
          queryRadius: CONFIG.SEARCH.searchRadius,
        },
      };
    } catch (error) {
      console.error('完整搜尋失敗:', error);
      throw new Error('搜尋失敗，請重試');
    }
  }
}