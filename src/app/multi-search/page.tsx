'use client';

/**
 * 多需求地點搜尋測試頁面
 * 展示 useMultiLocationSearch Hook 的功能
 */

import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MultiSearchContainer } from '@/components/MultiSearchContainer';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function MultiSearchPage() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">配置錯誤</h1>
          <p className="text-gray-700">
            Google Maps API Key 未設定。請檢查環境變數 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              多需求地點搜尋測試
            </h1>
            <p className="text-gray-600">
              同時搜尋 Starbucks、健身房、便利商店，支援不同顏色圓圈顯示
            </p>
          </div>
          
          <MultiSearchContainer />
        </div>
      </APIProvider>
    </div>
  );
}