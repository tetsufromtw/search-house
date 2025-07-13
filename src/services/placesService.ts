/**
 * 統一地點查詢服務
 * 支援多種資料源：OSM (免費) + Google Places API (付費)
 */

import { osmService, queryMultipleRequirements, calculateIntersectionBounds } from './osm/osmService';
import { searchPlaces, createRequirementCircles, type PlaceResult, type RequirementCircle } from '../utils/placesApi';

interface ServiceConfig {
  useOSM: boolean;
  useGoogle: boolean;
  preferredSource: 'osm' | 'google' | 'hybrid';
  maxBudget: number; // 每日最大 API 費用 (USD)
}

interface UnifiedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  rating?: number;
  types: string[];
  source: 'osm' | 'google' | 'mock';
}

interface UnifiedSearchResult {
  requirement: string;
  locations: UnifiedLocation[];
  source: 'osm' | 'google' | 'mock';
  cached: boolean;
  api_cost: number;
  query_time: number;
}

export class UnifiedPlacesService {
  private config: ServiceConfig;

  constructor(config?: Partial<ServiceConfig>) {
    this.config = {
      useOSM: true,
      useGoogle: false,  // 預設關閉，避免費用
      preferredSource: 'osm',
      maxBudget: 5.0,    // 每日最大 $5 USD
      ...config
    };

    console.log('🌍 初始化統一地點服務:', this.config);
  }

  /**
   * 智慧搜尋：根據配置自動選擇最佳資料源
   */
  async smartSearch(
    requirements: string[], 
    center: { lat: number; lng: number }, 
    radius: number = 1000
  ): Promise<{
    results: Record<string, UnifiedSearchResult>;
    intersection_bounds: any;
    total_cost: number;
    recommendation: string;
  }> {
    console.log(`🧠 智慧搜尋開始:`, {
      需求: requirements,
      中心: center,
      半徑: `${radius}m`,
      偏好來源: this.config.preferredSource
    });

    let results: Record<string, UnifiedSearchResult> = {};
    let totalCost = 0;

    // 根據偏好選擇資料源
    switch (this.config.preferredSource) {
      case 'osm':
        results = await this.searchWithOSM(requirements, center, radius);
        break;
        
      case 'google':
        if (this.config.useGoogle) {
          results = await this.searchWithGoogle(requirements, center, radius);
          totalCost = this.estimateGoogleCost(requirements);
        } else {
          console.warn('⚠️ Google API 已停用，回退到 OSM');
          results = await this.searchWithOSM(requirements, center, radius);
        }
        break;
        
      case 'hybrid':
        results = await this.searchWithHybrid(requirements, center, radius);
        break;
    }

    // 計算交集區域
    const osmResults: Record<string, any> = {};
    Object.entries(results).forEach(([req, result]) => {
      osmResults[req] = {
        locations: result.locations,
        total_found: result.locations.length
      };
    });

    const intersectionBounds = calculateIntersectionBounds(osmResults);
    
    // 生成建議
    const recommendation = this.generateRecommendation(results, totalCost);

    console.log(`✅ 智慧搜尋完成:`, {
      總地點數: Object.values(results).reduce((sum, r) => sum + r.locations.length, 0),
      總費用: `$${totalCost.toFixed(4)}`,
      有交集區域: !!intersectionBounds
    });

    return {
      results,
      intersection_bounds: intersectionBounds,
      total_cost: totalCost,
      recommendation
    };
  }

  /**
   * 使用 OSM 搜尋 (免費)
   */
  private async searchWithOSM(
    requirements: string[], 
    center: { lat: number; lng: number }, 
    radius: number
  ): Promise<Record<string, UnifiedSearchResult>> {
    console.log('🗺️ 使用 OSM 資料源 (免費)');

    try {
      const osmResults = await queryMultipleRequirements(requirements, center, radius);
      const unifiedResults: Record<string, UnifiedSearchResult> = {};

      Object.entries(osmResults).forEach(([requirement, osmResult]) => {
        // 如果 OSM 沒有結果，就是沒有結果！不要假資料
        unifiedResults[requirement] = {
          requirement,
          locations: osmResult.locations.map(this.convertOSMToUnified),
          source: 'osm',
          cached: false,
          api_cost: 0, // OSM 完全免費
          query_time: osmResult.query_time
        };
      });

      return unifiedResults;
    } catch (error) {
      console.error('❌ OSM 查詢完全失敗，回傳空結果:', error);
      
      // 查詢失敗就回傳空結果，不要假資料
      const unifiedResults: Record<string, UnifiedSearchResult> = {};
      
      requirements.forEach(requirement => {
        unifiedResults[requirement] = {
          requirement,
          locations: [], // 空結果
          source: 'osm',
          cached: false,
          api_cost: 0,
          query_time: 0
        };
      });

      return unifiedResults;
    }
  }

  /**
   * 使用 Google Places API 搜尋 (付費)
   */
  private async searchWithGoogle(
    requirements: string[], 
    center: { lat: number; lng: number }, 
    radius: number
  ): Promise<Record<string, UnifiedSearchResult>> {
    console.log('💰 使用 Google Places API (付費)');

    const bounds = {
      north: center.lat + (radius / 111320),
      south: center.lat - (radius / 111320),
      east: center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI / 180))),
      west: center.lng - (radius / (111320 * Math.cos(center.lat * Math.PI / 180)))
    };

    const unifiedResults: Record<string, UnifiedSearchResult> = {};

    for (const requirement of requirements) {
      const startTime = Date.now();
      
      try {
        // 注意：這裡會產生費用！
        const googlePlaces = await searchPlaces(requirement, bounds);
        const queryTime = Date.now() - startTime;

        unifiedResults[requirement] = {
          requirement,
          locations: googlePlaces.map(this.convertGoogleToUnified),
          source: 'google',
          cached: false,
          api_cost: this.estimateGoogleCost([requirement]),
          query_time: queryTime
        };
      } catch (error) {
        console.error(`❌ Google API 查詢失敗 (${requirement}):`, error);
        
        // 回退到 OSM
        const osmResult = await osmService.queryByRequirement(requirement, {
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west
        });

        unifiedResults[requirement] = {
          requirement,
          locations: osmResult.locations.map(this.convertOSMToUnified),
          source: 'osm',
          cached: false,
          api_cost: 0,
          query_time: osmResult.query_time
        };
      }
    }

    return unifiedResults;
  }

  /**
   * 混合模式：OSM 優先，Google 補強
   */
  private async searchWithHybrid(
    requirements: string[], 
    center: { lat: number; lng: number }, 
    radius: number
  ): Promise<Record<string, UnifiedSearchResult>> {
    console.log('🔀 使用混合模式 (OSM + Google)');

    // 先用 OSM 搜尋
    const osmResults = await this.searchWithOSM(requirements, center, radius);
    
    // 檢查哪些需求的結果不足
    const needGoogleSupplement = Object.entries(osmResults).filter(
      ([req, result]) => result.locations.length < 3 // 少於 3 個結果時用 Google 補強
    );

    if (needGoogleSupplement.length > 0 && this.config.useGoogle) {
      console.log(`🔄 ${needGoogleSupplement.length} 個需求需要 Google 補強`);
      
      // 只對結果不足的需求使用 Google API
      const supplementRequirements = needGoogleSupplement.map(([req]) => req);
      const googleResults = await this.searchWithGoogle(supplementRequirements, center, radius);
      
      // 合併結果
      Object.entries(googleResults).forEach(([req, googleResult]) => {
        const osmResult = osmResults[req];
        
        // 合併 OSM 和 Google 的結果
        const combinedLocations = [
          ...osmResult.locations,
          ...googleResult.locations.filter(gLoc => 
            !osmResult.locations.some(oLoc => 
              this.calculateDistance(gLoc.lat, gLoc.lng, oLoc.lat, oLoc.lng) < 50 // 去重：50m 內視為同一地點
            )
          )
        ];

        osmResults[req] = {
          ...osmResult,
          locations: combinedLocations,
          source: 'google', // 標記為 Google 補強
          api_cost: googleResult.api_cost
        };
      });
    }

    return osmResults;
  }

  /**
   * 轉換 OSM 格式到統一格式
   */
  private convertOSMToUnified = (osmLocation: any): UnifiedLocation => {
    return {
      id: osmLocation.id,
      name: osmLocation.name,
      lat: osmLocation.lat,
      lng: osmLocation.lng,
      address: osmLocation.address || '',
      rating: undefined, // OSM 通常沒有評分
      types: this.inferTypesFromOSM(osmLocation),
      source: 'osm'
    };
  }

  /**
   * 轉換 Google 格式到統一格式  
   */
  private convertGoogleToUnified(googlePlace: PlaceResult): UnifiedLocation {
    return {
      id: googlePlace.place_id,
      name: googlePlace.name,
      lat: googlePlace.location.lat,
      lng: googlePlace.location.lng,
      address: googlePlace.address,
      rating: googlePlace.rating,
      types: googlePlace.types,
      source: 'google'
    };
  }

  /**
   * 從 OSM 標籤推斷地點類型
   */
  private inferTypesFromOSM(osmLocation: any): string[] {
    const types: string[] = [];
    
    if (osmLocation.amenity) types.push(osmLocation.amenity);
    if (osmLocation.shop) types.push(osmLocation.shop);
    if (osmLocation.leisure) types.push(osmLocation.leisure);
    if (osmLocation.brand) types.push('branded');
    
    return types.length > 0 ? types : ['establishment'];
  }

  /**
   * 估算 Google API 費用
   */
  private estimateGoogleCost(requirements: string[]): number {
    // Places API (New) 費用：$17 per 1000 requests
    const costPerRequest = 17 / 1000;
    return requirements.length * costPerRequest;
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
   * 生成搜尋建議
   */
  private generateRecommendation(
    results: Record<string, UnifiedSearchResult>, 
    totalCost: number
  ): string {
    const totalLocations = Object.values(results).reduce((sum, r) => sum + r.locations.length, 0);
    const osmCount = Object.values(results).filter(r => r.source === 'osm').length;
    const googleCount = Object.values(results).filter(r => r.source === 'google').length;

    if (totalCost === 0) {
      return `✅ 完全免費搜尋！使用 OSM 找到 ${totalLocations} 個地點，節省約 $${this.estimateGoogleCost(Object.keys(results)).toFixed(3)} 費用。`;
    } else if (totalCost < 0.01) {
      return `💰 低成本搜尋：$${totalCost.toFixed(4)}，混合使用 OSM(${osmCount}) 和 Google(${googleCount})。`;
    } else {
      return `⚠️ 高成本搜尋：$${totalCost.toFixed(2)}，建議增加 OSM 使用比例或檢查查詢頻率。`;
    }
  }


  /**
   * 更新服務配置
   */
  updateConfig(newConfig: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ 更新服務配置:', this.config);
  }

  /**
   * 獲取服務統計
   */
  getStats() {
    return {
      config: this.config,
      osm_available: true, // OSM 永遠可用
      google_available: this.config.useGoogle,
      estimated_daily_budget: this.config.maxBudget
    };
  }
}

// 建立預設實例 (OSM 優先，零成本)
export const placesService = new UnifiedPlacesService({
  useOSM: true,
  useGoogle: false, // 預設關閉避免意外費用
  preferredSource: 'osm',
  maxBudget: 0 // 零預算模式
});

// 便利函數
export async function searchNearbyPlaces(
  requirements: string[],
  center: { lat: number; lng: number },
  radius: number = 1000
) {
  return await placesService.smartSearch(requirements, center, radius);
}