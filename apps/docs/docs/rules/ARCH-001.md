---
id: ARCH-001
title: ARCH-001 · No Direct Database Access from Controllers
sidebar_label: ARCH-001
---

# ARCH-001: Controllers Must Not Access Database Directly

| Attribute | Value |
|---|---|
| **Category** | Architecture |
| **Default Severity** | `error` (Blocking) |
| **Applicable Files** | Controller files (`*.controller.ts`, `*.handler.ts`) |

## Why It Exists (Rationale)

Controllers are responsible exclusively for the presentation layer: deserializing incoming HTTP requests, executing input validation, invoking domain services, and formatting HTTP responses.

When controllers query databases directly (via ORM or repositories):
1. **Tight Coupling**: Presentation logic is entangled with database schema details.
2. **Untestable Business Logic**: Verification requires mocking HTTP requests and database queries simultaneously.
3. **Duplication**: Common queries cannot be reused across different entry points (e.g. background queue workers, CLI commands, webhooks).

## Bad Example

```typescript
import { OrderRepository } from "../repositories/OrderRepository";

export class OrderController {
  constructor(private orderRepo: OrderRepository) {}

  async getOrder(req, res) {
    // ❌ Direct database access inside controller
    const order = await this.orderRepo.findById(req.params.id);
    return res.json(order);
  }
}
```

## Good Example

```typescript
import { OrderService } from "../services/OrderService";

export class OrderController {
  constructor(private orderService: OrderService) {}

  async getOrder(req, res) {
    // ✅ Delegates to domain service
    const order = await this.orderService.getOrder(req.params.id);
    return res.json(order);
  }
}
```

## How It's Detected

ArchStandards inspects imports in all files classified as controllers. Imports from repositories (`*Repository`, `*Repo`), database modules (`../repositories/*`), or direct ORM packages (`typeorm`, `prisma`, `mongoose`, `knex`) trigger this rule.

## Configuration & Exceptions

```yaml
exceptions:
  - rule: ARCH-001
    path: src/legacy/legacy.controller.ts
    reason: "Pending migration to service layer"
    expires: "2026-12-31"
```
