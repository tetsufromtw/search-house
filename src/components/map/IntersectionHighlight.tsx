'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { IntersectionArea } from '../../utils/intersectionUtils';

export interface IntersectionHighlightStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  zIndex: number;
}

export interface IntersectionHighlightProps {
  intersection: IntersectionArea;
  style?: Partial<IntersectionHighlightStyle>;
}

/**
 * 默認高亮樣式配置
 * 遵循高級極簡設計風格 - 黑白灰配色
 */
const DEFAULT_HIGHLIGHT_STYLE: IntersectionHighlightStyle = {
  fillColor: '#ff0000',        // 改為紅色，更明顯
  fillOpacity: 0.4,            // 提高透明度，更明顯
  strokeColor: '#ff0000',      // 紅色邊框
  strokeOpacity: 1.0,          // 完全不透明的邊框
  strokeWeight: 5,             // 更粗的邊框
  zIndex: 9999                 // 確保在最上層
};

/**
 * 交集區域高亮組件
 * 使用原生 Google Maps API 創建圓圈高亮效果
 * 遵循 FAANG 設計原則：單一職責，高性能
 */
const IntersectionHighlight: React.FC<IntersectionHighlightProps> = React.memo(({
  intersection,
  style = {}
}) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  // 合併默認樣式和自定義樣式，使用 useMemo 優化性能
  const finalStyle: IntersectionHighlightStyle = useMemo(() => ({
    ...DEFAULT_HIGHLIGHT_STYLE,
    ...style
  }), [style]);

  useEffect(() => {
    if (!map) return;

    console.log('🔴 正在創建高亮圓圈:', {
      intersectionId: intersection.id,
      center: intersection.center,
      radius: intersection.radius,
      style: finalStyle
    });

    // 創建高亮圓圈
    circleRef.current = new google.maps.Circle({
      center: intersection.center,
      radius: intersection.radius,
      fillColor: finalStyle.fillColor,
      fillOpacity: finalStyle.fillOpacity,
      strokeColor: finalStyle.strokeColor,
      strokeOpacity: finalStyle.strokeOpacity,
      strokeWeight: finalStyle.strokeWeight,
      zIndex: finalStyle.zIndex,
      clickable: false,  // 避免干擾點擊事件
      draggable: false,
      map: map
    });

    console.log('✅ 高亮圓圈創建完成:', intersection.id);

    // 清理函數
    return () => {
      console.log('🗑️ 清理高亮圓圈:', intersection.id);
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, intersection.center, intersection.radius, finalStyle]);

  // 此組件不渲染任何 JSX，純粹處理地圖API
  return null;
});

IntersectionHighlight.displayName = 'IntersectionHighlight';

export default IntersectionHighlight;