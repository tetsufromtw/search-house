'use client';

import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "場所や住所を入力",
  disabled = false,
  className = ""
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={`pt-8 sm:pt-12 pb-4 sm:pb-6 ${className}`}>
      <div className="max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6">
        {/* 功能展示按鈕 */}
        <div className="flex justify-end mb-3 sm:mb-4">
          <a 
            href="/demo"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-none hover:opacity-80 transition-opacity font-light tracking-wide text-sm"
          >
            功能展示 →
          </a>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-base sm:text-lg border border-gray-200 rounded-none shadow-sm focus:outline-none focus:border-gray-900 bg-white font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <button
            onClick={onSearch}
            disabled={disabled}
            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-gray-900 hover:opacity-80 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-none transition-opacity font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            検索
          </button>
        </div>
      </div>
    </div>
  );
}