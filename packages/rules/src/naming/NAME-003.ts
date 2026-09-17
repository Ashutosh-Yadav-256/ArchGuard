import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";
import { parseTypeScript } from "@archstandards/parsers";

/**
 * NAME-003: Boolean variables use is/has/can prefixes
 */
const BOOLEAN_PREFIXES = /^(is|has|can|should|will|was|did|does|are)[A-Z]/;

export const NAME003: Rule = {
  id: "NAME-003",
  name: "Boolean variables use is/has/can prefixes",
  category: "naming",
  severity: "info",
  description:
    "Boolean variables and properties should use prefixes like is, has, can, should.",
  documentationUrl: "https://docs.archstandards.dev/rules/NAME-003",

  applies(_context: RuleContext): boolean {
    return true;
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parsed = parseTypeScript(context.file.content, context.file.path);

    // Check class properties
    for (const cls of parsed.classes) {
      for (const prop of cls.properties) {
        if (prop.isBoolean && !BOOLEAN_PREFIXES.test(prop.name)) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: prop.line,
              message:
                `Boolean property "${cls.name}.${prop.name}" should use a prefix like is/has/can.`,
              rationale:
                'A variable named "active" is ambiguous — is it a boolean, a string, or an object? ' +
                '"isActive" is immediately clear. This convention makes conditionals read like English.',
              suggestion: `Rename to "is${capitalize(prop.name)}" or "has${capitalize(prop.name)}".`,
              documentationUrl: this.documentationUrl,
            }),
          );
        }
      }
    }

    // Check variable declarations
    for (const v of parsed.variables) {
      if (v.isBoolean && !BOOLEAN_PREFIXES.test(v.name)) {
        findings.push(
          createFinding({
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            file: context.file.path,
            line: v.line,
            message:
              `Boolean variable "${v.name}" should use a prefix like is/has/can.`,
            rationale:
              'Boolean variables without prefixes are ambiguous. "isActive" reads better than "active" in conditionals.',
            suggestion: `Rename to "is${capitalize(v.name)}" or "has${capitalize(v.name)}".`,
            documentationUrl: this.documentationUrl,
          }),
        );
      }
    }

    return findings;
  },
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
