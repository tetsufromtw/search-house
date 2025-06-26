import React from 'react';

export default function Page4() {
  return (
    <div className="min-h-screen bg-white">
      {/* 搜尋條 */}
      <div className="pt-12 pb-6">
        <div className="max-w-3xl mx-auto px-6">
          <div className="relative">
            <input
              type="text"
              placeholder="場所や住所を入力"
              className="w-full px-8 py-5 text-lg border border-[#e5e5e5] rounded-none shadow-sm focus:outline-none focus:border-[#111111] bg-white font-light tracking-wide"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#111111] hover:opacity-80 text-white px-8 py-3 rounded-none transition-opacity font-medium tracking-wide">
              検索
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 px-6 pb-8">
        {/* 左側過濾面板 */}
        <div className="w-full xl:w-80 bg-white border border-[#e5e5e5] shadow-sm p-8">
          <h3 className="text-xl font-light text-[#111111] mb-8 tracking-wide">
            検索条件
          </h3>
          
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-4 tracking-wide">価格帯</label>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  placeholder="最低価格" 
                  className="flex-1 px-4 py-3 border-[1px] border-[#e5e5e5] rounded-none focus:outline-none focus:border-[#111111] bg-white font-light" 
                />
                <input 
                  type="number" 
                  placeholder="最高価格" 
                  className="flex-1 px-4 py-3 border-[1px] border-[#e5e5e5] rounded-none focus:outline-none focus:border-[#111111] bg-white font-light" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-4 tracking-wide">間取り</label>
              <div className="space-y-3">
                {['ワンルーム', '1K・1DK', '1LDK・2K', '2LDK以上'].map((type) => (
                  <label key={type} className="flex items-center py-2 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" className="mr-4 w-4 h-4 text-[#111111] focus:ring-0 focus:ring-offset-0 border-[#e5e5e5] rounded-none" />
                    <span className="text-sm text-[#111111] font-light tracking-wide">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-4 tracking-wide">検索範囲</label>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.5" 
                className="w-full h-[2px] bg-[#e5e5e5] rounded-none appearance-none cursor-pointer" 
                style={{
                  background: `linear-gradient(to right, #111111 0%, #111111 50%, #e5e5e5 50%, #e5e5e5 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-[#999999] mt-2 font-light">
                <span>0.5km</span>
                <span>2.5km</span>
                <span>5km</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-4 tracking-wide">生活施設</label>
              <div className="space-y-3">
                {['駅', '商業施設', '学校', '病院', '公園', 'スーパー'].map((facility) => (
                  <label key={facility} className="flex items-center py-2 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" className="mr-4 w-4 h-4 text-[#111111] focus:ring-0 focus:ring-offset-0 border-[#e5e5e5] rounded-none" />
                    <span className="text-sm text-[#111111] font-light tracking-wide">{facility}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 中間地圖區域 */}
        <div className="flex-1 bg-white border border-[#e5e5e5] shadow-sm p-6">
          <div className="h-96 xl:h-full bg-[#ffffff] border border-[#e5e5e5] flex items-center justify-center">
            <div className="text-center text-[#111111]">
              <div className="w-16 h-16 border-2 border-[#e5e5e5] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-lg font-light text-[#111111] mb-2 tracking-wide">
                空間検索マップ
              </p>
              <p className="text-sm text-[#999999] font-light tracking-wide">
                多重条件検索システム
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <div className="w-2 h-2 bg-[#111111] rounded-full"></div>
                <div className="w-2 h-2 bg-[#999999] rounded-full"></div>
                <div className="w-2 h-2 bg-[#cccccc] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側結果列表 */}
        <div className="w-full xl:w-80 bg-white border border-[#e5e5e5] shadow-sm p-8">
          <h3 className="text-xl font-light text-[#111111] mb-8 tracking-wide">
            検索結果
          </h3>
          
          <div className="space-y-6">
            {[
              { 
                name: 'ミニマルスタジオ', 
                price: '180,000', 
                location: '東京都大田区建国南路', 
                tags: ['ワンルーム', '採光良好'], 
                size: '25㎡'
              },
              { 
                name: 'モダンアパートメント', 
                price: '280,000', 
                location: '東京都港区松仁路', 
                tags: ['1LDK', 'エレベーター'], 
                size: '50㎡'
              },
              { 
                name: 'デザイナーズ邸宅', 
                price: '350,000', 
                location: '東京都中山区中山北路', 
                tags: ['2LDK', 'リノベーション'], 
                size: '72㎡'
              },
              { 
                name: 'シンプル空間', 
                price: '165,000', 
                location: '東京都松山区南京東路', 
                tags: ['ワンルーム', '駅近'], 
                size: '23㎡'
              },
              { 
                name: 'アーバンレジデンス', 
                price: '320,000', 
                location: '東京都大同区承徳路', 
                tags: ['2LDK', '管理'], 
                size: '65㎡'
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="border-b border-[#e5e5e5] pb-6 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-light text-[#111111] text-lg tracking-wide">{item.name}</h4>
                  <div className="text-right">
                    <span className="text-[#111111] font-medium text-lg">¥ {item.price}</span>
                    <div className="text-xs text-[#999999] font-light mt-1">{item.size}</div>
                  </div>
                </div>
                <p className="text-sm text-[#999999] mb-4 font-light tracking-wide">{item.location}</p>
                <div className="flex gap-2 flex-wrap">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs text-[#111111] px-3 py-1 border border-[#e5e5e5] rounded-none font-light tracking-wide"
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