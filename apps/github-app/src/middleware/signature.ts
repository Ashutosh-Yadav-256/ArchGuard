import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyWebhookSignature } from "@archstandards/github-adapter";

/**
 * Fastify preValidation hook to verify GitHub webhook HMAC SHA-256 signature.
 */
export async function verifyGitHubSignatureHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const secret = process.env["GITHUB_WEBHOOK_SECRET"];
  if (!secret) {
    request.log.warn("GITHUB_WEBHOOK_SECRET is not configured; skipping signature verification");
    return;
  }

  const signature = request.headers["x-hub-signature-256"] as string | undefined;
  const rawBody = (request as any).rawBody ?? JSON.stringify(request.body ?? {});

  const isValid = verifyWebhookSignature(secret, rawBody, signature);
  if (!isValid) {
    request.log.warn("Invalid webhook signature detected");
    await reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid x-hub-signature-256 header",
    });
  }
}
