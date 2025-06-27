export interface Point {
  x: number;
  y: number;
}

export interface Circle {
  id: string;
  center: Point;
  radius: number;
  colorIndex: number;
  pixelRadius: number;
}

export interface FreehandPath {
  id: string;
  points: Point[];
  colorIndex: number;
  isClosed: boolean;
}

export interface Intersection {
  id: string;
  circles: string[];
  points: Point[];
}

export type DrawingMode = 'circle' | 'freehand';

export const COLORS = [
  'red',
  'blue', 
  'green',
  'yellow',
  'purple',
  'pink',
  'indigo',
  'orange',
  'teal',
  'cyan'
] as const;

export type ColorName = typeof COLORS[number];