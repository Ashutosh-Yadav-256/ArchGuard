import type { FastifyRequest, FastifyReply } from "fastify";
import { parsePullRequestPayload } from "@archstandards/github-adapter";
import type { GitHubClientFactory } from "../github/client.js";
import type { ReviewOrchestrator } from "../reviews/orchestrator.js";

const RELEVANT_ACTIONS = ["opened", "synchronize", "reopened"];

export function createPullRequestHandler(
  clientFactory: GitHubClientFactory,
  orchestrator: ReviewOrchestrator,
) {
  return async function handlePullRequestWebhook(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const prData = parsePullRequestPayload(request.body);

    if (!prData) {
      await reply.code(400).send({
        error: "Bad Request",
        message: "Payload is not a valid pull_request webhook",
      });
      return;
    }

    if (!RELEVANT_ACTIONS.includes(prData.action)) {
      await reply.code(200).send({
        status: "ignored",
        action: prData.action,
        message: `Action ${prData.action} does not trigger review`,
      });
      return;
    }

    request.log.info(
      {
        action: prData.action,
        pr: prData.pullNumber,
        repo: `${prData.owner}/${prData.repo}`,
      },
      "Accepted pull request event for review",
    );

    // Return 202 Accepted immediately to adhere to webhook SLA (<10 seconds)
    await reply.code(202).send({
      status: "accepted",
      message: "Review job initiated",
      pr: prData.pullNumber,
      repo: `${prData.owner}/${prData.repo}`,
    });

    // Execute review asynchronously
    setImmediate(async () => {
      try {
        const octokit = await clientFactory.getInstallationClient(prData.installationId);
        await orchestrator.reviewPullRequest(octokit, prData, request.log);
        request.log.info(
          { pr: prData.pullNumber, repo: `${prData.owner}/${prData.repo}` },
          "Review job completed successfully",
        );
      } catch (err) {
        request.log.error(
          { err, pr: prData.pullNumber, repo: `${prData.owner}/${prData.repo}` },
          "Review job failed",
        );
      }
    });
  };
}
