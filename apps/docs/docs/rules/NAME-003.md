---
id: NAME-003
title: NAME-003 · Boolean Variables Use is/has/can Prefixes
sidebar_label: NAME-003
---

# NAME-003: Boolean Variables Must Use Affirmative Prefixes

| Attribute | Value |
|---|---|
| **Category** | Naming Standards |
| **Default Severity** | `info` |
| **Applicable Files** | All TypeScript/JavaScript files |

## Why It Exists (Rationale)

A bare variable or property name like `active`, `enabled`, or `valid` can be ambiguous: is it a boolean status flag, an active user object, or an enabled configuration array?

Prefixing boolean identifiers with affirmative verbs (`is`, `has`, `can`, `should`, `will`, `was`, `did`, `does`, `are`):
- Makes conditional statements read intuitively like natural language (`if (user.isActive)` vs `if (user.active)`).
- Instantly communicates primitive boolean intent without requiring type inspection.
- Avoids negative prefix confusions (e.g. `isNotDisabled = false`).

## Bad Example

```typescript
// ❌ Ambiguous boolean names without prefixes
class Subscription {
  active: boolean = true;
  trial: boolean = false;
  renew: boolean = true;
}

const verified = false;
if (verified) {
  // ...
}
```

## Good Example

```typescript
// ✅ Explicit affirmative boolean prefixes
class Subscription {
  isActive: boolean = true;
  hasTrial: boolean = false;
  canRenew: boolean = true;
}

const isVerified = false;
if (isVerified) {
  // ...
}
```

## How It's Detected

ArchStandards inspects AST variable declarations and class properties with explicit boolean types or boolean literal initializers, asserting that the identifier begins with one of: `is`, `has`, `can`, `should`, `will`, `was`, `did`, `does`, `are` followed by an uppercase letter.

## Exception Configuration

```yaml
exceptions:
  - rule: "NAME-003"
    path: "src/types/vendor-payload.ts"
    reason: "Upstream third-party webhook schema uses unprefixed boolean properties."
```
