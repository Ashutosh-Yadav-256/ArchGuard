---
id: configuration-reference
title: Configuration Reference
sidebar_label: Configuration Reference
---

# Configuration Reference

ArchStandards is configured via `.archstandards/config.yaml` located at the root of your repository. All configuration options are strictly validated at runtime using [Zod](https://zod.dev) schemas.

---

## Complete Example

```yaml
version: "1.0"

# Rule Filtering
rules:
  include:
    - "*"           # Enable all 18 rules
  exclude:
    - "NAME-*"      # Optional: disable stylistic naming rules

# Enforcement Policy
policy:
  fail_on:
    - "error"       # Block PR check run if any 'error' is detected
  warn_on:
    - "warning"     # Produce PR annotations for warnings without blocking
  report:
    - "info"        # Informational tips

# Health Scoring Formula
scoring:
  base: 100
  deductions:
    error: 15       # Deduct 15 points per error
    warning: 5      # Deduct 5 points per warning
    info: 1         # Deduct 1 point per info
  floor: 0

# Architecture Exceptions
exceptions:
  - rule: "ARCH-001"
    path: "src/controllers/legacy-export.controller.ts"
    reason: "Direct query optimization required pending database migration."
    expires: "2026-12-31"

  - rule: "TEST-001"
    path: "src/services/experiments/**"
    reason: "Short-lived research prototypes."
```

---

## Schema Reference

### `version`
- **Type**: `string`
- **Default**: `"1.0"`
- **Description**: The schema version of the configuration file.

### `rules`
Controls which rules are active for the repository.

| Field | Type | Default | Description |
|---|---|---|---|
| `include` | `string[]` | `["*"]` | List of rule IDs or glob patterns to activate (e.g. `["ARCH-*", "SEC-*"]`). |
| `exclude` | `string[]` | `[]` | List of rule IDs or glob patterns to disable. |

### `policy`
Defines how findings affect pull request merge status and check runs.

| Field | Type | Default | Description |
|---|---|---|---|
| `fail_on` | `("error" \| "warning" \| "info")[]` | `["error"]` | Severities that fail the GitHub check run and block merge. |
| `warn_on` | `("error" \| "warning" \| "info")[]` | `["warning"]` | Severities that emit warning annotations on the PR diff. |
| `report` | `("error" \| "warning" \| "info")[]` | `["info"]` | Severities included in informational report summaries. |

### `scoring`
Configures the architecture health score calculated for each PR.

| Field | Type | Default | Description |
|---|---|---|---|
| `base` | `number` | `100` | Starting score for pull requests. |
| `deductions.error` | `number` | `15` | Points subtracted per `error` finding. |
| `deductions.warning` | `number` | `5` | Points subtracted per `warning` finding. |
| `deductions.info` | `number` | `1` | Points subtracted per `info` finding. |
| `floor` | `number` | `0` | Minimum possible score. |

### `exceptions`
A list of explicit, documented architecture debt exceptions.

| Field | Type | Required | Description |
|---|---|---|---|
| `rule` | `string` | **Yes** | The rule ID being bypassed (e.g. `ARCH-001`). Must match `CATEGORY-NNN`. |
| `path` | `string` | **Yes** | Relative path or glob pattern to the exempt file (e.g. `src/legacy/**/*.ts`). |
| `reason` | `string` | **Yes** | Mandatory justification describing why the standard cannot yet be met. |
| `expires` | `string` | No | Optional ISO date (`YYYY-MM-DD`). Once this date passes, the exception expires and findings resume. |

---

## Overriding in Monorepos

In monorepos with diverse service requirements, package-specific `.archstandards/config.yaml` files can be placed inside individual package directories (e.g. `packages/billing/.archstandards/config.yaml`), merging package-specific exceptions with repository defaults.
