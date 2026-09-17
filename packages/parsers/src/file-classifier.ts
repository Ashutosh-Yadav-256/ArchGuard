/**
 * File classifier — determines what architectural role a file plays
 * based on its path and naming conventions.
 */

export type FileClassification =
  | "controller"
  | "service"
  | "repository"
  | "test"
  | "config"
  | "middleware"
  | "model"
  | "util"
  | "unknown";

/**
 * Classify a file based on its path and name.
 *
 * Uses naming conventions common in Node.js/TypeScript projects:
 * - `*.controller.ts`, `*.handler.ts`, `*.router.ts` → controller
 * - `*.service.ts` → service
 * - `*.repository.ts`, `*.repo.ts` → repository
 * - `*.test.ts`, `*.spec.ts`, `__tests__/*` → test
 * - `*.middleware.ts` → middleware
 * - `*.model.ts`, `*.entity.ts` → model
 * - `*.config.ts` → config
 * - `*.util.ts`, `*.helper.ts` → util
 */
export function classifyFile(filePath: string): FileClassification {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const fileName = normalized.split("/").pop() ?? "";

  // Test files (check first — test files might also match other patterns)
  if (
    fileName.includes(".test.") ||
    fileName.includes(".spec.") ||
    normalized.includes("__tests__/") ||
    normalized.includes("/tests/") ||
    normalized.includes("/test/")
  ) {
    return "test";
  }

  // Controller / Handler / Router
  if (
    fileName.includes("controller.") ||
    fileName.includes("handler.") ||
    fileName.includes("router.") ||
    normalized.includes("/controllers/") ||
    normalized.includes("/handlers/") ||
    normalized.includes("/routes/")
  ) {
    return "controller";
  }

  // Service
  if (fileName.includes("service.") || normalized.includes("/services/")) {
    return "service";
  }

  // Repository
  if (
    fileName.includes("repository.") ||
    fileName.includes("repo.") ||
    normalized.includes("/repositories/") ||
    normalized.includes("/repos/")
  ) {
    return "repository";
  }

  // Middleware
  if (fileName.includes("middleware.") || normalized.includes("/middleware/")) {
    return "middleware";
  }

  // Model / Entity
  if (
    fileName.includes("model.") ||
    fileName.includes("entity.") ||
    fileName.includes("schema.") ||
    normalized.includes("/models/") ||
    normalized.includes("/entities/")
  ) {
    return "model";
  }

  // Config
  if (fileName.includes("config.") || normalized.includes("/config/")) {
    return "config";
  }

  // Util / Helper
  if (
    fileName.includes("util.") ||
    fileName.includes("utils.") ||
    fileName.includes("helper.") ||
    fileName.includes("helpers.") ||
    normalized.includes("/utils/") ||
    normalized.includes("/helpers/")
  ) {
    return "util";
  }

  return "unknown";
}

/**
 * Detect the programming language of a file based on extension.
 */
export function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";

  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    mts: "typescript",
    mjs: "javascript",
    java: "java",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    yaml: "yaml",
    yml: "yaml",
    json: "json",
    md: "markdown",
  };

  return languageMap[ext] ?? "unknown";
}

/**
 * Check if a file is a TypeScript/JavaScript file that we can analyze.
 */
export function isAnalyzableFile(filePath: string): boolean {
  const lang = detectLanguage(filePath);
  return lang === "typescript" || lang === "javascript";
}
