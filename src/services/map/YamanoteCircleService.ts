/**
 * 山手線圓圈服務
 * 專門負責山手線車站圓圈的創建和管理
 * 遵循單一職責原則
 */

import { CircleManager, CircleData } from './CircleManager';
import { YAMANOTE_STATIONS, YamanoteStation, YamanoteUtils } from '../../data/yamanoteStations';

export interface YamanoteCircleOptions {
  radius?: number;
  showAllStations?: boolean;
  showOnlyMajorStations?: boolean;
  customStations?: string[]; // station IDs
}

export class YamanoteCircleService {
  private circleManager: CircleManager;

  constructor(circleManager: CircleManager) {
    this.circleManager = circleManager;
  }

  /**
   * 顯示山手線車站圓圈
   */
  showYamanoteStations(options: YamanoteCircleOptions = {}): void {
    const {
      radius = 500,
      showAllStations = true,
      showOnlyMajorStations = false,
      customStations
    } = options;

    // 決定要顯示的車站
    let stations: YamanoteStation[];

    if (customStations && customStations.length > 0) {
      // 顯示指定的車站
      stations = customStations
        .map(id => YamanoteUtils.getStationById(id))
        .filter((station): station is YamanoteStation => station !== undefined);
    } else if (showOnlyMajorStations) {
      // 只顯示主要車站
      stations = YamanoteUtils.getMajorStations();
    } else if (showAllStations) {
      // 顯示所有車站
      stations = YAMANOTE_STATIONS;
    } else {
      // 默認顯示主要車站
      stations = YamanoteUtils.getMajorStations();
    }

    // 批量創建圓圈
    const circleDataList = stations.map(station => this.createStationCircleData(station, radius));
    this.circleManager.addCircles(circleDataList);

    console.log(`🚉 顯示了 ${stations.length} 個山手線車站圓圈`);
  }

  /**
   * 顯示特定車站圓圈
   */
  showStation(stationId: string, radius: number = 500): boolean {
    const station = YamanoteUtils.getStationById(stationId);
    if (!station) {
      console.warn(`車站 ${stationId} 不存在`);
      return false;
    }

    const circleData = this.createStationCircleData(station, radius);
    this.circleManager.addCircle(circleData);

    console.log(`🚉 顯示車站圓圈: ${station.nameJa}`);
    return true;
  }

  /**
   * 隱藏特定車站圓圈
   */
  hideStation(stationId: string): void {
    this.circleManager.removeCircle(`yamanote-${stationId}`);
  }

  /**
   * 切換車站圓圈顯示/隱藏
   */
  toggleStation(stationId: string, radius: number = 500): boolean {
    const circleId = `yamanote-${stationId}`;
    
    if (this.circleManager.hasCircle(circleId)) {
      this.hideStation(stationId);
      return false; // 隱藏
    } else {
      return this.showStation(stationId, radius); // 顯示
    }
  }

  /**
   * 隱藏所有山手線圓圈
   */
  hideAllStations(): void {
    YAMANOTE_STATIONS.forEach(station => {
      this.hideStation(station.id);
    });

    console.log('🚉 隱藏所有山手線車站圓圈');
  }

  /**
   * 獲取顯示中的車站數量
   */
  getVisibleStationCount(): number {
    return YAMANOTE_STATIONS.filter(station => 
      this.circleManager.hasCircle(`yamanote-${station.id}`)
    ).length;
  }

  /**
   * 檢查特定車站是否顯示中
   */
  isStationVisible(stationId: string): boolean {
    return this.circleManager.hasCircle(`yamanote-${stationId}`);
  }

  /**
   * 更新所有車站圓圈的半徑
   */
  updateRadius(newRadius: number): void {
    YAMANOTE_STATIONS.forEach(station => {
      const circleId = `yamanote-${station.id}`;
      if (this.circleManager.hasCircle(circleId)) {
        // 移除舊圓圈
        this.circleManager.removeCircle(circleId);
        // 創建新圓圈
        const circleData = this.createStationCircleData(station, newRadius);
        this.circleManager.addCircle(circleData);
      }
    });

    console.log(`🚉 更新所有車站圓圈半徑至 ${newRadius}公尺`);
  }

  /**
   * 響應地圖縮放
   */
  handleZoomChange(zoom: number): void {
    this.circleManager.handleZoomChange(zoom);
  }

  // ===== 私有方法 =====

  private createStationCircleData(station: YamanoteStation, radius: number): Omit<CircleData, 'style'> {
    return {
      id: `yamanote-${station.id}`,
      center: station.coordinates,
      radius,
      metadata: {
        name: station.nameJa,
        type: 'station',
        category: 'yamanote-line',
        stationNumber: station.stationNumber
      }
    };
  }
}

/**
 * 預設的山手線圓圈配置
 */
export const YAMANOTE_PRESETS = {
  // 所有車站
  ALL_STATIONS: {
    showAllStations: true,
    radius: 500
  },

  // 只有主要車站
  MAJOR_STATIONS_ONLY: {
    showOnlyMajorStations: true,
    radius: 500
  },

  // 大站 + 大半徑
  MAJOR_STATIONS_LARGE: {
    showOnlyMajorStations: true,
    radius: 1000
  },

  // 自訂熱門車站
  POPULAR_STATIONS: {
    customStations: ['tokyo', 'shinjuku', 'shibuya', 'ikebukuro', 'ueno', 'shinagawa'],
    radius: 750
  }
} as const;