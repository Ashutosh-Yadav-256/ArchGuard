import type { Finding, ReviewReport } from "@archstandards/core";

/**
 * Format findings as GitHub PR inline review comments (markdown).
 */
export function formatInlineComment(finding: Finding): string {
  const icon = finding.severity === "error" ? "❌" : finding.severity === "warning" ? "⚠️" : "ℹ️";

  let comment = `${icon} **${finding.ruleId}** · ${finding.message}\n\n`;
  comment += `> ${finding.rationale}\n\n`;

  if (finding.suggestion) {
    comment += `**Suggestion:** ${finding.suggestion}\n\n`;
  }

  comment += `📖 [Learn more](${finding.documentationUrl})`;

  return comment;
}

/**
 * Format a complete review report as a PR summary comment (markdown).
 */
export function formatSummaryComment(report: ReviewReport): string {
  const errorCount = report.findings.filter((f) => f.severity === "error").length;
  const warningCount = report.findings.filter((f) => f.severity === "warning").length;
  const infoCount = report.findings.filter((f) => f.severity === "info").length;

  let summary = `## ArchStandards Review\n\n`;

  // Status badge
  if (report.status === "pass") {
    summary += `✅ **All checks passed**\n\n`;
  } else if (report.status === "fail") {
    summary += `❌ **Review failed** — ${errorCount} blocking violation${errorCount !== 1 ? "s" : ""}\n\n`;
  } else {
    summary += `⚠️ **Review passed with warnings**\n\n`;
  }

  // Counts
  summary += `| Severity | Count |\n`;
  summary += `|---|---|\n`;
  summary += `| ❌ Errors | ${errorCount} |\n`;
  summary += `| ⚠️ Warnings | ${warningCount} |\n`;
  summary += `| ℹ️ Suggestions | ${infoCount} |\n\n`;

  // Category breakdown
  summary += `### Category Breakdown\n\n`;
  summary += `| Category | Errors | Warnings | Info |\n`;
  summary += `|---|---|---|---|\n`;

  for (const cat of report.categorySummaries) {
    const catName = cat.category.charAt(0).toUpperCase() + cat.category.slice(1);
    const errorIcon = cat.errorCount > 0 ? `${cat.errorCount} ❌` : "✓";
    const warnIcon = cat.warningCount > 0 ? `${cat.warningCount} ⚠️` : "✓";
    const infoIcon = cat.infoCount > 0 ? `${cat.infoCount} ℹ️` : "✓";
    summary += `| ${catName} | ${errorIcon} | ${warnIcon} | ${infoIcon} |\n`;
  }

  summary += `\n`;

  // Score
  summary += `### Score: **${report.score}/100**\n\n`;

  // Applied exceptions
  if (report.appliedExceptions.length > 0) {
    summary += `### Exceptions Applied\n\n`;
    for (const exc of report.appliedExceptions) {
      summary += `- **${exc.ruleId}** skipped for \`${exc.path}\`: ${exc.reason}`;
      if (exc.expires) {
        summary += ` (expires: ${exc.expires})`;
      }
      summary += `\n`;
    }
    summary += `\n`;
  }

  // Stats
  summary += `---\n`;
  summary += `*${report.filesAnalyzed} files analyzed · ${report.rulesEvaluated} rules evaluated · `;
  summary += `${report.timestamp.toISOString()}*\n`;

  return summary;
}

/**
 * Build a check run conclusion from a review report.
 */
export function formatCheckRunConclusion(report: ReviewReport): {
  conclusion: "success" | "failure" | "neutral";
  title: string;
  summary: string;
} {
  const errorCount = report.findings.filter((f) => f.severity === "error").length;
  const warningCount = report.findings.filter((f) => f.severity === "warning").length;

  if (report.status === "fail") {
    return {
      conclusion: "failure",
      title: `${errorCount} blocking violation${errorCount !== 1 ? "s" : ""} found`,
      summary: `ArchStandards found ${errorCount} error${errorCount !== 1 ? "s" : ""} and ${warningCount} warning${warningCount !== 1 ? "s" : ""}. Score: ${report.score}/100.`,
    };
  }

  if (report.status === "warn") {
    return {
      conclusion: "neutral",
      title: `${warningCount} warning${warningCount !== 1 ? "s" : ""} found`,
      summary: `ArchStandards found ${warningCount} warning${warningCount !== 1 ? "s" : ""}. Score: ${report.score}/100.`,
    };
  }

  return {
    conclusion: "success",
    title: "All checks passed",
    summary: `ArchStandards review passed. Score: ${report.score}/100.`,
  };
}
