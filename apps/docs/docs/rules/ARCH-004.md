---
id: ARCH-004
title: ARCH-004 · Cross-Module Explicit Interfaces
sidebar_label: ARCH-004
---

# ARCH-004: Cross-Module Dependencies Require Explicit Interfaces

| Attribute | Value |
|---|---|
| **Category** | Architecture |
| **Default Severity** | `warning` |
| **Applicable Files** | Service and Controller files |

## Why It Exists (Rationale)

When one domain module directly imports the concrete implementation of another module's service or repository, the boundaries between the two domains collapse. Refactoring the implementation of one module risks breaking external modules.

By enforcing interface-based communication between modules, contracts remain stable, and modules can be independently mocked or extracted into services.

## Bad Example

```typescript
// src/order/OrderService.ts
import { PaymentService } from "../payment/PaymentService"; // ❌ Concrete class import
```

## Good Example

```typescript
// src/order/OrderService.ts
import type { IPaymentService } from "../payment/IPaymentService"; // ✅ Interface contract
```

## How It's Detected

ArchStandards checks relative imports crossing module boundaries. Concrete class imports lacking interface prefixes (`I...`) or suffixes (`...Interface`) trigger a warning.
