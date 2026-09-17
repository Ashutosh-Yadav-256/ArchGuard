// ─── Models ────────────────────────────────────────────────────
export type { Finding } from "./models/finding.js";
export { createFinding } from "./models/finding.js";
export type { Rule, RuleDefinition } from "./models/rule.js";
export type { RuleContext, ReviewContext, ReviewFile } from "./models/review-context.js";
export type {
  ReviewReport,
  CategorySummary,
  AppliedExceptionInfo,
} from "./models/review-report.js";
export type { Severity, RuleCategory, FileType } from "./models/severity.js";
export { SEVERITY_ORDER, isAtLeastSeverity } from "./models/severity.js";

// ─── Config ────────────────────────────────────────────────────
export {
  ArchStandardsConfigSchema,
  PolicySchema,
  ScoringSchema,
  ExceptionSchema,
  RuleDefinitionSchema,
  RulePolicyFileSchema,
  SeveritySchema,
  RuleCategorySchema,
  RulesFilterSchema,
} from "./config/schemas.js";
export type {
  ArchStandardsConfig,
  PolicyConfig,
  ScoringConfig,
  ExceptionConfig,
  RulesFilter,
  RuleDefinitionConfig,
} from "./config/schemas.js";
export { loadConfig, mergeWithDefaults, DEFAULT_CONFIG } from "./config/policy-loader.js";
export { checkException, matchesGlob } from "./config/exceptions.js";

// ─── Engine ────────────────────────────────────────────────────
export { RuleRegistry } from "./engine/rule-registry.js";
export { RuleSelector } from "./engine/rule-selector.js";
export { RuleEngine } from "./engine/rule-engine.js";
export type { RuleEvaluationResult, EngineResult } from "./engine/rule-engine.js";

// ─── Pipeline ──────────────────────────────────────────────────
export { FindingAggregator } from "./pipeline/finding-aggregator.js";
export { ReviewPipeline } from "./pipeline/review-pipeline.js";
