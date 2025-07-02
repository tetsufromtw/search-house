import { NextResponse } from 'next/server';
import { suumoApiClient } from '../../../../services/suumo';

export async function GET() {
  console.log('🧪 快速 SUUMO API 測試開始');

  try {
    // 使用最簡單的參數進行測試
    const testParams = new URLSearchParams({
      'P': '1',
      'CNT': '3',
      'SE': '040',
      'GAZO': '2',
      'PROT': '1',
      'LITE_KBN': '1',
      // 東京台東區小範圍測試
      'KUKEIPT1LT': '35.720',
      'KUKEIPT1LG': '139.780', 
      'KUKEIPT2LT': '35.710',
      'KUKEIPT2LG': '139.770'
    });

    console.log('📋 測試參數:', Object.fromEntries(testParams.entries()));

    const startTime = Date.now();
    const response = await suumoApiClient.makeRequest(testParams);
    const endTime = Date.now();

    console.log('✅ SUUMO API 快速測試成功!', {
      響應時間: `${endTime - startTime}ms`,
      資料類型: typeof response,
      有smatch: !!response.smatch,
      有resultset: !!response.smatch?.resultset,
      物件數量: response.smatch?.resultset?.hits || 0
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: `${endTime - startTime}ms`,
      summary: {
        hasData: !!response.smatch,
        itemCount: response.smatch?.resultset?.hits || 0,
        hasItems: !!(response.smatch?.resultset?.item && response.smatch.resultset.item.length > 0)
      },
      sample: response.smatch?.resultset?.item?.[0] || null,
      rawResponse: response
    });

  } catch (error) {
    console.error('❌ SUUMO API 快速測試失敗:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}