# 使用ガイド

## はじめに

Component MCP Serverは、既存のコンポーネントライブラリを分析し、コンポーネントの重複を防ぎ、デザインの一貫性を保つためのツールです。このガイドでは、インストールから実際の使用方法まで詳しく説明します。

## インストール

### 前提条件

- Node.js 18以上
- npm または yarn
- TypeScriptプロジェクト（React NativeまたはTailwindCSSを使用）

### インストール手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-org/component-mcp-server.git
cd component-mcp-server
```

2. **依存関係のインストール**
```bash
npm install
```

3. **設定ファイルの作成**
```bash
cp component-mcp.config.example.json component-mcp.config.json
```

4. **ビルド**
```bash
npm run build
```

## 設定

### 基本設定

`component-mcp.config.json`を編集して、プロジェクトに合わせて設定します：

```json
{
  "scanPaths": [
    "./src/components",
    "./src/screens"
  ],
  "exclude": [
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/node_modules/**"
  ],
  "frameworks": {
    "reactNative": true,
    "tailwind": false
  },
  "cache": {
    "enabled": true,
    "ttl": 3600000
  }
}
```

### 設定オプションの詳細

- **scanPaths**: コンポーネントをスキャンするディレクトリのリスト
- **exclude**: スキャンから除外するパターン（glob形式）
- **frameworks**: 有効にするフレームワーク
- **cache**: キャッシュ設定

## 起動方法

### 開発環境

```bash
npm run dev
```

### プロダクション環境

```bash
npm run build
npm start
```

### Dockerでの起動

```bash
docker build -t component-mcp-server .
docker run -p 3000:3000 -v $(pwd)/component-mcp.config.json:/app/component-mcp.config.json component-mcp-server
```

## Claude Desktopとの統合

### 1. Claude Desktop設定ファイルを開く

```bash
# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows
%APPDATA%\Claude\claude_desktop_config.json

# Linux
~/.config/Claude/claude_desktop_config.json
```

### 2. MCP設定を追加

```json
{
  "mcpServers": {
    "component-design-system": {
      "command": "node",
      "args": ["/path/to/component-mcp-server/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 3. Claude Desktopを再起動

設定を反映させるため、Claude Desktopを再起動します。

## 使用例

### 1. コンポーネント一覧の取得

```typescript
// Claudeでの使用例
"ボタンコンポーネントの一覧を表示してください"

// MCPツールの呼び出し
{
  "tool": "list_components",
  "arguments": {
    "category": "buttons",
    "limit": 10
  }
}
```

### 2. 類似コンポーネントの検索

```typescript
// Claudeでの使用例
"PrimaryButtonに似たコンポーネントを探してください"

// MCPツールの呼び出し
{
  "tool": "find_similar_components",
  "arguments": {
    "targetPath": "./src/components/buttons/PrimaryButton.tsx",
    "threshold": 0.8
  }
}
```

### 3. デザインシステムの分析

```typescript
// Claudeでの使用例
"プロジェクトで使用されているカラーパレットを教えてください"

// MCPツールの呼び出し
{
  "tool": "get_design_system",
  "arguments": {}
}
```

## ベストプラクティス

### 1. コンポーネントの命名規則

一貫した命名規則を使用することで、より正確な分析が可能になります：

```typescript
// Good
PrimaryButton.tsx
SecondaryButton.tsx
IconButton.tsx

// Bad
btn1.tsx
ButtonNew.tsx
button-primary.tsx
```

### 2. プロップスの型定義

TypeScriptの型定義を使用することで、より詳細な分析が可能になります：

```typescript
interface ButtonProps {
  /** ボタンのテキスト */
  label: string;
  /** クリックハンドラ */
  onPress: () => void;
  /** ボタンのスタイルバリアント */
  variant?: 'primary' | 'secondary' | 'danger';
  /** 無効状態 */
  disabled?: boolean;
}
```

### 3. スタイルの一貫性

StyleSheetまたはTailwindCSSを一貫して使用：

```typescript
// React Native
const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF'
  }
});

// TailwindCSS
<button className="p-4 rounded-lg bg-blue-500">
```

## トラブルシューティング

### コンポーネントが検出されない

1. **設定ファイルの確認**
   - `scanPaths`が正しく設定されているか確認
   - `exclude`パターンで必要なファイルが除外されていないか確認

2. **ファイル拡張子の確認**
   - `.tsx`, `.jsx`, `.ts`, `.js`のいずれかを使用しているか確認

3. **キャッシュのクリア**
   ```bash
   npm run clear-cache
   ```

### パフォーマンスの問題

1. **スキャンパスの最適化**
   - 不要なディレクトリを`exclude`に追加
   - スキャンパスを具体的に指定

2. **キャッシュの有効化**
   ```json
   {
     "cache": {
       "enabled": true,
       "ttl": 7200000
     }
   }
   ```

### エラーレポートの確認

```typescript
// エラーレポートの取得
{
  "tool": "get_error_report",
  "arguments": {
    "severity": "high"
  }
}
```

## 高度な使用方法

### カスタムカテゴリの定義

コンポーネントにカスタムカテゴリを追加：

```typescript
/**
 * @category forms/input
 */
export const TextInput = () => {
  // ...
};
```

### デザイントークンの抽出

一貫したスタイル値を使用することで、自動的にデザイントークンとして認識されます：

```typescript
const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  danger: '#FF3B30'
};
```

### パフォーマンスモニタリング

```typescript
// パフォーマンスメトリクスの取得
{
  "tool": "get_performance_metrics",
  "arguments": {}
}
```

## CI/CDとの統合

### GitHub Actions

```yaml
name: Component Analysis

on:
  pull_request:
    paths:
      - 'src/components/**'

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run analyze:ci
```

### pre-commitフック

```bash
#!/bin/sh
# .git/hooks/pre-commit

npm run analyze:changed
```