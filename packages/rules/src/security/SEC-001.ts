import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * SEC-001: No hardcoded secrets
 *
 * Detects API keys, passwords, tokens, and other secrets hardcoded in source.
 */
const SECRET_PATTERNS = [
  { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["'][a-zA-Z0-9_\-]{16,}["']/gi, label: "API key" },
  { pattern: /(?:secret|token)\s*[:=]\s*["'][a-zA-Z0-9_\-]{16,}["']/gi, label: "Secret/Token" },
  { pattern: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/gi, label: "Password" },
  { pattern: /(?:private[_-]?key)\s*[:=]\s*["'][^"']{16,}["']/gi, label: "Private key" },
  { pattern: /(?:aws[_-]?access[_-]?key)\s*[:=]\s*["'][A-Z0-9]{16,}["']/gi, label: "AWS key" },
  { pattern: /(?:AKIA)[A-Z0-9]{16}/g, label: "AWS Access Key ID" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, label: "GitHub Personal Access Token" },
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, label: "OpenAI/Stripe Secret Key" },
  {
    pattern: /(?:bearer|authorization)\s*[:=]\s*["'][a-zA-Z0-9._\-]{20,}["']/gi,
    label: "Authorization token",
  },
];

export const SEC001: Rule = {
  id: "SEC-001",
  name: "No hardcoded secrets",
  category: "security",
  severity: "error",
  description:
    "Source code must not contain hardcoded API keys, passwords, tokens, or other secrets.",
  documentationUrl: "https://docs.archstandards.dev/rules/SEC-001",

  applies(context: RuleContext): boolean {
    // Apply to all non-test files
    return context.file.fileType !== "test" && context.file.language !== "yaml";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      // Skip comments
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) {
        continue;
      }

      // Skip .env.example patterns and environment variable loading
      if (/process\.env\b/.test(line) || /dotenv/.test(line)) {
        continue;
      }

      for (const { pattern, label } of SECRET_PATTERNS) {
        pattern.lastIndex = 0;

        if (pattern.test(line)) {
          findings.push(
            createFinding({
              ruleId: this.id,
              ruleName: this.name,
              severity: this.severity,
              file: context.file.path,
              line: lineNum,
              message: `Possible hardcoded ${label} detected.`,
              rationale:
                "Hardcoded secrets in source code end up in version control history, " +
                "CI logs, and developer machines. A single leaked key can compromise " +
                "an entire system. This is consistently in the OWASP Top 10.",
              suggestion:
                "Move this value to an environment variable and load it with `process.env.YOUR_KEY`. " +
                "For local development, use a .env file (never committed to git).",
              documentationUrl: this.documentationUrl,
            }),
          );
          break; // One finding per line
        }
      }
    }

    return findings;
  },
};
