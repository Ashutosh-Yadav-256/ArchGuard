[English](../../README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Français](README.fr.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [العربية](README.ar.md)

---

# ArchStandards

> **策略即代码架构治理平台**：依据版本化的工程规范自动化审查 Pull Request，防止架构退化，并通过基于抽象语法树（AST）的可执行反馈指导工程团队。

[![CI](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-116%20passed-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchStandards)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#性能与基准测试)

---

## 什么是 ArchStandards？

Wiki 和 Notion 文档中的系统架构设计规范容易随着时间推移而过时失效，因为在节奏紧张的代码审查中，开发者很难手动比对静态文档。

**ArchStandards** 通过将工程规范转变为自动化的持续 GitHub Checks 填补了这一空白：

- **静态 AST 分析**：使用 TypeScript 编译器 API 执行深层语法检查、类与方法度量分析以及跨层依赖导入图分析。
- **PR 差异内联批注**：将具体的违规解释、设计原由和修复建议精准附加到变更的代码行上。
- **架构健康评分（0 - 100）**：客观计算 PR 的架构质量分值，并可根据阈值阻断合并。
- **在线工程规范手册**：深度集成 Docusaurus 完整规范站点，阐明每项规则的背景与治理指南。
- **时效性架构例外**：在 `.archstandards/config.yaml` 中声明式管理技术债务，强制要求原因与到期日期。

---

## 系统高层架构

```text
  开发者开启 / 更新 PR
               │
               ▼
   [ Fastify Webhook 服务 ] ── HMAC-SHA256 恒定时间安全签名验证
               │
               ▼
    [ GitHub 适配层 ] ──────── 获取变更文件与 Diff (Octokit)
               │
               ▼
      [ ArchStandards 核心引擎 ] ─ AST 解析器与文件分类器
               │
        ┌──────┴──────┐
        ▼             ▼
   [ 18项规则 ]  [ 例外过滤 ]
        │             │
        └──────┬──────┘
               ▼
     [ 结果聚合器 ] ────────── 扣分项与架构健康度计算
               │
               ▼
    [ GitHub Check Run API ] ─ 原生批注与 Markdown 审查报告
```

核心引擎（`packages/core`、`packages/parsers`、`packages/rules`）与 GitHub 完全解耦，支持独立 CLI、本地 Git Hook 和任意 CI 流程。

---

## 18 项内建规则目录

| 领域         | 规则 ID    | 规范说明                                              | 默认级别  |
| :----------- | :--------- | :---------------------------------------------------- | :-------- |
| **分层架构** | `ARCH-001` | 控制器不得直接导入仓库层（强制三层架构）              | `error`   |
|              | `ARCH-002` | 控制器不应包含重度业务逻辑（单方法不得超过20行）      | `warning` |
|              | `ARCH-003` | 领域服务不得依赖 HTTP/Web 框架（Express/Fastify/Koa） | `error`   |
|              | `ARCH-004` | 禁止应用模块间循环依赖                                | `error`   |
| **API 规范** | `API-001`  | 接口必须声明请求输入校验（Zod, Joi, Celebrate）       | `warning` |
|              | `API-002`  | 公开接口必须配置限流中间件                            | `warning` |
|              | `API-003`  | POST 资源创建端点必须返回 HTTP 201 Created            | `warning` |
|              | `API-004`  | 错误响应必须符合统一结构体模式（RFC 7807）            | `info`    |
| **测试规范** | `TEST-001` | 新建服务必须包含对应的同伴单元测试文件                | `error`   |
|              | `TEST-002` | 复杂业务逻辑（>15行方法）必须有专项测试用例覆盖       | `warning` |
|              | `TEST-003` | 仓库必须保持至少 80% 的测试文件覆盖比例               | `warning` |
|              | `TEST-004` | 禁止通过跳过测试（`.skip`, `xit`）来规避 CI 失败      | `error`   |
| **安全规范** | `SEC-001`  | 源代码中严禁包含硬编码 API 密钥、Token 或密码         | `error`   |
|              | `SEC-002`  | 日志中严禁输出敏感凭据与原始认证数据                  | `error`   |
|              | `SEC-003`  | 数据库连接串及服务终端必须读取环境变量                | `warning` |
| **命名规范** | `NAME-001` | 类名与接口名必须遵循 PascalCase                       | `info`    |
|              | `NAME-002` | 函数名与方法名必须遵循 camelCase                      | `info`    |
|              | `NAME-003` | 布尔变量与属性必须使用肯定前缀（`is`/`has`/`can`）    | `info`    |

---

## 性能与基准测试

在 Node.js v22 环境下使用高精度单调时钟（`performance.now()`）实测：

| 测试项                | 规模                           | 测量数据                          |
| :-------------------- | :----------------------------- | :-------------------------------- |
| **AST 解析吞吐量**    | 小型文件（~100行）             | **55,558 行/秒** (平均 1.73 ms)   |
| **AST 解析吞吐量**    | 大型文件（~2,000行）           | **145,214 行/秒** (平均 14.5 ms)  |
| **AST 解析吞吐量**    | 超大文件（~5,000行）           | **136,134 行/秒** (平均 38.6 ms)  |
| **规则执行耗时**      | 正则匹配 / 配置清单规则        | **0.002 ms** (最高 493,827 次/秒) |
| **规则执行耗时**      | 全 AST 遍历规则                | **1.1 – 1.7 ms**                  |
| **端到端流水线**      | 小型 PR（3个文件，161行）      | **11.39 ms** (p95: 15.58 ms)      |
| **端到端流水线**      | 大型 PR（100个文件，~6,000行） | **298.44 ms** (p95: 369.12 ms)    |
| **Webhook HMAC 校验** | Fastify 恒定时间加密比对       | **0.362 ms** (2,760 请求/秒)      |
| **测试集召回率**      | 真实测试语料库                 | **100.0%** (纯净代码 0 误报)      |

---

## 项目单体仓库结构

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

## 快速上手

### 环境要求

- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### 安装与构建

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchStandards.git
cd ArchStandards

pnpm install

pnpm build

pnpm test

pnpm benchmark
```

### 本地启动服务

```bash
pnpm --filter @archstandards/github-app start

pnpm --filter @archstandards/docs start
```

---

## 配置文件 (`.archstandards/config.yaml`)

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

## 贡献指南

欢迎参与贡献！请查阅 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解开发流程，并参阅 [SECURITY.md](../../SECURITY.md) 了解安全漏洞披露政策。

---

## 支持与联系

如有任何疑问或技术咨询，请联系：**[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)**。

---

## 开源协议

[MIT](../../LICENSE) © [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
