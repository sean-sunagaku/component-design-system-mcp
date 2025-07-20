# 設定ガイド

## 設定ファイルの概要

Component MCP Serverは`component-mcp.config.json`ファイルを使用して動作を制御します。このファイルはプロジェクトのルートディレクトリに配置する必要があります。

## 設定ファイルの構造

```json
{
  "scanPaths": ["./src"],
  "exclude": ["**/*.test.*"],
  "frameworks": {
    "reactNative": true,
    "tailwind": true
  },
  "cache": {
    "enabled": true,
    "ttl": 3600000,
    "maxSize": 100
  },
  "watch": {
    "enabled": true,
    "debounce": 1000
  },
  "analysis": {
    "extractProps": true,
    "extractStyles": true,
    "extractDependencies": true,
    "categorizeComponents": true
  },
  "similarity": {
    "threshold": 0.7,
    "weights": {
      "props": 0.3,
      "styles": 0.2,
      "structure": 0.3,
      "dependencies": 0.2
    }
  },
  "performance": {
    "maxConcurrency": 5,
    "timeout": 30000
  }
}
```

## 設定オプションの詳細

### scanPaths（必須）

コンポーネントをスキャンするディレクトリのリストです。

```json
{
  "scanPaths": [
    "./src/components",
    "./src/screens",
    "./src/shared"
  ]
}
```

**ポイント:**
- 相対パスまたは絶対パスを使用可能
- 複数のパスを指定可能
- サブディレクトリも自動的にスキャンされる

### exclude（オプション）

スキャンから除外するファイルパターンのリストです。

```json
{
  "exclude": [
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.stories.tsx",
    "**/node_modules/**",
    "**/dist/**",
    "**/__tests__/**"
  ]
}
```

**サポートされるパターン:**
- `*` - 任意の文字列（ディレクトリ区切りを除く）
- `**` - 任意の文字列（ディレクトリ区切りを含む）
- `?` - 任意の1文字
- `{a,b}` - aまたはb

### frameworks（オプション）

有効にするフレームワークの設定です。

```json
{
  "frameworks": {
    "reactNative": true,
    "tailwind": false
  }
}
```

**オプション:**
- `reactNative`: React Nativeコンポーネントの分析を有効化
- `tailwind`: TailwindCSSを使用したコンポーネントの分析を有効化

### cache（オプション）

キャッシュシステムの設定です。

```json
{
  "cache": {
    "enabled": true,
    "ttl": 3600000,
    "maxSize": 100,
    "persistToDisk": false,
    "cacheDir": "./.cache/component-mcp"
  }
}
```

**パラメータ:**
- `enabled`: キャッシュの有効/無効
- `ttl`: キャッシュの有効期限（ミリ秒）
- `maxSize`: キャッシュする最大コンポーネント数
- `persistToDisk`: ディスクへの永続化（開発中）
- `cacheDir`: キャッシュディレクトリ

### watch（オプション）

ファイル監視の設定です。

```json
{
  "watch": {
    "enabled": true,
    "debounce": 1000,
    "ignore": [
      "**/.git/**",
      "**/node_modules/**"
    ]
  }
}
```

**パラメータ:**
- `enabled`: ファイル監視の有効/無効
- `debounce`: 変更検出のデバウンス時間（ミリ秒）
- `ignore`: 監視から除外するパターン

### analysis（オプション）

分析機能の設定です。

```json
{
  "analysis": {
    "extractProps": true,
    "extractStyles": true,
    "extractDependencies": true,
    "categorizeComponents": true,
    "detectPatterns": true,
    "analyzeComplexity": false
  }
}
```

**機能フラグ:**
- `extractProps`: プロップス情報の抽出
- `extractStyles`: スタイル情報の抽出
- `extractDependencies`: 依存関係の抽出
- `categorizeComponents`: 自動カテゴリ分類
- `detectPatterns`: デザインパターンの検出
- `analyzeComplexity`: 複雑度分析（実験的）

### similarity（オプション）

類似度分析の設定です。

```json
{
  "similarity": {
    "threshold": 0.7,
    "algorithm": "cosine",
    "weights": {
      "props": 0.3,
      "styles": 0.2,
      "structure": 0.3,
      "dependencies": 0.2
    },
    "features": {
      "useProps": true,
      "useStyles": true,
      "useStructure": true,
      "useDependencies": true
    }
  }
}
```

**パラメータ:**
- `threshold`: 類似と判定する閾値（0-1）
- `algorithm`: 使用するアルゴリズム（現在は"cosine"のみ）
- `weights`: 各特徴の重み（合計が1.0になるように）
- `features`: 使用する特徴

### performance（オプション）

パフォーマンス関連の設定です。

```json
{
  "performance": {
    "maxConcurrency": 5,
    "timeout": 30000,
    "batchSize": 10,
    "memoryLimit": 512
  }
}
```

**パラメータ:**
- `maxConcurrency`: 並列処理の最大数
- `timeout`: 分析のタイムアウト（ミリ秒）
- `batchSize`: バッチ処理のサイズ
- `memoryLimit`: メモリ使用量の上限（MB）

## 環境別設定

### 開発環境

```json
{
  "scanPaths": ["./src"],
  "cache": {
    "enabled": false
  },
  "watch": {
    "enabled": true,
    "debounce": 500
  },
  "performance": {
    "maxConcurrency": 3
  }
}
```

### 本番環境

```json
{
  "scanPaths": ["./src"],
  "cache": {
    "enabled": true,
    "ttl": 7200000,
    "maxSize": 200
  },
  "watch": {
    "enabled": false
  },
  "performance": {
    "maxConcurrency": 10,
    "timeout": 60000
  }
}
```

### CI環境

```json
{
  "scanPaths": ["./src"],
  "cache": {
    "enabled": false
  },
  "watch": {
    "enabled": false
  },
  "analysis": {
    "analyzeComplexity": true
  }
}
```

## 設定の検証

設定ファイルの妥当性を検証するコマンド：

```bash
npm run validate-config
```

## 設定のマージ

複数の設定ファイルをマージする場合：

```javascript
// component-mcp.config.base.json
{
  "scanPaths": ["./src"],
  "frameworks": {
    "reactNative": true
  }
}

// component-mcp.config.local.json
{
  "cache": {
    "enabled": false
  }
}
```

環境変数で指定：
```bash
MCP_CONFIG_EXTEND=./component-mcp.config.local.json npm start
```

## 設定のベストプラクティス

### 1. プロジェクトサイズに応じた調整

**小規模プロジェクト（<100コンポーネント）**
```json
{
  "cache": {
    "enabled": false
  },
  "performance": {
    "maxConcurrency": 3
  }
}
```

**大規模プロジェクト（>1000コンポーネント）**
```json
{
  "cache": {
    "enabled": true,
    "ttl": 7200000,
    "maxSize": 500
  },
  "performance": {
    "maxConcurrency": 10,
    "batchSize": 20
  }
}
```

### 2. フレームワーク固有の最適化

**React Native専用**
```json
{
  "frameworks": {
    "reactNative": true,
    "tailwind": false
  },
  "analysis": {
    "extractStyles": true
  }
}
```

**TailwindCSS専用**
```json
{
  "frameworks": {
    "reactNative": false,
    "tailwind": true
  },
  "analysis": {
    "detectPatterns": true
  }
}
```

### 3. パフォーマンスチューニング

**高速スキャン優先**
```json
{
  "exclude": [
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.stories.*",
    "**/examples/**"
  ],
  "analysis": {
    "analyzeComplexity": false
  }
}
```

**詳細分析優先**
```json
{
  "analysis": {
    "extractProps": true,
    "extractStyles": true,
    "extractDependencies": true,
    "detectPatterns": true,
    "analyzeComplexity": true
  }
}
```

## トラブルシューティング

### 設定が読み込まれない

1. ファイル名が正しいか確認（`component-mcp.config.json`）
2. JSONの構文エラーがないか確認
3. ファイルの権限を確認

### パフォーマンスが遅い

1. `exclude`パターンを追加して不要なファイルを除外
2. `maxConcurrency`を増やす
3. キャッシュを有効化

### メモリ不足

1. `performance.memoryLimit`を設定
2. `performance.batchSize`を減らす
3. スキャンパスを分割して段階的に処理