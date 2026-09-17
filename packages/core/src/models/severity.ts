/**
 * Severity levels for rule findings.
 *
 * - `info`: Improvement suggestion — reported but doesn't affect PR status
 * - `warning`: Engineering standard violation — flagged in PR
 * - `error`: Blocking architectural/security issue — fails the check
 */
export type Severity = "info" | "warning" | "error";

/**
 * Rule categories that organize rules by engineering domain.
 */
export type RuleCategory = "architecture" | "api" | "testing" | "security" | "naming";

/**
 * File type classification used for rule applicability matching.
 */
export type FileType =
  | "controller"
  | "service"
  | "repository"
  | "test"
  | "config"
  | "middleware"
  | "model"
  | "util"
  | "unknown";

/**
 * Ordered severity levels for comparison (higher index = more severe).
 */
export const SEVERITY_ORDER: readonly Severity[] = ["info", "warning", "error"] as const;

/**
 * Returns true if `a` is at least as severe as `b`.
 */
export function isAtLeastSeverity(a: Severity, b: Severity): boolean {
  return SEVERITY_ORDER.indexOf(a) >= SEVERITY_ORDER.indexOf(b);
}
