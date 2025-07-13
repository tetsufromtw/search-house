/**
 * 地點搜尋服務 - 整合 Google Places 和 OSM 搜尋
 */

import { ILocationService, Location, LatLng } from '../types';
import { CONFIG } from '../config';

export class LocationService implements ILocationService {
  private cache = new Map<string, { data: Location[]; timestamp: number }>();

  async searchPlaces(query: string, center: LatLng, radius: number): Promise<Location[]> {
    // 輸入驗證
    if (!query || query.length < CONFIG.VALIDATION.MIN_QUERY_LENGTH) {
      throw new Error('搜尋關鍵字過短');
    }

    // 快取檢查
    const cacheKey = `${query}-${center.lat}-${center.lng}-${radius}`;
    if (CONFIG.SEARCH.enableCaching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      // 嘗試 Google Places 搜尋
      const googleResults = await this.searchGooglePlaces(query, center, radius);
      
      // 如果 Google Places 結果不足，補充 OSM 搜尋
      if (googleResults.length < 5) {
        const osmResults = await this.searchOSM(query, center, radius);
        const combinedResults = [...googleResults, ...osmResults];
        const uniqueResults = this.deduplicateLocations(combinedResults);
        
        if (CONFIG.SEARCH.enableCaching) {
          this.setCachedResult(cacheKey, uniqueResults);
        }
        
        return uniqueResults.slice(0, CONFIG.SEARCH.maxResults);
      }

      if (CONFIG.SEARCH.enableCaching) {
        this.setCachedResult(cacheKey, googleResults);
      }
      
      return googleResults;
    } catch (error) {
      console.error('搜尋地點失敗:', error);
      
      // 降級到 OSM 搜尋
      try {
        const osmResults = await this.searchOSM(query, center, radius);
        return osmResults.slice(0, CONFIG.SEARCH.maxResults);
      } catch (osmError) {
        console.error('OSM 搜尋也失敗:', osmError);
        throw new Error('無法搜尋地點，請檢查網路連線');
      }
    }
  }

  private async searchGooglePlaces(query: string, center: LatLng, radius: number): Promise<Location[]> {
    const response = await fetch('/api/google/places/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        center,
        radius,
        maxResults: CONFIG.SEARCH.maxResults,
      }),
      signal: AbortSignal.timeout(CONFIG.API.TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`Google Places API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.transformGooglePlacesData(data);
  }

  private async searchOSM(query: string, center: LatLng, radius: number): Promise<Location[]> {
    const response = await fetch('/api/osm-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        center,
        radius,
        maxResults: CONFIG.SEARCH.maxResults,
      }),
      signal: AbortSignal.timeout(CONFIG.API.TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`OSM API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return this.transformOSMData(data);
  }

  private transformGooglePlacesData(data: any): Location[] {
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((place: any) => ({
      id: place.place_id || `google-${Date.now()}-${Math.random()}`,
      name: place.name || '未知地點',
      address: place.formatted_address || place.vicinity || '',
      coordinates: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0,
      },
      placeId: place.place_id,
      rating: place.rating,
      businessStatus: place.business_status,
    }));
  }

  private transformOSMData(data: any): Location[] {
    if (!data.locations || !Array.isArray(data.locations)) {
      return [];
    }

    return data.locations.map((place: any) => ({
      id: place.place_id || `osm-${Date.now()}-${Math.random()}`,
      name: place.display_name?.split(',')[0] || '未知地點',
      address: place.display_name || '',
      coordinates: {
        lat: parseFloat(place.lat) || 0,
        lng: parseFloat(place.lon) || 0,
      },
      placeId: place.place_id,
    }));
  }

  private deduplicateLocations(locations: Location[]): Location[] {
    const seen = new Set<string>();
    return locations.filter(location => {
      const key = `${location.name}-${location.coordinates.lat.toFixed(4)}-${location.coordinates.lng.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private getCachedResult(key: string): Location[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CONFIG.CACHE.PLACES_CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedResult(key: string, data: Location[]): void {
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
      if (now - cached.timestamp > CONFIG.CACHE.PLACES_CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}