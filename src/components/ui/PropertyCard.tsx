'use client';

import React from 'react';
import { SuumoProperty } from '../../utils/suumoApi';

interface PropertyCardProps {
  property: SuumoProperty;
  onClick?: (property: SuumoProperty) => void;
  className?: string;
}

export default function PropertyCard({
  property,
  onClick,
  className = ""
}: PropertyCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(property);
    }
  };

  return (
    <div 
      className={`border-b border-[#e5e5e5] pb-6 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-light text-[#111111] text-lg tracking-wide">
          {property.title}
        </h4>
        <div className="text-right">
          <span className="text-[#111111] font-medium text-lg">
            ¥ {property.price}
          </span>
          <div className="text-xs text-[#999999] font-light mt-1">
            {property.size}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-[#999999] mb-2 font-light tracking-wide">
        {property.location}
      </p>
      
      {property.distance && (
        <p className="text-xs text-[#666666] mb-4 font-light tracking-wide">
          {property.distance}
        </p>
      )}
      
      <div className="flex gap-2 flex-wrap">
        {property.tags.map((tag) => (
          <span 
            key={tag} 
            className="text-xs text-[#111111] px-3 py-1 border border-[#e5e5e5] rounded-none font-light tracking-wide"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}