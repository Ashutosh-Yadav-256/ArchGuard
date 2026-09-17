import type { ReviewContext, RuleContext } from "../models/review-context.js";
import type { ReviewReport, AppliedExceptionInfo } from "../models/review-report.js";
import type { Finding } from "../models/finding.js";
import type { ArchStandardsConfig } from "../config/schemas.js";
import { checkException } from "../config/exceptions.js";
import { RuleEngine } from "../engine/rule-engine.js";
import { RuleSelector } from "../engine/rule-selector.js";
import { RuleRegistry } from "../engine/rule-registry.js";
import { FindingAggregator } from "./finding-aggregator.js";

/**
 * ReviewPipeline — the main orchestration layer that connects all components.
 *
 * This is the single entry point for running a complete review:
 *
 * 1. Load config
 * 2. For each file:
 *    a. Create RuleContext
 *    b. Select applicable rules
 *    c. Evaluate rules
 *    d. Apply exceptions
 * 3. Aggregate all findings
 * 4. Build report
 */
export class ReviewPipeline {
  private readonly registry: RuleRegistry;
  private readonly selector: RuleSelector;
  private readonly engine: RuleEngine;
  private readonly aggregator: FindingAggregator;

  constructor(registry: RuleRegistry) {
    this.registry = registry;
    this.selector = new RuleSelector(registry);
    this.engine = new RuleEngine();
    this.aggregator = new FindingAggregator();
  }

  getRegistry(): RuleRegistry {
    return this.registry;
  }

  /**
   * Execute a complete review of a pull request.
   *
   * @param context - The review context (PR metadata + changed files)
   * @param config - The validated ArchStandards configuration
   * @returns A complete ReviewReport
   */
  execute(context: ReviewContext, config: ArchStandardsConfig): ReviewReport {
    const allFindings: Finding[] = [];
    const appliedExceptions: AppliedExceptionInfo[] = [];
    let rulesEvaluated = 0;

    for (const file of context.files) {
      // Build the context for this file
      const ruleContext: RuleContext = {
        file,
        allFiles: context.files,
        owner: context.owner,
        repo: context.repo,
        pullNumber: context.pullNumber,
        commitSha: context.commitSha,
      };

      // Select applicable rules
      const applicableRules = this.selector.select(ruleContext, config.rules);
      rulesEvaluated += applicableRules.length;

      // Evaluate rules
      const result = this.engine.evaluate(applicableRules, ruleContext);

      // Apply exceptions to findings
      for (const finding of result.totalFindings) {
        const exceptionMatch = checkException(
          finding.ruleId,
          finding.file,
          config.exceptions,
        );

        if (exceptionMatch.matched) {
          // Finding is exempted — record it but don't include in violations
          appliedExceptions.push({
            ruleId: finding.ruleId,
            path: finding.file,
            reason: exceptionMatch.exception?.reason ?? "Unknown",
            expires: exceptionMatch.exception?.expires,
          });
        } else {
          // Finding stands — include in report
          allFindings.push(finding);
        }
      }
    }

    // Build the complete report
    return this.aggregator.build({
      owner: context.owner,
      repo: context.repo,
      pullNumber: context.pullNumber,
      commitSha: context.commitSha,
      findings: allFindings,
      scoringConfig: config.scoring,
      policyConfig: config.policy,
      appliedExceptions,
      filesAnalyzed: context.files.length,
      rulesEvaluated,
    });
  }
}
