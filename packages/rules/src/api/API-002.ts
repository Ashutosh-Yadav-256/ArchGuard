import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * API-002: Endpoints must use consistent resource naming
 *
 * REST endpoints should follow conventions: plural nouns, kebab-case,
 * no verbs in URLs.
 */
const VERB_PATTERNS = [
  /\/get[A-Z]/,
  /\/create[A-Z]/,
  /\/update[A-Z]/,
  /\/delete[A-Z]/,
  /\/fetch[A-Z]/,
  /\/remove[A-Z]/,
  /\/add[A-Z]/,
];

const CAMEL_CASE_IN_PATH = /\/[a-z]+[A-Z][a-zA-Z]*(?:\/|$|\"|\')/;

export const API002: Rule = {
  id: "API-002",
  name: "Endpoints must use consistent resource naming",
  category: "api",
  severity: "warning",
  description:
    "REST endpoints should use plural nouns, kebab-case for multi-word " +
    "resources, and no verbs in URLs.",
  documentationUrl: "https://docs.archstandards.dev/rules/API-002",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "controller";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      // Extract string literals that look like route paths
      const pathMatches = line.match(/['"](\/[a-zA-Z][a-zA-Z0-9\/:_-]*)['"]/g);
      if (!pathMatches) continue;

      for (const match of pathMatches) {
        const path = match.slice(1, -1); // Remove quotes

        // Check for verbs in URL paths
        for (const pattern of VERB_PATTERNS) {
          if (pattern.test(path)) {
            findings.push(
              createFinding({
                ruleId: this.id,
                ruleName: this.name,
                severity: this.severity,
                file: context.file.path,
                line: lineNum,
                message: `Endpoint path "${path}" contains a verb. REST endpoints should use nouns.`,
                rationale:
                  "The HTTP method (GET, POST, PUT, DELETE) already conveys the action. " +
                  "Verbs in URLs create redundancy (e.g., 'GET /getUsers' vs 'GET /users').",
                suggestion: `Use a noun-based path like "${suggestNounPath(path)}".`,
                documentationUrl: this.documentationUrl,
              }),
            );
            break;
          }
        }

        // Check for camelCase in paths (should be kebab-case)
        if (CAMEL_CASE_IN_PATH.test(path)) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: lineNum,
              message: `Endpoint path "${path}" uses camelCase. Use kebab-case instead.`,
              rationale:
                "URLs are case-insensitive in practice, and kebab-case is the standard " +
                "convention for REST APIs. Mixing cases creates inconsistency.",
              suggestion: `Use kebab-case: "${path.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}"`,
              documentationUrl: this.documentationUrl,
            }),
          );
        }
      }
    }

    return findings;
  },
};

function suggestNounPath(path: string): string {
  return path
    .replace(/\/get/i, "/")
    .replace(/\/create/i, "/")
    .replace(/\/update/i, "/")
    .replace(/\/delete/i, "/")
    .replace(/\/fetch/i, "/")
    .replace(/\/remove/i, "/")
    .replace(/\/add/i, "/")
    .replace(/\/\//g, "/");
}
