import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  RuleRegistry,
  ReviewPipeline,
  DEFAULT_CONFIG,
  type ReviewFile,
  type ReviewReport,
} from "@archstandards/core";
import { allRules } from "@archstandards/rules";
import { classifyFile, detectLanguage } from "@archstandards/parsers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface CorpusTestCase {
  name: string;
  dirPath: string;
  expectedViolations: string[];
  expectedStatus: "pass" | "fail" | "warn";
}

export interface CorpusValidationResult {
  suiteName: string;
  expectedRules: string[];
  detectedRules: string[];
  allDetected: boolean;
  score: number;
  status: "pass" | "fail" | "warn";
  findingsCount: number;
}

/**
 * Load all files in a directory as ReviewFile objects.
 */
export function loadCorpusFiles(dirPath: string): ReviewFile[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: ReviewFile[] = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, "/");
      const content = fs.readFileSync(fullPath, "utf-8");
      const fileType = classifyFile(relativePath);
      const language = detectLanguage(relativePath) ?? "typescript";

      files.push({
        path: relativePath,
        content,
        fileType,
        language,
      });
    }
  }

  return files;
}

/**
 * Run ArchStandards review engine against all test corpus suites.
 */
export function runCorpusValidation(): {
  results: CorpusValidationResult[];
  overallAccuracy: number;
  allPassed: boolean;
} {
  const registry = new RuleRegistry();
  for (const rule of allRules) {
    registry.register(rule);
  }
  const pipeline = new ReviewPipeline(registry);

  const testCases: CorpusTestCase[] = [
    {
      name: "Bad Architecture",
      dirPath: path.join(__dirname, "bad", "bad-architecture"),
      expectedViolations: ["ARCH-001", "ARCH-002", "ARCH-003", "ARCH-004"],
      expectedStatus: "fail",
    },
    {
      name: "Bad API Design",
      dirPath: path.join(__dirname, "bad", "bad-api"),
      expectedViolations: ["API-001", "API-002", "API-003", "API-004"],
      expectedStatus: "warn",
    },
    {
      name: "Missing Tests",
      dirPath: path.join(__dirname, "bad", "missing-tests"),
      expectedViolations: ["TEST-001", "TEST-002", "TEST-004"],
      expectedStatus: "fail",
    },
    {
      name: "Security Violations",
      dirPath: path.join(__dirname, "bad", "security-violations"),
      expectedViolations: ["SEC-001", "SEC-002", "SEC-003"],
      expectedStatus: "fail",
    },
    {
      name: "Bad Naming Conventions",
      dirPath: path.join(__dirname, "bad", "bad-naming"),
      expectedViolations: ["NAME-001", "NAME-002", "NAME-003"],
      expectedStatus: "pass", // Naming violations have info severity by default
    },
    {
      name: "Clean Project (Zero Violations)",
      dirPath: path.join(__dirname, "good", "clean-project"),
      expectedViolations: [],
      expectedStatus: "pass",
    },
  ];

  const results: CorpusValidationResult[] = [];
  let totalExpected = 0;
  let totalDetected = 0;

  for (const tc of testCases) {
    const files = loadCorpusFiles(tc.dirPath);
    const report: ReviewReport = pipeline.execute(
      {
        owner: "test-corpus",
        repo: tc.name.toLowerCase().replace(/\s+/g, "-"),
        pullNumber: 1,
        commitSha: "test-sha",
        installationId: 0,
        files,
      },
      DEFAULT_CONFIG,
    );

    const detectedRuleIds = Array.from(new Set(report.findings.map((f) => f.ruleId)));

    const allDetected = tc.expectedViolations.every((expected) =>
      detectedRuleIds.includes(expected),
    );

    totalExpected += tc.expectedViolations.length;
    for (const expected of tc.expectedViolations) {
      if (detectedRuleIds.includes(expected)) {
        totalDetected++;
      }
    }

    results.push({
      suiteName: tc.name,
      expectedRules: tc.expectedViolations,
      detectedRules: detectedRuleIds,
      allDetected,
      score: report.score,
      status: report.status,
      findingsCount: report.findings.length,
    });
  }

  const overallAccuracy = totalExpected > 0 ? (totalDetected / totalExpected) * 100 : 100;
  const cleanProjectPassed =
    results.find((r) => r.suiteName.includes("Clean"))?.findingsCount === 0;
  const allPassed = results.every((r) => r.allDetected) && cleanProjectPassed;

  return {
    results,
    overallAccuracy,
    allPassed,
  };
}

// ─── CLI Entrypoint ───────────────────────────────────────────
if (process.argv[1]?.endsWith("test-harness.ts") || process.argv[1]?.endsWith("test-harness.js")) {
  console.log("==================================================");
  console.log("  ArchStandards Test Corpus Validation Harness   ");
  console.log("==================================================\n");

  const { results, overallAccuracy, allPassed } = runCorpusValidation();

  console.log("| Corpus Suite | Status | Score | Expected Rules | Detected Rules | All Detected |");
  console.log("|---|---|---|---|---|---|");

  for (const r of results) {
    const expStr = r.expectedRules.length > 0 ? r.expectedRules.join(", ") : "(none)";
    const detStr = r.detectedRules.length > 0 ? r.detectedRules.join(", ") : "(none)";
    const icon = r.allDetected ? "✅ YES" : "❌ NO";
    console.log(
      `| ${r.suiteName} | ${r.status.toUpperCase()} | ${r.score}/100 | ${expStr} | ${detStr} | ${icon} |`,
    );
  }

  console.log(`\nOverall Detection Accuracy: ${overallAccuracy.toFixed(1)}%`);
  console.log(
    `Clean Project False Positives: ${results.find((r) => r.suiteName.includes("Clean"))?.findingsCount ?? 0}`,
  );
  console.log(`Final Result: ${allPassed ? "PASSED ✅" : "FAILED ❌"}\n`);

  if (!allPassed) {
    process.exit(1);
  }
}
