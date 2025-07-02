import { NextResponse } from 'next/server';
import { suumoTokenManager, suumoApiClient, SuumoService } from '../../../../services/suumo';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: {} as any
  };

  console.log('🔍 開始 SUUMO 系統診斷');

  try {
    // 測試 1: Token Manager 健康檢查
    console.log('📋 測試 1: Token Manager 健康檢查');
    try {
      const cacheStatus = suumoTokenManager.getCacheStatus();
      diagnostics.tests.tokenManager = {
        status: 'pass',
        cache: cacheStatus
      };
    } catch (error) {
      diagnostics.tests.tokenManager = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 測試 2: Token 獲取測試
    console.log('🔑 測試 2: Token 獲取測試');
    try {
      const tokens = await suumoTokenManager.getTokens();
      diagnostics.tests.tokenRetrieval = {
        status: 'pass',
        hasUID: !!tokens.bkApi.UID,
        hasSTMP: !!tokens.bkApi.STMP,
        hasATT: !!tokens.bkApi.ATT,
        uidLength: tokens.bkApi.UID?.length || 0,
        attLength: tokens.bkApi.ATT?.length || 0
      };
    } catch (error) {
      diagnostics.tests.tokenRetrieval = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 測試 3: API 客戶端健康檢查
    console.log('🌐 測試 3: API 客戶端健康檢查');
    try {
      const clientHealth = await suumoApiClient.healthCheck();
      diagnostics.tests.apiClient = {
        status: clientHealth ? 'pass' : 'fail',
        healthy: clientHealth
      };
    } catch (error) {
      diagnostics.tests.apiClient = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 測試 4: 完整服務健康檢查
    console.log('🚀 測試 4: 完整服務健康檢查');
    try {
      const serviceHealth = await SuumoService.healthCheck();
      diagnostics.tests.serviceHealth = {
        status: 'pass',
        health: serviceHealth
      };
    } catch (error) {
      diagnostics.tests.serviceHealth = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 測試 5: 輕量級 API 請求測試
    console.log('📡 測試 5: 輕量級 API 請求測試');
    try {
      const testParams = new URLSearchParams({
        'P': '1',
        'CNT': '5', // 只取5筆資料
        'GAZO': '2',
        'PROT': '1',
        'SE': '040',
        'KUKEIPT1LT': '35.70',
        'KUKEIPT1LG': '139.77',
        'KUKEIPT2LT': '35.69',
        'KUKEIPT2LG': '139.74',
        'LITE_KBN': '1'
      });

      const response = await suumoApiClient.makeRequest(testParams);
      diagnostics.tests.apiRequest = {
        status: 'pass',
        hasData: !!response.data,
        dataType: typeof response.data,
        responseKeys: Object.keys(response)
      };
    } catch (error) {
      diagnostics.tests.apiRequest = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 統計結果
    const testResults = Object.values(diagnostics.tests);
    const passCount = testResults.filter((test: any) => test.status === 'pass').length;
    const totalCount = testResults.length;

    diagnostics.summary = {
      總測試數: totalCount,
      通過數: passCount,
      失敗數: totalCount - passCount,
      成功率: `${Math.round((passCount / totalCount) * 100)}%`,
      整體狀態: passCount === totalCount ? '正常' : '部分異常'
    };

    console.log('✅ SUUMO 系統診斷完成:', diagnostics.summary);

    return NextResponse.json({
      success: true,
      ...diagnostics
    });

  } catch (error) {
    console.error('❌ SUUMO 系統診斷失敗:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}