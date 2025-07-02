/**
 * SUUMO 服務統一匯出
 * 提供完整的 SUUMO API 整合功能
 */

export { suumoTokenManager } from './tokenManager';
export { suumoApiClient } from './apiClient';
export * from './types';

// 初始化日誌
console.log('🚀 初始化 SUUMO 服務模組', {
  時間: new Date().toISOString(),
  模組: ['tokenManager', 'apiClient', 'types']
});

// 匯出便利函數
export const SuumoService = {
  /**
   * 快速健康檢查
   */
  async healthCheck() {
    try {
      const clientReady = await suumoApiClient.healthCheck();
      const tokenStatus = suumoTokenManager.getCacheStatus();
      
      return {
        客戶端準備就緒: clientReady,
        Token狀態: tokenStatus,
        整體狀態: clientReady ? '正常' : '需要初始化'
      };
    } catch (error) {
      return {
        客戶端準備就緒: false,
        錯誤: error instanceof Error ? error.message : '未知錯誤',
        整體狀態: '異常'
      };
    }
  },

  /**
   * 強制重新初始化
   */
  async forceReinit() {
    console.log('🔄 強制重新初始化 SUUMO 服務');
    await suumoApiClient.forceRefreshTokens();
    return await this.healthCheck();
  }
};