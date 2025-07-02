/**
 * SUUMO Token 自動管理系統
 * 負責從 SUUMO 網站自動獲取最新的認證 Token
 */

import { SuumoTokens, TokenCacheEntry, SuumoApiError } from './types';

class SuumoTokenManager {
  private cache: TokenCacheEntry | null = null;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 分鐘
  private readonly SUUMO_TOKEN_URL = 'https://suumo.jp/map/chintai/tokyo/sc_chiyoda/';
  private isInitialized = false;

  constructor() {
    console.log('🚀 初始化 SUUMO Token Manager');
  }

  /**
   * 獲取有效的 Token（自動處理快取和刷新）
   */
  async getTokens(): Promise<SuumoTokens> {
    try {
      // 檢查快取是否有效
      if (this.cache && Date.now() < this.cache.expiresAt) {
        console.log('✅ 使用快取的 SUUMO Token');
        return this.cache.tokens;
      }

      console.log('🔄 快取過期或不存在，獲取新的 SUUMO Token');
      return await this.fetchAndCacheTokens();

    } catch (error) {
      console.error('❌ 獲取 SUUMO Token 失敗:', error);
      
      // 如果有過期快取，在緊急情況下使用
      if (this.cache) {
        console.warn('⚠️ 使用過期的快取 Token');
        return this.cache.tokens;
      }

      // 返回預設 Token 作為最後手段
      return this.getDefaultTokens();
    }
  }

  /**
   * 檢測 Token 是否需要刷新（基於 API 錯誤回應）
   */
  isTokenInvalid(responseText: string): boolean {
    return responseText.includes('認証エラーです') || 
           responseText.includes('認証エラー') ||
           responseText.includes('authentication error');
  }

  /**
   * 強制刷新 Token
   */
  async refreshTokens(): Promise<SuumoTokens> {
    console.log('🔄 強制刷新 SUUMO Token');
    this.cache = null; // 清除快取
    return await this.fetchAndCacheTokens();
  }

  /**
   * 從 SUUMO 網站獲取最新 Token 並快取
   */
  private async fetchAndCacheTokens(): Promise<SuumoTokens> {
    console.log('🌐 開始從 SUUMO 網站獲取 Token...');

    try {
      const tokens = await this.fetchTokensFromPage();
      
      // 建立快取
      this.cache = {
        tokens,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION
      };

      console.log('✅ SUUMO Token 獲取並快取成功');
      return tokens;

    } catch (error) {
      console.error('❌ 從 SUUMO 網站獲取 Token 失敗:', error);
      throw new Error(`Token 獲取失敗: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 從 SUUMO 頁面抓取 Token
   */
  private async fetchTokensFromPage(): Promise<SuumoTokens> {
    const response = await fetch(this.SUUMO_TOKEN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('📄 成功獲取 SUUMO 頁面內容');

    // 使用正則表達式提取 Token
    const tokens = this.extractTokensFromHtml(html);
    
    if (!tokens.bkApi.ATT || tokens.bkApi.ATT.length < 10) {
      throw new Error('未能從頁面中提取有效的 ATT Token');
    }

    console.log(`🔑 成功提取 Token: UID=${tokens.bkApi.UID}, ATT=${tokens.bkApi.ATT.substring(0, 10)}...`);
    return tokens;
  }

  /**
   * 從 HTML 中提取 Token
   */
  private extractTokensFromHtml(html: string): SuumoTokens {
    // 提取 ATT Token
    const attMatch = html.match(/['"](bkApi|bk_api)['"]\s*:\s*{\s*['"](UID|uid)['"]\s*:\s*['"]([^'"]+)['"],\s*['"](STMP|stmp)['"]\s*:\s*['"]([^'"]+)['"],\s*['"](ATT|att)['"]\s*:\s*['"]([^'"]+)['"]/i);
    
    if (attMatch) {
      return {
        bkApi: {
          UID: attMatch[3],
          STMP: attMatch[5], 
          ATT: attMatch[7]
        }
      };
    }

    // 備用提取模式 - 更寬鬆的正則
    const uidMatch = html.match(/['"]?UID['"]?\s*:\s*['"]([^'"]+)['"]/i);
    const stmpMatch = html.match(/['"]?STMP['"]?\s*:\s*['"]([^'"]+)['"]/i);
    const attMatch2 = html.match(/['"]?ATT['"]?\s*:\s*['"]([^'"]+)['"]/i);

    if (uidMatch && stmpMatch && attMatch2) {
      return {
        bkApi: {
          UID: uidMatch[1],
          STMP: stmpMatch[1],
          ATT: attMatch2[1]
        }
      };
    }

    // 再次備用 - 尋找較短的 Token 模式
    const simpleAttMatch = html.match(/[a-f0-9]{32,}/gi);
    if (simpleAttMatch && simpleAttMatch.length > 0) {
      const currentTimestamp = Date.now().toString();
      return {
        bkApi: {
          UID: 'smapi343',
          STMP: currentTimestamp,
          ATT: simpleAttMatch[0]
        }
      };
    }

    throw new Error('無法從 HTML 中提取 Token 資訊');
  }

  /**
   * 取得預設 Token（緊急備用）
   */
  private getDefaultTokens(): SuumoTokens {
    const currentTimestamp = Date.now().toString();
    
    console.warn('⚠️ 使用預設 Token（可能已過期）');
    
    return {
      bkApi: {
        UID: 'smapi343',
        STMP: currentTimestamp,
        ATT: '' // 空的 ATT 會觸發後續的重新獲取
      }
    };
  }

  /**
   * 清除快取
   */
  clearCache(): void {
    console.log('🗑️ 清除 SUUMO Token 快取');
    this.cache = null;
  }

  /**
   * 檢查 API 回應是否包含認證錯誤
   */
  isTokenInvalid(responseText: string): boolean {
    // 檢查 SUUMO API 的認證錯誤訊息
    const errorPatterns = [
      '認証エラーです。',           // 日文認證錯誤
      '認証エラー',               // 簡化版本
      'authentication error',     // 英文版本
      'auth error',               // 簡化英文
      '"errors"',                 // JSON 錯誤格式
      'error',                    // 通用錯誤檢查
    ];

    const lowercaseResponse = responseText.toLowerCase();
    
    // 檢查是否包含任何錯誤模式
    for (const pattern of errorPatterns) {
      if (responseText.includes(pattern) || lowercaseResponse.includes(pattern.toLowerCase())) {
        console.log(`🚨 偵測到認證錯誤模式: "${pattern}"`);
        return true;
      }
    }

    // 檢查 JSONP 回應中的錯誤結構
    try {
      const jsonMatch = responseText.match(/SUUMO\.CALLBACK\.FUNCTION\((.*)\)/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        
        // 檢查是否有錯誤結構
        if (jsonData.smatch?.errors?.error) {
          console.log('🚨 偵測到 SUUMO API 錯誤結構:', jsonData.smatch.errors);
          return true;
        }
      }
    } catch (error) {
      // JSON 解析錯誤，繼續檢查其他模式
    }

    return false;
  }

  /**
   * 取得快取狀態
   */
  getCacheStatus(): { hasCache: boolean; isValid: boolean; expiresIn?: number } {
    if (!this.cache) {
      return { hasCache: false, isValid: false };
    }

    const now = Date.now();
    const isValid = now < this.cache.expiresAt;
    const expiresIn = this.cache.expiresAt - now;

    return {
      hasCache: true,
      isValid,
      expiresIn: isValid ? expiresIn : undefined
    };
  }
}

// 單例模式
export const suumoTokenManager = new SuumoTokenManager();