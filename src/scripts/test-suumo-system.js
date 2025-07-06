/**
 * SUUMO 系統快速診斷腳本
 * 測試Token管理、座標轉換、API呼叫的完整流程
 */

// 測試配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000', // 調整為你的開發伺服器地址
  tests: [
    {
      name: 'Token狀態檢查',
      endpoint: '/api/suumo/token-status',
      method: 'GET'
    },
    {
      name: 'OSM到SUUMO完整流程',
      endpoint: '/api/osm-search',
      method: 'POST',
      data: {
        requirements: ['starbucks', 'gym'],
        center: { lat: 35.6762, lng: 139.6503 },
        searchRadius: 1000,
        intersectionRadius: 500
      }
    },
    {
      name: 'SUUMO交集座標測試',
      endpoint: '/api/suumo/test-intersection',
      method: 'POST',
      data: {
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
    }
  ]
};

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// 主測試函數
async function runTests() {
  log('\n🧪 SUUMO 系統診斷開始', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const results = [];
  
  for (let i = 0; i < TEST_CONFIG.tests.length; i++) {
    const test = TEST_CONFIG.tests[i];
    
    log(`\n📋 測試 ${i + 1}/${TEST_CONFIG.tests.length}: ${test.name}`, 'blue');
    log('-'.repeat(30), 'blue');
    
    try {
      const startTime = Date.now();
      
      // 準備請求
      const url = `${TEST_CONFIG.baseUrl}${test.endpoint}`;
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (test.data) {
        options.body = JSON.stringify(test.data);
      }
      
      log(`📡 請求: ${test.method} ${test.endpoint}`, 'yellow');
      
      // 發送請求
      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      // 解析回應
      const responseData = await response.text();
      let parsedData;
      
      try {
        parsedData = JSON.parse(responseData);
      } catch (e) {
        parsedData = { raw_response: responseData };
      }
      
      // 記錄結果
      const result = {
        test: test.name,
        success: response.ok,
        status: response.status,
        responseTime,
        data: parsedData
      };
      
      results.push(result);
      
      // 顯示結果
      if (response.ok) {
        log(`✅ 成功 (${responseTime}ms)`, 'green');
        
        // 顯示關鍵資訊
        if (parsedData) {
          if (parsedData.success !== undefined) {
            log(`   狀態: ${parsedData.success ? '成功' : '失敗'}`, parsedData.success ? 'green' : 'red');
          }
          
          // Token狀態特殊處理
          if (test.name.includes('Token') && parsedData.token_info) {
            log(`   Token UID: ${parsedData.token_info.uid}`, 'yellow');
            log(`   Token ATT: ${parsedData.token_info.att_preview}`, 'yellow');
            log(`   快取狀態: ${parsedData.cache_status.is_valid ? '有效' : '無效'}`, 
                parsedData.cache_status.is_valid ? 'green' : 'yellow');
          }
          
          // 搜尋結果特殊處理
          if (parsedData.data?.metadata) {
            const meta = parsedData.data.metadata;
            log(`   店鋪數: ${meta.stores_found || 0}`, 'cyan');
            log(`   交集區域: ${meta.intersection_areas_found || 0}`, 'cyan');
            log(`   租屋物件: ${meta.properties_found || 0}`, 'cyan');
            log(`   總費用: $${(meta.total_api_cost || 0).toFixed(4)}`, 'magenta');
          }
          
          // 交集測試特殊處理
          if (parsedData.data?.analysis) {
            const analysis = parsedData.data.analysis;
            log(`   物件數量: ${analysis.total_properties}`, 'cyan');
            log(`   搜尋面積: ${analysis.search_area_km2} km²`, 'cyan');
            log(`   座標驗證: ${parsedData.data.coordinate_validation.bounds_valid ? '通過' : '失敗'}`, 
                parsedData.data.coordinate_validation.bounds_valid ? 'green' : 'red');
          }
        }
        
      } else {
        log(`❌ 失敗 (${response.status})`, 'red');
        log(`   錯誤: ${parsedData.error || parsedData.message || '未知錯誤'}`, 'red');
      }
      
    } catch (error) {
      log(`❌ 網路錯誤: ${error.message}`, 'red');
      results.push({
        test: test.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // 顯示總結
  log('\n📊 測試總結', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  log(`總測試數: ${totalCount}`, 'blue');
  log(`成功: ${successCount}`, 'green');
  log(`失敗: ${totalCount - successCount}`, successCount === totalCount ? 'green' : 'red');
  log(`成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`, 
      successCount === totalCount ? 'green' : 'yellow');
  
  // 系統建議
  log('\n💡 系統建議:', 'yellow');
  
  const tokenTest = results.find(r => r.test.includes('Token'));
  const osmTest = results.find(r => r.test.includes('OSM'));
  const intersectionTest = results.find(r => r.test.includes('交集'));
  
  if (tokenTest?.success) {
    log('✅ Token系統正常運行', 'green');
  } else {
    log('❌ Token系統異常，請檢查網路連接', 'red');
  }
  
  if (osmTest?.success) {
    log('✅ OSM到SUUMO橋接正常', 'green');
  } else {
    log('❌ OSM搜尋流程異常', 'red');
  }
  
  if (intersectionTest?.success) {
    log('✅ 座標轉換和交集計算正常', 'green');
  } else {
    log('❌ 交集座標測試異常', 'red');
  }
  
  if (successCount === totalCount) {
    log('\n🎉 所有系統正常！可以開始使用SUUMO功能', 'green');
  } else {
    log('\n⚠️ 部分系統異常，請檢查錯誤並修復', 'yellow');
  }
  
  log('\n🔗 測試頁面:', 'cyan');
  log(`   SUUMO測試: ${TEST_CONFIG.baseUrl}/suumo-intersection-test`, 'blue');
  log(`   Token狀態: ${TEST_CONFIG.baseUrl}/api/suumo/token-status`, 'blue');
  log(`   完整搜尋: ${TEST_CONFIG.baseUrl}/leaflet-search`, 'blue');
}

// 檢查是否在Node.js環境中
if (typeof window === 'undefined') {
  // Node.js環境，需要fetch polyfill
  const fetch = require('node-fetch');
  global.fetch = fetch;
  
  // 運行測試
  runTests().catch(error => {
    console.error('測試腳本執行失敗:', error);
    process.exit(1);
  });
} else {
  // 瀏覽器環境
  window.testSuumoSystem = runTests;
  console.log('SUUMO測試函數已載入，使用 testSuumoSystem() 執行測試');
}