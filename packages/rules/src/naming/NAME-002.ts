import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";
import { parseTypeScript } from "@archstandards/parsers";

/**
 * NAME-002: Functions use camelCase
 */
const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;

export const NAME002: Rule = {
  id: "NAME-002",
  name: "Functions use camelCase",
  category: "naming",
  severity: "info",
  description: "Function and method names should use camelCase.",
  documentationUrl: "https://docs.archstandards.dev/rules/NAME-002",

  applies(_context: RuleContext): boolean {
    return true;
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parsed = parseTypeScript(context.file.content, context.file.path);

    // Check standalone functions
    for (const func of parsed.functions) {
      if (!CAMEL_CASE.test(func.name)) {
        findings.push(
          createFinding({
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            file: context.file.path,
            line: func.line,
            message: `Function "${func.name}" does not use camelCase.`,
            rationale:
              "camelCase for functions is the established JavaScript/TypeScript convention. " +
              "Mixing naming styles creates inconsistency.",
            suggestion: `Rename to "${toCamelCase(func.name)}".`,
            documentationUrl: this.documentationUrl,
          }),
        );
      }
    }

    // Check class methods
    for (const cls of parsed.classes) {
      for (const method of cls.methods) {
        // Skip constructor and private methods starting with #
        if (method.name === "constructor" || method.name.startsWith("#")) continue;

        if (!CAMEL_CASE.test(method.name)) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: method.line,
              message: `Method "${cls.name}.${method.name}" does not use camelCase.`,
              rationale:
                "camelCase for methods is the standard TypeScript convention.",
              suggestion: `Rename to "${toCamelCase(method.name)}".`,
              documentationUrl: this.documentationUrl,
            }),
          );
        }
      }
    }

    return findings;
  },
};

function toCamelCase(str: string): string {
  return str
    .replace(/[_-](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toLowerCase());
}
