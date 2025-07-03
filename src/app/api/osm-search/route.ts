/**
 * OSM + SUUMO 整合搜尋 API
 * 零成本的店鋪查詢 + 租屋搜尋
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchPropertiesWithRequirements } from '../../../services/suumoIntegration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🌍 OSM 搜尋 API 請求:', body);

    // 驗證請求參數
    const {
      requirements = [],
      center = { lat: 35.6762, lng: 139.6503 }, // 預設東京車站
      searchRadius = 1000,
      intersectionRadius = 500
    } = body;

    if (!Array.isArray(requirements) || requirements.length === 0) {
      return NextResponse.json({
        error: '需求陣列不能為空',
        example: {
          requirements: ['starbucks', 'gym', 'convenience'],
          center: { lat: 35.6762, lng: 139.6503 },
          searchRadius: 1000,
          intersectionRadius: 500
        }
      }, { status: 400 });
    }

    if (!center.lat || !center.lng) {
      return NextResponse.json({
        error: '需要提供中心座標',
        received: center
      }, { status: 400 });
    }

    // 執行搜尋
    console.log(`🔍 開始搜尋:`, {
      需求: requirements,
      中心: center,
      搜尋半徑: `${searchRadius}m`,
      交集半徑: `${intersectionRadius}m`
    });

    const startTime = Date.now();
    
    const result = await searchPropertiesWithRequirements(
      requirements,
      center,
      searchRadius,
      intersectionRadius
    );

    const queryTime = Date.now() - startTime;

    console.log(`✅ OSM 搜尋完成 (${queryTime}ms):`, {
      店鋪數: Object.values(result.store_results.results).reduce(
        (sum: number, r: any) => sum + r.locations.length, 0
      ),
      交集區域: result.intersection_areas.length,
      租屋物件: result.property_results.reduce((sum, r) => sum + r.total_found, 0),
      總費用: `$${result.total_api_cost.toFixed(4)}`
    });

    // 格式化回應
    const response = {
      success: true,
      data: {
        // 店鋪查詢結果
        stores: result.store_results.results,
        
        // 交集區域
        intersection_areas: result.intersection_areas.map(area => ({
          center: area.center,
          radius: area.radius,
          requirements: area.requirements,
          bounds: area.bounds
        })),
        
        // 租屋物件
        properties: result.property_results.map(pr => ({
          area_center: pr.search_area.center,
          properties: pr.properties,
          data_source: pr.data_source,
          count: pr.total_found
        })),
        
        // 統計資訊
        metadata: {
          query_time_ms: queryTime,
          total_api_cost: result.total_api_cost,
          stores_found: Object.values(result.store_results.results).reduce(
            (sum: number, r: any) => sum + r.locations.length, 0
          ),
          intersection_areas_found: result.intersection_areas.length,
          properties_found: result.property_results.reduce((sum, r) => sum + r.total_found, 0),
          summary: result.summary,
          cost_breakdown: {
            osm_queries: 0, // OSM 永遠免費
            suumo_queries: result.property_results.reduce((sum, r) => sum + r.api_cost, 0),
            google_queries: result.store_results.total_cost
          }
        }
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ OSM 搜尋 API 錯誤:', error);
    
    return NextResponse.json({
      error: 'OSM 搜尋失敗',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // 支援 GET 請求 (簡化版)
  const requirements = searchParams.get('requirements')?.split(',') || ['starbucks'];
  const lat = parseFloat(searchParams.get('lat') || '35.6762');
  const lng = parseFloat(searchParams.get('lng') || '139.6503');
  const radius = parseInt(searchParams.get('radius') || '1000');

  return await POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({
      requirements,
      center: { lat, lng },
      searchRadius: radius,
      intersectionRadius: 500
    })
  }));
}

// 預設 OPTIONS 處理 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}