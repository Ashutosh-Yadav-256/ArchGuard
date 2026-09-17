---
id: NAME-002
title: NAME-002 · Functions Use camelCase
sidebar_label: NAME-002
---

# NAME-002: Functions and Methods Must Use camelCase

| Attribute            | Value                           |
| -------------------- | ------------------------------- |
| **Category**         | Naming Standards                |
| **Default Severity** | `info`                          |
| **Applicable Files** | All TypeScript/JavaScript files |

## Why It Exists (Rationale)

`camelCase` is the idiomatic standard for function, method, and variable names in JavaScript and TypeScript. Consistent casing:

- Eliminates stylistic debate across teams and PR reviews.
- Differentiates callable instances and functions from class constructors (`PascalCase`) and constants (`UPPER_SNAKE_CASE`).
- Preserves clean interop across open-source libraries and frameworks.

## Bad Example

```typescript
// ❌ snake_case or PascalCase function names
function Calculate_Tax(amount: number): number {
  return amount * 0.2;
}

class InvoiceService {
  Generate_Monthly_Invoice() {
    // ...
  }
}
```

## Good Example

```typescript
// ✅ camelCase function and method names
function calculateTax(amount: number): number {
  return amount * 0.2;
}

class InvoiceService {
  generateMonthlyInvoice() {
    // ...
  }
}
```

## How It's Detected

ArchStandards extracts function declarations and class methods from the AST (skipping constructors and private fields) and asserts that identifiers match `^[a-z][a-zA-Z0-9]*$`.

## Exception Configuration

```yaml
exceptions:
  - rule: "NAME-002"
    path: "src/database/migrations/**"
    reason: "Database migration hooks follow framework-specific snake_case conventions."
```
