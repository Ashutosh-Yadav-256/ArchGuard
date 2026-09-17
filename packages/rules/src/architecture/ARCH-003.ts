import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";
import { parseTypeScript, hasImportFromLayer } from "@archstandards/parsers";

/**
 * ARCH-003: Repositories must not depend on controllers
 *
 * The dependency flow should be Controller → Service → Repository.
 * Repositories must never import from or reference controller-layer code.
 */
export const ARCH003: Rule = {
  id: "ARCH-003",
  name: "Repositories must not depend on controllers",
  category: "architecture",
  severity: "error",
  description:
    "The dependency flow should be Controller → Service → Repository. " +
    "Repositories must never import from controller-layer code.",
  documentationUrl: "https://docs.archstandards.dev/rules/ARCH-003",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "repository";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parsed = parseTypeScript(context.file.content, context.file.path);

    // Check for controller imports
    const controllerImports = hasImportFromLayer(parsed.imports, "controller");
    for (const imp of controllerImports) {
      findings.push(
        createFinding({
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          file: context.file.path,
          line: imp.line,
          message: `Repository imports controller module "${imp.moduleSpecifier}".`,
          rationale:
            "Inverted dependencies create circular relationships and make it " +
            "impossible to use the data layer independently. This violates the " +
            "Dependency Inversion Principle. The correct flow is: " +
            "Controller → Service → Repository.",
          suggestion:
            "Remove the controller import. If you need shared types, extract them " +
            "into a shared models/types package that both layers can depend on.",
          documentationUrl: this.documentationUrl,
        }),
      );
    }

    return findings;
  },
};
