---
id: ARCH-002
title: ARCH-002 · Business Logic Belongs in Service Layer
sidebar_label: ARCH-002
---

# ARCH-002: Business Logic Belongs in Service Layer

| Attribute            | Value                                                |
| -------------------- | ---------------------------------------------------- |
| **Category**         | Architecture                                         |
| **Default Severity** | `warning`                                            |
| **Applicable Files** | Controller files (`*.controller.ts`, `*.handler.ts`) |

## Why It Exists (Rationale)

"Fat controllers" are one of the most widespread anti-patterns in backend web development. When calculations, business discounts, or multi-step workflow rules are written directly inside route handlers, they cannot be tested without an HTTP server harness, and cannot be invoked from non-HTTP triggers (such as event consumers or cron jobs).

## Bad Example

```typescript
export class OrderController {
  async checkout(req, res) {
    // ❌ Complex calculations & business logic in controller method (>20 lines)
    let discount = 0;
    if (user.isVip) {
      discount = 0.2;
    } else if (order.total > 100) {
      discount = 0.1;
    }
    // ... extensive logic
    return res.json({ finalPrice });
  }
}
```

## Good Example

```typescript
export class OrderController {
  constructor(private orderService: OrderService) {}

  async checkout(req, res) {
    // ✅ Controller only extracts parameters and delegates to service
    const finalPrice = await this.orderService.calculateCheckout(req.user, req.body);
    return res.json({ finalPrice });
  }
}
```

## How It's Detected

ArchStandards computes method line counts and AST branching metrics in controller files. Methods exceeding 20 lines with conditional logic trigger a warning.
