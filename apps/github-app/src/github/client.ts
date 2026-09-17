import { App, Octokit } from "octokit";

export interface GitHubClientConfig {
  appId?: string;
  privateKey?: string;
  token?: string;
}

export class GitHubClientFactory {
  private readonly app?: App;
  private readonly fallbackToken?: string;

  constructor(config: GitHubClientConfig) {
    this.fallbackToken = config.token ?? process.env["GITHUB_TOKEN"];

    const appId = config.appId ?? process.env["GITHUB_APP_ID"];
    const rawKey = config.privateKey ?? process.env["GITHUB_PRIVATE_KEY"];

    if (appId && rawKey) {
      // Decode base64 private key if supplied encoded
      const privateKey = rawKey.includes("BEGIN")
        ? rawKey
        : Buffer.from(rawKey, "base64").toString("utf-8");

      this.app = new App({
        appId,
        privateKey,
      });
    }
  }

  /**
   * Get an authenticated Octokit instance for an installation.
   */
  async getInstallationClient(installationId?: number): Promise<Octokit> {
    if (this.app && installationId) {
      return (await this.app.getInstallationOctokit(installationId)) as unknown as Octokit;
    }

    if (this.fallbackToken) {
      return new Octokit({ auth: this.fallbackToken });
    }

    // Fallback unauthenticated (or test client)
    return new Octokit();
  }
}
