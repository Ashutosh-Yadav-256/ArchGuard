<div align="center">

# ArchGuard

**Policy-as-Code Architecture Governance Platform**

<p align="justify">
ArchGuard is an automated architecture governance engine that continuously reviews pull requests against a versioned engineering playbook, prevents architectural erosion, and delivers actionable, syntax-aware feedback directly into developer workflows.
</p>

[![CI](https://github.com/Ashutosh-Yadav-256/ArchGuard/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchGuard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-110%20passing-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchGuard)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#performance--benchmarks)

---

[English](README.md) | [简体中文](docs/translations/README.zh-CN.md) | [日本語](docs/translations/README.ja.md) | [한국어](docs/translations/README.ko.md) | [Русский](docs/translations/README.ru.md) | [Français](docs/translations/README.fr.md) | [हिन्दी](docs/translations/README.hi.md) | [Español](docs/translations/README.es.md) | [Deutsch](docs/translations/README.de.md) | [Português](docs/translations/README.pt.md) | [العربية](docs/translations/README.ar.md)

---

</div>

## Executive Summary

<p align="justify">
Software architecture specifications documented in static wikis, Notion databases, or design documents suffer from systematic documentation rot. In high-throughput engineering teams, manually cross-referencing static architecture documents during peer pull request reviews is error-prone, subjective, and difficult to sustain. ArchGuard eliminates this vulnerability by codifying architectural standards into executable, deterministic policies enforced on every pull request.
</p>

<p align="justify">
By executing deep Abstract Syntax Tree (AST) traversal via the TypeScript Compiler API, ArchGuard validates strict layer separation, prevents cyclic package dependencies, audits API contract consistency, enforces unit testing ratios, and intercepts unencrypted secrets. Findings are reported as native GitHub Check Runs with inline pull request diff annotations, concrete remediation suggestions, and direct links to a living engineering playbook.
</p>

---

## Core Capabilities

<p align="justify">
ArchGuard is designed as a platform rather than a simple linter. It operates at the architectural tier, evaluating file roles, layer relationships, and cross-module boundaries across the entire pull request changeset.
</p>

- **Static Abstract Syntax Tree Analysis**: Inspects class declarations, decorator metadata, method length metrics, and import declarations using the official TypeScript Compiler API (`ts.createSourceFile`).
- **Layer Boundary Enforcement**: Enforces clean 3-tier layering by prohibiting controllers from bypassing services to access repository and persistence layers directly.
- **Cycle Detection via Graph Algorithms**: Analyzes intra-project dependencies by building a directed import graph and applying Depth-First Search (DFS) cycle-finding algorithms.
- **Inline Pull Request Coaching**: Embeds precise failure rationales, architectural principles, and recommended replacement code directly into changed pull request diff lines.
- **Objective Health Scoring (0 - 100)**: Computes a mathematical health score based on severity weights, enabling configurable automated merge-gating policies.
- **Time-Bound Technical Debt Exceptions**: Manages legacy technical debt declaratively in configuration files with required rationale and mandatory expiration timestamps.

---

## High-Level Architecture

```text
  Developer Opens / Updates Pull Request
                    │
                    ▼
     [ Fastify Webhook Ingestion ] ────── Timing-Safe HMAC-SHA256 Verification
                    │
                    ▼
     [ GitHub Adapter Subsystem ] ─────── Fetches Changed Files & Diffs (Octokit)
                    │
                    ▼
       [ ArchGuard Core Engine ] ──────── File Classification & AST Generation
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    [ 18 Rules ]      [ Exceptions ] ──── Filters Permitted Technical Debt
          │                   │
          └─────────┬─────────┘
                    ▼
       [ Finding Aggregator ] ─────────── Score Calculation & Deductions
                    │
                    ▼
     [ Check Run Publisher API ] ──────── Inline Annotations & Markdown Summary
```

<p align="justify">
The engine follows hexagonal architecture principles. All parsing, evaluation, scoring, and exception handling logic in <code>packages/core</code>, <code>packages/parsers</code>, and <code>packages/rules</code> are completely decoupled from external infrastructure. GitHub integration is isolated strictly within <code>packages/github-adapter</code> and <code>apps/github-app</code>, allowing the core engine to execute in standalone CLIs, pre-commit hooks, and custom CI runners.
</p>

---

## The 18 Rule Catalog

<p align="justify">
ArchGuard ships with eighteen built-in rules organized across five critical software engineering domains:
</p>

| Domain            | Rule ID    | Specification                                              | Severity  | Remediation Target                                     |
| :---------------- | :--------- | :--------------------------------------------------------- | :-------- | :----------------------------------------------------- |
| **Architecture**  | `ARCH-001` | Controllers must not import repositories directly          | `error`   | Decouple transport from persistence via services       |
|                   | `ARCH-002` | Controllers must not contain business logic (>20 lines)    | `warning` | Delegate processing to dedicated domain services       |
|                   | `ARCH-003` | Services must not depend on HTTP/web transport frameworks  | `error`   | Keep business logic independent of transport protocols |
|                   | `ARCH-004` | Circular dependencies between modules are forbidden        | `error`   | Extract shared interfaces or invert dependencies       |
| **API Standards** | `API-001`  | Endpoints must define input validation schemas             | `warning` | Validate incoming payloads with Zod, Joi, or Celebrate |
|                   | `API-002`  | Public endpoints must declare rate limiting middleware     | `warning` | Protect APIs against denial-of-service and brute force |
|                   | `API-003`  | POST resource creation endpoints must return HTTP 201      | `warning` | Adhere to REST semantics for created resources         |
|                   | `API-004`  | Error responses must follow structured formats (RFC 7807)  | `info`    | Provide uniform error payloads with error codes        |
| **Testing**       | `TEST-001` | Service files require companion unit test files            | `error`   | Guarantee isolated unit coverage for domain services   |
|                   | `TEST-002` | Critical methods (>15 lines) require dedicated test cases  | `warning` | Prevent regression in high-complexity business logic   |
|                   | `TEST-003` | Repositories must maintain minimum 80% test file ratio     | `warning` | Maintain consistent test parity across modules         |
|                   | `TEST-004` | Tests cannot be disabled via skip directives to pass CI    | `error`   | Prevent bypassed quality gates and untested releases   |
| **Security**      | `SEC-001`  | Source files must not contain hardcoded API keys or tokens | `error`   | Extract credentials into secure environment variables  |
|                   | `SEC-002`  | Sensitive credentials must not be emitted to log sinks     | `error`   | Redact authentication payloads before logging          |
|                   | `SEC-003`  | Database connection strings must use environment variables | `warning` | Parameterize connection endpoints per environment      |
| **Naming**        | `NAME-001` | Classes and interfaces must use PascalCase notation        | `info`    | Standardize object-oriented naming conventions         |
|                   | `NAME-002` | Functions and class methods must use camelCase notation    | `info`    | Ensure uniform identifier casing across codebases      |
|                   | `NAME-003` | Boolean identifiers must use affirmative prefixes          | `info`    | Clarify intent using is, has, or can prefixes          |

---

## Abstract Syntax Tree (AST) Internals

<p align="justify">
Unlike string-based pattern matchers, ArchGuard parses TypeScript source text into full syntax trees via <code>ts.createSourceFile</code>. This enables contextual verification impossible with regular expressions:
</p>

- **Contextual Node Traversal**: Examines specific AST node kinds (e.g., `ts.SyntaxKind.ImportDeclaration`, `ts.SyntaxKind.MethodDeclaration`, `ts.SyntaxKind.ClassDeclaration`).
- **Layer Classification**: The file classifier assigns architectural roles (`controller`, `service`, `repository`, `test`, `config`) based on file paths, naming patterns, and AST decorators.
- **Cycle Detection**: Builds an adjacency list from resolved import statements and executes a recursive Depth-First Search with recursion stack tracking to identify back-edges and circular dependency loops.
- **Statement Metrics**: Computes method complexity by traversing node statements rather than counting raw physical lines, preventing false positives caused by formatting or comments.

---

## Performance & Benchmarks

<p align="justify">
Audited and benchmarked on Node.js v22 using monotonic timers (<code>performance.now()</code>) across 3,600 iterations. The engine exhibits linear scaling and zero memory retention:
</p>

| Benchmark Category            | Workload / Scale                            | Measured Metric                              |
| :---------------------------- | :------------------------------------------ | :------------------------------------------- |
| **AST Parser Throughput**     | Small files (~100 lines)                    | **55,558 lines/sec** (1.73 ms mean)          |
| **AST Parser Throughput**     | Large files (~2,000 lines)                  | **145,214 lines/sec** (14.5 ms mean)         |
| **AST Parser Throughput**     | Massive files (~5,000 lines)                | **136,134 lines/sec** (38.6 ms mean)         |
| **Rule Latency**              | Regex and manifest checks                   | **0.002 ms** (up to 493,827 operations/sec)  |
| **Rule Latency**              | Full AST inspection rules                   | **1.1 – 1.7 ms**                             |
| **End-to-End Pipeline**       | Small PR (3 files, 161 lines)               | **11.39 ms** (p95: 15.58 ms)                 |
| **End-to-End Pipeline**       | Large Monorepo PR (100 files, ~6,000 lines) | **298.44 ms** (p95: 369.12 ms)               |
| **Webhook HMAC Verification** | Timing-safe crypto verification             | **0.362 ms** (2,760 requests/sec)            |
| **Memory Leak Detection**     | 50 consecutive full pipeline iterations     | **0 MB retained memory**                     |
| **Detection Recall**          | Real-world test corpus                      | **100.0%** (0 false positives on clean code) |

---

## Monorepo Layout

```text
ArchGuard/
├── apps/
│   ├── github-app/          Fastify webhook ingestion and review orchestrator
│   └── docs/                Docusaurus engineering playbook and rule catalog
├── packages/
│   ├── core/                Domain models, RuleEngine, Registry, and Aggregator
│   ├── rules/               Implementations of all 18 architectural rules
│   ├── parsers/             TypeScript AST parser, File Classifier, Import Graph
│   └── github-adapter/      Octokit PR fetcher, HMAC verifier, Check Run publisher
├── benchmarks/              Empirical performance and scalability test suite
├── examples/                Corpus of compliant and non-compliant code patterns
├── policies/                Default architecture policy specifications
└── docs/                    International translations and documentation assets
```

---

## Getting Started

### Prerequisites

- Node.js version 20.0.0 or higher
- pnpm version 9.0.0 or higher

### Installation & Build

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchGuard.git
cd ArchGuard
pnpm install
pnpm build
pnpm test
pnpm benchmark
```

### Local Execution

```bash
pnpm --filter @archstandards/github-app start
pnpm --filter @archstandards/docs start
```

---

## Declarative Configuration

<p align="justify">
ArchGuard is configured in the root of target repositories via <code>.archstandards/config.yaml</code>. The schema is validated at runtime using Zod:
</p>

```yaml
version: "1.0"

rules:
  include:
    - "*"
  exclude:
    - "NAME-003"

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

### Health Score Calculation

<p align="justify">
The pull request Architecture Health Score is calculated deterministically as:
</p>

$$\text{Score} = \max\left(0,\, 100 - (15 \times E + 5 \times W + 1 \times I)\right)$$

<p align="justify">
Where <code>E</code> represents error findings, <code>W</code> represents warnings, and <code>I</code> represents informational suggestions. If any finding matches a configured <code>fail_on</code> severity, the GitHub Check Run conclusion is set to failure, preventing pull request merge.
</p>

---

## Security Model

<p align="justify">
ArchGuard is architected with strict security-by-default principles:
</p>

- **HMAC SHA-256 Validation**: Webhook payloads are verified against the configured secret using `crypto.timingSafeEqual` before parsing, preventing timing attacks and unauthorized request spoofing.
- **In-Memory Analysis**: Source code diffs are evaluated in-memory only. Files are never persisted to local disk or intermediate databases.
- **Short-Lived Access Tokens**: Authenticates against GitHub using short-lived GitHub App installation tokens generated from an RSA private key.
- **Credential Redaction**: Logging pipelines configure redaction filters to prevent tokens, secrets, or authorization headers from appearing in log streams.
- **Least-Privilege Scopes**: Requests only the minimum required GitHub permissions: `Pull requests (write)`, `Checks (write)`, `Contents (read)`, and `Metadata (read)`.

---

## Global Deployment

- **Webhook Service (`apps/github-app`)**: Containerized via the root [Dockerfile](Dockerfile) for zero-configuration deployment to Render, Railway, Fly.io, or Google Cloud Run.
- **Playbook Documentation (`apps/docs`)**: Automated continuous deployment via [.github/workflows/deploy-docs.yml](.github/workflows/deploy-docs.yml) to GitHub Pages at [https://Ashutosh-Yadav-256.github.io/ArchGuard/](https://Ashutosh-Yadav-256.github.io/ArchGuard/).

---

## Contributing

<p align="justify">
Contributions are welcome. Please consult <a href="CONTRIBUTING.md">CONTRIBUTING.md</a> for local development workflows and code conventions, and <a href="SECURITY.md">SECURITY.md</a> for vulnerability disclosure guidelines.
</p>

---

## Support & Contact

For technical inquiries, enterprise integration, or questions, please contact: **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)**.

---

## License

[MIT](LICENSE) (c) 2026 [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
