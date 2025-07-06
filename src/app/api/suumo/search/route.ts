/**
 * SUUMO 搜尋 API 代理
 * 解決客戶端 CORS 問題
 */

import { NextRequest, NextResponse } from 'next/server';
import { suumoApiClient } from '../../../../utils/suumoApiClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      center = { lat: 35.6762, lng: 139.6503 },
      radius = 500
    } = body;

    console.log('🔍 API 路由：SUUMO 搜尋請求', {
      center,
      radius: `${radius}m`
    });

    // 使用伺服器端 API 客戶端
    const result = await suumoApiClient.callApi({
      center,
      radius
    });

    console.log('✅ SUUMO 搜尋成功:', {
      總命中數: result.smatch.resultset.hits,
      項目數: result.smatch.resultset.item?.length || 0
    });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ SUUMO 搜尋 API 失敗:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      timestamp: Date.now()
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