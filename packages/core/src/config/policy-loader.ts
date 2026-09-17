import { parse as parseYaml } from "yaml";
import { ArchStandardsConfigSchema, type ArchStandardsConfig } from "./schemas.js";

/**
 * Default configuration applied when a repository has no .archstandards/config.yaml.
 */
export const DEFAULT_CONFIG: ArchStandardsConfig = {
  version: "1.0",
  rules: {
    include: ["*"],
    exclude: [],
  },
  policy: {
    fail_on: ["error"],
    warn_on: ["warning"],
    report: ["info"],
  },
  scoring: {
    base: 100,
    deductions: {
      error: 15,
      warning: 5,
      info: 1,
    },
    floor: 0,
  },
  exceptions: [],
};

/**
 * Loads and validates an ArchStandards configuration from YAML content.
 *
 * If the YAML is empty or null, returns the default configuration.
 * If validation fails, throws a descriptive ZodError.
 */
export function loadConfig(yamlContent: string | null | undefined): ArchStandardsConfig {
  if (!yamlContent || yamlContent.trim() === "") {
    return DEFAULT_CONFIG;
  }

  const raw: unknown = parseYaml(yamlContent);

  if (raw === null || raw === undefined) {
    return DEFAULT_CONFIG;
  }

  return ArchStandardsConfigSchema.parse(raw);
}

/**
 * Merges a partial repository config with the default config.
 * Repository values override defaults where specified.
 */
export function mergeWithDefaults(
  repoConfig: Partial<ArchStandardsConfig>,
): ArchStandardsConfig {
  return ArchStandardsConfigSchema.parse({
    ...DEFAULT_CONFIG,
    ...repoConfig,
    rules: {
      ...DEFAULT_CONFIG.rules,
      ...repoConfig.rules,
    },
    policy: {
      ...DEFAULT_CONFIG.policy,
      ...repoConfig.policy,
    },
    scoring: {
      ...DEFAULT_CONFIG.scoring,
      ...repoConfig.scoring,
      deductions: {
        ...DEFAULT_CONFIG.scoring.deductions,
        ...repoConfig.scoring?.deductions,
      },
    },
  });
}
