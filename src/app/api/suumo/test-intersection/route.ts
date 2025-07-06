/**
 * SUUMO 交集座標測試 API
 * 專門測試從交集區域產生SUUMO API呼叫
 */

import { NextRequest, NextResponse } from 'next/server';
import { suumoApiClient } from '../../../../services/suumo/apiClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🧪 SUUMO 交集測試 API 請求:', body);

    // 解析輸入參數
    const {
      intersectionArea,
      testMode = 'real' // 'real' 或 'mock'
    } = body;

    if (!intersectionArea || !intersectionArea.bounds) {
      return NextResponse.json({
        error: '需要提供交集區域邊界',
        example: {
          intersectionArea: {
            center: { lat: 35.6762, lng: 139.6503 },
            bounds: {
              north: 35.681,
              south: 35.671,
              east: 139.655,
              west: 139.645
            },
            radius: 500,
            requirements: ['starbucks', 'gym']
          },
          testMode: 'real'
        }
      }, { status: 400 });
    }

    const { bounds } = intersectionArea;

    // 建構 SUUMO API 參數
    const suumoParams = new URLSearchParams({
      // 認證參數會由 apiClient 自動添加
      FORMAT: '1',
      CALLBACK: 'SUUMO.CALLBACK.FUNCTION',
      
      // 搜尋範圍 - 使用交集區域的邊界
      KUKEIPT1LT: bounds.north.toFixed(8),    // 北緯度
      KUKEIPT1LG: bounds.east.toFixed(8),     // 東經度  
      KUKEIPT2LT: bounds.south.toFixed(8),    // 南緯度
      KUKEIPT2LG: bounds.west.toFixed(8),     // 西經度
      
      // 基本搜尋參數
      P: '1',           // 頁碼
      CNT: '50',        // 每頁結果數
      GAZO: '2',        // 圖片
      PROT: '1',        // 協議
      SE: '040',        // 搜尋類型 (賃貸)
      LITE_KBN: '1'     // 輕量版
    });

    console.log('📊 SUUMO API 參數:', {
      交集中心: intersectionArea.center,
      搜尋邊界: bounds,
      需求類型: intersectionArea.requirements,
      參數數量: suumoParams.size
    });

    let apiResponse;
    let responseTime;
    let success = false;

    if (testMode === 'mock') {
      // 模擬模式 - 回傳模擬資料
      console.log('🎭 使用模擬模式');
      
      const mockData = {
        smatch: {
          bukken: Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
          id: `mock_${i + 1}`,
          title: `模擬物件 ${i + 1}`,
          price: `${(Math.random() * 50 + 50).toFixed(0)}000`,
          address: `東京都某某區某某町${i + 1}-${i + 2}`,
          access: '某某線 某某駅 徒歩5分',
          age: `築${Math.floor(Math.random() * 30)}年`,
          layout: ['1K', '1DK', '1LDK', '2K'][Math.floor(Math.random() * 4)]
        }))
        }
      };
      
      apiResponse = mockData;
      responseTime = Math.floor(Math.random() * 100) + 50;
      success = true;
      
    } else {
      // 真實 API 模式
      console.log('🌐 呼叫真實 SUUMO API');
      
      const startTime = Date.now();
      
      try {
        apiResponse = await suumoApiClient.makeRequest(suumoParams);
        responseTime = Date.now() - startTime;
        success = true;
        
        console.log('✅ SUUMO API 呼叫成功:', {
          回應時間: `${responseTime}ms`,
          資料存在: !!apiResponse.data,
          資料數量: apiResponse.data?.length || 0
        });
        
      } catch (error) {
        console.error('❌ SUUMO API 呼叫失敗:', error);
        
        // 回退到模擬資料
        apiResponse = {
          error: error instanceof Error ? error.message : '未知錯誤',
          fallback_to_mock: true
        };
        responseTime = Date.now() - startTime;
        success = false;
      }
    }

    // 分析回應資料
    const analysis = analyzePropertyData(apiResponse, intersectionArea);

    const response = {
      success,
      data: {
        // 測試資訊
        test_info: {
          mode: testMode,
          intersection_area: intersectionArea,
          response_time_ms: responseTime,
          timestamp: new Date().toISOString()
        },
        
        // SUUMO API 參數
        suumo_params: Object.fromEntries(suumoParams.entries()),
        
        // API 回應
        api_response: apiResponse,
        
        // 資料分析
        analysis,
        
        // 座標轉換驗證
        coordinate_validation: validateCoordinateConversion(intersectionArea, suumoParams)
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ SUUMO 交集測試 API 錯誤:', error);
    
    return NextResponse.json({
      error: 'SUUMO 交集測試失敗',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 分析物件資料
 */
function analyzePropertyData(apiResponse: any, intersectionArea: any) {
  const analysis = {
    total_properties: 0,
    has_data: false,
    data_structure: 'unknown',
    sample_property: null,
    coordinate_match: false,
    search_area_km2: 0
  };

  try {
    // 計算搜尋面積
    const { bounds } = intersectionArea;
    const latRange = bounds.north - bounds.south;
    const lngRange = bounds.east - bounds.west;
    analysis.search_area_km2 = Number((latRange * lngRange * 111.32 * 111.32).toFixed(3));

    if (apiResponse && typeof apiResponse === 'object') {
      analysis.has_data = true;

      // 檢查不同的資料結構
      if (apiResponse.smatch?.bukken) {
        analysis.data_structure = 'suumo_standard';
        analysis.total_properties = apiResponse.smatch.bukken.length;
        analysis.sample_property = apiResponse.smatch.bukken[0];
      } else if (Array.isArray(apiResponse.data)) {
        analysis.data_structure = 'array_format';
        analysis.total_properties = apiResponse.data.length;
        analysis.sample_property = apiResponse.data[0];
      } else if (apiResponse.data) {
        analysis.data_structure = 'data_wrapper';
        analysis.total_properties = Array.isArray(apiResponse.data) ? apiResponse.data.length : 1;
      }

      // 簡單的座標匹配檢查
      if (analysis.total_properties > 0) {
        analysis.coordinate_match = true; // 假設有資料就是匹配的
      }
    }
  } catch (error) {
    console.warn('資料分析時發生錯誤:', error);
  }

  return analysis;
}

/**
 * 驗證座標轉換
 */
function validateCoordinateConversion(intersectionArea: any, suumoParams: URLSearchParams) {
  const validation = {
    input_center: intersectionArea.center,
    input_radius: intersectionArea.radius,
    generated_bounds: {
      north: Number(suumoParams.get('KUKEIPT1LT')),
      east: Number(suumoParams.get('KUKEIPT1LG')),
      south: Number(suumoParams.get('KUKEIPT2LT')),
      west: Number(suumoParams.get('KUKEIPT2LG'))
    },
    bounds_valid: false,
    center_within_bounds: false,
    area_reasonable: false
  };

  try {
    const { north, east, south, west } = validation.generated_bounds;
    const { center } = intersectionArea;

    // 檢查邊界是否合理
    validation.bounds_valid = north > south && east > west;

    // 檢查中心點是否在邊界內
    validation.center_within_bounds = 
      center.lat >= south && center.lat <= north &&
      center.lng >= west && center.lng <= east;

    // 檢查面積是否合理 (不能太大或太小)
    const latRange = north - south;
    const lngRange = east - west;
    const areaDegree2 = latRange * lngRange;
    validation.area_reasonable = areaDegree2 > 0.0001 && areaDegree2 < 0.1; // 合理範圍

  } catch (error) {
    console.warn('座標轉換驗證時發生錯誤:', error);
  }

  return validation;
}

export async function GET(request: NextRequest) {
  // 提供測試範例
  return NextResponse.json({
    endpoint: '/api/suumo/test-intersection',
    method: 'POST',
    description: '測試SUUMO交集座標轉換和API呼叫',
    example_request: {
      intersectionArea: {
        center: { lat: 35.6762, lng: 139.6503 },
        bounds: {
          north: 35.681,
          south: 35.671,
          east: 139.655,
          west: 139.645
        },
        radius: 500,
        requirements: ['starbucks', 'gym']
      },
      testMode: 'real' // 或 'mock'
    },
    usage: [
      '1. 提供交集區域的中心點和邊界',
      '2. API會自動將座標轉換為SUUMO參數',
      '3. 呼叫SUUMO API並分析結果',
      '4. 回傳完整的測試報告'
    ]
  });
}