import { describe, it, expect } from "vitest";
import { RuleRegistry } from "../src/engine/rule-registry.js";
import { RuleEngine } from "../src/engine/rule-engine.js";
import { RuleSelector } from "../src/engine/rule-selector.js";
import { FindingAggregator } from "../src/pipeline/finding-aggregator.js";
import { ReviewPipeline } from "../src/pipeline/review-pipeline.js";
import { loadConfig, DEFAULT_CONFIG } from "../src/config/policy-loader.js";
import { checkException, matchesGlob } from "../src/config/exceptions.js";
import { isAtLeastSeverity } from "../src/models/severity.js";
import type { Rule, RuleContext, ReviewContext, Finding, ReviewFile } from "../src/index.js";

// ─── Test Helpers ──────────────────────────────────────────────

function createMockRule(overrides: Partial<Rule> & { id: string }): Rule {
  return {
    name: overrides.id,
    category: "architecture",
    severity: "warning",
    description: "Test rule",
    documentationUrl: "https://test.dev",
    applies: () => true,
    evaluate: () => [],
    ...overrides,
  };
}

function createMockFile(overrides: Partial<ReviewFile> = {}): ReviewFile {
  return {
    path: "src/test/TestController.ts",
    content: "export class TestController {}",
    fileType: "controller",
    language: "typescript",
    ...overrides,
  };
}

function createMockContext(overrides: Partial<RuleContext> = {}): RuleContext {
  const file = createMockFile();
  return {
    file,
    allFiles: [file],
    owner: "test-owner",
    repo: "test-repo",
    pullNumber: 1,
    commitSha: "abc123",
    ...overrides,
  };
}

// ─── Severity Tests ────────────────────────────────────────────

describe("Severity", () => {
  it("should compare severity levels correctly", () => {
    expect(isAtLeastSeverity("error", "warning")).toBe(true);
    expect(isAtLeastSeverity("warning", "info")).toBe(true);
    expect(isAtLeastSeverity("info", "info")).toBe(true);
    expect(isAtLeastSeverity("info", "warning")).toBe(false);
    expect(isAtLeastSeverity("warning", "error")).toBe(false);
  });
});

// ─── RuleRegistry Tests ────────────────────────────────────────

describe("RuleRegistry", () => {
  it("should register and retrieve rules", () => {
    const registry = new RuleRegistry();
    const rule = createMockRule({ id: "TEST-001" });

    registry.register(rule);

    expect(registry.has("TEST-001")).toBe(true);
    expect(registry.get("TEST-001")).toBe(rule);
    expect(registry.size).toBe(1);
  });

  it("should throw on duplicate registration", () => {
    const registry = new RuleRegistry();
    const rule = createMockRule({ id: "TEST-001" });

    registry.register(rule);
    expect(() => registry.register(rule)).toThrow("already registered");
  });

  it("should filter by category", () => {
    const registry = new RuleRegistry();
    registry.register(createMockRule({ id: "ARCH-001", category: "architecture" }));
    registry.register(createMockRule({ id: "API-001", category: "api" }));

    expect(registry.getByCategory("architecture")).toHaveLength(1);
    expect(registry.getByCategory("api")).toHaveLength(1);
    expect(registry.getByCategory("testing")).toHaveLength(0);
  });

  it("should register all rules at once", () => {
    const registry = new RuleRegistry();
    registry.registerAll([createMockRule({ id: "ARCH-001" }), createMockRule({ id: "ARCH-002" })]);

    expect(registry.size).toBe(2);
  });

  it("should remove rules", () => {
    const registry = new RuleRegistry();
    registry.register(createMockRule({ id: "TEST-001" }));

    expect(registry.remove("TEST-001")).toBe(true);
    expect(registry.has("TEST-001")).toBe(false);
    expect(registry.remove("NONEXISTENT")).toBe(false);
  });
});

// ─── RuleSelector Tests ────────────────────────────────────────

describe("RuleSelector", () => {
  it("should include all rules with wildcard pattern", () => {
    const registry = new RuleRegistry();
    registry.register(createMockRule({ id: "ARCH-001" }));
    registry.register(createMockRule({ id: "API-001", category: "api" }));
    const selector = new RuleSelector(registry);

    const selected = selector.select(createMockContext(), {
      include: ["*"],
      exclude: [],
    });

    expect(selected).toHaveLength(2);
  });

  it("should filter by category pattern", () => {
    const registry = new RuleRegistry();
    registry.register(createMockRule({ id: "ARCH-001" }));
    registry.register(createMockRule({ id: "API-001", category: "api" }));
    const selector = new RuleSelector(registry);

    const selected = selector.select(createMockContext(), {
      include: ["architecture/*"],
      exclude: [],
    });

    expect(selected).toHaveLength(1);
    expect(selected[0]!.id).toBe("ARCH-001");
  });

  it("should exclude specific rules", () => {
    const registry = new RuleRegistry();
    registry.register(createMockRule({ id: "ARCH-001" }));
    registry.register(createMockRule({ id: "ARCH-002" }));
    const selector = new RuleSelector(registry);

    const selected = selector.select(createMockContext(), {
      include: ["*"],
      exclude: ["ARCH-001"],
    });

    expect(selected).toHaveLength(1);
    expect(selected[0]!.id).toBe("ARCH-002");
  });

  it("should respect rule applies() method", () => {
    const registry = new RuleRegistry();
    registry.register(
      createMockRule({
        id: "ARCH-001",
        applies: (ctx) => ctx.file.fileType === "service",
      }),
    );
    const selector = new RuleSelector(registry);

    const selected = selector.select(
      createMockContext({
        file: createMockFile({ fileType: "controller" }),
      }),
      { include: ["*"], exclude: [] },
    );

    expect(selected).toHaveLength(0);
  });
});

// ─── RuleEngine Tests ──────────────────────────────────────────

describe("RuleEngine", () => {
  it("should evaluate rules and collect findings", () => {
    const engine = new RuleEngine();
    const finding: Finding = {
      ruleId: "TEST-001",
      ruleName: "Test Rule",
      severity: "warning",
      file: "test.ts",
      line: 1,
      message: "Test finding",
      rationale: "Test rationale",
      documentationUrl: "https://test.dev",
    };

    const rule = createMockRule({
      id: "TEST-001",
      evaluate: () => [finding],
    });

    const result = engine.evaluate([rule], createMockContext());

    expect(result.totalFindings).toHaveLength(1);
    expect(result.rulesEvaluated).toBe(1);
    expect(result.rulesFailed).toBe(0);
  });

  it("should handle rule errors gracefully", () => {
    const engine = new RuleEngine();
    const rule = createMockRule({
      id: "BAD-001",
      evaluate: () => {
        throw new Error("Rule crashed!");
      },
    });

    const result = engine.evaluate([rule], createMockContext());

    expect(result.totalFindings).toHaveLength(0);
    expect(result.rulesFailed).toBe(1);
    expect(result.results[0]!.error).toBe("Rule crashed!");
  });
});

// ─── FindingAggregator Tests ───────────────────────────────────

describe("FindingAggregator", () => {
  const aggregator = new FindingAggregator();

  it("should calculate score correctly", () => {
    const findings: Finding[] = [
      {
        ruleId: "ARCH-001",
        ruleName: "Test",
        severity: "error",
        file: "a.ts",
        line: 1,
        message: "",
        rationale: "",
        documentationUrl: "",
      },
      {
        ruleId: "API-001",
        ruleName: "Test",
        severity: "warning",
        file: "b.ts",
        line: 1,
        message: "",
        rationale: "",
        documentationUrl: "",
      },
      {
        ruleId: "NAME-001",
        ruleName: "Test",
        severity: "info",
        file: "c.ts",
        line: 1,
        message: "",
        rationale: "",
        documentationUrl: "",
      },
    ];

    const score = aggregator.calculateScore(findings, DEFAULT_CONFIG.scoring);

    // 100 - 15 (error) - 5 (warning) - 1 (info) = 79
    expect(score).toBe(79);
  });

  it("should enforce score floor", () => {
    const findings: Finding[] = Array(10)
      .fill(null)
      .map((_, i) => ({
        ruleId: `ARCH-00${i}`,
        ruleName: "Test",
        severity: "error" as const,
        file: "a.ts",
        line: 1,
        message: "",
        rationale: "",
        documentationUrl: "",
      }));

    const score = aggregator.calculateScore(findings, DEFAULT_CONFIG.scoring);

    // 100 - 10*15 = -50, clamped to 0
    expect(score).toBe(0);
  });

  it("should determine fail status when errors exist", () => {
    const findings: Finding[] = [
      {
        ruleId: "ARCH-001",
        ruleName: "Test",
        severity: "error",
        file: "a.ts",
        line: 1,
        message: "",
        rationale: "",
        documentationUrl: "",
      },
    ];

    const status = aggregator.determineStatus(findings, DEFAULT_CONFIG.policy);
    expect(status).toBe("fail");
  });

  it("should determine warn status when only warnings exist", () => {
    const findings: Finding[] = [
      {
        ruleId: "API-001",
        ruleName: "Test",
        severity: "warning",
        file: "a.ts",
        line: 1,
        message: "",
        rationale: "",
        documentationUrl: "",
      },
    ];

    const status = aggregator.determineStatus(findings, DEFAULT_CONFIG.policy);
    expect(status).toBe("warn");
  });

  it("should determine pass status when no findings", () => {
    const status = aggregator.determineStatus([], DEFAULT_CONFIG.policy);
    expect(status).toBe("pass");
  });
});

// ─── Exception Tests ───────────────────────────────────────────

describe("Exceptions", () => {
  it("should match exact rule and path glob", () => {
    const result = checkException("ARCH-001", "src/legacy/OldController.ts", [
      { rule: "ARCH-001", path: "src/legacy/**", reason: "Legacy" },
    ]);

    expect(result.matched).toBe(true);
    expect(result.exception?.reason).toBe("Legacy");
  });

  it("should not match different rules", () => {
    const result = checkException("API-001", "src/legacy/OldController.ts", [
      { rule: "ARCH-001", path: "src/legacy/**", reason: "Legacy" },
    ]);

    expect(result.matched).toBe(false);
  });

  it("should detect expired exceptions", () => {
    const result = checkException("ARCH-001", "src/legacy/OldController.ts", [
      { rule: "ARCH-001", path: "src/legacy/**", reason: "Legacy", expires: "2020-01-01" },
    ]);

    expect(result.matched).toBe(false);
    expect(result.expired).toBe(true);
  });

  it("should match valid non-expired exceptions", () => {
    const result = checkException("ARCH-001", "src/legacy/OldController.ts", [
      { rule: "ARCH-001", path: "src/legacy/**", reason: "Legacy", expires: "2030-12-31" },
    ]);

    expect(result.matched).toBe(true);
  });
});

// ─── Glob Matching Tests ───────────────────────────────────────

describe("matchesGlob", () => {
  it("should match ** for any depth", () => {
    expect(matchesGlob("src/legacy/deep/file.ts", "src/legacy/**")).toBe(true);
    expect(matchesGlob("src/legacy/file.ts", "src/legacy/**")).toBe(true);
  });

  it("should match * for single segment", () => {
    expect(matchesGlob("src/legacy/file.ts", "src/legacy/*")).toBe(true);
    expect(matchesGlob("src/legacy/deep/file.ts", "src/legacy/*")).toBe(false);
  });

  it("should match exact paths", () => {
    expect(matchesGlob("src/main.ts", "src/main.ts")).toBe(true);
    expect(matchesGlob("src/other.ts", "src/main.ts")).toBe(false);
  });
});

// ─── Config Loader Tests ───────────────────────────────────────

describe("Config Loader", () => {
  it("should return default config for empty input", () => {
    const config = loadConfig(null);
    expect(config.version).toBe("1.0");
    expect(config.policy.fail_on).toContain("error");
  });

  it("should parse valid YAML config", () => {
    const yaml = `
version: "1.0"
rules:
  include:
    - architecture/*
  exclude:
    - ARCH-002
policy:
  fail_on:
    - error
    - warning
`;
    const config = loadConfig(yaml);
    expect(config.rules.include).toContain("architecture/*");
    expect(config.rules.exclude).toContain("ARCH-002");
    expect(config.policy.fail_on).toContain("warning");
  });

  it("should reject invalid rule IDs", () => {
    const yaml = `
version: "1.0"
exceptions:
  - rule: bad-id
    path: src/**
    reason: test
`;
    expect(() => loadConfig(yaml)).toThrow();
  });
});

// ─── ReviewPipeline Tests ──────────────────────────────────────

describe("ReviewPipeline", () => {
  it("should orchestrate a complete review with findings and exceptions", () => {
    const registry = new RuleRegistry();
    registry.register(
      createMockRule({
        id: "ARCH-001",
        category: "architecture",
        severity: "error",
        evaluate: (ctx) => [
          {
            ruleId: "ARCH-001",
            severity: "error",
            file: ctx.file.path,
            line: 10,
            message: "Direct db access",
            rationale: "Coupling",
            documentationUrl: "https://test.dev",
          },
        ],
      }),
    );

    const pipeline = new ReviewPipeline(registry);
    expect(pipeline.getRegistry()).toBe(registry);

    const context: ReviewContext = {
      owner: "acme",
      repo: "api",
      pullNumber: 99,
      commitSha: "sha99",
      installationId: 123,
      files: [
        createMockFile({ path: "src/legacy/Controller.ts" }),
        createMockFile({ path: "src/new/Controller.ts" }),
      ],
    };

    const config = loadConfig(`
version: "1.0"
exceptions:
  - rule: ARCH-001
    path: src/legacy/**
    reason: "Legacy migration"
`);

    const report = pipeline.execute(context, config);

    expect(report.owner).toBe("acme");
    expect(report.pullNumber).toBe(99);
    expect(report.filesAnalyzed).toBe(2);
    expect(report.appliedExceptions.length).toBe(1);
    expect(report.appliedExceptions[0]!.ruleId).toBe("ARCH-001");
    expect(report.appliedExceptions[0]!.path).toBe("src/legacy/Controller.ts");
    expect(report.findings.length).toBe(1);
    expect(report.findings[0]!.file).toBe("src/new/Controller.ts");
    expect(report.status).toBe("fail");
  });
});
