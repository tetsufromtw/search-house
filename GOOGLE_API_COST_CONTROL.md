# 🚨 Google API 費用控制緊急指南

## 📊 當前狀況
- **一天費用**: ¥10,000 (太高了！)
- **主要原因**: Google Places API 呼叫過於頻繁
- **緊急措施**: 已暫停所有 Places API，改用模擬資料

## ✅ 已採取的緊急措施

### 1. 停用 Places API 呼叫
- `src/utils/placesApi.ts` - 強制回傳模擬資料
- `src/app/api/test-google/route.ts` - 停用所有測試端點

### 2. 模擬資料已準備好
- 東京各區域的 Starbucks 位置資料
- Anytime Fitness 健身房位置
- 便利商店位置資料
- 包含真實的經緯度和地址

## 🎯 下一步成本控制策略

### 1. 建立 API 使用量控制
```typescript
// src/utils/apiCostControl.ts
export class GoogleApiCostController {
  private dailyLimit = 1000; // 每日請求上限
  private currentUsage = 0;
  
  canMakeRequest(): boolean {
    return this.currentUsage < this.dailyLimit;
  }
  
  recordUsage(apiType: 'maps' | 'places' | 'geocoding', cost: number) {
    this.currentUsage += cost;
    console.log(`API 使用: ${apiType}, 費用: ${cost}, 今日總計: ${this.currentUsage}`);
  }
}
```

### 2. 開發模式設定
在 `.env.local` 添加：
```
# 開發模式 - 避免真實 API 呼叫
NEXT_PUBLIC_DEVELOPMENT_MODE=true
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_API_COST_LIMIT=500
```

### 3. 智慧快取機制
- 搜尋結果快取 24 小時
- 地圖邊界變化時才重新搜尋
- 使用 localStorage 儲存常用位置

## 📋 費用分析

### Google Maps APIs 費用 (每 1000 次請求)
- **Maps JavaScript API**: $7 USD (基本地圖載入)
- **Places API (New)**: $17 USD (地點搜尋)
- **Geocoding API**: $5 USD (地址轉換)
- **Places Text Search**: $32 USD (文字搜尋，最貴！)

### 你的使用情況推測
- 可能誤用了 Places Text Search API
- 每次搜尋可能觸發多次 API 呼叫
- 缺少適當的快取機制

## 🔧 立即可用的替代方案

### 1. 使用現有模擬資料
```typescript
import { getMockPlaces } from '@/utils/placesApi';

// 不花錢的搜尋
const places = getMockPlaces('starbucks');
```

### 2. 建立更豐富的模擬資料
可以新增更多城市和店鋪類型：
- 大阪地區資料
- 更多連鎖店 (711、FamilyMart、Lawson)
- 更多健身房品牌

### 3. 考慮免費替代方案
- **Nominatim (OpenStreetMap)**: 完全免費的地理編碼
- **Overpass API**: 免費的 POI 資料查詢
- **本地資料庫**: 預先下載東京商店資料

## 📝 監控建議

### 1. Google Cloud Console 設定
- 設定每日預算警報 ¥1000
- 啟用 API 配額限制
- 設定使用量監控

### 2. 應用程式內監控
```typescript
// 每次 API 呼叫前檢查
if (process.env.NODE_ENV === 'development') {
  console.warn('🚨 開發模式：使用模擬資料避免費用');
  return mockData;
}
```

## 🚨 緊急停用指令

如果再次產生高額費用，立即執行：

```bash
# 1. 停用所有 API Key
# 在 Google Cloud Console 暫停 API

# 2. 環境變數移除
# 註解掉 .env.local 中的 GOOGLE_API_KEY

# 3. 強制模擬模式
export NEXT_PUBLIC_FORCE_MOCK_MODE=true
```

## 💡 長期解決方案

### 1. 混合策略
- 基本地圖：使用 Google Maps (低費用)
- 地點搜尋：使用免費 API + 自建資料庫
- 特殊功能：付費 API (嚴格控制使用量)

### 2. 成本最佳化
- 實作智慧搜尋建議 (減少不必要搜尋)
- 地理區域限制 (只搜尋必要範圍)
- 結果分頁和快取 (避免重複請求)

---

**記住：開發階段絕對要使用模擬資料！**