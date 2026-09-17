import type { Finding } from "../models/finding.js";
import type { CategorySummary, ReviewReport, AppliedExceptionInfo } from "../models/review-report.js";
import type { RuleCategory } from "../models/severity.js";
import type { ScoringConfig, PolicyConfig } from "../config/schemas.js";

const ALL_CATEGORIES: readonly RuleCategory[] = [
  "architecture",
  "api",
  "testing",
  "security",
  "naming",
] as const;

/**
 * FindingAggregator — processes raw findings into a scored, categorized ReviewReport.
 *
 * Responsibilities:
 * 1. Group findings by category
 * 2. Calculate score based on severity deductions
 * 3. Determine pass/fail/warn status based on policy
 * 4. Build category summaries
 */
export class FindingAggregator {
  /**
   * Build a complete review report from raw findings.
   */
  build(params: {
    owner: string;
    repo: string;
    pullNumber: number;
    commitSha: string;
    findings: readonly Finding[];
    scoringConfig: ScoringConfig;
    policyConfig: PolicyConfig;
    appliedExceptions: readonly AppliedExceptionInfo[];
    filesAnalyzed: number;
    rulesEvaluated: number;
  }): ReviewReport {
    const { findings, scoringConfig, policyConfig } = params;

    const categorySummaries = this.buildCategorySummaries(findings);
    const score = this.calculateScore(findings, scoringConfig);
    const status = this.determineStatus(findings, policyConfig);

    return {
      owner: params.owner,
      repo: params.repo,
      pullNumber: params.pullNumber,
      commitSha: params.commitSha,
      findings,
      score,
      categorySummaries,
      status,
      failOn: policyConfig.fail_on,
      appliedExceptions: params.appliedExceptions,
      filesAnalyzed: params.filesAnalyzed,
      rulesEvaluated: params.rulesEvaluated,
      timestamp: new Date(),
    };
  }

  /**
   * Build summaries for each rule category.
   */
  private buildCategorySummaries(findings: readonly Finding[]): readonly CategorySummary[] {
    return ALL_CATEGORIES.map((category) => {
      const categoryFindings = findings.filter((f) => {
        const prefix = f.ruleId.split("-")[0]?.toLowerCase();
        return this.categoryMatchesPrefix(category, prefix ?? "");
      });

      const errorCount = categoryFindings.filter((f) => f.severity === "error").length;
      const warningCount = categoryFindings.filter((f) => f.severity === "warning").length;
      const infoCount = categoryFindings.filter((f) => f.severity === "info").length;

      return {
        category,
        errorCount,
        warningCount,
        infoCount,
        totalCount: categoryFindings.length,
      };
    });
  }

  /**
   * Map category to rule ID prefix.
   */
  private categoryMatchesPrefix(category: RuleCategory, prefix: string): boolean {
    const mapping: Record<RuleCategory, string> = {
      architecture: "arch",
      api: "api",
      testing: "test",
      security: "sec",
      naming: "name",
    };
    return mapping[category] === prefix;
  }

  /**
   * Calculate score from 0-100 based on findings and scoring config.
   */
  calculateScore(findings: readonly Finding[], config: ScoringConfig): number {
    let score = config.base;

    for (const finding of findings) {
      const deduction = config.deductions[finding.severity];
      score -= deduction;
    }

    return Math.max(score, config.floor);
  }

  /**
   * Determine overall status based on findings and policy config.
   *
   * - "fail" if any finding has a severity in `fail_on`
   * - "warn" if any finding has a severity in `warn_on`
   * - "pass" otherwise
   */
  determineStatus(
    findings: readonly Finding[],
    config: PolicyConfig,
  ): "pass" | "fail" | "warn" {
    const hasFailing = findings.some((f) =>
      config.fail_on.includes(f.severity),
    );
    if (hasFailing) {
      return "fail";
    }

    const hasWarning = findings.some((f) =>
      config.warn_on.includes(f.severity),
    );
    if (hasWarning) {
      return "warn";
    }

    return "pass";
  }
}
