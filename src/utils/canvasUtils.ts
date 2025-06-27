import { Circle, Intersection, FreehandPath, COLORS } from '../types/circle';
import { getTailwindColor } from './circleUtils';

export const drawMapBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // Draw mock map background
  ctx.fillStyle = '#f0f9ff';
  ctx.fillRect(0, 0, width, height);

  // Draw grid pattern
  ctx.strokeStyle = '#e0e7ff';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i < height; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }
};

export const drawCircles = (ctx: CanvasRenderingContext2D, circles: Circle[]) => {
  circles.forEach(circle => {
    const colorName = COLORS[circle.colorIndex];
    
    // Draw filled circle
    ctx.beginPath();
    ctx.arc(circle.center.x, circle.center.y, circle.pixelRadius, 0, 2 * Math.PI);
    ctx.fillStyle = getTailwindColor(colorName, 300) + '33'; // 0.2 opacity
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = getTailwindColor(colorName, 400);
    ctx.lineWidth = 2;
    ctx.stroke();
  });
};

export const drawFreehandPaths = (ctx: CanvasRenderingContext2D, paths: FreehandPath[]) => {
  paths.forEach(path => {
    if (path.points.length < 2) return;
    
    const colorName = COLORS[path.colorIndex];
    
    // Draw path stroke
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    
    if (path.isClosed) {
      ctx.closePath();
      // Fill closed path
      ctx.fillStyle = getTailwindColor(colorName, 300) + '33'; // 0.2 opacity
      ctx.fill();
    }
    
    ctx.strokeStyle = getTailwindColor(colorName, 400);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  });
};

export const drawIntersections = (ctx: CanvasRenderingContext2D, intersections: Intersection[]) => {
  intersections.forEach(intersection => {
    intersection.points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  });
};

export const getCanvasCoordinates = (
  event: React.MouseEvent<HTMLCanvasElement>, 
  canvas: HTMLCanvasElement
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
};

export const resizeCanvas = (
  canvas: HTMLCanvasElement, 
  container: HTMLElement
): { width: number; height: number } => {
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // 設定 Canvas 實際像素尺寸等於顯示尺寸，避免縮放變形
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  
  // 設定 CSS 尺寸與實際像素尺寸一致
  canvas.style.width = `${containerWidth}px`;
  canvas.style.height = `${containerHeight}px`;

  return { width: containerWidth, height: containerHeight };
};