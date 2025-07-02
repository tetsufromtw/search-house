/**
 * 地點聚合演算法工具
 * 實作 k-means 風格的地理位置聚合，支援地圖縮放等級調適
 */

import { RequirementLocation, LocationCluster, RequirementType, ClusteringOptions } from '../types/multiLocationSearch';

/**
 * 計算兩個地理座標之間的距離 (公尺)
 * 使用 Haversine 公式
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371000; // 地球半徑 (公尺)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 計算多個地點的地理中心
 */
export function calculateCentroid(locations: RequirementLocation[]): { lat: number; lng: number } {
  if (locations.length === 0) {
    throw new Error('無法計算空陣列的中心點');
  }

  let totalLat = 0;
  let totalLng = 0;
  let validCount = 0;

  locations.forEach(location => {
    if (location.location && typeof location.location.lat === 'number' && typeof location.location.lng === 'number') {
      totalLat += location.location.lat;
      totalLng += location.location.lng;
      validCount++;
    }
  });

  if (validCount === 0) {
    throw new Error('沒有有效的位置資料');
  }

  return {
    lat: totalLat / validCount,
    lng: totalLng / validCount
  };
}

/**
 * 基於距離的貪心聚合演算法
 * 將相近的地點聚合在一起
 */
export function createLocationClusters(
  locations: RequirementLocation[],
  requirementType: RequirementType,
  options: ClusteringOptions
): LocationCluster[] {
  const { clusterDistance, minClusterSize, maxClusterRadius } = options;
  
  // 過濾掉無效位置的地點
  const validLocations = locations.filter(loc => 
    loc.location && 
    typeof loc.location.lat === 'number' && 
    typeof loc.location.lng === 'number'
  );

  if (validLocations.length === 0) {
    return [];
  }

  const clusters: LocationCluster[] = [];
  const unprocessedLocations = [...validLocations];
  let clusterId = 0;

  while (unprocessedLocations.length > 0) {
    // 選擇第一個地點作為種子
    const seed = unprocessedLocations.shift()!;
    const currentCluster: RequirementLocation[] = [seed];

    // 找到在聚合距離內的所有地點
    let i = 0;
    while (i < unprocessedLocations.length) {
      const candidate = unprocessedLocations[i];
      
      // 計算候選地點到聚合中心的距離
      const center = calculateCentroid(currentCluster);
      const distance = calculateDistance(
        center.lat,
        center.lng,
        candidate.location!.lat,
        candidate.location!.lng
      );

      if (distance <= clusterDistance) {
        // 檢查加入此地點後聚合半徑是否超過限制
        const newCluster = [...currentCluster, candidate];
        const newCenter = calculateCentroid(newCluster);
        
        // 計算最大距離作為聚合半徑
        const maxDistanceFromCenter = Math.max(...newCluster.map(loc => 
          calculateDistance(
            newCenter.lat,
            newCenter.lng,
            loc.location!.lat,
            loc.location!.lng
          )
        ));

        if (maxDistanceFromCenter <= maxClusterRadius) {
          currentCluster.push(candidate);
          unprocessedLocations.splice(i, 1);
        } else {
          i++;
        }
      } else {
        i++;
      }
    }

    // 建立聚合點或個別地點
    if (currentCluster.length >= minClusterSize) {
      // 建立聚合點
      const center = calculateCentroid(currentCluster);
      const maxRadius = Math.max(...currentCluster.map(loc => 
        calculateDistance(
          center.lat,
          center.lng,
          loc.location!.lat,
          loc.location!.lng
        )
      ));

      clusters.push({
        id: `cluster-${requirementType}-${clusterId++}`,
        center,
        locations: currentCluster,
        requirementType,
        count: currentCluster.length,
        radius: Math.max(maxRadius, 100) // 至少 100 公尺
      });
    } else {
      // 地點太少，建立個別聚合點
      currentCluster.forEach(location => {
        clusters.push({
          id: `single-${requirementType}-${location.id || clusterId++}`,
          center: { 
            lat: location.location!.lat, 
            lng: location.location!.lng 
          },
          locations: [location],
          requirementType,
          count: 1,
          radius: 200 // 單一地點預設半徑
        });
      });
    }
  }

  console.log(`🔗 ${requirementType} 聚合結果: ${locations.length} 地點 → ${clusters.length} 聚合點`);
  
  return clusters;
}

/**
 * 判斷是否應該啟用聚合功能
 */
export function shouldEnableClustering(
  zoomLevel: number, 
  locationCount: number, 
  options: ClusteringOptions
): boolean {
  const { clusterMinZoom, minClusterSize } = options;
  
  return zoomLevel < clusterMinZoom && locationCount >= minClusterSize;
}

/**
 * 聚合工具類
 */
export const ClusteringUtils = {
  calculateDistance,
  calculateCentroid,
  createLocationClusters,
  shouldEnableClustering,

  /**
   * 取得聚合點的顯示標籤
   */
  getClusterLabel: (cluster: LocationCluster): string => {
    if (cluster.count === 1) {
      return cluster.locations[0].name || '地點';
    }
    return `+${cluster.count}`;
  },

  /**
   * 取得聚合點的詳細資訊
   */
  getClusterInfo: (cluster: LocationCluster): string => {
    if (cluster.count === 1) {
      const location = cluster.locations[0];
      return `${location.name || '未知地點'}\n${location.address || '地址未提供'}`;
    }

    const names = cluster.locations
      .slice(0, 3)
      .map(loc => loc.name || '未知地點')
      .join(', ');
    
    const moreCount = cluster.count - 3;
    const moreText = moreCount > 0 ? ` 等 ${moreCount} 個地點` : '';
    
    return `包含 ${cluster.count} 個地點:\n${names}${moreText}`;
  },

  /**
   * 計算聚合點在地圖上的最佳放大等級
   */
  getOptimalZoomForCluster: (cluster: LocationCluster): number => {
    if (cluster.count === 1) {
      return 17; // 單一地點放大到詳細等級
    }
    
    // 根據聚合半徑決定縮放等級
    const radius = cluster.radius;
    
    if (radius > 2000) return 12;
    if (radius > 1000) return 13;
    if (radius > 500) return 14;
    if (radius > 200) return 15;
    return 16;
  }
};