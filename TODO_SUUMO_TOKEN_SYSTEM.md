# SUUMO Token 自動更新系統 - 開發紀錄

## 📋 實作狀況

### ✅ 已完成功能

#### 1. **模組化架構**
- `src/services/suumo/tokenManager.ts` - Token 獲取與快取管理
- `src/services/suumo/apiClient.ts` - API 請求統一封裝
- `src/services/suumo/types.ts` - TypeScript 類型定義
- `src/services/suumo/index.ts` - 統一匯出與初始化
- `src/app/api/suumo/tokens/route.ts` - Token 獲取 API 端點

#### 2. **動態 Token 管理**
- ✅ 移除所有寫死的 ATT 值
- ✅ 自動從 `https://suumo.jp/map/chintai/tokyo/sc_chiyoda/` 獲取最新 Token
- ✅ 30分鐘快取機制，過期自動刷新
- ✅ 失敗時的重試機制 (3次重試)

#### 3. **智能失效檢測**
- ✅ 檢測回應中的 `認証エラーです` 錯誤訊息
- ✅ HTTP 錯誤狀態檢測 (401, 403)
- ✅ ATT 為空時強制重新獲取

#### 4. **自動刷新機制**
- ✅ API 請求失敗時自動刷新 Token 並重試
- ✅ 第一次失敗刷新，第二次失敗才報錯
- ✅ 支援瀏覽器與伺服器環境

#### 5. **錯誤處理**
- ✅ Webpack 配置避免客戶端打包 Puppeteer
- ✅ 修復 Hydration 錯誤（SuumoApiTester 元件）
- ✅ 完整的錯誤日誌和狀態回報

### 🔧 相關檔案清單

#### 新增檔案
```
src/services/suumo/
├── types.ts                    - 類型定義
├── tokenManager.ts             - Token 管理核心
├── apiClient.ts                - API 請求封裝
└── index.ts                    - 統一匯出

src/app/api/suumo/tokens/
└── route.ts                    - Token 獲取 API 端點

next.config.js                  - Webpack 配置
```

#### 修改檔案
```
src/utils/suumoApi.ts           - 整合 Token Manager
src/components/SuumoApiTester.tsx - 修復 Hydration + 移除寫死值
src/app/layout.tsx              - 移除客戶端初始化（避免 Puppeteer 錯誤）
SUUMO_API_DOCUMENTATION.md      - 更新文件
```

### 🔄 系統工作流程

1. **程式啟動** → Token Manager 初始化（懶加載）
2. **首次 API 請求** → 自動從 SUUMO 頁面獲取 Token
3. **Token 快取** → 30分鐘有效期，記憶體存儲
4. **失效檢測** → 收到 `認証エラーです` 自動刷新
5. **自動重試** → 刷新 Token 後重新請求
6. **錯誤回退** → 多次失敗時提供空 Token（強制下次重新獲取）

### 🚧 待優化項目

#### 1. **Token 提取邏輯優化**
```typescript
// 位置: src/services/suumo/tokenManager.ts:fetchTokensWithFetch()
// 當前: 使用正則表達式從 HTML 提取
// 改進: 可考慮更精確的解析邏輯
```

#### 2. **Puppeteer 整合**
```typescript
// 位置: src/services/suumo/tokenManager.ts:fetchTokensWithPuppeteer()
// 當前: 已實作但被停用（避免客戶端錯誤）
// 改進: 可用於伺服器端更可靠的 Token 獲取
```

#### 3. **錯誤處理強化**
- 網路超時處理
- 更詳細的錯誤分類
- 失敗通知機制

#### 4. **監控與日誌**
- Token 更新頻率統計
- API 請求成功率監控
- 效能指標追蹤

### 🧪 測試驗證

#### 手動測試步驟
1. 訪問 `/demo` 頁面
2. 查看 SuumoApiTester 自動請求結果
3. 檢查 Console 日誌確認 Token 獲取流程
4. 驗證 API 回應包含物件資料而非認證錯誤

#### 測試 API 端點
```bash
# 獲取最新 Token
curl http://localhost:3000/api/suumo/tokens

# 測試 SUUMO API（會自動使用最新 Token）
curl "http://localhost:3000/api/suumo?UID=smapi343&STMP=0&ATT=&FORMAT=1&CALLBACK=SUUMO.CALLBACK.FUNCTION&P=1&CNT=50&GAZO=2&PROT=1&SE=040&KUKEIPT1LT=35.70&KUKEIPT1LG=139.77&KUKEIPT2LT=35.69&KUKEIPT2LG=139.74&LITE_KBN=1"
```

### 📝 使用方式

#### 基本使用
```typescript
import { suumoTokenManager } from '../services/suumo';

// 獲取最新 Token（自動處理快取和刷新）
const tokens = await suumoTokenManager.getTokens();

// 使用 Token 進行 API 請求
const params = new URLSearchParams({
  UID: tokens.bkApi.UID,
  STMP: tokens.bkApi.STMP,
  ATT: tokens.bkApi.ATT,
  // ... 其他參數
});
```

#### 高級使用
```typescript
import { suumoApiClient } from '../services/suumo';

// 使用封裝好的 API 客戶端（自動處理 Token 和重試）
const params = new URLSearchParams({
  FORMAT: '1',
  P: '1',
  CNT: '50',
  // ... 搜尋參數
});

const response = await suumoApiClient.makeRequest(params);
```

### 🔍 除錯信息

#### Console 日誌關鍵字
- `🚀 初始化 SUUMO 服務` - 服務啟動
- `🔄 開始獲取 SUUMO Tokens` - Token 獲取開始
- `✅ SUUMO Tokens 獲取成功` - Token 獲取成功
- `🚨 偵測到認證錯誤，自動刷新 Token` - 自動刷新觸發
- `❌ 無法獲取有效 Token` - 獲取失敗

#### 常見問題
1. **Token 獲取失敗** → 檢查網路連線和 SUUMO 網站可用性
2. **API 認證錯誤** → 檢查是否觸發自動刷新機制
3. **客戶端錯誤** → 確認 next.config.js 正確排除 Puppeteer

---

## 🎯 重要提醒

- **此系統完全自動化**，不需要手動更新 Token
- **無寫死值**，完全依賴動態獲取
- **失敗容錯**，多重備援機制
- **模組化設計**，易於維護和擴展

---

*記錄時間: 2025-01-01*  
*版本: v1.0 - 初始完整實作*  
*狀態: 功能完整，可投入使用*