/**
 * 交集區域疊加組件
 * 使用 Canvas 繪製圓圈交集的顏色疊加效果
 */

import React, { useEffect, useRef } from 'react';

interface CircleData {
  center: { lat: number; lng: number };
  radius: number; // 公尺
  color: string;
  requirementId: string;
}

interface IntersectionOverlayProps {
  map: google.maps.Map | null;
  circles: CircleData[];
  bounds: google.maps.LatLngBounds | null;
}

export class IntersectionCanvasOverlay extends google.maps.OverlayView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private circles: CircleData[];
  
  constructor(circles: CircleData[]) {
    super();
    this.circles = circles;
    
    // 創建 Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.pointerEvents = 'none'; // 不干擾地圖互動
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('無法取得 Canvas 2D context');
    }
    this.ctx = ctx;
  }
  
  onAdd() {
    const panes = this.getPanes();
    if (panes) {
      panes.overlayLayer.appendChild(this.canvas);
    }
  }
  
  onRemove() {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
  
  draw() {
    const projection = this.getProjection();
    if (!projection) return;
    
    const map = this.getMap();
    if (!map) return;
    
    const mapDiv = map.getDiv();
    const mapWidth = mapDiv.offsetWidth;
    const mapHeight = mapDiv.offsetHeight;
    
    // 設定 Canvas 大小
    this.canvas.width = mapWidth;
    this.canvas.height = mapHeight;
    this.canvas.style.width = `${mapWidth}px`;
    this.canvas.style.height = `${mapHeight}px`;
    
    // 清除畫布
    this.ctx.clearRect(0, 0, mapWidth, mapHeight);
    
    if (this.circles.length === 0) return;
    
    console.log('🎨 開始繪製交集疊加效果，圓圈數量:', this.circles.length);
    
    // 繪製每個圓圈的交集區域
    this.drawIntersectionAreas(projection);
    
    // 繪製圓圈邊框
    this.drawCircleBorders(projection);
  }
  
  private drawIntersectionAreas(projection: google.maps.MapCanvasProjection) {
    const pixelCircles = this.circles.map(circle => {
      const centerPixel = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(circle.center.lat, circle.center.lng)
      );
      
      // 計算像素半徑（簡化計算）
      const radiusLatLng = new google.maps.LatLng(
        circle.center.lat + (circle.radius / 111320), // 1度約111320公尺
        circle.center.lng
      );
      const radiusPixel = projection.fromLatLngToDivPixel(radiusLatLng);
      const pixelRadius = Math.abs(radiusPixel.y - centerPixel.y);
      
      return {
        x: centerPixel.x,
        y: centerPixel.y,
        radius: pixelRadius,
        color: circle.color,
        requirementId: circle.requirementId
      };
    });
    
    // 為每個像素檢查是否在交集中
    this.drawPixelByPixelIntersection(pixelCircles);
  }
  
  private drawPixelByPixelIntersection(pixelCircles: any[]) {
    if (pixelCircles.length <= 1) return;
    
    const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // 遍歷每個像素
    for (let y = 0; y < this.canvas.height; y += 2) { // 跳過一些像素提升效能
      for (let x = 0; x < this.canvas.width; x += 2) {
        const pixelIndex = (y * this.canvas.width + x) * 4;
        
        // 檢查此像素在哪些圓圈內
        const containingCircles = pixelCircles.filter(circle => {
          const distance = Math.sqrt(
            Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)
          );
          return distance <= circle.radius;
        });
        
        // 如果在多個圓圈內（交集區域）
        if (containingCircles.length > 1) {
          // 混合顏色
          const blendedColor = this.blendColors(containingCircles.map(c => c.color));
          
          data[pixelIndex] = blendedColor.r;     // R
          data[pixelIndex + 1] = blendedColor.g; // G
          data[pixelIndex + 2] = blendedColor.b; // B
          data[pixelIndex + 3] = 100;            // A (透明度)
          
          // 填充相鄰像素提升效能
          if (x + 1 < this.canvas.width) {
            const nextPixelIndex = (y * this.canvas.width + (x + 1)) * 4;
            data[nextPixelIndex] = blendedColor.r;
            data[nextPixelIndex + 1] = blendedColor.g;
            data[nextPixelIndex + 2] = blendedColor.b;
            data[nextPixelIndex + 3] = 100;
          }
          
          if (y + 1 < this.canvas.height) {
            const nextRowPixelIndex = ((y + 1) * this.canvas.width + x) * 4;
            data[nextRowPixelIndex] = blendedColor.r;
            data[nextRowPixelIndex + 1] = blendedColor.g;
            data[nextRowPixelIndex + 2] = blendedColor.b;
            data[nextRowPixelIndex + 3] = 100;
          }
        }
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }
  
  private drawCircleBorders(projection: google.maps.MapCanvasProjection) {
    this.circles.forEach(circle => {
      const centerPixel = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(circle.center.lat, circle.center.lng)
      );
      
      // 計算像素半徑
      const radiusLatLng = new google.maps.LatLng(
        circle.center.lat + (circle.radius / 111320),
        circle.center.lng
      );
      const radiusPixel = projection.fromLatLngToDivPixel(radiusLatLng);
      const pixelRadius = Math.abs(radiusPixel.y - centerPixel.y);
      
      // 繪製邊框
      this.ctx.beginPath();
      this.ctx.arc(centerPixel.x, centerPixel.y, pixelRadius, 0, 2 * Math.PI);
      this.ctx.strokeStyle = circle.color;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });
  }
  
  private blendColors(colors: string[]): { r: number; g: number; b: number } {
    if (colors.length === 0) return { r: 0, g: 0, b: 0 };
    
    // 簡單的顏色混合
    let totalR = 0, totalG = 0, totalB = 0;
    
    colors.forEach(color => {
      // 假設顏色格式為 #RRGGBB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      totalR += r;
      totalG += g;
      totalB += b;
    });
    
    return {
      r: Math.round(totalR / colors.length),
      g: Math.round(totalG / colors.length),
      b: Math.round(totalB / colors.length)
    };
  }
  
  updateCircles(circles: CircleData[]) {
    this.circles = circles;
    this.draw();
  }
}

export const IntersectionOverlay: React.FC<IntersectionOverlayProps> = ({
  map,
  circles,
  bounds
}) => {
  const overlayRef = useRef<IntersectionCanvasOverlay | null>(null);
  
  useEffect(() => {
    if (!map || circles.length === 0) {
      // 清除現有覆蓋層
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
      return;
    }
    
    console.log('🎨 創建交集覆蓋層，圓圈數量:', circles.length);
    
    // 創建新的覆蓋層
    const overlay = new IntersectionCanvasOverlay(circles);
    overlay.setMap(map);
    overlayRef.current = overlay;
    
    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, [map, circles.length]);
  
  // 更新圓圈資料
  useEffect(() => {
    if (overlayRef.current && circles.length > 0) {
      overlayRef.current.updateCircles(circles);
    }
  }, [circles]);
  
  return null; // 這是一個無 UI 的組件
};