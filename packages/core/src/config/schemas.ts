import { z } from "zod";

/**
 * Zod schemas for validating ArchStandards configuration files.
 * All YAML configs are parsed and validated at runtime before use.
 */

// ─── Severity & Category ───────────────────────────────────────

export const SeveritySchema = z.enum(["info", "warning", "error"]);

export const RuleCategorySchema = z.enum([
  "architecture",
  "api",
  "testing",
  "security",
  "naming",
]);

// ─── Rule Definition (from policy YAML) ────────────────────────

export const RuleDefinitionSchema = z.object({
  id: z
    .string()
    .regex(
      /^[A-Z]+-\d{3}$/,
      "Rule ID must match pattern: CATEGORY-NNN (e.g., ARCH-001)",
    ),
  name: z.string().min(1),
  category: RuleCategorySchema,
  severity: SeveritySchema,
  applies_to: z.array(z.string()).min(1),
  description: z.string().min(1),
  detection: z.string().min(1),
  rationale: z.string().min(1),
  threshold: z.number().optional(),
});

export const RulePolicyFileSchema = z.object({
  rules: z.array(RuleDefinitionSchema),
});

// ─── Exception Definition ──────────────────────────────────────

export const ExceptionSchema = z.object({
  rule: z
    .string()
    .regex(/^[A-Z]+-\d{3}$/, "Exception rule ID must match pattern: CATEGORY-NNN"),
  path: z.string().min(1),
  reason: z.string().min(1),
  expires: z.string().optional(),
});

// ─── Scoring Configuration ─────────────────────────────────────

export const ScoringSchema = z.object({
  base: z.number().min(0).max(100).default(100),
  deductions: z
    .object({
      error: z.number().min(0).default(15),
      warning: z.number().min(0).default(5),
      info: z.number().min(0).default(1),
    })
    .default({}),
  floor: z.number().min(0).default(0),
});

// ─── Policy Configuration ──────────────────────────────────────

export const PolicySchema = z.object({
  fail_on: z.array(SeveritySchema).default(["error"]),
  warn_on: z.array(SeveritySchema).default(["warning"]),
  report: z.array(SeveritySchema).default(["info"]),
});

// ─── Rules Include/Exclude ─────────────────────────────────────

export const RulesFilterSchema = z.object({
  include: z.array(z.string()).default(["*"]),
  exclude: z.array(z.string()).default([]),
});

// ─── Top-Level Config (.archstandards/config.yaml) ─────────────

export const ArchStandardsConfigSchema = z.object({
  version: z.string().default("1.0"),
  rules: RulesFilterSchema.default({}),
  policy: PolicySchema.default({}),
  scoring: ScoringSchema.default({}),
  exceptions: z.array(ExceptionSchema).default([]),
});

// ─── Type Exports ──────────────────────────────────────────────

export type ArchStandardsConfig = z.infer<typeof ArchStandardsConfigSchema>;
export type PolicyConfig = z.infer<typeof PolicySchema>;
export type ScoringConfig = z.infer<typeof ScoringSchema>;
export type ExceptionConfig = z.infer<typeof ExceptionSchema>;
export type RulesFilter = z.infer<typeof RulesFilterSchema>;
export type RuleDefinitionConfig = z.infer<typeof RuleDefinitionSchema>;
