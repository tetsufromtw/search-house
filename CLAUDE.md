# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

此文件用於指導 Claude Code (claude.ai/code) 高效處理 search-house 專案中的程式碼與需求

## 專案名稱

search-house 基於 Next.js TypeScript Tailwind CSS 的交集租屋搜尋平台 主打多條件交集地圖搜尋與生活圈資訊整合

## 專案開發指令

- npm run dev 啟動開發伺服器（含熱重載）
- npm run build 建置生產版本
- npm run start 啟動生產伺服器
- npm run lint 執行 ESLint 靜態檢查

## 專案架構

### Context 與狀態管理

HouseSearchContext（src/context/HouseSearchContext.tsx）管理搜尋條件 多重交集篩選狀態 地圖互動與使用者偏好

### 核心元件

- MapCanvas 負責渲染可交互 Google Map 支援多個圓形區域繪製及交集計算
- SearchBar 多關鍵字與條件輸入元件 支援動態增減條件
- FilterPanel 顯示及調整交集半徑 類型 排序等篩選選項
- ListingPopup 點擊交集區域彈出附近租屋清單 串接外部租屋平台 API 或跳轉連結
- ResultList 右側顯示當前交集區域房源列表

### 資料層

- src/api 封裝外部租屋平台串接及地理資料查詢
- src/types 定義 TypeScript 型別 如交集區域 搜尋條件 房源資訊

### 特色功能

- 支援多個關鍵字條件同時繪製並計算地圖圓圈交集
- 自動根據交集區域呼叫 API 獲取並更新房源資料
- 搜尋條件可自由增減且即時反映於地圖及結果列表
- 響應式 UI 適合手機及桌面使用

## Claude 指令與行為準則

- 語言 全程使用繁體中文回應
- 回覆形式 只提供直接修改代碼 配置 架構建議或精準指令 避免不必要的說明或重複
- 風格 保持簡潔銳利 若用戶有口語或幽默風格 適當呼應
- 最佳實踐 建議採用模組化 高可維護性 擴展性好的設計模式 符合 FAANG 水準
- 不做 避免一次提供過多無關資訊 除非明確請求
- 交互 依用戶要求分段回覆 避免一次大量代碼

## 常見工作範圍

- 實作及優化多圓交集地圖繪製與計算演算法
- 搜尋條件動態管理與狀態同步
- 與租屋平台 API 的請求整合與錯誤處理
- UI UX 優化 動態結果顯示 彈窗交互
- 性能優化及響應式調整

## 開發階段指令流程建議

- 請根據分階段開發（Phase 1、Phase 2、Phase 3）完成各階段內容
- 任何 UIUX 都要以不同尺寸的螢幕去做可調整的彈性 絕對不要給我寫死
- 每完成一階段功能，需先產出可檢視的代碼並等待驗收
- 驗收通過後請記錄階段完成狀態（可在專案內新增簡短標註或註解）
- 驗收不通過，根據回饋修正並重新提交該階段代碼
- 僅在確認上一階段無誤後，才開始下一階段開發

## Phase 1 建議

- 實作 React page 基本排版
- 包含搜尋條、多圓交集地圖區域與結果列表以及過濾列表
- 其中 搜尋條可以像 google 首頁那樣 (但我覺得可以放上面一點點), 地圖區域在搜尋條下方, 然後網頁左側留空間擺過濾條件 右邊留空間擺顯示結果
- 使用 Tailwind CSS 實現靜態佈局（無功能）
- 總共做 3 個 page 讓我有辦法 localhost:port/page1 localhost:port/page2 localhost:port/page3 去看不同的形象

### 形象設計

- 專業穩重＋活力適中＋親和力強 (page1)
  主色（Primary）：blue-600
  輔色（Secondary）：blue-300
  強調色（Accent）：orange-400
  背景色（Background）：gray-100
  文字色（Text）：gray-900
  提示色（Feedback）成功：green-600，錯誤：red-600，警告：yellow-400
  邊框色（Border）：gray-300
  陰影色（Shadow）：shadow-md
  互動色（Interactive）：hover:blue-700，active:blue-800，disabled:gray-400
  中性色（Neutral）：gray-500

- 自然清新＋健康活力＋環保感
  主色（Primary）：emerald-600
  輔色（Secondary）：emerald-300
  強調色（Accent）：amber-400
  背景色（Background）：gray-50
  文字色（Text）：gray-900
  提示色（Feedback）成功：green-700，錯誤：red-700，警告：yellow-500
  邊框色（Border）：gray-200
  陰影色（Shadow）：shadow-lg
  互動色（Interactive）：hover:emerald-700，active:emerald-800，disabled:gray-400
  中性色（Neutral）：gray-600

- 時尚活潑＋女性柔美＋科技感
  主色（Primary）：violet-600
  輔色（Secondary）：violet-300
  強調色（Accent）：pink-400
  背景色（Background）：gray-100
  文字色（Text）：gray-900
  提示色（Feedback）成功：green-500，錯誤：red-500，警告：yellow-400
  邊框色（Border）：gray-300
  陰影色（Shadow）：shadow-md
  互動色（Interactive）：hover:violet-700，active:violet-800，disabled:gray-400
  中性色（Neutral）：gray-500

以上的三頁的元件 除了排版外 你可以自行設計適合的 UIUX 或 icon

## Phase 2 建議

- 增加搜尋條的動態狀態管理
- 支援動態新增、刪除搜尋條件
- 將條件同步至 Context

## Phase 3 建議

- 實作地圖多圓繪製及交集計算邏輯
- 連結外部租屋平台 API 並根據交集區域更新房源列表
- 加入彈窗顯示交集區域附近房源細節
