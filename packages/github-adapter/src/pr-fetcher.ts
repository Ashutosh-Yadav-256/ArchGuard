import type { Octokit } from "octokit";
import type { ReviewFile, ReviewContext } from "@archstandards/core";
import { classifyFile, detectLanguage, isAnalyzableFile } from "@archstandards/parsers";

export interface FetchPRFilesParams {
  owner: string;
  repo: string;
  pullNumber: number;
  commitSha: string;
  installationId?: number;
}

/**
 * Fetch all changed files for a pull request and format them as ReviewFiles.
 */
export async function fetchPullRequestFiles(
  octokit: Octokit,
  params: FetchPRFilesParams,
): Promise<ReviewContext> {
  const { owner, repo, pullNumber, commitSha, installationId = 0 } = params;

  // List all files changed in this PR
  const listFilesResponse = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  const files: ReviewFile[] = [];

  for (const item of listFilesResponse.data) {
    // Skip deleted files
    if (item.status === "removed") {
      continue;
    }

    const filePath = item.filename;

    // Only analyze supported code files (ts, js, etc.)
    if (!isAnalyzableFile(filePath)) {
      continue;
    }

    const language = detectLanguage(filePath);
    if (!language) {
      continue;
    }

    try {
      // Fetch file content at the specific commit
      const contentResponse = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: commitSha,
      });

      let content = "";
      if ("content" in contentResponse.data && typeof contentResponse.data.content === "string") {
        content = Buffer.from(contentResponse.data.content, "base64").toString("utf-8");
      }

      const fileType = classifyFile(filePath);

      files.push({
        path: filePath,
        content,
        fileType,
        language,
      });
    } catch {
      // If fetching content fails (e.g. binary or inaccessible), skip gracefully
      continue;
    }
  }

  return {
    owner,
    repo,
    pullNumber,
    commitSha,
    installationId,
    files,
  };
}

/**
 * Attempt to fetch .archstandards/config.yaml or equivalent from repository.
 */
export async function fetchRepoPolicyConfig(
  octokit: Octokit,
  params: { owner: string; repo: string; ref?: string },
): Promise<string | null> {
  const { owner, repo, ref } = params;

  const candidatePaths = [
    ".archstandards/config.yaml",
    ".archstandards/config.yml",
    ".archstandards.yaml",
    ".archstandards.yml",
  ];

  for (const path of candidatePaths) {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if ("content" in response.data && typeof response.data.content === "string") {
        return Buffer.from(response.data.content, "base64").toString("utf-8");
      }
    } catch {
      // File does not exist at this path, try next
      continue;
    }
  }

  return null;
}
