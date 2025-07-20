# クラス図とコンポーネント相関図

## クラス図

### コアクラス

```mermaid
classDiagram
    class MCPServer {
        -server: Server
        -scanner: ComponentScanner
        -analyzer: ComponentAnalyzer
        -cache: CacheManager
        -config: ConfigManager
        -performanceMonitor: PerformanceMonitor
        -errorReporter: ErrorReporter
        +start(): void
        +stop(): void
        +handleToolCall(name: string, args: any): Promise<any>
    }

    class ConfigManager {
        -config: ComponentMCPConfig
        -configPath: string
        +loadConfig(): ComponentMCPConfig
        +validateConfig(config: any): void
        +getDefaultConfig(): ComponentMCPConfig
        +watchConfig(): void
    }

    class ComponentScanner {
        -config: ComponentMCPConfig
        +scanForComponents(): Promise<string[]>
        -shouldExclude(filePath: string): boolean
        -isComponentFile(filePath: string): boolean
    }

    class ComponentAnalyzer {
        -astAnalyzer: ASTAnalyzer
        -reactNativeAnalyzer: ReactNativeAnalyzer
        -tailwindAnalyzer: TailwindAnalyzer
        +analyzeComponent(filePath: string): Promise<ComponentMetadata>
        +analyzeMultiple(filePaths: string[]): Promise<ComponentMetadata[]>
    }

    MCPServer --> ConfigManager
    MCPServer --> ComponentScanner
    MCPServer --> ComponentAnalyzer
    MCPServer --> CacheManager
    MCPServer --> PerformanceMonitor
    MCPServer --> ErrorReporter
```

### アナライザークラス

```mermaid
classDiagram
    class ASTAnalyzer {
        +parse(content: string): ParseResult
        +extractComponentInfo(ast: File): ComponentInfo
        -findComponentDeclaration(ast: File): NodePath
        -extractProps(componentPath: NodePath): PropInfo[]
        -extractJSXElements(componentPath: NodePath): string[]
    }

    class ReactNativeAnalyzer {
        +analyzeStyles(ast: File): StyleInfo
        +extractStyleSheets(ast: File): StyleSheet[]
        +isScreenComponent(metadata: ComponentMetadata): boolean
        -parseStyleSheet(node: Node): StyleSheet
    }

    class TailwindAnalyzer {
        +extractTailwindClasses(ast: File): string[]
        +analyzeClassNames(ast: File): ClassNameInfo[]
        +extractDesignTokens(classes: string[]): DesignToken[]
        -parseClassName(node: Node): string[]
    }

    ComponentAnalyzer --> ASTAnalyzer
    ComponentAnalyzer --> ReactNativeAnalyzer
    ComponentAnalyzer --> TailwindAnalyzer
```

### キャッシュとモニタリング

```mermaid
classDiagram
    class CacheManager {
        -cache: Map<string, CacheEntry>
        -fileWatcher: FileWatcher
        -config: CacheConfig
        +get(key: string): ComponentMetadata
        +set(key: string, value: ComponentMetadata): void
        +invalidate(key: string): void
        +clear(): void
        +getStats(): CacheStats
    }

    class FileWatcher {
        -watcher: FSWatcher
        -callbacks: Map<string, Function>
        +watch(paths: string[]): void
        +unwatch(path: string): void
        +on(event: string, callback: Function): void
        -handleChange(path: string): void
    }

    class PerformanceMonitor {
        -metrics: Map<string, Metric>
        -startTimes: Map<string, number>
        +startTimer(operation: string): void
        +endTimer(operation: string): void
        +recordMetric(name: string, value: number): void
        +getMetrics(): PerformanceMetrics
    }

    class ErrorReporter {
        -errors: ErrorEntry[]
        -maxErrors: number
        +reportError(error: Error, severity: ErrorSeverity): void
        +getErrors(severity?: ErrorSeverity): ErrorEntry[]
        +clearErrors(): void
        +getSummary(): ErrorSummary
    }

    CacheManager --> FileWatcher
```

### ユーティリティクラス

```mermaid
classDiagram
    class SimilarityAnalyzer {
        +findSimilarComponents(target: ComponentMetadata, all: ComponentMetadata[]): SimilarComponent[]
        -generateFeatureVector(component: ComponentMetadata): number[]
        -calculateCosineSimilarity(vec1: number[], vec2: number[]): number
        -normalizeVector(vector: number[]): number[]
    }

    class DesignSystemUtils {
        +extractDesignTokens(components: ComponentMetadata[]): DesignSystem
        +findCommonPatterns(components: ComponentMetadata[]): Pattern[]
        +categorizeComponents(components: ComponentMetadata[]): Map<string, ComponentMetadata[]>
        -analyzeColorTokens(styles: StyleInfo[]): ColorToken[]
        -analyzeSpacingTokens(styles: StyleInfo[]): SpacingToken[]
    }
```

## コンポーネント相関図

### データフローと依存関係

```mermaid
graph TB
    subgraph "Entry Point"
        A[index.ts]
    end

    subgraph "Core Layer"
        B[MCPServer]
        C[ConfigManager]
    end

    subgraph "Scanning Layer"
        D[ComponentScanner]
    end

    subgraph "Analysis Layer"
        E[ComponentAnalyzer]
        F[ASTAnalyzer]
        G[ReactNativeAnalyzer]
        H[TailwindAnalyzer]
    end

    subgraph "Cache Layer"
        I[CacheManager]
        J[FileWatcher]
    end

    subgraph "Utility Layer"
        K[SimilarityAnalyzer]
        L[DesignSystemUtils]
        M[PerformanceMonitor]
        N[ErrorReporter]
    end

    subgraph "Type Definitions"
        O[types/index.ts]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    B --> I
    B --> M
    B --> N

    D --> O
    E --> F
    E --> G
    E --> H
    E --> O

    I --> J
    I --> O

    K --> O
    L --> O
    M --> O
    N --> O

    style A fill:#f96
    style B fill:#69f
    style O fill:#9f9
```

### MCPツールとモジュールの対応

```mermaid
graph LR
    subgraph "MCP Tools"
        T1[list_components]
        T2[get_component_details]
        T3[find_similar_components]
        T4[get_design_system]
        T5[get_available_categories]
        T6[get_screen_patterns]
        T7[get_performance_metrics]
        T8[get_error_report]
    end

    subgraph "Modules"
        M1[CacheManager]
        M2[ComponentAnalyzer]
        M3[SimilarityAnalyzer]
        M4[DesignSystemUtils]
        M5[PerformanceMonitor]
        M6[ErrorReporter]
    end

    T1 --> M1
    T2 --> M1
    T2 --> M2
    T3 --> M3
    T4 --> M4
    T5 --> M4
    T6 --> M1
    T7 --> M5
    T8 --> M6
```

## ライフサイクル

### 初期化フロー

```mermaid
sequenceDiagram
    participant Main as index.ts
    participant Server as MCPServer
    participant Config as ConfigManager
    participant Scanner as ComponentScanner
    participant Analyzer as ComponentAnalyzer
    participant Cache as CacheManager

    Main->>Server: new MCPServer()
    Server->>Config: new ConfigManager()
    Config->>Config: loadConfig()
    Server->>Scanner: new ComponentScanner(config)
    Server->>Analyzer: new ComponentAnalyzer()
    Server->>Cache: new CacheManager(config)
    Server->>Server: registerTools()
    Main->>Server: start()
    Server->>Scanner: scanForComponents()
    Scanner-->>Server: componentPaths[]
    Server->>Analyzer: analyzeMultiple(paths)
    Analyzer-->>Server: metadata[]
    Server->>Cache: populate(metadata)
```

### リクエスト処理フロー

```mermaid
sequenceDiagram
    participant Client
    participant Server as MCPServer
    participant Cache as CacheManager
    participant Analyzer as ComponentAnalyzer
    participant Utils as Utilities

    Client->>Server: toolCall(name, args)
    Server->>Server: validateArgs(args)
    
    alt Cache Hit
        Server->>Cache: get(key)
        Cache-->>Server: cachedData
        Server-->>Client: response(cachedData)
    else Cache Miss
        Server->>Analyzer: analyze(args)
        Analyzer->>Utils: process(data)
        Utils-->>Analyzer: processedData
        Analyzer-->>Server: result
        Server->>Cache: set(key, result)
        Server-->>Client: response(result)
    end
```

## エラーハンドリングフロー

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type?}
    B -->|Parse Error| C[ASTAnalyzer]
    B -->|File Error| D[Scanner/FileWatcher]
    B -->|Analysis Error| E[ComponentAnalyzer]
    B -->|System Error| F[MCPServer]
    
    C --> G[ErrorReporter]
    D --> G
    E --> G
    F --> G
    
    G --> H{Severity?}
    H -->|Critical| I[Log & Throw]
    H -->|High| J[Log & Continue]
    H -->|Medium/Low| K[Log Only]
    
    I --> L[Client Error Response]
    J --> M[Partial Result]
    K --> N[Normal Response]
```