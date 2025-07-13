'use client';

import { useState } from 'react';

interface ScreenshotButtonProps {
  className?: string;
  targetElementId?: string;
  leftPanelCollapsed?: boolean;
  rightPanelCollapsed?: boolean;
}

export default function ScreenshotButton({ 
  className = '',
  targetElementId = 'map-container',
  leftPanelCollapsed = false,
  rightPanelCollapsed = false
}: ScreenshotButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    
    try {
      // 動態載入 dom-to-image-more
      const domtoimage = (await import('dom-to-image-more')).default;
      
      // 找到目標元素
      const targetElement = document.getElementById(targetElementId);
      if (!targetElement) {
        alert('找不到要截圖的區域');
        return;
      }

      // 取得元素的邊界資訊
      const rect = targetElement.getBoundingClientRect();
      
      // 計算左右面板的寬度
      const leftPanelWidth = leftPanelCollapsed ? 64 : rect.width * 0.2;
      const rightPanelWidth = rightPanelCollapsed ? 64 : rect.width * 0.2;
      
      console.log('📸 截圖參數:', {
        原始區域: { width: rect.width, height: rect.height },
        左面板寬度: leftPanelWidth,
        右面板寬度: rightPanelWidth
      });

      // 使用 dom-to-image 進行截圖
      const dataUrl = await domtoimage.toPng(targetElement, {
        quality: 0.95,
        bgcolor: '#ffffff',
        width: rect.width,
        height: rect.height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        filter: (node: Node) => {
          // 跳過可能有問題的節點
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName?.toLowerCase();
            
            // 跳過樣式表和腳本
            if (tagName === 'style' || tagName === 'script' || tagName === 'link') {
              return false;
            }
          }
          return true;
        }
      });

      // 將 Data URL 轉換為 Canvas 進行裁剪
      const img = new Image();
      img.onload = () => {
        // 創建 canvas 進行裁剪
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          alert('無法創建 Canvas context');
          return;
        }

        // 計算裁剪區域
        const cropX = leftPanelWidth;
        const cropY = 0;
        const cropWidth = rect.width - leftPanelWidth - rightPanelWidth;
        const cropHeight = rect.height;

        // 設定 canvas 尺寸
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // 繪製裁剪後的圖像
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight, // 源區域
          0, 0, cropWidth, cropHeight          // 目標區域
        );

        // 轉換為 Blob 並下載
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('截圖失敗，請重試');
            return;
          }

          // 生成檔名
          const now = new Date();
          const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
          const filename = `map-screenshot-${timestamp}.png`;

          // 創建下載連結
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          
          // 觸發下載
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 清理 URL
          URL.revokeObjectURL(url);
          
          console.log('✅ 截圖完成:', filename);
        }, 'image/png', 0.95);
      };

      img.onerror = () => {
        alert('圖像載入失敗，請重試');
      };

      img.src = dataUrl;

    } catch (error) {
      console.error('❌ 截圖失敗:', error);
      alert('截圖失敗，請重試');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <button
      onClick={captureScreenshot}
      disabled={isCapturing}
      className={`inline-flex items-center justify-center transition-all duration-200 focus:outline-none rounded-xl shadow-sm ${
        isCapturing
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-white/90 backdrop-blur-md border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 active:scale-95'
      } ${className}`}
      title="截圖地圖區域"
    >
      {isCapturing ? (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );
}