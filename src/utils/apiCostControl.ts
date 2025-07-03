/**
 * Google API 成本控制工具
 * 防止意外產生高額費用
 */

export type ApiType = 'maps' | 'places_new' | 'places_text' | 'geocoding';

interface ApiCost {
  type: ApiType;
  cost: number; // USD per 1000 requests
  requests: number;
  timestamp: number;
}

export class GoogleApiCostController {
  private readonly DAILY_BUDGET_USD = 10; // 每日預算 $10 USD
  private readonly STORAGE_KEY = 'google_api_usage';
  
  // API 費用表 (USD per 1000 requests)
  private readonly API_COSTS: Record<ApiType, number> = {
    maps: 7,        // Maps JavaScript API
    places_new: 17, // Places API (New)
    places_text: 32, // Places Text Search (最貴!)
    geocoding: 5    // Geocoding API
  };

  /**
   * 檢查是否可以發送 API 請求
   */
  canMakeRequest(apiType: ApiType, requestCount: number = 1): boolean {
    // 開發模式強制禁用
    if (process.env.NODE_ENV === 'development' || 
        process.env.NEXT_PUBLIC_FORCE_MOCK_MODE === 'true') {
      console.log('🚨 開發模式：禁用真實 API 呼叫');
      return false;
    }

    const todayUsage = this.getTodayUsage();
    const estimatedCost = this.calculateCost(apiType, requestCount);
    const totalCostToday = this.calculateTotalCost(todayUsage);

    if (totalCostToday + estimatedCost > this.DAILY_BUDGET_USD) {
      console.error(`🚨 API 預算超限！今日已用: $${totalCostToday.toFixed(2)}, 請求費用: $${estimatedCost.toFixed(2)}, 預算: $${this.DAILY_BUDGET_USD}`);
      return false;
    }

    // Places Text Search 特別警告 (最貴的 API)
    if (apiType === 'places_text') {
      console.warn(`⚠️ 使用最昂貴的 API: ${apiType}, 費用: $${estimatedCost.toFixed(4)}`);
    }

    return true;
  }

  /**
   * 記錄 API 使用量
   */
  recordUsage(apiType: ApiType, requestCount: number = 1): void {
    const cost: ApiCost = {
      type: apiType,
      cost: this.calculateCost(apiType, requestCount),
      requests: requestCount,
      timestamp: Date.now()
    };

    const usage = this.getTodayUsage();
    usage.push(cost);
    
    // 只保留今天的記錄
    const todayUsage = usage.filter(this.isToday);
    this.saveUsage(todayUsage);

    const totalCost = this.calculateTotalCost(todayUsage);
    console.log(`📊 API 使用記錄: ${apiType} x${requestCount}, 費用: $${cost.cost.toFixed(4)}, 今日總計: $${totalCost.toFixed(2)}`);

    // 預算警告
    if (totalCost > this.DAILY_BUDGET_USD * 0.8) {
      console.warn(`⚠️ 接近每日預算限制！已用: $${totalCost.toFixed(2)} / $${this.DAILY_BUDGET_USD}`);
    }
  }

  /**
   * 獲取今日使用統計
   */
  getTodayStats(): {
    totalCost: number;
    totalRequests: number;
    budgetRemaining: number;
    usageByApi: Record<ApiType, { requests: number; cost: number }>;
  } {
    const todayUsage = this.getTodayUsage();
    const totalCost = this.calculateTotalCost(todayUsage);
    const totalRequests = todayUsage.reduce((sum, usage) => sum + usage.requests, 0);
    
    const usageByApi: Record<ApiType, { requests: number; cost: number }> = {
      maps: { requests: 0, cost: 0 },
      places_new: { requests: 0, cost: 0 },
      places_text: { requests: 0, cost: 0 },
      geocoding: { requests: 0, cost: 0 }
    };

    todayUsage.forEach(usage => {
      usageByApi[usage.type].requests += usage.requests;
      usageByApi[usage.type].cost += usage.cost;
    });

    return {
      totalCost,
      totalRequests,
      budgetRemaining: Math.max(0, this.DAILY_BUDGET_USD - totalCost),
      usageByApi
    };
  }

  /**
   * 重置今日使用量 (緊急用)
   */
  resetTodayUsage(): void {
    console.log('🔄 重置今日 API 使用量');
    this.saveUsage([]);
  }

  private calculateCost(apiType: ApiType, requestCount: number): number {
    return (this.API_COSTS[apiType] / 1000) * requestCount;
  }

  private calculateTotalCost(usage: ApiCost[]): number {
    return usage.reduce((sum, item) => sum + item.cost, 0);
  }

  private getTodayUsage(): ApiCost[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const allUsage: ApiCost[] = JSON.parse(stored);
      return allUsage.filter(this.isToday);
    } catch {
      return [];
    }
  }

  private saveUsage(usage: ApiCost[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('無法儲存 API 使用量:', error);
    }
  }

  private isToday(usage: ApiCost): boolean {
    const today = new Date();
    const usageDate = new Date(usage.timestamp);
    return (
      today.getFullYear() === usageDate.getFullYear() &&
      today.getMonth() === usageDate.getMonth() &&
      today.getDate() === usageDate.getDate()
    );
  }
}

// 全域單例
export const apiCostController = new GoogleApiCostController();

/**
 * 安全的 API 呼叫包裝器
 */
export async function safeApiCall<T>(
  apiType: ApiType,
  apiCall: () => Promise<T>,
  fallback: () => T,
  requestCount: number = 1
): Promise<T> {
  if (!apiCostController.canMakeRequest(apiType, requestCount)) {
    console.log(`🔄 API 預算限制，使用備用方案: ${apiType}`);
    return fallback();
  }

  try {
    const result = await apiCall();
    apiCostController.recordUsage(apiType, requestCount);
    return result;
  } catch (error) {
    console.error(`❌ API 呼叫失敗: ${apiType}`, error);
    return fallback();
  }
}

/**
 * 強制模擬模式 (緊急停用所有 API)
 */
export function enableForceStockMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('FORCE_MOCK_MODE', 'true');
    console.log('🚨 已啟用強制模擬模式，所有 API 呼叫將被阻止');
  }
}

export function disableForceStockMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('FORCE_MOCK_MODE');
    console.log('✅ 已停用強制模擬模式');
  }
}

export function isForceStockModeEnabled(): boolean {
  if (typeof window === 'undefined') return true; // SSR 時預設啟用
  return localStorage.getItem('FORCE_MOCK_MODE') === 'true';
}