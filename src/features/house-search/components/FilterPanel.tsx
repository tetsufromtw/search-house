/**
 * 篩選面板組件
 * 顯示交集區域、搜尋條件和使用說明
 */

'use client';

import React from 'react';
import { IntersectionArea } from '../types';

interface FilterPanelProps {
  intersectionAreas: IntersectionArea[];
  onSelectIntersection?: (area: IntersectionArea) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  intersectionAreas,
  onSelectIntersection,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 overflow-y-auto ${className}`}>
      <h3 className="font-semibold text-lg mb-3 text-gray-900">🔧 篩選條件</h3>
      
      {/* 交集區域資訊 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">🎯 交集區域</h4>
        {intersectionAreas.length > 0 ? (
          <div className="space-y-2">
            {intersectionAreas.slice(0, 5).map((area, index) => (
              <div 
                key={area.id} 
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  onSelectIntersection
                    ? 'border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300'
                    : 'border-orange-200 bg-orange-50'
                }`}
                onClick={() => onSelectIntersection?.(area)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-800 text-sm">
                    區域 {index + 1}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-xs text-gray-500">
                      評分
                    </div>
                    <div className="text-sm font-bold text-orange-600">
                      {(area.score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <div>半徑: {area.radius}m</div>
                  <div>需求: {area.requirements.join(', ')}</div>
                  <div>座標: {area.center.lat.toFixed(4)}, {area.center.lng.toFixed(4)}</div>
                </div>
                
                {/* 品質指標 */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${area.score * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {area.score >= 0.8 ? '優' : area.score >= 0.6 ? '良' : '可'}
                  </div>
                </div>
              </div>
            ))}
            
            {intersectionAreas.length > 5 && (
              <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 rounded">
                還有 {intersectionAreas.length - 5} 個區域...
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-gray-400 mb-2">📍</div>
            <div className="text-xs text-gray-500">
              尚無交集區域
            </div>
            <div className="text-xs text-gray-400 mt-1">
              請先完成搜尋
            </div>
          </div>
        )}
      </div>

      {/* 搜尋條件摘要 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">📋 搜尋條件</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-600">搜尋半徑</span>
            <span className="font-medium">1000m</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-600">最低品質</span>
            <span className="font-medium">50%</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-600">最大結果</span>
            <span className="font-medium">50 個</span>
          </div>
        </div>
      </div>

      {/* 使用說明 */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="font-medium text-blue-800 mb-2 text-sm">💡 使用說明</h4>
        <ul className="text-blue-700 text-xs space-y-1">
          <li>• 輸入至少2個需求開始搜尋</li>
          <li>• 橘色區域為需求交集範圍</li>
          <li>• 點擊交集區域可查看詳情</li>
          <li>• 自動搜尋該區域的租屋物件</li>
          <li>• 點擊房源可查看詳細資訊</li>
        </ul>
      </div>

      {/* 快速操作 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2 text-sm">⚡ 快速操作</h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            🎯 顯示最佳交集區域
          </button>
          <button className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            🏠 只顯示有房源的區域
          </button>
          <button className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            📊 按評分排序
          </button>
        </div>
      </div>
    </div>
  );
};