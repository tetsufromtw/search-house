/**
 * SUUMO Token 狀態檢查 API
 * 快速檢查Token管理系統的狀態
 */

import { NextRequest, NextResponse } from 'next/server';
import { suumoTokenManager } from '../../../../services/suumo/tokenManager';
import { suumoApiClient } from '../../../../services/suumo/apiClient';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 檢查 SUUMO Token 狀態...');

    const startTime = Date.now();

    // 1. 檢查快取狀態
    const cacheStatus = suumoTokenManager.getCacheStatus();
    
    // 2. 嘗試獲取Token (如果快取無效會自動刷新)
    let tokenRetrievalTime = 0;
    let tokenSuccess = false;
    let tokenError = null;
    let tokens = null;

    try {
      const tokenStartTime = Date.now();
      tokens = await suumoTokenManager.getTokens();
      tokenRetrievalTime = Date.now() - tokenStartTime;
      tokenSuccess = true;
      
      console.log('✅ Token 獲取成功');
    } catch (error) {
      tokenError = error instanceof Error ? error.message : '未知錯誤';
      console.error('❌ Token 獲取失敗:', tokenError);
    }

    // 3. 檢查API客戶端健康狀態
    const clientHealthy = await suumoApiClient.healthCheck();

    // 4. 簡單的API測試 (可選)
    const searchParams = request.nextUrl.searchParams;
    const skipApiTest = searchParams.get('skipApiTest') === 'true';
    
    let apiTestResult = null;
    
    if (!skipApiTest && tokenSuccess && tokens) {
      console.log('🧪 執行簡單的API測試...');
      
      try {
        const testParams = new URLSearchParams({
          FORMAT: '1',
          CALLBACK: 'SUUMO.CALLBACK.FUNCTION',
          P: '1',
          CNT: '1',
          GAZO: '2',
          PROT: '1',
          SE: '040',
          // 使用東京車站附近的小範圍測試
          KUKEIPT1LT: '35.677',
          KUKEIPT1LG: '139.651',
          KUKEIPT2LT: '35.675',
          KUKEIPT2LG: '139.649',
          LITE_KBN: '1'
        });

        const apiStartTime = Date.now();
        const apiResponse = await suumoApiClient.makeRequest(testParams);
        const apiResponseTime = Date.now() - apiStartTime;

        apiTestResult = {
          success: true,
          responseTime: apiResponseTime,
          hasData: !!apiResponse.data,
          dataCount: Array.isArray(apiResponse.data) ? apiResponse.data.length : 0,
          responseStructure: typeof apiResponse
        };

        console.log('✅ API 測試成功:', apiTestResult);

      } catch (error) {
        apiTestResult = {
          success: false,
          error: error instanceof Error ? error.message : '未知錯誤'
        };
        console.error('❌ API 測試失敗:', apiTestResult.error);
      }
    }

    const totalTime = Date.now() - startTime;

    // 組合回應
    const response = {
      success: tokenSuccess,
      timestamp: new Date().toISOString(),
      total_check_time_ms: totalTime,
      
      // Token 快取狀態
      cache_status: {
        has_cache: cacheStatus.hasCache,
        is_valid: cacheStatus.isValid,
        expires_in_ms: cacheStatus.expiresIn,
        expires_in_minutes: cacheStatus.expiresIn ? Math.round(cacheStatus.expiresIn / (1000 * 60)) : null
      },
      
      // Token 獲取狀態
      token_retrieval: {
        success: tokenSuccess,
        time_ms: tokenRetrievalTime,
        error: tokenError,
        tokens_available: !!tokens
      },
      
      // Token 內容 (隱藏敏感資訊)
      token_info: tokens ? {
        uid: tokens.bkApi.UID,
        stmp: tokens.bkApi.STMP,
        att_length: tokens.bkApi.ATT.length,
        att_preview: tokens.bkApi.ATT.substring(0, 8) + '...'
      } : null,
      
      // API 客戶端狀態
      api_client: {
        healthy: clientHealthy,
        ready_for_requests: tokenSuccess && clientHealthy
      },
      
      // API 測試結果
      api_test: apiTestResult,
      
      // 系統建議
      recommendations: generateRecommendations(cacheStatus, tokenSuccess, clientHealthy, apiTestResult)
    };

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Token 狀態檢查失敗:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Token 狀態檢查失敗',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 生成系統建議
 */
function generateRecommendations(
  cacheStatus: any, 
  tokenSuccess: boolean, 
  clientHealthy: boolean, 
  apiTestResult: any
): string[] {
  const recommendations = [];

  if (!tokenSuccess) {
    recommendations.push('❌ Token 獲取失敗，請檢查網路連接和SUUMO網站狀態');
  }

  if (!clientHealthy) {
    recommendations.push('⚠️ API 客戶端狀態異常，請重新初始化');
  }

  if (cacheStatus.hasCache && !cacheStatus.isValid) {
    recommendations.push('🔄 Token 快取已過期，系統會自動刷新');
  }

  if (!cacheStatus.hasCache) {
    recommendations.push('📝 首次運行，正在建立Token快取');
  }

  if (apiTestResult?.success) {
    recommendations.push('✅ 系統運行正常，可以進行SUUMO搜尋');
  } else if (apiTestResult?.success === false) {
    recommendations.push('❌ API測試失敗，可能需要重新獲取Token');
  }

  if (cacheStatus.expiresIn && cacheStatus.expiresIn < 5 * 60 * 1000) {
    recommendations.push('⏰ Token 將在5分鐘內過期，建議預先刷新');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ 所有系統正常運行');
  }

  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    console.log(`🔧 執行 Token 管理動作: ${action}`);

    let result = {};

    switch (action) {
      case 'refresh':
        console.log('🔄 強制刷新 Token...');
        const newTokens = await suumoTokenManager.refreshTokens();
        result = {
          action: 'refresh',
          success: true,
          tokens: {
            uid: newTokens.bkApi.UID,
            stmp: newTokens.bkApi.STMP,
            att_preview: newTokens.bkApi.ATT.substring(0, 8) + '...'
          }
        };
        break;

      case 'clear_cache':
        console.log('🗑️ 清除 Token 快取...');
        suumoTokenManager.clearCache();
        result = {
          action: 'clear_cache',
          success: true,
          message: 'Token 快取已清除'
        };
        break;

      case 'health_check':
        console.log('🏥 執行健康檢查...');
        const isHealthy = await suumoApiClient.healthCheck();
        result = {
          action: 'health_check',
          success: true,
          healthy: isHealthy
        };
        break;

      default:
        return NextResponse.json({
          error: '未知的動作',
          available_actions: ['refresh', 'clear_cache', 'health_check']
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('❌ Token 管理動作失敗:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Token 管理動作失敗',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}