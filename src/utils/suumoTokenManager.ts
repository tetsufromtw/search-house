/**
 * SUUMO Token 管理工具
 * 負責從 SUUMO 頁面獲取和管理 API Token
 */

export interface SuumoTokens {
  UID: string;
  STMP: string;
  ATT: string;
  url: string;
}

interface TokenCache {
  tokens: SuumoTokens;
  timestamp: number;
  expiresAt: number;
}

class SuumoTokenManager {
  private cache: TokenCache | null = null;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 分鐘
  private readonly SUUMO_TOKEN_URL = 'https://suumo.jp/map/chintai/tokyo/sc_shibuya/';

  /**
   * 獲取 SUUMO Token (含快取機制)
   */
  async getTokens(): Promise<SuumoTokens> {
    // 檢查快取是否有效
    if (this.cache && Date.now() < this.cache.expiresAt) {
      console.log('🔄 使用快取的 SUUMO Token');
      return this.cache.tokens;
    }

    console.log('🔑 獲取新的 SUUMO Token...');
    const tokens = await this.fetchTokensFromPage();
    
    // 更新快取
    this.cache = {
      tokens,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    };

    return tokens;
  }

  /**
   * 強制刷新 Token
   */
  async refreshTokens(): Promise<SuumoTokens> {
    console.log('🔄 強制刷新 SUUMO Token...');
    this.cache = null;
    return await this.getTokens();
  }

  /**
   * 檢查 Token 是否有效
   */
  isTokenValid(): boolean {
    return this.cache !== null && Date.now() < this.cache.expiresAt;
  }

  /**
   * 清除快取
   */
  clearCache(): void {
    this.cache = null;
    console.log('🗑️ SUUMO Token 快取已清除');
  }

  /**
   * 從 SUUMO 頁面獲取 Token (透過 API 路由)
   */
  private async fetchTokensFromPage(): Promise<SuumoTokens> {
    try {
      // 檢查是否在服務端環境
      if (typeof window === 'undefined') {
        // 服務端直接 fetch SUUMO
        return await this.fetchTokensDirectly();
      } else {
        // 客戶端透過 API 路由
        return await this.fetchTokensViaApi();
      }
    } catch (error) {
      throw new Error(`獲取 SUUMO Token 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 服務端直接獲取 Token
   */
  private async fetchTokensDirectly(): Promise<SuumoTokens> {
    const response = await fetch(this.SUUMO_TOKEN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.5',
        'Referer': 'https://suumo.jp/',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`📄 直接獲取 SUUMO 頁面成功，HTML 長度: ${html.length}`);

    return this.extractTokensFromHtml(html);
  }

  /**
   * 客戶端透過 API 路由獲取 Token
   */
  private async fetchTokensViaApi(): Promise<SuumoTokens> {
    console.log('🔄 透過 API 路由獲取 SUUMO Token...');
    
    const response = await fetch('/api/suumo/tokens', {
      method: 'POST' // 強制刷新
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API 回應錯誤');
    }

    console.log('✅ 透過 API 獲取 Token 成功');

    // 確保返回格式正確
    return {
      UID: data.tokens.UID,
      STMP: data.tokens.STMP,
      ATT: data.tokens.ATT,
      url: data.tokens.url || 'https://suumo.jp/jj/JJ903FC020/'
    };
  }

  /**
   * 從 HTML 中提取 Token 資訊
   */
  private extractTokensFromHtml(html: string): SuumoTokens {
    // 尋找 suumo.ApiParam 物件
    const apiParamMatch = html.match(/suumo\.ApiParam\s*=\s*({[\s\S]*?});/);
    
    if (!apiParamMatch) {
      throw new Error('無法在頁面中找到 suumo.ApiParam 物件');
    }

    const apiParamString = apiParamMatch[1];
    console.log('📋 找到 ApiParam 物件');

    let apiParam;
    try {
      // 嘗試 JSON 解析
      const cleanedJson = apiParamString
        .replace(/'/g, '"')  // 單引號改雙引號
        .replace(/(\w+):/g, '"$1":')  // 屬性名加引號
        .replace(/,\s*}/g, '}');  // 移除末尾逗號
      
      apiParam = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.warn('⚠️ JSON 解析失敗，使用手動提取');
      apiParam = this.manualExtractTokens(apiParamString);
    }

    if (!apiParam.bkApi) {
      throw new Error('ApiParam 中缺少 bkApi 物件');
    }

    const { UID, STMP, ATT, url } = apiParam.bkApi;

    if (!UID || !STMP || !ATT || !url) {
      throw new Error(`Token 參數不完整: UID=${!!UID}, STMP=${!!STMP}, ATT=${!!ATT}, url=${!!url}`);
    }

    console.log('✅ Token 提取成功:', {
      UID,
      STMP,
      ATT: ATT.substring(0, 10) + '...',
      url
    });

    return { UID, STMP, ATT, url };
  }

  /**
   * 手動提取 Token (備用方法)
   */
  private manualExtractTokens(apiParamString: string): any {
    const uidMatch = apiParamString.match(/'UID':\s*'([^']+)'/);
    const stmpMatch = apiParamString.match(/'STMP':\s*'([^']+)'/);
    const attMatch = apiParamString.match(/'ATT':\s*'([^']+)'/);
    const urlMatch = apiParamString.match(/'url':\s*'([^']+)'/);

    if (!uidMatch || !stmpMatch || !attMatch || !urlMatch) {
      throw new Error('無法手動提取 Token 參數');
    }

    return {
      bkApi: {
        UID: uidMatch[1],
        STMP: stmpMatch[1],
        ATT: attMatch[1],
        url: urlMatch[1]
      }
    };
  }

  /**
   * 獲取快取狀態
   */
  getCacheStatus() {
    if (!this.cache) {
      return { isValid: false, message: '無快取' };
    }

    const now = Date.now();
    const remainingMs = this.cache.expiresAt - now;
    const remainingMinutes = Math.floor(remainingMs / (60 * 1000));

    return {
      isValid: remainingMs > 0,
      remainingMinutes: Math.max(0, remainingMinutes),
      message: remainingMs > 0 ? `剩餘 ${remainingMinutes} 分鐘` : '已過期'
    };
  }
}

// 導出單例實例
export const suumoTokenManager = new SuumoTokenManager();