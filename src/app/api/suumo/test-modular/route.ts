/**
 * 模組化 SUUMO API 測試端點
 * 展示新的模組化工具使用方式
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchSuumoProperties } from '../../../../utils/suumoIntegration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      center = { lat: 35.6762, lng: 139.6503 },
      radius = 500,
      filters
    } = body;

    console.log('🧪 測試模組化 SUUMO API:', {
      center,
      radius: `${radius}m`,
      filters
    });

    const startTime = Date.now();
    
    // 使用模組化工具搜尋
    const result = await searchSuumoProperties(center, radius, filters);
    
    const queryTime = Date.now() - startTime;

    // 格式化回應
    const response = {
      success: result.success,
      data: {
        properties: result.properties,
        summary: result.summary,
        metadata: {
          ...result.metadata,
          queryTime
        },
        timing: result.timing,
        cost: result.apiCost
      },
      error: result.error
    };

    console.log('✅ 模組化 SUUMO API 測試完成:', {
      成功: result.success,
      物件數: result.properties.length,
      總命中數: result.summary.totalHits,
      耗時: `${queryTime}ms`,
      費用: `$${result.apiCost.toFixed(4)}`
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 模組化 SUUMO API 測試失敗:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // 支援 GET 請求
  const lat = parseFloat(searchParams.get('lat') || '35.6762');
  const lng = parseFloat(searchParams.get('lng') || '139.6503');
  const radius = parseInt(searchParams.get('radius') || '500');

  return await POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({
      center: { lat, lng },
      radius
    })
  }));
}