---
id: ARCH-003
title: ARCH-003 · Repositories Must Not Depend on Controllers
sidebar_label: ARCH-003
---

# ARCH-003: Repositories Must Not Depend on Controllers

| Attribute | Value |
|---|---|
| **Category** | Architecture |
| **Default Severity** | `error` (Blocking) |
| **Applicable Files** | Repository files (`*.repository.ts`, `*.repo.ts`) |

## Why It Exists (Rationale)

The architectural dependency chain is strictly unidirectional:
`Controller → Service → Repository`.

When a repository imports from a controller:
1. It introduces an **inverted circular dependency**.
2. The data layer cannot be tested or compiled in isolation.
3. Transport types (like Express `Request` or NestJS `Controller`) leak into the persistence layer.

## Bad Example

```typescript
// src/order/OrderRepository.ts
import { OrderController } from "./OrderController"; // ❌

export class OrderRepository {
  async save(data: any, controller: OrderController) {}
}
```

## Good Example

```typescript
// src/order/OrderRepository.ts
import { OrderEntity } from "./OrderEntity"; // ✅ Clean domain entity

export class OrderRepository {
  async save(data: OrderEntity): Promise<OrderEntity> {}
}
```

## How It's Detected

ArchStandards inspects import declarations in all repository files. Imports matching controller files or directory paths (`/controllers/`, `*controller*`) trigger this rule.
