# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

此文件用於指導 Claude Code (claude.ai/code) 高效處理 search-house 專案中的程式碼與需求

## 專案名稱

search-house 基於 Next.js TypeScript Tailwind CSS 的交集租屋搜尋平台 主打多條件交集地圖搜尋與生活圈資訊整合

## 專案開發指令

* npm run dev 啟動開發伺服器（含熱重載）
* npm run build 建置生產版本
* npm run start 啟動生產伺服器
* npm run lint 執行 ESLint 靜態檢查

## 專案架構

### Context 與狀態管理

HouseSearchContext（src/context/HouseSearchContext.tsx）管理搜尋條件 多重交集篩選狀態 地圖互動與使用者偏好

### 核心元件

* MapCanvas 負責渲染可交互 Google Map 支援多個圓形區域繪製及交集計算
* SearchBar 多關鍵字與條件輸入元件 支援動態增減條件
* FilterPanel 顯示及調整交集半徑 類型 排序等篩選選項
* ListingPopup 點擊交集區域彈出附近租屋清單 串接外部租屋平台 API 或跳轉連結
* ResultList 右側顯示當前交集區域房源列表

### 資料層

* src/api 封裝外部租屋平台串接及地理資料查詢
* src/types 定義 TypeScript 型別 如交集區域 搜尋條件 房源資訊

### 特色功能

* 支援多個關鍵字條件同時繪製並計算地圖圓圈交集
* 自動根據交集區域呼叫 API 獲取並更新房源資料
* 搜尋條件可自由增減且即時反映於地圖及結果列表
* 響應式 UI 適合手機及桌面使用

## Claude 指令與行為準則

* 語言 全程使用繁體中文回應
* 回覆形式 只提供直接修改代碼 配置 架構建議或精準指令 避免不必要的說明或重複
* 風格 保持簡潔銳利 若用戶有口語或幽默風格 適當呼應
* 最佳實踐 建議採用模組化 高可維護性 擴展性好的設計模式 符合 FAANG 水準
* 不做 避免一次提供過多無關資訊 除非明確請求
* 交互 依用戶要求分段回覆 避免一次大量代碼

## 常見工作範圍

* 實作及優化多圓交集地圖繪製與計算演算法
* 搜尋條件動態管理與狀態同步
* 與租屋平台 API 的請求整合與錯誤處理
* UI UX 優化 動態結果顯示 彈窗交互
* 性能優化及響應式調整

## 開發階段指令流程建議

* 請根據分階段開發（Phase 1、Phase 2、Phase 3）完成各階段內容
* 任何 UIUX 都要以不同尺寸的螢幕去做可調整的彈性 絕對不要給我寫死
* 每完成一階段功能，需先產出可檢視的代碼並等待驗收
* 驗收通過後請記錄階段完成狀態（可在專案內新增簡短標註或註解）
* 驗收不通過，根據回饋修正並重新提交該階段代碼
* 僅在確認上一階段無誤後，才開始下一階段開發

## Phase 1 建議

* 實作 React page 基本排版
* 包含搜尋條、多圓交集地圖區域與結果列表以及過濾列表
* 其中 搜尋條可以像 google 首頁那樣 (但我覺得可以放上面一點點), 地圖區域在搜尋條下方, 然後網頁左側留空間擺過濾條件 右邊留空間擺顯示結果
* 使用 Tailwind CSS 實現靜態佈局（無功能）
* 總共做 4 個 page 讓我有辦法 localhost\:port/page1 localhost\:port/page2 localhost\:port/page3 localhost\:port/page4 去看不同的形象

### 形象設計

#### 專業穩重＋活力適中＋親和力強 (page1)

主色（Primary）：blue-600
輔色（Secondary）：blue-300
強調色（Accent）：orange-400
背景色（Background）：gray-100
文字色（Text）：gray-900
提示色（Feedback）成功：green-600，錯誤：red-600，警告：yellow-400
邊框色（Border）：gray-300
陰影色（Shadow）：shadow-md
互動色（Interactive）：hover\:blue-700，active\:blue-800，disabled\:gray-400
中性色（Neutral）：gray-500

#### 自然清新＋健康活力＋環保感 (page2)

主色（Primary）：emerald-600
輔色（Secondary）：emerald-300
強調色（Accent）：amber-400
背景色（Background）：gray-50
文字色（Text）：gray-900
提示色（Feedback）成功：green-700，錯誤：red-700，警告：yellow-500
邊框色（Border）：gray-200
陰影色（Shadow）：shadow-lg
互動色（Interactive）：hover\:emerald-700，active\:emerald-800，disabled\:gray-400
中性色（Neutral）：gray-600

#### 時尚活潑＋女性柔美＋科技感 (page3)

主色（Primary）：violet-600
輔色（Secondary）：violet-300
強調色（Accent）：pink-400
背景色（Background）：gray-100
文字色（Text）：gray-900
提示色（Feedback）成功：green-500，錯誤：red-500，警告：yellow-400
邊框色（Border）：gray-300
陰影色（Shadow）：shadow-md
互動色（Interactive）：hover\:violet-700，active\:violet-800，disabled\:gray-400
中性色（Neutral）：gray-500

#### 高級極簡＋建築感＋空間設計感 (page4)

主色（Primary）：#111111
輔色（Secondary）：#444444
強調色（Accent）：#999999
背景色（Background）：#ffffff
文字色（Text）：#111111
提示色（Feedback）成功：#198754，錯誤：#dc3545，警告：#ffc107
邊框色（Border）：#e5e5e5
陰影色（Shadow）：shadow-sm
互動色（Interactive）：hover\:opacity-80，active\:opacity-60，disabled\:opacity-40
中性色（Neutral）：#cccccc

以上的四頁的元件 除了排版外 你可以自行設計適合的 UIUX 或 icon
或是參考以下的設計
字體（Font）
標題字體："Playfair Display", serif 或 "DM Serif Display", serif
→ 帶有建築感的高對比襯線字體，展現優雅與空間美感

內文字體："Inter", sans-serif 或 "Noto Sans JP", sans-serif
→ 保持現代感與可讀性，適合長段落與表格資訊

📐 間距（Spacing & Layout）
使用 8pt grid system

保持大量 留白（White Space），避免元素過度擁擠

卡片元件間距建議：gap-6 ～ gap-8

邊距建議：p-6 ～ p-10，營造空氣感

🧊 元件樣式（Components）
按鈕：無圓角 (rounded-none) 或極小圓角 (rounded-sm)，border 明確，hover 時僅改變透明度或下底線

輸入框：細邊框 (border-[1px])，內填白 (bg-white) 與內距清晰 (px-4 py-2)，避免陰影

卡片 / 區塊背景：使用 bg-white + border border-[#e5e5e5] + shadow-sm

icon 設計風格：使用線性（outline）風格 icon，例如 Lucide 或 Heroicons outline 系列

🎨 視覺指導原則（Visual Principles）
整體視覺以「黑白灰階配比 + 留白感」為核心，類似高端室內設計網站風格

強調視覺層次與空間切分，善用 border、陰影與背景灰階對比

避免過多裝飾或色彩干擾，專注資訊呈現與互動清晰度
