'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Circle, Intersection, FreehandPath, DrawingMode, COLORS } from '../types/circle';
import { calculateIntersections, createCircle } from '../utils/circleUtils';
import { createFreehandPath, addPointToPath, shouldClosePath, closePath, simplifyPath } from '../utils/freehandUtils';
import { drawMapBackground, drawCircles, drawFreehandPaths, drawIntersections, getCanvasCoordinates, resizeCanvas } from '../utils/canvasUtils';

const MapCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [freehandPaths, setFreehandPaths] = useState<FreehandPath[]>([]);
  const [intersections, setIntersections] = useState<Intersection[]>([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('circle');
  
  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<FreehandPath | null>(null);

  const updateIntersections = useCallback((updatedCircles: Circle[]) => {
    const newIntersections = calculateIntersections(updatedCircles);
    setIntersections(newIntersections);
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMapBackground(ctx, canvas.width, canvas.height);
    drawCircles(ctx, circles);
    drawFreehandPaths(ctx, freehandPaths);
    
    // Draw current path being drawn
    if (currentPath && currentPath.points.length > 0) {
      drawFreehandPaths(ctx, [currentPath]);
    }
    
    drawIntersections(ctx, intersections);
  }, [circles, freehandPaths, currentPath, intersections]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode !== 'circle') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(event, canvas);
    const newCircle = createCircle({ x, y }, currentColorIndex);

    const updatedCircles = [...circles, newCircle];
    setCircles(updatedCircles);
    setCurrentColorIndex(prev => (prev + 1) % COLORS.length);
    updateIntersections(updatedCircles);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode !== 'freehand') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(event, canvas);
    const newPath = createFreehandPath(currentColorIndex);
    const pathWithFirstPoint = addPointToPath(newPath, { x, y });
    
    setCurrentPath(pathWithFirstPoint);
    setIsDrawing(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode !== 'freehand' || !isDrawing || !currentPath) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(event, canvas);
    const updatedPath = addPointToPath(currentPath, { x, y });
    setCurrentPath(updatedPath);
  };

  const handleMouseUp = () => {
    if (drawingMode !== 'freehand' || !isDrawing || !currentPath) return;
    
    let finalPath = currentPath;
    
    // Check if path should be closed
    if (shouldClosePath(currentPath)) {
      finalPath = closePath(currentPath);
    }
    
    // Simplify path to reduce points
    const simplifiedPoints = simplifyPath(finalPath.points);
    finalPath = { ...finalPath, points: simplifiedPoints };
    
    setFreehandPaths(prev => [...prev, finalPath]);
    setCurrentPath(null);
    setIsDrawing(false);
    setCurrentColorIndex(prev => (prev + 1) % COLORS.length);
  };

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    resizeCanvas(canvas, container);
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    handleResize();
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const clearAll = () => {
    setCircles([]);
    setFreehandPaths([]);
    setIntersections([]);
    setCurrentColorIndex(0);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[400px] relative"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg shadow-lg border border-gray-200"
        style={{ cursor: drawingMode === 'circle' ? 'crosshair' : 'pointer' }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Mode Selection */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setDrawingMode('circle')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              drawingMode === 'circle' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            圓圈模式
          </button>
          <button
            onClick={() => setDrawingMode('freehand')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              drawingMode === 'freehand' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            自由繪圖
          </button>
        </div>
        
        <p className="text-sm text-gray-600">
          {drawingMode === 'circle' ? '點擊繪製圓圈' : '按住拖拽繪製形狀'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          目前顏色: <span className="font-semibold">{COLORS[currentColorIndex]}</span>
        </p>
        <p className="text-xs text-gray-500">
          圓圈: {circles.length} 個 | 路徑: {freehandPaths.length} 個
        </p>
        <p className="text-xs text-gray-500">
          交集點: {intersections.reduce((sum, i) => sum + i.points.length, 0)} 個
        </p>
      </div>

      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
        <button
          onClick={clearAll}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
        >
          清除全部
        </button>
      </div>
    </div>
  );
};

export default MapCanvas;