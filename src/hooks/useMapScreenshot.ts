/**
 * 地圖截圖 Hook
 * 支援下載當前地圖畫面（包含圓圈和標記）為 PNG 檔案
 */

import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';

export interface ScreenshotOptions {
  /** 檔案名稱（不含副檔名） */
  filename?: string;
  /** 圖片品質 (0-1) */
  quality?: number;
  /** 背景顏色 */
  backgroundColor?: string;
  /** 是否包含日期時間戳記 */
  includeTimestamp?: boolean;
  /** 圖片寬度 */
  width?: number;
  /** 圖片高度 */
  height?: number;
}

export interface ScreenshotState {
  /** 是否正在截圖中 */
  isCapturing: boolean;
  /** 截圖錯誤訊息 */
  error: string | null;
  /** 最後截圖時間 */
  lastCaptureTime: number | null;
}

/**
 * 地圖截圖 Hook
 */
export function useMapScreenshot() {
  const [state, setState] = useState<ScreenshotState>({
    isCapturing: false,
    error: null,
    lastCaptureTime: null
  });

  /**
   * 簡化版截圖功能（備用方案）
   */
  const captureMapSimple = useCallback(async (
    mapContainer: HTMLElement,
    options: ScreenshotOptions = {}
  ): Promise<void> => {
    const {
      filename = 'map-screenshot',
      quality = 0.8,
      backgroundColor = '#ffffff',
      includeTimestamp = true
    } = options;

    setState(prev => ({ ...prev, isCapturing: true, error: null }));

    try {
      console.log('🔄 簡化截圖模式...');

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 使用最簡單的配置
      const canvas = await html2canvas(mapContainer, {
        backgroundColor,
        scale: 1,
        logging: false,
        useCORS: false,
        allowTaint: true,
        ignoreElements: (element) => {
          const className = element.className;
          if (typeof className === 'string') {
            return className.includes('gmnoprint') || className.includes('gm-control');
          }
          return false;
        }
      });

      // 轉換為 Blob 並下載
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('無法生成圖片 Blob'));
          }
        }, 'image/png', quality);
      });

      const timestamp = includeTimestamp ? 
        `-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}` : '';
      const finalFilename = `${filename}${timestamp}.png`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setState(prev => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now()
      }));

    } catch (error) {
      console.error('❌ 簡化截圖失敗:', error);
      
      const errorMessage = error instanceof Error ? error.message : '簡化截圖發生未知錯誤';
      setState(prev => ({
        ...prev,
        isCapturing: false,
        error: errorMessage
      }));
      
      throw error;
    }
  }, []);

  /**
   * 截圖並下載地圖
   */
  const captureMap = useCallback(async (
    mapContainer: HTMLElement,
    options: ScreenshotOptions = {}
  ): Promise<void> => {
    const {
      filename = 'map-screenshot',
      quality = 0.9,
      backgroundColor = '#ffffff',
      includeTimestamp = true,
      width,
      height
    } = options;

    setState(prev => ({ ...prev, isCapturing: true, error: null }));

    try {
      console.log('🔄 開始截圖地圖...');

      // 等待一小段時間確保地圖完全載入
      await new Promise(resolve => setTimeout(resolve, 500));

      // 找到實際的地圖元素 - 使用更精確的選擇器
      let mapElement = mapContainer.querySelector('.gm-style') as HTMLElement;
      
      // 如果找不到，嘗試其他選擇器
      if (!mapElement) {
        mapElement = mapContainer.querySelector('div[style*="position: relative"]') as HTMLElement;
      }
      
      // 如果還是找不到，使用容器本身
      const targetElement = mapElement || mapContainer;
      
      // 確保目標元素有正確的尺寸
      if (targetElement.offsetWidth === 0 || targetElement.offsetHeight === 0) {
        throw new Error('地圖元素尺寸為零，無法截圖');
      }
      
      console.log('🎯 截圖目標:', {
        容器: mapContainer.tagName,
        容器尺寸: `${mapContainer.offsetWidth}x${mapContainer.offsetHeight}`,
        地圖元素: mapElement?.tagName,
        地圖尺寸: mapElement ? `${mapElement.offsetWidth}x${mapElement.offsetHeight}` : '未找到'
      });

      // html2canvas 配置
      const canvas = await html2canvas(targetElement, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: backgroundColor || '#ffffff',
        width: targetElement.offsetWidth,
        height: targetElement.offsetHeight,
        scale: 1, // 暫時使用 1 避免高 DPI 問題
        logging: true, // 暫時開啟 logging 調試
        foreignObjectRendering: false, // 關閉可能導致問題的功能
        imageTimeout: 30000,
        removeContainer: false,
        ignoreElements: (element) => {
          // 忽略某些不需要截圖的元素
          const className = element.className;
          if (typeof className === 'string') {
            // Google Maps 控制元件
            if (className.includes('gmnoprint') || 
                className.includes('gm-control') ||
                className.includes('gm-fullscreen') ||
                className.includes('gm-svpc') ||
                className.includes('gm-bundled-control') ||
                className.includes('gm-style-cc')) {
              return true;
            }
          }
          
          // 隱藏的元素
          const computedStyle = window.getComputedStyle(element);
          if (computedStyle.display === 'none' || 
              computedStyle.visibility === 'hidden' ||
              computedStyle.opacity === '0') {
            return true;
          }
          
          return false;
        },
        onclone: (clonedDoc, element) => {
          console.log('🔄 Clone 處理中...');
          
          try {
            // 檢查 clonedDoc 結構
            if (!clonedDoc || !clonedDoc.documentElement) {
              console.warn('⚠️ clonedDoc 結構異常');
              return;
            }
            
            // 確保 head 元素存在
            let head = clonedDoc.head;
            if (!head) {
              console.log('📝 創建 head 元素');
              head = clonedDoc.createElement('head');
              if (clonedDoc.documentElement.firstChild) {
                clonedDoc.documentElement.insertBefore(head, clonedDoc.documentElement.firstChild);
              } else {
                clonedDoc.documentElement.appendChild(head);
              }
            }
            
            // 等待地圖瓦片載入
            const mapTiles = clonedDoc.querySelectorAll('img[src*="maps.googleapis.com"], img[src*="gstatic.com"]');
            console.log(`🗺️ 找到 ${mapTiles.length} 個地圖瓦片`);
            
            // 處理 oklch 顏色問題並修正地圖樣式
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * {
                color: rgb(17, 24, 39) !important;
                box-sizing: border-box;
                image-rendering: auto !important;
              }
              
              /* 確保地圖容器正確顯示 */
              .gm-style, .map-screenshot-container, [data-testid="map"] {
                background-color: rgb(229, 231, 235) !important;
                overflow: visible !important;
                position: relative !important;
              }
              
              /* 地圖瓦片修正 */
              img[src*="maps.googleapis.com"], img[src*="gstatic.com"] {
                max-width: none !important;
                image-rendering: auto !important;
                -webkit-image-smoothing: true !important;
                opacity: 1 !important;
                display: block !important;
              }
              
              /* 圓圈和標記修正 */
              svg, circle {
                vector-effect: non-scaling-stroke !important;
                pointer-events: none !important;
              }
              
              /* Google Maps 標記修正 */
              img[src*="marker"], img[src*="pin"], img[src*="spotlight"] {
                image-rendering: auto !important;
                -webkit-image-smoothing: true !important;
                filter: none !important;
              }
              
              /* 隱藏可能破圖的元素 */
              .gm-style-cc, .gmnoprint, .gm-bundled-control, .gm-fullscreen-control {
                display: none !important;
              }
              
              /* Tailwind 顏色修正 */
              .bg-white { background-color: rgb(255, 255, 255) !important; }
              .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
              .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
              .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
              .bg-blue-100 { background-color: rgb(219, 234, 254) !important; }
              .bg-blue-600 { background-color: rgb(37, 99, 235) !important; }
              .bg-blue-700 { background-color: rgb(29, 78, 216) !important; }
              .bg-green-100 { background-color: rgb(220, 252, 231) !important; }
              .bg-red-50 { background-color: rgb(254, 242, 242) !important; }
              .text-white { color: rgb(255, 255, 255) !important; }
              .text-gray-600 { color: rgb(75, 85, 99) !important; }
              .text-gray-700 { color: rgb(55, 65, 81) !important; }
              .text-gray-900 { color: rgb(17, 24, 39) !important; }
              .text-blue-600 { color: rgb(37, 99, 235) !important; }
              .text-blue-800 { color: rgb(30, 64, 175) !important; }
              .text-green-600 { color: rgb(22, 163, 74) !important; }
              .text-green-800 { color: rgb(22, 101, 52) !important; }
              .text-red-600 { color: rgb(220, 38, 38) !important; }
              .text-red-700 { color: rgb(185, 28, 28) !important; }
              .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
              .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
              .border-red-200 { border-color: rgb(254, 202, 202) !important; }
            `;
            
            head.appendChild(style);
            console.log('✅ 樣式已注入');
            
            // 強制設定地圖容器尺寸
            const mapContainers = clonedDoc.querySelectorAll('.gm-style, .map-screenshot-container');
            mapContainers.forEach(container => {
              if (container instanceof HTMLElement) {
                container.style.width = targetElement.offsetWidth + 'px';
                container.style.height = targetElement.offsetHeight + 'px';
                container.style.position = 'relative';
                container.style.overflow = 'visible';
              }
            });
            
            console.log(`🔧 已設定 ${mapContainers.length} 個地圖容器尺寸`);
            
          } catch (error) {
            console.error('❌ onclone 處理錯誤:', error);
          }
        }
      });

      console.log('✅ Canvas 生成成功:', {
        寬度: canvas.width,
        高度: canvas.height,
        品質: quality
      });

      // 轉換為 Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('無法生成圖片 Blob'));
          }
        }, 'image/png', quality);
      });

      // 生成檔案名稱
      const timestamp = includeTimestamp ? 
        `-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}` : '';
      const finalFilename = `${filename}${timestamp}.png`;

      // 下載檔案
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理 URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      console.log('📷 截圖下載成功:', finalFilename);

      setState(prev => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now()
      }));

    } catch (error) {
      console.error('❌ 截圖失敗:', error);
      
      const errorMessage = error instanceof Error ? error.message : '截圖發生未知錯誤';
      setState(prev => ({
        ...prev,
        isCapturing: false,
        error: errorMessage
      }));
      
      throw error;
    }
  }, []);

  /**
   * 捕獲地圖為 Base64 資料 URI（不下載）
   */
  const captureMapAsDataURL = useCallback(async (
    mapContainer: HTMLElement,
    options: Omit<ScreenshotOptions, 'filename' | 'includeTimestamp'> = {}
  ): Promise<string> => {
    const {
      quality = 0.9,
      backgroundColor = '#ffffff',
      width,
      height
    } = options;

    setState(prev => ({ ...prev, isCapturing: true, error: null }));

    try {
      console.log('🔄 生成地圖 Base64...');

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        backgroundColor,
        width: width || mapContainer.offsetWidth,
        height: height || mapContainer.offsetHeight,
        scale: window.devicePixelRatio || 1,
        logging: false,
        foreignObjectRendering: true,
        imageTimeout: 15000,
        ignoreElements: (element) => {
          const className = element.className;
          if (typeof className === 'string') {
            // Google Maps 控制元件
            if (className.includes('gmnoprint') || 
                className.includes('gm-control') ||
                className.includes('gm-fullscreen')) {
              return true;
            }
            // Leaflet 控制元件
            if (className.includes('leaflet-control-zoom') || 
                className.includes('leaflet-control-attribution') ||
                className.includes('leaflet-bar')) {
              return true;
            }
          }
          return false;
        },
        onclone: (clonedDoc) => {
          // 處理 oklch 顏色問題：將所有 oklch 顏色轉換為 rgb
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: rgb(17, 24, 39) !important;
            }
            .bg-white { background-color: rgb(255, 255, 255) !important; }
            .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
            .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
            .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
            .bg-blue-100 { background-color: rgb(219, 234, 254) !important; }
            .bg-blue-600 { background-color: rgb(37, 99, 235) !important; }
            .bg-blue-700 { background-color: rgb(29, 78, 216) !important; }
            .bg-green-100 { background-color: rgb(220, 252, 231) !important; }
            .bg-red-50 { background-color: rgb(254, 242, 242) !important; }
            .text-white { color: rgb(255, 255, 255) !important; }
            .text-gray-600 { color: rgb(75, 85, 99) !important; }
            .text-gray-700 { color: rgb(55, 65, 81) !important; }
            .text-gray-900 { color: rgb(17, 24, 39) !important; }
            .text-blue-600 { color: rgb(37, 99, 235) !important; }
            .text-blue-800 { color: rgb(30, 64, 175) !important; }
            .text-green-600 { color: rgb(22, 163, 74) !important; }
            .text-green-800 { color: rgb(22, 101, 52) !important; }
            .text-red-600 { color: rgb(220, 38, 38) !important; }
            .text-red-700 { color: rgb(185, 28, 28) !important; }
            .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
            .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
            .border-red-200 { border-color: rgb(254, 202, 202) !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      const dataURL = canvas.toDataURL('image/png', quality);

      setState(prev => ({
        ...prev,
        isCapturing: false,
        lastCaptureTime: Date.now()
      }));

      console.log('✅ Base64 生成成功');
      return dataURL;

    } catch (error) {
      console.error('❌ Base64 生成失敗:', error);
      
      const errorMessage = error instanceof Error ? error.message : '生成 Base64 發生未知錯誤';
      setState(prev => ({
        ...prev,
        isCapturing: false,
        error: errorMessage
      }));
      
      throw error;
    }
  }, []);

  /**
   * 清除錯誤狀態
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * 取得截圖建議設定
   */
  const getRecommendedSettings = useCallback((mapContainer: HTMLElement) => {
    const rect = mapContainer.getBoundingClientRect();
    
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      aspectRatio: rect.width / rect.height,
      recommendedQuality: rect.width > 1920 ? 0.8 : 0.9, // 大圖降低品質
      estimatedFileSize: `${Math.round((rect.width * rect.height * 3) / 1024)}KB` // 粗估
    };
  }, []);

  return {
    // 狀態
    ...state,
    
    // 核心功能
    captureMap,
    captureMapSimple,
    captureMapAsDataURL,
    
    // 工具函數
    clearError,
    getRecommendedSettings,
    
    // 便利方法
    isReady: !state.isCapturing
  };
}

/**
 * 截圖工具函數
 */
export const ScreenshotUtils = {
  /**
   * 格式化檔案大小
   */
  formatFileSize: (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  },

  /**
   * 生成建議的檔案名稱
   */
  generateFilename: (prefix: string = 'map'): string => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `${prefix}-${date}-${time}`;
  },

  /**
   * 檢查瀏覽器相容性
   */
  checkBrowserSupport: (): { supported: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (!HTMLCanvasElement.prototype.toBlob) {
      issues.push('瀏覽器不支援 Canvas.toBlob()');
    }
    
    if (!URL.createObjectURL) {
      issues.push('瀏覽器不支援 URL.createObjectURL()');
    }
    
    if (!document.createElement('a').download) {
      issues.push('瀏覽器不支援下載屬性');
    }

    return {
      supported: issues.length === 0,
      issues
    };
  }
};