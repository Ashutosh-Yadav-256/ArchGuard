---
id: NAME-001
title: NAME-001 · Classes Use PascalCase
sidebar_label: NAME-001
---

# NAME-001: Classes Must Use PascalCase

| Attribute | Value |
|---|---|
| **Category** | Naming Standards |
| **Default Severity** | `info` |
| **Applicable Files** | All TypeScript/JavaScript files |

## Why It Exists (Rationale)

Consistent casing conventions reduce cognitive load when navigating complex codebases. `PascalCase` (UpperCamelCase) is the ubiquitous industry standard for class and interface identifiers in TypeScript and JavaScript.
- Distinguishes types and constructors immediately from variable instances and methods.
- Prevents confusing constructor invocations (e.g. `new orderService()` vs `new OrderService()`).
- Matches TypeScript compiler diagnostic expectations and standard linting configurations.

## Bad Example

```typescript
// ❌ lowercase or snake_case class identifiers
export class payment_processor {
  process() {}
}

export class orderManager {
  manage() {}
}
```

## Good Example

```typescript
// ✅ PascalCase class identifiers
export class PaymentProcessor {
  process() {}
}

export class OrderManager {
  manage() {}
}
```

## How It's Detected

ArchStandards extracts all class declarations from TypeScript ASTs and verifies that the identifier matches the pattern `^[A-Z][a-zA-Z0-9]*$`.

## Exception Configuration

```yaml
exceptions:
  - rule: "NAME-001"
    path: "src/generated/**"
    reason: "Third-party protobuf / OpenAPI code generator emits snake_case classes."
```
