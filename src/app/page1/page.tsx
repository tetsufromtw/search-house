import React from 'react';

export default function Page1() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 搜尋條 */}
      <div className="pt-8 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋地點或地址..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full shadow-md focus:outline-none focus:border-blue-600 bg-white"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full">
              搜尋
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4">
        {/* 左側過濾面板 */}
        <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">篩選條件</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">價格範圍</label>
              <div className="flex gap-2">
                <input type="number" placeholder="最低價" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600" />
                <input type="number" placeholder="最高價" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">房型</label>
              <div className="space-y-2">
                {['套房', '1房1廳', '2房1廳', '3房以上'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input type="checkbox" className="mr-2 text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜尋半徑 (公里)</label>
              <input type="range" min="0.5" max="5" step="0.5" className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5km</span>
                <span>5km</span>
              </div>
            </div>
          </div>
        </div>

        {/* 中間地圖區域 */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <div className="h-96 lg:h-full bg-gray-200 rounded-md flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🗺️</div>
              <p>Google Map 地圖區域</p>
              <p className="text-sm mt-2">多圓交集搜尋功能</p>
            </div>
          </div>
        </div>

        {/* 右側結果列表 */}
        <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">搜尋結果</h3>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">溫馨套房 {item}</h4>
                  <span className="text-blue-600 font-semibold">$15,000</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">台北市信義區信義路五段</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">套房</span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">10坪</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}