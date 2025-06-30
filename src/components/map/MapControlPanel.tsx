'use client';

import React from 'react';
import { RequirementCircle } from '../../utils/placesApi';
import { CircleData } from '../../context/SearchContext';
import { IntersectionArea } from '../../utils/intersectionUtils';
import { SuumoProperty } from '../../utils/suumoApi';

interface MapControlPanelProps {
  requirements: RequirementCircle[];
  circles: CircleData[];
  intersections: IntersectionArea[];
  properties: SuumoProperty[];
  loading?: boolean;
  onClearAll: () => void;
  className?: string;
}

export default function MapControlPanel({
  requirements,
  circles,
  intersections,
  properties,
  loading = false,
  onClearAll,
  className = ""
}: MapControlPanelProps) {
  return (
    <div className={`absolute top-4 left-4 bg-white p-4 rounded-none shadow-sm border border-[#e5e5e5] ${className}`}>
      <div className="text-sm text-[#111111] font-light mb-4">
        需求搜尋結果
      </div>
      
      {requirements.map((reqCircle) => (
        <div key={reqCircle.id} className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="inline-block w-3 h-3 rounded-full" 
              style={{ backgroundColor: reqCircle.color }}
            ></span>
            <span className="text-xs text-[#111111] font-medium">
              {reqCircle.requirement}
            </span>
          </div>
          <div className="text-xs text-[#999999] font-light ml-5">
            {reqCircle.places.length} 個地點
          </div>
        </div>
      ))}
      
      <div className="border-t border-[#e5e5e5] pt-3 mt-4">
        <div className="text-xs text-[#999999] font-light mb-2">
          總圓圈數: {circles.length}
        </div>
        <div className="text-xs text-[#999999] font-light mb-2">
          交集區域: {intersections.length}
        </div>
        <div className="text-xs text-[#999999] font-light mb-4">
          找到物件: {properties.length}
          {loading && <span className="ml-2">載入中...</span>}
        </div>
      </div>
      
      <button
        onClick={onClearAll}
        className="px-4 py-2 bg-[#111111] text-white rounded-none text-xs hover:opacity-80 transition-opacity font-light"
      >
        重新載入
      </button>
    </div>
  );
}