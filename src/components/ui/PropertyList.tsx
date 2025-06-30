'use client';

import React from 'react';
import { SuumoProperty } from '../../utils/suumoApi';
import PropertyCard from './PropertyCard';

interface PropertyListProps {
  properties: SuumoProperty[];
  loading?: boolean;
  onPropertyClick?: (property: SuumoProperty) => void;
  className?: string;
}

export default function PropertyList({
  properties,
  loading = false,
  onPropertyClick,
  className = ""
}: PropertyListProps) {
  return (
    <div className={`w-full xl:w-80 bg-white border border-[#e5e5e5] shadow-sm p-8 ${className}`}>
      <h3 className="text-xl font-light text-[#111111] mb-8 tracking-wide">
        検索結果
      </h3>
      
      {loading ? (
        <div className="text-center text-[#999999] font-light py-12">
          <div className="w-12 h-12 border border-[#e5e5e5] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#111111]"></div>
          </div>
          <p className="text-sm tracking-wide">
            検索中...
          </p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center text-[#999999] font-light py-12">
          <div className="w-12 h-12 border border-[#e5e5e5] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm tracking-wide">
            2つ以上の円を描いて
          </p>
          <p className="text-sm tracking-wide">
            交集区域を作成してください
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={onPropertyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}