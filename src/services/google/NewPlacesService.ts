/**
 * 新版 Google Places API 服務
 * 使用 Places API (New) - https://places.googleapis.com/v1/
 */

export interface NewPlacesSearchRequest {
  textQuery: string;
  maxResultCount?: number;
  locationBias?: {
    circle: {
      center: {
        latitude: number;
        longitude: number;
      };
      radius: number;
    };
  };
}

export interface NewPlacesResult {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  formattedAddress?: string;
}

export interface NewPlacesResponse {
  places: NewPlacesResult[];
}

export class NewPlacesService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://places.googleapis.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchText(request: NewPlacesSearchRequest): Promise<NewPlacesResponse> {
    const url = `${this.baseUrl}/places:searchText`;
    
    const body = {
      textQuery: request.textQuery,
      maxResultCount: request.maxResultCount || 20,
      ...(request.locationBias && { locationBias: request.locationBias })
    };

    console.log('🆕 新版 Places API 請求:', {
      url,
      body,
      apiKey: this.apiKey.substring(0, 10) + '...'
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.rating,places.formattedAddress'
        },
        body: JSON.stringify(body)
      });

      console.log('📡 新版 Places API 回應狀態:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 新版 Places API 錯誤:', errorText);
        throw new Error(`Places API 錯誤: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📄 新版 Places API 回應:', {
        places_count: result.places?.length || 0,
        first_place: result.places?.[0]?.displayName?.text
      });

      return result;

    } catch (error) {
      console.error('❌ 新版 Places API 請求失敗:', error);
      throw error;
    }
  }

  // 將新版 API 結果轉換為舊版格式 (兼容性)
  adaptToLegacyFormat(newResult: NewPlacesResponse): any {
    console.log('🔄 轉換新版 API 格式到舊版格式:', {
      原始地點數: newResult.places?.length || 0,
      第一個地點: newResult.places?.[0]
    });

    const results = newResult.places?.map((place, index) => {
      console.log(`📍 轉換第 ${index + 1} 個地點:`, {
        id: place.id,
        name: place.displayName?.text,
        location: place.location,
        address: place.formattedAddress
      });

      const converted = {
        place_id: place.id,
        name: place.displayName?.text || '',
        formatted_address: place.formattedAddress || '',
        geometry: {
          location: {
            lat: place.location?.latitude || 0,
            lng: place.location?.longitude || 0
          }
        },
        rating: place.rating,
        types: ['establishment'] // 預設類型
      };

      console.log(`✅ 轉換結果:`, converted);
      return converted;
    }) || [];

    const adaptedResult = {
      status: 'OK',
      results: results
    };

    console.log('🎯 最終轉換結果:', {
      status: adaptedResult.status,
      結果數量: adaptedResult.results.length
    });

    return adaptedResult;
  }
}