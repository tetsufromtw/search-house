import React from 'react';

export default function Page2() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* 搜尋條 */}
      <div className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-8">
          <div className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-emerald-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-green-100/20"></div>
            <input
              type="text"
              placeholder="場所や住所を検索..."
              className="relative w-full px-10 py-8 text-2xl font-light border-0 rounded-3xl focus:outline-none focus:ring-4 focus:ring-emerald-300/50 bg-transparent tracking-wide placeholder-emerald-600/70"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-5 rounded-2xl font-medium tracking-wide transition-all shadow-lg">
              検索
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 px-8 pb-8">
        {/* 左側過濾面板 */}
        <div className="w-full xl:w-96 bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border border-emerald-200 p-8">
          <h3 className="text-2xl font-medium text-emerald-800 mb-8 tracking-wide flex items-center">
            <span className="mr-3 text-3xl">🌱</span>
            エコフィルター
          </h3>
          
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-4 tracking-wide flex items-center">
                <span className="mr-2">💰</span>
                価格帯
              </label>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  placeholder="最低価格" 
                  className="flex-1 px-4 py-4 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:border-emerald-500 bg-emerald-50/50 font-light text-lg backdrop-blur-sm" 
                />
                <input 
                  type="number" 
                  placeholder="最高価格" 
                  className="flex-1 px-4 py-4 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:border-emerald-500 bg-emerald-50/50 font-light text-lg backdrop-blur-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-4 tracking-wide flex items-center">
                <span className="mr-2">🏠</span>
                間取り
              </label>
              <div className="space-y-3">
                {[
                  { name: 'ワンルーム', icon: '🌿', desc: '一人暮らし向け' },
                  { name: '1K・1DK', icon: '🍃', desc: 'コンパクト生活' },
                  { name: '1LDK・2K', icon: '🌳', desc: 'ゆとり空間' },
                  { name: '2LDK以上', icon: '🌲', desc: 'ファミリー向け' }
                ].map((type) => (
                  <label key={type.name} className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 cursor-pointer rounded-2xl border border-emerald-200 transition-all">
                    <input type="checkbox" className="mr-4 w-5 h-5 text-emerald-600 focus:ring-emerald-500 rounded-lg" />
                    <span className="mr-3 text-xl">{type.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm text-emerald-800 font-medium block">{type.name}</span>
                      <span className="text-xs text-emerald-600">{type.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-4 tracking-wide flex items-center">
                <span className="mr-2">📍</span>
                検索範囲
              </label>
              <div className="relative">
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.5" 
                  className="w-full h-4 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-xs text-emerald-700 mt-2 font-medium">
                  <span>0.5km</span>
                  <span>2.5km</span>
                  <span>5km</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-4 tracking-wide flex items-center">
                <span className="mr-2">🌍</span>
                エコ施設
              </label>
              <div className="space-y-2">
                {[
                  { name: '公園・緑地', icon: '🌳', color: 'emerald' },
                  { name: 'オーガニック店', icon: '🥬', color: 'green' },
                  { name: '自転車道', icon: '🚴', color: 'teal' },
                  { name: 'リサイクル拠点', icon: '♻️', color: 'emerald' },
                  { name: '太陽光設備', icon: '☀️', color: 'amber' },
                  { name: '雨水利用', icon: '🌧️', color: 'blue' }
                ].map((facility) => (
                  <label key={facility.name} className="flex items-center p-3 hover:bg-emerald-50 cursor-pointer rounded-xl transition-colors">
                    <input type="checkbox" className="mr-3 w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded" />
                    <span className="mr-3 text-lg">{facility.icon}</span>
                    <span className="text-sm text-emerald-800 font-medium">{facility.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 中間地圖區域 */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border border-emerald-200 p-8">
          <div className="h-96 xl:h-full bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-medium text-emerald-700 border border-emerald-200 shadow-lg">
              🌍 エコマップ
            </div>
            <div className="text-center text-emerald-800 z-10">
              <div className="w-32 h-32 bg-white/80 rounded-full shadow-xl flex items-center justify-center mx-auto mb-8 border-4 border-emerald-300 backdrop-blur-sm">
                <span className="text-6xl">🌱</span>
              </div>
              <p className="text-3xl font-medium text-emerald-800 mb-4 tracking-wide">
                持続可能な住まい探し
              </p>
              <p className="text-lg text-emerald-600 font-light tracking-wide">
                環境に優しい物件を多重検索
              </p>
              <div className="mt-8 flex justify-center gap-3 flex-wrap">
                <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">グリーン物件</span>
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">自然環境重視</span>
                <span className="bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">エコライフ</span>
              </div>
            </div>
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-green-200/30 to-teal-200/30 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* 右側結果列表 */}
        <div className="w-full xl:w-96 bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border border-emerald-200 p-8">
          <h3 className="text-2xl font-medium text-emerald-800 mb-8 tracking-wide flex items-center">
            <span className="mr-3 text-3xl">🏡</span>
            グリーン物件
          </h3>
          
          <div className="space-y-6">
            {[
              { 
                name: 'エコアパートメント', 
                price: '160,000', 
                location: '東京都渋谷区代々木公園', 
                tags: ['太陽光', '緑化屋上'], 
                size: '35㎡',
                ecoRating: 5
              },
              { 
                name: 'ガーデンハウス', 
                price: '185,000', 
                location: '東京都世田谷区等々力', 
                tags: ['1LDK', 'オーガニック'], 
                size: '45㎡',
                ecoRating: 4
              },
              { 
                name: 'サステナブルレジデンス', 
                price: '140,000', 
                location: '東京都目黒区碑文谷', 
                tags: ['ワンルーム', '雨水利用'], 
                size: '28㎡',
                ecoRating: 5
              },
              { 
                name: 'グリーンコート', 
                price: '200,000', 
                location: '東京都杉並区善福寺', 
                tags: ['2LDK', '自然公園'], 
                size: '55㎡',
                ecoRating: 4
              },
              { 
                name: 'エコビレッジ', 
                price: '155,000', 
                location: '東京都練馬区石神井', 
                tags: ['1K', 'コミュニティ'], 
                size: '32㎡',
                ecoRating: 5
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all cursor-pointer p-6 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-emerald-900 text-lg tracking-wide">{item.name}</h4>
                  <div className="text-right">
                    <span className="text-emerald-600 font-bold text-xl">¥{item.price}</span>
                    <div className="text-xs text-emerald-500 font-medium mt-1">{item.size}</div>
                  </div>
                </div>
                <p className="text-sm text-emerald-700 mb-4 font-medium tracking-wide flex items-center">
                  <span className="mr-2">📍</span>
                  {item.location}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 flex-wrap">
                    {item.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="text-xs text-emerald-700 bg-white/80 px-3 py-1 rounded-full font-medium border border-emerald-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < item.ecoRating ? 'text-emerald-500' : 'text-emerald-200'}`}>
                        🌿
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}