/**
 * SUUMO API 服務類型定義
 */

export interface SuumoTokens {
  bkApi: {
    UID: string;
    STMP: string;
    ATT: string;
  };
}

export interface SuumoApiParams {
  UID?: string;
  STMP?: string;
  ATT?: string;
  FORMAT?: string;
  CALLBACK?: string;
  P?: string;
  CNT?: string;
  GAZO?: string;
  PROT?: string;
  SE?: string;
  KUKEIPT1LT?: string;
  KUKEIPT1LG?: string;
  KUKEIPT2LT?: string;
  KUKEIPT2LG?: string;
  LITE_KBN?: string;
}

export interface SuumoApiResponse {
  smatch?: {
    condition?: string;
    resultset?: {
      firsthit: number;
      hits: number;
      item: Array<{
        bukkenCdList: string[];
        lg: number;
        lt: number;
        shubetsuList: string[];
      }>;
    };
    errors?: {
      error: Array<{
        message: string;
      }>;
    };
  };
}

export interface TokenCacheEntry {
  tokens: SuumoTokens;
  timestamp: number;
  expiresAt: number;
}

export interface SuumoApiError extends Error {
  isAuthError?: boolean;
  shouldRetry?: boolean;
}