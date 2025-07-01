/**
 * 山手線車站資料
 * 包含所有30個車站的座標和日文名稱
 * 座標基於 WGS84 大地座標系
 */

export interface YamanoteStation {
  id: string;
  nameJa: string;
  nameEn: string;
  stationNumber: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  majorStation: boolean; // 主要車站標記
}

/**
 * 山手線全30車站資料
 * 按照車站號碼順序排列（JY01-JY30）
 */
export const YAMANOTE_STATIONS: YamanoteStation[] = [
  {
    id: 'tokyo',
    nameJa: '東京駅',
    nameEn: 'Tokyo Station',
    stationNumber: 'JY01',
    coordinates: { lat: 35.6813, lng: 139.7670 },
    majorStation: true
  },
  {
    id: 'kanda',
    nameJa: '神田駅',
    nameEn: 'Kanda Station',
    stationNumber: 'JY02',
    coordinates: { lat: 35.6919, lng: 139.7705 },
    majorStation: false
  },
  {
    id: 'akihabara',
    nameJa: '秋葉原駅',
    nameEn: 'Akihabara Station',
    stationNumber: 'JY03',
    coordinates: { lat: 35.6984, lng: 139.7731 },
    majorStation: true
  },
  {
    id: 'okachimachi',
    nameJa: '御徒町駅',
    nameEn: 'Okachimachi Station',
    stationNumber: 'JY04',
    coordinates: { lat: 35.7077, lng: 139.7755 },
    majorStation: false
  },
  {
    id: 'ueno',
    nameJa: '上野駅',
    nameEn: 'Ueno Station',
    stationNumber: 'JY05',
    coordinates: { lat: 35.7140, lng: 139.7774 },
    majorStation: true
  },
  {
    id: 'uguisudani',
    nameJa: '鶯谷駅',
    nameEn: 'Uguisudani Station',
    stationNumber: 'JY06',
    coordinates: { lat: 35.7208, lng: 139.7781 },
    majorStation: false
  },
  {
    id: 'nippori',
    nameJa: '日暮里駅',
    nameEn: 'Nippori Station',
    stationNumber: 'JY07',
    coordinates: { lat: 35.7278, lng: 139.7706 },
    majorStation: false
  },
  {
    id: 'nishinippori',
    nameJa: '西日暮里駅',
    nameEn: 'Nishi-Nippori Station',
    stationNumber: 'JY08',
    coordinates: { lat: 35.7321, lng: 139.7668 },
    majorStation: false
  },
  {
    id: 'tabata',
    nameJa: '田端駅',
    nameEn: 'Tabata Station',
    stationNumber: 'JY09',
    coordinates: { lat: 35.7381, lng: 139.7608 },
    majorStation: false
  },
  {
    id: 'komagome',
    nameJa: '駒込駅',
    nameEn: 'Komagome Station',
    stationNumber: 'JY10',
    coordinates: { lat: 35.7364, lng: 139.7475 },
    majorStation: false
  },
  {
    id: 'sugamo',
    nameJa: '巣鴨駅',
    nameEn: 'Sugamo Station',
    stationNumber: 'JY11',
    coordinates: { lat: 35.7334, lng: 139.7391 },
    majorStation: false
  },
  {
    id: 'otsuka',
    nameJa: '大塚駅',
    nameEn: 'Otsuka Station',
    stationNumber: 'JY12',
    coordinates: { lat: 35.7318, lng: 139.7284 },
    majorStation: false
  },
  {
    id: 'ikebukuro',
    nameJa: '池袋駅',
    nameEn: 'Ikebukuro Station',
    stationNumber: 'JY13',
    coordinates: { lat: 35.7295, lng: 139.7087 },
    majorStation: true
  },
  {
    id: 'mejiro',
    nameJa: '目白駅',
    nameEn: 'Mejiro Station',
    stationNumber: 'JY14',
    coordinates: { lat: 35.7215, lng: 139.7060 },
    majorStation: false
  },
  {
    id: 'takadanobaba',
    nameJa: '高田馬場駅',
    nameEn: 'Takadanobaba Station',
    stationNumber: 'JY15',
    coordinates: { lat: 35.7125, lng: 139.7038 },
    majorStation: false
  },
  {
    id: 'shinokubo',
    nameJa: '新大久保駅',
    nameEn: 'Shin-Okubo Station',
    stationNumber: 'JY16',
    coordinates: { lat: 35.7008, lng: 139.7000 },
    majorStation: false
  },
  {
    id: 'shinjuku',
    nameJa: '新宿駅',
    nameEn: 'Shinjuku Station',
    stationNumber: 'JY17',
    coordinates: { lat: 35.6894, lng: 139.6981 },
    majorStation: true
  },
  {
    id: 'yoyogi',
    nameJa: '代々木駅',
    nameEn: 'Yoyogi Station',
    stationNumber: 'JY18',
    coordinates: { lat: 35.6833, lng: 139.7020 },
    majorStation: false
  },
  {
    id: 'harajuku',
    nameJa: '原宿駅',
    nameEn: 'Harajuku Station',
    stationNumber: 'JY19',
    coordinates: { lat: 35.6708, lng: 139.7026 },
    majorStation: true
  },
  {
    id: 'shibuya',
    nameJa: '渋谷駅',
    nameEn: 'Shibuya Station',
    stationNumber: 'JY20',
    coordinates: { lat: 35.6580, lng: 139.7016 },
    majorStation: true
  },
  {
    id: 'ebisu',
    nameJa: '恵比寿駅',
    nameEn: 'Ebisu Station',
    stationNumber: 'JY21',
    coordinates: { lat: 35.6468, lng: 139.7101 },
    majorStation: false
  },
  {
    id: 'meguro',
    nameJa: '目黒駅',
    nameEn: 'Meguro Station',
    stationNumber: 'JY22',
    coordinates: { lat: 35.6336, lng: 139.7156 },
    majorStation: false
  },
  {
    id: 'gotanda',
    nameJa: '五反田駅',
    nameEn: 'Gotanda Station',
    stationNumber: 'JY23',
    coordinates: { lat: 35.6258, lng: 139.7238 },
    majorStation: false
  },
  {
    id: 'osaki',
    nameJa: '大崎駅',
    nameEn: 'Osaki Station',
    stationNumber: 'JY24',
    coordinates: { lat: 35.6197, lng: 139.7282 },
    majorStation: false
  },
  {
    id: 'shinagawa',
    nameJa: '品川駅',
    nameEn: 'Shinagawa Station',
    stationNumber: 'JY25',
    coordinates: { lat: 35.6284, lng: 139.7387 },
    majorStation: true
  },
  {
    id: 'takanawa-gateway',
    nameJa: '高輪ゲートウェイ駅',
    nameEn: 'Takanawa Gateway Station',
    stationNumber: 'JY26',
    coordinates: { lat: 35.6356, lng: 139.7403 },
    majorStation: false
  },
  {
    id: 'tamachi',
    nameJa: '田町駅',
    nameEn: 'Tamachi Station',
    stationNumber: 'JY27',
    coordinates: { lat: 35.6456, lng: 139.7477 },
    majorStation: false
  },
  {
    id: 'hamamatsucho',
    nameJa: '浜松町駅',
    nameEn: 'Hamamatsucho Station',
    stationNumber: 'JY28',
    coordinates: { lat: 35.6552, lng: 139.7570 },
    majorStation: false
  },
  {
    id: 'shimbashi',
    nameJa: '新橋駅',
    nameEn: 'Shimbashi Station',
    stationNumber: 'JY29',
    coordinates: { lat: 35.6663, lng: 139.7584 },
    majorStation: true
  },
  {
    id: 'yurakucho',
    nameJa: '有楽町駅',
    nameEn: 'Yurakucho Station',
    stationNumber: 'JY30',
    coordinates: { lat: 35.6751, lng: 139.7637 },
    majorStation: false
  }
];

/**
 * 備用資料：未來可能用到的其他地點類型
 * 保留變數但目前不使用
 */
export const FUTURE_SEARCH_TYPES = {
  // 便利商店
  CONVENIENCE_STORES: [
    'セブンイレブン', 'ファミリーマート', 'ローソン'
  ],
  
  // 咖啡店
  COFFEE_SHOPS: [
    'スターバックス', 'ドトール', 'タリーズ'
  ],
  
  // 健身房
  FITNESS_CENTERS: [
    'エニタイムフィットネス', 'ライザップ', 'ティップネス'
  ],
  
  // 藥妝店
  DRUG_STORES: [
    'マツモトキヨシ', 'ウエルシア', 'サンドラッグ'
  ]
} as const;

/**
 * 山手線輔助函數
 */
export const YamanoteUtils = {
  /**
   * 獲取所有主要車站
   */
  getMajorStations: (): YamanoteStation[] => {
    return YAMANOTE_STATIONS.filter(station => station.majorStation);
  },

  /**
   * 根據 ID 獲取車站
   */
  getStationById: (id: string): YamanoteStation | undefined => {
    return YAMANOTE_STATIONS.find(station => station.id === id);
  },

  /**
   * 獲取車站總數
   */
  getStationCount: (): number => {
    return YAMANOTE_STATIONS.length;
  },

  /**
   * 計算山手線的地理中心
   */
  getGeographicCenter: (): { lat: number; lng: number } => {
    const totalLat = YAMANOTE_STATIONS.reduce((sum, station) => sum + station.coordinates.lat, 0);
    const totalLng = YAMANOTE_STATIONS.reduce((sum, station) => sum + station.coordinates.lng, 0);
    
    return {
      lat: totalLat / YAMANOTE_STATIONS.length,
      lng: totalLng / YAMANOTE_STATIONS.length
    };
  }
};