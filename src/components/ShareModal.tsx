/**
 * 社群分享彈窗元件
 * 整合地圖截圖功能與社群媒體分享
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMapScreenshot } from '@/hooks/useMapScreenshot';

interface ShareModalProps {
  /** 是否顯示彈窗 */
  isOpen: boolean;
  /** 關閉彈窗回調 */
  onClose: () => void;
  /** 地圖容器 ref */
  mapContainerRef: React.RefObject<HTMLDivElement>;
  /** 分享資訊 */
  shareInfo?: {
    title?: string;
    description?: string;
    hashtags?: string[];
  };
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  shareUrl: (text: string, url: string, hashtags?: string[]) => string;
  supportsImage: boolean;
}

const socialPlatforms: SocialPlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram 限時動態',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    shareUrl: (text: string, url: string, hashtags?: string[]) => {
      // Instagram 不支援直接分享連結，需要複製內容
      return '';
    },
    supportsImage: true
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-.584-2.043-1.496-3.467-2.713-4.24-1.404-1.08-3.25-1.632-5.496-1.645h-.01c-2.906.017-5.043.918-6.347 2.68C4.688 6.652 4.108 8.751 4.093 11.99c.017 3.23.599 5.325 1.731 6.22 1.292 1.279 3.457 1.929 6.437 1.93h.014c1.727-.006 3.144-.302 4.314-.913 1.153-.601 2.007-1.479 2.55-2.617.405-.849.633-1.8.663-2.754v-.027c-.024-.948-.252-1.903-.651-2.756-.5-1.066-1.313-1.914-2.42-2.522C15.302 6.99 13.793 6.64 12.037 6.64h-.014c-1.756 0-3.264.35-4.694 1.062-1.107.608-1.92 1.456-2.42 2.522-.242.518-.4 1.074-.468 1.634h-.007c-.001.004-.001.008-.001.012 0 .004 0 .008.001.012h.007c.068.56.226 1.116.468 1.634.5 1.066 1.313 1.914 2.42 2.522 1.43.712 2.938 1.062 4.694 1.062h.014c1.756 0 3.264-.35 4.694-1.062 1.107-.608 1.92-1.456 2.42-2.522.242-.518.4-1.074.468-1.634h.007c.001-.004.001-.008.001-.012 0-.004 0-.008-.001-.012h-.007c-.068-.56-.226-1.116-.468-1.634-.5-1.066-1.313-1.914-2.42-2.522C15.301 8.99 13.793 8.64 12.037 8.64h-.014c-1.756 0-3.264.35-4.694 1.062-1.107.608-1.92 1.456-2.42 2.522-.399.853-.627 1.808-.651 2.756v.027c.03.954.258 1.905.663 2.754.543 1.138 1.397 2.016 2.55 2.617 1.17.611 2.587.907 4.314.913h.014"/>
      </svg>
    ),
    color: 'bg-black',
    shareUrl: (text: string, url: string, hashtags?: string[]) => {
      const hashtagString = hashtags ? hashtags.map(tag => `#${tag}`).join(' ') : '';
      const content = `${text} ${hashtagString}`.trim();
      return `https://threads.net/intent/post?text=${encodeURIComponent(content)}`;
    },
    supportsImage: false
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: 'bg-black',
    shareUrl: (text: string, url: string, hashtags?: string[]) => {
      const hashtagString = hashtags ? hashtags.map(tag => `#${tag}`).join(' ') : '';
      const content = `${text} ${hashtagString}`.trim();
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}&url=${encodeURIComponent(url)}`;
    },
    supportsImage: false
  }
];

export default function ShareModal({ 
  isOpen, 
  onClose, 
  mapContainerRef,
  shareInfo = {}
}: ShareModalProps) {
  const { captureMapAsDataURL, isCapturing, error } = useMapScreenshot();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    title = '🏠 發現完美租屋地點！',
    description = '透過 Search House 找到了理想的租屋區域，查看我的搜尋結果！',
    hashtags = ['SearchHouse', '租屋', '找房子', '台北租屋', 'RentalHunting']
  } = shareInfo;

  // 生成分享文字
  const getShareText = useCallback(() => {
    return `${title}\n\n${description}\n\n查看詳細結果: ${window.location.href}`;
  }, [title, description]);

  // 截圖並生成預覽
  const handleCaptureScreenshot = useCallback(async () => {
    if (!mapContainerRef.current) {
      console.error('找不到地圖容器');
      return;
    }

    try {
      console.log('🔄 開始截圖...');
      
      // 尋找實際的地圖元素 - Leaflet 專用
      const leafletContainer = mapContainerRef.current.querySelector('.leaflet-container') as HTMLElement;
      const targetElement = leafletContainer || mapContainerRef.current;
      
      console.log('📍 截圖目標:', {
        容器: targetElement.tagName,
        類別: targetElement.className,
        尺寸: `${targetElement.offsetWidth}x${targetElement.offsetHeight}`,
        是否為Leaflet: !!leafletContainer
      });
      
      const dataURL = await captureMapAsDataURL(targetElement, {
        quality: 0.9,
        backgroundColor: '#ffffff'
      });
      
      setCapturedImage(dataURL);
      setShowImagePreview(true);
      console.log('✅ 截圖完成');
    } catch (error) {
      console.error('❌ 截圖失敗:', error);
    }
  }, [mapContainerRef, captureMapAsDataURL]);

  // 處理社群分享
  const handleSocialShare = useCallback((platform: SocialPlatform) => {
    const shareText = getShareText();
    const currentUrl = window.location.href;

    if (platform.id === 'instagram') {
      // Instagram 需要特殊處理，複製文字和圖片
      if (capturedImage) {
        // 將圖片複製到剪貼板
        fetch(capturedImage)
          .then(res => res.blob())
          .then(blob => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
              // 複製文字到剪貼板
              navigator.clipboard.writeText(`${shareText}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`);
              alert('📋 圖片和文字已複製到剪貼板！\n請打開 Instagram 並貼上內容。');
            });
          })
          .catch(err => {
            console.error('複製圖片失敗:', err);
            // 備用方案：只複製文字
            navigator.clipboard.writeText(`${shareText}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`);
            alert('📋 文字已複製到剪貼板！\n請手動儲存圖片並分享到 Instagram。');
          });
      } else {
        // 沒有圖片時只複製文字
        navigator.clipboard.writeText(`${shareText}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`);
        alert('📋 文字已複製到剪貼板！\n請先截圖後再分享到 Instagram。');
      }
    } else {
      // 其他平台直接開啟分享連結
      const shareUrl = platform.shareUrl(shareText, currentUrl, hashtags);
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }, [getShareText, hashtags, capturedImage]);

  // 下載截圖
  const handleDownloadImage = useCallback(() => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `search-house-map-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  }, [capturedImage]);

  // 關閉彈窗時重置狀態
  const handleClose = useCallback(() => {
    setCapturedImage(null);
    setShowImagePreview(false);
    onClose();
  }, [onClose]);

  // ESC 鍵關閉彈窗
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // 防止背景滾動
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">📤 分享你的搜尋結果</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 分享內容預覽 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">分享內容預覽</h3>
            <div className="space-y-2">
              <div className="font-semibold text-gray-800">{title}</div>
              <div className="text-gray-600">{description}</div>
              <div className="text-sm text-blue-600">
                {hashtags.map(tag => `#${tag}`).join(' ')}
              </div>
            </div>
          </div>

          {/* 截圖區域 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">📷 地圖截圖</h3>
              <button
                onClick={handleCaptureScreenshot}
                disabled={isCapturing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isCapturing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>截圖中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>截圖地圖</span>
                  </>
                )}
              </button>
            </div>

            {/* 圖片預覽 */}
            {showImagePreview && capturedImage && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ height: '200px' }}>
                  <img
                    src={capturedImage}
                    alt="地圖截圖預覽"
                    className="max-w-full max-h-full object-contain"
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '180px',
                      width: 'auto',
                      height: 'auto'
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下載圖片
                  </button>
                  <button
                    onClick={() => setShowImagePreview(false)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    重新截圖
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                截圖失敗：{error}
              </div>
            )}
          </div>

          {/* 社群媒體分享按鈕 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">🌐 分享到社群媒體</h3>
            <div className="grid gap-3">
              {socialPlatforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => handleSocialShare(platform)}
                  className={`flex items-center gap-4 p-4 ${platform.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                >
                  {platform.icon}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-sm opacity-90">
                      {platform.id === 'instagram' 
                        ? capturedImage 
                          ? '複製圖片和文字到剪貼板' 
                          : '需要先截圖才能分享'
                        : '開啟分享頁面'
                      }
                    </div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* 使用提示 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 使用提示</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 先點擊「截圖地圖」來捕獲當前搜尋結果</li>
              <li>• Instagram 需要手動貼上內容到限時動態</li>
              <li>• Threads 和 Twitter 會自動開啟分享頁面</li>
              <li>• 可以下載圖片後手動上傳到其他平台</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}