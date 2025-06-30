interface LatLng {
  lat: number;
  lng: number;
}

export interface SuumoProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  size: string;
  tags: string[];
  distance?: string;
  coordinates?: LatLng;
}

interface SuumoSearchParams {
  center: LatLng;
  radius: number;
  page?: number;
  maxPrice?: number;
  minPrice?: number;
}

// SUUMO API 回應結構
interface SuumoSearchResponse {
  smatch: {
    condition: string;
    resultset: {
      firsthit: number;
      hits: number;
      item: SuumoPropertyLocation[];
    };
  };
}

interface SuumoPropertyLocation {
  bukkenCdList: string[];
  lg: number; // 經度
  lt: number; // 緯度  
  shubetsuList: string[];
}

// SUUMO API URLs
const SUUMO_SEARCH_URL = 'https://suumo.jp/jj/JJ903FC020/';

// 構建 SUUMO 搜尋 URL（基於經緯度矩形範圍）
export const buildSuumoSearchUrl = (params: SuumoSearchParams): string => {
  // 計算搜尋矩形範圍（基於中心點和半徑）
  const radiusInDegrees = params.radius / 111320; // 大約轉換為度數
  const north = params.center.lat + radiusInDegrees;
  const south = params.center.lat - radiusInDegrees;
  const east = params.center.lng + radiusInDegrees;
  const west = params.center.lng - radiusInDegrees;

  const searchParams = {
    UID: 'smapi343',
    STMP: Date.now().toString(),
    ATT: '393f6c8aacc78e917f1ab33986f3e5b346dd947a', // 固定參數
    FORMAT: '1',
    CALLBACK: 'SUUMO.CALLBACK.FUNCTION',
    P: params.page?.toString() || '1',
    CNT: '50', // 限制結果數量
    GAZO: '2',
    PROT: '1',
    SE: '040', // 賃貸物件
    KUKEIPT1LT: north.toString(),
    KUKEIPT1LG: east.toString(),
    KUKEIPT2LT: south.toString(),
    KUKEIPT2LG: west.toString(),
    LITE_KBN: '1'
  };

  const urlParams = new URLSearchParams(searchParams);
  return `${SUUMO_SEARCH_URL}?${urlParams.toString()}`;
};

// 基於搜尋範圍生成智能模擬數據
export const getMockSuumoData = (params: SuumoSearchParams): Promise<SuumoProperty[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('🎭 生成基於座標的模擬 SUUMO 資料:', params.center);
      
      // 根據搜尋中心座標決定區域
      let areaName = '渋谷区';
      let stationName = '渋谷駅';
      
      if (params.center.lat > 35.7) {
        areaName = '新宿区';
        stationName = '新宿駅';
      } else if (params.center.lng > 139.77) {
        areaName = '台東区';
        stationName = '上野駅';
      } else if (params.center.lng < 139.7) {
        areaName = '世田谷区';
        stationName = '下北沢駅';
      }

      const mockData: SuumoProperty[] = [
        {
          id: `mock-${Date.now()}-1`,
          title: `${areaName}築浅デザイナーズマンション`,
          price: '165,000',
          location: `東京都${areaName}`,
          size: '26㎡',
          tags: ['ワンルーム', '築浅', 'デザイナーズ'],
          distance: `${stationName}徒歩${Math.floor(Math.random() * 10) + 3}分`,
          coordinates: params.center
        },
        {
          id: `mock-${Date.now()}-2`,
          title: `${stationName}近コンパクトルーム`,
          price: '120,000',
          location: `東京都${areaName}`,
          size: '22㎡',
          tags: ['1K', '駅近', 'エレベーター'],
          distance: `${stationName}徒歩${Math.floor(Math.random() * 8) + 2}分`,
          coordinates: {
            lat: params.center.lat + (Math.random() - 0.5) * 0.01,
            lng: params.center.lng + (Math.random() - 0.5) * 0.01
          }
        },
        {
          id: `mock-${Date.now()}-3`,
          title: `${areaName}陽当たり良好物件`,
          price: '195,000',
          location: `東京都${areaName}`,
          size: '30㎡',
          tags: ['1LDK', '南向き', '陽当たり良好'],
          distance: `${stationName}徒歩${Math.floor(Math.random() * 12) + 5}分`,
          coordinates: {
            lat: params.center.lat + (Math.random() - 0.5) * 0.008,
            lng: params.center.lng + (Math.random() - 0.5) * 0.008
          }
        },
        {
          id: `mock-${Date.now()}-4`,
          title: `リノベーション済み${areaName}物件`,
          price: '285,000',
          location: `東京都${areaName}`,
          size: '38㎡',
          tags: ['1LDK', 'リノベーション', '築浅'],
          distance: `${stationName}徒歩${Math.floor(Math.random() * 15) + 4}分`,
          coordinates: {
            lat: params.center.lat + (Math.random() - 0.5) * 0.012,
            lng: params.center.lng + (Math.random() - 0.5) * 0.012
          }
        },
        {
          id: `mock-${Date.now()}-5`,
          title: `${stationName}エリア高層階角部屋`,
          price: '225,000',
          location: `東京都${areaName}`,
          size: '32㎡',
          tags: ['1K', '高層階', '角部屋'],
          distance: `${stationName}徒歩${Math.floor(Math.random() * 18) + 6}分`,
          coordinates: {
            lat: params.center.lat + (Math.random() - 0.5) * 0.015,
            lng: params.center.lng + (Math.random() - 0.5) * 0.015
          }
        }
      ];

      // 根據搜尋參數過濾數據
      let filteredData = mockData;

      if (params.maxPrice) {
        filteredData = filteredData.filter(property => 
          parseInt(property.price.replace(',', '')) <= params.maxPrice!
        );
      }

      if (params.minPrice) {
        filteredData = filteredData.filter(property => 
          parseInt(property.price.replace(',', '')) >= params.minPrice!
        );
      }

      console.log(`🏠 生成了 ${filteredData.length} 筆 ${areaName} 附近的模擬物件`);
      resolve(filteredData);
    }, 800); // 模擬網路延遲
  });
};

// 解析 SUUMO JSONP 回應
const parseSuumoJsonp = (jsonpResponse: string): SuumoSearchResponse | null => {
  try {
    // 處理直接 JSON 格式（來自我們的代理）
    if (jsonpResponse.trim().startsWith('{')) {
      const parsed = JSON.parse(jsonpResponse);
      
      // 檢查是否有錯誤訊息
      if (parsed.smatch && parsed.smatch.errors) {
        console.error('SUUMO API 錯誤:', parsed.smatch.errors.error[0].message);
        return null;
      }
      
      return parsed;
    }
    
    // 處理 JSONP 格式
    const jsonStart = jsonpResponse.indexOf('(') + 1;
    const jsonEnd = jsonpResponse.lastIndexOf(')');
    if (jsonStart > 0 && jsonEnd > jsonStart) {
      const jsonStr = jsonpResponse.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);
      
      // 檢查是否有錯誤訊息
      if (parsed.smatch && parsed.smatch.errors) {
        console.error('SUUMO API 錯誤:', parsed.smatch.errors.error[0].message);
        return null;
      }
      
      return parsed;
    }
    
    throw new Error('無效的回應格式');
  } catch (error) {
    console.error('解析 SUUMO JSONP 失敗:', error);
    return null;
  }
};

// 生成假的物件詳細資料（因為只有物件ID，無法取得完整資訊）
const generateMockPropertyDetails = (bukkenCd: string, location: LatLng): SuumoProperty => {
  const prices = ['85,000', '120,000', '180,000', '250,000', '95,000'];
  const sizes = ['25㎡', '30㎡', '35㎡', '45㎡', '28㎡'];
  const titles = [
    '築浅デザイナーズマンション',
    '駅近コンパクトルーム',
    '陽当たり良好1K',
    'リノベーション物件',
    '高層階角部屋'
  ];
  const areas = ['渋谷区', '新宿区', '港区', '中央区', '千代田区'];
  const stations = ['渋谷駅', '新宿駅', '表参道駅', '銀座駅', '東京駅'];
  
  const index = parseInt(bukkenCd.slice(-1)) % 5;
  
  return {
    id: bukkenCd,
    title: titles[index],
    price: prices[index],
    location: `東京都${areas[index]}`,
    size: sizes[index],
    tags: ['ワンルーム', '駅近', 'エレベーター'],
    distance: `${stations[index]}徒歩${Math.floor(Math.random() * 15) + 3}分`,
    coordinates: location
  };
};

// 實際的 SUUMO API 請求（通過 Next.js API 代理）
export const fetchSuumoData = async (params: SuumoSearchParams): Promise<SuumoProperty[]> => {
  try {
    // 計算搜尋矩形範圍（基於中心點和半徑）
    const radiusInDegrees = params.radius / 111320; // 大約轉換為度數
    const north = params.center.lat + radiusInDegrees;
    const south = params.center.lat - radiusInDegrees;
    const east = params.center.lng + radiusInDegrees;
    const west = params.center.lng - radiusInDegrees;

    const searchParams = new URLSearchParams({
      UID: 'smapi343',
      STMP: Date.now().toString(),
      ATT: '393f6c8aacc78e917f1ab33986f3e5b346dd947a',
      FORMAT: '1',
      CALLBACK: 'SUUMO.CALLBACK.FUNCTION',
      P: params.page?.toString() || '1',
      CNT: '50',
      GAZO: '2',
      PROT: '1',
      SE: '040',
      KUKEIPT1LT: north.toString(),
      KUKEIPT1LG: east.toString(),
      KUKEIPT2LT: south.toString(),
      KUKEIPT2LG: west.toString(),
      LITE_KBN: '1'
    });

    const proxyUrl = `/api/suumo?${searchParams.toString()}`;
    console.log('🏠 通過代理請求 SUUMO:', proxyUrl);
    
    // 使用 Next.js API 代理
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const jsonpText = await response.text();
    console.log('📝 SUUMO 原始回應:', jsonpText.substring(0, 500) + '...');
    
    const parsedData = parseSuumoJsonp(jsonpText);
    
    if (!parsedData || !parsedData.smatch.resultset.item) {
      console.warn('⚠️ 無法解析 SUUMO 資料，使用模擬資料');
      return await getMockSuumoData(params);
    }
    
    console.log(`✅ SUUMO 找到 ${parsedData.smatch.resultset.hits} 筆物件`);
    
    // 轉換前5筆資料為 SuumoProperty 格式
    const properties: SuumoProperty[] = [];
    const items = parsedData.smatch.resultset.item.slice(0, 5);
    
    for (const item of items) {
      for (const bukkenCd of item.bukkenCdList) {
        if (properties.length >= 5) break;
        
        const property = generateMockPropertyDetails(bukkenCd, {
          lat: item.lt,
          lng: item.lg
        });
        properties.push(property);
      }
      if (properties.length >= 5) break;
    }
    
    console.log('🏠 處理後的物件資料:', properties);
    return properties;
    
  } catch (error) {
    console.error('❌ SUUMO API 請求失敗:', error);
    console.log('🔄 回退到模擬資料');
    return await getMockSuumoData(params);
  }
};

// 根據交集區域搜尋租屋資料
export const searchPropertiesInIntersection = async (
  center: LatLng, 
  radius: number, 
  filters?: { maxPrice?: number; minPrice?: number }
): Promise<SuumoProperty[]> => {
  const searchParams: SuumoSearchParams = {
    center,
    radius,
    maxPrice: filters?.maxPrice,
    minPrice: filters?.minPrice
  };

  return await fetchSuumoData(searchParams);
};