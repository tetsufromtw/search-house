# 🆓 零成本後端架構設計

## 📋 設計目標
**完全不使用 Google Places API，實現零 API 費用**

### 💡 核心策略
1. **靜態資料庫**: 預先收集東京地區商店資料
2. **免費 API 替代**: 使用 OpenStreetMap 等免費服務
3. **爬蟲數據**: 合法爬取公開商店資訊
4. **眾包數據**: 用戶貢獻和驗證資料

## 🗾 資料來源策略

### 1. OpenStreetMap (完全免費)
```python
# 使用 Overpass API 查詢
query = """
[out:json][timeout:25];
(
  node["amenity"="cafe"]["brand"="Starbucks"](35.6,139.6,35.8,139.8);
  way["amenity"="cafe"]["brand"="Starbucks"](35.6,139.6,35.8,139.8);
  relation["amenity"="cafe"]["brand"="Starbucks"](35.6,139.6,35.8,139.8);
);
out geom;
"""
# 完全免費，無 API 限制
```

### 2. 官方網站爬蟲 (合法)
```python
# Starbucks 官網店鋪查詢
starbucks_url = "https://store-locator.starbucks.co.jp/api/stores"
# 每日更新，自動爬取最新店鋪資訊

# Anytime Fitness 官網
anytime_url = "https://www.anytimefitness.co.jp/shop_list/"
# 所有健身房位置和營業時間

# 7-Eleven, FamilyMart, Lawson 官網
# 便利商店密度最高，資料最完整
```

### 3. 政府開放資料 (免費)
```python
# 東京都オープンデータカタログ
# https://portal.data.metro.tokyo.lg.jp/
- 商業施設基本資料
- 建築物用途資料  
- 地理情報基盤資料

# 国土地理院 (免費地圖 API)
# https://maps.gsi.go.jp/development/api.html
```

### 4. 預製資料集
```python
# 從知名資料集預先載入
datasets = {
    "starbucks_global": "kaggle.com/datasets/starbucks-store-locations",
    "japan_pois": "openstreetmap.org/export",
    "tokyo_businesses": "data.metro.tokyo.lg.jp"
}
```

## 🏗️ 零成本技術架構

### 免費技術棧
```
┌─────────────────┐
│   Frontend      │ Next.js (Vercel 免費部署)
└─────────────────┘
         │
┌─────────────────┐
│   Backend       │ FastAPI (Railway/Render 免費層)
└─────────────────┘
         │
┌─────────────────┐
│   Database      │ PostgreSQL (Supabase 免費 500MB)
└─────────────────┘
         │
┌─────────────────┐
│   Cache         │ Redis (Upstash 免費 10MB)
└─────────────────┘
         │
┌─────────────────┐
│   External      │ OpenStreetMap (完全免費)
└─────────────────┘
```

### 免費服務配額
- **Vercel**: 免費部署 Next.js
- **Supabase**: 500MB PostgreSQL + 2GB 傳輸
- **Upstash Redis**: 10MB 記憶體 + 10K 請求/天
- **Railway**: 500 小時免費運行時間
- **OpenStreetMap**: 無限制使用

## 📊 資料收集策略

### 1. 批量資料預載入
```python
# 一次性載入所有東京都商店資料
async def preload_tokyo_data():
    # Starbucks: ~300 間店
    starbucks_data = await scrape_starbucks_stores()
    
    # 健身房: ~200 間
    gym_data = await scrape_gym_chains([
        "anytime_fitness", "gold_gym", "central_sports", 
        "tipness", "renaissance", "joyfit"
    ])
    
    # 便利商店: ~2000 間 (取樣主要區域)
    convenience_data = await scrape_convenience_stores([
        "seven_eleven", "family_mart", "lawson"
    ])
    
    await bulk_insert_to_database(starbucks_data + gym_data + convenience_data)
```

### 2. 增量更新機制
```python
# 每週自動更新
@scheduler.task('cron', week='*', day_of_week='sun', hour=2)
async def weekly_update():
    # 只更新變化的店鋪
    changes = await detect_store_changes()
    await apply_incremental_updates(changes)
    
# 用戶回報機制
async def user_report_store(store_data):
    # 用戶可以回報新店或歇業
    await add_pending_verification(store_data)
```

## 🗺️ 地圖顯示策略

### 免費地圖服務
```typescript
// 選項 1: OpenStreetMap + Leaflet (完全免費)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const map = L.map('map').setView([35.6762, 139.6503], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 選項 2: Google Maps 僅載入 (不使用 Places API)
// 基本地圖載入費用很低：約 $2/1000 次載入
<GoogleMap
  apiKey={process.env.GOOGLE_API_KEY}
  defaultZoom={13}
  defaultCenter={{ lat: 35.6762, lng: 139.6503 }}
>
  {/* 使用自己的資料顯示標記 */}
</GoogleMap>
```

### 混合策略 (推薦)
```typescript
// 開發/演示: OpenStreetMap (免費)
// 生產環境: Google Maps 基礎載入 (低成本)
const MAP_PROVIDER = process.env.NODE_ENV === 'production' ? 'google' : 'osm';
```

## 📊 資料庫設計 (簡化版)

### 核心資料表
```sql
-- 商店資料表 (預載入)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    brand VARCHAR(100) NOT NULL,        -- 'starbucks', 'anytime_fitness'
    category VARCHAR(50) NOT NULL,      -- 'cafe', 'gym', 'convenience'
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    business_hours JSONB,
    rating DECIMAL(3,2),               -- 用戶評分或預估評分
    data_source VARCHAR(20) NOT NULL,  -- 'osm', 'scrape', 'manual'
    verified BOOLEAN DEFAULT FALSE,    -- 是否已驗證
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 地理索引
CREATE INDEX idx_stores_location ON stores(lat, lng);
CREATE INDEX idx_stores_brand ON stores(brand);
CREATE INDEX idx_stores_category ON stores(category);

-- 搜尋索引
CREATE INDEX idx_stores_search ON stores USING GIN(to_tsvector('japanese', name || ' ' || address));
```

### 預載入資料範例
```sql
-- Starbucks 資料 (從官網爬取)
INSERT INTO stores (name, brand, category, lat, lng, address, data_source) VALUES
('スターバックス 渋谷スカイビル店', 'starbucks', 'cafe', 35.6581, 139.7016, '東京都渋谷区渋谷2-24-12', 'scrape'),
('スターバックス 新宿南口店', 'starbucks', 'cafe', 35.6896, 139.7006, '東京都新宿区新宿3-38-1', 'scrape');

-- 健身房資料
INSERT INTO stores (name, brand, category, lat, lng, address, data_source) VALUES
('Anytime Fitness 渋谷店', 'anytime_fitness', 'gym', 35.6617, 139.7040, '東京都渋谷区渋谷2-22-10', 'scrape'),
('ゴールドジム 東京ベイ有明店', 'gold_gym', 'gym', 35.6367, 139.7947, '東京都江東区有明1-5-22', 'scrape');

-- 便利商店資料
INSERT INTO stores (name, brand, category, lat, lng, address, data_source) VALUES
('セブン-イレブン 渋谷センター街店', 'seven_eleven', 'convenience', 35.6598, 139.6987, '東京都渋谷区宇田川町25-4', 'scrape'),
('ファミリーマート 新宿三丁目店', 'family_mart', 'convenience', 35.6919, 139.7065, '東京都新宿区新宿3-5-6', 'scrape');
```

## ⚡ 高效查詢 API

### 核心搜尋端點
```python
from fastapi import FastAPI, Query
from typing import List
import asyncpg

app = FastAPI()

@app.get("/api/search")
async def search_stores(
    brands: List[str] = Query(...),  # ['starbucks', 'gym']
    lat: float = Query(...),
    lng: float = Query(...),
    radius: int = Query(1000, ge=100, le=5000)  # 100m-5km
):
    # 使用地理距離查詢 (無需外部 API)
    query = """
    SELECT name, brand, lat, lng, address,
           (6371000 * acos(cos(radians($1)) * cos(radians(lat)) * 
            cos(radians(lng) - radians($2)) + sin(radians($1)) * 
            sin(radians(lat)))) AS distance
    FROM stores 
    WHERE brand = ANY($3)
    AND (6371000 * acos(cos(radians($1)) * cos(radians(lat)) * 
         cos(radians(lng) - radians($2)) + sin(radians($1)) * 
         sin(radians(lat)))) <= $4
    ORDER BY distance
    LIMIT 50
    """
    
    results = await db.fetch(query, lat, lng, brands, radius)
    
    # 按品牌分組回傳
    grouped_results = {}
    for row in results:
        brand = row['brand']
        if brand not in grouped_results:
            grouped_results[brand] = []
        grouped_results[brand].append(dict(row))
    
    return {
        "results": grouped_results,
        "metadata": {
            "total_stores": len(results),
            "search_radius": radius,
            "api_cost": 0.0  # 零成本！
        }
    }
```

## 🤖 自動化資料收集

### 爬蟲系統
```python
import aiohttp
import asyncio
from bs4 import BeautifulSoup

class StoreDataCollector:
    async def collect_starbucks_stores(self):
        """爬取 Starbucks 官網店鋪資料"""
        url = "https://store-locator.starbucks.co.jp/search"
        # 合法爬取公開資訊
        
    async def collect_gym_chains(self):
        """收集主要健身房連鎖店資料"""
        gym_chains = {
            "anytime_fitness": "https://www.anytimefitness.co.jp/shop_list/",
            "gold_gym": "https://www.goldsgym.jp/shop/",
            "central_sports": "https://www.central.co.jp/club/search/"
        }
        
    async def collect_convenience_stores(self):
        """收集便利商店資料"""
        # 從各大便利商店官網收集
        
# 每日自動更新
@scheduler.task('cron', hour=3)  # 每日凌晨 3 點
async def daily_data_update():
    collector = StoreDataCollector()
    await collector.run_full_collection()
```

### OpenStreetMap 查詢
```python
import overpy

class OSMDataCollector:
    def __init__(self):
        self.api = overpy.Overpass()
    
    async def query_starbucks_tokyo(self):
        result = self.api.query("""
        [out:json][timeout:25];
        (
          node["amenity"="cafe"]["brand"="Starbucks"](35.5,139.5,35.9,140.0);
          way["amenity"="cafe"]["brand"="Starbucks"](35.5,139.5,35.9,140.0);
        );
        out center;
        """)
        return result
    
    async def query_gyms_tokyo(self):
        result = self.api.query("""
        [out:json][timeout:25];
        (
          node["leisure"="fitness_centre"](35.5,139.5,35.9,140.0);
          way["leisure"="fitness_centre"](35.5,139.5,35.9,140.0);
        );
        out center;
        """)
        return result
```

## 💰 成本分析

### 完全零成本方案
```
月度成本：
- 伺服器: $0 (免費層)
- 資料庫: $0 (免費 500MB)
- Redis: $0 (免費 10MB)
- API 調用: $0 (全部免費)
- 總計: $0 / 月
```

### 低成本擴展方案 (流量大時)
```
月度成本：
- Vercel Pro: $20 (更多流量)
- Supabase Pro: $25 (更大資料庫)
- Upstash Pro: $10 (更多 Redis)
- 總計: $55 / 月 (約 ¥8,000)
```

## 🚀 實施計劃

### Phase 1: 資料收集 (1週)
- [ ] 設定 OpenStreetMap API
- [ ] 建立爬蟲系統
- [ ] 收集東京主要商店資料
- [ ] 建立資料庫和基礎表結構

### Phase 2: API 開發 (1週)  
- [ ] FastAPI 基礎架構
- [ ] 地理位置搜尋 API
- [ ] 資料驗證和清理
- [ ] 基礎緩存機制

### Phase 3: 整合測試 (3天)
- [ ] 前端串接
- [ ] 效能測試
- [ ] 資料品質驗證
- [ ] 部署到免費平台

## 📝 資料品質保證

### 多源驗證
```python
# 交叉驗證資料準確性
async def verify_store_data(store):
    sources = [
        await check_osm_data(store),
        await check_official_website(store),
        await check_user_reports(store)
    ]
    
    # 多數決原則
    verified = sum(1 for s in sources if s.verified) >= 2
    return verified
```

### 用戶貢獻機制
```python
# 讓用戶幫忙維護資料
@app.post("/api/report-store")
async def report_store_issue(
    store_id: str,
    issue_type: str,  # 'closed', 'moved', 'wrong_info'
    user_comment: str
):
    # 累積用戶回報，自動更新資料
    pass
```

## 🎯 預期效果

### 資料覆蓋率
- **Starbucks**: 95%+ (官網資料完整)
- **健身房**: 90%+ (主要連鎖店)
- **便利商店**: 85%+ (密度太高，取樣主要區域)

### 查詢效能
- **回應時間**: < 100ms
- **並發處理**: 100+ 用戶
- **資料新鮮度**: 每日更新

### 成本效益
- **開發成本**: 零
- **運營成本**: 零 (免費層) 或 極低 ($55/月)
- **API 費用**: 零
- **維護成本**: 極低 (自動化)

---

**這個方案能讓你完全不依賴 Google Places API，實現真正的零成本運營！**