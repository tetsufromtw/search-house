'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// 動態載入 Leaflet 組件避免 SSR 問題
const LeafletMap = dynamic(() => import('@/components/leaflet/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-gray-600 font-medium">載入地圖中...</div>
    </div>
  )
});

export default function ShadcnPage() {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  const toggleRightPanel = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId) 
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50">
      {/* 上容器 - 10% */}
      <div className="flex-[1] bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl m-4 flex items-center justify-center relative shadow-sm">
        <div className="text-black text-xl font-semibold tracking-tight">
          黑白簡約風格
        </div>
      </div>

      {/* 中容器 - 80% */}
      <div className="flex-[8] relative mx-4 mb-2">
        {/* Leaflet OSM 地圖區域 - 完全獨立，不受狀態影響 */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
          <LeafletMap
            center={[35.6762, 139.6503]} // 東京車站
            zoom={13}
            tileStyle="cartodb-light"
            className="w-full h-full"
          />
        </div>

        {/* 黑白簡約搜尋框 - 浮動在地圖上 */}
        <div className={`absolute top-8 z-30 transition-all duration-500 ease-out ${
          leftPanelCollapsed 
            ? 'left-24' 
            : 'left-[calc(20%+3rem)]'
        }`}>
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden min-w-[420px] max-w-[520px]">
            {/* 主搜尋框 */}
            <div className="flex items-center p-5">
              <div className="flex items-center justify-center w-11 h-11 bg-gray-100/60 rounded-xl mr-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜尋地點或地址..."
                className="flex h-11 w-full bg-transparent px-4 py-3 text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/20 border-0 font-medium"
              />
              <button className="inline-flex items-center justify-center transition-all duration-200 hover:bg-gray-100/60 rounded-xl h-11 w-11">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 分隔線 */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            
            {/* 快速選項 */}
            <div className="p-4 space-y-2">
              <div className="flex items-center space-x-4 p-4 hover:bg-gray-50/80 cursor-pointer transition-all duration-200 rounded-xl">
                <div className="w-10 h-10 bg-gray-100/60 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-black tracking-tight">附近的餐廳</div>
                  <div className="text-xs text-gray-500 font-medium">尋找附近美食</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 hover:bg-gray-50/80 cursor-pointer transition-all duration-200 rounded-xl">
                <div className="w-10 h-10 bg-gray-100/60 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm2 10a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-black tracking-tight">便利商店</div>
                  <div className="text-xs text-gray-500 font-medium">24小時營業</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中間偏底部的半透明卡片 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
          {/* 第一個卡片 */}
          <div className="w-[calc(25vh*0.8)] h-[25vh] bg-white/20 backdrop-blur-sm border border-gray-200/30 rounded-2xl shadow-md p-6 hover:bg-white/30 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center">
            <div className="text-black text-sm font-semibold tracking-tight text-center">
              卡片 1
            </div>
          </div>

          {/* 第二個卡片 */}
          <div className="w-[calc(25vh*0.8)] h-[25vh] bg-white/20 backdrop-blur-sm border border-gray-200/30 rounded-2xl shadow-md p-6 hover:bg-white/30 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center">
            <div className="text-black text-sm font-semibold tracking-tight text-center">
              卡片 2
            </div>
          </div>

          {/* 第三個卡片 */}
          <div className="w-[calc(25vh*0.8)] h-[25vh] bg-white/20 backdrop-blur-sm border border-gray-200/30 rounded-2xl shadow-md p-6 hover:bg-white/30 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center">
            <div className="text-black text-sm font-semibold tracking-tight text-center">
              卡片 3
            </div>
          </div>
        </div>

        {/* 左區域 - Apple風格 */}
        <div className={`absolute top-0 left-0 h-full bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl z-10 transition-all duration-500 ease-out shadow-sm ${
          leftPanelCollapsed ? 'w-16' : 'w-[20%]'
        }`}>
          {/* 左區域內容容器 */}
          <div className={`h-full w-full flex flex-col p-4 transition-all duration-500 ${
            leftPanelCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            {!leftPanelCollapsed && (
              <div className="h-full bg-gray-50/50 rounded-xl border border-gray-200/30 p-4 overflow-y-auto">
                {/* こだわり条件タイトル */}
                <div className="text-black text-lg font-semibold tracking-tight mb-4 text-center border-b border-gray-200/50 pb-3">
                  こだわり条件
                  {selectedConditions.length > 0 && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      {selectedConditions.length}
                    </span>
                  )}
                </div>

                {/* こだわり条件選項 */}
                <div className="space-y-2">
                  {/* 家賃・初期費用 */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 tracking-tight">家賃・初期費用</div>
                    
                    {[
                      { id: 'rent-low', title: '家賃5万円以下', desc: '低価格物件' },
                      { id: 'rent-mid', title: '家賃10万円以下', desc: '中価格帯物件' },
                      { id: 'no-reikin', title: '礼金なし', desc: '初期費用削減' },
                      { id: 'no-shikikin', title: '敷金なし', desc: '初期費用削減' },
                      { id: 'no-tesuuryou', title: '仲介手数料なし', desc: '手数料無料' }
                    ].map(condition => (
                      <div 
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          selectedConditions.includes(condition.id) 
                            ? 'bg-blue-500 border-blue-600 text-white' 
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/30 hover:bg-white/80'
                        }`}
                      >
                        <div className={`text-sm font-semibold tracking-tight ${
                          selectedConditions.includes(condition.id) ? 'text-white' : 'text-black'
                        }`}>
                          {condition.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          selectedConditions.includes(condition.id) ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {condition.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 建物・設備 */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 tracking-tight">建物・設備</div>
                    
                    {[
                      { id: 'new-building', title: '新築', desc: '築1年未満' },
                      { id: '築5年以内', title: '築5年以内', desc: '比較的新しい' },
                      { id: 'bath-toilet-sep', title: 'バス・トイレ別', desc: '独立洗面台' },
                      { id: 'aircon', title: 'エアコン付き', desc: '設備充実' },
                      { id: 'auto-lock', title: 'オートロック', desc: 'セキュリティ重視' },
                      { id: 'elevator', title: 'エレベーター', desc: '3階以上推奨' },
                      { id: 'delivery-box', title: '宅配ボックス', desc: '受取便利' },
                      { id: 'intercom', title: 'TVインターホン', desc: '来客確認' },
                      { id: 'flooring', title: 'フローリング', desc: '洋室タイプ' },
                      { id: 'system-kitchen', title: 'システムキッチン', desc: '料理環境良好' }
                    ].map(condition => (
                      <div 
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer mb-2 ${
                          selectedConditions.includes(condition.id) 
                            ? 'bg-blue-500 border-blue-600 text-white' 
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/30 hover:bg-white/80'
                        }`}
                      >
                        <div className={`text-sm font-semibold tracking-tight ${
                          selectedConditions.includes(condition.id) ? 'text-white' : 'text-black'
                        }`}>
                          {condition.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          selectedConditions.includes(condition.id) ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {condition.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 立地・環境 */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 tracking-tight">立地・環境</div>
                    
                    {[
                      { id: 'station-5min', title: '駅徒歩5分以内', desc: '駅近物件' },
                      { id: 'station-10min', title: '駅徒歩10分以内', desc: '通勤便利' },
                      { id: 'south-facing', title: '南向き', desc: '日当たり良好' },
                      { id: 'corner-room', title: '角部屋', desc: '採光・通風良好' },
                      { id: 'top-floor', title: '最上階', desc: '上階音なし' },
                      { id: 'balcony', title: 'バルコニー', desc: '洗濯・収納' },
                      { id: 'parking', title: '駐車場あり', desc: '車所有者向け' },
                      { id: 'convenience-store', title: 'コンビニ近い', desc: '生活便利' }
                    ].map(condition => (
                      <div 
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer mb-2 ${
                          selectedConditions.includes(condition.id) 
                            ? 'bg-blue-500 border-blue-600 text-white' 
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/30 hover:bg-white/80'
                        }`}
                      >
                        <div className={`text-sm font-semibold tracking-tight ${
                          selectedConditions.includes(condition.id) ? 'text-white' : 'text-black'
                        }`}>
                          {condition.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          selectedConditions.includes(condition.id) ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {condition.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ライフスタイル */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 tracking-tight">ライフスタイル</div>
                    
                    {[
                      { id: 'pet-ok', title: 'ペット可', desc: '犬・猫相談' },
                      { id: 'instrument-ok', title: '楽器可', desc: '防音対策' },
                      { id: 'designer', title: 'デザイナーズ', desc: 'おしゃれ物件' },
                      { id: 'furnished', title: '家具付き', desc: '即入居可能' },
                      { id: 'women-only', title: '女性限定', desc: 'レディース物件' },
                      { id: 'student-ok', title: '学生可', desc: '学生歓迎' },
                      { id: 'foreigners-ok', title: '外国人可', desc: '国際対応' },
                      { id: 'share-house', title: 'シェアハウス', desc: '共同生活' }
                    ].map(condition => (
                      <div 
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer mb-2 ${
                          selectedConditions.includes(condition.id) 
                            ? 'bg-blue-500 border-blue-600 text-white' 
                            : 'bg-white/60 backdrop-blur-sm border-gray-200/30 hover:bg-white/80'
                        }`}
                      >
                        <div className={`text-sm font-semibold tracking-tight ${
                          selectedConditions.includes(condition.id) ? 'text-white' : 'text-black'
                        }`}>
                          {condition.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          selectedConditions.includes(condition.id) ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {condition.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 收縮/展開按鈕 */}
          <button
            onClick={toggleLeftPanel}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 inline-flex items-center justify-center transition-all duration-300 focus:outline-none bg-white/90 backdrop-blur-md border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 h-10 w-10 rounded-full shadow-md hover:border-gray-300/70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              {leftPanelCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* 右區域 - Apple風格 */}
        <div className={`absolute top-0 right-0 h-full bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 ease-out shadow-sm ${
          rightPanelCollapsed ? 'w-16' : 'w-[20%]'
        }`}>
          {/* 右區域內容 */}
          <div className={`text-black text-sm font-semibold tracking-tight transition-all duration-500 ${
            rightPanelCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            {!rightPanelCollapsed && '右側面板'}
          </div>

          {/* 收縮/展開按鈕 */}
          <button
            onClick={toggleRightPanel}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 inline-flex items-center justify-center transition-all duration-300 focus:outline-none bg-white/90 backdrop-blur-md border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 h-10 w-10 rounded-full shadow-md hover:border-gray-300/70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              {rightPanelCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 下容器 - 10% */}
      <div className="flex-[1] bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl mx-4 mb-4 flex items-center justify-center shadow-sm">
        <div className="text-black text-lg font-semibold tracking-tight">
          底部狀態列
        </div>
      </div>
    </div>
  );
}