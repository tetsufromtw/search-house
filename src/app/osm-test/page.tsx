'use client';

import React, { useState } from 'react';

interface OSMTestResult {
  stores: Record<string, any>;
  intersection_areas: any[];
  properties: any[];
  metadata: any;
}

export default function OSMTestPage() {
  const [requirements, setRequirements] = useState<string[]>(['starbucks', 'gym']);
  const [center, setCenter] = useState({ lat: 35.6762, lng: 139.6503 });
  const [searchRadius, setSearchRadius] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OSMTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 開始 OSM 測試搜尋:', {
        requirements,
        center,
        searchRadius
      });

      const response = await fetch('/api/osm-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirements,
          center,
          searchRadius,
          intersectionRadius: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        console.log('✅ OSM 測試成功:', data.data);
      } else {
        throw new Error(data.message || '搜尋失敗');
      }

    } catch (err) {
      console.error('❌ OSM 測試失敗:', err);
      setError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    const newReq = prompt('輸入新需求 (例如: convenience, 便利商店):');
    if (newReq && !requirements.includes(newReq)) {
      setRequirements([...requirements, newReq]);
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗺️ OpenStreetMap + SUUMO 測試
          </h1>
          <p className="text-gray-600">
            零成本店鋪查詢 + 租屋搜尋整合測試
          </p>
        </div>

        {/* 搜尋配置 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">搜尋配置</h2>
          
          {/* 需求管理 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜尋需求
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {requirements.map((req) => (
                <span
                  key={req}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {req}
                  <button
                    onClick={() => removeRequirement(req)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={addRequirement}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                + 新增需求
              </button>
            </div>
          </div>

          {/* 中心座標 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                緯度 (Latitude)
              </label>
              <input
                type="number"
                step="0.0001"
                value={center.lat}
                onChange={(e) => setCenter({...center, lat: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                經度 (Longitude)
              </label>
              <input
                type="number"
                step="0.0001"
                value={center.lng}
                onChange={(e) => setCenter({...center, lng: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 搜尋半徑 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜尋半徑 (公尺)
            </label>
            <input
              type="number"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 搜尋按鈕 */}
          <button
            onClick={handleSearch}
            disabled={loading || requirements.length === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '🔍 搜尋中...' : '🚀 開始搜尋'}
          </button>
        </div>

        {/* 錯誤顯示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="font-semibold">搜尋失敗</p>
            <p>{error}</p>
          </div>
        )}

        {/* 結果顯示 */}
        {result && (
          <div className="space-y-6">
            {/* 摘要統計 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ 搜尋成功
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">店鋪數量:</span>
                  <span className="ml-1">{result.metadata.stores_found}</span>
                </div>
                <div>
                  <span className="font-medium">交集區域:</span>
                  <span className="ml-1">{result.metadata.intersection_areas_found}</span>
                </div>
                <div>
                  <span className="font-medium">租屋物件:</span>
                  <span className="ml-1">{result.metadata.properties_found}</span>
                </div>
                <div>
                  <span className="font-medium">總費用:</span>
                  <span className="ml-1 text-green-600">${result.metadata.total_api_cost.toFixed(4)}</span>
                </div>
              </div>
              <p className="text-green-700 mt-2">{result.metadata.summary}</p>
            </div>

            {/* 店鋪結果 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">🏪 店鋪查詢結果</h3>
              {Object.entries(result.stores).map(([requirement, storeData]: [string, any]) => (
                <div key={requirement} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-lg mb-2 capitalize">
                    {requirement} ({storeData.locations.length} 個)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {storeData.locations.slice(0, 6).map((location: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-gray-600">{location.address}</p>
                        <p className="text-xs text-gray-500">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {location.source}
                        </span>
                      </div>
                    ))}
                  </div>
                  {storeData.locations.length > 6 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ... 還有 {storeData.locations.length - 6} 個地點
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* 交集區域 */}
            {result.intersection_areas.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">🎯 交集區域</h3>
                {result.intersection_areas.map((area, index) => (
                  <div key={index} className="bg-yellow-50 p-4 rounded-md mb-3 last:mb-0">
                    <h4 className="font-medium mb-2">區域 {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">中心:</span>
                        <span className="ml-1">
                          {area.center.lat.toFixed(4)}, {area.center.lng.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">半徑:</span>
                        <span className="ml-1">{area.radius}m</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium">需求:</span>
                      <span className="ml-1">{area.requirements.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 租屋物件 */}
            {result.properties.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">🏠 租屋物件</h3>
                {result.properties.map((propertyGroup, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <h4 className="font-medium mb-2">
                      區域 {index + 1} - {propertyGroup.count} 個物件
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {propertyGroup.data_source}
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {propertyGroup.properties.slice(0, 4).map((property: any, pIndex: number) => (
                        <div key={pIndex} className="bg-green-50 p-3 rounded-md">
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-green-700">¥{property.price}</p>
                          <p className="text-sm text-gray-600">{property.location}</p>
                          <p className="text-xs text-gray-500">{property.size} • {property.distance}</p>
                          <div className="mt-1">
                            {property.tags.slice(0, 3).map((tag: string, tIndex: number) => (
                              <span key={tIndex} className="inline-block mr-1 px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 說明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使用說明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 使用 OpenStreetMap 免費查詢店鋪位置</li>
            <li>• 計算多個需求的交集區域</li>
            <li>• 在交集區域搜尋 SUUMO 租屋物件</li>
            <li>• 完全零 API 費用 (使用模擬 SUUMO 資料)</li>
            <li>• 支援的需求: starbucks, gym, convenience, 健身房, 便利商店 等</li>
          </ul>
        </div>
      </div>
    </div>
  );
}