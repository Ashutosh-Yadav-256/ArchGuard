import type { Finding } from "./finding.js";
import type { RuleCategory, Severity } from "./severity.js";

/**
 * Summary for a single rule category in the review report.
 */
export interface CategorySummary {
  readonly category: RuleCategory;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly infoCount: number;
  readonly totalCount: number;
}

/**
 * Exception that was matched and applied during review.
 */
export interface AppliedExceptionInfo {
  readonly ruleId: string;
  readonly path: string;
  readonly reason: string;
  readonly expires?: string;
}

/**
 * Complete review report produced by the review pipeline.
 * This is the final output — ready to be formatted for any output adapter.
 */
export interface ReviewReport {
  /** Repository owner */
  readonly owner: string;

  /** Repository name */
  readonly repo: string;

  /** PR number */
  readonly pullNumber: number;

  /** Commit SHA that was reviewed */
  readonly commitSha: string;

  /** All findings from the review */
  readonly findings: readonly Finding[];

  /** Score from 0-100 */
  readonly score: number;

  /** Summary breakdown by category */
  readonly categorySummaries: readonly CategorySummary[];

  /** Overall review status */
  readonly status: "pass" | "fail" | "warn";

  /** Severity levels that cause failure */
  readonly failOn: readonly Severity[];

  /** Exceptions that were applied */
  readonly appliedExceptions: readonly AppliedExceptionInfo[];

  /** Total files analyzed */
  readonly filesAnalyzed: number;

  /** Total rules evaluated */
  readonly rulesEvaluated: number;

  /** Timestamp of the review */
  readonly timestamp: Date;
}
