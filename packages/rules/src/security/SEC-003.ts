import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * SEC-003: Sensitive configuration must use environment variables
 *
 * Config values like database URLs with credentials should use process.env.
 */
const SENSITIVE_CONFIG_PATTERNS = [
  { pattern: /(?:database|db)[_-]?url\s*[:=]\s*["'](?:postgres|mysql|mongodb|redis):\/\/[^"']+["']/gi, label: "Database URL with credentials" },
  { pattern: /(?:connection[_-]?string)\s*[:=]\s*["'][^"']{20,}["']/gi, label: "Connection string" },
  { pattern: /(?:smtp|mail)[_-]?(?:host|server)\s*[:=]\s*["'][^"']+["']/gi, label: "Mail server configuration" },
];

export const SEC003: Rule = {
  id: "SEC-003",
  name: "Sensitive configuration must use environment variables",
  category: "security",
  severity: "warning",
  description:
    "Configuration values like database URLs and service keys should use environment variables.",
  documentationUrl: "https://docs.archstandards.dev/rules/SEC-003",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "config" || context.file.fileType === "service" || context.file.fileType === "unknown";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      // Skip lines that already use process.env
      if (/process\.env/.test(line)) continue;

      // Skip comments
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("#")) continue;

      for (const { pattern, label } of SENSITIVE_CONFIG_PATTERNS) {
        pattern.lastIndex = 0;

        if (pattern.test(line)) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: lineNum,
              message: `Hardcoded ${label} detected. Use environment variables instead.`,
              rationale:
                "Environment variables separate configuration from code, allowing " +
                "different values per deployment environment without code changes. " +
                "This is one of the 12-factor app principles.",
              suggestion:
                "Replace the hardcoded value with `process.env.YOUR_CONFIG_KEY` " +
                "and document the required environment variable in .env.example.",
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
