/**
 * SUUMO 頁面分析 API
 * 獲取並分析 SUUMO 頁面，尋找 Token 和 API 參數
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({
        error: '需要提供 URL'
      }, { status: 400 });
    }

    console.log(`🔍 開始分析 SUUMO 頁面: ${url}`);

    // 發送請求到 SUUMO 頁面
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://suumo.jp/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    console.log(`📄 獲取 HTML 成功，長度: ${html.length} 字符`);

    // 分析 HTML 內容
    const analysis = analyzeHtml(html);
    
    // 獲取回應標頭
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const result = {
      status: response.status,
      headers: responseHeaders,
      html: html,
      analysis
    };

    console.log('✅ SUUMO 頁面分析完成:', {
      狀態: response.status,
      HTML長度: html.length,
      找到Tokens: analysis.hasTokens,
      API端點數量: analysis.apiEndpoints.length
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ SUUMO 頁面分析失敗:', error);
    
    return NextResponse.json({
      error: 'SUUMO 頁面分析失敗',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * 分析 HTML 內容，尋找 Token 和 API 相關資訊
 */
function analyzeHtml(html: string) {
  const analysis = {
    hasTokens: false,
    foundTokens: {} as Record<string, string>,
    scriptTags: 0,
    formTags: 0,
    apiEndpoints: [] as string[],
    pageTitle: '',
    bodyLength: html.length
  };

  try {
    // 1. 提取頁面標題
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      analysis.pageTitle = titleMatch[1].trim();
    }

    // 2. 計算 script 和 form 標籤數量
    analysis.scriptTags = (html.match(/<script[^>]*>/gi) || []).length;
    analysis.formTags = (html.match(/<form[^>]*>/gi) || []).length;

    // 3. 尋找 Token 相關資訊
    
    // 尋找 UID (通常是 smapi343 或類似格式)
    const uidPatterns = [
      /UID['":\s]*['"]([^'"]+)['"]/gi,
      /uid['":\s]*['"]([^'"]+)['"]/gi,
      /"UID"[:\s]*"([^"]+)"/gi,
      /smapi\d+/gi
    ];

    for (const pattern of uidPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const extracted = match.match(/([a-zA-Z0-9]+)$/);
          if (extracted) {
            analysis.foundTokens.UID = extracted[1];
            analysis.hasTokens = true;
          }
        });
      }
    }

    // 尋找 ATT Token (長字串 hash)
    const attPatterns = [
      /ATT['":\s]*['"]([a-f0-9]{30,})['"]/gi,
      /att['":\s]*['"]([a-f0-9]{30,})['"]/gi,
      /"ATT"[:\s]*"([a-f0-9]{30,})"/gi,
      /[a-f0-9]{40}/g // 40位以上的16進制字串
    ];

    for (const pattern of attPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const extracted = match.match(/([a-f0-9]{30,})/);
          if (extracted && extracted[1].length >= 30) {
            analysis.foundTokens.ATT = extracted[1];
            analysis.hasTokens = true;
          }
        });
      }
    }

    // 尋找 STMP (時間戳)
    const stmpPatterns = [
      /STMP['":\s]*['"]([0-9]+)['"]/gi,
      /stmp['":\s]*['"]([0-9]+)['"]/gi,
      /"STMP"[:\s]*"([0-9]+)"/gi,
      /[0-9]{10,13}/g // 10-13位數字 (Unix 時間戳)
    ];

    for (const pattern of stmpPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const extracted = match.match(/([0-9]{10,13})/);
          if (extracted) {
            analysis.foundTokens.STMP = extracted[1];
            analysis.hasTokens = true;
          }
        });
      }
    }

    // 4. 尋找 API 端點
    const apiPatterns = [
      /https?:\/\/[^'">\s]+\.jp\/[^'">\s]*api[^'">\s]*/gi,
      /https?:\/\/[^'">\s]*suumo[^'">\s]*\/[^'">\s]*/gi,
      /\/api\/[^'">\s]*/gi,
      /JJ\d+FC\d+/gi
    ];

    const foundEndpoints = new Set<string>();
    
    for (const pattern of apiPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          foundEndpoints.add(match.trim());
        });
      }
    }

    analysis.apiEndpoints = Array.from(foundEndpoints);

    // 5. 特別尋找 SUUMO API 特徵
    if (html.includes('JJ903FC020')) {
      analysis.apiEndpoints.push('JJ903FC020 (SUUMO 租屋 API)');
    }

    if (html.includes('SUUMO.CALLBACK.FUNCTION')) {
      analysis.apiEndpoints.push('SUUMO.CALLBACK.FUNCTION (JSONP 回調)');
    }

    console.log('🔍 HTML 分析結果:', {
      找到UID: !!analysis.foundTokens.UID,
      找到ATT: !!analysis.foundTokens.ATT,
      找到STMP: !!analysis.foundTokens.STMP,
      API端點數: analysis.apiEndpoints.length,
      頁面標題: analysis.pageTitle
    });

  } catch (error) {
    console.error('❌ HTML 分析過程中發生錯誤:', error);
  }

  return analysis;
}

export async function GET() {
  return NextResponse.json({
    message: '請使用 POST 方法並提供 URL 參數',
    example: {
      url: 'https://suumo.jp/map/chintai/tokyo/sc_shibuya/'
    }
  });
}