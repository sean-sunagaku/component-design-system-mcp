# 設定ガイド

## 設定ファイルの概要

Component MCP Serverは`component-mcp.config.json`ファイルを使用して動作を制御します。このファイルはプロジェクトのルートディレクトリに配置する必要があります。

## 設定ファイルの構造

```json
{
  "scanPaths": ["./src", "./components", "./screens"],
  "excludePatterns": [
    "node_modules",
    "*.test.*",
    "*.spec.*",
    "__tests__",
    "dist",
    "build",
    ".git"
  ],
  "frameworks": [
    {
      "name": "react-native",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".ts", ".js"],
      "componentPatterns": ["*Screen.tsx", "*Component.tsx", "*Screen.jsx", "*Component.jsx"],
      "stylePatterns": ["StyleSheet.create", "styled-components", "style="]
    },
    {
      "name": "tailwind",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".html", ".vue"],
      "componentPatterns": ["className=", "class="],
      "stylePatterns": ["@apply", "tailwind.config.*", "className="]
    }
  ],
  "componentPatterns": [
    "**/*Component.{tsx,jsx,ts,js}",
    "**/*Screen.{tsx,jsx,ts,js}",
    "**/components/**/*.{tsx,jsx,ts,js}",
    "**/screens/**/*.{tsx,jsx,ts,js}"
  ],
  "cacheEnabled": true,
  "autoRefresh": true,
  "refreshInterval": 300
}
```

## 設定オプションの詳細

### scanPaths（必須）

コンポーネントをスキャンするディレクトリのリストです。

```json
{
  "scanPaths": [
    "./src",
    "./components", 
    "./screens"
  ]
}
```

**ポイント:**
- 相対パスまたは絶対パスを使用可能
- 複数のパスを指定可能
- サブディレクトリも自動的にスキャンされる

### excludePatterns（オプション）

スキャンから除外するファイルパターンのリストです。

```json
{
  "excludePatterns": [
    "node_modules",
    "*.test.*",
    "*.spec.*", 
    "__tests__",
    "dist",
    "build",
    ".git"
  ]
}
```

**サポートされるパターン:**
- `*` - 任意の文字列（ディレクトリ区切りを除く）
- `**` - 任意の文字列（ディレクトリ区切りを含む）
- `?` - 任意の1文字
- `{a,b}` - aまたはb

### frameworks（必須）

フレームワーク固有の設定を配列形式で定義します。

```json
{
  "frameworks": [
    {
      "name": "react-native",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".ts", ".js"],
      "componentPatterns": ["*Screen.tsx", "*Component.tsx"],
      "stylePatterns": ["StyleSheet.create", "styled-components"]
    },
    {
      "name": "tailwind", 
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".html", ".vue"],
      "componentPatterns": ["className=", "class="],
      "stylePatterns": ["@apply", "tailwind.config.*"]
    }
  ]
}
```

**フレームワーク設定項目:**
- `name`: フレームワーク名（"react-native" | "tailwind"）
- `enabled`: 有効/無効フラグ
- `fileExtensions`: 対象ファイル拡張子
- `componentPatterns`: コンポーネント検出パターン
- `stylePatterns`: スタイル検出パターン

### componentPatterns（オプション）

コンポーネントファイルを特定するためのglobパターンです。

```json
{
  "componentPatterns": [
    "**/*Component.{tsx,jsx,ts,js}",
    "**/*Screen.{tsx,jsx,ts,js}",
    "**/components/**/*.{tsx,jsx,ts,js}",
    "**/screens/**/*.{tsx,jsx,ts,js}"
  ]
}
```

### cacheEnabled（オプション）

キャッシュシステムの有効/無効を制御します。

```json
{
  "cacheEnabled": true
}
```

**パラメータ:**
- `true`: キャッシュを有効化（推奨）
- `false`: キャッシュを無効化（開発時のみ）

### autoRefresh（オプション）

ファイル変更の自動検出と再分析を制御します。

```json
{
  "autoRefresh": true
}
```

**パラメータ:**
- `true`: ファイル変更を自動検出して再分析
- `false`: 手動での再起動が必要

### refreshInterval（オプション）

自動更新の間隔を秒単位で設定します。

```json
{
  "refreshInterval": 300
}
```

**パラメータ:**
- 数値: 更新間隔（秒）
- デフォルト: 300秒（5分）
- 推奨範囲: 60〜600秒

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
  "scanPaths": ["./src", "./components"],
  "excludePatterns": [
    "node_modules",
    "*.test.*",
    "__tests__"
  ],
  "frameworks": [
    {
      "name": "react-native",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx"]
    }
  ],
  "cacheEnabled": false,
  "autoRefresh": true,
  "refreshInterval": 60
}
```

### 本番環境

```json
{
  "scanPaths": ["./src", "./components", "./screens"],
  "excludePatterns": [
    "node_modules",
    "*.test.*",
    "*.spec.*",
    "__tests__",
    "dist",
    "build"
  ],
  "frameworks": [
    {
      "name": "react-native",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".ts", ".js"]
    },
    {
      "name": "tailwind",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx"]
    }
  ],
  "cacheEnabled": true,
  "autoRefresh": false,
  "refreshInterval": 600
}
```

### CI環境

```json
{
  "scanPaths": ["./src"],
  "excludePatterns": [
    "node_modules",
    "*.test.*",
    "dist"
  ],
  "frameworks": [
    {
      "name": "react-native",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".ts", ".js"]
    }
  ],
  "cacheEnabled": false,
  "autoRefresh": false
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
  "scanPaths": ["./src"],
  "cacheEnabled": false,
  "autoRefresh": true,
  "refreshInterval": 30
}
```

**大規模プロジェクト（>1000コンポーネント）**
```json
{
  "scanPaths": ["./src", "./components", "./screens"],
  "excludePatterns": [
    "node_modules",
    "*.test.*",
    "*.spec.*",
    "__tests__",
    "dist",
    "build",
    "examples",
    "stories"
  ],
  "cacheEnabled": true,
  "autoRefresh": true,
  "refreshInterval": 600
}
```

### 2. フレームワーク固有の最適化

**React Native専用**
```json
{
  "frameworks": [
    {
      "name": "react-native",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".ts", ".js"],
      "componentPatterns": ["*Screen.tsx", "*Component.tsx"],
      "stylePatterns": ["StyleSheet.create", "styled-components"]
    }
  ],
  "componentPatterns": [
    "**/*Screen.{tsx,jsx}",
    "**/*Component.{tsx,jsx}",
    "**/screens/**/*.{tsx,jsx}"
  ]
}
```

**TailwindCSS専用**
```json
{
  "frameworks": [
    {
      "name": "tailwind",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".html"],
      "componentPatterns": ["className=", "class="],
      "stylePatterns": ["@apply", "tailwind.config.*"]
    }
  ],
  "componentPatterns": [
    "**/components/**/*.{tsx,jsx}",
    "**/pages/**/*.{tsx,jsx}"
  ]
}
```

### 3. パフォーマンスチューニング

**高速スキャン優先**
```json
{
  "scanPaths": ["./src/components"],
  "excludePatterns": [
    "node_modules",
    "*.test.*",
    "*.spec.*",
    "*.stories.*",
    "__tests__",
    "examples",
    "dist"
  ],
  "cacheEnabled": true,
  "autoRefresh": false
}
```

**詳細分析優先**
```json
{
  "scanPaths": ["./src", "./components", "./screens", "./shared"],
  "frameworks": [
    {
      "name": "react-native",
      "enabled": true,
      "fileExtensions": [".tsx", ".jsx", ".ts", ".js"],
      "componentPatterns": ["*Screen.*", "*Component.*", "*Hook.*"],
      "stylePatterns": ["StyleSheet.create", "styled-components", "style="]
    }
  ],
  "cacheEnabled": true,
  "autoRefresh": true,
  "refreshInterval": 120
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