/**
 * OSM 到 SUUMO 的資料橋接服務
 * 將 OpenStreetMap 查詢結果轉換為 SUUMO API 需要的座標邊界
 */

import { searchNearbyPlaces } from './placesService';
import { fetchSuumoData, getMockSuumoData, type SuumoProperty } from '../utils/suumoApi';

interface IntersectionArea {
  center: { lat: number; lng: number };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  radius: number;
  requirements: string[];
}

interface SuumoSearchResult {
  properties: SuumoProperty[];
  search_area: IntersectionArea;
  data_source: 'suumo_api' | 'mock';
  api_cost: number;
  total_found: number;
}

export class SuumoIntegrationService {
  private useMockSuumo: boolean;

  constructor(useMockSuumo: boolean = true) {
    this.useMockSuumo = useMockSuumo;
    console.log(`🏠 SUUMO 整合服務初始化:`, {
      使用模擬資料: useMockSuumo
    });
  }

  /**
   * 完整的搜尋流程：OSM 店鋪查詢 → 計算交集 → SUUMO 租屋搜尋
   */
  async searchPropertiesNearRequirements(
    requirements: string[],
    center: { lat: number; lng: number },
    searchRadius: number = 1000,
    intersectionRadius: number = 500
  ): Promise<{
    store_results: any;
    intersection_areas: IntersectionArea[];
    property_results: SuumoSearchResult[];
    total_api_cost: number;
    summary: string;
  }> {
    console.log(`🔍 開始完整搜尋流程:`, {
      需求: requirements,
      中心點: center,
      搜尋半徑: `${searchRadius}m`,
      交集半徑: `${intersectionRadius}m`
    });

    let totalApiCost = 0;

    // 1. 使用 OSM 查詢店鋪位置 (免費)
    console.log('📍 步驟 1: 查詢店鋪位置 (OSM)');
    const storeResults = await searchNearbyPlaces(requirements, center, searchRadius);
    totalApiCost += storeResults.total_cost;

    // 2. 計算交集區域
    console.log('🎯 步驟 2: 計算交集區域');
    const intersectionAreas = this.calculateIntersectionAreas(
      storeResults.results,
      intersectionRadius
    );

    if (intersectionAreas.length === 0) {
      console.warn('⚠️ 找不到交集區域');
      return {
        store_results: storeResults,
        intersection_areas: [],
        property_results: [],
        total_api_cost: totalApiCost,
        summary: '找不到符合所有需求的交集區域'
      };
    }

    // 3. 在每個交集區域搜尋租屋 (SUUMO)
    console.log(`🏠 步驟 3: 搜尋 ${intersectionAreas.length} 個交集區域的租屋`);
    const propertyResults: SuumoSearchResult[] = [];

    for (const area of intersectionAreas) {
      const suumoResult = await this.searchPropertiesInArea(area);
      propertyResults.push(suumoResult);
      totalApiCost += suumoResult.api_cost;
    }

    // 4. 生成摘要
    const totalProperties = propertyResults.reduce((sum, r) => sum + r.total_found, 0);
    const summary = this.generateSearchSummary(storeResults, intersectionAreas, totalProperties, totalApiCost);

    console.log('✅ 完整搜尋流程完成:', summary);

    return {
      store_results: storeResults,
      intersection_areas: intersectionAreas,
      property_results: propertyResults,
      total_api_cost: totalApiCost,
      summary
    };
  }

  /**
   * 計算多個需求的交集區域
   */
  private calculateIntersectionAreas(
    requirementResults: Record<string, any>,
    intersectionRadius: number
  ): IntersectionArea[] {
    console.log('🧮 計算交集區域...');

    const allLocations: Array<{ requirement: string; lat: number; lng: number; name: string }> = [];

    // 收集所有地點
    Object.entries(requirementResults).forEach(([requirement, result]) => {
      result.locations.forEach((location: any) => {
        allLocations.push({
          requirement,
          lat: location.lat,
          lng: location.lng,
          name: location.name
        });
      });
    });

    if (allLocations.length === 0) return [];

    // 簡化版交集計算：找出距離所有需求都很近的區域
    const intersectionCenters = this.findIntersectionCenters(
      requirementResults,
      intersectionRadius
    );

    const intersectionAreas: IntersectionArea[] = intersectionCenters.map(center => {
      const bounds = this.calculateAreaBounds(center, intersectionRadius);
      
      return {
        center,
        bounds,
        radius: intersectionRadius,
        requirements: Object.keys(requirementResults)
      };
    });

    console.log(`✅ 找到 ${intersectionAreas.length} 個交集區域`);
    return intersectionAreas;
  }

  /**
   * 找出交集中心點 (簡化演算法)
   */
  private findIntersectionCenters(
    requirementResults: Record<string, any>,
    maxDistance: number
  ): Array<{ lat: number; lng: number }> {
    const requirements = Object.keys(requirementResults);
    
    if (requirements.length < 2) {
      // 只有一個需求時，使用所有地點的中心
      const allLocs = requirementResults[requirements[0]]?.locations || [];
      if (allLocs.length === 0) return [];
      
      const avgLat = allLocs.reduce((sum: number, loc: any) => sum + loc.lat, 0) / allLocs.length;
      const avgLng = allLocs.reduce((sum: number, loc: any) => sum + loc.lng, 0) / allLocs.length;
      
      return [{ lat: avgLat, lng: avgLng }];
    }

    const intersectionCenters: Array<{ lat: number; lng: number }> = [];

    // 對第一個需求的每個地點，檢查是否有其他需求在附近
    const firstRequirement = requirements[0];
    const firstLocations = requirementResults[firstRequirement]?.locations || [];

    firstLocations.forEach((firstLoc: any) => {
      let hasNearbyForAllRequirements = true;
      const nearbyLocations = [firstLoc];

      // 檢查其他需求是否都有地點在附近
      for (let i = 1; i < requirements.length; i++) {
        const requirement = requirements[i];
        const locations = requirementResults[requirement]?.locations || [];
        
        const nearbyLoc = locations.find((loc: any) => 
          this.calculateDistance(firstLoc.lat, firstLoc.lng, loc.lat, loc.lng) <= maxDistance
        );

        if (nearbyLoc) {
          nearbyLocations.push(nearbyLoc);
        } else {
          hasNearbyForAllRequirements = false;
          break;
        }
      }

      if (hasNearbyForAllRequirements) {
        // 計算這群地點的中心
        const centerLat = nearbyLocations.reduce((sum, loc) => sum + loc.lat, 0) / nearbyLocations.length;
        const centerLng = nearbyLocations.reduce((sum, loc) => sum + loc.lng, 0) / nearbyLocations.length;
        
        intersectionCenters.push({ lat: centerLat, lng: centerLng });
      }
    });

    // 去除太近的重複中心點
    return this.deduplicateCenters(intersectionCenters, 200); // 200m 內視為重複
  }

  /**
   * 去除重複的中心點
   */
  private deduplicateCenters(
    centers: Array<{ lat: number; lng: number }>,
    minDistance: number
  ): Array<{ lat: number; lng: number }> {
    const uniqueCenters: Array<{ lat: number; lng: number }> = [];

    centers.forEach(center => {
      const isDuplicate = uniqueCenters.some(existing => 
        this.calculateDistance(center.lat, center.lng, existing.lat, existing.lng) < minDistance
      );

      if (!isDuplicate) {
        uniqueCenters.push(center);
      }
    });

    return uniqueCenters;
  }

  /**
   * 根據中心點和半徑計算區域邊界
   */
  private calculateAreaBounds(
    center: { lat: number; lng: number },
    radiusMeters: number
  ) {
    const latDegrees = radiusMeters / 111320;
    const lngDegrees = radiusMeters / (111320 * Math.cos(center.lat * Math.PI / 180));

    return {
      north: center.lat + latDegrees,
      south: center.lat - latDegrees,
      east: center.lng + lngDegrees,
      west: center.lng - lngDegrees
    };
  }

  /**
   * 在指定區域搜尋租屋 (SUUMO API)
   */
  private async searchPropertiesInArea(area: IntersectionArea): Promise<SuumoSearchResult> {
    console.log(`🏠 搜尋區域租屋:`, {
      中心: area.center,
      半徑: `${area.radius}m`,
      需求: area.requirements
    });

    try {
      let properties: SuumoProperty[];
      let dataSource: 'suumo_api' | 'mock';
      let apiCost = 0;

      if (this.useMockSuumo) {
        // 使用模擬資料 (免費)
        properties = await getMockSuumoData({
          center: area.center,
          radius: area.radius
        });
        dataSource = 'mock';
        apiCost = 0;
      } else {
        // 使用真實 SUUMO API (極少費用)
        properties = await fetchSuumoData({
          center: area.center,
          radius: area.radius
        });
        dataSource = 'suumo_api';
        apiCost = 0.001; // SUUMO API 費用很低
      }

      console.log(`✅ 找到 ${properties.length} 個租屋物件`);

      return {
        properties,
        search_area: area,
        data_source: dataSource,
        api_cost: apiCost,
        total_found: properties.length
      };

    } catch (error) {
      console.error('❌ SUUMO 搜尋失敗:', error);
      
      // 回退到模擬資料
      const mockProperties = await getMockSuumoData({
        center: area.center,
        radius: area.radius
      });

      return {
        properties: mockProperties,
        search_area: area,
        data_source: 'mock',
        api_cost: 0,
        total_found: mockProperties.length
      };
    }
  }

  /**
   * 計算兩點間距離 (公尺)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
   * 生成搜尋摘要
   */
  private generateSearchSummary(
    storeResults: any,
    intersectionAreas: IntersectionArea[],
    totalProperties: number,
    totalCost: number
  ): string {
    const totalStores = Object.values(storeResults.results).reduce(
      (sum: number, result: any) => sum + result.locations.length, 0
    );

    const costStr = totalCost > 0 ? `$${totalCost.toFixed(4)}` : '免費';
    
    return `找到 ${totalStores} 個店鋪，${intersectionAreas.length} 個交集區域，${totalProperties} 個租屋物件。總費用：${costStr}`;
  }

  /**
   * 切換 SUUMO 資料源
   */
  setSuumoMode(useMock: boolean): void {
    this.useMockSuumo = useMock;
    console.log(`🔄 切換 SUUMO 模式:`, useMock ? '模擬資料' : '真實 API');
  }

  /**
   * 獲取服務狀態
   */
  getStatus() {
    return {
      suumo_mode: this.useMockSuumo ? 'mock' : 'api',
      integration_ready: true,
      estimated_cost_per_search: this.useMockSuumo ? 0 : 0.001
    };
  }
}

// 建立預設實例 (使用模擬 SUUMO 資料)
export const suumoIntegration = new SuumoIntegrationService(true);

// 便利函數
export async function searchPropertiesWithRequirements(
  requirements: string[],
  center: { lat: number; lng: number },
  searchRadius: number = 1000,
  intersectionRadius: number = 500
) {
  return await suumoIntegration.searchPropertiesNearRequirements(
    requirements,
    center,
    searchRadius,
    intersectionRadius
  );
}