import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";
import { parseTypeScript, hasImportFromLayer, isDatabaseImport } from "@archstandards/parsers";

/**
 * ARCH-001: Controllers must not access database directly
 *
 * Controllers should delegate all data access to the service layer.
 * Direct repository or ORM usage from controllers creates tight coupling
 * between the presentation and data layers.
 */
export const ARCH001: Rule = {
  id: "ARCH-001",
  name: "Controllers must not access database directly",
  category: "architecture",
  severity: "error",
  description:
    "Controllers should delegate all data access to the service layer. " +
    "Direct repository or ORM usage from controllers creates tight coupling.",
  documentationUrl: "https://docs.archstandards.dev/rules/ARCH-001",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "controller";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parsed = parseTypeScript(context.file.content, context.file.path);

    // Check for direct repository imports
    const repoImports = hasImportFromLayer(parsed.imports, "repository");
    for (const imp of repoImports) {
      findings.push(
        createFinding({
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          file: context.file.path,
          line: imp.line,
          message: `Controller directly imports repository module "${imp.moduleSpecifier}".`,
          rationale:
            "Controllers should delegate business operations to the service layer. " +
            "Direct repository access from controllers bypasses business logic validation " +
            "and makes the code harder to test and refactor.",
          suggestion:
            "Create or use an existing service class to mediate between the controller " +
            "and the repository. Move the data access into a service method.",
          documentationUrl: this.documentationUrl,
        }),
      );
    }

    // Check for direct ORM/database imports
    for (const imp of parsed.imports) {
      if (isDatabaseImport(imp.moduleSpecifier)) {
        findings.push(
          createFinding({
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            file: context.file.path,
            line: imp.line,
            message: `Controller directly imports database module "${imp.moduleSpecifier}".`,
            rationale:
              "Database libraries should only be used in the repository/data layer. " +
              "Controllers importing ORM or database modules is a strong indicator of " +
              "missing architectural separation.",
            suggestion:
              "Move the database interaction into a repository class, then call it " +
              "through a service class from the controller.",
            documentationUrl: this.documentationUrl,
          }),
        );
      }
    }

    return findings;
  },
};
