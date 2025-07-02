# 環境變數標準化規範

## 🎯 目的

統一專案中所有 API 環境變數命名，避免不同電腦間 .env.* 檔案不一致的問題。

**最後更新**: 2025-07-02  
**版本**: v1.0  

---

## 📋 標準環境變數名稱

### Google Maps API

#### 前端使用（瀏覽器可見）
```bash
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

**使用場合**:
- React 元件中需要 Google Maps API
- 瀏覽器端的 Google Places API 請求
- APIProvider 等前端初始化

**安全注意事項**:
- 此變數會暴露給瀏覽器
- 必須在 Google Cloud Console 設定網域限制
- 不能用於敏感的後端操作

#### 後端使用（伺服器私有）
```bash
GOOGLE_API_KEY=your_api_key_here
```

**使用場合**:
- Next.js API routes (`/api/*`)
- 伺服器端的 Google Places API 請求
- 不會暴露給瀏覽器的 API 呼叫

**安全注意事項**:
- 此變數僅在伺服器端可見
- 可以使用更高權限的 API 操作
- 建議與前端使用不同的 API Key

---

## 🗂️ 檔案使用規範

### ✅ 正確的使用方式

#### 前端元件
```typescript
// ✅ 正確 - 前端元件使用 NEXT_PUBLIC_ 前綴
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// 範例檔案:
// - src/components/map/Map.tsx
// - src/app/multi-search/page.tsx
// - src/app/starbucks/page.tsx
// - src/components/GoogleMapWithCircles.tsx
// - src/utils/placesApi.ts
```

#### 後端 API Routes
```typescript
// ✅ 正確 - 後端路由使用私有變數
const apiKey = process.env.GOOGLE_API_KEY;

// 範例檔案:
// - src/app/api/google/places/search/route.ts
// - src/app/api/test-google/route.ts
```

### ❌ 錯誤的使用方式

```typescript
// ❌ 錯誤 - 前端使用錯誤的變數名稱
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  // 舊的命名
process.env.GOOGLE_MAPS_API_KEY               // 舊的命名

// ❌ 錯誤 - 後端使用前端變數
process.env.NEXT_PUBLIC_GOOGLE_API_KEY        // 安全風險
```

---

## 📄 .env.local 標準格式

```bash
# =================================
# Google Maps API Keys
# =================================

# 前端用 (瀏覽器可見，需要網域限制保護)
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here

# 後端用 (伺服器私有，不會暴露給瀏覽器)
GOOGLE_API_KEY=your_api_key_here

# =================================
# 其他 API 設定 (未來擴展用)
# =================================

# SUUMO API (若需要)
# SUUMO_API_KEY=your_suumo_api_key

# 地圖樣式設定 (可選)
# NEXT_PUBLIC_MAP_STYLE=your_map_style_json
```

---

## 🔧 遷移檢查清單

### 已完成的標準化項目
- [x] ✅ 更新 .env.local 加入標準變數
- [x] ✅ 修正 `/src/app/multi-search/page.tsx`
- [x] ✅ 修正 `/src/app/starbucks/page.tsx`
- [x] ✅ 驗證後端 API routes 使用正確變數
- [x] ✅ 建立標準化文件

### 已驗證正確的檔案
- [x] ✅ `/src/components/map/Map.tsx`
- [x] ✅ `/src/components/GoogleMapWithCircles.tsx`
- [x] ✅ `/src/utils/placesApi.ts`
- [x] ✅ `/src/app/api/google/places/search/route.ts`
- [x] ✅ `/src/app/api/test-google/route.ts`

---

## 🚨 重要提醒

### 給 Claude Sessions 的指示

**🔒 絕對不能更改的規則**:

1. **前端元件**只能使用 `NEXT_PUBLIC_GOOGLE_API_KEY`
2. **後端 API routes**只能使用 `GOOGLE_API_KEY`
3. **絕對不要**再使用這些舊名稱:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `GOOGLE_MAPS_API_KEY`
   - 任何其他變體命名

### 新功能開發指南

如果需要新增其他 API 或環境變數，請遵循以下命名規則:

```bash
# 前端可見的變數 (瀏覽器可存取)
NEXT_PUBLIC_{SERVICE}_{PURPOSE}_KEY

# 後端私有的變數 (僅伺服器可存取)  
{SERVICE}_{PURPOSE}_KEY

# 範例:
NEXT_PUBLIC_MAPBOX_API_KEY     # 前端地圖服務
MAPBOX_API_KEY                 # 後端地圖服務
NEXT_PUBLIC_ANALYTICS_ID       # 前端分析追蹤
DATABASE_CONNECTION_STRING     # 後端資料庫連線
```

---

## 🔍 驗證方式

### 開發時檢查

```bash
# 檢查前端變數是否正確載入
console.log('Frontend API Key:', process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? '✅ Loaded' : '❌ Missing');

# 檢查後端變數是否正確載入 (在 API route 中)
console.log('Backend API Key:', process.env.GOOGLE_API_KEY ? '✅ Loaded' : '❌ Missing');
```

### 部署前檢查

```bash
# 搜尋專案中是否還有舊的環境變數名稱
grep -r "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" src/
grep -r "GOOGLE_MAPS_API_KEY" src/

# 應該回傳空結果，否則需要修正
```

---

## 📞 問題排除

### 常見問題

**Q: 前端顯示 "API Key 未設定"**
- 檢查 `.env.local` 是否包含 `NEXT_PUBLIC_GOOGLE_API_KEY`
- 重新啟動開發伺服器 (`npm run dev`)
- 確認變數名稱完全一致（大小寫敏感）

**Q: 後端 API 回傳 "Service Unavailable"**
- 檢查 `.env.local` 是否包含 `GOOGLE_API_KEY`
- 確認 Google Cloud Console 已啟用相關 API
- 檢查 API Key 是否有足夠權限

**Q: 不同電腦上環境變數不同步**
- 確保所有電腦使用相同的 `.env.local` 格式
- 使用此文件作為標準參考
- 避免使用 `.env.development` 或其他環境檔案

---

## 📚 相關文件

- [Google Maps API 文件](https://developers.google.com/maps/documentation)
- [Next.js 環境變數文件](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [專案架構文件](./PROJECT_STATUS.md)

---

**⚠️ 嚴重警告**: 更改環境變數名稱會影響整個應用程式的運作。請務必按照此文件標準執行，並在更改前進行完整測試。