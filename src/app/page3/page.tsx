import React from 'react';

export default function Page3() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 搜尋條 */}
      <div className="pt-8 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋地點或地址..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl shadow-md focus:outline-none focus:border-violet-600 bg-white backdrop-blur-sm"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-violet-600 to-pink-400 hover:from-violet-700 hover:to-pink-500 text-white px-6 py-2 rounded-2xl transition-all">
              搜尋
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4">
        {/* 左側過濾面板 */}
        <div className="w-full lg:w-1/4 bg-white rounded-2xl shadow-md p-6 border-l-4 border-violet-600">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2 text-2xl">✨</span>
            智能篩選
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">預算區間</label>
              <div className="flex gap-2">
                <input type="number" placeholder="最低價" className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" />
                <input type="number" placeholder="最高價" className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">空間類型</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: '套房', icon: '🏠' },
                  { name: '1房1廳', icon: '🏡' },
                  { name: '2房1廳', icon: '🏘️' },
                  { name: '3房以上', icon: '🏰' }
                ].map((type) => (
                  <label key={type.name} className="flex items-center p-2 rounded-lg hover:bg-violet-50 cursor-pointer">
                    <input type="checkbox" className="mr-2 text-violet-600 focus:ring-violet-600 rounded" />
                    <span className="mr-1">{type.icon}</span>
                    <span className="text-sm text-gray-700">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜尋範圍</label>
              <div className="relative">
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.5" 
                  className="w-full h-3 bg-gradient-to-r from-violet-300 to-pink-300 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5km</span>
                  <span>2.5km</span>
                  <span>5km</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">生活風格</label>
              <div className="space-y-2">
                {[
                  { name: '時尚商圈', icon: '🛍️' },
                  { name: '咖啡文化', icon: '☕' },
                  { name: '夜生活', icon: '🌃' },
                  { name: '藝文空間', icon: '🎨' }
                ].map((style) => (
                  <label key={style.name} className="flex items-center p-2 rounded-lg hover:bg-violet-50 cursor-pointer">
                    <input type="checkbox" className="mr-2 text-violet-600 focus:ring-violet-600 rounded" />
                    <span className="mr-2">{style.icon}</span>
                    <span className="text-sm text-gray-700">{style.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 中間地圖區域 */}
        <div className="flex-1 bg-white rounded-2xl shadow-md p-4">
          <div className="h-96 lg:h-full bg-gradient-to-br from-violet-100 via-pink-50 to-purple-100 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-violet-700">
              智能地圖 AI
            </div>
            <div className="text-center text-gray-600 z-10">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-xl font-medium bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                時尚搜尋地圖
              </p>
              <p className="text-sm mt-2 text-gray-500">AI 驅動多圓交集搜尋</p>
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-medium">智能推薦</span>
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">個人化</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">即時更新</span>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full"></div>
          </div>
        </div>

        {/* 右側結果列表 */}
        <div className="w-full lg:w-1/4 bg-white rounded-2xl shadow-md p-6 border-r-4 border-pink-400">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2 text-2xl">💫</span>
            精選推薦
          </h3>
          
          <div className="space-y-4">
            {[
              { 
                name: '時尚 Loft', 
                price: '$22,000', 
                location: '東區忠孝復興', 
                tags: ['設計感', '商圈'], 
                gradient: 'from-violet-100 to-violet-50',
                priceColor: 'text-violet-600'
              },
              { 
                name: '粉色公主房', 
                price: '$19,500', 
                location: '信義區微風百貨', 
                tags: ['1房1廳', '購物'], 
                gradient: 'from-pink-100 to-pink-50',
                priceColor: 'text-pink-600'
              },
              { 
                name: '科技宅居', 
                price: '$25,000', 
                location: '內湖科學園區', 
                tags: ['智能家居', '2房'], 
                gradient: 'from-purple-100 to-purple-50',
                priceColor: 'text-purple-600'
              },
              { 
                name: '藝術小屋', 
                price: '$17,800', 
                location: '華山文創園區', 
                tags: ['文青', '採光'], 
                gradient: 'from-violet-100 to-pink-100',
                priceColor: 'text-violet-600'
              },
              { 
                name: '夜景套房', 
                price: '$21,000', 
                location: '信義區101附近', 
                tags: ['高樓層', '夜景'], 
                gradient: 'from-pink-100 to-purple-100',
                priceColor: 'text-pink-600'
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`border border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-r ${item.gradient} hover:scale-105`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <span className={`font-bold ${item.priceColor}`}>{item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <span className="mr-1">📍</span>
                  {item.location}
                </p>
                <div className="flex gap-1 text-xs flex-wrap">
                  {item.tags.map((tag) => (
                    <span key={tag} className="bg-white/60 text-gray-700 px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                      {tag}
                    </span>
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