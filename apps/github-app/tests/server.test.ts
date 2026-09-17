import { describe, it, expect, beforeAll, afterAll } from "vitest";
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/server.js";

describe("GitHub App — Fastify Server & Webhook Endpoints", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return health status and 18 registered rules on GET /health", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
    expect(body.registeredRules).toBe(18);
  });

  it("should return info on GET /", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.name).toBe("ArchStandards");
    expect(body.rulesCount).toBe(18);
    expect(body.docs).toBe("https://docs.archstandards.dev");
  });

  it("should respond to ping webhooks with pong", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/webhooks/github",
      headers: {
        "x-github-event": "ping",
        "x-github-delivery": "delivery-123",
      },
      payload: {
        zen: "Design for failure.",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
    expect(body.message).toContain("Pong");
  });

  it("should accept valid pull_request opened events with 202 Accepted", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/webhooks/github",
      headers: {
        "x-github-event": "pull_request",
        "x-github-delivery": "delivery-pr-1",
      },
      payload: {
        action: "opened",
        number: 42,
        repository: {
          name: "backend-service",
          owner: { login: "my-org" },
        },
        pull_request: {
          head: { sha: "abc12345" },
          base: { sha: "def67890" },
        },
      },
    });

    expect(response.statusCode).toBe(202);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("accepted");
    expect(body.pr).toBe(42);
    expect(body.repo).toBe("my-org/backend-service");
  });

  it("should return 400 Bad Request on malformed pull_request webhook", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/webhooks/github",
      headers: {
        "x-github-event": "pull_request",
        "x-github-delivery": "delivery-bad",
      },
      payload: {
        action: "opened",
        // missing repository and pull_request
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe("Bad Request");
  });

  it("should ignore unhandled events gracefully", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/webhooks/github",
      headers: {
        "x-github-event": "star",
        "x-github-delivery": "delivery-star",
      },
      payload: {
        action: "created",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ignored");
  });

  it("should verify webhook signature when secret is configured", async () => {
    const secret = "test-secret-env";
    const oldSecret = process.env["GITHUB_WEBHOOK_SECRET"];
    process.env["GITHUB_WEBHOOK_SECRET"] = secret;

    try {
      const payload = {
        action: "opened",
        number: 1,
        repository: { name: "repo", owner: { login: "org" } },
        pull_request: { head: { sha: "h1" }, base: { sha: "b1" } },
      };
      const rawPayload = JSON.stringify(payload);
      const validSig = `sha256=${crypto.createHmac("sha256", secret).update(rawPayload).digest("hex")}`;

      // 1. With valid signature: 202
      const resValid = await app.inject({
        method: "POST",
        url: "/api/webhooks/github",
        headers: {
          "x-github-event": "pull_request",
          "x-hub-signature-256": validSig,
        },
        payload,
      });
      expect(resValid.statusCode).toBe(202);

      // 2. With invalid signature: 401
      const resInvalid = await app.inject({
        method: "POST",
        url: "/api/webhooks/github",
        headers: {
          "x-github-event": "pull_request",
          "x-hub-signature-256": "sha256=invalidhex0000",
        },
        payload,
      });
      expect(resInvalid.statusCode).toBe(401);
    } finally {
      if (oldSecret !== undefined) {
        process.env["GITHUB_WEBHOOK_SECRET"] = oldSecret;
      } else {
        delete process.env["GITHUB_WEBHOOK_SECRET"];
      }
    }
  });
});
