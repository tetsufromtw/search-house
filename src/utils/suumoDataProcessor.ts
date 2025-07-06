/**
 * SUUMO 資料處理工具
 * 負責將 API 回應轉換為應用程式需要的格式
 */

import type { SuumoApiResponse } from './suumoApiClient';

export interface ProcessedSuumoProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  size: string;
  tags: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  url: string;
  // 額外的原始資料
  rawData?: {
    bukkenCd: string;
    shubetsu: string;
  };
}

export interface ProcessedSuumoResult {
  properties: ProcessedSuumoProperty[];
  summary: {
    totalHits: number;
    itemCount: number;
    searchCondition: string;
  };
  metadata: {
    queryTime?: number;
    searchArea?: {
      center: { lat: number; lng: number };
      radius: number;
    };
  };
}

class SuumoDataProcessor {
  /**
   * 處理 SUUMO API 回應，轉換為應用程式格式
   */
  processApiResponse(
    apiResponse: SuumoApiResponse,
    searchArea?: { center: { lat: number; lng: number }; radius: number },
    queryTime?: number
  ): ProcessedSuumoResult {
    console.log('🔄 開始處理 SUUMO API 資料...');

    const properties = this.convertToProperties(apiResponse, searchArea);
    
    const result: ProcessedSuumoResult = {
      properties,
      summary: {
        totalHits: apiResponse.smatch.resultset.hits,
        itemCount: apiResponse.smatch.resultset.item?.length || 0,
        searchCondition: apiResponse.smatch.condition || '無搜尋條件'
      },
      metadata: {
        queryTime,
        searchArea
      }
    };

    console.log('✅ SUUMO 資料處理完成:', {
      物件數量: properties.length,
      總命中數: result.summary.totalHits,
      項目數: result.summary.itemCount
    });

    return result;
  }

  /**
   * 將 API 項目轉換為物件格式
   */
  private convertToProperties(
    apiResponse: SuumoApiResponse,
    searchArea?: { center: { lat: number; lng: number }; radius: number }
  ): ProcessedSuumoProperty[] {
    const properties: ProcessedSuumoProperty[] = [];
    const items = apiResponse.smatch.resultset.item || [];

    console.log('🔄 轉換物件格式，項目數:', items.length);

    for (const item of items) {
      // 檢查新格式的項目 (直接物件資料)
      if (item.bukken_cd && item.bukken_nm) {
        const property: ProcessedSuumoProperty = {
          id: item.bukken_cd,
          title: item.bukken_nm || '未知標題',
          price: this.formatPrice(item.kakaku, item.kanrihi),
          location: this.formatDetailedLocation(item.jusho, item.kotsu),
          size: item.menseki || '面積未提供',
          tags: this.generateDetailedPropertyTags(item),
          coordinates: {
            lat: item.lt || searchArea?.center.lat || 35.6762,
            lng: item.lg || searchArea?.center.lng || 139.6503
          },
          url: item.link || this.buildPropertyUrl(item.bukken_cd),
          rawData: {
            bukkenCd: item.bukken_cd,
            shubetsu: item.shubetsu || '040'
          }
        };

        properties.push(property);
        continue;
      }

      // 舊格式的處理邏輯 (bukkenCdList)
      if (!item.bukkenCdList || item.bukkenCdList.length === 0) {
        continue;
      }

      // 為每個 bukkenCd 建立一個物件
      for (let i = 0; i < item.bukkenCdList.length; i++) {
        const bukkenCd = item.bukkenCdList[i];
        const shubetsu = item.shubetsuList?.[i] || '040';

        if (properties.length >= 20) break; // 限制數量

        const property: ProcessedSuumoProperty = {
          id: bukkenCd,
          title: this.generatePropertyTitle(bukkenCd),
          price: '點擊查看詳細價格',
          location: this.formatLocation(item.lt, item.lg),
          size: '面積詳情請點擊',
          tags: this.generatePropertyTags(shubetsu),
          coordinates: {
            lat: item.lt || searchArea?.center.lat || 35.6762,
            lng: item.lg || searchArea?.center.lng || 139.6503
          },
          url: this.buildPropertyUrl(bukkenCd),
          rawData: {
            bukkenCd,
            shubetsu
          }
        };

        properties.push(property);
      }

      if (properties.length >= 20) break;
    }

    console.log('✅ 物件轉換完成，生成物件數:', properties.length);
    return properties;
  }

  /**
   * 生成物件標題
   */
  private generatePropertyTitle(bukkenCd: string): string {
    // 可以根據 bukkenCd 的模式生成更有意義的標題
    const suffix = bukkenCd.slice(-2);
    const titles = [
      '賃貸物件',
      'マンション',
      'アパート',
      '賃貸住宅',
      '住宅物件'
    ];
    
    const index = parseInt(suffix, 10) % titles.length;
    return `${titles[index]} ${bukkenCd}`;
  }

  /**
   * 格式化位置資訊
   */
  private formatLocation(lat?: number, lng?: number): string {
    if (!lat || !lng) {
      return '位置資訊請點擊查看';
    }

    return `位置: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  /**
   * 格式化詳細位置資訊 (新格式)
   */
  private formatDetailedLocation(jusho?: string, kotsu?: string): string {
    let location = '';
    
    if (jusho) {
      location += jusho;
    }
    
    if (kotsu) {
      location += location ? ` | ${kotsu}` : kotsu;
    }
    
    return location || '位置資訊請點擊查看';
  }

  /**
   * 格式化價格資訊
   */
  private formatPrice(kakaku?: string, kanrihi?: string): string {
    let price = '';
    
    if (kakaku && kakaku !== '-') {
      price = kakaku;
    }
    
    if (kanrihi && kanrihi !== '-') {
      price += price ? ` (管理費: ${kanrihi})` : `管理費: ${kanrihi}`;
    }
    
    return price || '價格請點擊查看';
  }

  /**
   * 根據物件類型生成標籤
   */
  private generatePropertyTags(shubetsu: string): string[] {
    const baseTags = ['SUUMO 物件', '真實物件'];
    
    // 根據 shubetsu 添加特定標籤
    switch (shubetsu) {
      case '040':
        baseTags.push('賃貸');
        break;
      case '010':
        baseTags.push('新築分譲');
        break;
      case '020':
        baseTags.push('中古分譲');
        break;
      default:
        baseTags.push('其他類型');
    }

    return baseTags;
  }

  /**
   * 生成詳細標籤 (新格式)
   */
  private generateDetailedPropertyTags(item: any): string[] {
    const tags = ['SUUMO 物件'];
    
    // 物件類型
    if (item.category) {
      tags.push(item.category);
    }
    
    // 房間格局
    if (item.madori) {
      tags.push(item.madori);
    }
    
    // 樓層資訊
    if (item.kaiso_disp) {
      tags.push(item.kaiso_disp);
    }
    
    // 建築年數
    if (item.chikugonensu) {
      tags.push(`築${item.chikugonensu}年`);
    }
    
    // 新物件標記
    if (item.new_update_icon === 1) {
      tags.push('🆕 新物件');
    }
    
    return tags.slice(0, 4); // 限制標籤數量
  }

  /**
   * 建立物件詳細頁面 URL
   */
  private buildPropertyUrl(bukkenCd: string): string {
    return `https://suumo.jp/chintai/jnc_${bukkenCd}/`;
  }

  /**
   * 過濾物件 (可用於自訂篩選條件)
   */
  filterProperties(
    properties: ProcessedSuumoProperty[],
    filters?: {
      maxDistance?: number; // 從中心點的最大距離 (公尺)
      centerPoint?: { lat: number; lng: number };
      excludeKeywords?: string[];
      includeKeywords?: string[];
    }
  ): ProcessedSuumoProperty[] {
    if (!filters) return properties;

    return properties.filter(property => {
      // 距離篩選
      if (filters.maxDistance && filters.centerPoint) {
        const distance = this.calculateDistance(
          filters.centerPoint,
          property.coordinates
        );
        if (distance > filters.maxDistance) return false;
      }

      // 關鍵字排除
      if (filters.excludeKeywords) {
        const text = `${property.title} ${property.location}`.toLowerCase();
        if (filters.excludeKeywords.some(keyword => 
          text.includes(keyword.toLowerCase())
        )) {
          return false;
        }
      }

      // 關鍵字包含
      if (filters.includeKeywords) {
        const text = `${property.title} ${property.location}`.toLowerCase();
        if (!filters.includeKeywords.some(keyword => 
          text.includes(keyword.toLowerCase())
        )) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 計算兩點間距離 (公尺)
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371000; // 地球半徑 (公尺)
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * 統計分析
   */
  analyzeProperties(properties: ProcessedSuumoProperty[]) {
    const analysis = {
      totalCount: properties.length,
      uniqueLocations: new Set(properties.map(p => 
        `${p.coordinates.lat.toFixed(3)},${p.coordinates.lng.toFixed(3)}`
      )).size,
      propertyTypes: {} as Record<string, number>,
      coordinateBounds: this.calculateBounds(properties)
    };

    // 統計物件類型
    properties.forEach(property => {
      property.tags.forEach(tag => {
        analysis.propertyTypes[tag] = (analysis.propertyTypes[tag] || 0) + 1;
      });
    });

    return analysis;
  }

  /**
   * 計算物件座標邊界
   */
  private calculateBounds(properties: ProcessedSuumoProperty[]) {
    if (properties.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 };
    }

    const lats = properties.map(p => p.coordinates.lat);
    const lngs = properties.map(p => p.coordinates.lng);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }
}

// 導出單例實例
export const suumoDataProcessor = new SuumoDataProcessor();