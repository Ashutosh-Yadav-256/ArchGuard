# ArchGuard

> **Policy-as-code architecture governance platform** that reviews pull requests against a versioned engineering playbook, prevents architectural erosion, and coaches engineering teams with actionable, AST-driven feedback.

[![CI](https://github.com/Ashutosh-Yadav-256/ArchGuard/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchGuard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-116%20passed-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchGuard)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#performance--benchmarks)

---

## What Is ArchGuard?

Architecture documentation in wikis and Notion pages rots because nobody has time to cross-reference static markdown during fast-paced pull request reviews.

**ArchGuard** bridges this gap by turning your engineering playbook into automated, continuous GitHub Checks:

- **Static AST Analysis**: Uses the TypeScript Compiler API for deep syntax inspection, class/method metrics, and cross-layer import graphs.
- **Inline PR Annotations**: Pins exact failure explanations, rationales, and suggested code fixes directly to changed diff lines.
- **Architecture Health Score ($0 - 100$)**: Objectively scores pull request health and optionally blocks merge on architectural debt.
- **Living Documentation Playbook**: Integrates directly with a full Docusaurus engineering guide, explaining _why_ each standard exists and _how_ to remediate it.
- **Expiring Architecture Exceptions**: Declaratively manage technical debt in `.archstandards/config.yaml` with mandatory rationale and expiration dates.

---

## High-Level Architecture

```text
  Developer Opens / Updates PR
               │
               ▼
   [ Fastify Webhook Server ] ── HMAC-SHA256 Timing-Safe Verification
               │
               ▼
    [ GitHub Adapter Layer ] ── Fetches Changed Files & Diffs (Octokit)
               │
               ▼
      [ ArchGuard Core ] ────── AST Parsers & File Classifier
               │
        ┌──────┴──────┐
        ▼             ▼
   [ 18 Rules ]  [ Exceptions ]
        │             │
        └──────┬──────┘
               ▼
     [ Finding Aggregator ] ─── Deductions & Architecture Health Score
               │
               ▼
    [ GitHub Check Run API ] ── Native Annotations & Rich Markdown Table
```

The core engine (`packages/core`, `packages/parsers`, `packages/rules`) is **completely decoupled from GitHub**, allowing standalone CLI runs, local git hook execution, and custom CI pipelines.

---

## The 18 Rule Catalog

ArchGuard ships with 18 built-in rules across five critical engineering domains:

| Domain            | Rule ID    | Standard Description                                                              | Default Severity |
| ----------------- | ---------- | --------------------------------------------------------------------------------- | ---------------- |
| **Architecture**  | `ARCH-001` | Controllers must not import repositories directly (enforce 3-tier layering)       | `error`          |
|                   | `ARCH-002` | Controllers should not contain business logic (>20 lines per method)              | `warning`        |
|                   | `ARCH-003` | Services must not depend on HTTP/web frameworks (Express/Fastify/Koa)             | `error`          |
|                   | `ARCH-004` | Circular dependencies between application modules are forbidden                   | `error`          |
| **API Standards** | `API-001`  | Endpoints must define request input validation (Zod, Joi, Celebrate)              | `warning`        |
|                   | `API-002`  | Public endpoints must declare rate limiting middleware                            | `warning`        |
|                   | `API-003`  | POST resource creation endpoints must return HTTP 201 Created                     | `warning`        |
|                   | `API-004`  | Error responses must follow standard structured schema (RFC 7807)                 | `info`           |
| **Testing**       | `TEST-001` | New service files require corresponding unit test companion files                 | `error`          |
|                   | `TEST-002` | Critical business logic (>15 line methods) requires dedicated tests               | `warning`        |
|                   | `TEST-003` | Repositories must maintain minimum 80% test file coverage ratio                   | `warning`        |
|                   | `TEST-004` | Tests cannot be disabled (`.skip`, `xit`, `xdescribe`) to pass CI                 | `error`          |
| **Security**      | `SEC-001`  | Source files must not contain hardcoded API keys, tokens, or passwords            | `error`          |
|                   | `SEC-002`  | Sensitive credentials (passwords, tokens) must not be output in logs              | `error`          |
|                   | `SEC-003`  | Database connection strings and endpoints must use environment variables          | `warning`        |
| **Naming**        | `NAME-001` | Classes and interfaces must use PascalCase                                        | `info`           |
|                   | `NAME-002` | Functions and class methods must use camelCase                                    | `info`           |
|                   | `NAME-003` | Boolean variables and properties must use affirmative prefixes (`is`/`has`/`can`) | `info`           |

---

## Performance & Benchmarks

Audited and benchmarked on Node.js v22 with monotonic timers (`performance.now()`):

| Benchmark Test                | Metric / Scale                        | Empirical Measurement                        |
| ----------------------------- | ------------------------------------- | -------------------------------------------- |
| **AST Parser Speed**          | Small files (~100 lines)              | **55,558 lines/sec** (1.73 ms mean)          |
| **AST Parser Speed**          | Large files (~2,000 lines)            | **145,214 lines/sec** (14.5 ms mean)         |
| **AST Parser Speed**          | Massive files (~5,000 lines)          | **136,134 lines/sec** (38.6 ms mean)         |
| **Rule Execution Latency**    | Regex / Manifest checks               | **0.002 ms** (up to **493,827 ops/sec**)     |
| **Rule Execution Latency**    | Full AST inspection rules             | **1.1 – 1.7 ms**                             |
| **End-to-End PR Pipeline**    | Small PR (3 files, 161 lines)         | **11.39 ms** (p95: 15.58 ms)                 |
| **End-to-End PR Pipeline**    | Monorepo PR (100 files, ~6,000 lines) | **298.44 ms** (p95: 369.12 ms)               |
| **Webhook HMAC Verification** | Fastify timing-safe crypto            | **0.362 ms** (**2,760 req/sec**)             |
| **Corpus Detection Recall**   | Real test suites                      | **100.0%** (0 false positives on clean code) |

---

## Monorepo Layout

```text
ArchGuard/
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

## Getting Started

### Prerequisites

- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### Installation & Build

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchGuard.git
cd ArchGuard

pnpm install

pnpm build

pnpm test

pnpm benchmark
```

### Running Locally

```bash
pnpm --filter @archstandards/github-app start

pnpm --filter @archstandards/docs start
```

---

## Configuration (`.archstandards/config.yaml`)

ArchGuard is configured declaratively in the root of your target repository:

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

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for local development workflows and [SECURITY.md](SECURITY.md) for vulnerability disclosure.

---

## Support & Contact

For questions, enterprise inquiries, or general support, please contact: **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)**.

---

## License

[MIT](LICENSE) © [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
