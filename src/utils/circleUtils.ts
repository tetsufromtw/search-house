import { Point, Circle, Intersection, ColorName } from '../types/circle';

export const getTailwindColor = (colorName: ColorName, shade: number): string => {
  const colorMap: { [key in ColorName]: { [key: number]: string } } = {
    red: { 300: '#fca5a5', 400: '#f87171' },
    blue: { 300: '#93c5fd', 400: '#60a5fa' },
    green: { 300: '#86efac', 400: '#4ade80' },
    yellow: { 300: '#fde047', 400: '#facc15' },
    purple: { 300: '#c4b5fd', 400: '#a78bfa' },
    pink: { 300: '#f9a8d4', 400: '#f472b6' },
    indigo: { 300: '#a5b4fc', 400: '#818cf8' },
    orange: { 300: '#fdba74', 400: '#fb923c' },
    teal: { 300: '#5eead4', 400: '#2dd4bf' },
    cyan: { 300: '#67e8f9', 400: '#22d3ee' }
  };
  return colorMap[colorName]?.[shade] || '#93c5fd';
};

export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const findCircleIntersections = (c1: Circle, c2: Circle): Point[] => {
  const d = calculateDistance(c1.center, c2.center);
  
  if (d > c1.pixelRadius + c2.pixelRadius || d < Math.abs(c1.pixelRadius - c2.pixelRadius) || d === 0) {
    return [];
  }

  const a = (c1.pixelRadius * c1.pixelRadius - c2.pixelRadius * c2.pixelRadius + d * d) / (2 * d);
  const h = Math.sqrt(c1.pixelRadius * c1.pixelRadius - a * a);

  const px = c1.center.x + a * (c2.center.x - c1.center.x) / d;
  const py = c1.center.y + a * (c2.center.y - c1.center.y) / d;

  const intersection1: Point = {
    x: px + h * (c2.center.y - c1.center.y) / d,
    y: py - h * (c2.center.x - c1.center.x) / d
  };

  const intersection2: Point = {
    x: px - h * (c2.center.y - c1.center.y) / d,
    y: py + h * (c2.center.x - c1.center.x) / d
  };

  return [intersection1, intersection2];
};

export const calculateIntersections = (circles: Circle[]): Intersection[] => {
  const intersections: Intersection[] = [];

  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const intersectionPoints = findCircleIntersections(circles[i], circles[j]);
      if (intersectionPoints.length > 0) {
        intersections.push({
          id: `${circles[i].id}-${circles[j].id}`,
          circles: [circles[i].id, circles[j].id],
          points: intersectionPoints
        });
      }
    }
  }

  return intersections;
};

export const createCircle = (
  center: Point, 
  colorIndex: number, 
  radius: number = 500, 
  pixelRadius: number = 60
): Circle => {
  return {
    id: `circle-${Date.now()}`,
    center,
    radius,
    pixelRadius,
    colorIndex
  };
};