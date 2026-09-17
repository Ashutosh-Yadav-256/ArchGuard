import type { Severity } from "./severity.js";

/**
 * A single violation or suggestion produced by a rule evaluation.
 *
 * Every finding is self-contained: it includes the violation description,
 * the rationale for why the rule exists, an optional fix suggestion, and
 * a link to the full documentation page.
 */
export interface Finding {
  /** Rule identifier (e.g., "ARCH-001") */
  readonly ruleId: string;

  /** Rule name for display */
  readonly ruleName: string;

  /** Severity of this finding */
  readonly severity: Severity;

  /** File path relative to repository root */
  readonly file: string;

  /** Line number where the violation occurs (1-indexed) */
  readonly line: number;

  /** Column number where the violation starts (1-indexed, optional) */
  readonly column?: number;

  /** End line for multi-line violations (optional) */
  readonly endLine?: number;

  /** What's wrong — concise description of the violation */
  readonly message: string;

  /** Why it matters — engineering rationale for the rule */
  readonly rationale: string;

  /** How to fix it — actionable suggestion (optional) */
  readonly suggestion?: string;

  /** Link to the full documentation page for this rule */
  readonly documentationUrl: string;
}

/**
 * Creates a new Finding with all required fields.
 */
export function createFinding(params: {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  file: string;
  line: number;
  message: string;
  rationale: string;
  documentationUrl: string;
  column?: number;
  endLine?: number;
  suggestion?: string;
}): Finding {
  return { ...params };
}
