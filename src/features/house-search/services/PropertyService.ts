/**
 * 房源搜尋服務 - 整合 SUUMO API
 */

import { IPropertyService, Property, IntersectionArea } from '../types';
import { CONFIG } from '../config';

export class PropertyService implements IPropertyService {
  private cache = new Map<string, { data: Property[]; timestamp: number }>();

  async searchProperties(area: IntersectionArea): Promise<Property[]> {
    // 快取檢查
    const cacheKey = `${area.center.lat}-${area.center.lng}-${area.radius}`;
    if (CONFIG.SEARCH.enableCaching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      const properties = await this.searchSuumoProperties(area);
      
      if (CONFIG.SEARCH.enableCaching) {
        this.setCachedResult(cacheKey, properties);
      }
      
      return properties;
    } catch (error) {
      console.error('搜尋房源失敗:', error);
      throw new Error('無法搜尋房源，請重試');
    }
  }

  private async searchSuumoProperties(area: IntersectionArea): Promise<Property[]> {
    const response = await fetch('/api/suumo/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        center: area.center,
        radius: area.radius,
        maxResults: CONFIG.SEARCH.maxResults,
        minScore: CONFIG.SEARCH.minIntersectionScore,
      }),
      signal: AbortSignal.timeout(CONFIG.API.TIMEOUT),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('請求過於頻繁，請稍後再試');
      }
      throw new Error(`SUUMO API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.transformSuumoData(data);
  }

  private transformSuumoData(data: any): Property[] {
    if (!data.properties || !Array.isArray(data.properties)) {
      return [];
    }

    return data.properties.map((property: any) => ({
      id: property.id || `suumo-${Date.now()}-${Math.random()}`,
      title: property.title || '未知物件',
      price: this.formatPrice(property.price),
      location: property.location || property.address || '',
      coordinates: property.coordinates ? {
        lat: parseFloat(property.coordinates.lat),
        lng: parseFloat(property.coordinates.lng),
      } : undefined,
      size: property.size || property.area,
      layout: property.layout || property.rooms,
      url: property.url,
      images: property.images || [],
      tags: this.extractTags(property),
      distance: property.distance,
      rating: property.rating,
    }));
  }

  private formatPrice(price: any): string {
    if (!price) return '價格未公開';
    
    if (typeof price === 'string') {
      // 如果已經是格式化的字串，直接返回
      if (price.includes('萬') || price.includes('円')) {
        return price;
      }
      
      // 嘗試解析數字
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return this.formatPriceNumber(numPrice);
      }
      
      return price;
    }
    
    if (typeof price === 'number') {
      return this.formatPriceNumber(price);
    }
    
    return '價格未公開';
  }

  private formatPriceNumber(price: number): string {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1)}萬円`;
    }
    return `${price.toLocaleString()}円`;
  }

  private extractTags(property: any): string[] {
    const tags: string[] = [];
    
    // 從不同欄位提取標籤
    if (property.features && Array.isArray(property.features)) {
      tags.push(...property.features);
    }
    
    if (property.amenities && Array.isArray(property.amenities)) {
      tags.push(...property.amenities);
    }
    
    if (property.tags && Array.isArray(property.tags)) {
      tags.push(...property.tags);
    }
    
    // 根據價格範圍添加標籤
    const priceNum = typeof property.price === 'number' ? property.price : parseFloat(property.price);
    if (!isNaN(priceNum)) {
      if (priceNum < 50000) {
        tags.push('低價位');
      } else if (priceNum > 100000) {
        tags.push('高價位');
      }
    }
    
    // 根據大小添加標籤
    if (property.size) {
      const sizeNum = parseFloat(property.size);
      if (!isNaN(sizeNum)) {
        if (sizeNum < 20) {
          tags.push('小坪數');
        } else if (sizeNum > 50) {
          tags.push('大坪數');
        }
      }
    }
    
    return [...new Set(tags)]; // 去重
  }

  private getCachedResult(key: string): Property[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CONFIG.CACHE.PROPERTIES_CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedResult(key: string, data: Property[]): void {
    // 限制快取大小
    if (this.cache.size >= CONFIG.CACHE.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // 清理過期快取
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > CONFIG.CACHE.PROPERTIES_CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  // 根據多個條件搜尋房源
  public async searchPropertiesWithFilters(
    area: IntersectionArea,
    filters: {
      minPrice?: number;
      maxPrice?: number;
      minSize?: number;
      maxSize?: number;
      layout?: string;
      tags?: string[];
    }
  ): Promise<Property[]> {
    const allProperties = await this.searchProperties(area);
    
    return allProperties.filter(property => {
      // 價格篩選
      if (filters.minPrice || filters.maxPrice) {
        const priceNum = parseFloat(property.price.replace(/[^\d.]/g, ''));
        if (filters.minPrice && priceNum < filters.minPrice) return false;
        if (filters.maxPrice && priceNum > filters.maxPrice) return false;
      }
      
      // 大小篩選
      if (filters.minSize || filters.maxSize) {
        const sizeNum = property.size ? parseFloat(property.size.replace(/[^\d.]/g, '')) : 0;
        if (filters.minSize && sizeNum < filters.minSize) return false;
        if (filters.maxSize && sizeNum > filters.maxSize) return false;
      }
      
      // 格局篩選
      if (filters.layout && property.layout !== filters.layout) return false;
      
      // 標籤篩選
      if (filters.tags && filters.tags.length > 0) {
        const hasRequiredTags = filters.tags.some(tag => 
          property.tags?.includes(tag)
        );
        if (!hasRequiredTags) return false;
      }
      
      return true;
    });
  }
}