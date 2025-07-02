/**
 * 地圖截圖按鈕元件
 * 提供截圖下載功能的 UI 介面
 */

'use client';

import { useRef, useState } from 'react';
import { useMapScreenshot, ScreenshotOptions, ScreenshotUtils } from '../hooks/useMapScreenshot';

interface MapScreenshotButtonProps {
  /** 地圖容器的引用 */
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  /** 按鈕樣式類別 */
  className?: string;
  /** 預設截圖選項 */
  defaultOptions?: Partial<ScreenshotOptions>;
  /** 截圖成功回調 */
  onSuccess?: () => void;
  /** 截圖失敗回調 */
  onError?: (error: string) => void;
}

export function MapScreenshotButton({ 
  mapContainerRef, 
  className = '',
  defaultOptions = {},
  onSuccess,
  onError
}: MapScreenshotButtonProps) {
  const { 
    captureMap, 
    captureMapSimple,
    isCapturing, 
    error, 
    clearError,
    getRecommendedSettings 
  } = useMapScreenshot();
  
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ScreenshotOptions>({
    filename: 'search-house-map',
    quality: 0.9,
    backgroundColor: '#ffffff',
    includeTimestamp: true,
    ...defaultOptions
  });

  // 處理截圖
  const handleScreenshot = async (customOptions?: Partial<ScreenshotOptions>) => {
    if (!mapContainerRef.current) {
      const errorMsg = '找不到地圖容器';
      console.error('❌', errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      clearError();
      
      const finalOptions = { ...options, ...customOptions };
      console.log('📷 開始截圖，選項:', finalOptions);
      
      // 嘗試主要截圖方法
      try {
        await captureMap(mapContainerRef.current, finalOptions);
        console.log('✅ 截圖成功');
        onSuccess?.();
      } catch (mainError) {
        console.warn('⚠️ 主要截圖方法失敗，嘗試簡化配置:', mainError);
        
        // 備用截圖方法：使用更簡單的配置
        const simpleOptions = {
          ...finalOptions,
          quality: 0.8, // 降低品質
        };
        
        await captureMapSimple(mapContainerRef.current, simpleOptions);
        console.log('✅ 簡化截圖成功');
        onSuccess?.();
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '截圖失敗';
      console.error('❌ 截圖錯誤:', errorMsg);
      onError?.(errorMsg);
    }
  };

  // 快速截圖（使用預設設定）
  const handleQuickScreenshot = () => {
    handleScreenshot();
  };

  // 取得建議設定
  const getMapInfo = () => {
    if (!mapContainerRef.current) return null;
    return getRecommendedSettings(mapContainerRef.current);
  };

  return (
    <div className="relative">
      {/* 主要截圖按鈕 */}
      <button
        onClick={handleQuickScreenshot}
        disabled={isCapturing || !mapContainerRef.current}
        className={`
          flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
          hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
          transition-colors ${className}
        `}
        title="下載地圖截圖"
      >
        {isCapturing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>截圖中...</span>
          </>
        ) : (
          <>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span>下載截圖</span>
          </>
        )}
      </button>

      {/* 進階選項按鈕 */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="ml-1 p-2 text-gray-600 hover:text-gray-800 transition-colors"
        title="截圖選項"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {/* 選項面板 */}
      {showOptions && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-80">
          <h3 className="font-medium text-gray-900 mb-3">截圖選項</h3>
          
          {/* 檔案名稱 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              檔案名稱
            </label>
            <input
              type="text"
              value={options.filename || ''}
              onChange={(e) => setOptions(prev => ({ ...prev, filename: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="search-house-map"
            />
          </div>

          {/* 品質設定 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              圖片品質: {Math.round((options.quality || 0.9) * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={options.quality || 0.9}
              onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>檔案較小</span>
              <span>品質較高</span>
            </div>
          </div>

          {/* 時間戳記 */}
          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeTimestamp || false}
                onChange={(e) => setOptions(prev => ({ ...prev, includeTimestamp: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">包含時間戳記</span>
            </label>
          </div>

          {/* 地圖資訊 */}
          {mapContainerRef.current && (
            <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <div className="font-medium mb-1">地圖資訊:</div>
              {(() => {
                const info = getMapInfo();
                if (!info) return null;
                return (
                  <div className="space-y-1">
                    <div>尺寸: {info.width} × {info.height}</div>
                    <div>比例: {info.aspectRatio.toFixed(2)}</div>
                    <div>預估大小: {info.estimatedFileSize}</div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 動作按鈕 */}
          <div className="flex gap-2">
            <button
              onClick={() => handleScreenshot()}
              disabled={isCapturing}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isCapturing ? '截圖中...' : '截圖下載'}
            </button>
            <button
              onClick={() => setShowOptions(false)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm z-50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 簡化版截圖按鈕（只有基本功能）
 */
export function SimpleMapScreenshotButton({ 
  mapContainerRef, 
  className = '',
  onSuccess,
  onError 
}: {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const { captureMap, isCapturing } = useMapScreenshot();

  const handleClick = async () => {
    if (!mapContainerRef.current) {
      onError?.('找不到地圖容器');
      return;
    }

    try {
      await captureMap(mapContainerRef.current, {
        filename: ScreenshotUtils.generateFilename('map'),
        quality: 0.9,
        includeTimestamp: false
      });
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '截圖失敗');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isCapturing}
      className={`
        p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
        disabled:opacity-50 transition-colors ${className}
      `}
      title="下載截圖"
    >
      {isCapturing ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
    </button>
  );
}