# Search-House 性能問題與解決方案

## 🚨 當前主要問題

### 1. 渲染速度極慢 (12秒+)
- **分頁延遲**：每個需求搜尋3頁，每頁間2秒延遲
- **多需求疊加**：anytime fitness + starbucks = 12秒+ 總等待時間
- **API 請求量**：最多 2需求 × 3頁 = 6次 Places API 請求

### 2. 地圖邊界獲取失敗
- **根本原因**：`bounds_changed` 事件未正確觸發
- **後果**：每次都搜尋預設的東京全範圍（50km半徑）
- **浪費**：獲取大量不相關的遠距離結果

### 3. 啟動體驗不佳
- **期望**：網站開啟 → 立即獲取當前地圖範圍 → 搜尋該範圍店家
- **現實**：網站開啟 → 5秒後備用初始化 → 搜尋整個東京

### 4. 無明確的速度優化策略

## 💡 解決方案優先順序

### 🔥 立即修復（可立即實施）
```typescript
// 檔案：src/utils/placesApi.ts
const maxPages = 1; // 從3改為1，只取第一頁
// await delay(2000); // 註解掉分頁延遲

// 暫時硬編碼縮小的搜尋範圍
const tokyoCenterBounds = {
  north: 35.7,
  south: 35.6, 
  east: 139.8,
  west: 139.6
}; // 東京市中心範圍
```

### 🛠️ 中期優化（需要重構）
1. **修復地圖邊界獲取**：改用 Google Maps JavaScript API 直接獲取地圖實例
2. **實作快取機制**：避免重複搜尋相同區域
3. **批次API請求**：減少請求頻率

### 🏗️ 長期方案（架構調整）
1. **後端預處理**：建立店家資料庫，前端只查詢
2. **地理索引**：使用 QuadTree 或類似結構快速查詢
3. **WebSocket**：即時更新，避免重複搜尋

## 🎯 預期效果
- **立即修復**：從 12秒+ 降到 2-3秒
- **中期優化**：降到 1秒內
- **長期方案**：即時響應 (<500ms)

## 📝 開發者備註

下次開啟專案時，請優先詢問：

1. **"要先處理速度問題嗎？"** - 實施立即修復方案
2. **"地圖邊界問題解決了嗎？"** - 檢查 `bounds_changed` 事件
3. **"需要實作快取機制嗎？"** - 中期優化方案
4. **"考慮後端方案嗎？"** - 長期架構調整

---

**最後更新**：2024-12-29  
**狀態**：待處理  
**優先級**：高