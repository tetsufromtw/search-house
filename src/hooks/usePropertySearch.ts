'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchPropertiesInIntersection, SuumoProperty } from '../utils/suumoApi';
import { IntersectionArea } from '../utils/intersectionUtils';
import { SearchFilters } from '../context/SearchContext';

export function usePropertySearch(
  intersections: IntersectionArea[],
  filters: SearchFilters,
  onPropertiesUpdate?: (properties: SuumoProperty[]) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const lastSearchRef = useRef<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const updateProperties = useCallback((properties: SuumoProperty[]) => {
    if (onPropertiesUpdate) {
      onPropertiesUpdate(properties);
    }
  }, [onPropertiesUpdate]);

  useEffect(() => {
    // 清除之前的定時器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (intersections.length > 0) {
      // 選擇第一個交集區域進行搜尋
      const firstIntersection = intersections[0];
      
      // 建立搜尋識別碼來避免重複搜尋
      const searchKey = `${firstIntersection.center.lat}-${firstIntersection.center.lng}-${firstIntersection.radius}-${JSON.stringify(filters)}`;
      
      // 如果和上次搜尋相同，就不搜尋
      if (searchKey === lastSearchRef.current) {
        return;
      }
      
      lastSearchRef.current = searchKey;
      
      // 防抖搜尋
      searchTimeoutRef.current = setTimeout(() => {
        setIsLoading(true);
        
        searchPropertiesInIntersection(
          firstIntersection.center,
          firstIntersection.radius,
          {
            maxPrice: filters.priceRange.max,
            minPrice: filters.priceRange.min
          }
        ).then(newProperties => {
          // 根據篩選條件進一步過濾
          let filteredProperties = newProperties;
          
          // 依據房型篩選
          if (filters.roomTypes.length > 0) {
            filteredProperties = filteredProperties.filter(property =>
              filters.roomTypes.some(roomType =>
                property.tags.some(tag => tag.includes(roomType))
              )
            );
          }
          
          updateProperties(filteredProperties);
          setIsLoading(false);
        }).catch(error => {
          console.error('Error searching properties:', error);
          updateProperties([]);
          setIsLoading(false);
        });
      }, 1000); // 1秒防抖
    } else {
      lastSearchRef.current = '';
      updateProperties([]);
      setIsLoading(false);
    }

    // 清理函數
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [intersections, filters, updateProperties]);

  return { isLoading };
}