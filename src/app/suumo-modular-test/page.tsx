'use client';

import { useState } from 'react';
import SearchLayout from '../../components/layout/SearchLayout';

export default function SuumoModularTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testModularApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 測試模組化 SUUMO API...');
      
      const response = await fetch('/api/suumo/test-modular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          center: { lat: 35.6762, lng: 139.6503 }, // 東京車站
          radius: 800
        })
      });

      const data = await response.json();
      setResult(data);
      
      console.log('✅ 模組化 API 測試完成:', data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      setError(errorMessage);
      console.error('❌ 模組化 API 測試失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-light text-[#111111] mb-6">
            模組化 SUUMO API 測試
          </h1>
          
          <div className="mb-6">
            <p className="text-[#666666] mb-4">
              測試新的模組化 SUUMO 工具：Token 管理 + API 客戶端 + 資料處理
            </p>
            
            <button
              onClick={testModularApi}
              disabled={loading}
              className="px-6 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? '測試中...' : '測試模組化 API'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6">
              <h3 className="text-red-800 font-medium mb-2">錯誤</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* 基本資訊 */}
              <div className="bg-gray-50 border border-[#e5e5e5] p-4">
                <h3 className="text-lg font-medium text-[#111111] mb-3">測試結果</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#666666]">狀態:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? '成功' : '失敗'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666666]">物件數:</span>
                    <span className="ml-2 text-[#111111]">{result.data?.properties?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-[#666666]">總命中數:</span>
                    <span className="ml-2 text-[#111111]">{result.data?.summary?.totalHits || 0}</span>
                  </div>
                  <div>
                    <span className="text-[#666666]">查詢時間:</span>
                    <span className="ml-2 text-[#111111]">{result.data?.metadata?.queryTime || 0}ms</span>
                  </div>
                </div>
              </div>

              {/* 效能統計 */}
              {result.data?.timing && (
                <div className="bg-blue-50 border border-blue-200 p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-3">效能分析</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Token 獲取:</span>
                      <span className="ml-2 text-[#111111]">{result.data.timing.tokenFetch}ms</span>
                    </div>
                    <div>
                      <span className="text-blue-700">API 呼叫:</span>
                      <span className="ml-2 text-[#111111]">{result.data.timing.apiCall}ms</span>
                    </div>
                    <div>
                      <span className="text-blue-700">資料處理:</span>
                      <span className="ml-2 text-[#111111]">{result.data.timing.processing}ms</span>
                    </div>
                    <div>
                      <span className="text-blue-700">總時間:</span>
                      <span className="ml-2 text-[#111111]">{result.data.timing.total}ms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 物件列表 */}
              {result.data?.properties && result.data.properties.length > 0 && (
                <div className="bg-white border border-[#e5e5e5] p-4">
                  <h3 className="text-lg font-medium text-[#111111] mb-3">
                    找到的物件 ({result.data.properties.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {result.data.properties.slice(0, 6).map((property: any, index: number) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 p-3 bg-white hover:border-blue-300 transition-colors cursor-pointer"
                        onClick={() => {
                          if (property.url) {
                            console.log('🔗 開啟 SUUMO 物件頁面:', property.url);
                            window.open(property.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h5 className="text-sm font-medium text-[#111111] line-clamp-2 hover:text-blue-600 transition-colors">
                              {property.title}
                            </h5>
                            <span className="text-sm font-bold text-blue-600 whitespace-nowrap ml-2">
                              {property.price}
                            </span>
                          </div>
                          
                          <div className="text-xs text-[#666666] space-y-1">
                            <div>位置: {property.location}</div>
                            <div>面積: {property.size}</div>
                            <div>座標: {property.coordinates?.lat.toFixed(4)}, {property.coordinates?.lng.toFixed(4)}</div>
                          </div>
                          
                          {property.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {property.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-sm">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {result.data.properties.length > 6 && (
                    <div className="mt-3 text-center">
                      <span className="text-sm text-[#666666]">
                        還有 {result.data.properties.length - 6} 個物件...
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 搜尋條件 */}
              {result.data?.summary?.searchCondition && (
                <div className="bg-green-50 border border-green-200 p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-3">搜尋條件</h3>
                  <p className="text-sm text-green-700">{result.data.summary.searchCondition}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SearchLayout>
  );
}