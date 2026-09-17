# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in ArchStandards, please report it responsibly.

**Do NOT open a public issue.**

Instead, email: **security@archstandards.dev**

Or use [GitHub's private vulnerability reporting](https://github.com/Ashutosh-Yadav-256/archstandards/security/advisories/new).

We will acknowledge your report within 48 hours and provide a detailed response within 5 business days.

## Security Architecture

### Authentication

- **Webhook Verification:** Every incoming webhook is verified using HMAC SHA-256 signature validation against the webhook secret
- **GitHub App Authentication:** JWT-based authentication with short-lived installation access tokens (auto-rotated)
- **No Personal Access Tokens:** The app uses GitHub App credentials, never PATs

### Data Handling

- **Source Code:** Analyzed in-memory only, never written to disk or persisted
- **Secrets:** All secrets stored as environment variables, never in code
- **Logs:** Sensitive fields (tokens, keys, webhook secrets) are redacted using Pino's redaction paths

### Permissions

ArchStandards requests the **minimum permissions** necessary:

| Permission | Level | Purpose |
|---|---|---|
| `contents` | `read` | Read repository files for analysis |
| `pull_requests` | `write` | Post review comments |
| `checks` | `write` | Create check run status |
| `metadata` | `read` | Repository metadata |

### Dependencies

- Dependencies are automatically scanned by Dependabot
- `npm audit` runs in CI on every push
- Only well-maintained, widely-used packages are included

## Supported Versions

| Version | Supported |
|---|---|
| 0.x.x | ✅ Current development |

## Security Best Practices for Users

1. **Review GitHub App permissions** before installing
2. **Use repository-level installation** rather than organization-wide if possible
3. **Rotate webhook secrets** periodically
4. **Monitor the app's activity** in your repository's audit log
