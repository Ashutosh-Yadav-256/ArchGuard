---
id: unit-testing
title: Unit Testing Standards
sidebar_label: Unit Testing
---

# Unit Testing Standards

## Principles

Unit tests verify the correctness of isolated business logic without requiring database connections, external APIs, or network sockets.

## Requirements

1. **New Services Require Tests**:
   - Every service file introduced in a pull request must have a corresponding test file (e.g. `OrderService.test.ts` or `OrderService.spec.ts`).
   - Services hold domain business logic, which represents the highest ROI for unit tests.
   - Enforced by rule **`TEST-001`**.

2. **Complex Logic Must Have Dedicated Test Cases**:
   - Methods containing extensive branching, loops, or complex business calculations (>15 lines) must have targeted test cases covering boundary conditions.
   - Enforced by rule **`TEST-002`**.

3. **No Disabled Tests to Pass CI**:
   - Tests must not be bypassed or ignored using `.skip`, `xit`, or `xdescribe` to force CI checks to pass.
   - Enforced by rule **`TEST-004`**.
