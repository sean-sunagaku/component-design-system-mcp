# クラス図とコンポーネント相関図

## クラス図

### コアクラス

```mermaid
classDiagram
    class MCPServer {
        -server Server
        -scanner ComponentScanner
        -analyzer ComponentAnalyzer
        -cache CacheManager
        -config ConfigManager
        -performanceMonitor PerformanceMonitor
        -errorReporter ErrorReporter
        +start() void
        +stop() void
        +handleToolCall(name, args) Promise
    }

    class ConfigManager {
        -config ComponentMCPConfig
        -configPath string
        +loadConfig() ComponentMCPConfig
        +validateConfig(config) void
        +getDefaultConfig() ComponentMCPConfig
        +watchConfig() void
    }

    class ComponentScanner {
        -config ComponentMCPConfig
        +scanForComponents() Promise
        -shouldExclude(filePath) boolean
        -isComponentFile(filePath) boolean
    }

    class ComponentAnalyzer {
        -astAnalyzer ASTAnalyzer
        -reactNativeAnalyzer ReactNativeAnalyzer
        -tailwindAnalyzer TailwindAnalyzer
        +analyzeComponent(filePath) Promise
        +analyzeMultiple(filePaths) Promise
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
        +parse(content) ParseResult
        +extractComponentInfo(ast) ComponentInfo
        -findComponentDeclaration(ast) NodePath
        -extractProps(componentPath) PropInfo
        -extractJSXElements(componentPath) string
    }

    class ReactNativeAnalyzer {
        +analyzeStyles(ast) StyleInfo
        +extractStyleSheets(ast) StyleSheet
        +isScreenComponent(metadata) boolean
        -parseStyleSheet(node) StyleSheet
    }

    class TailwindAnalyzer {
        +extractTailwindClasses(ast) string
        +analyzeClassNames(ast) ClassNameInfo
        +extractDesignTokens(classes) DesignToken
        -parseClassName(node) string
    }

    ComponentAnalyzer --> ASTAnalyzer
    ComponentAnalyzer --> ReactNativeAnalyzer
    ComponentAnalyzer --> TailwindAnalyzer
```

### キャッシュとモニタリング

```mermaid
classDiagram
    class CacheManager {
        -cache Map
        -fileWatcher FileWatcher
        -config CacheConfig
        +get(key) ComponentMetadata
        +set(key, value) void
        +invalidate(key) void
        +clear() void
        +getStats() CacheStats
    }

    class FileWatcher {
        -watcher FSWatcher
        -callbacks Map
        +watch(paths) void
        +unwatch(path) void
        +on(event, callback) void
        -handleChange(path) void
    }

    class PerformanceMonitor {
        -metrics Map
        -startTimes Map
        +startTimer(operation) void
        +endTimer(operation) void
        +recordMetric(name, value) void
        +getMetrics() PerformanceMetrics
    }

    class ErrorReporter {
        -errors ErrorEntry
        -maxErrors number
        +reportError(error, severity) void
        +getErrors(severity) ErrorEntry
        +clearErrors() void
        +getSummary() ErrorSummary
    }

    CacheManager --> FileWatcher
```

### ユーティリティクラス

```mermaid
classDiagram
    class SimilarityAnalyzer {
        +findSimilarComponents(target, all) SimilarComponent
        -generateFeatureVector(component) number
        -calculateCosineSimilarity(vec1, vec2) number
        -normalizeVector(vector) number
    }

    class DesignSystemUtils {
        +extractDesignTokens(components) DesignSystem
        +findCommonPatterns(components) Pattern
        +categorizeComponents(components) Map
        -analyzeColorTokens(styles) ColorToken
        -analyzeSpacingTokens(styles) SpacingToken
    }
```

## コンポーネント相関図

### データフローと依存関係

```mermaid
flowchart TB
    subgraph EP ["Entry Point"]
        A[index.ts]
    end

    subgraph CL ["Core Layer"]
        B[MCPServer]
        C[ConfigManager]
    end

    subgraph SL ["Scanning Layer"]
        D[ComponentScanner]
    end

    subgraph AL ["Analysis Layer"]
        E[ComponentAnalyzer]
        F[ASTAnalyzer]
        G[ReactNativeAnalyzer]
        H[TailwindAnalyzer]
    end

    subgraph CHL ["Cache Layer"]
        I[CacheManager]
        J[FileWatcher]
    end

    subgraph UL ["Utility Layer"]
        K[SimilarityAnalyzer]
        L[DesignSystemUtils]
        M[PerformanceMonitor]
        N[ErrorReporter]
    end

    subgraph TD ["Type Definitions"]
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

    classDef entrypoint fill:#ff9999
    classDef core fill:#6699ff
    classDef types fill:#99ff99
    
    class A entrypoint
    class B core
    class O types
```

### MCPツールとモジュールの対応

```mermaid
flowchart LR
    subgraph MT ["MCP Tools"]
        T1[list_components]
        T2[get_component_details]
        T3[find_similar_components]
        T4[get_design_system]
        T5[get_available_categories]
        T6[get_screen_patterns]
        T7[get_performance_metrics]
        T8[get_error_report]
    end

    subgraph MO ["Modules"]
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
    Scanner-->>Server: componentPaths
    Server->>Analyzer: analyzeMultiple(paths)
    Analyzer-->>Server: metadata
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
flowchart TD
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
    H -->|Critical| I[Log and Throw]
    H -->|High| J[Log and Continue]
    H -->|Medium/Low| K[Log Only]
    
    I --> L[Client Error Response]
    J --> M[Partial Result]
    K --> N[Normal Response]
```