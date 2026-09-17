import type { Rule, RuleContext, Finding } from "@archstandards/core";
import { createFinding } from "@archstandards/core";

/**
 * API-003: POST creation endpoints return 201
 *
 * POST endpoints that create resources should return 201 (Created),
 * not 200 (OK).
 */
export const API003: Rule = {
  id: "API-003",
  name: "POST creation endpoints return 201",
  category: "api",
  severity: "warning",
  description:
    "POST endpoints that create new resources should return HTTP 201 (Created), not 200.",
  documentationUrl: "https://docs.archstandards.dev/rules/API-003",

  applies(context: RuleContext): boolean {
    return context.file.fileType === "controller";
  },

  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.file.content.split("\n");
    let insidePostHandler = false;
    let postHandlerDepth = 0;
    let postHandlerStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNum = i + 1;

      // Detect POST route decorators or route definitions
      const isPostRoute =
        /\.post\s*\(/.test(line) ||
        /@Post\s*\(/.test(line) ||
        /method:\s*['"]POST['"]/i.test(line) ||
        /router\.post/.test(line);

      if (isPostRoute) {
        insidePostHandler = true;
        postHandlerDepth = 0;
        postHandlerStartLine = lineNum;
      }

      if (insidePostHandler) {
        // Track brace depth
        postHandlerDepth += (line.match(/\{/g) || []).length;
        postHandlerDepth -= (line.match(/\}/g) || []).length;

        // Check for .status(200) or just .json() without explicit status
        // (Express defaults to 200)
        if (/\.status\(200\)/.test(line) && /\.(json|send)\(/.test(line)) {
          // Check if this looks like a creation response (has "create", "new", etc.)
          const contextLines = lines.slice(Math.max(0, postHandlerStartLine - 1), i + 1).join("\n");

          if (/creat|save|insert|add|new/i.test(contextLines)) {
            findings.push(
              createFinding({
                ruleId: this.id,
                ruleName: this.name,
                severity: this.severity,
                file: context.file.path,
                line: lineNum,
                message: "POST creation endpoint returns 200 instead of 201.",
                rationale:
                  "201 (Created) explicitly communicates that a new resource was created. " +
                  "This distinction matters for caching, monitoring, and client logic. " +
                  "The response should also include a Location header.",
                suggestion:
                  "Change `.status(200)` to `.status(201)` and consider adding a " +
                  "Location header pointing to the newly created resource.",
                documentationUrl: this.documentationUrl,
              }),
            );
          }
        }

        // Exit handler tracking
        if (postHandlerDepth <= 0 && i > postHandlerStartLine) {
          insidePostHandler = false;
        }
      }
    }

    return findings;
  },
};
