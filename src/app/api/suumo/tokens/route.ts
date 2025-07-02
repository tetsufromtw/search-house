import { NextResponse } from 'next/server';
import { suumoTokenManager, SuumoService } from '../../../../services/suumo';

export async function GET() {
  try {
    console.log('🔑 API 端點：獲取 SUUMO Token');
    
    const tokens = await suumoTokenManager.getTokens();
    const cacheStatus = suumoTokenManager.getCacheStatus();
    const healthCheck = await SuumoService.healthCheck();
    
    return NextResponse.json({
      success: true,
      tokens: {
        UID: tokens.bkApi.UID,
        STMP: tokens.bkApi.STMP,
        ATT: `${tokens.bkApi.ATT.substring(0, 20)}...` // 僅顯示前20字符，保護完整token
      },
      cache: cacheStatus,
      health: healthCheck,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Token API 端點錯誤:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🔄 API 端點：強制刷新 SUUMO Token');
    
    const tokens = await suumoTokenManager.refreshTokens();
    const healthCheck = await SuumoService.healthCheck();
    
    return NextResponse.json({
      success: true,
      tokens: {
        UID: tokens.bkApi.UID,
        STMP: tokens.bkApi.STMP,
        ATT: `${tokens.bkApi.ATT.substring(0, 20)}...`
      },
      health: healthCheck,
      message: 'Token 已強制刷新',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Token 刷新 API 端點錯誤:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log('🗑️ API 端點：清除 SUUMO Token 快取');
    
    // 清除快取並重新獲取
    const tokens = await suumoTokenManager.refreshTokens();
    
    return NextResponse.json({
      success: true,
      message: 'Token 快取已清除並重新獲取',
      tokens: {
        UID: tokens.bkApi.UID,
        STMP: tokens.bkApi.STMP,
        ATT: `${tokens.bkApi.ATT.substring(0, 20)}...`
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Token 清除 API 端點錯誤:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}