---
id: TEST-003
title: TEST-003 · Minimum Test Coverage Threshold
sidebar_label: TEST-003
---

# TEST-003: Minimum Test Coverage Threshold

| Attribute | Value |
|---|---|
| **Category** | Testing Standards |
| **Default Severity** | `warning` |
| **Applicable Files** | Service & Controller files |

## Why It Exists (Rationale)

Codebases without explicit coverage safeguards inevitably suffer from coverage erosion over time. While 100% line coverage is often impractical or yields diminishing returns, maintaining at least an **80% ratio** ensures that the majority of critical paths, domain calculations, and controllers remain verified by automated CI checks.

ArchStandards tracks the ratio of test files relative to primary domain files (services and controllers) in each pull request to enforce proactive test maintenance.

## Bad Example

```text
PR Changes:
- src/services/auth.service.ts
- src/services/user.service.ts
- src/services/token.service.ts
- src/controllers/user.controller.ts
- src/controllers/auth.controller.ts
(5 source files, 0 test files -> 0% ratio)
// ❌ Violates the 80% coverage/test file ratio requirement
```

## Good Example

```text
PR Changes:
- src/services/user.service.ts
- src/services/user.service.test.ts
- src/controllers/user.controller.ts
- src/controllers/user.controller.test.ts
(2 source files, 2 test files -> 100% ratio)
// ✅ Exceeds 80% threshold
```

## How It's Detected

ArchStandards calculates the ratio of test files (`fileType === "test"`) to core implementation files (`service` and `controller`). If the ratio falls below 80%, a warning finding is recorded.

## Exception Configuration

```yaml
exceptions:
  - rule: "TEST-003"
    path: "src/services/**"
    reason: "Repository-wide refactoring branch; full test suite will be updated in Phase 2."
```
