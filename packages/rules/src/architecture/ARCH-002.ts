import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";
import { parseTypeScript } from "@archstandards/parsers";

/**
 * ARCH-002: Business logic belongs in service layer
 *
 * Controllers should be thin — handling HTTP concerns only. Complex
 * conditionals, data transformations, and business rules belong in services.
 *
 * Detection: Flags controller methods with high line count (> 20 lines)
 * or complex logic, which indicates business logic leaking into controllers.
 */
const MAX_CONTROLLER_METHOD_LINES = 20;

export const ARCH002: Rule = {
  id: "ARCH-002",
  name: "Business logic belongs in service layer",
  category: "architecture",
  severity: "warning",
  description:
    "Controllers should be thin, handling HTTP concerns only. " +
    "Complex logic in controllers indicates business logic should be moved to a service.",
  documentationUrl: "https://docs.archstandards.dev/rules/ARCH-002",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "controller";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parsed = parseTypeScript(context.file.content, context.file.path);

    for (const cls of parsed.classes) {
      for (const method of cls.methods) {
        if (method.lineCount > MAX_CONTROLLER_METHOD_LINES) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: method.line,
              endLine: method.endLine,
              message:
                `Controller method "${method.name}" is ${method.lineCount} lines long ` +
                `(threshold: ${MAX_CONTROLLER_METHOD_LINES}). This likely contains business logic ` +
                `that should be in a service class.`,
              rationale:
                "Fat controllers are one of the most common anti-patterns. They make code " +
                "untestable (you need HTTP context to test business logic) and create " +
                "duplication when the same logic is needed from multiple endpoints.",
              suggestion:
                `Extract the business logic from "${method.name}" into a service method. ` +
                `The controller should only parse the request, call the service, and format the response.`,
              documentationUrl: this.documentationUrl,
            }),
          );
        }
      }
    }

    return findings;
  },
};
