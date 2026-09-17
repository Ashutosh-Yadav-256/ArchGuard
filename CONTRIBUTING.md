# Contributing to ArchStandards

Thank you for your interest in contributing to ArchStandards! This document outlines the development workflow, code standards, and how to add new rules.

## Development Setup

### Prerequisites

- Node.js ≥ 20.0.0
- pnpm ≥ 9.0.0

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Ashutosh-Yadav-256/ArchGuard.git
cd ArchGuard

# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Project Structure

This is a **pnpm monorepo** with clean package boundaries:

| Package                   | Purpose                  | Dependencies  |
| ------------------------- | ------------------------ | ------------- |
| `packages/core`           | Engine, models, pipeline | None          |
| `packages/parsers`        | TypeScript AST analysis  | None          |
| `packages/rules`          | Rule implementations     | core, parsers |
| `packages/github-adapter` | GitHub API formatting    | core          |
| `apps/github-app`         | Webhook server           | All packages  |
| `apps/docs`               | Documentation site       | None          |

## Adding a New Rule

### 1. Define the Rule

Create a YAML definition in `policies/rules/<category>.yaml`:

```yaml
rules:
  - id: ARCH-005
    name: Your rule name
    severity: warning
    applies_to:
      - service
    description: >
      Clear description of what this rule checks.
```

### 2. Implement the Rule

Create `packages/rules/src/<category>/ARCH-005.ts`:

```typescript
import type { Rule, RuleContext, Finding } from "@archstandards/core";

export const ARCH005: Rule = {
  id: "ARCH-005",
  name: "Your rule name",
  category: "architecture",
  severity: "warning",
  description: "Clear description",
  documentationUrl: "https://docs.archstandards.dev/rules/ARCH-005",

  applies(context: RuleContext): boolean {
    // Return true if this rule should run on this file
    return context.fileType === "service";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    // Your detection logic here
    return findings;
  },
};
```

### 3. Register the Rule

Add to `packages/rules/src/<category>/index.ts`:

```typescript
export { ARCH005 } from "./ARCH-005.js";
```

### 4. Add Tests

Create `packages/rules/tests/<category>/ARCH-005.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { ARCH005 } from "../../src/architecture/ARCH-005.js";

describe("ARCH-005", () => {
  it("should detect violation in bad code", () => {
    // Test with violating code
  });

  it("should pass clean code", () => {
    // Test with correct code
  });
});
```

### 5. Add Documentation

Create `apps/docs/docs/rules/ARCH-005.md`:

```markdown
# ARCH-005: Your Rule Name

## Why This Rule Exists

Explain the engineering principle.

## Bad Example

Show violating code with explanation.

## Good Example

Show correct code with explanation.

## Exceptions

When it's acceptable to skip this rule.

## Detection

How the rule identifies violations.
```

### 6. Add Test Fixtures

Add examples to `examples/good/` and `examples/bad/`.

## Code Standards

- **TypeScript** for all source code
- **Vitest** for all tests
- **Prettier** for formatting (run `pnpm format`)
- **ESLint** for linting (run `pnpm lint`)
- **Conventional Commits** for commit messages

### Commit Message Format

```
type(scope): description

feat(rules): add ARCH-005 cross-module interface rule
fix(core): handle empty file list in rule selector
test(rules): add edge cases for SEC-001
docs(rules): add ARCH-005 documentation page
```

## Pull Request Process

1. Create a feature branch from `main`
2. Implement your changes with tests
3. Ensure all checks pass (`pnpm test && pnpm typecheck && pnpm lint`)
4. Submit a PR with a clear description
5. Address review feedback

## Questions & Support

For questions, feedback, or support, please email **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)** or open an issue on GitHub.
