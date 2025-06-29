'use client';

import React, { useState } from 'react';
import GoogleMapWithCircles from '../components/GoogleMapWithCircles';
import { SuumoProperty } from '../utils/suumoApi';

export default function Home() {
  const [properties, setProperties] = useState<SuumoProperty[]>([]);

  const handlePropertiesUpdate = (newProperties: SuumoProperty[]) => {
    setProperties(newProperties);
  };

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
        <div className="flex-1 bg-white border border-[#e5e5e5] shadow-sm">
          <div className="h-96 xl:h-[600px]">
            <GoogleMapWithCircles onPropertiesUpdate={handlePropertiesUpdate} />
          </div>
        </div>

        {/* 右側結果列表 */}
        <div className="w-full xl:w-80 bg-white border border-[#e5e5e5] shadow-sm p-8">
          <h3 className="text-xl font-light text-[#111111] mb-8 tracking-wide">
            検索結果
          </h3>
          
          {properties.length === 0 ? (
            <div className="text-center text-[#999999] font-light py-12">
              <div className="w-12 h-12 border border-[#e5e5e5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm tracking-wide">
                2つ以上の円を描いて
              </p>
              <p className="text-sm tracking-wide">
                交集区域を作成してください
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  className="border-b border-[#e5e5e5] pb-6 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-light text-[#111111] text-lg tracking-wide">{property.title}</h4>
                    <div className="text-right">
                      <span className="text-[#111111] font-medium text-lg">¥ {property.price}</span>
                      <div className="text-xs text-[#999999] font-light mt-1">{property.size}</div>
                    </div>
                  </div>
                  <p className="text-sm text-[#999999] mb-2 font-light tracking-wide">{property.location}</p>
                  {property.distance && (
                    <p className="text-xs text-[#666666] mb-4 font-light tracking-wide">{property.distance}</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {property.tags.map((tag) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
