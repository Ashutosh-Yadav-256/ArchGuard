---
id: service-boundaries
title: Cross-Module Service Boundaries
sidebar_label: Service Boundaries
---

# Cross-Module Service Boundaries

## Modular Monoliths & Microservices

In systems containing multiple domains (e.g., `orders`, `billing`, `inventory`, `notifications`), direct cross-module coupling breaks boundary isolation:

```
❌ Violating Boundary:
OrderService.ts ──(imports concrete class)──> PaymentService.ts

✅ Proper Boundary:
OrderService.ts ──(imports interface)───────> IPaymentService.ts
                                                     ▲
                                                     │ (implements)
PaymentService.ts ───────────────────────────────────┘
```

## Policy Requirements

- Cross-module dependencies must depend on explicit interfaces (e.g., `IPaymentService` or `PaymentInterface`) rather than concrete service or repository classes.
- This allows individual modules to be mocked in tests and later extracted into independent microservices with minimal friction.
- Enforced by rule **`ARCH-004`**.
