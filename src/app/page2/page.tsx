import React from 'react';

export default function Page2() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 搜尋條 */}
      <div className="pt-8 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋地點或地址..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full shadow-lg focus:outline-none focus:border-emerald-600 bg-white"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full">
              搜尋
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4">
        {/* 左側過濾面板 */}
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🌿</span>
            篩選條件
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">價格範圍</label>
              <div className="flex gap-2">
                <input type="number" placeholder="最低價" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600" />
                <input type="number" placeholder="最高價" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">房型</label>
              <div className="space-y-2">
                {['套房', '1房1廳', '2房1廳', '3房以上'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input type="checkbox" className="mr-2 text-emerald-600 focus:ring-emerald-600 rounded" />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜尋半徑 (公里)</label>
              <input type="range" min="0.5" max="5" step="0.5" className="w-full h-2 bg-emerald-300 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0.5km</span>
                <span>5km</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">生活機能</label>
              <div className="space-y-2">
                {['捷運站', '超商', '市場', '公園'].map((facility) => (
                  <label key={facility} className="flex items-center">
                    <input type="checkbox" className="mr-2 text-emerald-600 focus:ring-emerald-600 rounded" />
                    <span className="text-sm text-gray-700">{facility}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 中間地圖區域 */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-4">
          <div className="h-96 lg:h-full bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">🌍</div>
              <p className="text-lg font-medium">生態友善地圖</p>
              <p className="text-sm mt-2">多圓交集搜尋 × 綠色生活圈</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs">公園綠地</span>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs">大眾運輸</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側結果列表 */}
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏡</span>
            搜尋結果
          </h3>
          
          <div className="space-y-4">
            {[
              { name: '綠意套房', price: '$16,000', location: '大安森林公園旁', tags: ['採光佳', '近公園'] },
              { name: '生態公寓', price: '$18,500', location: '信義區四四南村', tags: ['1房1廳', '文創區'] },
              { name: '環保宅邸', price: '$14,000', location: '中山區林森公園', tags: ['套房', '綠建築'] },
              { name: '自然居所', price: '$20,000', location: '士林區士林官邸', tags: ['2房1廳', '歷史區'] },
              { name: '清新套房', price: '$15,500', location: '松山區彩虹河濱', tags: ['河景', '運動場'] }
            ].map((item, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-emerald-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <span className="text-emerald-600 font-semibold">{item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.location}</p>
                <div className="flex gap-1 text-xs flex-wrap">
                  {item.tags.map((tag) => (
                    <span key={tag} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}