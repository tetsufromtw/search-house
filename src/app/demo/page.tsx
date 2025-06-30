'use client';

import React from 'react';
import Link from 'next/link';
import SuumoApiTester from '../../components/SuumoApiTester';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* 返回按鈕 */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light tracking-wide"
          >
            ← 回到主頁面
          </Link>
        </div>

        {/* SUUMO API 測試器 */}
        <SuumoApiTester autoTrigger={true} />

        {/* 標題 */}
        <div className="mb-12 mt-12 text-center">
          <h1 className="text-3xl font-light text-[#111111] mb-4 tracking-wide">
            其他功能展示
          </h1>
          <p className="text-[#999999] font-light">
            更多功能組件和測試頁面
          </p>
        </div>

        {/* 功能卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* SUUMO API 測試 */}
          <div className="bg-white border border-[#e5e5e5] shadow-sm p-6">
            <h3 className="text-lg font-light text-[#111111] mb-4 tracking-wide">
              SUUMO API 測試
            </h3>
            <p className="text-sm text-[#999999] mb-4 font-light">
              測試 SUUMO 租屋資料 API 的整合功能
            </p>
            <button className="w-full px-4 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light text-sm">
              開始測試
            </button>
          </div>

          {/* 地圖元件測試 */}
          <div className="bg-white border border-[#e5e5e5] shadow-sm p-6">
            <h3 className="text-lg font-light text-[#111111] mb-4 tracking-wide">
              地圖元件測試
            </h3>
            <p className="text-sm text-[#999999] mb-4 font-light">
              測試 Google Maps 整合和圓圈繪製功能
            </p>
            <button className="w-full px-4 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light text-sm">
              開始測試
            </button>
          </div>

          {/* 組件展示 */}
          <div className="bg-white border border-[#e5e5e5] shadow-sm p-6">
            <h3 className="text-lg font-light text-[#111111] mb-4 tracking-wide">
              UI 組件展示
            </h3>
            <p className="text-sm text-[#999999] mb-4 font-light">
              展示各種模組化的 UI 組件
            </p>
            <button className="w-full px-4 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light text-sm">
              查看組件
            </button>
          </div>

          {/* API 狀態監控 */}
          <div className="bg-white border border-[#e5e5e5] shadow-sm p-6">
            <h3 className="text-lg font-light text-[#111111] mb-4 tracking-wide">
              API 狀態監控
            </h3>
            <p className="text-sm text-[#999999] mb-4 font-light">
              監控各種 API 的運作狀態和回應時間
            </p>
            <button className="w-full px-4 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light text-sm">
              查看狀態
            </button>
          </div>

          {/* 開發工具 */}
          <div className="bg-white border border-[#e5e5e5] shadow-sm p-6">
            <h3 className="text-lg font-light text-[#111111] mb-4 tracking-wide">
              開發工具
            </h3>
            <p className="text-sm text-[#999999] mb-4 font-light">
              各種開發和除錯用的工具和設定
            </p>
            <button className="w-full px-4 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light text-sm">
              開啟工具
            </button>
          </div>

          {/* 設定頁面 */}
          <div className="bg-white border border-[#e5e5e5] shadow-sm p-6">
            <h3 className="text-lg font-light text-[#111111] mb-4 tracking-wide">
              系統設定
            </h3>
            <p className="text-sm text-[#999999] mb-4 font-light">
              調整系統參數和功能設定
            </p>
            <button className="w-full px-4 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light text-sm">
              進入設定
            </button>
          </div>

        </div>

        {/* 系統資訊 */}
        <div className="mt-12 p-6 bg-gray-50 border border-[#e5e5e5]">
          <h3 className="text-lg font-light text-[#111111] mb-4 tracking-wide">
            系統資訊
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[#999999] font-light">專案版本:</span>
              <span className="ml-2 text-[#111111]">v0.1.0</span>
            </div>
            <div>
              <span className="text-[#999999] font-light">框架:</span>
              <span className="ml-2 text-[#111111]">Next.js 15</span>
            </div>
            <div>
              <span className="text-[#999999] font-light">狀態管理:</span>
              <span className="ml-2 text-[#111111]">React Context</span>
            </div>
            <div>
              <span className="text-[#999999] font-light">樣式:</span>
              <span className="ml-2 text-[#111111]">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}