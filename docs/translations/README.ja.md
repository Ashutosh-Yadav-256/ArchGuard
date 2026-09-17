[English](../../README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Français](README.fr.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [العربية](README.ar.md)

---

# ArchStandards

> **Policy-as-Code アーキテクチャガバナンスプラットフォーム**：バージョン管理されたエンジニアリング基準に基づいてPull Requestを自動検証し、アーキテクチャの劣化を防止しながら、AST駆動の実行可能なフィードバックを提供します。

[![CI](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-116%20passed-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchStandards)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#パフォーマンスとベンチマーク)

---

## ArchStandards とは？

WikiやNotionに記載されたアーキテクチャ設計規約は、忙しいコードレビューの中で見過ごされやすく、時間とともに形骸化します。

**ArchStandards** は、設計規約を自動化されたGitHub Checksに変換することでこの課題を解決します：

- **静的 AST 解析**：TypeScript Compiler API を使用し、構文検査、クラス・メソッド規模の計測、およびレイヤー間インポートグラフを解析。
- **インライン PR アノテーション**：違反理由と具体的な修正コード提案を、変更された差分行へ直接コメント。
- **アーキテクチャ健全性スコア（0 - 100）**：PRの品質を客観的に数値化し、設定に応じてマージを自動ブロック。
- **実践的ドキュメントプレイブック**：各ルールの根拠や修正方法をDocusaurusサイトで解説。
- **期限付きの例外設定**：`.archstandards/config.yaml` を通じて理由と有効期限を指定した技術的負債管理が可能。

---

## システム構成図

```text
  開発者が PR を作成 / 更新
               │
               ▼
   [ Fastify Webhook サーバ ] ── HMAC-SHA256 タイミングセーフ検証
               │
               ▼
    [ GitHub アダプター層 ] ──── 変更ファイルと差分を取得 (Octokit)
               │
               ▼
      [ ArchStandards コア ] ─────── AST パーサーとファイル分類器
               │
        ┌──────┴──────┐
        ▼             ▼
    [ 18のルール ] [ 例外判定 ]
        │             │
        └──────┬──────┘
               ▼
     [ 結果集約エンジン ] ────── 減点計算と健全性スコアの算出
               │
               ▼
    [ GitHub Check Run API ] ─── インライン注釈とMarkdownレポート
```

---

## 18のビルトインルール一覧

| 分野               | ルール ID  | 検証内容                                                              | デフォルト重要度 |
| :----------------- | :--------- | :-------------------------------------------------------------------- | :--------------- |
| **アーキテクチャ** | `ARCH-001` | コントローラーからリポジトリを直接インポートしてはならない            | `error`          |
|                    | `ARCH-002` | コントローラーに肥大化したビジネスロジック（>20行）を含めてはならない | `warning`        |
|                    | `ARCH-003` | サービス層が HTTP/Web フレームワークに依存してはならない              | `error`          |
|                    | `ARCH-004` | モジュール間の循環依存を禁止                                          | `error`          |
| **API 規約**       | `API-001`  | エンドポイントで入力バリデーション（Zod, Joi 等）を必須とする         | `warning`        |
|                    | `API-002`  | 公開エンドポイントにレート制限ミドルウェアを設定すること              | `warning`        |
|                    | `API-003`  | POST リソース作成エンドポイントは HTTP 201 Created を返すこと         | `warning`        |
|                    | `API-004`  | エラー応答は標準化された形式（RFC 7807）に従うこと                    | `info`           |
| **テスト規約**     | `TEST-001` | 新規サービスファイルには対応するユニットテストが必要                  | `error`          |
|                    | `TEST-002` | 重要なビジネスロジック（>15行のメソッド）には専用テストが必要         | `warning`        |
|                    | `TEST-003` | リポジトリ全体で最低 80% のテストファイルカバレッジ比率を維持すること | `warning`        |
|                    | `TEST-004` | CI を通すためにテストをスキップ（`.skip`, `xit`）してはならない       | `error`          |
| **セキュリティ**   | `SEC-001`  | ソースコード内に API キーやパスワードをハードコードしてはならない     | `error`          |
|                    | `SEC-002`  | パスワードやトークンなどの機密情報をログに出力してはならない          | `error`          |
|                    | `SEC-003`  | データベース接続文字列には環境変数を使用すること                      | `warning`        |
| **命名規約**       | `NAME-001` | クラスおよびインターフェース名は PascalCase を使用すること            | `info`           |
|                    | `NAME-002` | 関数名およびメソッド名は camelCase を使用すること                     | `info`           |
|                    | `NAME-003` | 真偽値変数には肯定接頭辞（`is`/`has`/`can`）を使用すること            | `info`           |

---

## パフォーマンスとベンチマーク

Node.js v22 上で高精度タイマー（`performance.now()`）による実測値：

| テスト項目               | 規模                                | 実測値                              |
| :----------------------- | :---------------------------------- | :---------------------------------- |
| **AST 解析速度**         | 小規模ファイル (~100行)             | **55,558 行/秒** (平均 1.73 ms)     |
| **AST 解析速度**         | 大規模ファイル (~2,000行)           | **145,214 行/秒** (平均 14.5 ms)    |
| **AST 解析速度**         | 超大規模ファイル (~5,000行)         | **136,134 行/秒** (平均 38.6 ms)    |
| **ルール実行時間**       | 正規表現 / マニフェスト検査         | **0.002 ms** (最大 493,827 回/秒)   |
| **ルール実行時間**       | AST 全探索ルール                    | **1.1 – 1.7 ms**                    |
| **エンドツーエンド処理** | 小規模 PR (3ファイル, 161行)        | **11.39 ms** (p95: 15.58 ms)        |
| **エンドツーエンド処理** | モノレポ PR (100ファイル, ~6,000行) | **298.44 ms** (p95: 369.12 ms)      |
| **Webhook HMAC 検証**    | Fastify 暗号化タイミングセーフ比較  | **0.362 ms** (2,760 req/秒)         |
| **検出精度 (再現率)**    | 実テストコーパス                    | **100.0%** (クリーンコード誤検知 0) |

---

## モノレポ構成

```text
ArchStandards/
├── apps/
│   ├── github-app/
│   └── docs/
├── packages/
│   ├── core/
│   ├── rules/
│   ├── parsers/
│   └── github-adapter/
├── benchmarks/
├── examples/
└── policies/
```

---

## はじめに

### 前提条件

- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### インストールとビルド

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchStandards.git
cd ArchStandards

pnpm install

pnpm build

pnpm test

pnpm benchmark
```

### ローカル実行

```bash
pnpm --filter @archstandards/github-app start

pnpm --filter @archstandards/docs start
```

---

## 設定ファイル (`.archstandards/config.yaml`)

```yaml
version: "1.0"

rules:
  include:
    - "*"
  exclude:
    - "NAME-*"

policy:
  fail_on:
    - "error"
  warn_on:
    - "warning"

scoring:
  base: 100
  deductions:
    error: 15
    warning: 5
    info: 1

exceptions:
  - rule: "ARCH-001"
    path: "src/controllers/legacy-export.controller.ts"
    reason: "Direct query optimization required pending database migration."
    expires: "2026-12-31"
```

---

## コントリビューション

開発フローについては [CONTRIBUTING.md](../../CONTRIBUTING.md) を、セキュリティ脆弱性の報告については [SECURITY.md](../../SECURITY.md) をご確認ください。

---

## サポートとお問い合わせ

ご質問やお困りの点は **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)** までご連絡ください。

---

## ライセンス

[MIT](../../LICENSE) © [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
