'use client';

import React from 'react';
import { SearchFilters } from '../../context/SearchContext';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  className?: string;
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  className = ""
}: FilterPanelProps) {
  const roomTypes = ['ワンルーム', '1K・1DK', '1LDK・2K', '2LDK以上'];
  const facilities = ['駅', '商業施設', '学校', '病院', '公園', 'スーパー'];

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    onFiltersChange({
      priceRange: {
        ...filters.priceRange,
        [type]: numValue
      }
    });
  };

  const handleRoomTypeChange = (roomType: string, checked: boolean) => {
    const newRoomTypes = checked
      ? [...filters.roomTypes, roomType]
      : filters.roomTypes.filter(type => type !== roomType);
    
    onFiltersChange({ roomTypes: newRoomTypes });
  };

  const handleFacilityChange = (facility: string, checked: boolean) => {
    const newFacilities = checked
      ? [...filters.facilities, facility]
      : filters.facilities.filter(f => f !== facility);
    
    onFiltersChange({ facilities: newFacilities });
  };

  const handleRadiusChange = (value: string) => {
    onFiltersChange({ searchRadius: parseFloat(value) });
  };

  return (
    <div className={`w-full xl:w-80 bg-white border border-[#e5e5e5] shadow-sm p-8 ${className}`}>
      <h3 className="text-xl font-light text-[#111111] mb-8 tracking-wide">
        検索条件
      </h3>
      
      <div className="space-y-8">
        {/* 價格範圍 */}
        <div>
          <label className="block text-sm font-medium text-[#111111] mb-4 tracking-wide">
            価格帯
          </label>
          <div className="flex gap-4">
            <input 
              type="number" 
              placeholder="最低価格"
              value={filters.priceRange.min || ''}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="flex-1 px-4 py-3 border-[1px] border-[#e5e5e5] rounded-none focus:outline-none focus:border-[#111111] bg-white font-light" 
            />
            <input 
              type="number" 
              placeholder="最高価格"
              value={filters.priceRange.max || ''}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="flex-1 px-4 py-3 border-[1px] border-[#e5e5e5] rounded-none focus:outline-none focus:border-[#111111] bg-white font-light" 
            />
          </div>
        </div>

        {/* 間取り */}
        <div>
          <label className="block text-sm font-medium text-[#111111] mb-4 tracking-wide">
            間取り
          </label>
          <div className="space-y-3">
            {roomTypes.map((type) => (
              <label key={type} className="flex items-center py-2 hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.roomTypes.includes(type)}
                  onChange={(e) => handleRoomTypeChange(type, e.target.checked)}
                  className="mr-4 w-4 h-4 text-[#111111] focus:ring-0 focus:ring-offset-0 border-[#e5e5e5] rounded-none" 
                />
                <span className="text-sm text-[#111111] font-light tracking-wide">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 搜尋範圍 */}
        <div>
          <label className="block text-sm font-medium text-[#111111] mb-4 tracking-wide">
            検索範囲
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.5"
            value={filters.searchRadius}
            onChange={(e) => handleRadiusChange(e.target.value)}
            className="w-full h-[2px] bg-[#e5e5e5] rounded-none appearance-none cursor-pointer" 
            style={{
              background: `linear-gradient(to right, #111111 0%, #111111 ${(filters.searchRadius - 0.5) / 4.5 * 100}%, #e5e5e5 ${(filters.searchRadius - 0.5) / 4.5 * 100}%, #e5e5e5 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#999999] mt-2 font-light">
            <span>0.5km</span>
            <span className="font-medium text-[#111111]">{filters.searchRadius}km</span>
            <span>5km</span>
          </div>
        </div>

        {/* 生活施設 */}
        <div>
          <label className="block text-sm font-medium text-[#111111] mb-4 tracking-wide">
            生活施設
          </label>
          <div className="space-y-3">
            {facilities.map((facility) => (
              <label key={facility} className="flex items-center py-2 hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.facilities.includes(facility)}
                  onChange={(e) => handleFacilityChange(facility, e.target.checked)}
                  className="mr-4 w-4 h-4 text-[#111111] focus:ring-0 focus:ring-offset-0 border-[#e5e5e5] rounded-none" 
                />
                <span className="text-sm text-[#111111] font-light tracking-wide">{facility}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}