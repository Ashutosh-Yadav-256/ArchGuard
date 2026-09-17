import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * API-001: Use appropriate HTTP status codes
 *
 * Detects patterns where controllers return generic 200 for error conditions,
 * or use inappropriate status codes for the operation being performed.
 */
export const API001: Rule = {
  id: "API-001",
  name: "Use appropriate HTTP status codes",
  category: "api",
  severity: "warning",
  description:
    "HTTP responses should use semantically correct status codes. " +
    "Returning 200 for everything obscures the actual result.",
  documentationUrl: "https://docs.archstandards.dev/rules/API-001",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "controller";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      // Detect patterns like: res.status(200).json({ error: ... })
      if (/\.status\(200\).*\.json\(\s*\{.*error/i.test(line)) {
        findings.push(
          createFinding({
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            file: context.file.path,
            line: lineNum,
            message: "Returning HTTP 200 with an error response body.",
            rationale:
              "HTTP status codes are part of the API contract. Returning 200 for errors " +
              "breaks client-side error handling, monitoring, and load balancer health checks.",
            suggestion:
              "Use the appropriate error status code (400 for bad request, 404 for not found, " +
              "500 for server error) instead of 200.",
            documentationUrl: this.documentationUrl,
          }),
        );
      }

      // Detect catch blocks that return 200
      if (/catch\s*\(/.test(line)) {
        // Look ahead for .status(200) in the next few lines
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const nextLine = lines[j]!;
          if (/\.status\(200\)/.test(nextLine)) {
            findings.push(
              createFinding({
                ruleId: this.id,
                ruleName: this.name,
                severity: this.severity,
                file: context.file.path,
                line: j + 1,
                message: "Returning HTTP 200 inside a catch block.",
                rationale:
                  "Catch blocks handle errors — they should return error status codes (4xx/5xx), " +
                  "not 200. Using 200 for errors hides failures from monitoring systems.",
                suggestion:
                  "Use status 500 for unexpected errors, or a specific 4xx code if the error is client-related.",
                documentationUrl: this.documentationUrl,
              }),
            );
            break;
          }
          // Stop looking if we hit another block
          if (/\}\s*$/.test(nextLine)) break;
        }
      }
    }

    return findings;
  },
};
