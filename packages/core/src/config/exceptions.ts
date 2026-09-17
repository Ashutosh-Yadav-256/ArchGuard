import type { ExceptionConfig } from "./schemas.js";

/**
 * Result of checking whether a rule should be skipped for a given file.
 */
export interface ExceptionMatch {
  readonly matched: boolean;
  readonly exception?: ExceptionConfig;
  readonly expired?: boolean;
}

/**
 * Checks whether a rule is exempted for a given file path.
 *
 * Supports glob-like patterns:
 * - `src/legacy/**` matches any file under src/legacy/
 * - `src/legacy/*` matches direct children of src/legacy/
 * - Exact paths match exactly
 *
 * Returns match info including whether the exception has expired.
 */
export function checkException(
  ruleId: string,
  filePath: string,
  exceptions: readonly ExceptionConfig[],
): ExceptionMatch {
  for (const exception of exceptions) {
    if (exception.rule !== ruleId) {
      continue;
    }

    if (!matchesGlob(filePath, exception.path)) {
      continue;
    }

    // Check expiration
    if (exception.expires) {
      const expiryDate = new Date(exception.expires);
      if (expiryDate < new Date()) {
        return { matched: false, exception, expired: true };
      }
    }

    return { matched: true, exception };
  }

  return { matched: false };
}

/**
 * Simple glob matching for file paths.
 *
 * Supports:
 * - `**` matches any number of directories
 * - `*` matches any characters within a single path segment
 * - Exact string matching
 */
export function matchesGlob(filePath: string, pattern: string): boolean {
  // Normalize separators
  const normalizedPath = filePath.replace(/\\/g, "/");
  const normalizedPattern = pattern.replace(/\\/g, "/");

  // Convert glob to regex
  const regexStr = normalizedPattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/\{\{GLOBSTAR\}\}/g, ".*");

  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(normalizedPath);
}
