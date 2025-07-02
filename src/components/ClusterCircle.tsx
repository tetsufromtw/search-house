/**
 * 聚合圓圈元件
 * 在地圖上顯示聚合的地點群組，支援點擊放大功能
 */

'use client';

import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { LocationCluster } from '../types/multiLocationSearch';
import { ColorUtils } from '../config/searchRequirements';
import { ClusteringUtils } from '../utils/clustering';

interface ClusterCircleProps {
  cluster: LocationCluster;
  onClick?: (cluster: LocationCluster) => void;
}

export function ClusterCircle({ cluster, onClick }: ClusterCircleProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map) return;

    // 清理現有元件
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // 取得顏色樣式
    const baseStyle = ColorUtils.getCircleStyle(cluster.requirementType);
    
    // 聚合點特殊樣式
    const clusterStyle = {
      ...baseStyle,
      fillOpacity: cluster.count > 1 ? 0.3 : 0.2,
      strokeWeight: cluster.count > 1 ? 3 : 2,
      strokeOpacity: cluster.count > 1 ? 1.0 : 0.8
    };

    // 建立聚合圓圈
    const circle = new google.maps.Circle({
      ...clusterStyle,
      map,
      center: cluster.center,
      radius: cluster.count > 1 ? cluster.radius : 300, // 單一地點使用較小半徑
    });

    circleRef.current = circle;

    // 建立聚合標記 (只有多個地點才顯示)
    if (cluster.count > 1) {
      const markerIcon = createClusterMarkerIcon(cluster);
      
      const marker = new google.maps.Marker({
        position: cluster.center,
        map,
        icon: markerIcon,
        title: ClusteringUtils.getClusterInfo(cluster),
        zIndex: 1000 // 確保標記在圓圈上方
      });

      markerRef.current = marker;

      // 標記點擊事件
      marker.addListener('click', () => {
        if (onClick) {
          onClick(cluster);
        }
      });
    }

    // 圓圈點擊事件
    circle.addListener('click', (event: google.maps.MouseEvent) => {
      if (cluster.count === 1) {
        // 單一地點顯示詳細資訊
        const location = cluster.locations[0];
        
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 250px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 12px; height: 12px; background-color: ${baseStyle.fillColor}; border-radius: 50%; margin-right: 8px;"></div>
                <span style="font-weight: bold; color: #1f2937;">${location.requirementId}</span>
              </div>
              <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${location.name || '未知地點'}</h4>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${location.address || '地址未提供'}</p>
              ${location.rating ? `<p style="margin: 0; color: #f59e0b; font-size: 14px;">⭐ ${location.rating}</p>` : ''}
            </div>
          `,
          position: event.latLng || cluster.center
        });
        
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        infoWindowRef.current = infoWindow;
        infoWindow.open(map);
      } else {
        // 多個地點，執行放大操作
        if (onClick) {
          onClick(cluster);
        }
      }
    });

    // 清理函數
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [map, cluster, onClick]);

  return null; // 這個元件不渲染 React DOM，只管理 Google Maps 物件
}

/**
 * 建立聚合標記圖示
 */
function createClusterMarkerIcon(cluster: LocationCluster): google.maps.Icon {
  const baseStyle = ColorUtils.getCircleStyle(cluster.requirementType);
  const size = Math.min(Math.max(30, cluster.count * 3), 60); // 動態大小，30-60px
  const label = ClusteringUtils.getClusterLabel(cluster);
  
  // 建立 SVG 圖示
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle 
        cx="${size/2}" 
        cy="${size/2}" 
        r="${size/2 - 2}" 
        fill="${baseStyle.fillColor}" 
        stroke="${baseStyle.strokeColor}" 
        stroke-width="2"
        opacity="0.9"
      />
      <text 
        x="${size/2}" 
        y="${size/2 + 4}" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="${Math.max(10, size/4)}" 
        font-weight="bold" 
        fill="white"
      >${label}</text>
    </svg>
  `;

  const svgDataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  return {
    url: svgDataUrl,
    size: new google.maps.Size(size, size),
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size/2, size/2)
  };
}