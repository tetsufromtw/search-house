import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // 建構 SUUMO API URL
  const suumoParams = new URLSearchParams();
  
  // 複製所有查詢參數到 SUUMO API
  searchParams.forEach((value, key) => {
    suumoParams.append(key, value);
  });

  const suumoUrl = `https://suumo.jp/jj/JJ903FC020/?${suumoParams.toString()}`;
  
  console.log('🏠 代理 SUUMO 請求:', suumoUrl);

  try {
    const response = await fetch(suumoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://suumo.jp/jj/chintai/',
        'Origin': 'https://suumo.jp',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'script',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-origin',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      }
    });

    if (!response.ok) {
      throw new Error(`SUUMO API error: ${response.status}`);
    }

    const data = await response.text();
    console.log('✅ SUUMO API 回應成功');

    // 返回 JSONP 資料
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ SUUMO API 代理失敗:', error);
    
    // 返回錯誤，讓前端回退到模擬資料
    return NextResponse.json(
      { error: 'SUUMO API 請求失敗', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}