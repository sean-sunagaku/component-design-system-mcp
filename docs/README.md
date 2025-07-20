# ドキュメント一覧

Component MCP Serverの包括的なドキュメントです。

## 📚 ドキュメント構成

### 🏗️ アーキテクチャ
- **[architecture.md](./architecture.md)** - システムアーキテクチャの概要、コアパイプライン、モジュール構成

### 📊 クラス図と相関関係
- **[class-diagram.md](./class-diagram.md)** - クラス図、コンポーネント相関図、データフロー図

### 🔧 API リファレンス
- **[api-reference.md](./api-reference.md)** - 8つのMCPツールの詳細、クラスAPI、型定義

### 📖 使用ガイド
- **[usage-guide.md](./usage-guide.md)** - インストール、Claude Desktopとの統合、実際の使用例

### ⚙️ 設定ガイド
- **[configuration.md](./configuration.md)** - 設定ファイルの詳細、環境別設定、ベストプラクティス

## 🚀 クイックスタート

1. **プロジェクトの理解**
   - [architecture.md](./architecture.md)でシステム全体の構成を理解
   - [class-diagram.md](./class-diagram.md)でクラス間の関係を把握

2. **セットアップ**
   - [usage-guide.md](./usage-guide.md)でインストールと設定
   - [configuration.md](./configuration.md)で詳細な設定調整

3. **開発・運用**
   - [api-reference.md](./api-reference.md)でAPIの詳細を確認
   - 各ドキュメントのトラブルシューティングセクションを参考

## 📋 ドキュメントの使い方

### 初回利用者向け
1. [usage-guide.md](./usage-guide.md) → [configuration.md](./configuration.md)
2. 実際に試した後、[architecture.md](./architecture.md)で詳細を理解

### 開発者向け
1. [architecture.md](./architecture.md) → [class-diagram.md](./class-diagram.md)
2. [api-reference.md](./api-reference.md)で実装詳細を確認

### システム管理者向け
1. [configuration.md](./configuration.md)で設定を理解
2. [usage-guide.md](./usage-guide.md)のCI/CD統合を参考

## 🛠️ よくある質問

### Q: コンポーネントが検出されない
→ [usage-guide.md](./usage-guide.md#トラブルシューティング)を参照

### Q: パフォーマンスが遅い
→ [configuration.md](./configuration.md#パフォーマンスチューニング)を参照

### Q: 類似度の精度を上げたい
→ [configuration.md](./configuration.md#similarity)の設定調整を参照

### Q: 新しいフレームワークを追加したい
→ [architecture.md](./architecture.md#拡張性)を参照

## 📈 ドキュメントの更新

このドキュメントは以下の頻度で更新されます：

- **機能追加時**: 該当ドキュメントを即座に更新
- **設定変更時**: configuration.mdを更新
- **アーキテクチャ変更時**: architecture.mdとclass-diagram.mdを更新
- **API変更時**: api-reference.mdを更新

## 🤝 コントリビューション

ドキュメントの改善提案は以下の形で受け付けています：

1. **誤字・脱字**: 直接修正のPRを作成
2. **内容の改善**: Issueで改善案を提案
3. **新しいセクション**: 事前にIssueで相談

## 🔗 関連リンク

- [プロジェクトのREADME](../README.md)
- [設定例](../component-mcp.config.example.json)
- [テストディレクトリ](../tests/)
- [型定義](../src/types/)