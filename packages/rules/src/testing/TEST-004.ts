import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * TEST-004: Tests cannot be disabled to pass CI
 *
 * Detects `.skip`, `xit`, `xdescribe`, and other patterns that disable tests.
 */
const DISABLED_PATTERNS = [
  { pattern: /\b(?:it|test)\.skip\s*\(/g, label: ".skip" },
  { pattern: /\bxit\s*\(/g, label: "xit" },
  { pattern: /\bxdescribe\s*\(/g, label: "xdescribe" },
  { pattern: /\bxtest\s*\(/g, label: "xtest" },
  { pattern: /\bdescribe\.skip\s*\(/g, label: "describe.skip" },
  { pattern: /\btest\.skip\s*\(/g, label: "test.skip" },
  { pattern: /\bpending\s*\(\s*['"]/g, label: "pending()" },
];

export const TEST004: Rule = {
  id: "TEST-004",
  name: "Tests cannot be disabled to pass CI",
  category: "testing",
  severity: "error",
  description: "Test files must not contain disabled tests that were skipped to make CI pass.",
  documentationUrl: "https://docs.archstandards.dev/rules/TEST-004",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "test";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      for (const { pattern, label } of DISABLED_PATTERNS) {
        // Reset regex lastIndex for global patterns
        pattern.lastIndex = 0;

        if (pattern.test(line)) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: lineNum,
              message: `Disabled test found using "${label}".`,
              rationale:
                "Disabled tests are broken windows. They signal that test quality " +
                "doesn't matter, and they accumulate until the test suite is no longer trustworthy.",
              suggestion:
                "Either fix the test so it passes, or remove it entirely. " +
                "Leaving disabled tests in the codebase is technical debt.",
              documentationUrl: this.documentationUrl,
            }),
          );
          break; // One finding per line
        }
      }
    }

    return findings;
  },
};
