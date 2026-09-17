---
id: TEST-004
title: TEST-004 · Tests Cannot Be Disabled to Pass CI
sidebar_label: TEST-004
---

# TEST-004: Tests Cannot Be Disabled to Pass CI

| Attribute            | Value                                 |
| -------------------- | ------------------------------------- |
| **Category**         | Testing Standards                     |
| **Default Severity** | `error`                               |
| **Applicable Files** | Test files (`*.test.ts`, `*.spec.ts`) |

## Why It Exists (Rationale)

Disabling failing tests using modifiers like `.skip()`, `xit()`, or `xdescribe()` under pressure to pass CI pipelines creates invisible technical debt and broken windows:

- It masks regressions and gives a false sense of security.
- Developers often forget to un-skip tests after shipping features.
- Critical assertions stop executing silently.

If a test is truly obsolete due to deliberate architectural refactoring, it should be deleted or completely re-written with appropriate assertions, rather than left skipped in version control.

## Bad Example

```typescript
// ❌ Disabling tests to bypass failing CI
describe("PaymentGateway", () => {
  it.skip("charges credit card with 3DS verification", async () => {
    // Failing after API update
  });

  xit("handles refund idempotency", async () => {
    // Skipped
  });
});
```

## Good Example

```typescript
// ✅ Tests are either fixed, mocked properly, or deleted if deprecated
describe("PaymentGateway", () => {
  it("charges credit card with 3DS verification", async () => {
    const gateway = new PaymentGateway(mock3DSProvider);
    const result = await gateway.charge(100, validCard);
    expect(result.status).toBe("success");
  });
});
```

## How It's Detected

ArchStandards scans all test files for expressions such as:

- `it.skip(`, `test.skip(`, `describe.skip(`
- `xit(`, `xtest(`, `xdescribe(`
- `pending()`

## Exception Configuration

```yaml
exceptions:
  - rule: "TEST-004"
    path: "tests/integration/external-sandbox.test.ts"
    reason: "Upstream third-party sandbox is currently undergoing scheduled maintenance."
```
