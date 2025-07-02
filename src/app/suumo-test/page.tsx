'use client';

import React, { useState } from 'react';

interface TestResult {
  timestamp: string;
  success: boolean;
  data?: any;
  error?: string;
}

export default function SuumoTestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const runTest = async (testName: string, url: string, method: 'GET' | 'POST' | 'DELETE' = 'GET') => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      const response = await fetch(url, { method });
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [testName]: {
          timestamp: new Date().toISOString(),
          success: response.ok,
          data: data
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testName]: {
          timestamp: new Date().toISOString(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const TestButton = ({ testName, url, method = 'GET', description }: {
    testName: string;
    url: string;
    method?: 'GET' | 'POST' | 'DELETE';
    description: string;
  }) => {
    const isLoading = loading[testName];
    const result = results[testName];
    
    return (
      <div className="border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg">{testName}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{method} {url}</code>
          </div>
          <button
            onClick={() => runTest(testName, url, method)}
            disabled={isLoading}
            className={`px-4 py-2 rounded font-medium ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? '測試中...' : '執行測試'}
          </button>
        </div>
        
        {result && (
          <div className={`mt-3 p-3 rounded ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {result.success ? '✅ 測試通過' : '❌ 測試失敗'}
              </span>
              <span className="text-sm text-gray-500">{result.timestamp}</span>
            </div>
            
            {result.error && (
              <p className="text-red-700 text-sm">錯誤: {result.error}</p>
            )}
            
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  查看回應資料
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SUUMO API 系統測試
          </h1>
          <p className="text-gray-600">
            測試新實作的 SUUMO Token 管理系統和 API 客戶端
          </p>
        </div>

        <div className="space-y-4">
          <TestButton
            testName="⚡ 快速測試"
            url="/api/suumo/quick-test"
            description="快速驗證 SUUMO API 是否正常運作（修復版本）"
          />

          <TestButton
            testName="系統診斷"
            url="/api/suumo/diagnose"
            description="執行完整的系統健康檢查，包含所有模組測試"
          />

          <TestButton
            testName="Token 狀態"
            url="/api/suumo/tokens"
            description="獲取當前 SUUMO Token 狀態和快取資訊"
          />

          <TestButton
            testName="Token 刷新"
            url="/api/suumo/tokens"
            method="POST"
            description="強制刷新 SUUMO Token"
          />

          <TestButton
            testName="Token 清除"
            url="/api/suumo/tokens"
            method="DELETE"
            description="清除 Token 快取並重新獲取"
          />

          <TestButton
            testName="SUUMO API 測試"
            url="/api/suumo?FORMAT=1&P=1&CNT=5&PROT=1&LITE_KBN=1"
            description="使用新的 API 客戶端執行 SUUMO 搜尋請求"
          />

          <TestButton
            testName="SUUMO 東京區域搜尋"
            url="/api/suumo?FORMAT=1&P=1&CNT=10&GAZO=2&PROT=1&SE=040&KUKEIPT1LT=35.70&KUKEIPT1LG=139.77&KUKEIPT2LT=35.69&KUKEIPT2LG=139.74&LITE_KBN=1"
            description="搜尋東京特定區域的租屋物件"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">測試說明</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>系統診斷</strong>：執行5個測試項目，檢查整體系統健康狀況</p>
            <p>• <strong>Token 相關</strong>：測試 Token 的獲取、刷新、清除功能</p>
            <p>• <strong>API 測試</strong>：驗證新的 API 客戶端是否正常運作</p>
            <p>• <strong>實際搜尋</strong>：測試具體的房屋搜尋功能</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ 注意事項</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 如果 Token 相關測試失敗，可能需要檢查網路連線或 SUUMO 網站狀態</li>
            <li>• API 測試失敗可能表示認證問題，嘗試執行 Token 刷新</li>
            <li>• 實際搜尋測試可能因為 SUUMO 網站變化而失敗，這是正常現象</li>
          </ul>
        </div>
      </div>
    </div>
  );
}