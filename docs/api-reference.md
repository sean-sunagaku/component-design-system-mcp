# API リファレンス

## MCP Tools

Component MCP Serverは以下の8つのツールを提供します。

### 1. list_components

コンポーネントの一覧を取得します。

**パラメータ:**
```typescript
{
  category?: string;      // カテゴリでフィルタリング
  framework?: string;     // フレームワークでフィルタリング ("react-native" | "tailwind")
  limit?: number;         // 返却する最大数 (デフォルト: 50)
}
```

**レスポンス:**
```typescript
{
  components: Array<{
    name: string;
    path: string;
    category: string;
    framework: string;
    description?: string;
    lastModified: string;
  }>;
  total: number;
}
```

**使用例:**
```json
{
  "tool": "list_components",
  "arguments": {
    "category": "buttons",
    "framework": "react-native",
    "limit": 10
  }
}
```

### 2. get_component_details

特定のコンポーネントの詳細情報を取得します。

**パラメータ:**
```typescript
{
  path: string;  // コンポーネントファイルのパス
}
```

**レスポンス:**
```typescript
{
  name: string;
  path: string;
  framework: string;
  category: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    description?: string;
  }>;
  styles: {
    inline?: any;
    styleSheet?: Record<string, any>;
    tailwindClasses?: string[];
  };
  dependencies: string[];
  usedComponents: string[];
  exportType: string;
  lastModified: string;
}
```

### 3. find_similar_components

類似したコンポーネントを検索します。

**パラメータ:**
```typescript
{
  targetPath: string;     // 比較対象のコンポーネントパス
  threshold?: number;     // 類似度の閾値 (0-1, デフォルト: 0.7)
  limit?: number;         // 返却する最大数 (デフォルト: 10)
}
```

**レスポンス:**
```typescript
{
  target: {
    name: string;
    path: string;
  };
  similar: Array<{
    name: string;
    path: string;
    similarity: number;
    matchedFeatures: string[];
  }>;
}
```

### 4. get_design_system

デザインシステムの情報を抽出します。

**パラメータ:**
```typescript
{
  framework?: string;  // 特定のフレームワークに限定
}
```

**レスポンス:**
```typescript
{
  colors: Array<{
    token: string;
    value: string;
    usage: number;
  }>;
  spacing: Array<{
    token: string;
    value: string | number;
    usage: number;
  }>;
  typography: Array<{
    token: string;
    properties: Record<string, any>;
    usage: number;
  }>;
  commonPatterns: Array<{
    pattern: string;
    description: string;
    examples: string[];
    frequency: number;
  }>;
}
```

### 5. get_available_categories

利用可能なカテゴリ一覧を取得します。

**パラメータ:**
```typescript
{
  includeCount?: boolean;  // 各カテゴリのコンポーネント数を含める
}
```

**レスポンス:**
```typescript
{
  categories: Array<{
    name: string;
    count?: number;
    description?: string;
  }>;
}
```

### 6. get_screen_patterns

スクリーンパターンを取得します（React Native専用）。

**パラメータ:**
```typescript
{
  limit?: number;  // 返却する最大数
}
```

**レスポンス:**
```typescript
{
  screens: Array<{
    name: string;
    path: string;
    navigation?: {
      type: string;
      routes?: string[];
    };
    layout: {
      hasHeader: boolean;
      hasTabBar: boolean;
      hasDrawer: boolean;
    };
    components: string[];
  }>;
}
```

### 7. get_performance_metrics

パフォーマンスメトリクスを取得します。

**パラメータ:** なし

**レスポンス:**
```typescript
{
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
  };
  operations: {
    scans: {
      total: number;
      averageTime: number;
      lastScan: string;
    };
    analyses: {
      total: number;
      averageTime: number;
      failureRate: number;
    };
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  uptime: number;
}
```

### 8. get_error_report

エラーレポートを取得します。

**パラメータ:**
```typescript
{
  severity?: "low" | "medium" | "high" | "critical";  // 重要度でフィルタリング
  limit?: number;  // 返却する最大数
}
```

**レスポンス:**
```typescript
{
  errors: Array<{
    timestamp: string;
    severity: string;
    message: string;
    stack?: string;
    context?: any;
  }>;
  summary: {
    total: number;
    bySeverity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
}
```

## クラスAPI

### MCPServer

```typescript
class MCPServer {
  constructor(configPath?: string);
  
  start(): Promise<void>;
  stop(): Promise<void>;
  
  // イベントハンドラ
  on(event: "ready", handler: () => void): void;
  on(event: "error", handler: (error: Error) => void): void;
  on(event: "tool-call", handler: (name: string, args: any) => void): void;
}
```

### ConfigManager

```typescript
class ConfigManager {
  constructor(configPath?: string);
  
  loadConfig(): ComponentMCPConfig;
  validateConfig(config: unknown): void;
  getDefaultConfig(): ComponentMCPConfig;
  watchConfig(callback: (config: ComponentMCPConfig) => void): void;
}
```

### ComponentScanner

```typescript
class ComponentScanner {
  constructor(config: ComponentMCPConfig);
  
  scanForComponents(): Promise<string[]>;
  scanDirectory(dir: string): Promise<string[]>;
  isComponentFile(filePath: string): boolean;
}
```

### ComponentAnalyzer

```typescript
class ComponentAnalyzer {
  constructor();
  
  analyzeComponent(filePath: string): Promise<ComponentMetadata>;
  analyzeMultiple(filePaths: string[]): Promise<ComponentMetadata[]>;
  
  // フレームワーク固有の分析
  analyzeReactNative(filePath: string): Promise<ReactNativeMetadata>;
  analyzeTailwind(filePath: string): Promise<TailwindMetadata>;
}
```

### CacheManager

```typescript
class CacheManager {
  constructor(config: CacheConfig);
  
  get(key: string): ComponentMetadata | undefined;
  set(key: string, value: ComponentMetadata): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  
  getStats(): CacheStats;
  startWatching(paths: string[]): void;
  stopWatching(): void;
}
```

### SimilarityAnalyzer

```typescript
class SimilarityAnalyzer {
  findSimilarComponents(
    target: ComponentMetadata,
    components: ComponentMetadata[],
    options?: {
      threshold?: number;
      limit?: number;
      weights?: FeatureWeights;
    }
  ): SimilarComponent[];
  
  calculateSimilarity(
    component1: ComponentMetadata,
    component2: ComponentMetadata
  ): number;
}
```

### DesignSystemUtils

```typescript
class DesignSystemUtils {
  extractDesignTokens(
    components: ComponentMetadata[]
  ): DesignSystem;
  
  findCommonPatterns(
    components: ComponentMetadata[]
  ): Pattern[];
  
  categorizeComponents(
    components: ComponentMetadata[]
  ): Map<string, ComponentMetadata[]>;
  
  analyzeComponentUsage(
    components: ComponentMetadata[]
  ): UsageStats;
}
```

### ErrorReporter

```typescript
class ErrorReporter {
  constructor(options?: { maxErrors?: number });
  
  reportError(
    error: Error,
    severity: ErrorSeverity,
    context?: any
  ): void;
  
  getErrors(severity?: ErrorSeverity): ErrorEntry[];
  clearErrors(): void;
  getSummary(): ErrorSummary;
  
  // エラーハンドラのラッパー
  wrap<T>(
    fn: () => T,
    context: string,
    severity?: ErrorSeverity
  ): T | undefined;
}
```

### PerformanceMonitor

```typescript
class PerformanceMonitor {
  startTimer(operation: string): void;
  endTimer(operation: string): number;
  
  recordMetric(name: string, value: number): void;
  getMetrics(): PerformanceMetrics;
  
  // 便利なメソッド
  measureAsync<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T>;
  
  measure<T>(
    operation: string,
    fn: () => T
  ): T;
}
```

## 型定義

### ComponentMetadata

```typescript
interface ComponentMetadata {
  name: string;
  path: string;
  framework: "react-native" | "tailwind" | "unknown";
  category: string;
  exportType: "default" | "named" | "both";
  props: PropInfo[];
  styles: StyleInfo;
  dependencies: string[];
  usedComponents: string[];
  jsxElements: string[];
  lastModified: Date;
}
```

### PropInfo

```typescript
interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}
```

### StyleInfo

```typescript
interface StyleInfo {
  inline?: Record<string, any>;
  styleSheet?: Record<string, any>;
  tailwindClasses?: string[];
}
```

### ComponentMCPConfig

```typescript
interface ComponentMCPConfig {
  scanPaths: string[];
  exclude?: string[];
  frameworks?: {
    reactNative?: boolean;
    tailwind?: boolean;
  };
  cache?: {
    enabled?: boolean;
    ttl?: number;
    maxSize?: number;
  };
  watch?: {
    enabled?: boolean;
    debounce?: number;
  };
}
```