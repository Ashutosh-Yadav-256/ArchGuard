---
id: intro
title: Welcome to ArchStandards
slug: /
---

# ArchStandards — Architecture Governance Platform

> **A policy-as-code engineering playbook and automated PR review platform that prevents architectural erosion.**

## The Problem

Every engineering organization begins with good architectural intentions:

- Clean layer separation (Controller → Service → Repository)
- Consistent REST APIs with proper HTTP status codes
- Comprehensive test coverage of domain business logic
- Strict secrets management and configuration hygiene

As teams grow and release cadence increases, **architectural erosion** sets in. Deadlines lead to shortcuts:

- Controllers directly querying database ORMs
- Catch blocks swallowing exceptions and returning HTTP 200
- Complex business logic accumulating in controllers without tests
- Credentials and plaintext passwords logged into observability pipelines

Manual code reviews fail to catch these reliably because reviewers focus on business features, not architectural constraints.

## The ArchStandards Solution

ArchStandards transforms your engineering standards into **executable, versioned policy-as-code**:

1. **Versioned Engineering Playbook**: Standard operating guidelines for architecture, API conventions, testing, and security.
2. **Automated GitHub Reviewer**: Every PR is analyzed in memory using AST parsing and static analysis.
3. **Actionable Feedback**: Inline PR comments explain _what_ violated the policy, _why_ the standard exists, and _how_ to refactor it, with direct links back to this documentation playbook.
4. **Scored Quality Gates**: Each PR receives an architectural health score (0–100) and check-run status to gate merges.

---

## Core Pillars

| Domain           | Focus Area                                                        | Enforced Rules          |
| ---------------- | ----------------------------------------------------------------- | ----------------------- |
| **Architecture** | Layer isolation, dependency inversion, module boundaries          | `ARCH-001` → `ARCH-004` |
| **API Design**   | REST semantics, status codes, standard RFC-7807 error schema      | `API-001` → `API-004`   |
| **Testing**      | Service test requirements, complexity coverage, CI test disabling | `TEST-001` → `TEST-004` |
| **Security**     | Secrets scanning, log sanitization, 12-factor env configuration   | `SEC-001` → `SEC-003`   |
| **Naming**       | PascalCase classes, camelCase methods, clear boolean prefixes     | `NAME-001` → `NAME-003` |

---

## Getting Started in Your Repository

Add `.archstandards/config.yaml` to your repository:

```yaml
version: "1.0"

rules:
  include:
    - architecture/*
    - api/*
    - testing/*
    - security/*
    - naming/*
  exclude: []

policy:
  fail_on:
    - error
  warn_on:
    - warning
  report:
    - info

exceptions:
  - rule: ARCH-001
    path: src/legacy/**
    reason: "Pending migration to service layer (Q4 initiative)"
    expires: "2026-12-31"
```

Install the ArchStandards GitHub App and open a pull request.
