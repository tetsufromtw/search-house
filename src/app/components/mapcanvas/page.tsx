'use client';

import Link from 'next/link';
import MapCanvas from '../../../components/MapCanvas';

export default function MapCanvasPage() {
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">MapCanvas 元件</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← 返回主頁
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">功能說明</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>點擊地圖任意位置會繪製一個半徑 500 公尺的圓圈</li>
              <li>圓圈顏色會按照預設順序循環變化</li>
              <li>圓圈填充透明度為 0.2，邊框更明顯</li>
              <li>地圖預設定位在台北市中心</li>
            </ul>
          </div>
          
          <div className="h-[600px] w-full">
            <MapCanvas />
          </div>
        </div>
      </div>
    </div>
  );
}