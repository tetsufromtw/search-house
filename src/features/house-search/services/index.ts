/**
 * House Search Feature - 服務層統一介面
 * 實現依賴注入和服務編排
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

// 基礎服務介面
export interface IHouseSearchService {
  searchLocations(query: string, center: LatLng, radius: number): Promise<Location[]>;
  searchProperties(area: IntersectionArea): Promise<Property[]>;
  calculateIntersections(requirements: SearchRequirement[]): Promise<IntersectionArea[]>;
  searchComplete(requirements: SearchRequirement[]): Promise<SearchResult>;
}

// 服務編排器 - 實現複雜的業務邏輯
export class HouseSearchOrchestrator implements IHouseSearchService {
  constructor(
    private locationService: ILocationService,
    private propertyService: IPropertyService,
    private intersectionService: IIntersectionService
  ) {}

  async searchLocations(query: string, center: LatLng, radius: number): Promise<Location[]> {
    try {
      return await this.locationService.searchPlaces(query, center, radius);
    } catch (error) {
      console.error('搜尋地點失敗:', error);
      throw new Error('無法搜尋地點，請重試');
    }
  }

  async searchProperties(area: IntersectionArea): Promise<Property[]> {
    try {
      return await this.propertyService.searchProperties(area);
    } catch (error) {
      console.error('搜尋房源失敗:', error);
      throw new Error('無法搜尋房源，請重試');
    }
  }

  async calculateIntersections(requirements: SearchRequirement[]): Promise<IntersectionArea[]> {
    try {
      return await this.intersectionService.calculateIntersections(requirements);
    } catch (error) {
      console.error('計算交集失敗:', error);
      throw new Error('無法計算交集區域，請重試');
    }
  }

  async searchComplete(requirements: SearchRequirement[]): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // 1. 計算交集區域
      const intersectionAreas = await this.calculateIntersections(requirements);
      
      // 2. 並行搜尋所有交集區域的房源
      const propertyPromises = intersectionAreas.map(area => 
        this.searchProperties(area)
      );
      
      const propertyResults = await Promise.allSettled(propertyPromises);
      
      // 3. 合併結果並去重
      const allProperties = propertyResults
        .filter((result): result is PromiseFulfilledResult<Property[]> => 
          result.status === 'fulfilled'
        )
        .flatMap(result => result.value);
      
      // 4. 去重處理
      const uniqueProperties = this.deduplicateProperties(allProperties);
      
      // 5. 計算中心點
      const queryCenter = this.calculateQueryCenter(requirements);
      
      return {
        properties: uniqueProperties,
        intersectionAreas,
        metadata: {
          totalFound: uniqueProperties.length,
          searchTime: Date.now() - startTime,
          queryCenter,
          queryRadius: 1000, // 可配置
        },
      };
    } catch (error) {
      console.error('完整搜尋失敗:', error);
      throw new Error('搜尋失敗，請重試');
    }
  }

  private deduplicateProperties(properties: Property[]): Property[] {
    const seen = new Set<string>();
    return properties.filter(property => {
      const key = `${property.title}-${property.location}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculateQueryCenter(requirements: SearchRequirement[]): LatLng {
    const allLocations = requirements.flatMap(req => req.locations);
    
    if (allLocations.length === 0) {
      return { lat: 35.6762, lng: 139.6503 }; // 東京車站
    }
    
    const avgLat = allLocations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / allLocations.length;
    const avgLng = allLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / allLocations.length;
    
    return { lat: avgLat, lng: avgLng };
  }
}

// 服務工廠 - 創建和配置服務實例
export class ServiceFactory {
  private static instance: ServiceFactory;
  private houseSearchService: IHouseSearchService | null = null;

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  async createHouseSearchService(): Promise<IHouseSearchService> {
    if (!this.houseSearchService) {
      // 延遲載入具體服務實現
      const locationService = await this.createLocationService();
      const propertyService = await this.createPropertyService();
      const intersectionService = await this.createIntersectionService();
      
      this.houseSearchService = new HouseSearchOrchestrator(
        locationService,
        propertyService,
        intersectionService
      );
    }
    return this.houseSearchService;
  }

  private async createLocationService(): Promise<ILocationService> {
    // 動態載入避免循環依賴
    const { LocationService } = await import('./LocationService');
    return new LocationService();
  }

  private async createPropertyService(): Promise<IPropertyService> {
    const { PropertyService } = await import('./PropertyService');
    return new PropertyService();
  }

  private async createIntersectionService(): Promise<IIntersectionService> {
    const { IntersectionService } = await import('./IntersectionService');
    return new IntersectionService();
  }
}

// 輸出便捷函數
export const getHouseSearchService = async (): Promise<IHouseSearchService> => {
  return await ServiceFactory.getInstance().createHouseSearchService();
};

// 輸出所有服務介面
export * from './LocationService';
export * from './PropertyService';
export * from './IntersectionService';