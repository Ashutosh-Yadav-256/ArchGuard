---
id: TEST-001
title: TEST-001 · New Services Require Unit Tests
sidebar_label: TEST-001
---

# TEST-001: New Services Require Unit Tests

| Attribute | Value |
|---|---|
| **Category** | Testing Standards |
| **Default Severity** | `error` |
| **Applicable Files** | Service files (`*.service.ts`) |

## Why It Exists (Rationale)

In a layered architecture, services house the core domain calculations, transaction handling, state machines, and business rules of an application. Service-layer tests represent the highest Return on Investment (ROI) among automated tests:
- They run purely in-memory and execute in milliseconds.
- They do not require spinning up HTTP servers, browsers, or network proxies.
- They directly validate business correctness under boundary and edge-case conditions.

Introducing a new service file without an accompanying unit test file directly increases technical debt and introduces untested failure modes into production.

## Bad Example

```text
PR File Changes:
├── src/services/billing.service.ts   (Created)
└── src/controllers/billing.controller.ts (Created)
// ❌ No billing.service.test.ts or tests/billing.service.ts included in PR
```

## Good Example

```text
PR File Changes:
├── src/services/billing.service.ts        (Created)
├── src/services/billing.service.test.ts   (Created)
└── src/controllers/billing.controller.ts  (Created)
```

```typescript
// src/services/billing.service.test.ts
import { describe, it, expect } from "vitest";
import { BillingService } from "./billing.service.js";

describe("BillingService", () => {
  it("computes prorated charge accurately across leap months", () => {
    const service = new BillingService();
    const result = service.calculateProration(100, 15, 30);
    expect(result).toBe(50);
  });
});
```

## How It's Detected

For every file classified as a `service` in the pull request, ArchStandards evaluates the file manifest of the PR to ensure a corresponding test file exists matching standard test naming patterns (`<name>.test.ts`, `<name>.spec.ts`, `tests/<name>.ts`, `__tests__/<name>.ts`).

## Exception Configuration

```yaml
exceptions:
  - rule: "TEST-001"
    path: "src/services/experimental-stub.service.ts"
    reason: "Prototype service under active research spike; tests deferred to follow-up PR."
```
