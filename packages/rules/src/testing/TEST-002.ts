import type { Rule, RuleContext, Finding, ReviewFile } from "@archstandards/core";
import { createFinding } from "@archstandards/core";
import { parseTypeScript } from "@archstandards/parsers";

/**
 * TEST-002: Critical business logic requires tests
 *
 * Service methods with high complexity should have dedicated test cases.
 */
const COMPLEXITY_THRESHOLD = 15;

export const TEST002: Rule = {
  id: "TEST-002",
  name: "Critical business logic requires tests",
  category: "testing",
  severity: "warning",
  description:
    "Methods containing complex conditional logic should have dedicated test cases.",
  documentationUrl: "https://docs.archstandards.dev/rules/TEST-002",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "service";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parsed = parseTypeScript(context.file.content, context.file.path);

    for (const cls of parsed.classes) {
      for (const method of cls.methods) {
        if (method.lineCount > COMPLEXITY_THRESHOLD) {
          // Check if there's a corresponding test
          const hasTest = context.allFiles.some(
            (f: ReviewFile) =>
              f.fileType === "test" &&
              f.content.includes(method.name),
          );

          if (!hasTest) {
            findings.push(
              createFinding({
                ruleId: this.id,
                ruleName: this.name,
                severity: this.severity,
                file: context.file.path,
                line: method.line,
                message:
                  `Complex method "${method.name}" (${method.lineCount} lines) has no test coverage.`,
                rationale:
                  "Complex logic has exponentially more failure modes. Without tests, " +
                  "you're relying on manual verification, which doesn't scale.",
                suggestion:
                  `Add unit tests for "${method.name}" covering the main paths and edge cases.`,
                documentationUrl: this.documentationUrl,
              }),
            );
          }
        }
      }
    }

    return findings;
  },
};
