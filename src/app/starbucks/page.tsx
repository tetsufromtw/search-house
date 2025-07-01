/**
 * Starbucks 搜尋測試頁面
 * 展示並行分頁處理、動態邊界監聽、圓圈顯示等功能
 */

'use client';

import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import StarbucksMapContainer from '../../containers/StarbucksMapContainer';

export default function StarbucksPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">API Key 未設定</h2>
          <p className="text-gray-600">
            請在 .env.local 中設定 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">☕ Starbucks 搜尋測試</h1>
              <p className="text-sm text-gray-600 mt-1">
                並行分頁處理 + 動態邊界監聽 + 藍色圓圈顯示
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← 回首頁
            </a>
          </div>
        </div>
      </div>

      {/* 功能說明 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">🚀 測試功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium">⚡ 並行分頁處理</h4>
              <p>同時處理 3 頁結果，從 4+ 秒降到 1-2 秒</p>
            </div>
            <div>
              <h4 className="font-medium">🗺️ 動態邊界監聽</h4>
              <p>拖拉或縮放地圖時自動搜尋新範圍</p>
            </div>
            <div>
              <h4 className="font-medium">🔵 藍色圓圈顯示</h4>
              <p>每個 Starbucks 顯示 500m 半徑圓圈</p>
            </div>
          </div>
        </div>

        {/* 地圖容器 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-[600px] w-full">
            <APIProvider apiKey={apiKey}>
              <StarbucksMapContainer
                className="w-full h-full"
                initialCenter={{ lat: 35.6762, lng: 139.6503 }} // 東京中心
                initialZoom={13}
              />
            </APIProvider>
          </div>
        </div>

        {/* 操作說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">📖 操作說明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">基本操作:</h4>
              <ul className="space-y-1">
                <li>• 拖拉地圖：自動搜尋新區域的 Starbucks</li>
                <li>• 縮放地圖：調整搜尋範圍大小</li>
                <li>• 點擊圓圈：顯示店家詳細資訊</li>
                <li>• 等待靜止：搜尋會在地圖停止移動後觸發</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">控制面板:</h4>
              <ul className="space-y-1">
                <li>• 🔍 手動搜尋：強制重新搜尋當前範圍</li>
                <li>• 顯示/隱藏圓圈：切換圓圈顯示狀態</li>
                <li>• 🗑️ 清除結果：清除所有搜尋結果</li>
                <li>• 實時統計：顯示可見/總計店家數量</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 技術特色 */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-900 mb-2">🔧 技術特色</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium">性能優化:</h4>
              <ul className="space-y-1">
                <li>• Promise.allSettled 並行分頁</li>
                <li>• 300ms 防抖動機制</li>
                <li>• 邊界內智能篩選</li>
                <li>• 5分鐘記憶體快取</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">使用者體驗:</h4>
              <ul className="space-y-1">
                <li>• 即時邊界監聽</li>
                <li>• 載入狀態指示</li>
                <li>• 錯誤處理回饋</li>
                <li>• 響應式控制面板</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}