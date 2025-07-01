/**
 * 圓圈管理器
 * 遵循 FAANG 設計原則：單一職責、依賴注入、策略模式
 */

export interface CircleStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  zIndex: number;
}

export interface CircleData {
  id: string;
  center: { lat: number; lng: number };
  radius: number;
  style: CircleStyle;
  metadata: {
    name: string;
    type: 'station' | 'poi' | 'custom';
    category?: string;
    stationNumber?: string;
  };
}

export interface CircleConfig {
  defaultRadius: number;
  baseZIndex: number;
  styles: {
    station: CircleStyle;
    poi: CircleStyle;
    custom: CircleStyle;
  };
}

/**
 * 默認圓圈配置
 * 使用 Tailwind 色階設計
 */
export const DEFAULT_CIRCLE_CONFIG: CircleConfig = {
  defaultRadius: 500, // 500公尺
  baseZIndex: 100,
  styles: {
    // 車站圓圈：綠色系
    station: {
      fillColor: '#86efac',      // green-300
      fillOpacity: 0.15,         // 透明填充
      strokeColor: '#4ade80',    // green-400  
      strokeOpacity: 0.8,        // 不透明邊框
      strokeWeight: 2,
      zIndex: 100
    },
    
    // POI 圓圈：藍色系（備用）
    poi: {
      fillColor: '#93c5fd',      // blue-300
      fillOpacity: 0.15,
      strokeColor: '#60a5fa',    // blue-400
      strokeOpacity: 0.8,
      strokeWeight: 2,
      zIndex: 110
    },
    
    // 自訂圓圈：紫色系（備用）
    custom: {
      fillColor: '#c4b5fd',      // violet-300
      fillOpacity: 0.15,
      strokeColor: '#a78bfa',    // violet-400
      strokeOpacity: 0.8,
      strokeWeight: 2,
      zIndex: 120
    }
  }
};

/**
 * 圓圈管理器類
 * 負責創建、管理和銷毀地圖上的圓圈
 */
export class CircleManager {
  private map: google.maps.Map | null = null;
  private circles = new Map<string, google.maps.Circle>();
  private markers = new Map<string, google.maps.Marker>();
  private config: CircleConfig;

  constructor(config: CircleConfig = DEFAULT_CIRCLE_CONFIG) {
    this.config = config;
  }

  /**
   * 設置地圖實例
   */
  setMap(map: google.maps.Map): void {
    this.map = map;
  }

  /**
   * 添加單個圓圈
   */
  addCircle(data: Omit<CircleData, 'style'> & { style?: Partial<CircleStyle> }): void {
    if (!this.map) {
      console.warn('Map not initialized');
      return;
    }

    // 合併樣式
    const defaultStyle = this.config.styles[data.metadata.type];
    const style = { ...defaultStyle, ...data.style };

    const circleData: CircleData = {
      ...data,
      style
    };

    // 創建圓圈
    this.createCircle(circleData);
    
    // 創建中心標記
    this.createCenterMarker(circleData);
  }

  /**
   * 批量添加圓圈
   */
  addCircles(dataList: Array<Omit<CircleData, 'style'> & { style?: Partial<CircleStyle> }>): void {
    dataList.forEach(data => this.addCircle(data));
  }

  /**
   * 移除圓圈
   */
  removeCircle(id: string): void {
    // 移除圓圈
    const circle = this.circles.get(id);
    if (circle) {
      circle.setMap(null);
      this.circles.delete(id);
    }

    // 移除標記
    const marker = this.markers.get(id);
    if (marker) {
      marker.setMap(null);
      this.markers.delete(id);
    }
  }

  /**
   * 清除所有圓圈
   */
  clearAll(): void {
    // 清除所有圓圈
    this.circles.forEach(circle => circle.setMap(null));
    this.circles.clear();

    // 清除所有標記
    this.markers.forEach(marker => marker.setMap(null));
    this.markers.clear();
  }

  /**
   * 獲取圓圈數量
   */
  getCircleCount(): number {
    return this.circles.size;
  }

  /**
   * 檢查圓圈是否存在
   */
  hasCircle(id: string): boolean {
    return this.circles.has(id);
  }

  /**
   * 更新圓圈樣式
   */
  updateCircleStyle(id: string, style: Partial<CircleStyle>): void {
    const circle = this.circles.get(id);
    if (!circle) return;

    const options: google.maps.CircleOptions = {};
    
    if (style.fillColor) options.fillColor = style.fillColor;
    if (style.fillOpacity !== undefined) options.fillOpacity = style.fillOpacity;
    if (style.strokeColor) options.strokeColor = style.strokeColor;
    if (style.strokeOpacity !== undefined) options.strokeOpacity = style.strokeOpacity;
    if (style.strokeWeight) options.strokeWeight = style.strokeWeight;
    if (style.zIndex) options.zIndex = style.zIndex;

    circle.setOptions(options);
  }

  /**
   * 響應地圖縮放調整圓圈顯示
   */
  handleZoomChange(zoom: number): void {
    const strokeWeight = this.calculateStrokeWeight(zoom);
    
    // 更新所有圓圈的線條粗細
    this.circles.forEach(circle => {
      circle.setOptions({ strokeWeight });
    });
  }

  // ===== 私有方法 =====

  private createCircle(data: CircleData): void {
    if (!this.map) return;

    const circle = new google.maps.Circle({
      center: data.center,
      radius: data.radius,
      fillColor: data.style.fillColor,
      fillOpacity: data.style.fillOpacity,
      strokeColor: data.style.strokeColor,
      strokeOpacity: data.style.strokeOpacity,
      strokeWeight: data.style.strokeWeight,
      zIndex: data.style.zIndex,
      clickable: false,
      map: this.map
    });

    this.circles.set(data.id, circle);
  }

  private createCenterMarker(data: CircleData): void {
    if (!this.map) return;

    const marker = new google.maps.Marker({
      position: data.center,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4,
        fillColor: data.style.strokeColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1
      },
      title: data.metadata.name,
      zIndex: data.style.zIndex + 10
    });

    // 添加信息窗口
    const infoWindow = new google.maps.InfoWindow();
    marker.addListener('click', () => {
      const content = this.createInfoWindowContent(data);
      infoWindow.setContent(content);
      infoWindow.open(this.map!, marker);
    });

    this.markers.set(data.id, marker);
  }

  private createInfoWindowContent(data: CircleData): string {
    const { metadata } = data;
    
    return `
      <div style="padding: 8px 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">
          ${metadata.name}
        </h3>
        <div style="font-size: 14px; color: #6b7280; line-height: 1.5;">
          <p style="margin: 4px 0;">
            <strong>類型:</strong> ${this.getTypeLabel(metadata.type)}
          </p>
          ${metadata.stationNumber ? `
            <p style="margin: 4px 0;">
              <strong>車站號碼:</strong> ${metadata.stationNumber}
            </p>
          ` : ''}
          <p style="margin: 4px 0;">
            <strong>半徑:</strong> ${data.radius}公尺
          </p>
        </div>
      </div>
    `;
  }

  private getTypeLabel(type: string): string {
    const labels = {
      station: '車站',
      poi: '興趣點',
      custom: '自訂'
    };
    return labels[type as keyof typeof labels] || type;
  }

  private calculateStrokeWeight(zoom: number): number {
    // 根據縮放級別動態調整線條粗細
    if (zoom <= 10) return 1;
    if (zoom <= 13) return 2;
    if (zoom <= 16) return 3;
    return 4;
  }
}