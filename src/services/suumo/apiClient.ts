/**
 * SUUMO API 客戶端封裝
 * 自動處理 Token 管理、重試邏輯、錯誤處理
 */

import { suumoTokenManager } from './tokenManager';
import { SuumoApiResponse, SuumoApiError } from './types';

class SuumoApiClient {
  private readonly BASE_URL = 'https://suumo.jp/jj/JJ903FC020/';
  private readonly MAX_RETRIES = 2;

  async makeRequest(params: URLSearchParams): Promise<SuumoApiResponse> {
    return await this.makeRequestWithRetry(params, 0);
  }

  private async makeRequestWithRetry(
    params: URLSearchParams, 
    retryCount: number
  ): Promise<SuumoApiResponse> {
    try {
      // 獲取最新 Token
      const tokens = await suumoTokenManager.getTokens();
      
      // 設定認證參數
      params.set('UID', tokens.bkApi.UID);
      params.set('STMP', tokens.bkApi.STMP);
      params.set('ATT', tokens.bkApi.ATT);
      
      // 設定必要的格式參數
      params.set('FORMAT', '1');
      params.set('CALLBACK', 'SUUMO.CALLBACK.FUNCTION');

      console.log(`🏠 SUUMO API 請求 (第 ${retryCount + 1} 次):`, {
        UID: tokens.bkApi.UID,
        STMP: tokens.bkApi.STMP,
        ATT: tokens.bkApi.ATT.substring(0, 20) + '...',
        參數數量: params.size
      });

      // 發送請求
      const response = await fetch(`${this.BASE_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Referer': 'https://suumo.jp/jj/chintai/',
          'Origin': 'https://suumo.jp'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      
      // 檢查是否為認證錯誤
      if (suumoTokenManager.isTokenInvalid(responseText)) {
        if (retryCount < this.MAX_RETRIES) {
          console.log('🚨 偵測到認證錯誤，自動刷新 Token 並重試');
          await suumoTokenManager.refreshTokens();
          return await this.makeRequestWithRetry(params, retryCount + 1);
        } else {
          throw new Error('認證失敗：Token 刷新後仍無法通過驗證');
        }
      }

      // 解析 JSONP 回應
      const result = this.parseJsonpResponse(responseText);
      
      console.log('✅ SUUMO API 回應成功:', {
        資料數量: result.data?.length || 0,
        總筆數: result.count || 0
      });
      
      return result;

    } catch (error) {
      console.error(`❌ SUUMO API 請求失敗 (第 ${retryCount + 1} 次):`, error);
      
      if (retryCount < this.MAX_RETRIES) {
        console.log(`🔄 準備重試 ${retryCount + 2}/${this.MAX_RETRIES + 1}`);
        await suumoTokenManager.refreshTokens();
        return await this.makeRequestWithRetry(params, retryCount + 1);
      }
      
      throw error;
    }
  }

  private parseJsonpResponse(responseText: string): SuumoApiResponse {
    console.log('🔍 分析 SUUMO API 原始回應:', {
      長度: responseText.length,
      前100字符: responseText.substring(0, 100),
      後100字符: responseText.substring(responseText.length - 100),
      包含JSONP函數: responseText.includes('SUUMO.CALLBACK.FUNCTION'),
      包含其他模式: {
        'SUUMO.CALLBACK': responseText.includes('SUUMO.CALLBACK'),
        'callback(': responseText.includes('callback('),
        'jsonp(': responseText.includes('jsonp('),
        '{': responseText.includes('{'),
        '}': responseText.includes('}')
      }
    });

    // 嘗試多種 JSONP 解析模式
    const patterns = [
      /SUUMO\.CALLBACK\.FUNCTION\((.*)\)/,           // 原始模式
      /SUUMO\.CALLBACK\((.*)\)/,                     // 簡化模式
      /callback\((.*)\)/,                           // 通用 callback
      /jsonp\((.*)\)/,                              // 通用 jsonp
      /\((.*)\)/                                    // 最寬鬆模式：任何括號內容
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = responseText.match(pattern);
      
      if (match) {
        console.log(`✅ 使用模式 ${i + 1} 成功匹配:`, pattern.toString());
        
        try {
          const jsonString = match[1];
          console.log('📝 提取的 JSON 字串:', {
            長度: jsonString.length,
            前50字符: jsonString.substring(0, 50),
            後50字符: jsonString.substring(jsonString.length - 50)
          });
          
          const parsed = JSON.parse(jsonString);
          console.log('📊 SUUMO API 解析結果:', {
            有資料: !!parsed.data,
            資料類型: typeof parsed.data,
            資料長度: Array.isArray(parsed.data) ? parsed.data.length : '非陣列',
            所有屬性: Object.keys(parsed),
            資料樣本: parsed.data ? (Array.isArray(parsed.data) ? parsed.data.slice(0, 1) : parsed.data) : null
          });
          
          return parsed;
        } catch (parseError) {
          console.error(`❌ 模式 ${i + 1} JSON 解析失敗:`, parseError);
          continue; // 嘗試下一個模式
        }
      }
    }

    // 如果所有模式都失敗，嘗試檢查是否為純 JSON
    if (responseText.trim().startsWith('{') && responseText.trim().endsWith('}')) {
      console.log('🔄 嘗試解析為純 JSON');
      try {
        const parsed = JSON.parse(responseText);
        console.log('✅ 純 JSON 解析成功');
        return parsed;
      } catch (error) {
        console.error('❌ 純 JSON 解析也失敗:', error);
      }
    }

    // 如果是 HTML 錯誤頁面，提取更多資訊
    if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
      console.error('🚨 收到 HTML 回應而非 JSONP:', {
        isHTML: true,
        包含title: responseText.includes('<title>'),
        包含error: responseText.toLowerCase().includes('error'),
        包含denied: responseText.toLowerCase().includes('denied'),
        包含blocked: responseText.toLowerCase().includes('blocked')
      });
      
      throw new Error('SUUMO API 回傳 HTML 頁面，可能是認證失敗或被阻擋');
    }

    throw new Error(`無法解析 SUUMO API 回應格式。回應長度: ${responseText.length}, 開頭: ${responseText.substring(0, 50)}`);
  }

  /**
   * 檢查 API 客戶端狀態
   */
  async healthCheck(): Promise<boolean> {
    try {
      const tokens = await suumoTokenManager.getTokens();
      return !!(tokens.bkApi.UID && tokens.bkApi.STMP && tokens.bkApi.ATT);
    } catch {
      return false;
    }
  }

  /**
   * 強制刷新 Token
   */
  async forceRefreshTokens(): Promise<void> {
    await suumoTokenManager.refreshTokens();
  }
}

export const suumoApiClient = new SuumoApiClient();