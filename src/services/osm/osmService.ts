/**
 * OpenStreetMap 查詢服務 (零費用替代方案)
 * 使用 Overpass API 查詢店鋪位置資料
 */

interface OSMLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  amenity?: string;
  brand?: string;
  shop?: string;
  leisure?: string;
}

interface OSMQueryResult {
  locations: OSMLocation[];
  source: 'osm';
  query_time: number;
  total_found: number;
}

interface AreaBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class OSMService {
  private readonly overpassUrls = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter'
  ];
  private readonly timeout = 25; // 秒
  private currentUrlIndex = 0;

  /**
   * 查詢指定區域的 Starbucks
   */
  async queryStarbucks(bounds: AreaBounds): Promise<OSMQueryResult> {
    const query = `
      [out:json][timeout:${this.timeout}];
      (
        node["amenity"="cafe"]["brand"="Starbucks"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["amenity"="cafe"]["brand"="Starbucks"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        relation["amenity"="cafe"]["brand"="Starbucks"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out center meta;
    `;

    return await this.executeQuery(query, 'starbucks');
  }

  /**
   * 查詢指定區域的健身房
   */
  async queryGyms(bounds: AreaBounds): Promise<OSMQueryResult> {
    const query = `
      [out:json][timeout:${this.timeout}];
      (
        node["leisure"="fitness_centre"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["leisure"="fitness_centre"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["amenity"="gym"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["amenity"="gym"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["sport"="fitness"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["sport"="fitness"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out center meta;
    `;

    return await this.executeQuery(query, 'gym');
  }

  /**
   * 查詢指定區域的便利商店
   */
  async queryConvenienceStores(bounds: AreaBounds): Promise<OSMQueryResult> {
    const query = `
      [out:json][timeout:${this.timeout}];
      (
        node["shop"="convenience"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["shop"="convenience"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["brand"="7-Eleven"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["brand"="FamilyMart"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["brand"="Lawson"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out center meta;
    `;

    return await this.executeQuery(query, 'convenience');
  }

  /**
   * 根據需求類型查詢
   */
  async queryByRequirement(requirement: string, bounds: AreaBounds): Promise<OSMQueryResult> {
    const normalizedReq = requirement.toLowerCase();

    if (normalizedReq.includes('starbucks') || normalizedReq.includes('スターバックス')) {
      return await this.queryStarbucks(bounds);
    } else if (normalizedReq.includes('gym') || normalizedReq.includes('健身房') || 
               normalizedReq.includes('fitness') || normalizedReq.includes('anytime')) {
      return await this.queryGyms(bounds);
    } else if (normalizedReq.includes('convenience') || normalizedReq.includes('コンビニ') ||
               normalizedReq.includes('便利商店') || normalizedReq.includes('seven') ||
               normalizedReq.includes('family') || normalizedReq.includes('lawson')) {
      return await this.queryConvenienceStores(bounds);
    } else {
      // 通用查詢
      return await this.queryGeneral(requirement, bounds);
    }
  }

  /**
   * 通用查詢 (當不知道具體類型時)
   */
  async queryGeneral(searchTerm: string, bounds: AreaBounds): Promise<OSMQueryResult> {
    const query = `
      [out:json][timeout:${this.timeout}];
      (
        node["name"~"${searchTerm}",i](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["name"~"${searchTerm}",i](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        node["brand"~"${searchTerm}",i](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["brand"~"${searchTerm}",i](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out center meta;
    `;

    return await this.executeQuery(query, 'general');
  }

  /**
   * 執行 Overpass 查詢 (支援多個備用伺服器)
   */
  private async executeQuery(query: string, queryType: string): Promise<OSMQueryResult> {
    const startTime = Date.now();
    
    console.log(`🗺️ 執行 OSM 查詢 (${queryType}):`, query.replace(/\s+/g, ' ').trim());

    // 嘗試所有可用的 Overpass 伺服器
    for (let i = 0; i < this.overpassUrls.length; i++) {
      const urlIndex = (this.currentUrlIndex + i) % this.overpassUrls.length;
      const overpassUrl = this.overpassUrls[urlIndex];
      
      console.log(`🌐 嘗試伺服器 ${urlIndex + 1}/${this.overpassUrls.length}: ${overpassUrl}`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout * 1000);

        const response = await fetch(overpassUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'search-house-app/1.0'
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const queryTime = Date.now() - startTime;

        // 更新成功的伺服器索引
        this.currentUrlIndex = urlIndex;

        console.log(`✅ OSM 查詢完成 (${queryTime}ms):`, {
          類型: queryType,
          伺服器: `#${urlIndex + 1}`,
          找到: data.elements?.length || 0,
          查詢時間: `${queryTime}ms`
        });

        // 轉換為標準格式
        const locations: OSMLocation[] = data.elements?.map((element: any) => ({
          id: `osm_${element.type}_${element.id}`,
          name: element.tags?.name || element.tags?.brand || `${queryType}_${element.id}`,
          lat: element.lat || element.center?.lat || 0,
          lng: element.lon || element.center?.lon || 0,
          address: this.buildAddress(element.tags),
          amenity: element.tags?.amenity,
          brand: element.tags?.brand,
          shop: element.tags?.shop,
          leisure: element.tags?.leisure
        })) || [];

        return {
          locations,
          source: 'osm',
          query_time: queryTime,
          total_found: locations.length
        };

      } catch (error) {
        console.warn(`⚠️ 伺服器 ${urlIndex + 1} 失敗:`, error instanceof Error ? error.message : error);
        
        // 如果是最後一個伺服器，則記錄詳細錯誤
        if (i === this.overpassUrls.length - 1) {
          console.error(`❌ 所有 OSM 伺服器都失敗 (${queryType}):`, error);
        }
      }
    }

    // 所有伺服器都失敗，回傳空結果
    console.warn(`⚠️ OSM 查詢失敗，回傳空結果 (${queryType})`);
    return {
      locations: [],
      source: 'osm',
      query_time: Date.now() - startTime,
      total_found: 0
    };
  }

  /**
   * 從 OSM tags 建構地址
   */
  private buildAddress(tags: any): string {
    if (!tags) return '';

    const addressParts = [];
    
    if (tags['addr:country']) addressParts.push(tags['addr:country']);
    if (tags['addr:state']) addressParts.push(tags['addr:state']);
    if (tags['addr:city']) addressParts.push(tags['addr:city']);
    if (tags['addr:suburb']) addressParts.push(tags['addr:suburb']);
    if (tags['addr:street']) addressParts.push(tags['addr:street']);
    if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);

    return addressParts.length > 0 ? addressParts.join(', ') : '';
  }

  /**
   * 根據中心點和半徑計算查詢邊界
   */
  static calculateBounds(center: { lat: number; lng: number }, radiusMeters: number): AreaBounds {
    // 緯度度數轉換 (約 111,320 米/度)
    const latDegrees = radiusMeters / 111320;
    
    // 經度度數轉換 (考慮緯度影響)
    const lngDegrees = radiusMeters / (111320 * Math.cos(center.lat * Math.PI / 180));

    return {
      north: center.lat + latDegrees,
      south: center.lat - latDegrees,
      east: center.lng + lngDegrees,
      west: center.lng - lngDegrees
    };
  }

  /**
   * 檢查 OSM 服務健康狀態
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testQuery = '[out:json][timeout:5]; node(35.6762,139.6503,35.6763,139.6504); out count;';
      
      const response = await fetch(this.overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(testQuery)}`
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// 建立全域實例
export const osmService = new OSMService();

/**
 * 便利函數：查詢多個需求
 */
export async function queryMultipleRequirements(
  requirements: string[],
  center: { lat: number; lng: number },
  radiusMeters: number = 1000
): Promise<Record<string, OSMQueryResult>> {
  const bounds = OSMService.calculateBounds(center, radiusMeters);
  const results: Record<string, OSMQueryResult> = {};

  console.log(`🔍 OSM 多需求查詢:`, {
    需求: requirements,
    中心: center,
    半徑: `${radiusMeters}m`,
    邊界: bounds
  });

  // 並行查詢所有需求
  const queries = requirements.map(async (requirement) => {
    const result = await osmService.queryByRequirement(requirement, bounds);
    results[requirement] = result;
    return { requirement, result };
  });

  await Promise.all(queries);

  const totalFound = Object.values(results).reduce((sum, r) => sum + r.total_found, 0);
  console.log(`✅ OSM 多需求查詢完成: 總共找到 ${totalFound} 個地點`);

  return results;
}

/**
 * 便利函數：計算交集區域
 */
export function calculateIntersectionBounds(
  requirementResults: Record<string, OSMQueryResult>,
  intersectionRadius: number = 500
): AreaBounds | null {
  const allLocations: OSMLocation[] = [];
  
  // 收集所有地點
  Object.values(requirementResults).forEach(result => {
    allLocations.push(...result.locations);
  });

  if (allLocations.length === 0) {
    return null;
  }

  // 找到可能的交集區域 (簡化版：使用所有地點的邊界)
  const lats = allLocations.map(loc => loc.lat);
  const lngs = allLocations.map(loc => loc.lng);

  const bounds = {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  };

  console.log(`📐 計算交集邊界:`, bounds);
  
  return bounds;
}