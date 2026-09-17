import type { Octokit } from "octokit";
import type { ReviewPipeline, ReviewReport } from "@archstandards/core";
import {
  type PullRequestWebhookData,
  createCheckRun,
  fetchPullRequestFiles,
  publishCheckRunResult,
  publishPullRequestReview,
} from "@archstandards/github-adapter";
import { loadRepoConfig } from "./config-loader.js";

export interface OrchestrationResult {
  report: ReviewReport;
  checkRunId: number;
}

export class ReviewOrchestrator {
  private readonly pipeline: ReviewPipeline;

  constructor(pipeline: ReviewPipeline) {
    this.pipeline = pipeline;
  }

  /**
   * Orchestrate an end-to-end review of a pull request.
   */
  async reviewPullRequest(
    octokit: Octokit,
    webhookData: PullRequestWebhookData,
    logger?: { info: (...args: any[]) => void; error: (...args: any[]) => void },
  ): Promise<OrchestrationResult> {
    const { owner, repo, pullNumber, headSha, installationId } = webhookData;

    logger?.info({ owner, repo, pullNumber, headSha }, "Starting review orchestration");

    // 1. Create check run in "in_progress" status
    const checkRunId = await createCheckRun(octokit, {
      owner,
      repo,
      headSha,
    });

    try {
      // 2. Fetch changed files
      const reviewContext = await fetchPullRequestFiles(octokit, {
        owner,
        repo,
        pullNumber,
        commitSha: headSha,
        installationId,
      });

      logger?.info(
        { filesCount: reviewContext.files.length },
        "Fetched and classified PR files",
      );

      // 3. Load repository configuration (or default)
      const config = await loadRepoConfig(octokit, owner, repo, headSha);

      // 4. Run pure rule engine review pipeline
      const report = this.pipeline.execute(reviewContext, config);

      logger?.info(
        {
          score: report.score,
          status: report.status,
          findingsCount: report.findings.length,
        },
        "Review pipeline execution completed",
      );

      // 5. Update check run with conclusion, summary, and annotations
      await publishCheckRunResult(octokit, {
        owner,
        repo,
        checkRunId,
        report,
      });

      // 6. Post summary comment and inline review comments on the PR
      await publishPullRequestReview(octokit, {
        owner,
        repo,
        pullNumber,
        commitSha: headSha,
        report,
      });

      return { report, checkRunId };
    } catch (error) {
      logger?.error({ error }, "Error during review orchestration");
      throw error;
    }
  }
}
