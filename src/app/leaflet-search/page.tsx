'use client';

/**
 * Leaflet 多重搜尋頁面
 * 完全免費的 Google Maps 替代方案
 */

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// 動態載入 Leaflet 元件避免 SSR 問題
const LeafletMultiSearchContainer = dynamic(
  () => import('@/components/leaflet/LeafletMultiSearchContainer'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🗺️</div>
          <div className="text-gray-600">載入 Leaflet 地圖中...</div>
        </div>
      </div>
    )
  }
);

export default function LeafletSearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← 回到首頁
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                🗺️ Leaflet 多重搜尋
              </h1>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                💰 完全免費
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                🚀 零 API 費用
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main>
        <LeafletMultiSearchContainer />
      </main>

      {/* 頁腳說明 */}
      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              🌍 使用 <strong>Leaflet + OpenStreetMap</strong> 提供完全免費的地圖服務
            </p>
            <p className="space-x-4">
              <span>📍 OSM 地點搜尋</span>
              <span>⭐ 交集計算</span>
              <span>🏠 SUUMO 租屋整合</span>
              <span>💰 零 Google API 費用</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}