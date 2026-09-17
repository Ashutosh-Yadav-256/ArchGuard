import type { Finding } from "./finding.js";
import type { RuleContext } from "./review-context.js";
import type { RuleCategory, Severity } from "./severity.js";

/**
 * Core Rule interface — the contract every rule must implement.
 *
 * Rules are the fundamental building blocks of ArchStandards.
 * Each rule:
 * - Has a unique ID (e.g., "ARCH-001")
 * - Belongs to a category (architecture, api, testing, security, naming)
 * - Has a severity level (info, warning, error)
 * - Determines whether it applies to a given file context
 * - Evaluates the file and produces zero or more findings
 *
 * Rules must be pure functions of their input context — they should
 * not have side effects, access the network, or depend on GitHub.
 */
export interface Rule {
  /** Unique rule identifier (e.g., "ARCH-001") */
  readonly id: string;

  /** Human-readable rule name */
  readonly name: string;

  /** Engineering domain this rule belongs to */
  readonly category: RuleCategory;

  /** How severe a violation of this rule is */
  readonly severity: Severity;

  /** Description of what this rule checks */
  readonly description: string;

  /** URL to the documentation page for this rule */
  readonly documentationUrl: string;

  /**
   * Determines whether this rule should be evaluated against the given context.
   * Rules should return false early for files they don't apply to (e.g., an
   * architecture rule that only applies to controllers returns false for test files).
   */
  applies(context: RuleContext): boolean;

  /**
   * Evaluates the rule against the given context and returns any findings.
   * Returns an empty array if no violations are detected.
   */
  evaluate(context: RuleContext): Finding[];
}

/**
 * Rule definition from YAML policy configuration.
 * This is the serialized form — rules are loaded from YAML and
 * matched against registered Rule implementations.
 */
export interface RuleDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: RuleCategory;
  readonly severity: Severity;
  readonly applies_to: readonly string[];
  readonly description: string;
  readonly detection: string;
  readonly rationale: string;
  readonly threshold?: number;
}
