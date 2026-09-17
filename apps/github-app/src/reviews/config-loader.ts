import type { Octokit } from "octokit";
import { loadConfig, DEFAULT_CONFIG, type ArchStandardsConfig } from "@archstandards/core";
import { fetchRepoPolicyConfig } from "@archstandards/github-adapter";

/**
 * Load ArchStandards configuration for a specific repository and ref.
 * Falls back to DEFAULT_CONFIG if no repo config file exists.
 */
export async function loadRepoConfig(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
): Promise<ArchStandardsConfig> {
  try {
    const rawConfigYaml = await fetchRepoPolicyConfig(octokit, { owner, repo, ref });
    if (!rawConfigYaml) {
      return DEFAULT_CONFIG;
    }

    return loadConfig(rawConfigYaml);
  } catch {
    // If parsing or schema validation fails, use default safe config
    return DEFAULT_CONFIG;
  }
}
