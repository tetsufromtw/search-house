# Google Places API 遷移記錄

## 🎯 問題背景

**日期**: 2025-01-30  
**問題**: 使用舊版 Google Places API 時遇到 `REQUEST_DENIED` 錯誤  
**原因**: Google Places API 有新舊版本，舊版即將停用且認證問題較多

## 🔄 API 版本對比

### 舊版 Places API (Legacy)
```
端點: https://maps.googleapis.com/maps/api/place/textsearch/json
方法: GET
認證: URL 參數 ?key=API_KEY
狀態: ⚠️ 即將停用，常有 REQUEST_DENIED 問題
```

### 新版 Places API (v1) ✅ 推薦
```
端點: https://places.googleapis.com/v1/places:searchText
方法: POST
認證: Header 'X-Goog-Api-Key'
狀態: ✅ 現代化，穩定，推薦使用
```

## 🛠️ 實作記錄

### 1. 新版 Places API 服務類別
**檔案**: `/src/services/google/NewPlacesService.ts`

**主要功能**:
- 使用新版 API 端點和格式
- POST 請求與 JSON body
- 更好的錯誤處理
- 結果格式轉換為舊版兼容格式

### 2. API 路由更新
**檔案**: `/src/app/api/google/places/search/route.ts`

**策略**: 雙重後備機制
1. 優先嘗試新版 Places API
2. 如果失敗，自動回退到舊版 API
3. 確保向後兼容性

### 3. 前端使用方式
**檔案**: `/src/hooks/useStarbucksSearch.ts`

**請求格式**:
```javascript
// 前端發送
GET /api/google/places/search?query=スターバックス&lat=35.6762&lng=139.6503&radius=5000

// 後端轉換為新版 API
POST https://places.googleapis.com/v1/places:searchText
{
  "textQuery": "スターバックス",
  "maxResultCount": 20,
  "locationBias": {
    "circle": {
      "center": { "latitude": 35.6762, "longitude": 139.6503 },
      "radius": 5000
    }
  }
}
```

## 🔑 Google Cloud Console 設定

### 必須啟用的 API
1. **Places API (New)** - 新版 API，主要使用
2. **Places API** - 舊版 API，作為後備
3. **Maps JavaScript API** - 前端地圖顯示

### API 金鑰設定
```bash
# .env.local 檔案
GOOGLE_API_KEY=你的API金鑰
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的API金鑰
```

**重要**: 確保 API 金鑰沒有 HTTP Referer 限制阻擋 localhost

## 🧪 測試方式

### 1. API 診斷頁面
```
訪問: http://localhost:3001/api/test-google
功能: 測試 Geocoding、舊版 Places、新版 Places API
```

### 2. Starbucks 搜尋測試
```
訪問: http://localhost:3001/starbucks
操作: 拖拉地圖到東京市區
檢查: 控制台日誌和藍色圓圈顯示
```

## 📊 效能比較

| 項目 | 舊版 API | 新版 API |
|------|----------|----------|
| 回應速度 | 較慢 | 較快 |
| 錯誤率 | 高 (REQUEST_DENIED) | 低 |
| 功能完整性 | 基本 | 豐富 |
| 未來支援 | ❌ 即將停用 | ✅ 長期支援 |

## 🚨 重要提醒

### 不要再使用舊版 API！
```javascript
// ❌ 避免使用
https://maps.googleapis.com/maps/api/place/textsearch/json

// ✅ 優先使用  
https://places.googleapis.com/v1/places:searchText
```

### 如果遇到問題
1. 檢查 Google Cloud Console 是否啟用 "Places API (New)"
2. 確認 API 金鑰權限設定
3. 查看後端日誌確認 API 呼叫狀況
4. 新版 API 失敗會自動回退到舊版

## 📝 程式碼範例

### 新版 API 請求範例
```typescript
// NewPlacesService.ts
const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.rating'
  },
  body: JSON.stringify({
    textQuery: 'スターバックス 東京',
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: { latitude: 35.6762, longitude: 139.6503 },
        radius: 5000
      }
    }
  })
});
```

### 前端使用範例
```typescript
// useStarbucksSearch.ts
const params = new URLSearchParams({
  query: 'スターバックス',
  lat: bounds.center.lat.toString(),
  lng: bounds.center.lng.toString(),
  radius: '5000',
  paging: 'true',
  maxPages: '3'
});

const response = await fetch(`/api/google/places/search?${params}`);
```

## 🔄 遷移檢查清單

- [x] 建立新版 Places API 服務類別
- [x] 更新 API 路由支援新版 API
- [x] 實作雙重後備機制
- [x] 前端保持原有介面不變
- [x] 加入詳細日誌記錄
- [x] 建立診斷和測試頁面
- [x] 撰寫遷移文件

## 📚 相關資源

- [Places API (New) 官方文件](https://developers.google.com/maps/documentation/places/web-service/text-search)
- [Places API 遷移指南](https://developers.google.com/maps/documentation/places/web-service/migrate)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**最後更新**: 2025-01-30  
**狀態**: ✅ 已遷移到新版 API，舊版作為後備  
**下次開啟專案**: 直接使用新版 API，不需要再配置