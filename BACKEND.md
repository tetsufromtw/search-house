# 🏠 Search House 後端架構設計

## 📋 系統概述

基於 **智慧需求緩存** 的後端系統，大幅降低 Google Places API 費用並提升查詢效能。

### 🎯 核心理念
- **需求級緩存**: 以單一需求（如 "starbucks"）為最小緩存單位
- **增量查詢**: 只查詢未緩存的需求，已有的直接從緩存讀取
- **地理區域分片**: 根據地理區域分割資料，提升查詢效率
- **多層緩存**: Redis + PostgreSQL 組合，兼顧速度與持久性

## 🏗️ 技術架構

### 技術棧選擇
```
┌─────────────────┐
│   Frontend      │ Next.js 15 + TypeScript
└─────────────────┘
         │
┌─────────────────┐
│   Backend       │ Python 3.11 + FastAPI + Uvicorn
└─────────────────┘
         │
┌─────────────────┐
│   Database      │ PostgreSQL 15 + PostGIS
└─────────────────┘
         │
┌─────────────────┐
│   Cache         │ Redis 7.0 + Redis JSON
└─────────────────┘
         │
┌─────────────────┐
│   External      │ Google Places API (僅需要時)
└─────────────────┘
```

### 為什麼選擇這個技術棧？

#### FastAPI
- **高效能**: 比 Flask/Django 快 2-3 倍
- **自動 API 文檔**: Swagger/OpenAPI 自動生成
- **類型安全**: Pydantic 模型驗證
- **異步支援**: 原生支援 async/await

#### PostgreSQL + PostGIS
- **地理功能**: PostGIS 提供強大的地理位置查詢
- **ACID 特性**: 確保資料一致性
- **複雜查詢**: 支援複雜的關聯查詢和聚合
- **索引優化**: 地理空間索引 (GiST/GIN)

#### Redis
- **超高速**: 記憶體存儲，微秒級查詢
- **Redis JSON**: 原生 JSON 文檔支援
- **地理命令**: GEORADIUS 等地理位置命令
- **過期策略**: 自動清理過期資料

## 📊 資料庫設計

### 核心資料表

#### 1. Requirements (需求定義表)
```sql
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,        -- 'starbucks', 'gym', 'convenience_store'
    display_name VARCHAR(200) NOT NULL,       -- '星巴克', '健身房', '便利商店'
    category VARCHAR(50) NOT NULL,            -- 'cafe', 'gym', 'store'
    search_keywords TEXT[],                   -- 搜尋關鍵字陣列
    google_place_types TEXT[],               -- Google Places API 對應類型
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE UNIQUE INDEX idx_requirements_name ON requirements(name);
CREATE INDEX idx_requirements_category ON requirements(category);
```

#### 2. Geographic_Regions (地理區域表)
```sql
CREATE TABLE geographic_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,              -- 'tokyo_shibuya', 'tokyo_shinjuku'
    display_name VARCHAR(200) NOT NULL,      -- '東京都渋谷区', '東京都新宿区'
    country_code CHAR(2) NOT NULL,           -- 'JP'
    region_type VARCHAR(20) NOT NULL,        -- 'ward', 'city', 'prefecture'
    bounds GEOMETRY(POLYGON, 4326) NOT NULL, -- 地理邊界
    center GEOMETRY(POINT, 4326) NOT NULL,   -- 中心點
    zoom_level INTEGER DEFAULT 13,           -- 適合的地圖縮放等級
    created_at TIMESTAMP DEFAULT NOW()
);

-- 地理空間索引
CREATE INDEX idx_geographic_regions_bounds ON geographic_regions USING GIST(bounds);
CREATE INDEX idx_geographic_regions_center ON geographic_regions USING GIST(center);
CREATE INDEX idx_geographic_regions_country ON geographic_regions(country_code);
```

#### 3. Places (地點資料表)
```sql
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_place_id VARCHAR(200) UNIQUE,     -- Google Places ID (可能為空，模擬資料)
    name VARCHAR(300) NOT NULL,
    address TEXT,
    location GEOMETRY(POINT, 4326) NOT NULL, -- 經緯度
    rating DECIMAL(2,1),                     -- 評分 0.0-5.0
    price_level INTEGER,                     -- 價格等級 0-4
    phone VARCHAR(50),
    website TEXT,
    business_status VARCHAR(20),             -- 'OPERATIONAL', 'CLOSED_TEMPORARILY'
    place_types TEXT[],                      -- 地點類型陣列
    region_id UUID REFERENCES geographic_regions(id),
    data_source VARCHAR(20) NOT NULL,       -- 'google_api', 'mock', 'manual'
    raw_data JSONB,                         -- 原始 API 回應資料
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE UNIQUE INDEX idx_places_google_id ON places(google_place_id) WHERE google_place_id IS NOT NULL;
CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_places_region ON places(region_id);
CREATE INDEX idx_places_types ON places USING GIN(place_types);
CREATE INDEX idx_places_name_search ON places USING GIN(to_tsvector('english', name));
```

#### 4. Requirement_Places (需求-地點關聯表)
```sql
CREATE TABLE requirement_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    region_id UUID REFERENCES geographic_regions(id),
    relevance_score DECIMAL(3,2),           -- 相關度分數 0.00-1.00
    distance_to_center INTEGER,             -- 距離區域中心的距離(米)
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- 複合主鍵防止重複
    UNIQUE(requirement_id, place_id, region_id)
);

-- 索引
CREATE INDEX idx_req_places_requirement ON requirement_places(requirement_id);
CREATE INDEX idx_req_places_place ON requirement_places(place_id);
CREATE INDEX idx_req_places_region ON requirement_places(region_id);
CREATE INDEX idx_req_places_score ON requirement_places(relevance_score DESC);
```

#### 5. Cache_Status (緩存狀態表)
```sql
CREATE TABLE cache_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    region_id UUID REFERENCES geographic_regions(id) ON DELETE CASCADE,
    last_fetched_at TIMESTAMP NOT NULL,     -- 最後獲取時間
    expires_at TIMESTAMP NOT NULL,          -- 過期時間
    total_places INTEGER DEFAULT 0,         -- 該區域的地點總數
    api_calls_used INTEGER DEFAULT 0,       -- 使用的 API 調用次數
    data_quality VARCHAR(20) DEFAULT 'good', -- 'excellent', 'good', 'fair', 'poor'
    error_count INTEGER DEFAULT 0,          -- 錯誤次數
    last_error TEXT,                        -- 最後一次錯誤信息
    
    -- 複合唯一索引
    UNIQUE(requirement_id, region_id)
);

-- 索引
CREATE INDEX idx_cache_expires ON cache_status(expires_at);
CREATE INDEX idx_cache_requirement_region ON cache_status(requirement_id, region_id);
```

#### 6. Search_Sessions (搜尋會話表)
```sql
CREATE TABLE search_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token VARCHAR(100) NOT NULL,    -- 前端會話標識
    user_ip INET,                           -- 用戶IP
    requirements TEXT[] NOT NULL,           -- 搜尋的需求組合
    search_bounds GEOMETRY(POLYGON, 4326),  -- 搜尋區域
    center_point GEOMETRY(POINT, 4326),     -- 搜尋中心點
    radius_meters INTEGER,                  -- 搜尋半徑
    total_results INTEGER DEFAULT 0,        -- 總結果數
    cache_hit_rate DECIMAL(5,2),           -- 緩存命中率
    api_calls_made INTEGER DEFAULT 0,       -- 本次搜尋的 API 調用數
    response_time_ms INTEGER,               -- 回應時間(毫秒)
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_search_sessions_token ON search_sessions(session_token);
CREATE INDEX idx_search_sessions_bounds ON search_sessions USING GIST(search_bounds);
CREATE INDEX idx_search_sessions_created ON search_sessions(created_at DESC);
```

## 🔧 API 設計

### 核心 API 端點

#### 1. 智慧需求搜尋 (主要端點)
```python
POST /api/v1/search/requirements
```

**請求範例:**
```json
{
  "requirements": ["starbucks", "gym", "convenience_store"],
  "location": {
    "lat": 35.6762,
    "lng": 139.6503
  },
  "radius": 1000,
  "session_token": "session_abc123",
  "force_refresh": false
}
```

**回應範例:**
```json
{
  "results": {
    "starbucks": {
      "places": [...],
      "cache_status": "hit",
      "last_updated": "2025-07-03T10:30:00Z"
    },
    "gym": {
      "places": [...], 
      "cache_status": "miss",
      "last_updated": "2025-07-03T10:32:15Z"
    },
    "convenience_store": {
      "places": [...],
      "cache_status": "hit", 
      "last_updated": "2025-07-02T15:20:00Z"
    }
  },
  "metadata": {
    "total_api_calls": 1,
    "cache_hit_rate": 0.67,
    "response_time_ms": 245,
    "region": "tokyo_shibuya"
  }
}
```

#### 2. 緩存管理 API
```python
# 檢查緩存狀態
GET /api/v1/cache/status/{requirement_name}?region_id={region_id}

# 刷新特定緩存
POST /api/v1/cache/refresh
{
  "requirement": "starbucks",
  "region_id": "tokyo_shibuya", 
  "force": true
}

# 批量預熱緩存
POST /api/v1/cache/preload
{
  "requirements": ["starbucks", "gym"],
  "regions": ["tokyo_shibuya", "tokyo_shinjuku"]
}
```

#### 3. 地理區域 API
```python
# 獲取支援的區域
GET /api/v1/regions?country=JP

# 根據座標查找區域
GET /api/v1/regions/find?lat=35.6762&lng=139.6503

# 區域詳細資訊
GET /api/v1/regions/{region_id}
```

#### 4. 分析和監控 API
```python
# API 使用統計
GET /api/v1/analytics/api-usage?date_from=2025-07-01&date_to=2025-07-03

# 熱門搜尋分析
GET /api/v1/analytics/popular-searches

# 系統健康檢查
GET /api/v1/health
```

## ⚡ Redis 緩存策略

### 緩存鍵設計
```
# 格式: requirement:{name}:region:{region_id}:places
starbucks:region:tokyo_shibuya:places

# 地理位置緩存
geo:region:tokyo_shibuya:starbucks  # GEORADIUS 查詢

# 搜尋會話緩存
session:{session_token}:results
```

### 緩存層級設計
```python
# Level 1: 熱點資料 (TTL: 1小時)
- 熱門需求 × 熱門區域組合
- 使用者當前搜尋結果

# Level 2: 常規資料 (TTL: 6小時) 
- 一般需求 × 區域組合
- 地理查詢結果

# Level 3: 冷資料 (TTL: 24小時)
- 冷門需求組合
- 統計分析結果
```

### Redis 資料結構
```python
# JSON 文檔存儲地點資料
redis.json().set(
    "starbucks:region:tokyo_shibuya:places",
    "$",
    {
        "places": [...],
        "last_updated": "2025-07-03T10:30:00Z",
        "expires_at": "2025-07-03T16:30:00Z",
        "total_count": 25
    }
)

# 地理位置索引
redis.geoadd(
    "geo:region:tokyo_shibuya:starbucks",
    139.7016, 35.6581, "place_id_1",
    139.7036, 35.6938, "place_id_2"
)
```

## 🚀 核心業務邏輯

### 智慧搜尋流程
```python
async def smart_search_requirements(
    requirements: List[str],
    location: LatLng,
    radius: int,
    session_token: str
) -> SearchResult:
    
    # 1. 確定地理區域
    region = await geo_service.find_region(location)
    
    # 2. 檢查緩存狀態
    cache_status = await check_cache_status(requirements, region.id)
    
    # 3. 分離已緩存和需要查詢的需求
    cached_requirements = []
    missing_requirements = []
    
    for req in requirements:
        if await is_cache_valid(req, region.id):
            cached_requirements.append(req)
        else:
            missing_requirements.append(req)
    
    # 4. 並行處理
    tasks = []
    
    # 從緩存讀取已有資料
    for req in cached_requirements:
        tasks.append(load_from_cache(req, region.id))
    
    # API 查詢缺失資料
    if missing_requirements:
        tasks.append(fetch_from_google_api(missing_requirements, region))
    
    results = await asyncio.gather(*tasks)
    
    # 5. 更新緩存
    for req in missing_requirements:
        await update_cache(req, region.id, results[req])
    
    # 6. 記錄搜尋會話
    await log_search_session(session_token, requirements, region, results)
    
    return combine_results(results)
```

### 緩存失效策略
```python
# 時間型失效
- 熱門區域: 6小時
- 一般區域: 24小時  
- 偏遠區域: 72小時

# 事件型失效
- Google API 回傳錯誤時延長TTL
- 新地點新增時刷新相關緩存
- 手動刷新時重置TTL

# 智慧失效
- 根據搜尋頻率動態調整TTL
- 根據資料品質調整刷新策略
```

## 📈 效能優化

### 資料庫優化
```sql
-- 分區表設計 (按地理區域)
CREATE TABLE places_tokyo PARTITION OF places
FOR VALUES IN ('tokyo_shibuya', 'tokyo_shinjuku', 'tokyo_ikebukuro');

-- 物化視圖預計算熱門查詢
CREATE MATERIALIZED VIEW popular_places_by_region AS
SELECT 
    r.name as requirement_name,
    gr.name as region_name,
    COUNT(rp.place_id) as place_count,
    AVG(p.rating) as avg_rating
FROM requirement_places rp
JOIN requirements r ON rp.requirement_id = r.id
JOIN places p ON rp.place_id = p.id  
JOIN geographic_regions gr ON rp.region_id = gr.id
GROUP BY r.name, gr.name;

-- 自動重新整理
CREATE OR REPLACE FUNCTION refresh_popular_places()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_places_by_region;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### API 效能優化
```python
# 連接池配置
DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/searchhouse"
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True
)

# Redis 連接池
redis_pool = redis.ConnectionPool(
    host='localhost',
    port=6379,
    db=0,
    max_connections=50
)

# 並發限制
@rate_limit("10/minute")
@cache(expire=300)
async def search_places_endpoint():
    pass
```

## 🔒 安全性設計

### API 安全
```python
# 1. 速率限制
@limiter.limit("100/hour")
async def search_endpoint():
    pass

# 2. 輸入驗證  
class SearchRequest(BaseModel):
    requirements: List[constr(min_length=1, max_length=50)]
    location: LatLng
    radius: int = Field(ge=100, le=50000)  # 100m - 50km

# 3. SQL 注入防護
# 使用 SQLAlchemy ORM 和參數化查詢

# 4. 資料隱私
# 不記錄用戶個人資訊，只記錄統計資料
```

### 資料保護
```python
# 敏感資料加密
API_KEY = encrypt(os.getenv("GOOGLE_API_KEY"))

# 地理位置模糊化 (隱私保護)
def fuzzy_location(lat: float, lng: float, precision: int = 3) -> Tuple[float, float]:
    """將座標模糊化到指定精度"""
    return round(lat, precision), round(lng, precision)
```

## 📊 監控和分析

### 關鍵指標
```python
# 業務指標
- 緩存命中率 (目標: > 80%)
- API 調用節省比例 (目標: > 70%) 
- 平均回應時間 (目標: < 500ms)
- 搜尋成功率 (目標: > 95%)

# 技術指標  
- 資料庫查詢時間
- Redis 記憶體使用率
- API 限制接近程度
- 錯誤率和重試率
```

### 告警機制
```python
# 緩存命中率低於 70%
# API 調用超過每日預算的 80%
# 系統回應時間超過 1秒  
# 錯誤率超過 5%
```

## 🚀 部署架構

### Docker Compose 配置
```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/searchhouse
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgis/postgis:15-3.3
    environment:
      - POSTGRES_DB=searchhouse
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 生產環境配置
```python
# 負載平衡
- API 服務: 3個實例 (Auto Scaling)
- 資料庫: Master-Slave 架構
- Redis: Cluster 模式 (3 master + 3 slave)

# 監控工具
- APM: New Relic / DataDog
- 日誌: ELK Stack
- 告警: PagerDuty / Slack
```

## 📝 開發指南

### 專案結構
```
backend/
├── app/
│   ├── api/v1/              # API 路由
│   ├── core/                # 核心配置
│   ├── db/                  # 資料庫相關
│   ├── models/              # SQLAlchemy 模型
│   ├── schemas/             # Pydantic 模型
│   ├── services/            # 業務邏輯
│   └── utils/               # 工具函數
├── migrations/              # Alembic 遷移
├── tests/                   # 測試檔案
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

### 環境設定
```bash
# 本地開發
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# 執行測試
pytest tests/ -v --cov=app

# 資料庫遷移
alembic revision --autogenerate -m "Add new table"
alembic upgrade head
```

## 🎯 實施時程

### Phase 1 (2週): 基礎架構
- [ ] FastAPI 專案設置
- [ ] PostgreSQL + PostGIS 配置
- [ ] Redis 設置和基本緩存功能
- [ ] 核心資料模型設計
- [ ] 基礎 API 端點

### Phase 2 (2週): 核心功能
- [ ] 智慧需求搜尋邏輯
- [ ] Google Places API 整合
- [ ] 緩存策略實施
- [ ] 地理區域管理

### Phase 3 (1週): 優化和監控
- [ ] 效能優化
- [ ] 監控和告警設置
- [ ] 安全性強化
- [ ] 文檔完善

### Phase 4 (1週): 測試和部署
- [ ] 單元測試和整合測試
- [ ] Docker 化
- [ ] CI/CD 管道
- [ ] 生產環境部署

---

**這個架構設計能夠大幅降低 Google API 費用，同時提供快速、可靠的搜尋服務。預估可節省 70-80% 的 API 費用！**