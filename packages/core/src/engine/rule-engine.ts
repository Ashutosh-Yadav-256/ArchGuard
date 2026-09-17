import type { Rule } from "../models/rule.js";
import type { Finding } from "../models/finding.js";
import type { RuleContext } from "../models/review-context.js";

/**
 * Result of evaluating a single rule.
 */
export interface RuleEvaluationResult {
  readonly ruleId: string;
  readonly findings: readonly Finding[];
  readonly durationMs: number;
  readonly error?: string;
}

/**
 * Result of evaluating all applicable rules.
 */
export interface EngineResult {
  readonly results: readonly RuleEvaluationResult[];
  readonly totalFindings: readonly Finding[];
  readonly totalDurationMs: number;
  readonly rulesEvaluated: number;
  readonly rulesFailed: number;
}

/**
 * RuleEngine — executes a set of rules against a context and collects findings.
 *
 * The engine is intentionally simple: it iterates over the given rules,
 * calls evaluate() on each, and collects the results. Error handling
 * ensures that a single failing rule doesn't crash the entire review.
 */
export class RuleEngine {
  /**
   * Evaluate a set of rules against a context.
   *
   * Rules that throw during evaluation are caught and recorded as errors,
   * but don't prevent other rules from running.
   */
  evaluate(rules: readonly Rule[], context: RuleContext): EngineResult {
    const results: RuleEvaluationResult[] = [];
    const allFindings: Finding[] = [];
    let rulesFailed = 0;
    const startTime = performance.now();

    for (const rule of rules) {
      const ruleStart = performance.now();

      try {
        const findings = rule.evaluate(context);
        const durationMs = performance.now() - ruleStart;

        results.push({
          ruleId: rule.id,
          findings,
          durationMs,
        });

        allFindings.push(...findings);
      } catch (error) {
        const durationMs = performance.now() - ruleStart;
        rulesFailed++;

        results.push({
          ruleId: rule.id,
          findings: [],
          durationMs,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const totalDurationMs = performance.now() - startTime;

    return {
      results,
      totalFindings: allFindings,
      totalDurationMs,
      rulesEvaluated: rules.length,
      rulesFailed,
    };
  }
}
