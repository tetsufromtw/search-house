'use client';

import React from 'react';
import { SearchProvider, useSearch } from '../context/SearchContext';  
import SearchLayout from '../components/layout/SearchLayout';
import SearchBar from '../components/ui/SearchBar';
import PropertyList from '../components/ui/PropertyList';
import MapContainer from './MapContainer';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { SuumoProperty } from '../utils/suumoApi';

function SearchContent() {
  const { state, actions } = useSearch();

  // 處理物件搜尋
  usePropertySearch(
    state.intersections,
    state.filters,
    actions.setProperties
  );

  const handleSearch = () => {
    console.log('Search query:', state.searchQuery);
    // 這裡可以加入搜尋邏輯
  };

  const handlePropertyClick = (property: SuumoProperty) => {
    console.log('Property clicked:', property);
    // 這裡可以加入點擊物件的邏輯
  };

  return (
    <SearchLayout>
      <SearchBar
        value={state.searchQuery}
        onChange={actions.setSearchQuery}
        onSearch={handleSearch}
        disabled={state.loading}
      />

      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 pb-6 sm:pb-8">
        <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0">
          {/* 左側區塊預留位置 */}
          <div className="h-full min-h-96 bg-gray-50 border border-gray-200 rounded-none p-6 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-sm font-light">篩選功能</p>
              <p className="text-xs mt-1">開發中...</p>
            </div>
          </div>
        </div>

        <MapContainer className="min-h-0" />

        <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0">
          <PropertyList
            properties={state.properties}
            loading={state.loading}
            onPropertyClick={handlePropertyClick}
          />
        </div>
      </div>
    </SearchLayout>
  );
}

export default function SearchContainer() {
  return (
    <SearchProvider>
      <SearchContent />
    </SearchProvider>
  );
}