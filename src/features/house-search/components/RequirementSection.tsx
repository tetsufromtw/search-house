/**
 * 需求輸入區域組件
 * 管理所有需求輸入和搜尋控制
 */

'use client';

import React from 'react';
import { RequirementInput } from './RequirementInput';
import { RequirementState } from '../types';

interface RequirementSectionProps {
  requirements: RequirementState[];
  isSearching: boolean;
  canSearch: boolean;
  onUpdateRequirement: (id: string, query: string) => void;
  onToggleRequirement: (id: string) => void;
  onPerformSearch: () => void;
  onClearSearch: () => void;
}

export const RequirementSection: React.FC<RequirementSectionProps> = ({
  requirements,
  isSearching,
  canSearch,
  onUpdateRequirement,
  onToggleRequirement,
  onPerformSearch,
  onClearSearch,
}) => {
  const enabledRequirements = requirements.filter(req => req.requirement.enabled);
  const requirementsWithLocations = enabledRequirements.filter(req => req.requirement.locations.length > 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* 標題 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏠 租屋交集搜尋
        </h1>
        <p className="text-gray-600">
          輸入需求條件，找出最佳交集區域的租屋物件
        </p>
      </div>

      {/* 需求輸入網格 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {requirements.map((requirement, index) => (
          <RequirementInput
            key={requirement.requirement.id}
            requirement={requirement}
            index={index}
            onUpdate={onUpdateRequirement}
            onToggle={onToggleRequirement}
          />
        ))}
      </div>


      {/* 搜尋控制按鈕 */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onPerformSearch}
          disabled={!canSearch || isSearching}
          className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
            canSearch && !isSearching
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSearching ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>搜尋中...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>🚀</span>
              <span>開始搜尋</span>
            </div>
          )}
        </button>
        
        <button
          onClick={onClearSearch}
          disabled={isSearching}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <span>🧹</span>
            <span>清除</span>
          </div>
        </button>
      </div>

      {/* 搜尋提示 */}
      {!canSearch && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">💡</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">搜尋提示：</p>
              <ul className="text-blue-700 space-y-1">
                <li>• 至少輸入 2 個需求才能開始搜尋</li>
                <li>• 關鍵字可以是：商店名稱、設施類型、地標等</li>
                <li>• 例如：「星巴克」、「健身房」、「便利商店」</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};