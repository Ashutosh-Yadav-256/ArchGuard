---
id: TEST-002
title: TEST-002 · Critical Business Logic Requires Tests
sidebar_label: TEST-002
---

# TEST-002: Critical Business Logic Requires Tests

| Attribute            | Value                          |
| -------------------- | ------------------------------ |
| **Category**         | Testing Standards              |
| **Default Severity** | `warning`                      |
| **Applicable Files** | Service files (`*.service.ts`) |

## Why It Exists (Rationale)

Functions and methods exhibiting high complexity (more than 15 lines of branching logic, multiple calculations, state mutations) contain significantly more potential execution paths and failure modes. When developers add complex methods to existing services without adding dedicated test assertions referencing those methods, regression risks escalate dramatically.

Manual inspection during code reviews often overlooks subtle conditional combinations; automated tests guarantee that key branches execute as intended.

## Bad Example

```typescript
// src/services/discount.service.ts
export class DiscountService {
  // ❌ Complex method (over 15 lines) with no tests referencing calculateTierDiscount
  calculateTierDiscount(user: User, cart: Cart): number {
    let rate = 0;
    if (user.isVip) {
      rate += 0.15;
      if (cart.total > 500) {
        rate += 0.05;
      }
    } else if (user.isLoyaltyMember) {
      if (cart.itemCount >= 5) {
        rate += 0.08;
      } else {
        rate += 0.04;
      }
    } else if (cart.couponCode === "SUMMER") {
      rate += 0.1;
    }
    if (user.daysRegistered < 30) {
      rate = Math.max(rate, 0.1);
    }
    return rate;
  }
}
```

## Good Example

```typescript
// tests/discount.service.test.ts
describe("DiscountService", () => {
  it("applies VIP and high-value cart bonus discounts", () => {
    const service = new DiscountService();
    const discount = service.calculateTierDiscount(vipUser, cartOver500);
    expect(discount).toBe(0.2);
  });
});
```

## How It's Detected

ArchStandards parses the Abstract Syntax Tree (AST) of service classes. If any method exceeds 15 lines in length, the engine inspects all companion test files in the PR context to confirm the method name is referenced.

## Exception Configuration

```yaml
exceptions:
  - rule: "TEST-002"
    path: "src/services/legacy-pricing.service.ts"
    reason: "Legacy method slated for deprecation next sprint."
```
