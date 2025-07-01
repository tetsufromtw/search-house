# SUUMO API 參數說明文件

## API 端點
```
GET https://suumo.jp/jj/JJ903FC020/
```

本文件說明 SUUMO 租屋搜尋 API 的各項參數意義與用法。

## 請求參數詳解

### 基本認證參數
| 參數 | 範例值 | 說明 |
|------|--------|------|
| `UID` | `smapi343` | 用戶識別碼，固定值 |
| `STMP` | `1751207011` | 時間戳記，通常為當前時間的毫秒數 |
| `ATT` | `ba8126dbed59f9a042e6c889f5f2cfb9b15e76f5` | 認證令牌，會定期更新 |

### 回應格式參數
| 參數 | 範例值 | 說明 |
|------|--------|------|
| `FORMAT` | `1` | 回應格式，1 = JSONP |
| `CALLBACK` | `SUUMO.CALLBACK.FUNCTION` | JSONP 回調函數名稱 |

### 分頁參數
| 參數 | 範例值 | 說明 |
|------|--------|------|
| `P` | `1` | 頁碼，從 1 開始 |
| `CNT` | `1998` | 每頁結果數量上限 |

### 搜尋條件參數
| 參數 | 範例值 | 說明 |
|------|--------|------|
| `SE` | `040` | 搜尋類別，040 = 賃貸物件 |
| `GAZO` | `2` | 圖片選項，2 = 包含所有圖片 |
| `PROT` | `1` | 協議類型 |
| `LITE_KBN` | `1` | 輕量模式，1 = 啟用 |

### 地理範圍參數（矩形搜尋）

SUUMO API 使用矩形區域進行地理搜尋，需要指定矩形的兩個對角點：

| 參數 | 範例值 | 說明 |
|------|--------|------|
| `KUKEIPT1LT` | `35.70183056403364` | 矩形點1的緯度（通常為東北角） |
| `KUKEIPT1LG` | `139.76971174661355` | 矩形點1的經度（通常為東北角） |
| `KUKEIPT2LT` | `35.686251072624486` | 矩形點2的緯度（通常為西南角） |
| `KUKEIPT2LG` | `139.73746086541848` | 矩形點2的經度（通常為西南角） |

#### 座標範例說明
- **點1 (35.702, 139.770)** - 矩形的東北角
- **點2 (35.686, 139.737)** - 矩形的西南角
- **搜尋範圍** - 東京都台東區附近約 2km x 1.5km 的矩形區域

## 完整請求範例

```http
GET /api/suumo?UID=smapi343&STMP=1751351831&ATT=ba8126dbed59f9a042e6c889f5f2cfb9b15e76f5&FORMAT=1&CALLBACK=SUUMO.CALLBACK.FUNCTION&P=1&CNT=1998&GAZO=2&PROT=1&SE=040&KUKEIPT1LT=35.70183056403364&KUKEIPT1LG=139.76971174661355&KUKEIPT2LT=35.686251072624486&KUKEIPT2LG=139.73746086541848&LITE_KBN=1
```

## 回應格式

### 成功回應
```javascript
SUUMO.CALLBACK.FUNCTION({
    "smatch": {
        "condition": "【検索条件】｜表示種別：賃貸｜...",
        "resultset": {
            "firsthit": 1,
            "hits": 1245,  // 總找到物件數
            "item": [
                {
                    "bukkenCdList": ["100446730434"],  // 物件ID列表
                    "lg": 139.744048549236,            // 經度
                    "lt": 35.6924591561021,            // 緯度
                    "shubetsuList": ["040"]            // 物件類型列表
                }
                // ... 更多物件
            ]
        }
    }
})
```

### 錯誤回應
```javascript
SUUMO.CALLBACK.FUNCTION({
    "smatch": {
        "errors": {
            "error": [
                {
                    "message": "認証エラーです。"  // 認證錯誤
                }
            ]
        }
    }
})
```

## 使用說明

### 1. 座標計算
要搜尋特定區域，需要計算包含該區域的矩形邊界：

```javascript
// 基於中心點和半徑計算矩形
const center = { lat: 35.6762, lng: 139.6503 };  // 東京中心
const radiusInDegrees = 1000 / 111320;  // 1km 轉換為度數

const bounds = {
    north: center.lat + radiusInDegrees,    // KUKEIPT1LT
    east: center.lng + radiusInDegrees,     // KUKEIPT1LG  
    south: center.lat - radiusInDegrees,    // KUKEIPT2LT
    west: center.lng - radiusInDegrees      // KUKEIPT2LG
};
```

### 2. 認證問題
如果收到「認証エラーです。」錯誤，可能原因：
- `ATT` 認證令牌過期或無效
- `UID` 用戶識別碼不正確
- 請求頻率過高被限制
- 缺少必要的 HTTP headers

### 3. CORS 限制
由於瀏覽器的 CORS 政策，需要通過後端代理來呼叫此 API：

```javascript
// 前端請求代理端點
const response = await fetch(`/api/suumo?${params}`);

// 後端代理到實際 SUUMO API  
const suumoResponse = await fetch(`https://suumo.jp/jj/JJ903FC020/?${params}`);
```

## 開發建議

1. **錯誤處理** - 始終檢查回應中的 `errors` 欄位
2. **頻率限制** - 避免過於頻繁的 API 請求
3. **快取機制** - 對相同參數的請求實施快取
4. **備援方案** - 準備模擬資料作為 API 失敗時的備援

## 交集區域整合計劃

### 🎯 目標：將圓圈交集功能與 SUUMO API 整合

#### 方法：中心點+動態半徑法
採用最簡單高效的轉換策略，將交集區域轉換為 SUUMO API 所需的矩形參數。

#### 實作步驟

1. **取得交集資料**
   ```javascript
   // 從現有交集計算中取得
   const intersection = {
       center: { lat: 35.6762, lng: 139.6503 },
       radius: 800  // 公尺
   };
   ```

2. **轉換為矩形邊界**
   ```javascript
   // 使用中心點 + 1.2倍半徑作為搜尋範圍
   const expandedRadius = intersection.radius * 1.2;
   const radiusInDegrees = expandedRadius / 111320;
   
   const bounds = {
       north: intersection.center.lat + radiusInDegrees,  // KUKEIPT1LT
       south: intersection.center.lat - radiusInDegrees,  // KUKEIPT2LT
       east: intersection.center.lng + radiusInDegrees,   // KUKEIPT1LG
       west: intersection.center.lng - radiusInDegrees    // KUKEIPT2LG
   };
   ```

3. **整合到現有搜尋流程**
   - 修改 `searchPropertiesInIntersection()` 函數
   - 使用真實交集座標而非模擬資料
   - 保持現有的錯誤處理和回退機制

#### 技術優勢
- ✅ **實作簡單** - 利用現有的交集 center 和 radius
- ✅ **效率最高** - 單次 API 呼叫，最少計算量
- ✅ **維護容易** - 邏輯直觀，不易出錯
- ✅ **涵蓋完整** - 1.2倍擴展確保覆蓋整個交集區域

#### 檔案修改清單
- [ ] 修改 `/src/utils/suumoApi.ts` - 更新座標轉換邏輯
- [ ] 修改 `/src/hooks/usePropertySearch.ts` - 整合真實交集資料  
- [ ] 測試 `/src/components/SuumoApiTester.tsx` - 驗證轉換結果
- [ ] 文件更新 - 記錄實作結果

#### 預期效果
當用戶在地圖上繪製圓圈並產生交集時，右側物件列表將顯示該交集區域內的真實 SUUMO 租屋資料，而非模擬資料。

---

## 相關檔案

- **API 代理實作**: `/src/app/api/suumo/route.ts`
- **前端呼叫邏輯**: `/src/utils/suumoApi.ts`
- **測試元件**: `/src/components/SuumoApiTester.tsx`
- **交集計算**: `/src/utils/intersectionUtils.ts`
- **物件搜尋**: `/src/hooks/usePropertySearch.ts`

---

*最後更新: 2025-01-30*
*文件版本: 1.1 - 新增交集區域整合計劃*