import crypto from "node:crypto";

export interface PullRequestWebhookData {
  action: string;
  owner: string;
  repo: string;
  pullNumber: number;
  headSha: string;
  baseSha: string;
  installationId?: number;
}

/**
 * Verify GitHub webhook HMAC SHA-256 signature.
 * Prevents unauthorized requests and timing attacks.
 */
export function verifyWebhookSignature(
  secret: string,
  rawPayload: string | Buffer,
  signatureHeader?: string,
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") {
    return false;
  }

  const expectedSignature = parts[1]!;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawPayload);
  const calculatedSignature = hmac.digest("hex");

  try {
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const calculatedBuf = Buffer.from(calculatedSignature, "hex");

    if (expectedBuf.length !== calculatedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, calculatedBuf);
  } catch {
    return false;
  }
}

/**
 * Parse and validate pull request webhook payload.
 */
export function parsePullRequestPayload(payload: unknown): PullRequestWebhookData | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const p = payload as Record<string, any>;

  const action = typeof p["action"] === "string" ? p["action"] : null;
  const pullNumber = typeof p["number"] === "number" ? p["number"] : null;
  const repository = p["repository"];
  const pullRequest = p["pull_request"];

  if (!action || !pullNumber || !repository || !pullRequest) {
    return null;
  }

  const owner = repository["owner"]?.["login"] ?? repository["full_name"]?.split("/")[0];
  const repo = repository["name"] ?? repository["full_name"]?.split("/")[1];
  const headSha = pullRequest["head"]?.["sha"];
  const baseSha = pullRequest["base"]?.["sha"];
  const installationId = p["installation"]?.["id"];

  if (!owner || !repo || !headSha || !baseSha) {
    return null;
  }

  return {
    action,
    owner,
    repo,
    pullNumber,
    headSha,
    baseSha,
    installationId,
  };
}
