import { describe, it, expect, vi } from "vitest";
import crypto from "node:crypto";
import type { ReviewReport, Finding } from "@archstandards/core";
import {
  formatInlineComment,
  formatSummaryComment,
  formatCheckRunConclusion,
  verifyWebhookSignature,
  parsePullRequestPayload,
  createCheckRun,
  publishCheckRunResult,
  publishPullRequestReview,
  fetchPullRequestFiles,
  fetchRepoPolicyConfig,
} from "../src/index.js";

describe("GitHub Adapter — Comment & Check Formatter", () => {
  const sampleFinding: Finding = {
    ruleId: "ARCH-001",
    severity: "error",
    file: "src/order/OrderController.ts",
    line: 12,
    message: "Controllers must not directly access database or repositories.",
    rationale: "Direct database access from controllers tightly couples HTTP handling with persistence.",
    suggestion: "Inject OrderService and delegate data retrieval to the service layer.",
    documentationUrl: "https://docs.archstandards.dev/rules/ARCH-001",
  };

  const sampleReport: ReviewReport = {
    owner: "org",
    repo: "repo",
    pullNumber: 42,
    commitSha: "abc123def456",
    findings: [sampleFinding],
    score: 85,
    categorySummaries: [
      { category: "architecture", errorCount: 1, warningCount: 0, infoCount: 0, totalCount: 1 },
      { category: "api", errorCount: 0, warningCount: 0, infoCount: 0, totalCount: 0 },
      { category: "testing", errorCount: 0, warningCount: 0, infoCount: 0, totalCount: 0 },
      { category: "security", errorCount: 0, warningCount: 0, infoCount: 0, totalCount: 0 },
      { category: "naming", errorCount: 0, warningCount: 0, infoCount: 0, totalCount: 0 },
    ],
    status: "fail",
    failOn: ["error"],
    appliedExceptions: [
      { ruleId: "SEC-001", path: "src/mock-token.ts", reason: "Test fixture mock", expires: "2026-12-31" },
    ],
    filesAnalyzed: 5,
    rulesEvaluated: 18,
    timestamp: new Date("2026-09-16T12:00:00Z"),
  };

  it("should format inline comments with icon, rationale, suggestion, and docs", () => {
    const formatted = formatInlineComment(sampleFinding);
    expect(formatted).toContain("❌ **ARCH-001**");
    expect(formatted).toContain("Controllers must not directly access database");
    expect(formatted).toContain("**Suggestion:** Inject OrderService");
    expect(formatted).toContain("https://docs.archstandards.dev/rules/ARCH-001");
  });

  it("should format PR summary comment with category breakdown, score, and exceptions", () => {
    const summary = formatSummaryComment(sampleReport);
    expect(summary).toContain("## ArchStandards Review");
    expect(summary).toContain("❌ **Review failed** — 1 blocking violation");
    expect(summary).toContain("| Architecture | 1 ❌ | ✓ | ✓ |");
    expect(summary).toContain("Score: **85/100**");
    expect(summary).toContain("### Exceptions Applied");
    expect(summary).toContain("SEC-001");
    expect(summary).toContain("Test fixture mock");
  });

  it("should format check run conclusions appropriately", () => {
    const failOutcome = formatCheckRunConclusion(sampleReport);
    expect(failOutcome.conclusion).toBe("failure");
    expect(failOutcome.title).toContain("1 blocking violation");

    const passOutcome = formatCheckRunConclusion({
      ...sampleReport,
      status: "pass",
      findings: [],
      score: 100,
    });
    expect(passOutcome.conclusion).toBe("success");
    expect(passOutcome.title).toBe("All checks passed");

    const warnOutcome = formatCheckRunConclusion({
      ...sampleReport,
      status: "warn",
      findings: [{ ...sampleFinding, severity: "warning" }],
      score: 95,
    });
    expect(warnOutcome.conclusion).toBe("neutral");
    expect(warnOutcome.title).toContain("warning");
  });
});

describe("GitHub Adapter — Webhook Handler", () => {
  const secret = "test-webhook-secret-12345";
  const payloadStr = JSON.stringify({ action: "opened", number: 10 });
  const hmac = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");
  const validSignatureHeader = `sha256=${hmac}`;

  it("should verify valid webhook HMAC signatures", () => {
    const valid = verifyWebhookSignature(secret, payloadStr, validSignatureHeader);
    expect(valid).toBe(true);
  });

  it("should reject invalid webhook HMAC signatures", () => {
    const invalid = verifyWebhookSignature(secret, payloadStr, "sha256=wrongsignature");
    expect(invalid).toBe(false);

    const wrongSecret = verifyWebhookSignature("wrong-secret", payloadStr, validSignatureHeader);
    expect(wrongSecret).toBe(false);

    const noHeader = verifyWebhookSignature(secret, payloadStr, undefined);
    expect(noHeader).toBe(false);
  });

  it("should parse pull request webhook payloads", () => {
    const validPayload = {
      action: "opened",
      number: 7,
      repository: {
        name: "test-repo",
        owner: { login: "test-org" },
      },
      pull_request: {
        head: { sha: "headsha123" },
        base: { sha: "basesha456" },
      },
      installation: { id: 999 },
    };

    const parsed = parsePullRequestPayload(validPayload);
    expect(parsed).not.toBeNull();
    expect(parsed?.action).toBe("opened");
    expect(parsed?.owner).toBe("test-org");
    expect(parsed?.repo).toBe("test-repo");
    expect(parsed?.pullNumber).toBe(7);
    expect(parsed?.headSha).toBe("headsha123");
    expect(parsed?.baseSha).toBe("basesha456");
    expect(parsed?.installationId).toBe(999);
  });

  it("should return null on invalid or non-PR payloads", () => {
    expect(parsePullRequestPayload(null)).toBeNull();
    expect(parsePullRequestPayload({})).toBeNull();
    expect(parsePullRequestPayload({ action: "opened" })).toBeNull();
  });
});

describe("GitHub Adapter — Octokit API Interactions", () => {
  it("should fetch PR files and classify them", async () => {
    const mockOctokit = {
      rest: {
        pulls: {
          listFiles: vi.fn().mockResolvedValue({
            data: [
              {
                filename: "src/order/OrderController.ts",
                status: "added",
              },
              {
                filename: "readme.md", // non-analyzable
                status: "modified",
              },
              {
                filename: "src/deleted.ts",
                status: "removed",
              },
            ],
          }),
        },
        repos: {
          getContent: vi.fn().mockResolvedValue({
            data: {
              content: Buffer.from("export class OrderController {}").toString("base64"),
            },
          }),
        },
      },
    };

    const context = await fetchPullRequestFiles(mockOctokit as any, {
      owner: "org",
      repo: "repo",
      pullNumber: 1,
      commitSha: "sha1",
    });

    expect(context.files.length).toBe(1);
    expect(context.files[0]?.path).toBe("src/order/OrderController.ts");
    expect(context.files[0]?.fileType).toBe("controller");
  });

  it("should fetch repo policy config if present", async () => {
    const mockOctokit = {
      rest: {
        repos: {
          getContent: vi.fn().mockResolvedValue({
            data: {
              content: Buffer.from("version: '1.0'").toString("base64"),
            },
          }),
        },
      },
    };

    const configContent = await fetchRepoPolicyConfig(mockOctokit as any, {
      owner: "org",
      repo: "repo",
    });

    expect(configContent).toBe("version: '1.0'");
  });

  it("should publish check runs and comments", async () => {
    const mockOctokit = {
      rest: {
        checks: {
          create: vi.fn().mockResolvedValue({ data: { id: 12345 } }),
          update: vi.fn().mockResolvedValue({ data: {} }),
        },
        issues: {
          createComment: vi.fn().mockResolvedValue({ data: {} }),
        },
        pulls: {
          createReview: vi.fn().mockResolvedValue({ data: {} }),
        },
      },
    };

    const checkRunId = await createCheckRun(mockOctokit as any, {
      owner: "org",
      repo: "repo",
      headSha: "head123",
    });

    expect(checkRunId).toBe(12345);
    expect(mockOctokit.rest.checks.create).toHaveBeenCalled();

    const sampleReport: ReviewReport = {
      owner: "org",
      repo: "repo",
      pullNumber: 42,
      commitSha: "head123",
      findings: [
        {
          ruleId: "ARCH-001",
          severity: "error",
          file: "src/OrderController.ts",
          line: 10,
          message: "Direct DB",
          rationale: "Coupling",
          documentationUrl: "https://docs.test/ARCH-001",
        },
      ],
      score: 85,
      categorySummaries: [],
      status: "fail",
      failOn: ["error"],
      appliedExceptions: [],
      filesAnalyzed: 1,
      rulesEvaluated: 18,
      timestamp: new Date(),
    };

    await publishCheckRunResult(mockOctokit as any, {
      owner: "org",
      repo: "repo",
      checkRunId,
      report: sampleReport,
    });

    expect(mockOctokit.rest.checks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        check_run_id: 12345,
        status: "completed",
        conclusion: "failure",
      }),
    );

    await publishPullRequestReview(mockOctokit as any, {
      owner: "org",
      repo: "repo",
      pullNumber: 42,
      commitSha: "head123",
      report: sampleReport,
    });

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalled();
    expect(mockOctokit.rest.pulls.createReview).toHaveBeenCalled();
  });
});
