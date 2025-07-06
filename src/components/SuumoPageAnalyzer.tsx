'use client';

import { useState } from 'react';

export default function SuumoPageAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedHtml, setHighlightedHtml] = useState('');
  const [response, setResponse] = useState<{
    status: number;
    headers: Record<string, string>;
    html: string;
    analysis: {
      hasTokens: boolean;
      foundTokens: {
        UID?: string;
        ATT?: string;
        STMP?: string;
      };
      scriptTags: number;
      formTags: number;
      apiEndpoints: string[];
      pageTitle: string;
      bodyLength: number;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuumoPage = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('🔍 開始分析 SUUMO 渋谷頁面...');
      
      const response = await fetch('/api/analyze-suumo-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://suumo.jp/map/chintai/tokyo/sc_shibuya/'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResponse(data);
      setHighlightedHtml(data.html);
      
      console.log('✅ SUUMO 頁面分析完成:', data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      setError(errorMessage);
      console.error('❌ SUUMO 頁面分析失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term || !response) {
      setHighlightedHtml(response?.html || '');
      return;
    }

    // 高亮搜尋結果
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const highlighted = response.html.replace(regex, '<mark style="background-color: yellow; color: black;">$1</mark>');
    setHighlightedHtml(highlighted);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-light text-[#111111] mb-6">
          SUUMO 頁面分析器
        </h1>
        
        <div className="mb-6">
          <p className="text-[#666666] mb-4">
            分析 SUUMO 渋谷頁面，尋找 Token 和 API 參數
          </p>
          
          <button
            onClick={fetchSuumoPage}
            disabled={loading}
            className="px-6 py-2 bg-[#111111] text-white rounded-none hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? '分析中...' : '分析 SUUMO 頁面'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-6">
            <h3 className="text-red-800 font-medium mb-2">錯誤</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {response && (
          <div className="space-y-6">
            {/* 基本資訊 */}
            <div className="bg-gray-50 border border-[#e5e5e5] p-4">
              <h3 className="text-lg font-medium text-[#111111] mb-3">基本資訊</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[#666666]">狀態碼:</span>
                  <span className="ml-2 text-[#111111]">{response.status}</span>
                </div>
                <div>
                  <span className="text-[#666666]">頁面標題:</span>
                  <span className="ml-2 text-[#111111]">{response.analysis.pageTitle}</span>
                </div>
                <div>
                  <span className="text-[#666666]">HTML 長度:</span>
                  <span className="ml-2 text-[#111111]">{response.analysis.bodyLength.toLocaleString()} 字符</span>
                </div>
                <div>
                  <span className="text-[#666666]">Script 標籤:</span>
                  <span className="ml-2 text-[#111111]">{response.analysis.scriptTags}</span>
                </div>
              </div>
            </div>

            {/* Token 分析 */}
            <div className="bg-blue-50 border border-blue-200 p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Token 分析</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-blue-700">找到 Tokens:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    response.analysis.hasTokens 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {response.analysis.hasTokens ? '是' : '否'}
                  </span>
                </div>
                
                {response.analysis.foundTokens.UID && (
                  <div>
                    <span className="text-blue-700">UID:</span>
                    <span className="ml-2 text-[#111111] font-mono bg-white px-2 py-1 rounded">
                      {response.analysis.foundTokens.UID}
                    </span>
                  </div>
                )}
                
                {response.analysis.foundTokens.ATT && (
                  <div>
                    <span className="text-blue-700">ATT:</span>
                    <span className="ml-2 text-[#111111] font-mono bg-white px-2 py-1 rounded text-xs">
                      {response.analysis.foundTokens.ATT.substring(0, 30)}...
                    </span>
                  </div>
                )}
                
                {response.analysis.foundTokens.STMP && (
                  <div>
                    <span className="text-blue-700">STMP:</span>
                    <span className="ml-2 text-[#111111] font-mono bg-white px-2 py-1 rounded">
                      {response.analysis.foundTokens.STMP}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* API 端點 */}
            {response.analysis.apiEndpoints.length > 0 && (
              <div className="bg-green-50 border border-green-200 p-4">
                <h3 className="text-lg font-medium text-green-800 mb-3">
                  找到的 API 端點 ({response.analysis.apiEndpoints.length})
                </h3>
                <div className="space-y-1">
                  {response.analysis.apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                      {endpoint}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HTTP Headers */}
            <div className="bg-gray-50 border border-[#e5e5e5] p-4">
              <h3 className="text-lg font-medium text-[#111111] mb-3">HTTP Headers</h3>
              <div className="grid gap-2 text-sm">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-[#666666] w-40 flex-shrink-0">{key}:</span>
                    <span className="text-[#111111] font-mono text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HTML 完整內容 */}
            <div className="bg-white border border-[#e5e5e5] p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-[#111111]">
                  完整 HTML 內容 ({response.html.length.toLocaleString()} 字符)
                </h3>
                
                {/* 搜尋框 */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="搜尋 HTML 內容..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleSearch('ATT')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    ATT
                  </button>
                  <button
                    onClick={() => handleSearch('UID')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    UID
                  </button>
                  <button
                    onClick={() => handleSearch('JJ903FC020')}
                    className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    API
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">
                <pre dangerouslySetInnerHTML={{ __html: highlightedHtml }}></pre>
              </div>
              
              {/* 下載按鈕 */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([response.html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `suumo-shibuya-${new Date().getTime()}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  下載 HTML
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(response.html);
                    alert('HTML 已複製到剪貼簿');
                  }}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  複製到剪貼簿
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}