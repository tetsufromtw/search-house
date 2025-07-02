# Location Search Feature Architecture

## 📁 資料夾結構

```
src/features/location-search/
├── README.md                    # 架構說明文件
├── index.ts                     # 統一匯出入口
├── types/                       # 類型定義
│   ├── index.ts
│   ├── search.types.ts
│   ├── map.types.ts
│   ├── intersection.types.ts
│   └── ui.types.ts
├── services/                    # 服務層
│   ├── index.ts
│   ├── LocationSearchService.ts
│   ├── MapRenderingService.ts
│   ├── IntersectionService.ts
│   └── CacheService.ts
├── hooks/                       # 自訂 Hook
│   ├── index.ts
│   ├── useLocationSearch.ts
│   ├── useMapRenderer.ts
│   ├── useIntersectionLogic.ts
│   └── useSearchState.ts
├── components/                  # UI 元件
│   ├── index.ts
│   ├── LocationSearchMap/
│   ├── SearchControlPanel/
│   ├── RequirementToggle/
│   └── SearchStatistics/
├── utils/                       # 工具函數
│   ├── index.ts
│   ├── geometry.utils.ts
│   ├── map.utils.ts
│   ├── color.utils.ts
│   └── validation.utils.ts
├── config/                      # 配置檔案
│   ├── index.ts
│   ├── requirements.config.ts
│   ├── clustering.config.ts
│   └── defaults.config.ts
└── providers/                   # Context Provider
    ├── index.ts
    ├── LocationSearchProvider.tsx
    └── SearchStateProvider.tsx
```

## 🏗️ 分層架構

### 1. Presentation Layer (展示層)
- **Components**: 純 UI 元件，接收 props 並渲染
- **No business logic**: 不包含業務邏輯
- **Reusable**: 高度可重用

### 2. Application Layer (應用層)  
- **Hooks**: 管理元件狀態和副作用
- **Providers**: Context 提供全域狀態
- **Orchestration**: 協調不同服務的互動

### 3. Domain Layer (領域層)
- **Services**: 業務邏輯封裝
- **Types**: 領域模型定義
- **Rules**: 業務規則實作

### 4. Infrastructure Layer (基礎設施層)
- **Utils**: 純函數工具
- **Config**: 配置管理
- **External APIs**: 外部服務整合

## 📊 資料流向

```
User Interaction
      ↓
Components (Presentation)
      ↓
Hooks (Application)
      ↓  
Services (Domain)
      ↓
Utils/Config (Infrastructure)
```

## 🔧 核心原則

1. **單一職責**: 每個模組只負責一件事
2. **依賴反轉**: 高層模組不依賴低層模組
3. **開放封閉**: 對擴展開放，對修改封閉
4. **介面隔離**: 使用小而專精的介面
5. **依賴注入**: 透過參數注入依賴

## 🚀 使用方式

```typescript
// 簡單使用
import { LocationSearchMap } from '@/features/location-search';

// 高階使用  
import { 
  LocationSearchProvider,
  useLocationSearch,
  LocationSearchService
} from '@/features/location-search';
```

## 🔄 遷移計畫

1. **Phase 1**: 建立新架構基礎
2. **Phase 2**: 遷移核心邏輯  
3. **Phase 3**: 更新 UI 元件
4. **Phase 4**: 移除舊程式碼