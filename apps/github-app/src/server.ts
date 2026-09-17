import Fastify, { type FastifyInstance } from "fastify";
import { config } from "dotenv";
import { RuleRegistry, ReviewPipeline } from "@archstandards/core";
import { allRules } from "@archstandards/rules";
import { GitHubClientFactory } from "./github/client.js";
import { ReviewOrchestrator } from "./reviews/orchestrator.js";
import { createPullRequestHandler } from "./webhooks/pull-request.js";
import { verifyGitHubSignatureHook } from "./middleware/signature.js";

config(); // Load environment variables from .env

export interface BuildAppOptions {
  logger?: boolean;
  token?: string;
  appId?: string;
  privateKey?: string;
}

/**
 * App factory function for Fastify server.
 * Enables in-memory integration testing via fastify.inject().
 */
export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? {
      level: process.env["LOG_LEVEL"] ?? "info",
      transport:
        process.env["NODE_ENV"] === "development"
          ? { target: "pino-pretty" }
          : undefined,
    },
  });

  // 1. Initialize Rule Registry and register all 18 rules
  const registry = new RuleRegistry();
  for (const rule of allRules) {
    registry.register(rule);
  }

  // 2. Initialize Pipeline & Orchestrator
  const pipeline = new ReviewPipeline(registry);
  const orchestrator = new ReviewOrchestrator(pipeline);

  // 3. Initialize GitHub Client Factory
  const clientFactory = new GitHubClientFactory({
    token: options.token,
    appId: options.appId,
    privateKey: options.privateKey,
  });

  // ─── Health Check ──────────────────────────────────────────────
  app.get("/health", async () => {
    return {
      status: "ok",
      version: "0.1.0",
      registeredRules: registry.getAll().length,
      timestamp: new Date().toISOString(),
    };
  });

  // ─── Info Route ────────────────────────────────────────────────
  app.get("/", async () => {
    return {
      name: "ArchStandards",
      description:
        "Policy-as-code architecture governance platform that reviews pull requests",
      version: "0.1.0",
      docs: "https://docs.archstandards.dev",
      rulesCount: registry.getAll().length,
      health: "/health",
      webhook: "/api/webhooks/github",
    };
  });

  // ─── Webhook Route ─────────────────────────────────────────────
  const prHandler = createPullRequestHandler(clientFactory, orchestrator);

  app.post(
    "/api/webhooks/github",
    {
      preValidation: [verifyGitHubSignatureHook],
    },
    async (request, reply) => {
      const event = request.headers["x-github-event"] as string;
      const delivery = request.headers["x-github-delivery"] as string;

      request.log.info({ event, delivery }, "Incoming webhook received");

      if (event === "pull_request") {
        return prHandler(request, reply);
      }

      if (event === "ping") {
        return reply.code(200).send({
          status: "ok",
          message: "Pong! ArchStandards webhook configured correctly.",
        });
      }

      return reply.code(200).send({
        status: "ignored",
        event,
        message: `Event ${event} is not handled by ArchStandards`,
      });
    },
  );

  return app;
}

// ─── Start Server (if executed directly) ───────────────────────
const PORT = parseInt(process.env["PORT"] ?? "3000", 10);
const HOST = process.env["HOST"] ?? "0.0.0.0";

export async function start(): Promise<void> {
  const app = buildApp();
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`ArchStandards GitHub App listening on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Only start when this file is the main entry point
if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  start();
}

export default buildApp;
