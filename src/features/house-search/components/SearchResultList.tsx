/**
 * 搜尋結果列表組件
 * 顯示找到的房源物件
 */

'use client';

import React from 'react';
import { Property } from '../types';

interface SearchResultListProps {
  properties: Property[];
  isSearching: boolean;
  selectedProperty?: Property | null;
  onSelectProperty?: (property: Property) => void;
  onOpenProperty?: (property: Property) => void;
  className?: string;
}

export const SearchResultList: React.FC<SearchResultListProps> = ({
  properties,
  isSearching,
  selectedProperty,
  onSelectProperty,
  onOpenProperty,
  className = '',
}) => {
  const handlePropertyClick = (property: Property) => {
    onSelectProperty?.(property);
    
    if (property.url) {
      onOpenProperty?.(property);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 overflow-y-auto ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-900">🏠 搜尋結果</h3>
        {properties.length > 0 && (
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {properties.length} 個物件
          </span>
        )}
      </div>
      
      {isSearching ? (
        // 搜尋中狀態
        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-2"></div>
          <div className="text-sm">🔍 搜尋中...</div>
        </div>
      ) : properties.length > 0 ? (
        // 有結果時顯示列表
        <div className="space-y-3">
          {properties.map((property) => (
            <div 
              key={property.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedProperty?.id === property.id
                  ? 'border-green-300 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => handlePropertyClick(property)}
            >
              {/* 房源標題 */}
              <div className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                {property.title}
              </div>
              
              {/* 價格 */}
              <div className="text-green-700 font-semibold text-base mb-2">
                {property.price}
              </div>
              
              {/* 位置 */}
              <div className="text-gray-600 text-xs mb-2 flex items-center gap-1">
                <span>📍</span>
                <span className="line-clamp-1">{property.location}</span>
              </div>
              
              {/* 詳細資訊 */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                {property.size && (
                  <div className="flex items-center gap-1">
                    <span>📏</span>
                    <span>{property.size}</span>
                  </div>
                )}
                {property.layout && (
                  <div className="flex items-center gap-1">
                    <span>🏠</span>
                    <span>{property.layout}</span>
                  </div>
                )}
                {property.distance && (
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{property.distance}m</span>
                  </div>
                )}
              </div>
              
              {/* 標籤 */}
              {property.tags && property.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {property.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {property.tags.length > 3 && (
                    <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      +{property.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              {/* 操作按鈕 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {property.rating && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <span>⭐</span>
                      <span>{property.rating}</span>
                    </div>
                  )}
                </div>
                
                {property.url && (
                  <div className="text-blue-600 text-xs hover:text-blue-800 transition-colors">
                    點擊查看詳情 →
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 無結果狀態
        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
          <div className="text-gray-400 mb-2 text-2xl">🏠</div>
          <div className="text-sm text-center">
            <div className="font-medium">尚無搜尋結果</div>
            <div className="text-xs text-gray-400 mt-1">
              請先完成需求搜尋
            </div>
          </div>
        </div>
      )}

      {/* 載入更多 */}
      {properties.length > 0 && properties.length >= 20 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            載入更多結果...
          </button>
        </div>
      )}
      
      {/* 快速篩選 */}
      {properties.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">快速篩選:</div>
          <div className="flex flex-wrap gap-1">
            <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
              💰 低價位
            </button>
            <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
              🏠 大坪數
            </button>
            <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
              🚇 近車站
            </button>
          </div>
        </div>
      )}
    </div>
  );
};