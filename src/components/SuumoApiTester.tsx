'use client';

import React, { useState, useEffect } from 'react';

interface SuumoApiTesterProps {
  autoTrigger?: boolean;
}

export default function SuumoApiTester({ autoTrigger = false }: SuumoApiTesterProps) {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 測試用的參數（基於你提供的 URL）
  const testParams = {
    UID: 'smapi343',
    STMP: '1751207011',
    ATT: '393f6c8aacc78e917f1ab33986f3e5b346dd947a',
    FORMAT: '1',
    CALLBACK: 'SUUMO.CALLBACK.FUNCTION',
    P: '1',
    CNT: '1998',
    GAZO: '2',
    PROT: '1',
    SE: '040',
    KUKEIPT1LT: '35.70183056403364',
    KUKEIPT1LG: '139.76971174661355',
    KUKEIPT2LT: '35.686251072624486',
    KUKEIPT2LG: '139.73746086541848',
    LITE_KBN: '1'
  };

  const fetchSuumoApi = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('🚀 開始測試 SUUMO API...');
      
      // 建構查詢參數
      const searchParams = new URLSearchParams(testParams);
      const apiUrl = `/api/suumo?${searchParams.toString()}`;
      
      console.log('📡 API URL:', apiUrl);

      const startTime = Date.now();
      const res = await fetch(apiUrl);
      const endTime = Date.now();
      
      console.log(`⏱️ 請求耗時: ${endTime - startTime}ms`);
      console.log('📊 回應狀態:', res.status, res.statusText);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const responseText = await res.text();
      console.log('📝 回應長度:', responseText.length, 'characters');
      
      setResponse(responseText);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      console.error('❌ SUUMO API 測試失敗:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 自動觸發
  useEffect(() => {
    if (autoTrigger) {
      fetchSuumoApi();
    }
  }, [autoTrigger]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white border border-[#e5e5e5] shadow-sm">
        {/* 標題區域 */}
        <div className="border-b border-[#e5e5e5] p-6">
          <h2 className="text-xl font-light text-[#111111] mb-2 tracking-wide">
            SUUMO API 測試工具
          </h2>
          <p className="text-sm text-[#999999] font-light">
            測試真實的 SUUMO 租屋資料 API
          </p>
        </div>

        {/* 控制區域 */}
        <div className="p-6 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={fetchSuumoApi}
              disabled={loading}
              className="px-6 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity font-light tracking-wide disabled:opacity-50"
            >
              {loading ? '請求中...' : '發送 API 請求'}
            </button>
            
            <div className="text-sm text-[#999999] font-light">
              測試範圍: 東京都台東區附近
            </div>
          </div>

          {/* 測試參數展示 */}
          <details className="mb-4">
            <summary className="text-sm text-[#666666] font-light cursor-pointer hover:text-[#111111]">
              查看請求參數
            </summary>
            <div className="mt-2 p-4 bg-gray-50 border border-[#e5e5e5] text-xs font-mono">
              <pre>{JSON.stringify(testParams, null, 2)}</pre>
            </div>
          </details>
        </div>

        {/* 狀態顯示 */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center gap-2 text-[#666666] mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#111111]"></div>
              <span className="text-sm font-light">正在請求 SUUMO API...</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700">
              <h3 className="font-medium mb-2">請求失敗</h3>
              <p className="text-sm font-light">{error}</p>
            </div>
          )}

          {response && (
            <div>
              <h3 className="text-lg font-light text-[#111111] mb-4 tracking-wide">
                API 回應結果
              </h3>
              
              {/* 回應統計 */}
              <div className="mb-4 p-4 bg-gray-50 border border-[#e5e5e5]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#999999] font-light">回應長度:</span>
                    <span className="ml-2 text-[#111111]">{response.length.toLocaleString()} 字元</span>
                  </div>
                  <div>
                    <span className="text-[#999999] font-light">格式:</span>
                    <span className="ml-2 text-[#111111]">
                      {response.trim().startsWith('{') ? 'JSON' : 'JSONP'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#999999] font-light">狀態:</span>
                    <span className="ml-2 text-green-600">成功</span>
                  </div>
                  <div>
                    <span className="text-[#999999] font-light">時間:</span>
                    <span className="ml-2 text-[#111111]">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* 原始回應 */}
              <div className="bg-[#111111] text-white p-4 rounded-none overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-light text-gray-300">原始回應內容</span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(response)}
                    className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-none transition-colors"
                  >
                    複製
                  </button>
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                  {response}
                </pre>
              </div>
            </div>
          )}

          {!loading && !error && !response && (
            <div className="text-center text-[#999999] py-12">
              <div className="w-12 h-12 border border-[#e5e5e5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm font-light">
                點擊「發送 API 請求」開始測試
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}