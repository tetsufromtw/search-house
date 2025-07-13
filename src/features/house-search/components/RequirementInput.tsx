/**
 * 需求輸入組件
 * 處理單個需求的輸入和狀態顯示
 */

'use client';

import React, { useState, useCallback } from 'react';
import { RequirementState } from '../types';
import { CONFIG } from '../config';

interface RequirementInputProps {
  requirement: RequirementState;
  index: number;
  onUpdate: (id: string, query: string) => void;
  onToggle: (id: string) => void;
}

export const RequirementInput: React.FC<RequirementInputProps> = ({
  requirement,
  index,
  onUpdate,
  onToggle,
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只更新需求狀態，不做任何其他操作
    onUpdate(requirement.requirement.id, value);
  }, [requirement.requirement.id, onUpdate]);

  const handleToggleEnabled = useCallback(() => {
    onToggle(requirement.requirement.id);
  }, [requirement.requirement.id, onToggle]);

  return (
    <div className="space-y-2">
      {/* 需求標題與開關 */}
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded-full border-2 border-gray-300"
          style={{ 
            backgroundColor: requirement.requirement.enabled ? requirement.requirement.color : 'transparent',
            borderColor: requirement.requirement.color,
          }}
        />
        <label className="text-sm font-medium text-gray-700">
          需求 {index + 1}
        </label>
        <button
          onClick={handleToggleEnabled}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            requirement.requirement.enabled 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {requirement.requirement.enabled ? '✓ 啟用' : '✕ 停用'}
        </button>
        
        {/* 地點數量顯示 */}
        {requirement.requirement.enabled && requirement.requirement.locations.length > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {requirement.requirement.locations.length} 個地點
          </span>
        )}
      </div>
      
      {/* 輸入框 */}
      <input
        type="text"
        placeholder="例如：星巴克、健身房、便利商店"
        value={requirement.requirement.query}
        onChange={handleInputChange}
        disabled={!requirement.requirement.enabled || requirement.loading}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
          requirement.error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        } ${
          !requirement.requirement.enabled 
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
            : 'bg-white'
        }`}
      />
      
      {/* 錯誤訊息 */}
      {requirement.error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠️</span>
          {requirement.error}
        </p>
      )}
      
      {/* 載入狀態 */}
      {requirement.loading && (
        <p className="text-xs text-blue-600 flex items-center gap-1">
          <span className="text-blue-500">🔄</span>
          搜尋中...
        </p>
      )}
      
      {/* 地點預覽 */}
      {requirement.requirement.enabled && requirement.requirement.locations.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">找到的地點:</div>
          <div className="flex flex-wrap gap-1">
            {requirement.requirement.locations.slice(0, 3).map((location, idx) => (
              <span
                key={location.id}
                className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
              >
                {location.name}
              </span>
            ))}
            {requirement.requirement.locations.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded">
                +{requirement.requirement.locations.length - 3} 個
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};