import React from 'react';

export default function Page1() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* 搜尋條 */}
      <div className="pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-8">
          <div className="relative bg-white shadow-lg rounded-sm border border-gray-200">
            <input
              type="text"
              placeholder="場所や住所を検索..."
              className="w-full px-8 py-6 text-xl font-light border-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 bg-white tracking-wide"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-sm font-medium tracking-wide transition-colors">
              検索
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 px-8 pb-8">
        {/* 左側過濾面板 */}
        <div className="w-full xl:w-80 bg-white shadow-lg rounded-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-medium text-gray-800 mb-8 tracking-wide border-b border-blue-200 pb-4">
            フィルター条件
          </h3>
          
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">価格帯</label>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  placeholder="最低価格" 
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-sm focus:outline-none focus:border-blue-600 bg-white font-light text-lg" 
                />
                <input 
                  type="number" 
                  placeholder="最高価格" 
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-sm focus:outline-none focus:border-blue-600 bg-white font-light text-lg" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">間取り</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'ワンルーム', icon: '🏠' },
                  { name: '1K・1DK', icon: '🏡' },
                  { name: '1LDK・2K', icon: '🏘️' },
                  { name: '2LDK以上', icon: '🏢' }
                ].map((type) => (
                  <label key={type.name} className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-sm border border-blue-200 transition-colors">
                    <input type="checkbox" className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-600 rounded-sm" />
                    <span className="mr-2 text-lg">{type.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">検索範囲</label>
              <div className="relative">
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.5" 
                  className="w-full h-3 bg-blue-200 rounded-sm appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
                  <span>0.5km</span>
                  <span>2.5km</span>
                  <span>5km</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">生活施設</label>
              <div className="space-y-2">
                {[
                  { name: '駅近', icon: '🚇' },
                  { name: 'コンビニ', icon: '🏪' },
                  { name: 'スーパー', icon: '🛒' },
                  { name: '病院', icon: '🏥' },
                  { name: '学校', icon: '🏫' },
                  { name: '公園', icon: '🌳' }
                ].map((facility) => (
                  <label key={facility.name} className="flex items-center p-2 hover:bg-blue-50 cursor-pointer rounded-sm">
                    <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-600 rounded-sm" />
                    <span className="mr-2">{facility.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{facility.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 中間地圖區域 */}
        <div className="flex-1 bg-white shadow-lg rounded-sm border border-gray-200 p-6">
          <div className="h-96 xl:h-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-sm flex items-center justify-center relative">
            <div className="absolute top-6 left-6 bg-white/90 rounded-sm px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200">
              プロフェッショナル検索
            </div>
            <div className="text-center text-gray-700">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 border-4 border-blue-200">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-2xl font-medium text-gray-800 mb-3 tracking-wide">
                賃貸検索マップ
              </p>
              <p className="text-sm text-gray-600 font-light tracking-wide">
                多重条件交差検索システム
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-sm text-xs font-medium">高精度検索</span>
                <span className="bg-orange-400 text-white px-4 py-2 rounded-sm text-xs font-medium">リアルタイム</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側結果列表 */}
        <div className="w-full xl:w-80 bg-white shadow-lg rounded-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-medium text-gray-800 mb-8 tracking-wide border-b border-blue-200 pb-4">
            検索結果
          </h3>
          
          <div className="space-y-6">
            {[
              { 
                name: 'ビジネスマンション', 
                price: '180,000', 
                location: '東京都港区六本木', 
                tags: ['1K', '駅近'], 
                size: '25㎡'
              },
              { 
                name: 'エグゼクティブレジデンス', 
                price: '280,000', 
                location: '東京都千代田区丸の内', 
                tags: ['1LDK', '高層階'], 
                size: '45㎡'
              },
              { 
                name: 'プレミアムスイート', 
                price: '350,000', 
                location: '東京都中央区銀座', 
                tags: ['2LDK', '最上階'], 
                size: '65㎡'
              },
              { 
                name: 'コンパクトオフィス', 
                price: '165,000', 
                location: '東京都新宿区西新宿', 
                tags: ['ワンルーム', 'オフィス街'], 
                size: '22㎡'
              },
              { 
                name: 'シティタワー', 
                price: '320,000', 
                location: '東京都渋谷区恵比寿', 
                tags: ['2LDK', 'タワー'], 
                size: '58㎡'
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="border-l-4 border-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer p-5 rounded-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900 text-lg tracking-wide">{item.name}</h4>
                  <div className="text-right">
                    <span className="text-blue-600 font-bold text-xl">¥{item.price}</span>
                    <div className="text-xs text-gray-500 font-medium mt-1">{item.size}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 font-medium tracking-wide">{item.location}</p>
                <div className="flex gap-2 flex-wrap">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs text-blue-700 bg-white px-3 py-1 rounded-sm font-medium border border-blue-200"
                    >
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