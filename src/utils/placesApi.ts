interface LatLng {
  lat: number;
  lng: number;
}

export interface PlaceResult {
  place_id: string;
  name: string;
  location: LatLng;
  address: string;
  rating?: number;
  types: string[];
}

export interface RequirementCircle {
  id: string;
  requirement: string;
  places: PlaceResult[];
  color: string;
  colorIndex: number;
}

// 🎯 豐富的模擬資料（避免 Google API 費用）
const MOCK_PLACES_DATA: { [key: string]: PlaceResult[] } = {
  'anytime fitness': [
    {
      place_id: 'anytime_1',
      name: 'Anytime Fitness 新宿店',
      location: { lat: 35.6938, lng: 139.7036 },
      address: '東京都新宿区新宿3-1-13',
      rating: 4.2,
      types: ['gym', 'health']
    },
    {
      place_id: 'anytime_2',
      name: 'Anytime Fitness 渋谷店',
      location: { lat: 35.6617, lng: 139.7040 },
      address: '東京都渋谷区渋谷2-22-10',
      rating: 4.1,
      types: ['gym', 'health']
    },
    {
      place_id: 'anytime_3',
      name: 'Anytime Fitness 池袋店',
      location: { lat: 35.7295, lng: 139.7109 },
      address: '東京都豊島区南池袋1-28-1',
      rating: 4.0,
      types: ['gym', 'health']
    },
    {
      place_id: 'anytime_4',
      name: 'Anytime Fitness 品川店',
      location: { lat: 35.6284, lng: 139.7387 },
      address: '東京都港区高輪3-25-23',
      rating: 4.3,
      types: ['gym', 'health']
    },
    {
      place_id: 'anytime_5',
      name: 'Anytime Fitness 上野店',
      location: { lat: 35.7090, lng: 139.7740 },
      address: '東京都台東区上野6-16-16',
      rating: 3.9,
      types: ['gym', 'health']
    },
    {
      place_id: 'anytime_6',
      name: 'Anytime Fitness 中野店',
      location: { lat: 35.7056, lng: 139.6659 },
      address: '東京都中野区中野2-13-7',
      rating: 4.0,
      types: ['gym', 'health']
    },
    {
      place_id: 'anytime_7',
      name: 'Anytime Fitness 錦糸町店',
      location: { lat: 35.6969, lng: 139.8148 },
      address: '東京都墨田区錦糸2-4-1',
      rating: 3.8,
      types: ['gym', 'health']
    }
  ],
  'gym': [
    {
      place_id: 'gym_gold_1',
      name: 'ゴールドジム 東京ベイ有明店',
      location: { lat: 35.6367, lng: 139.7947 },
      address: '東京都江東区有明1-5-22',
      rating: 4.4,
      types: ['gym', 'health']
    },
    {
      place_id: 'gym_central_1',
      name: 'セントラルスポーツ 新宿店',
      location: { lat: 35.6911, lng: 139.7018 },
      address: '東京都新宿区新宿2-1-1',
      rating: 4.1,
      types: ['gym', 'health']
    },
    {
      place_id: 'gym_tipness_1',
      name: 'ティップネス 渋谷店',
      location: { lat: 35.6584, lng: 139.7016 },
      address: '東京都渋谷区渋谷1-23-16',
      rating: 4.0,
      types: ['gym', 'health']
    },
    {
      place_id: 'gym_renaissance_1',
      name: 'ルネサンス 両国店',
      location: { lat: 35.6959, lng: 139.7936 },
      address: '東京都墨田区両国2-10-14',
      rating: 3.9,
      types: ['gym', 'health']
    }
  ],
  '健身房': [
    {
      place_id: 'gym_gold_1',
      name: 'ゴールドジム 東京ベイ有明店',
      location: { lat: 35.6367, lng: 139.7947 },
      address: '東京都江東区有明1-5-22',
      rating: 4.4,
      types: ['gym', 'health']
    },
    {
      place_id: 'gym_central_1',
      name: 'セントラルスポーツ 新宿店',
      location: { lat: 35.6911, lng: 139.7018 },
      address: '東京都新宿区新宿2-1-1',
      rating: 4.1,
      types: ['gym', 'health']
    },
    {
      place_id: 'anytime_1',
      name: 'Anytime Fitness 新宿店',
      location: { lat: 35.6938, lng: 139.7036 },
      address: '東京都新宿区新宿3-1-13',
      rating: 4.2,
      types: ['gym', 'health']
    }
  ],
  'starbucks': [
    {
      place_id: 'starbucks_1',
      name: 'スターバックス 新宿南口店',
      location: { lat: 35.6896, lng: 139.7006 },
      address: '東京都新宿区新宿3-38-1',
      rating: 4.0,
      types: ['cafe', 'food']
    },
    {
      place_id: 'starbucks_2',
      name: 'スターバックス 渋谷スカイビル店',
      location: { lat: 35.6581, lng: 139.7016 },
      address: '東京都渋谷区渋谷2-24-12',
      rating: 4.1,
      types: ['cafe', 'food']
    },
    {
      place_id: 'starbucks_3',
      name: 'スターバックス 銀座松屋通り店',
      location: { lat: 35.6719, lng: 139.7648 },
      address: '東京都中央区銀座3-6-1',
      rating: 4.2,
      types: ['cafe', 'food']
    },
    {
      place_id: 'starbucks_4',
      name: 'スターバックス 東京駅八重洲北口店',
      location: { lat: 35.6813, lng: 139.7660 },
      address: '東京都千代田区丸の内1-9-1',
      rating: 4.0,
      types: ['cafe', 'food']
    },
    {
      place_id: 'starbucks_5',
      name: 'スターバックス 六本木ヒルズ店',
      location: { lat: 35.6606, lng: 139.7298 },
      address: '東京都港区六本木6-10-1',
      rating: 4.3,
      types: ['cafe', 'food']
    }
  ],
  'コンビニ': [
    {
      place_id: 'convenience_1',
      name: 'セブン-イレブン 新宿三丁目店',
      location: { lat: 35.6919, lng: 139.7065 },
      address: '東京都新宿区新宿3-5-6',
      rating: 3.8,
      types: ['convenience_store', 'store']
    },
    {
      place_id: 'convenience_2',
      name: 'ファミリーマート 渋谷センター街店',
      location: { lat: 35.6598, lng: 139.6987 },
      address: '東京都渋谷区宇田川町25-4',
      rating: 3.9,
      types: ['convenience_store', 'store']
    },
    {
      place_id: 'convenience_3',
      name: 'ローソン 銀座四丁目店',
      location: { lat: 35.6716, lng: 139.7674 },
      address: '東京都中央区銀座4-6-16',
      rating: 3.7,
      types: ['convenience_store', 'store']
    },
    {
      place_id: 'convenience_4',
      name: 'セブン-イレブン 池袋東口店',
      location: { lat: 35.7280, lng: 139.7146 },
      address: '東京都豊島区南池袋1-22-5',
      rating: 3.8,
      types: ['convenience_store', 'store']
    },
    {
      place_id: 'convenience_5',
      name: 'ファミリーマート 品川駅前店',
      location: { lat: 35.6289, lng: 139.7413 },
      address: '東京都港区高輪3-26-27',
      rating: 4.0,
      types: ['convenience_store', 'store']
    }
  ]
};

// 顏色配置（對應三個需求）
export const REQUIREMENT_COLORS = [
  '#ef4444', // red-500 - 第一個需求
  '#3b82f6', // blue-500 - 第二個需求  
  '#10b981'  // emerald-500 - 第三個需求
];

// 深色標記顏色（600色階）
export const REQUIREMENT_MARKER_COLORS = [
  '#dc2626', // red-600 - 第一個需求標記
  '#2563eb', // blue-600 - 第二個需求標記  
  '#059669'  // emerald-600 - 第三個需求標記
];

// 地圖邊界類型
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// 單次 API 請求（支援分頁和動態範圍）
const fetchPlacesPage = async (
  query: string,
  apiKey: string,
  bounds?: MapBounds,
  pageToken?: string
): Promise<{ places: PlaceResult[], nextPageToken?: string }> => {
  const requestBody: any = {
    textQuery: query,
    maxResultCount: 20, // 每頁最大 20 個
    languageCode: "ja"
  };

  // 如果提供了地圖邊界，使用 locationRestriction
  console.log('🔍 準備 Places API (New) 請求:', query, bounds, pageToken);
  if (bounds) {
    requestBody.locationRestriction = {
      rectangle: {
        low: {
          latitude: bounds.south,
          longitude: bounds.west
        },
        high: {
          latitude: bounds.north,
          longitude: bounds.east
        }
      }
    };
  } else {
    // 回退到東京中心搜尋
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: 35.6762,
          longitude: 139.6503
        },
        radius: 50000.0
      }
    };
    requestBody.textQuery = `${query} in Tokyo, Japan`;
  }

  // 如果有 pageToken，加入請求中
  if (pageToken) {
    requestBody.pageToken = pageToken;
  }

  console.log('📡 Places API (New) 請求:', requestBody);

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.formattedAddress,places.rating,places.types,nextPageToken'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('📡 Places API (New) 回應:', data);

  let places: PlaceResult[] = data.places ? data.places.map((place: any) => ({
    place_id: place.id || '',
    name: place.displayName?.text || '',
    location: {
      lat: place.location?.latitude || 0,
      lng: place.location?.longitude || 0
    },
    address: place.formattedAddress || '',
    rating: place.rating,
    types: place.types || []
  })) : [];

  // 如果提供了邊界，客戶端再次過濾確保結果在範圍內
  if (bounds && places.length > 0) {
    const originalCount = places.length;
    places = places.filter(place => {
      const lat = place.location.lat;
      const lng = place.location.lng;
      const inBounds = lat >= bounds.south && lat <= bounds.north &&
        lng >= bounds.west && lng <= bounds.east;
      return inBounds;
    });
    console.log(`🔍 客戶端過濾: ${originalCount} -> ${places.length} 個結果在範圍內`);
  }

  return {
    places,
    nextPageToken: data.nextPageToken
  };
};

// 延遲函數（Google API 需要等待 token 生效）
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 智慧搜尋地點：OSM 優先，Google API 備用
export const searchPlaces = async (query: string, bounds?: MapBounds): Promise<PlaceResult[]> => {
  console.log(`🔍 開始搜尋: "${query}"${bounds ? ' (使用地圖範圍)' : ' (使用預設範圍)'}`);

  // 檢查是否強制使用模擬資料
  if (process.env.NEXT_PUBLIC_FORCE_MOCK_MODE === 'true') {
    console.log('🎭 強制模擬模式：使用假資料');
    return getMockPlaces(query);
  }

  // 嘗試使用 OSM 資料 (免費)
  try {
    console.log('🗺️ 嘗試使用 OSM 資料 (免費)');
    const osmResults = await searchWithOSM(query, bounds);
    
    if (osmResults.length > 0) {
      console.log(`✅ OSM 找到 ${osmResults.length} 個地點`);
      return osmResults;
    } else {
      console.log('⚠️ OSM 沒有找到結果，回退到模擬資料');
      return getMockPlaces(query);
    }
  } catch (error) {
    console.error('❌ OSM 查詢失敗:', error);
    console.log('🔄 回退到模擬資料');
    return getMockPlaces(query);
  }

  /* 
  // Google API 已停用，避免費用
  // 🚨 緊急修復：強制使用模擬資料，避免 Google API 費用
  console.log('💰 為避免高額費用，強制使用模擬資料');
  console.log('📝 如需啟用真實 API，請設定 NEXT_PUBLIC_FORCE_MOCK_MODE=false 並確認預算控制');
  return getMockPlaces(query);
  */

  /* 
  // 真實 API 呼叫已暫停，避免費用
  try {
    // 檢查是否在瀏覽器環境
    if (typeof window === 'undefined') {
      console.warn('❌ 非瀏覽器環境，使用模擬資料');
      return getMockPlaces(query);
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('❌ Google API Key 未設定，使用模擬資料');
      return getMockPlaces(query);
    }

    console.log('✅ 使用新版 Places API (New) 開始分頁搜尋');
    if (bounds) {
      console.log('🗺️ 搜尋範圍:', bounds);
    }

    let allPlaces: PlaceResult[] = [];
    let pageCount = 0;
    const maxPages = 1; // 只取第一頁（20 個結果）

    // 只搜尋第一頁
    try {
      const firstPage = await fetchPlacesPage(query, apiKey, bounds);
      allPlaces = [...firstPage.places];
      pageCount = 1;

      console.log(`📄 第 ${pageCount} 頁: 找到 ${firstPage.places.length} 個地點`);

      if (allPlaces.length > 0) {
        console.log(`✅ 總共找到 ${allPlaces.length} 個真實地點 for "${query}" (${pageCount} 頁)`);
        console.log('📍 所有地點:', allPlaces.map(p => ({ name: p.name, address: p.address })));
        return allPlaces;
      } else {
        console.log('❌ 沒有找到結果，回退到模擬資料');
        return getMockPlaces(query);
      }
    } catch (apiError) {
      console.error('❌ Places API (New) 請求失敗:', apiError);
      console.log('🔄 回退到模擬資料');
      return getMockPlaces(query);
    }
  } catch (error) {
    console.error('❌ 搜尋地點時發生錯誤:', error);
    console.log('🔄 回退到模擬資料');
    return getMockPlaces(query);
  }
  */
};

// 根據查詢確定地點類型
const getPlaceType = (query: string): string => {
  const normalizedQuery = query.toLowerCase();

  if (normalizedQuery.includes('fitness') || normalizedQuery.includes('gym')) {
    return 'gym';
  } else if (normalizedQuery.includes('starbucks') || normalizedQuery.includes('coffee')) {
    return 'cafe';
  } else if (normalizedQuery.includes('コンビニ') || normalizedQuery.includes('convenience')) {
    return 'convenience_store';
  }

  return 'establishment'; // 預設類型
};

// 模擬資料備援（當 API 無法使用時）
const getMockPlaces = (query: string): PlaceResult[] => {
  const normalizedQuery = query.toLowerCase();

  console.log(`🎭 模擬資料搜尋: "${query}" -> "${normalizedQuery}"`);

  // 健身房相關搜尋
  if (normalizedQuery.includes('anytime') && normalizedQuery.includes('fitness')) {
    console.log('✅ 匹配: Anytime Fitness');
    return MOCK_PLACES_DATA['anytime fitness'];
  } else if (normalizedQuery.includes('gym') || normalizedQuery.includes('健身房') || 
             normalizedQuery.includes('fitness') || normalizedQuery.includes('ジム')) {
    console.log('✅ 匹配: 健身房');
    return MOCK_PLACES_DATA['gym'];
  }
  
  // 咖啡店相關搜尋
  else if (normalizedQuery.includes('starbucks') || normalizedQuery.includes('スターバックス') ||
           normalizedQuery.includes('星巴克')) {
    console.log('✅ 匹配: Starbucks');
    return MOCK_PLACES_DATA['starbucks'];
  }
  
  // 便利商店相關搜尋
  else if (normalizedQuery.includes('コンビニ') || normalizedQuery.includes('convenience') ||
           normalizedQuery.includes('便利商店') || normalizedQuery.includes('711') ||
           normalizedQuery.includes('seven') || normalizedQuery.includes('familymart') ||
           normalizedQuery.includes('lawson')) {
    console.log('✅ 匹配: 便利商店');
    return MOCK_PLACES_DATA['コンビニ'];
  }
  
  console.log('❌ 無匹配的模擬資料');
  return [];
};

// 使用 OSM 資料搜尋 (免費)
const searchWithOSM = async (query: string, bounds?: MapBounds): Promise<PlaceResult[]> => {
  console.log(`🗺️ OSM 搜尋: "${query}"`);

  try {
    // 如果沒有提供邊界，使用東京中心區域
    const searchBounds = bounds || {
      north: 35.7,
      south: 35.65,
      east: 139.8,
      west: 139.65
    };

    // 呼叫 OSM 搜尋 API
    const response = await fetch('/api/osm-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requirements: [query],
        center: {
          lat: (searchBounds.north + searchBounds.south) / 2,
          lng: (searchBounds.east + searchBounds.west) / 2
        },
        searchRadius: 2000, // 2km 搜尋半徑
        intersectionRadius: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OSM API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.data.stores[query]) {
      console.log('⚠️ OSM 沒有找到該需求的結果');
      return [];
    }

    // 轉換 OSM 結果為 PlaceResult 格式
    const osmLocations = data.data.stores[query].locations;
    const placeResults: PlaceResult[] = osmLocations.map((location: any, index: number) => ({
      place_id: location.id,
      name: location.name,
      location: {
        lat: location.lat,
        lng: location.lng
      },
      address: location.address || '',
      rating: location.rating,
      types: location.types || ['establishment']
    }));

    console.log(`✅ OSM 轉換完成: ${placeResults.length} 個地點`);
    return placeResults;

  } catch (error) {
    console.error('❌ OSM 搜尋失敗:', error);
    throw error;
  }
};

// 根據需求建立圓圈資料（即時回調版本，支援動態範圍）
export const createRequirementCirclesAsync = async (
  requirements: string[],
  onCircleReady: (circle: RequirementCircle) => void,
  bounds?: MapBounds
): Promise<void> => {
  const searchPromises = requirements.slice(0, 3).map(async (requirement, i) => {
    try {
      console.log(`🚀 開始搜尋需求 ${i + 1}: "${requirement}"`);
      const places = await searchPlaces(requirement, bounds);

      const circle: RequirementCircle = {
        id: `requirement-${i}`,
        requirement,
        places,
        color: REQUIREMENT_COLORS[i],
        colorIndex: i
      };

      console.log(`✅ 需求 ${i + 1} 搜尋完成，立即渲染`);
      onCircleReady(circle);

      return circle;
    } catch (error) {
      console.error(`❌ 需求 ${i + 1} 搜尋失敗:`, error);
      return null;
    }
  });

  // 等待所有搜尋完成
  await Promise.all(searchPromises);
  console.log('🎉 所有需求搜尋完成');
};

// 舊版同步方法（保留向後兼容）
export const createRequirementCircles = async (requirements: string[]): Promise<RequirementCircle[]> => {
  const circles: RequirementCircle[] = [];

  for (let i = 0; i < requirements.length && i < 3; i++) {
    const requirement = requirements[i];
    const places = await searchPlaces(requirement);

    circles.push({
      id: `requirement-${i}`,
      requirement,
      places,
      color: REQUIREMENT_COLORS[i],
      colorIndex: i
    });
  }

  return circles;
};

// 寫死的三個需求（先用這個測試）
export const DEFAULT_REQUIREMENTS = [
  'anytime fitness',
  'starbucks'
  // 'コンビニ'
];