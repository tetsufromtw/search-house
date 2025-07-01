/**
 * Google Places 搜尋 API 端點
 * 遵循 API Gateway Pattern 和 RESTful 設計原則
 */

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/services/google/GooglePlacesService';
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
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Search service is temporarily unavailable'
        }
      }, { status: 503 });
    }

    const placesService = new GooglePlacesService(apiKey);

    // 執行搜尋
    const result = await placesService.searchPlaces(searchRequest);

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

    // 記錄成功的API呼叫
    console.log(`Places search completed in ${Date.now() - startTime}ms`, {
      requestId: result.metadata?.requestId,
      cached: result.metadata?.cached,
      resultCount: result.data?.places.length || 0
    });

    return NextResponse.json(response);

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