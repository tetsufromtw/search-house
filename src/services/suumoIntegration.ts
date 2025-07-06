/**
 * OSM 到 SUUMO 的資料橋接服務
 * 將 OpenStreetMap 查詢結果轉換為 SUUMO API 需要的座標邊界
 */

import { searchNearbyPlaces } from './placesService';
import { getMockSuumoData, type SuumoProperty } from '../utils/suumoApi';
import { suumoApiClient } from './suumo/apiClient';
import type { SuumoApiResponse } from './suumo/types';

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
   * 從 SUUMO 頁面獲取真實 Token 參數
   */
  private async fetchSuumoTokens(): Promise<{
    UID: string;
    STMP: string;
    ATT: string;
    url: string;
  }> {
    console.log('🔑 開始獲取 SUUMO Token 參數...');
    
    try {
      // 直接呼叫 SUUMO 頁面而非透過 API 代理
      const response = await fetch('https://suumo.jp/map/chintai/tokyo/sc_shibuya/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja,en;q=0.5',
          'Referer': 'https://suumo.jp/',
          'Connection': 'keep-alive'
        }
      });

      if (!response.ok) {
        throw new Error(`Token 獲取請求失敗: HTTP ${response.status}`);
      }

      const html = await response.text();
      
      if (!html) {
        throw new Error('無法獲取 SUUMO 頁面內容');
      }

      console.log(`📄 獲取 SUUMO 頁面成功，HTML 長度: ${html.length}`);

      // 解析 suumo.ApiParam 物件
      const apiParamMatch = html.match(/suumo\.ApiParam\s*=\s*({[\s\S]*?});/);
      
      if (!apiParamMatch) {
        throw new Error('無法在頁面中找到 suumo.ApiParam 物件');
      }

      const apiParamString = apiParamMatch[1];
      console.log('📋 找到 ApiParam:', apiParamString.substring(0, 200) + '...');

      // 嘗試解析 JSON
      let apiParam;
      try {
        // 清理 JavaScript 物件格式為有效 JSON
        const cleanedJson = apiParamString
          .replace(/'/g, '"')  // 單引號改雙引號
          .replace(/(\w+):/g, '"$1":')  // 屬性名加引號
          .replace(/,\s*}/g, '}');  // 移除末尾逗號
        
        apiParam = JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error('❌ JSON 解析失敗，嘗試手動提取:', parseError);
        
        // 手動提取參數
        const uidMatch = apiParamString.match(/'UID':\s*'([^']+)'/);
        const stmpMatch = apiParamString.match(/'STMP':\s*'([^']+)'/);
        const attMatch = apiParamString.match(/'ATT':\s*'([^']+)'/);
        const urlMatch = apiParamString.match(/'url':\s*'([^']+)'/);

        if (!uidMatch || !stmpMatch || !attMatch || !urlMatch) {
          throw new Error('無法手動提取 Token 參數');
        }

        apiParam = {
          bkApi: {
            UID: uidMatch[1],
            STMP: stmpMatch[1],
            ATT: attMatch[1],
            url: urlMatch[1]
          }
        };
      }

      if (!apiParam.bkApi) {
        throw new Error('ApiParam 中缺少 bkApi 物件');
      }

      const { UID, STMP, ATT, url } = apiParam.bkApi;

      if (!UID || !STMP || !ATT || !url) {
        throw new Error(`Token 參數不完整: UID=${!!UID}, STMP=${!!STMP}, ATT=${!!ATT}, url=${!!url}`);
      }

      console.log('✅ 成功獲取 SUUMO Token:', {
        UID,
        STMP,
        ATT: ATT.substring(0, 10) + '...',
        url
      });

      return { UID, STMP, ATT, url };

    } catch (error) {
      console.error('❌ 獲取 SUUMO Token 失敗:', error);
      throw new Error(`無法獲取 SUUMO Token: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 根據交集資訊和真實 Token 組出 SUUMO API 參數
   */
  private buildSuumoApiParams(
    intersectionArea: IntersectionArea,
    tokens: { UID: string; STMP: string; ATT: string; url: string }
  ): URLSearchParams {
    const params = new URLSearchParams({
      UID: tokens.UID,
      STMP: tokens.STMP,
      ATT: tokens.ATT,
      FORMAT: '1',
      CALLBACK: 'SUUMO.CALLBACK.FUNCTION',
      P: '1',
      CNT: '20',
      GAZO: '2',
      PROT: '1',
      SE: '040',
      KUKEIPT1LT: intersectionArea.bounds.north.toString(),
      KUKEIPT1LG: intersectionArea.bounds.east.toString(),
      KUKEIPT2LT: intersectionArea.bounds.south.toString(),
      KUKEIPT2LG: intersectionArea.bounds.west.toString()
    });

    console.log('📋 使用真實 Token 組出的 SUUMO API 參數:', {
      交集中心: intersectionArea.center,
      交集半徑: intersectionArea.radius,
      矩形邊界: intersectionArea.bounds,
      使用Token: {
        UID: tokens.UID,
        STMP: tokens.STMP,
        ATT: tokens.ATT.substring(0, 10) + '...'
      }
    });

    return params;
  }

  /**
   * 實際呼叫 SUUMO API 並解析回應
   */
  private async callSuumoApi(
    intersectionArea: IntersectionArea,
    tokens: { UID: string; STMP: string; ATT: string; url: string }
  ): Promise<SuumoProperty[]> {
    const params = this.buildSuumoApiParams(intersectionArea, tokens);
    const fullUrl = `${tokens.url}?${params.toString()}`;
    
    console.log('🌐 實際呼叫 SUUMO API:', fullUrl);

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Referer': 'https://suumo.jp/map/chintai/tokyo/sc_shibuya/',
          'Origin': 'https://suumo.jp'
        }
      });

      if (!response.ok) {
        throw new Error(`SUUMO API 回應錯誤: HTTP ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📄 SUUMO API 原始回應長度:', responseText.length);

      // 解析 JSONP 回應
      const apiData = this.parseSuumoJsonpResponse(responseText);
      
      // 轉換為 SuumoProperty 格式
      return this.convertToSuumoProperties(apiData, intersectionArea);

    } catch (error) {
      console.error('❌ SUUMO API 呼叫失敗:', error);
      throw new Error(`SUUMO API 呼叫失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 解析 SUUMO API 回應 (純 JSON 格式)
   */
  private parseSuumoJsonpResponse(responseText: string): any {
    console.log('🔍 解析 SUUMO API 回應...');
    console.log('📝 回應前 100 字符:', responseText.substring(0, 100));

    // 檢查是否包含錯誤
    if (responseText.includes('認証エラー') || responseText.includes('エラー')) {
      throw new Error('SUUMO API 認證錯誤或其他錯誤');
    }

    // 檢查是否為 HTML 錯誤頁面
    if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
      console.error('🚨 收到 HTML 回應而非 JSON:', responseText.substring(0, 500));
      throw new Error('SUUMO API 回傳 HTML 頁面而非 JSON 資料');
    }

    // 首先嘗試直接解析為 JSON (SUUMO 實際回傳純 JSON)
    try {
      const jsonData = JSON.parse(responseText);
      console.log('✅ JSON 解析成功，資料結構:', Object.keys(jsonData));
      
      // 驗證是否為正確的 SUUMO 回應格式
      if (jsonData.smatch && jsonData.smatch.resultset) {
        console.log('✅ 確認為正確的 SUUMO API 回應格式');
        console.log('📊 回應摘要:', {
          總命中數: jsonData.smatch.resultset.hits,
          項目數: jsonData.smatch.resultset.item?.length || 0,
          條件: jsonData.smatch.condition?.substring(0, 100) + '...'
        });
        return jsonData;
      } else {
        console.warn('⚠️ JSON 解析成功但格式不符合預期');
      }
    } catch (jsonError) {
      console.warn('⚠️ 直接 JSON 解析失敗，嘗試 JSONP 解析:', jsonError);
    }

    // 備用：嘗試 JSONP 格式解析
    const jsonpPatterns = [
      /SUUMO\.CALLBACK\.FUNCTION\((.*)\)/s,
      /callback\((.*)\)/s,
      /\w*\((.*)\)/s
    ];

    for (let i = 0; i < jsonpPatterns.length; i++) {
      const pattern = jsonpPatterns[i];
      const match = responseText.match(pattern);
      
      if (match) {
        console.log(`🔄 嘗試 JSONP 模式 ${i + 1}...`);
        try {
          const jsonData = JSON.parse(match[1]);
          console.log('✅ JSONP 解析成功');
          return jsonData;
        } catch (parseError) {
          console.warn(`⚠️ JSONP 模式 ${i + 1} 失敗:`, parseError);
        }
      }
    }

    // 顯示除錯資訊
    console.error('🚨 所有解析方式都失敗');
    console.error('📊 回應統計:', {
      長度: responseText.length,
      開頭: responseText.substring(0, 50),
      結尾: responseText.substring(responseText.length - 50),
      包含smatch: responseText.includes('smatch'),
      包含resultset: responseText.includes('resultset')
    });

    throw new Error('無法解析 SUUMO API 回應格式');
  }

  /**
   * 將 SUUMO API 資料轉換為 SuumoProperty 格式
   */
  private convertToSuumoProperties(apiData: any, intersectionArea: IntersectionArea): SuumoProperty[] {
    console.log('🔄 轉換 SUUMO API 資料...');

    if (!apiData.smatch?.resultset?.item) {
      console.warn('⚠️ SUUMO API 回應中沒有找到物件資料');
      return [];
    }

    const properties: SuumoProperty[] = [];
    const items = apiData.smatch.resultset.item;

    console.log(`📊 找到 ${items.length} 個項目，總命中數: ${apiData.smatch.resultset.hits}`);

    for (const item of items) {
      if (!item.bukkenCdList || item.bukkenCdList.length === 0) {
        continue;
      }

      for (const bukkenCd of item.bukkenCdList) {
        if (properties.length >= 20) break; // 限制數量

        const property: SuumoProperty = {
          id: bukkenCd,
          title: `SUUMO 物件 ${bukkenCd}`,
          price: '點擊查看詳細',
          location: `位置: ${item.lt?.toFixed(4)}, ${item.lg?.toFixed(4)}`,
          size: '面積詳情請點擊',
          tags: ['真實物件'],
          coordinates: {
            lat: item.lt || intersectionArea.center.lat,
            lng: item.lg || intersectionArea.center.lng
          },
          url: `https://suumo.jp/chintai/jnc_${bukkenCd}/`
        };

        properties.push(property);
      }
      
      if (properties.length >= 20) break;
    }

    console.log(`✅ 轉換完成，共 ${properties.length} 個物件`);
    return properties;
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
        // Mock 模式下仍顯示會組出的參數 (用於除錯)
        try {
          const tokens = await this.fetchSuumoTokens();
          const suumoParams = this.buildSuumoApiParams(area, tokens);
          console.log('🔗 Mock 模式 - 組出的 SUUMO API URL:', `${tokens.url}?${suumoParams.toString()}`);
        } catch (error) {
          console.warn('⚠️ Mock 模式下無法獲取 Token，跳過參數顯示');
        }
        
        // 使用模擬資料
        properties = await getMockSuumoData({
          center: area.center,
          radius: area.radius
        });
        dataSource = 'mock';
        apiCost = 0;
      } else {
        // 使用模組化的 SUUMO API 工具
        console.log('🚀 使用模組化 SUUMO API...');
        
        const { searchSuumoProperties } = await import('../utils/suumoIntegration');
        const result = await searchSuumoProperties(area.center, area.radius);
        
        if (!result.success) {
          throw new Error(result.error || 'SUUMO 搜尋失敗');
        }
        
        // 轉換格式
        properties = result.properties.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          location: p.location,
          size: p.size,
          tags: p.tags,
          coordinates: p.coordinates,
          url: p.url
        }));
        
        dataSource = 'suumo_api';
        apiCost = result.apiCost;
      }

      // 靜默處理，只在 debug 時顯示

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

// 建立預設實例 (使用真實 SUUMO API)
export const suumoIntegration = new SuumoIntegrationService(false);

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