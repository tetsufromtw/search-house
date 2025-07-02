import { NextRequest, NextResponse } from 'next/server';
import { suumoApiClient } from '../../../services/suumo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  console.log('🏠 使用新的 SUUMO API 客戶端處理請求');

  try {
    // 建構參數（移除認證參數，由 apiClient 自動處理）
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (!['UID', 'STMP', 'ATT'].includes(key)) {
        params.append(key, value);
      }
    });

    console.log('📋 SUUMO API 請求參數:', {
      參數數量: params.size,
      主要參數: Array.from(params.entries()).slice(0, 5)
    });

    // 使用新的 API 客戶端（自動處理 Token 管理）
    const response = await suumoApiClient.makeRequest(params);
    
    console.log('✅ SUUMO API 回應成功');
    
    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ SUUMO API 請求失敗:', error);
    
    // 提供更詳細的錯誤資訊
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      error: 'SUUMO API 請求失敗',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      suggestion: '請檢查 SUUMO Token 狀態或聯繫管理員'
    }, { status: 500 });
  }
}