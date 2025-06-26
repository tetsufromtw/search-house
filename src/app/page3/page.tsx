import React from 'react';

export default function Page3() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-purple-100 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      {/* 搜尋條 */}
      <div className="relative pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-full border border-violet-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-200/30 via-pink-200/30 to-purple-200/30"></div>
            <input
              type="text"
              placeholder="場所や住所を検索..."
              className="relative w-full px-12 py-8 text-2xl font-light border-0 rounded-full focus:outline-none focus:ring-4 focus:ring-violet-300/50 bg-transparent tracking-wide placeholder-violet-600/70"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-violet-600 via-pink-500 to-purple-600 hover:from-violet-700 hover:via-pink-600 hover:to-purple-700 text-white px-10 py-5 rounded-full font-medium tracking-wide transition-all shadow-lg hover:shadow-xl">
              検索 ✨
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col xl:flex-row gap-8 px-8 pb-8">
        {/* 左側過濾面板 */}
        <div className="w-full xl:w-96 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-violet-200 p-8">
          <h3 className="text-2xl font-medium text-violet-800 mb-8 tracking-wide flex items-center">
            <span className="mr-3 text-3xl">✨</span>
            スマートフィルター
          </h3>
          
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-violet-700 mb-4 tracking-wide flex items-center">
                <span className="mr-2">💎</span>
                予算範囲
              </label>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  placeholder="最低価格" 
                  className="flex-1 px-4 py-4 border-2 border-violet-200 rounded-2xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 bg-violet-50/50 font-light text-lg backdrop-blur-sm" 
                />
                <input 
                  type="number" 
                  placeholder="最高価格" 
                  className="flex-1 px-4 py-4 border-2 border-violet-200 rounded-2xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 bg-violet-50/50 font-light text-lg backdrop-blur-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-violet-700 mb-4 tracking-wide flex items-center">
                <span className="mr-2">🏠</span>
                間取りタイプ
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'ワンルーム', icon: '💜', desc: 'おしゃれ一人暮らし' },
                  { name: '1K・1DK', icon: '💗', desc: 'コンパクト美空間' },
                  { name: '1LDK・2K', icon: '💖', desc: 'ゆとりライフ' },
                  { name: '2LDK以上', icon: '💝', desc: 'ラグジュアリー' }
                ].map((type) => (
                  <label key={type.name} className="flex flex-col p-4 bg-gradient-to-br from-violet-50 to-pink-50 hover:from-violet-100 hover:to-pink-100 cursor-pointer rounded-2xl border border-violet-200 transition-all hover:shadow-lg">
                    <div className="flex items-center mb-2">
                      <input type="checkbox" className="mr-3 w-5 h-5 text-violet-600 focus:ring-violet-500 rounded-lg" />
                      <span className="mr-2 text-xl">{type.icon}</span>
                      <span className="text-sm text-violet-800 font-medium">{type.name}</span>
                    </div>
                    <span className="text-xs text-violet-600 ml-8">{type.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-violet-700 mb-4 tracking-wide flex items-center">
                <span className="mr-2">🎯</span>
                検索範囲
              </label>
              <div className="relative">
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.5" 
                  className="w-full h-4 bg-gradient-to-r from-violet-300 via-pink-300 to-purple-300 rounded-full appearance-none cursor-pointer shadow-inner" 
                />
                <div className="flex justify-between text-xs text-violet-700 mt-2 font-medium">
                  <span>0.5km</span>
                  <span>2.5km</span>
                  <span>5km</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-violet-700 mb-4 tracking-wide flex items-center">
                <span className="mr-2">🌟</span>
                ライフスタイル
              </label>
              <div className="space-y-2">
                {[
                  { name: 'ファッション街', icon: '👗', color: 'violet' },
                  { name: 'カフェ文化', icon: '☕', color: 'pink' },
                  { name: 'ナイトライフ', icon: '🌃', color: 'purple' },
                  { name: 'アート空間', icon: '🎨', color: 'violet' },
                  { name: 'ビューティー', icon: '💄', color: 'pink' },
                  { name: 'テック環境', icon: '📱', color: 'purple' }
                ].map((style) => (
                  <label key={style.name} className="flex items-center p-3 hover:bg-gradient-to-r hover:from-violet-50 hover:to-pink-50 cursor-pointer rounded-xl transition-all">
                    <input type="checkbox" className="mr-3 w-4 h-4 text-violet-600 focus:ring-violet-500 rounded" />
                    <span className="mr-3 text-lg">{style.icon}</span>
                    <span className="text-sm text-violet-800 font-medium">{style.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 中間地圖區域 */}
        <div className="flex-1 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-violet-200 p-8">
          <div className="h-96 xl:h-full bg-gradient-to-br from-violet-200/50 via-pink-200/50 to-purple-200/50 rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-medium text-violet-700 border border-violet-200 shadow-lg flex items-center">
              <span className="mr-2">🤖</span>
              AIスマートマップ
            </div>
            <div className="text-center text-violet-800 z-10">
              <div className="w-40 h-40 bg-gradient-to-br from-white/90 to-violet-100/90 rounded-full shadow-2xl flex items-center justify-center mx-auto mb-8 border-4 border-violet-300 backdrop-blur-sm relative">
                <span className="text-7xl">🎯</span>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  AI
                </div>
              </div>
              <p className="text-3xl font-medium text-transparent bg-gradient-to-r from-violet-600 via-pink-600 to-purple-600 bg-clip-text mb-4 tracking-wide">
                ファッショナブル検索
              </p>
              <p className="text-lg text-violet-600 font-light tracking-wide">
                AI駆動 × パーソナライズド検索
              </p>
              <div className="mt-8 flex justify-center gap-3 flex-wrap">
                <span className="bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow">スマート推薦</span>
                <span className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow">パーソナライズ</span>
                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow">リアルタイム</span>
              </div>
            </div>
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* 右側結果列表 */}
        <div className="w-full xl:w-96 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-violet-200 p-8">
          <h3 className="text-2xl font-medium text-violet-800 mb-8 tracking-wide flex items-center">
            <span className="mr-3 text-3xl">💫</span>
            おすすめ物件
          </h3>
          
          <div className="space-y-6">
            {[
              { 
                name: 'ファッションロフト', 
                price: '220,000', 
                location: '東京都渋谷区表参道', 
                tags: ['デザイナーズ', 'ショッピング'], 
                size: '48㎡',
                gradient: 'from-violet-100 to-violet-50',
                priceColor: 'text-violet-600',
                rating: 5,
                features: ['スマートホーム', 'ウォークインクローゼット']
              },
              { 
                name: 'ピンクプリンセス', 
                price: '195,000', 
                location: '東京都港区青山', 
                tags: ['1LDK', '女性向け'], 
                size: '42㎡',
                gradient: 'from-pink-100 to-pink-50',
                priceColor: 'text-pink-600',
                rating: 4,
                features: ['セキュリティ充実', 'ジム付き']
              },
              { 
                name: 'テックガール', 
                price: '250,000', 
                location: '東京都港区六本木', 
                tags: ['スマートハウス', '2LDK'], 
                size: '65㎡',
                gradient: 'from-purple-100 to-purple-50',
                priceColor: 'text-purple-600',
                rating: 5,
                features: ['IoT完備', 'ルーフトップ']
              },
              { 
                name: 'アートスタジオ', 
                price: '178,000', 
                location: '東京都台東区上野', 
                tags: ['クリエイター', '高天井'], 
                size: '38㎡',
                gradient: 'from-violet-100 to-pink-100',
                priceColor: 'text-violet-600',
                rating: 4,
                features: ['自然光抜群', 'アトリエ空間']
              },
              { 
                name: 'ナイトビューペントハウス', 
                price: '210,000', 
                location: '東京都港区新橋', 
                tags: ['高層階', '夜景'], 
                size: '52㎡',
                gradient: 'from-pink-100 to-purple-100',
                priceColor: 'text-pink-600',
                rating: 5,
                features: ['パノラマビュー', 'コンシェルジュ']
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${item.gradient} hover:shadow-xl transition-all cursor-pointer p-6 rounded-2xl border border-white/50 backdrop-blur-sm hover:scale-105 hover:rotate-1`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900 text-lg tracking-wide">{item.name}</h4>
                  <div className="text-right">
                    <span className={`font-bold text-xl ${item.priceColor}`}>¥{item.price}</span>
                    <div className="text-xs text-gray-500 font-medium mt-1">{item.size}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4 font-medium tracking-wide flex items-center">
                  <span className="mr-2">📍</span>
                  {item.location}
                </p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs text-gray-700 bg-white/80 px-3 py-1 rounded-full font-medium backdrop-blur-sm border border-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    評価 {item.rating}/5
                  </div>
                </div>
                <div className="space-y-1">
                  {item.features.map((feature, i) => (
                    <div key={i} className="text-xs text-gray-600 flex items-center">
                      <span className="mr-2">✨</span>
                      {feature}
                    </div>
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