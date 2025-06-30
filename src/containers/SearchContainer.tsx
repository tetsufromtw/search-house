'use client';

import React from 'react';
import Link from 'next/link';
import { SearchProvider, useSearch } from '../context/SearchContext';  
import SearchLayout from '../components/layout/SearchLayout';
import SearchBar from '../components/ui/SearchBar';
import FilterPanel from '../components/ui/FilterPanel';
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

      <div className="flex flex-col xl:flex-row gap-8 px-6 pb-8">
        <FilterPanel
          filters={state.filters}
          onFiltersChange={actions.setFilters}
        />

        <MapContainer />

        <PropertyList
          properties={state.properties}
          loading={state.loading}
          onPropertyClick={handlePropertyClick}
        />
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