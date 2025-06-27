import { Point, FreehandPath } from '../types/circle';

export const createFreehandPath = (colorIndex: number): FreehandPath => {
  return {
    id: `freehand-${Date.now()}`,
    points: [],
    colorIndex,
    isClosed: false
  };
};

export const addPointToPath = (path: FreehandPath, point: Point): FreehandPath => {
  return {
    ...path,
    points: [...path.points, point]
  };
};

export const shouldClosePath = (path: FreehandPath, threshold: number = 20): boolean => {
  if (path.points.length < 10) return false; // 至少需要 10 個點才考慮閉合
  
  const firstPoint = path.points[0];
  const lastPoint = path.points[path.points.length - 1];
  
  const distance = Math.sqrt(
    Math.pow(lastPoint.x - firstPoint.x, 2) + 
    Math.pow(lastPoint.y - firstPoint.y, 2)
  );
  
  return distance <= threshold;
};

export const closePath = (path: FreehandPath): FreehandPath => {
  return {
    ...path,
    isClosed: true
  };
};

export const simplifyPath = (points: Point[], tolerance: number = 2): Point[] => {
  if (points.length <= 2) return points;
  
  const simplified: Point[] = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    
    // 計算當前點到前後兩點連線的距離
    const distance = pointToLineDistance(current, prev, next);
    
    if (distance > tolerance) {
      simplified.push(current);
    }
  }
  
  simplified.push(points[points.length - 1]);
  return simplified;
};

const pointToLineDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;

  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
};