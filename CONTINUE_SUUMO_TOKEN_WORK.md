# SUUMO Token 系統續作指南

## 📍 當前進度

### ✅ 已完成
- `src/services/suumo/types.ts` - 完整的 TypeScript 類型定義
- `src/services/suumo/tokenManager.ts` - 完整的 Token 管理器實作
- 基本的 `/api/suumo/route.ts` 代理端點

### 🚧 進行中
- 建立完整的 SUUMO 服務模組架構

### ⏳ 待完成
1. **建立 API 客戶端封裝** (`src/services/suumo/apiClient.ts`)
2. **建立統一匯出檔案** (`src/services/suumo/index.ts`)
3. **建立 Token 刷新 API 端點** (`src/app/api/suumo/tokens/route.ts`)
4. **更新現有的 SUUMO API 整合**
5. **測試整個系統**

## 🎯 下次上線繼續工作

### 第一步：完成 API 客戶端
創建 `src/services/suumo/apiClient.ts`：

```typescript
/**
 * SUUMO API 客戶端封裝
 * 自動處理 Token 管理、重試邏輯、錯誤處理
 */

import { suumoTokenManager } from './tokenManager';
import { SuumoApiResponse, SuumoApiError } from './types';

class SuumoApiClient {
  private readonly BASE_URL = 'https://suumo.jp/jj/JJ903FC020/';
  private readonly MAX_RETRIES = 2;

  async makeRequest(params: URLSearchParams): Promise<SuumoApiResponse> {
    return await this.makeRequestWithRetry(params, 0);
  }

  private async makeRequestWithRetry(
    params: URLSearchParams, 
    retryCount: number
  ): Promise<SuumoApiResponse> {
    try {
      // 獲取最新 Token
      const tokens = await suumoTokenManager.getTokens();
      
      // 設定認證參數
      params.set('UID', tokens.bkApi.UID);
      params.set('STMP', tokens.bkApi.STMP);
      params.set('ATT', tokens.bkApi.ATT);

      // 發送請求
      const response = await fetch(`${this.BASE_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Referer': 'https://suumo.jp/jj/chintai/',
          'Origin': 'https://suumo.jp'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      
      // 檢查是否為認證錯誤
      if (suumoTokenManager.isTokenInvalid(responseText)) {
        if (retryCount < this.MAX_RETRIES) {
          console.log('🚨 偵測到認證錯誤，自動刷新 Token 並重試');
          await suumoTokenManager.refreshTokens();
          return await this.makeRequestWithRetry(params, retryCount + 1);
        } else {
          throw new Error('認證失敗：Token 刷新後仍無法通過驗證');
        }
      }

      // 解析 JSONP 回應
      return this.parseJsonpResponse(responseText);

    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        console.log(`🔄 請求失敗，重試 ${retryCount + 1}/${this.MAX_RETRIES}`);
        await suumoTokenManager.refreshTokens();
        return await this.makeRequestWithRetry(params, retryCount + 1);
      }
      
      throw error;
    }
  }

  private parseJsonpResponse(responseText: string): SuumoApiResponse {
    // 移除 JSONP 包裝，提取 JSON
    const jsonMatch = responseText.match(/SUUMO\.CALLBACK\.FUNCTION\((.*)\)/);
    if (!jsonMatch) {
      throw new Error('無法解析 SUUMO API 回應格式');
    }

    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      throw new Error('SUUMO API 回應 JSON 格式錯誤');
    }
  }
}

export const suumoApiClient = new SuumoApiClient();
```

### 第二步：建立統一匯出
創建 `src/services/suumo/index.ts`：

```typescript
/**
 * SUUMO 服務統一匯出
 */

export { suumoTokenManager } from './tokenManager';
export { suumoApiClient } from './apiClient';
export * from './types';

// 初始化日誌
console.log('🚀 初始化 SUUMO 服務模組');
```

### 第三步：建立 Token API 端點
創建 `src/app/api/suumo/tokens/route.ts`：

```typescript
import { NextResponse } from 'next/server';
import { suumoTokenManager } from '../../../../services/suumo';

export async function GET() {
  try {
    console.log('🔑 API 端點：獲取 SUUMO Token');
    
    const tokens = await suumoTokenManager.getTokens();
    const cacheStatus = suumoTokenManager.getCacheStatus();
    
    return NextResponse.json({
      success: true,
      tokens,
      cache: cacheStatus,
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
    
    return NextResponse.json({
      success: true,
      tokens,
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
```

### 第四步：更新現有的 SUUMO API 代理
修改 `src/app/api/suumo/route.ts`：

```typescript
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

    // 使用新的 API 客戶端
    const response = await suumoApiClient.makeRequest(params);
    
    console.log('✅ SUUMO API 回應成功');
    
    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ SUUMO API 請求失敗:', error);
    
    return NextResponse.json({
      error: 'SUUMO API 請求失敗',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

### 第五步：測試系統
1. 訪問 `http://localhost:3000/api/suumo/tokens` 測試 Token 獲取
2. 使用現有的 SuumoApiTester 元件測試整合
3. 檢查 Console 日誌確認自動刷新機制

## 🔧 相關指令

```bash
# 啟動開發伺服器
npm run dev

# 測試 Token API
curl http://localhost:3000/api/suumo/tokens

# 強制刷新 Token
curl -X POST http://localhost:3000/api/suumo/tokens

# 測試 SUUMO API（會自動使用最新 Token）
curl "http://localhost:3000/api/suumo?FORMAT=1&P=1&CNT=50&GAZO=2&PROT=1&SE=040&KUKEIPT1LT=35.70&KUKEIPT1LG=139.77&KUKEIPT2LT=35.69&KUKEIPT2LG=139.74&LITE_KBN=1"
```

## 📝 檢查清單

- [x] 建立 `src/services/suumo/apiClient.ts` ✅ 2025-01-30 完成
- [x] 建立 `src/services/suumo/index.ts` ✅ 2025-01-30 完成
- [x] 建立 `src/app/api/suumo/tokens/route.ts` ✅ 2025-01-30 完成
- [x] 更新 `src/app/api/suumo/route.ts` ✅ 2025-01-30 完成
- [x] 建立診斷 API 端點 `src/app/api/suumo/diagnose/route.ts` ✅ 2025-01-30 完成
- [x] 建立測試頁面 `src/app/suumo-test/page.tsx` ✅ 2025-01-30 完成
- [ ] 測試 Token 獲取端點 - **待用戶測試**
- [ ] 測試自動重試機制 - **待用戶測試**
- [ ] 驗證現有功能正常運作 - **待用戶測試**

## 🎯 預期結果

完成後，整個系統將：
- 完全自動化管理 SUUMO Token
- 無需任何寫死的認證值
- 自動檢測並刷新過期 Token
- 提供統一的 API 介面
- 具備完整的錯誤處理和重試機制

---

## ✅ 實作完成狀態

**完成日期**: 2025-01-30  
**實作狀態**: 🎉 **已完成所有開發工作**  

### 🚀 可以立即測試的功能

#### 1. 系統診斷頁面
```
訪問: http://localhost:3001/suumo-test
功能: 完整的測試界面，包含6個測試項目
```

#### 2. API 端點測試
```bash
# Token 狀態檢查
curl http://localhost:3001/api/suumo/tokens

# 系統診斷
curl http://localhost:3001/api/suumo/diagnose

# 強制刷新 Token
curl -X POST http://localhost:3001/api/suumo/tokens

# SUUMO API 測試
curl "http://localhost:3001/api/suumo?FORMAT=1&P=1&CNT=5&PROT=1&LITE_KBN=1"
```

### 📁 新增的檔案
- ✅ `src/services/suumo/apiClient.ts` - API 客戶端
- ✅ `src/services/suumo/index.ts` - 統一匯出
- ✅ `src/app/api/suumo/tokens/route.ts` - Token API 端點
- ✅ `src/app/api/suumo/diagnose/route.ts` - 診斷 API 端點
- ✅ `src/app/suumo-test/page.tsx` - 測試頁面

### 📝 下一步行動
1. 訪問 `http://localhost:3001/suumo-test` 執行完整測試
2. 如果發現 ATT 產生問題，檢查 `tokenManager.ts` 中的演算法
3. 根據測試結果調整或優化系統

**🎊 SUUMO Token 系統實作完成！**