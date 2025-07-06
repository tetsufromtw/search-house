/**
 * SUUMO 整合工具 - 高級 API
 * 提供簡單易用的介面來使用 SUUMO 功能
 */

import { suumoApiClient, type SuumoSearchArea } from './suumoApiClient';
import { suumoDataProcessor, type ProcessedSuumoResult } from './suumoDataProcessor';
import { suumoTokenManager } from './suumoTokenManager';

export interface SuumoSearchOptions {
  // 基本搜尋參數
  center: { lat: number; lng: number };
  radius: number; // 公尺

  // 進階篩選
  filters?: {
    maxDistance?: number;
    excludeKeywords?: string[];
    includeKeywords?: string[];
  };

  // 其他選項
  enableCache?: boolean;
  maxResults?: number;
}

export interface SuumoSearchResult extends ProcessedSuumoResult {
  success: boolean;
  error?: string;
  apiCost: number;
  timing: {
    tokenFetch: number;
    apiCall: number;
    processing: number;
    total: number;
  };
}

class SuumoIntegration {
  /**
   * 主要搜尋方法 - 根據座標和半徑搜尋租屋
   */
  async searchProperties(options: SuumoSearchOptions): Promise<SuumoSearchResult> {
    const startTime = Date.now();
    let tokenFetchTime = 0;
    let apiCallTime = 0;
    let processingTime = 0;

    try {
      console.log('🏠 開始 SUUMO 整合搜尋:', {
        中心: options.center,
        半徑: `${options.radius}m`,
        篩選: options.filters
      });

      // 1. Token 獲取階段
      const tokenStart = Date.now();
      // Token 會由 apiClient 自動處理
      tokenFetchTime = Date.now() - tokenStart;

      // 2. API 呼叫階段
      const apiStart = Date.now();
      const searchArea: SuumoSearchArea = {
        center: options.center,
        radius: options.radius
      };
      
      const apiResponse = await suumoApiClient.callApi(searchArea);
      apiCallTime = Date.now() - apiStart;

      // 3. 資料處理階段
      const processingStart = Date.now();
      const processedResult = suumoDataProcessor.processApiResponse(
        apiResponse,
        searchArea,
        apiCallTime
      );

      // 應用篩選
      if (options.filters) {
        processedResult.properties = suumoDataProcessor.filterProperties(
          processedResult.properties,
          {
            ...options.filters,
            centerPoint: options.center
          }
        );
      }

      // 限制結果數量
      if (options.maxResults && processedResult.properties.length > options.maxResults) {
        processedResult.properties = processedResult.properties.slice(0, options.maxResults);
      }

      processingTime = Date.now() - processingStart;
      const totalTime = Date.now() - startTime;

      const result: SuumoSearchResult = {
        ...processedResult,
        success: true,
        apiCost: 0.001, // SUUMO API 成本很低
        timing: {
          tokenFetch: tokenFetchTime,
          apiCall: apiCallTime,
          processing: processingTime,
          total: totalTime
        }
      };

      console.log('✅ SUUMO 整合搜尋完成:', {
        物件數量: result.properties.length,
        總命中數: result.summary.totalHits,
        總耗時: `${totalTime}ms`,
        費用: `$${result.apiCost.toFixed(4)}`
      });

      return result;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      console.error('❌ SUUMO 整合搜尋失敗:', error);

      return {
        properties: [],
        summary: {
          totalHits: 0,
          itemCount: 0,
          searchCondition: '搜尋失敗'
        },
        metadata: {
          searchArea: { center: options.center, radius: options.radius }
        },
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        apiCost: 0,
        timing: {
          tokenFetch: tokenFetchTime,
          apiCall: apiCallTime,
          processing: processingTime,
          total: totalTime
        }
      };
    }
  }

  /**
   * 快速搜尋 - 簡化參數版本
   */
  async quickSearch(
    center: { lat: number; lng: number },
    radius: number = 500
  ): Promise<SuumoSearchResult> {
    return await this.searchProperties({ center, radius });
  }

  /**
   * 批量搜尋 - 多個區域
   */
  async batchSearch(
    areas: Array<{ center: { lat: number; lng: number }; radius: number }>,
    delay: number = 1000 // 請求間隔，避免過於頻繁
  ): Promise<SuumoSearchResult[]> {
    const results: SuumoSearchResult[] = [];

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      console.log(`🔄 批量搜尋 ${i + 1}/${areas.length}:`, area);
      
      try {
        const result = await this.quickSearch(area.center, area.radius);
        results.push(result);
        
        // 延遲避免過於頻繁的請求
        if (i < areas.length - 1 && delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`❌ 批量搜尋第 ${i + 1} 個區域失敗:`, error);
        results.push({
          properties: [],
          summary: { totalHits: 0, itemCount: 0, searchCondition: '批量搜尋失敗' },
          metadata: { searchArea: area },
          success: false,
          error: error instanceof Error ? error.message : '未知錯誤',
          apiCost: 0,
          timing: { tokenFetch: 0, apiCall: 0, processing: 0, total: 0 }
        });
      }
    }

    return results;
  }

  /**
   * 取得系統狀態
   */
  async getSystemStatus() {
    const tokenStatus = suumoApiClient.getTokenStatus();
    
    return {
      tokenManager: {
        ...tokenStatus,
        canRefresh: true
      },
      apiClient: {
        ready: true,
        lastUpdate: new Date().toISOString()
      },
      dataProcessor: {
        ready: true
      }
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken() {
    console.log('🔄 手動刷新 SUUMO Token...');
    return await suumoApiClient.refreshToken();
  }

  /**
   * 清除快取
   */
  clearCache() {
    suumoTokenManager.clearCache();
    console.log('🗑️ SUUMO 快取已清除');
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    details: {
      tokenManager: 'ok' | 'warning' | 'error';
      apiAccess: 'ok' | 'error';
      message: string;
    };
  }> {
    try {
      // 檢查 Token 管理器
      const tokenStatus = suumoTokenManager.getCacheStatus();
      const tokenHealth = tokenStatus.isValid ? 'ok' : 'warning';

      // 快速 API 測試 (小範圍搜尋)
      const testResult = await this.quickSearch(
        { lat: 35.6762, lng: 139.6503 }, // 東京車站
        100 // 很小的範圍
      );

      return {
        status: testResult.success ? 'healthy' : 'error',
        details: {
          tokenManager: tokenHealth,
          apiAccess: testResult.success ? 'ok' : 'error',
          message: testResult.success 
            ? `系統正常，找到 ${testResult.properties.length} 個物件` 
            : `API 測試失敗: ${testResult.error}`
        }
      };

    } catch (error) {
      return {
        status: 'error',
        details: {
          tokenManager: 'error',
          apiAccess: 'error',
          message: `健康檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
        }
      };
    }
  }
}

// 導出單例實例
export const suumoIntegration = new SuumoIntegration();

// 導出便利函數
export async function searchSuumoProperties(
  center: { lat: number; lng: number },
  radius: number = 500,
  filters?: {
    maxDistance?: number;
    excludeKeywords?: string[];
    includeKeywords?: string[];
  }
): Promise<SuumoSearchResult> {
  return await suumoIntegration.searchProperties({ center, radius, filters });
}