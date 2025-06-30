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
    <div className={`pt-12 pb-6 ${className}`}>
      <div className="max-w-3xl mx-auto px-6">
        {/* 功能展示按鈕 */}
        <div className="flex justify-end mb-4">
          <a 
            href="/demo"
            className="inline-flex items-center px-4 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light tracking-wide text-sm"
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
            className="w-full px-8 py-5 text-lg border border-[#e5e5e5] rounded-none shadow-sm focus:outline-none focus:border-[#111111] bg-white font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={onSearch}
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#111111] hover:opacity-80 text-white px-8 py-3 rounded-none transition-opacity font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            検索
          </button>
        </div>
      </div>
    </div>
  );
}