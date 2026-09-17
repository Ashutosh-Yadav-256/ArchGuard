import type { Rule, RuleContext, Finding, ReviewFile } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * TEST-003: Minimum test coverage threshold
 *
 * This rule is a placeholder for coverage-report-based analysis.
 * In practice, it would parse coverage reports. For now, it checks
 * the ratio of test files to source files.
 */
const DEFAULT_THRESHOLD = 80;

export const TEST003: Rule = {
  id: "TEST-003",
  name: "Minimum test coverage threshold",
  category: "testing",
  severity: "warning",
  description:
    "The project should maintain a minimum test coverage threshold of 80%.",
  documentationUrl: "https://docs.archstandards.dev/rules/TEST-003",

  applies(context: RuleContext): boolean {
    // This rule applies at the project level — evaluate once on any file
    return context.file.fileType === "service" || context.file.fileType === "controller";
  },

  evaluate(context: RuleContext): Finding[] {
    // This is a heuristic check: count service/controller files vs test files
    const sourceFiles = context.allFiles.filter(
      (f: ReviewFile) => f.fileType === "service" || f.fileType === "controller",
    );
    const testFiles = context.allFiles.filter((f: ReviewFile) => f.fileType === "test");

    if (sourceFiles.length === 0) return [];

    const coverage = (testFiles.length / sourceFiles.length) * 100;

    if (coverage < DEFAULT_THRESHOLD) {
      return [
        createFinding({
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          file: context.file.path,
          line: 1,
          message:
            `Test file ratio is ${Math.round(coverage)}% ` +
            `(${testFiles.length} test files for ${sourceFiles.length} source files). ` +
            `Threshold: ${DEFAULT_THRESHOLD}%.`,
          rationale:
            "Coverage thresholds prevent gradual erosion of test quality. " +
            "80% is a pragmatic target — high enough to catch most regressions.",
          suggestion: "Add test files for new service and controller files in this PR.",
          documentationUrl: this.documentationUrl,
        }),
      ];
    }

    return [];
  },
};
