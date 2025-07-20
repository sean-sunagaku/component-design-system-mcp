# Component MCP Server アーキテクチャ

## 概要

Component MCP Serverは、既存のコンポーネントライブラリを分析し、AIアシスタントがコンポーネントの重複を防ぎ、デザインの一貫性を保つのを支援するTypeScriptベースのModel Context Protocol (MCP) サーバーです。

## システムアーキテクチャ

### コアパイプライン

システムは以下の4段階のパイプラインで動作します：

```
Scanner → Analyzer → Cache → MCP Tools
```

1. **Scanner（スキャナー）**
   - 設定されたパスからコンポーネントファイルを検出
   - ファイルシステムを効率的に走査
   - 除外パターンに基づくフィルタリング

2. **Analyzer（アナライザー）**
   - Babelパーサーを使用したAST解析
   - コンポーネントメタデータの抽出
   - スタイルパターンの認識

3. **Cache（キャッシュ）**
   - パフォーマンス最適化
   - ファイル監視による自動更新
   - メモリ効率的なデータ管理

4. **MCP Server（MCPサーバー）**
   - 8つのツールをMCPプロトコル経由で公開
   - クライアントとの通信管理
   - エラーハンドリングとロギング

### データフロー

```mermaid
graph LR
    A[ファイルシステム] -->|スキャン| B[Scanner]
    B -->|ファイルパス| C[Analyzer]
    C -->|メタデータ| D[Cache]
    D -->|キャッシュデータ| E[MCPServer]
    E -->|MCPツール| F[クライアント]
    
    G[ファイル監視] -->|変更通知| D
```

## モジュール構成

### コアモジュール

#### MCPServer (`src/core/MCPServer.ts`)
- MCPプロトコルの実装
- ツールの登録と管理
- リクエスト/レスポンスハンドリング

#### ConfigManager (`src/core/ConfigManager.ts`)
- 設定ファイルの読み込みと検証
- デフォルト設定の管理
- 動的設定更新

### スキャナーモジュール

#### ComponentScanner (`src/scanner/ComponentScanner.ts`)
- ファイルシステムの走査
- コンポーネントファイルの検出
- 除外パターンの適用

### アナライザーモジュール

#### ComponentAnalyzer (`src/analyzer/ComponentAnalyzer.ts`)
- AST解析のオーケストレーション
- メタデータの統合
- フレームワーク固有の処理

#### ASTAnalyzer (`src/analyzer/ASTAnalyzer.ts`)
- Babelパーサーの管理
- AST走査とノード解析
- コンポーネント構造の抽出

#### ReactNativeAnalyzer (`src/analyzer/ReactNativeAnalyzer.ts`)
- StyleSheet.createパターンの検出
- React Nativeコンポーネントの分析
- プロップスとインターフェースの抽出

#### TailwindAnalyzer (`src/analyzer/TailwindAnalyzer.ts`)
- classNameユーティリティの分析
- TailwindCSSパターンの抽出
- レスポンシブデザインの検出

### キャッシュモジュール

#### CacheManager (`src/cache/CacheManager.ts`)
- インメモリキャッシュの管理
- ファイル監視との統合
- キャッシュ無効化ロジック

#### FileWatcher (`src/cache/FileWatcher.ts`)
- chokidarを使用したファイル監視
- 変更イベントの処理
- デバウンスとバッチ処理

### ユーティリティモジュール

#### DesignSystemUtils (`src/utils/DesignSystemUtils.ts`)
- デザイントークンの抽出
- パターン認識
- スタイル集約

#### ErrorReporter (`src/utils/ErrorReporter.ts`)
- エラーの収集と分類
- 重要度レベルの管理
- エラーレポートの生成

#### PerformanceMonitor (`src/utils/PerformanceMonitor.ts`)
- パフォーマンスメトリクスの収集
- キャッシュ統計
- メモリ使用量の追跡

#### SimilarityAnalyzer (`src/utils/SimilarityAnalyzer.ts`)
- 特徴ベクトルの生成
- コサイン類似度の計算
- 類似コンポーネントの検索

## フレームワークサポート

### React Native
- コンポーネント定義の検出
- StyleSheet.createの解析
- プロップスタイプの抽出
- スクリーンとコンポーネントの分類

### TailwindCSS
- className属性の解析
- ユーティリティクラスの抽出
- デザイントークンのマッピング
- レスポンシブパターンの検出

## エラーハンドリング

### エラー分類
- **Low**: 軽微な問題（例：スタイル解析の失敗）
- **Medium**: 機能に影響する問題（例：コンポーネント解析の部分的失敗）
- **High**: 重要な機能の失敗（例：ファイルスキャンの失敗）
- **Critical**: システム全体に影響する問題（例：設定ロードの失敗）

### エラー伝播
- 各モジュールは独自のエラーハンドリングを実装
- ErrorReporterに集約
- MCPツール経由でクライアントに報告

## パフォーマンス最適化

### キャッシング戦略
- コンポーネントメタデータのインメモリキャッシュ
- ファイル変更時の部分的な再解析
- 類似度計算結果のキャッシュ

### 並列処理
- ファイルスキャンの並列実行
- 独立したコンポーネントの並列解析
- 非同期I/O操作

### メモリ管理
- 大規模プロジェクト対応のストリーミング処理
- 未使用データの定期的なクリーンアップ
- メモリ使用量の監視とアラート

## セキュリティ考慮事項

### ファイルアクセス
- 設定されたパスのみスキャン
- シンボリックリンクの適切な処理
- パストラバーサルの防止

### データ処理
- ASTパース時の安全性確保
- ユーザー入力の検証
- サニタイゼーション処理

## 拡張性

### 新しいフレームワークの追加
1. `src/analyzer/`に新しいアナライザークラスを作成
2. `ComponentAnalyzer`に統合
3. 設定スキーマを更新
4. テストを追加

### 新しいMCPツールの追加
1. `MCPServer`に新しいツールを登録
2. ツールロジックを実装
3. ツールスキーマを定義
4. ドキュメントを更新