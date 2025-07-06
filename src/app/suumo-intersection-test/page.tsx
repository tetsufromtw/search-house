'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export default function SuumoIntersectionTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 測試案例
  const testCases = [
    {
      name: '澀谷區域多重需求',
      requirements: ['starbucks', 'gym', 'convenience'],
      center: { lat: 35.6598, lng: 139.7006 },
      searchRadius: 1000,
      intersectionRadius: 500
    },
    {
      name: '新宿區域咖啡+健身房',
      requirements: ['starbucks', 'gym'],
      center: { lat: 35.6938, lng: 139.7034 },
      searchRadius: 800,
      intersectionRadius: 400
    },
    {
      name: '東京車站附近便利商店',
      requirements: ['convenience'],
      center: { lat: 35.6762, lng: 139.6503 },
      searchRadius: 600,
      intersectionRadius: 300
    }
  ];

  const runTest = async (testCase: any, index: number) => {
    setIsLoading(true);
    
    try {
      console.log(`🧪 開始測試 ${index + 1}: ${testCase.name}`);
      
      const startTime = Date.now();
      
      const response = await fetch('/api/osm-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase)
      });
      
      const endTime = Date.now();
      const responseData = await response.json();
      
      const result: TestResult = {
        success: response.ok,
        data: {
          ...responseData,
          responseTime: endTime - startTime,
          testCase: testCase.name
        },
        timestamp: new Date().toLocaleString()
      };
      
      if (!response.ok) {
        result.error = responseData.error || '未知錯誤';
      }
      
      setTestResults(prev => [...prev, result]);
      
      console.log(`✅ 測試 ${index + 1} 完成:`, result);
      
    } catch (error) {
      const result: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : '網路錯誤',
        timestamp: new Date().toLocaleString()
      };
      
      setTestResults(prev => [...prev, result]);
      console.error(`❌ 測試 ${index + 1} 失敗:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    for (let i = 0; i < testCases.length; i++) {
      await runTest(testCases[i], i);
      // 延遲避免API限制
      if (i < testCases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-[#111111] mb-4 tracking-wide">
            SUUMO 交集座標測試
          </h1>
          <p className="text-[#666666] font-light max-w-3xl">
            測試從OSM店鋪查詢結果計算交集區域，並將座標傳遞給SUUMO API的完整流程
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white border border-[#e5e5e5] shadow-sm mb-8">
          <div className="p-6 border-b border-[#e5e5e5]">
            <h2 className="text-xl font-light text-[#111111] mb-4">測試控制</h2>
            
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={runAllTests}
                disabled={isLoading}
                className="px-6 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity disabled:opacity-50 font-light"
              >
                {isLoading ? '測試中...' : '執行所有測試'}
              </button>
              
              <button
                onClick={clearResults}
                disabled={isLoading}
                className="px-6 py-2 border border-[#e5e5e5] text-[#111111] rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50 font-light"
              >
                清除結果
              </button>
            </div>
          </div>

          {/* 測試案例列表 */}
          <div className="p-6">
            <h3 className="text-lg font-light text-[#111111] mb-4">測試案例</h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testCases.map((testCase, index) => (
                <div key={index} className="border border-[#e5e5e5] p-4">
                  <h4 className="font-medium text-[#111111] mb-2">{testCase.name}</h4>
                  <div className="text-sm text-[#666666] space-y-1">
                    <div>需求: {testCase.requirements.join(', ')}</div>
                    <div>中心: {testCase.center.lat.toFixed(4)}, {testCase.center.lng.toFixed(4)}</div>
                    <div>搜尋半徑: {testCase.searchRadius}m</div>
                    <div>交集半徑: {testCase.intersectionRadius}m</div>
                  </div>
                  
                  <button
                    onClick={() => runTest(testCase, index)}
                    disabled={isLoading}
                    className="mt-3 px-4 py-1 text-xs border border-[#e5e5e5] text-[#111111] rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    單獨測試
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 測試結果 */}
        {testResults.length > 0 && (
          <div className="bg-white border border-[#e5e5e5] shadow-sm">
            <div className="p-6 border-b border-[#e5e5e5]">
              <h2 className="text-xl font-light text-[#111111]">測試結果</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {testResults.map((result, index) => (
                <div key={index} className={`border-l-4 pl-4 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[#111111]">
                      測試 {index + 1}: {result.data?.testCase || '未知測試'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-none ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? '成功' : '失敗'}
                      </span>
                      <span className="text-xs text-[#666666]">{result.timestamp}</span>
                    </div>
                  </div>

                  {result.success && result.data ? (
                    <div className="space-y-3">
                      {/* 基本統計 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-[#666666]">回應時間:</span>
                          <span className="ml-2 text-[#111111]">{result.data.responseTime}ms</span>
                        </div>
                        <div>
                          <span className="text-[#666666]">店鋪數:</span>
                          <span className="ml-2 text-[#111111]">{result.data.data?.metadata?.stores_found || 0}</span>
                        </div>
                        <div>
                          <span className="text-[#666666]">交集區域:</span>
                          <span className="ml-2 text-[#111111]">{result.data.data?.metadata?.intersection_areas_found || 0}</span>
                        </div>
                        <div>
                          <span className="text-[#666666]">租屋物件:</span>
                          <span className="ml-2 text-[#111111]">{result.data.data?.metadata?.properties_found || 0}</span>
                        </div>
                      </div>

                      {/* 費用分析 */}
                      {result.data.data?.metadata?.cost_breakdown && (
                        <div className="bg-gray-50 p-3 border border-[#e5e5e5]">
                          <h4 className="text-sm font-medium text-[#111111] mb-2">費用分析</h4>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-[#666666]">OSM查詢:</span>
                              <span className="ml-2 text-green-600">$0.0000</span>
                            </div>
                            <div>
                              <span className="text-[#666666]">SUUMO查詢:</span>
                              <span className="ml-2 text-blue-600">
                                ${result.data.data.metadata.cost_breakdown.suumo_queries.toFixed(4)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#666666]">總費用:</span>
                              <span className="ml-2 text-[#111111]">
                                ${result.data.data.metadata.total_api_cost.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 交集區域詳細資訊 */}
                      {result.data.data?.intersection_areas && result.data.data.intersection_areas.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-[#111111] mb-2">交集區域座標</h4>
                          <div className="space-y-2">
                            {result.data.data.intersection_areas.map((area: any, areaIndex: number) => (
                              <div key={areaIndex} className="bg-blue-50 p-3 border border-blue-200 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-blue-700 font-medium">中心點:</span>
                                    <div className="text-blue-600">
                                      {area.center.lat.toFixed(6)}, {area.center.lng.toFixed(6)}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-blue-700 font-medium">邊界:</span>
                                    <div className="text-blue-600">
                                      N:{area.bounds.north.toFixed(6)} S:{area.bounds.south.toFixed(6)}<br/>
                                      E:{area.bounds.east.toFixed(6)} W:{area.bounds.west.toFixed(6)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 租屋物件詳細資訊 */}
                      {result.data.data?.properties && result.data.data.properties.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-[#111111] mb-2">找到的租屋物件</h4>
                          {result.data.data.properties.map((propertyGroup: any, groupIndex: number) => (
                            <div key={groupIndex} className="border border-[#e5e5e5]">
                              <div className="bg-gray-50 p-3 border-b border-[#e5e5e5]">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-[#111111]">
                                    交集區域 {groupIndex + 1}
                                  </span>
                                  <span className="text-xs text-[#666666]">
                                    {propertyGroup.count || 0} 個物件
                                  </span>
                                </div>
                                <div className="text-xs text-[#666666] mt-1">
                                  中心: {propertyGroup.area_center?.lat.toFixed(4)}, {propertyGroup.area_center?.lng.toFixed(4)}
                                </div>
                              </div>
                              
                              {propertyGroup.properties && propertyGroup.properties.length > 0 ? (
                                <div className="p-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    {propertyGroup.properties.slice(0, 6).map((property: any, propIndex: number) => (
                                      <div key={propIndex} className="border border-gray-200 p-3 bg-white hover:border-blue-300 transition-colors cursor-pointer"
                                           onClick={() => {
                                             if (property.url) {
                                               console.log('🔗 開啟 SUUMO 物件頁面:', property.url);
                                               window.open(property.url, '_blank', 'noopener,noreferrer');
                                             } else {
                                               console.warn('⚠️ 物件缺少 URL:', property);
                                             }
                                           }}>
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-start">
                                            <h5 className="text-sm font-medium text-[#111111] line-clamp-2 hover:text-blue-600 transition-colors">
                                              {property.title || property.name || `物件 ${propIndex + 1}`}
                                            </h5>
                                            <span className="text-sm font-bold text-blue-600 whitespace-nowrap ml-2">
                                              {property.price || property.rent || 'N/A'}
                                            </span>
                                          </div>
                                          
                                          <div className="text-xs text-[#666666] space-y-1">
                                            {property.layout && (
                                              <div>間取: {property.layout}</div>
                                            )}
                                            {property.address && (
                                              <div>地址: {property.address}</div>
                                            )}
                                            {property.access && (
                                              <div>交通: {property.access}</div>
                                            )}
                                            {property.age && (
                                              <div>築年: {property.age}</div>
                                            )}
                                            {property.area && (
                                              <div>面積: {property.area}</div>
                                            )}
                                          </div>
                                          
                                          {(property.features || property.tags) && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {(property.features || property.tags || []).slice(0, 3).map((feature: string, fIndex: number) => (
                                                <span key={fIndex} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-sm">
                                                  {feature}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {propertyGroup.properties.length > 6 && (
                                    <div className="mt-3 text-center">
                                      <span className="text-sm text-[#666666]">
                                        還有 {propertyGroup.properties.length - 6} 個物件...
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-3 text-center text-sm text-[#666666]">
                                  此區域暫無物件資料
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 摘要 */}
                      {result.data.data?.metadata?.summary && (
                        <div className="bg-green-50 p-3 border border-green-200">
                          <h4 className="text-sm font-medium text-green-800 mb-1">搜尋摘要</h4>
                          <p className="text-sm text-green-700">{result.data.data.metadata.summary}</p>
                        </div>
                      )}
                    </div>
                  ) : result.error && (
                    <div className="bg-red-50 p-3 border border-red-200">
                      <h4 className="text-sm font-medium text-red-800 mb-1">錯誤訊息</h4>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 載入狀態 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 border border-[#e5e5e5] max-w-sm w-full mx-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#111111]"></div>
                <span className="text-[#111111]">正在執行測試...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}