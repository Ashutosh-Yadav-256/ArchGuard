import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";
import { parseTypeScript } from "@archstandards/parsers";

/**
 * NAME-001: Classes use PascalCase
 */
const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;

export const NAME001: Rule = {
  id: "NAME-001",
  name: "Classes use PascalCase",
  category: "naming",
  severity: "info",
  description: "Class names should use PascalCase (e.g., OrderService, UserRepository).",
  documentationUrl: "https://docs.archstandards.dev/rules/NAME-001",

  applies(_context: RuleContext): boolean {
    return true;
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parsed = parseTypeScript(context.file.content, context.file.path);

    for (const cls of parsed.classes) {
      if (!PASCAL_CASE.test(cls.name)) {
        findings.push(
          createFinding({
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            file: context.file.path,
            line: cls.line,
            message: `Class "${cls.name}" does not use PascalCase.`,
            rationale:
              "PascalCase for classes immediately distinguishes them from variables " +
              "and functions, making code self-documenting.",
            suggestion: `Rename to "${toPascalCase(cls.name)}".`,
            documentationUrl: this.documentationUrl,
          }),
        );
      }
    }

    return findings;
  },
};

function toPascalCase(str: string): string {
  return str
    .replace(/[_-](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toUpperCase());
}
