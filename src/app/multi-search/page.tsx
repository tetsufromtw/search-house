'use client';

/**
 * 多需求地點搜尋測試頁面
 * 展示 useMultiLocationSearch Hook 的功能
 */

import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MultiSearchContainer } from '@/components/MultiSearchContainer';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

export default function MultiSearchPage() {
  console.log('🔑 Multi-search API Key check:', GOOGLE_API_KEY ? `已設定 (${GOOGLE_API_KEY.substring(0, 10)}...)` : '未設定');
  
  if (!GOOGLE_API_KEY) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">配置錯誤</h1>
          <p className="text-gray-700">
            Google Maps API Key 未設定。請檢查環境變數 NEXT_PUBLIC_GOOGLE_API_KEY。
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            當前環境變數: {process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? '已設定' : '未設定'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <APIProvider 
        apiKey={GOOGLE_API_KEY}
        libraries={['places']}
      >
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