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
}

interface SuumoSearchParams {
  center: LatLng;
  radius: number;
  page?: number;
  maxPrice?: number;
  minPrice?: number;
}

// SUUMO API 基礎 URL
const SUUMO_BASE_URL = 'https://suumo.jp/jj/chintai/ichiran/FR301FC001/';

// 構建 SUUMO 搜尋 URL
export const buildSuumoSearchUrl = (params: SuumoSearchParams): string => {
  const baseParams = {
    ar: '030',           // 區域代碼
    bs: '040',           // 建物種別
    ta: '13',            // 東京都
    sc: '13101,13102,13103,13104,13105,13113,13106,13107,13108,13118,13121,13122,13123,13109,13110,13111,13112,13114,13115,13120,13116,13117,13119', // 東京23區
    cb: params.minPrice?.toString() || '0.0',
    ct: params.maxPrice?.toString() || '9999999',
    mb: '0',
    mt: '9999999',
    et: '9999999',
    cn: '9999999',
    shkr1: '03',
    shkr2: '03',
    shkr3: '03',
    shkr4: '03',
    sngz: '',
    po1: '25',           // 徒步25分鐘內
    pc: '50',            // 每頁50筆
    page: params.page?.toString() || '1'
  };

  const urlParams = new URLSearchParams(baseParams);
  return `${SUUMO_BASE_URL}?${urlParams.toString()}`;
};

// 模擬 SUUMO 數據（因為實際 API 可能有 CORS 限制）
export const getMockSuumoData = (params: SuumoSearchParams): Promise<SuumoProperty[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: SuumoProperty[] = [
        {
          id: 'suumo-1',
          title: '新宿駅徒歩8分マンション',
          price: '180,000',
          location: '東京都新宿区西新宿',
          size: '25㎡',
          tags: ['ワンルーム', '駅近', 'エレベーター'],
          distance: '徒歩8分'
        },
        {
          id: 'suumo-2',
          title: '渋谷区デザイナーズアパート',
          price: '280,000',
          location: '東京都渋谷区恵比寿',
          size: '35㎡',
          tags: ['1K', 'デザイナーズ', '南向き'],
          distance: '徒歩12分'
        },
        {
          id: 'suumo-3',
          title: '港区高級マンション',
          price: '450,000',
          location: '東京都港区六本木',
          size: '55㎡',
          tags: ['1LDK', '高級', 'コンシェルジュ'],
          distance: '徒歩5分'
        },
        {
          id: 'suumo-4',
          title: '品川区ファミリー向け',
          price: '320,000',
          location: '東京都品川区大崎',
          size: '65㎡',
          tags: ['2LDK', 'ファミリー', 'ペット可'],
          distance: '徒歩15分'
        },
        {
          id: 'suumo-5',
          title: '中央区リノベ物件',
          price: '350,000',
          location: '東京都中央区銀座',
          size: '45㎡',
          tags: ['1LDK', 'リノベーション', '築浅'],
          distance: '徒歩6分'
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

      resolve(filteredData);
    }, 500); // 模擬網路延遲
  });
};

// 實際的 SUUMO API 請求（可能會遇到 CORS 問題）
export const fetchSuumoData = async (params: SuumoSearchParams): Promise<SuumoProperty[]> => {
  try {
    const url = buildSuumoSearchUrl(params);
    console.log('SUUMO Search URL:', url);
    
    // 由於 CORS 限制，這裡使用模擬數據
    return await getMockSuumoData(params);
    
    // 如果要使用真實 API，需要後端代理或 CORS 解決方案
    // const response = await fetch(url);
    // const html = await response.text();
    // return parseSuumoHtml(html);
    
  } catch (error) {
    console.error('Error fetching SUUMO data:', error);
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