'use client';

import React from 'react';
import IntersectionHighlight, { IntersectionHighlightStyle } from './IntersectionHighlight';
import { IntersectionArea } from '../../utils/intersectionUtils';

export interface IntersectionHighlightContainerProps {
  intersections: IntersectionArea[];
  style?: Partial<IntersectionHighlightStyle>;
}

/**
 * 交集高亮容器組件
 * 負責渲染所有被高亮的交集區域
 * 遵循組合模式，將多個高亮組件組合在一起
 */
const IntersectionHighlightContainer: React.FC<IntersectionHighlightContainerProps> = React.memo(({
  intersections,
  style
}) => {
  // 只渲染被高亮的交集
  const highlightedIntersections = intersections.filter(intersection => intersection.isHighlighted);

  // 除錯訊息
  console.log('🌟 IntersectionHighlightContainer 渲染狀態:', {
    總交集數: intersections.length,
    高亮交集數: highlightedIntersections.length,
    交集詳情: intersections.map(i => ({ id: i.id, highlighted: i.isHighlighted }))
  });

  if (highlightedIntersections.length === 0) {
    return null;
  }

  return (
    <>
      {highlightedIntersections.map(intersection => (
        <IntersectionHighlight
          key={`highlight-${intersection.id}`}
          intersection={intersection}
          style={style}
        />
      ))}
    </>
  );
});

IntersectionHighlightContainer.displayName = 'IntersectionHighlightContainer';

export default IntersectionHighlightContainer;