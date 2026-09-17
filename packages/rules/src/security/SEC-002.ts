import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * SEC-002: Passwords must not be logged
 *
 * Log statements must not output passwords, tokens, or sensitive data.
 */
const LOG_METHODS = ["log", "info", "warn", "error", "debug", "trace"];
const SENSITIVE_WORDS = [
  "password",
  "passwd",
  "pwd",
  "secret",
  "token",
  "apiKey",
  "api_key",
  "authorization",
  "credential",
];

export const SEC002: Rule = {
  id: "SEC-002",
  name: "Passwords must not be logged",
  category: "security",
  severity: "error",
  description: "Log statements must not output passwords, tokens, or other sensitive data.",
  documentationUrl: "https://docs.archstandards.dev/rules/SEC-002",

  applies(context: RuleContext): boolean {
    return context.file.fileType !== "test";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      // Check for logging calls
      const isLogLine = LOG_METHODS.some((method) => {
        const patterns = [`console.${method}(`, `logger.${method}(`, `log.${method}(`];
        return patterns.some((p) => line.includes(p));
      });

      if (!isLogLine) continue;

      // Check if any sensitive words appear in the log arguments
      for (const word of SENSITIVE_WORDS) {
        if (line.toLowerCase().includes(word.toLowerCase())) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: lineNum,
              message: `Log statement potentially contains sensitive data ("${word}").`,
              rationale:
                "Logs are often stored in plain text, aggregated in monitoring systems, " +
                "and accessible to many team members. Logging passwords creates an " +
                "uncontrolled credential exposure surface.",
              suggestion:
                "Remove the sensitive field from the log statement, or redact it. " +
                "Use a structured logger with automatic field redaction (e.g., Pino with redact option).",
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
