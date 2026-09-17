import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * API-004: Errors must follow standard response schema
 *
 * Error responses should follow a consistent schema with status, message,
 * and a machine-readable error code.
 */
export const API004: Rule = {
  id: "API-004",
  name: "Errors must follow standard response schema",
  category: "api",
  severity: "info",
  description:
    "Error responses should follow a consistent schema with at minimum: " +
    "status code, error message, and a machine-readable error code.",
  documentationUrl: "https://docs.archstandards.dev/rules/API-004",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "controller";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      // Detect error responses with raw string messages (no structured format)
      const rawErrorPatterns = [
        /\.status\(4\d{2}\)\s*\.\s*(?:json|send)\s*\(\s*["'`]/,
        /\.status\(5\d{2}\)\s*\.\s*(?:json|send)\s*\(\s*["'`]/,
      ];

      for (const pattern of rawErrorPatterns) {
        if (pattern.test(line)) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: lineNum,
              message:
                "Error response uses a raw string instead of a structured error object.",
              rationale:
                "A standard error schema allows clients to handle errors generically. " +
                "Raw strings force clients to parse text, which is fragile and locale-dependent. " +
                "Consider RFC 7807 (Problem Details for HTTP APIs).",
              suggestion:
                'Use a structured response: { "error": { "code": "RESOURCE_NOT_FOUND", "message": "..." } }',
              documentationUrl: this.documentationUrl,
            }),
          );
          break;
        }
      }
    }

    return findings;
  },
};
