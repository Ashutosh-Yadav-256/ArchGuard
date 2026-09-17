import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";
import { parseTypeScript, classifyImportLayer } from "@archstandards/parsers";

/**
 * ARCH-004: Cross-module dependencies require explicit interfaces
 *
 * When one module depends on another module's service or repository,
 * it should import a type/interface rather than the concrete class directly.
 * This enforces module boundaries and enables testing with mocks.
 */
export const ARCH004: Rule = {
  id: "ARCH-004",
  name: "Cross-module dependencies require explicit interfaces",
  category: "architecture",
  severity: "warning",
  description:
    "Cross-module dependencies should use explicit interfaces rather than " +
    "importing concrete implementations directly.",
  documentationUrl: "https://docs.archstandards.dev/rules/ARCH-004",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "service" || context.file.fileType === "controller";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parsed = parseTypeScript(context.file.content, context.file.path);

    // Get the current file's module (e.g., "order" from "src/order/OrderService.ts")
    const currentModule = extractModuleName(context.file.path);
    if (!currentModule) return findings;

    for (const imp of parsed.imports) {
      // Skip external packages
      if (!imp.moduleSpecifier.startsWith(".") && !imp.moduleSpecifier.startsWith("/")) {
        continue;
      }

      // Skip imports from the same module
      const importModule = extractModuleFromImportPath(context.file.path, imp.moduleSpecifier);
      if (!importModule || importModule === currentModule) {
        continue;
      }

      // Check if importing a concrete service/repository from another module
      const layer = classifyImportLayer(imp.moduleSpecifier);
      if (layer === "service" || layer === "repository") {
        // Check if the import names suggest concrete classes (not interfaces/types)
        const concreteImports = imp.namedImports.filter(
          (name: string) => !name.startsWith("I") && !name.endsWith("Interface") && !name.endsWith("Type"),
        );

        if (concreteImports.length > 0) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: imp.line,
              message:
                `Cross-module import of concrete implementation "${concreteImports.join(", ")}" ` +
                `from module "${importModule}".`,
              rationale:
                "Coupling to concrete implementations across module boundaries makes " +
                "refactoring dangerous and testing difficult. Interfaces define contracts " +
                "that can evolve independently.",
              suggestion:
                `Define an interface (e.g., I${concreteImports[0]}) in a shared types file or ` +
                `the target module's public API, and import that instead.`,
              documentationUrl: this.documentationUrl,
            }),
          );
        }
      }
    }

    return findings;
  },
};

/**
 * Extract the module name from a file path.
 * e.g., "src/order/OrderService.ts" → "order"
 */
function extractModuleName(filePath: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");

  // Look for src/ prefix and take the next directory
  const srcIndex = parts.indexOf("src");
  if (srcIndex >= 0 && srcIndex + 1 < parts.length) {
    return parts[srcIndex + 1] ?? null;
  }

  // Fallback: take the parent directory
  if (parts.length >= 2) {
    return parts[parts.length - 2] ?? null;
  }

  return null;
}

/**
 * Resolve a relative import path to determine the target module.
 */
function extractModuleFromImportPath(
  currentFilePath: string,
  importPath: string,
): string | null {
  // Simple heuristic: look at the import path segments
  const importParts = importPath.replace(/\\/g, "/").split("/");

  // Count the ".." to determine how far up we go
  let upCount = 0;
  for (const part of importParts) {
    if (part === "..") {
      upCount++;
    } else if (part !== ".") {
      break;
    }
  }

  // If we go up enough levels, we're crossing module boundaries
  if (upCount >= 2) {
    const targetParts = importParts.filter((p) => p !== "." && p !== "..");
    return targetParts[0] ?? null;
  }

  return extractModuleName(currentFilePath);
}
