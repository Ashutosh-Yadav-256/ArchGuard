import type { ImportInfo } from "./ts-parser.js";

/**
 * Analyzes import relationships between files for architecture rule enforcement.
 */

/**
 * Layer classification for imports.
 */
export type ArchitecturalLayer =
  "controller" | "service" | "repository" | "model" | "util" | "unknown";

/**
 * Checks if any imports reference modules from a specific architectural layer.
 */
export function hasImportFromLayer(
  imports: readonly ImportInfo[],
  targetLayer: ArchitecturalLayer,
): readonly ImportInfo[] {
  return imports.filter((imp) => classifyImportLayer(imp.moduleSpecifier) === targetLayer);
}

/**
 * Classify an import's module specifier into an architectural layer.
 *
 * Uses naming conventions:
 * - `*Repository*`, `*Repo*` → repository
 * - `*Controller*`, `*Handler*`, `*Router*` → controller
 * - `*Service*` → service
 * - `*Model*`, `*Entity*`, `*Schema*` → model
 * - `*Util*`, `*Helper*`, `*Common*` → util
 */
export function classifyImportLayer(moduleSpecifier: string): ArchitecturalLayer {
  const lower = moduleSpecifier.toLowerCase();

  // Extract the file/module name from the path
  const parts = lower.split("/");
  const moduleName = parts[parts.length - 1] ?? lower;

  if (moduleName.includes("repository") || moduleName.includes("repo")) {
    return "repository";
  }
  if (
    moduleName.includes("controller") ||
    moduleName.includes("handler") ||
    moduleName.includes("router")
  ) {
    return "controller";
  }
  if (moduleName.includes("service")) {
    return "service";
  }
  if (
    moduleName.includes("model") ||
    moduleName.includes("entity") ||
    moduleName.includes("schema")
  ) {
    return "model";
  }
  if (
    moduleName.includes("util") ||
    moduleName.includes("helper") ||
    moduleName.includes("common")
  ) {
    return "util";
  }

  return "unknown";
}

/**
 * Checks if an import references an ORM or database module.
 */
export function isDatabaseImport(moduleSpecifier: string): boolean {
  const lower = moduleSpecifier.toLowerCase();
  const dbModules = [
    "typeorm",
    "prisma",
    "sequelize",
    "knex",
    "drizzle",
    "mongoose",
    "mikro-orm",
    "pg",
    "mysql",
    "mysql2",
    "sqlite3",
    "better-sqlite3",
    "mongodb",
  ];
  return dbModules.some((mod) => lower.includes(mod));
}
