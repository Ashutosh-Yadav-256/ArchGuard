---
id: layered-architecture
title: Layered Architecture Standard
sidebar_label: Layered Architecture
---

# Layered Architecture Standard

## Purpose & Scope

In backend services, maintaining strict layering ensures that business logic is decoupled from transport protocols (HTTP/gRPC) and persistence mechanisms (PostgreSQL, Redis, DynamoDB).

```
┌──────────────────────────────────────────────────────────┐
│  Presentation Layer (Controllers, Webhook Handlers)       │
│  - Parses HTTP requests & validates input schemas        │
│  - Delegates to Service Layer                            │
│  - Returns HTTP status codes & standard responses        │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│  Domain / Service Layer (Services, Use Cases)            │
│  - Implements core business logic & workflows            │
│  - Free of HTTP framework types (no req, res, express)   │
│  - Calls Repository interfaces for persistence           │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│  Data Access Layer (Repositories, ORM Mappings)          │
│  - Encapsulates database queries & persistence details   │
│  - Returns pure domain entities / typed models           │
└──────────────────────────────────────────────────────────┘
```

## Mandatory Requirements

1. **Controllers must never access the database directly**:
   - Controllers must not import ORM packages (`typeorm`, `prisma`, `mongoose`, `knex`, `pg`).
   - Controllers must not import repository classes or execute SQL/queries.
   - Enforced by rule **`ARCH-001`**.

2. **Controllers must be thin**:
   - Controller action methods should contain fewer than 20 lines of code.
   - Conditional branching, loops, and calculations belong in the service layer.
   - Enforced by rule **`ARCH-002`**.

3. **Repositories must never depend on controllers**:
   - Repositories must never import from the presentation layer.
   - Enforced by rule **`ARCH-003`**.
