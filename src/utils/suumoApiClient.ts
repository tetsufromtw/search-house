/**
 * SUUMO API 客戶端工具
 * 負責構建參數、發送請求、解析回應
 */

import { suumoTokenManager, type SuumoTokens } from './suumoTokenManager';

export interface SuumoApiParams {
  UID: string;
  STMP: string;
  ATT: string;
  FORMAT: string;
  CALLBACK: string;
  P: string;
  CNT: string;
  GAZO: string;
  PROT: string;
  SE: string;
  KUKEIPT1LT: string;
  KUKEIPT1LG: string;
  KUKEIPT2LT: string;
  KUKEIPT2LG: string;
}

export interface SuumoSearchArea {
  center: { lat: number; lng: number };
  radius: number;
}

export interface SuumoApiResponse {
  smatch: {
    condition: string;
    resultset: {
      firsthit: number;
      hits: number;
      lasthit: number;
      totalhits: number;
      item: Array<{
        // 新格式 - 直接物件資料
        bukken_cd?: string;
        bukken_nm?: string;
        bukkengazo?: string;
        category?: string;
        chikugonensu?: string;
        juko_nayose_cnt?: number;
        jusho?: string;
        kaiso_disp?: string;
        kakaku?: string;
        kanrihi?: string;
        kotsu?: string;
        lg?: number;
        link?: string;
        lt?: number;
        madori?: string;
        menseki?: string;
        new_update_icon?: number;
        reikin?: string;
        shikikin?: string;
        shubetsu?: string;
        
        // 舊格式 - bukkenCdList
        bukkenCdList?: string[];
        shubetsuList?: string[];
      }>;
    };
    warnings?: any;
  };
}

class SuumoApiClient {
  /**
   * 根據搜尋區域建立 SUUMO API 參數
   */
  buildApiParams(searchArea: SuumoSearchArea, tokens: SuumoTokens): SuumoApiParams {
    // 計算矩形邊界
    const bounds = this.calculateBounds(searchArea.center, searchArea.radius);

    const params: SuumoApiParams = {
      UID: tokens.UID,
      STMP: tokens.STMP,
      ATT: tokens.ATT,
      FORMAT: '1',
      CALLBACK: 'SUUMO.CALLBACK.FUNCTION',
      P: '1',
      CNT: '20',
      GAZO: '2',
      PROT: '1',
      SE: '040', // 賃貸物件
      KUKEIPT1LT: bounds.north.toString(),
      KUKEIPT1LG: bounds.east.toString(),
      KUKEIPT2LT: bounds.south.toString(),
      KUKEIPT2LG: bounds.west.toString()
    };

    console.log('📋 建立 SUUMO API 參數:', {
      搜尋中心: searchArea.center,
      搜尋半徑: `${searchArea.radius}m`,
      矩形邊界: bounds,
      Token: {
        UID: tokens.UID,
        STMP: tokens.STMP,
        ATT: tokens.ATT.substring(0, 10) + '...'
      }
    });

    return params;
  }

  /**
   * 建立完整的 API URL
   */
  buildApiUrl(params: SuumoApiParams, baseUrl: string): string {
    const urlParams = new URLSearchParams(params as any);
    const fullUrl = `${baseUrl}?${urlParams.toString()}`;
    
    console.log('🔗 建立 SUUMO API URL:', fullUrl);
    return fullUrl;
  }

  /**
   * 呼叫 SUUMO API
   */
  async callApi(searchArea: SuumoSearchArea): Promise<SuumoApiResponse> {
    console.log('🚀 開始呼叫 SUUMO API...');

    try {
      // 檢查是否在客戶端環境
      if (typeof window !== 'undefined') {
        // 客戶端透過 API 路由代理
        return await this.callApiViaProxy(searchArea);
      } else {
        // 服務端直接呼叫
        return await this.callApiDirectly(searchArea);
      }
    } catch (error) {
      throw new Error(`SUUMO API 呼叫失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 服務端直接呼叫 SUUMO API
   */
  private async callApiDirectly(searchArea: SuumoSearchArea): Promise<SuumoApiResponse> {
    console.log('🌐 服務端直接呼叫 SUUMO API');

    // 1. 獲取 Token
    const tokens = await suumoTokenManager.getTokens();

    // 2. 建立參數
    const params = this.buildApiParams(searchArea, tokens);

    // 3. 建立 URL
    const apiUrl = this.buildApiUrl(params, tokens.url);

    // 4. 發送請求
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://suumo.jp/map/chintai/tokyo/sc_shibuya/',
        'Origin': 'https://suumo.jp'
      }
    });

    if (!response.ok) {
      throw new Error(`SUUMO API 請求失敗: HTTP ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('📄 SUUMO API 回應成功，長度:', responseText.length);

    // 5. 解析回應
    return this.parseApiResponse(responseText);
  }

  /**
   * 客戶端透過 API 路由代理
   */
  private async callApiViaProxy(searchArea: SuumoSearchArea): Promise<SuumoApiResponse> {
    console.log('🔄 客戶端透過 API 代理呼叫 SUUMO');

    const response = await fetch('/api/suumo/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchArea)
    });

    if (!response.ok) {
      throw new Error(`API 代理請求失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API 代理回應錯誤');
    }

    console.log('✅ 透過 API 代理獲取 SUUMO 資料成功');
    return data.data;
  }

  /**
   * 解析 SUUMO API 回應
   */
  parseApiResponse(responseText: string): SuumoApiResponse {
    console.log('🔍 解析 SUUMO API 回應...');

    // 檢查錯誤
    if (responseText.includes('認証エラー') || responseText.includes('エラー')) {
      throw new Error('SUUMO API 認證錯誤');
    }

    if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
      throw new Error('SUUMO API 回傳 HTML 而非 JSON');
    }

    // 嘗試直接解析 JSON
    try {
      const jsonData = JSON.parse(responseText);
      
      // 驗證回應格式
      if (!jsonData.smatch || !jsonData.smatch.resultset) {
        throw new Error('SUUMO API 回應格式不正確');
      }

      console.log('✅ SUUMO API 回應解析成功:', {
        總命中數: jsonData.smatch.resultset.hits,
        項目數: jsonData.smatch.resultset.item?.length || 0,
        搜尋條件: jsonData.smatch.condition?.substring(0, 100) + '...'
      });

      return jsonData;

    } catch (jsonError) {
      // 備用：嘗試 JSONP 解析
      console.warn('⚠️ 直接 JSON 解析失敗，嘗試 JSONP 解析');
      return this.parseJsonpResponse(responseText);
    }
  }

  /**
   * JSONP 格式解析 (備用)
   */
  private parseJsonpResponse(responseText: string): SuumoApiResponse {
    const jsonpPatterns = [
      /SUUMO\.CALLBACK\.FUNCTION\((.*)\)/s,
      /callback\((.*)\)/s,
      /\w*\((.*)\)/s
    ];

    for (const pattern of jsonpPatterns) {
      const match = responseText.match(pattern);
      if (match) {
        try {
          const jsonData = JSON.parse(match[1]);
          console.log('✅ JSONP 解析成功');
          return jsonData;
        } catch (parseError) {
          continue;
        }
      }
    }

    throw new Error('無法解析 SUUMO API 回應格式');
  }

  /**
   * 計算搜尋區域的矩形邊界
   */
  private calculateBounds(center: { lat: number; lng: number }, radiusMeters: number) {
    const latDegrees = radiusMeters / 111320; // 1度緯度 ≈ 111.32km
    const lngDegrees = radiusMeters / (111320 * Math.cos(center.lat * Math.PI / 180));

    return {
      north: center.lat + latDegrees,
      south: center.lat - latDegrees,
      east: center.lng + lngDegrees,
      west: center.lng - lngDegrees
    };
  }

  /**
   * 取得目前 Token 狀態
   */
  getTokenStatus() {
    return suumoTokenManager.getCacheStatus();
  }

  /**
   * 刷新 Token
   */
  async refreshToken(): Promise<SuumoTokens> {
    return await suumoTokenManager.refreshTokens();
  }
}

// 導出單例實例
export const suumoApiClient = new SuumoApiClient();