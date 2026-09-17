# Architecture

## Design Philosophy

ArchStandards follows a **hexagonal architecture** (ports and adapters) pattern. The core engine is completely independent of any external platform — GitHub, GitLab, or any other code hosting service.

This architectural decision is intentional and documented here because it demonstrates a key principle: **the most important business logic should not depend on infrastructure**.

## System Overview

```
┌──────────────────────────────────────────────────────┐
│                    Adapters                           │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  GitHub   │  │   CLI    │  │  Future Adapters  │  │
│  │ Adapter   │  │ Adapter  │  │  (GitLab, etc.)   │  │
│  └─────┬─────┘  └─────┬────┘  └────────┬──────────┘  │
│        │              │                │              │
│        └──────────────┼────────────────┘              │
│                       │                               │
│                       ▼                               │
│           ┌──────────────────────┐                    │
│           │  Review Orchestrator │                    │
│           └──────────┬───────────┘                    │
│                      │                                │
│           ┌──────────▼───────────┐                    │
│           │     Policy Engine     │                    │
│           │                      │                    │
│           │  ┌────────────────┐  │                    │
│           │  │  Rule Registry │  │                    │
│           │  └────────┬───────┘  │                    │
│           │           │          │                    │
│           │  ┌────────▼───────┐  │                    │
│           │  │  Rule Selector │  │                    │
│           │  └────────┬───────┘  │                    │
│           │           │          │                    │
│           │  ┌────────▼───────┐  │                    │
│           │  │  Rule Engine   │  │                    │
│           │  └────────┬───────┘  │                    │
│           │           │          │                    │
│           │  ┌────────▼────────┐ │                    │
│           │  │ Finding Aggreg. │ │                    │
│           │  └─────────────────┘ │                    │
│           └──────────────────────┘                    │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │              Parsers                           │   │
│  │  ┌────────────┐  ┌───────────┐  ┌──────────┐  │   │
│  │  │ TypeScript │  │ File      │  │ Language │  │   │
│  │  │ Parser     │  │ Classifier│  │ Detector │  │   │
│  │  └────────────┘  └───────────┘  └──────────┘  │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Package Dependency Graph

```
@archstandards/github-app
    ├── @archstandards/core
    ├── @archstandards/rules
    ├── @archstandards/parsers
    └── @archstandards/github-adapter
            └── @archstandards/core

@archstandards/rules
    ├── @archstandards/core
    └── @archstandards/parsers

@archstandards/parsers
    └── (no internal dependencies)

@archstandards/core
    └── (no internal dependencies)
```

### Dependency Rules

1. **`core` depends on nothing** — it defines interfaces and the engine
2. **`parsers` depends on nothing** — it provides language analysis
3. **`rules` depends on `core` and `parsers`** — it implements specific rules
4. **`github-adapter` depends on `core`** — it adapts findings to GitHub API
5. **`github-app` depends on everything** — it wires the system together

## Data Flow

```
Webhook Event
    │
    ▼
Validate Signature ──── Reject if invalid
    │
    ▼
Create Review Context
    │
    ▼
Load Repository Config (.archstandards/config.yaml)
    │
    ▼
Fetch Changed Files (via GitHub API)
    │
    ▼
Classify Files (controller / service / repository / test)
    │
    ▼
Select Applicable Rules (based on config + file types)
    │
    ▼
Evaluate Rules Against Files
    │
    ▼
Apply Exceptions (skip rules matching exception paths)
    │
    ▼
Aggregate Findings
    │
    ▼
Calculate Score (0-100)
    │
    ▼
Publish to GitHub
    ├── Inline review comments
    ├── PR summary comment
    └── Check run status
```

## Key Design Decisions

### 1. Rule Engine Independence

The rule engine knows nothing about GitHub. It takes file contents and produces findings. This means:
- Rules can be tested with simple unit tests (no mocking GitHub)
- The engine can be reused in a CLI tool, IDE plugin, or other platforms
- Adding GitLab/Bitbucket support requires only a new adapter

### 2. Policy-as-Code

Rules are defined in YAML and validated at runtime with Zod schemas. This means:
- Teams can version their standards alongside their code
- Rules can be enabled/disabled per repository
- Exception paths allow gradual migration
- Policy changes are reviewed in pull requests, just like code

### 3. Async Webhook Processing

The webhook handler returns `202 Accepted` immediately and processes the review asynchronously. This ensures:
- GitHub's 10-second webhook timeout is never hit
- Multiple PRs can be processed concurrently
- Failed reviews can be retried

### 4. Monorepo Structure

Using pnpm workspaces with clean package boundaries because:
- Each package has a clear responsibility
- Dependencies are explicit and enforced
- Packages can be versioned independently
- Testing is isolated per package

## Security Architecture

- **Webhook Authentication:** HMAC SHA-256 signature verification on every request
- **GitHub Authentication:** App JWT → Installation access token (short-lived, auto-rotated)
- **Secrets:** Environment variables only, never committed
- **Permissions:** Least-privilege (`contents:read`, `pull_requests:write`, `checks:write`)
- **Source Code:** Analyzed in-memory, never persisted to disk
- **Logging:** Pino with redaction paths for sensitive fields
