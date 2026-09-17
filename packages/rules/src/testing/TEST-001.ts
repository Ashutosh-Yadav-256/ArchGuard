import type { Rule, RuleContext, Finding, ReviewFile } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * TEST-001: New services require unit tests
 *
 * Every service file in the PR must have a corresponding test file.
 */
export const TEST001: Rule = {
  id: "TEST-001",
  name: "New services require unit tests",
  category: "testing",
  severity: "error",
  description:
    "Every new service file must have a corresponding test file. " +
    "Services contain business logic — the most valuable code to test.",
  documentationUrl: "https://docs.archstandards.dev/rules/TEST-001",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "service";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const servicePath = context.file.path;

    // Look for a corresponding test file in the PR
    const testPatterns = generateTestPatterns(servicePath);

    const hasTest = context.allFiles.some((f: ReviewFile) => {
      if (f.path === servicePath || f.fileType !== "test") {
        return false;
      }
      const normalizedPath = "/" + f.path.replace(/\\/g, "/");
      return testPatterns.some(
        (pattern) =>
          normalizedPath.includes("/" + pattern) || normalizedPath.endsWith("/" + pattern),
      );
    });

    if (!hasTest) {
      findings.push(
        createFinding({
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          file: servicePath,
          line: 1,
          message: `Service file has no corresponding test file.`,
          rationale:
            "Service-layer tests are the highest-ROI tests in any application. " +
            "They test business logic without HTTP concerns, are fast to run, " +
            "and catch the most impactful bugs.",
          suggestion: `Create a test file at one of: ${testPatterns.slice(0, 2).join(", ")}`,
          documentationUrl: this.documentationUrl,
        }),
      );
    }

    return findings;
  },
};

/**
 * Generate possible test file paths for a given source file.
 */
function generateTestPatterns(sourcePath: string): string[] {
  const normalized = sourcePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const fileName = parts.pop() ?? "";
  const baseName = fileName.replace(/\.(ts|js|tsx|jsx)$/, "");

  return [
    `${baseName}.test.ts`,
    `${baseName}.spec.ts`,
    `${baseName}.test.js`,
    `${baseName}.spec.js`,
    `__tests__/${baseName}.ts`,
    `__tests__/${baseName}.js`,
    `tests/${baseName}.ts`,
    `tests/${baseName}.js`,
    `${baseName}.test`,
    `${baseName}.spec`,
  ];
}
