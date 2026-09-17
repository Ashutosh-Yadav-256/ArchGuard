import type { Octokit } from "octokit";
import type { ReviewReport } from "@archstandards/core";
import {
  formatCheckRunConclusion,
  formatSummaryComment,
  formatInlineComment,
} from "./comment-formatter.js";

export interface CreateCheckRunParams {
  owner: string;
  repo: string;
  headSha: string;
  name?: string;
}

export interface UpdateCheckRunParams {
  owner: string;
  repo: string;
  checkRunId: number;
  report: ReviewReport;
}

export interface PublishReviewCommentsParams {
  owner: string;
  repo: string;
  pullNumber: number;
  commitSha: string;
  report: ReviewReport;
  postInlineComments?: boolean;
}

/**
 * Initialize a check run in "in_progress" state.
 */
export async function createCheckRun(
  octokit: Octokit,
  params: CreateCheckRunParams,
): Promise<number> {
  const { owner, repo, headSha, name = "ArchStandards Review" } = params;

  const response = await octokit.rest.checks.create({
    owner,
    repo,
    name,
    head_sha: headSha,
    status: "in_progress",
    started_at: new Date().toISOString(),
  });

  return response.data.id;
}

/**
 * Publish final review outcome, summary, and annotations to the check run.
 */
export async function publishCheckRunResult(
  octokit: Octokit,
  params: UpdateCheckRunParams,
): Promise<void> {
  const { owner, repo, checkRunId, report } = params;
  const outcome = formatCheckRunConclusion(report);

  // GitHub Check Runs API limits annotations to 50 per call
  const annotations = report.findings.slice(0, 50).map((f) => ({
    path: f.file,
    start_line: f.line > 0 ? f.line : 1,
    end_line: f.line > 0 ? f.line : 1,
    annotation_level:
      f.severity === "error"
        ? ("failure" as const)
        : f.severity === "warning"
          ? ("warning" as const)
          : ("notice" as const),
    title: `${f.ruleId}: ${f.ruleName ?? f.ruleId}`,
    message: f.message,
    raw_details: `${f.rationale}${f.suggestion ? `\n\nSuggestion: ${f.suggestion}` : ""}\n\nDocs: ${f.documentationUrl}`,
  }));

  await octokit.rest.checks.update({
    owner,
    repo,
    check_run_id: checkRunId,
    status: "completed",
    completed_at: new Date().toISOString(),
    conclusion: outcome.conclusion,
    output: {
      title: outcome.title,
      summary: outcome.summary,
      text: formatSummaryComment(report),
      annotations: annotations.length > 0 ? annotations : undefined,
    },
  });
}

/**
 * Post PR summary comment and optional inline review comments.
 */
export async function publishPullRequestReview(
  octokit: Octokit,
  params: PublishReviewCommentsParams,
): Promise<void> {
  const { owner, repo, pullNumber, commitSha, report, postInlineComments = true } = params;

  // Post summary issue comment
  const summaryBody = formatSummaryComment(report);
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body: summaryBody,
  });

  // If there are findings and inline comments are requested, submit PR review comments
  if (postInlineComments && report.findings.length > 0) {
    const comments = report.findings
      .filter((f) => f.line > 0)
      .slice(0, 25) // Cap inline comments to keep PR clean
      .map((f) => ({
        path: f.file,
        line: f.line,
        body: formatInlineComment(f),
      }));

    if (comments.length > 0) {
      try {
        await octokit.rest.pulls.createReview({
          owner,
          repo,
          pull_number: pullNumber,
          commit_id: commitSha,
          event: report.status === "fail" ? "REQUEST_CHANGES" : "COMMENT",
          comments,
        });
      } catch {
        // If inline review submission fails (e.g. line outside diff), graceful fallback
      }
    }
  }
}
