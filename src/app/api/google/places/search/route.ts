/**
 * Google Places 搜尋 API 端點
 * 遵循 API Gateway Pattern 和 RESTful 設計原則
 */

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/services/google/GooglePlacesService';
import { NewPlacesService } from '@/services/google/NewPlacesService';
import { PlaceSearchRequest } from '@/services/types';

// API 回應標準格式
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    requestId: string;
    timestamp: number;
    cached: boolean;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 參數驗證
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const type = searchParams.get('type');
    const maxPages = searchParams.get('maxPages');
    const usePaging = searchParams.get('paging') === 'true';

    console.log('🔍 Places API 請求收到:');
    console.log('📍 請求 URL:', request.url);
    console.log('📋 解析參數:', {
      query,
      lat,
      lng,
      radius,
      type,
      maxPages,
      usePaging
    });

    // 基本驗證
    if (!query && (!lat || !lng)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Either query or location (lat, lng) is required'
        }
      }, { status: 400 });
    }

    // 建構搜尋請求
    const searchRequest: PlaceSearchRequest = {
      query: query || undefined,
      location: (lat && lng) ? {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      } : undefined,
      radius: radius ? parseInt(radius) : undefined,
      type: type || undefined
    };

    // 初始化服務
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('🔑 API Key 檢查:', apiKey ? `已設定 (${apiKey.substring(0, 10)}...)` : '未設定');
    
    if (!apiKey) {
      console.error('❌ Google Maps API key not configured');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Search service is temporarily unavailable'
        }
      }, { status: 503 });
    }

    // 嘗試使用新版 Places API
    console.log('🆕 嘗試使用新版 Places API');
    
    try {
      const newPlacesService = new NewPlacesService(apiKey);
      
      const newRequest = {
        textQuery: query || '',
        maxResultCount: 20,
        ...(searchRequest.location && {
          locationBias: {
            circle: {
              center: {
                latitude: searchRequest.location.lat,
                longitude: searchRequest.location.lng
              },
              radius: searchRequest.radius || 5000
            }
          }
        })
      };

      console.log('🔧 新版 API 搜尋請求:', newRequest);

      const newResult = await newPlacesService.searchText(newRequest);
      const adaptedResult = newPlacesService.adaptToLegacyFormat(newResult);

      console.log('📊 新版 API 搜尋結果:', {
        success: true,
        resultCount: adaptedResult.results?.length || 0
      });

      // 成功回應
      const response: ApiResponse<any> = {
        success: true,
        data: {
          places: adaptedResult.results?.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            rating: place.rating,
            types: place.types || []
          })) || [],
          status: 'OK'
        },
        metadata: {
          requestId: `new_api_${Date.now()}`,
          timestamp: Date.now(),
          cached: false
        }
      };

      console.log(`新版 Places API 搜尋完成，耗時 ${Date.now() - startTime}ms`, {
        resultCount: response.data?.places.length || 0
      });

      return NextResponse.json(response);

    } catch (newApiError) {
      console.warn('⚠️ 新版 Places API 失敗，回退到舊版:', newApiError);
      
      // 回退到舊版 API
      const placesService = new GooglePlacesService(apiKey);
      console.log('🔧 搜尋請求建構:', searchRequest);
      console.log('📄 分頁設定:', { usePaging, maxPages: maxPages ? parseInt(maxPages) : 3 });

      // 選擇搜尋方法：並行分頁 或 單頁
      const result = usePaging 
        ? await placesService.searchPlacesWithPaging(searchRequest, maxPages ? parseInt(maxPages) : 3)
        : await placesService.searchPlaces(searchRequest);

      console.log('📊 舊版 API 搜尋結果:', {
        success: !result.error,
        error: result.error?.code,
        resultCount: result.data?.places?.length || 0,
        cached: result.metadata?.cached
      });

      // 處理服務錯誤
      if (result.error) {
        const statusCode = result.error.code === 'QUOTA_EXCEEDED' ? 429 : 500;
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: {
            code: result.error.code,
            message: result.error.message
          }
        }, { status: statusCode });
      }

      // 成功回應
      const response: ApiResponse<typeof result.data> = {
        success: true,
        data: result.data,
        metadata: result.metadata
      };

      console.log(`舊版 Places API 搜尋完成，耗時 ${Date.now() - startTime}ms`, {
        requestId: result.metadata?.requestId,
        cached: result.metadata?.cached,
        resultCount: result.data?.places.length || 0
      });

      return NextResponse.json(response);
    }

  } catch (error) {
    // 記錄錯誤
    console.error('Places search error:', error);

    // 回傳通用錯誤
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // POST 請求的進階搜尋邏輯
    // 支援更複雜的搜尋參數，如 bounding box, multiple types 等
    
    // 基本驗證
    const { query, location, bounds, types, filters } = body;

    if (!query && !location && !bounds) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'At least one search criteria is required'
        }
      }, { status: 400 });
    }

    // TODO: 實作進階搜尋邏輯
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Advanced search not implemented yet'
      }
    }, { status: 501 });

  } catch (error) {
    console.error('Places advanced search error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}