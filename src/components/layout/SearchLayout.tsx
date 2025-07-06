'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import Footer from './Footer';

interface SearchLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SearchLayout({
  children,
  className = ""
}: SearchLayoutProps) {
  return (
    <div className={`min-h-screen bg-white flex flex-col ${className}`}>
      {/* 簡單導航 */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-gray-900">
              🏠 Search House
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link 
                href="/multi-search" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                多重搜尋
              </Link>
              <Link 
                href="/leaflet-search" 
                className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1"
              >
                🗺️ 免費地圖
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                  零費用
                </span>
              </Link>
              <Link 
                href="/suumo-intersection-test" 
                className="text-gray-600 hover:text-orange-600 transition-colors flex items-center gap-1"
              >
                🏠 SUUMO測試
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                  今日重點
                </span>
              </Link>
              <Link 
                href="/analyze-suumo" 
                className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1"
              >
                🔍 頁面分析
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                  新功能
                </span>
              </Link>
              <Link 
                href="/suumo-modular-test" 
                className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                🧩 模組化 API
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                  工具化
                </span>
              </Link>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            基於 Next.js + TypeScript
          </div>
        </div>
      </nav>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}