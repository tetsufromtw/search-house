'use client';

import { useEffect, useCallback } from 'react';
import { calculateAllIntersections, IntersectionArea } from '../utils/intersectionUtils';
import { CircleData } from '../context/SearchContext';

export function useCircleIntersections(
  circles: CircleData[],
  onIntersectionsUpdate: (intersections: IntersectionArea[]) => void
) {
  const memoizedUpdate = useCallback((intersections: IntersectionArea[]) => {
    onIntersectionsUpdate(intersections);
  }, [onIntersectionsUpdate]);

  useEffect(() => {
    if (circles.length >= 2) {
      const newIntersections = calculateAllIntersections(circles);
      memoizedUpdate(newIntersections);
    } else {
      memoizedUpdate([]);
    }
  }, [circles, memoizedUpdate]);
}